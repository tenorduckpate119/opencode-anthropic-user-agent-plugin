import { generatePKCE } from "@openauthjs/openauth/pkce";

const CLIENT_ID = "9d1c250a-e61b-44d9-88ed-5944d1962f5e";
const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15";

function getUserAgent() {
  return process.env.OPENCODE_ANTHROPIC_USER_AGENT || DEFAULT_USER_AGENT;
}

async function authorize(mode) {
  const pkce = await generatePKCE();
  const url = new URL(
    `https://${mode === "console" ? "console.anthropic.com" : "claude.ai"}/oauth/authorize`,
    import.meta.url,
  );
  url.searchParams.set("code", "true");
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("response_type", "code");
  url.searchParams.set(
    "redirect_uri",
    "https://console.anthropic.com/oauth/code/callback",
  );
  url.searchParams.set(
    "scope",
    "org:create_api_key user:profile user:inference",
  );
  url.searchParams.set("code_challenge", pkce.challenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("state", pkce.verifier);
  return {
    url: url.toString(),
    verifier: pkce.verifier,
  };
}

async function exchange(code, verifier) {
  const splits = code.split("#");
  const result = await fetch("https://console.anthropic.com/v1/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": getUserAgent(),
    },
    body: JSON.stringify({
      code: splits[0],
      state: splits[1],
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      redirect_uri: "https://console.anthropic.com/oauth/code/callback",
      code_verifier: verifier,
    }),
  });

  if (!result.ok) {
    let body = "";
    let headers = "";
    try {
      body = await result.text();
    } catch {}
    try {
      headers = JSON.stringify(Object.fromEntries(result.headers.entries()));
    } catch {}
    console.error(
      `[opencode-anthropic-user-agent-plugin] OAuth exchange failed: status=${result.status} statusText=${result.statusText} headers=${headers} body=${body}`,
    );
    return { type: "failed" };
  }

  const json = await result.json();
  return {
    type: "success",
    refresh: json.refresh_token,
    access: json.access_token,
    expires: Date.now() + json.expires_in * 1000,
  };
}

function applyRequestHeaders(input, init) {
  const headers = new Headers();

  if (input instanceof Request) {
    input.headers.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  if (init?.headers instanceof Headers) {
    init.headers.forEach((value, key) => {
      headers.set(key, value);
    });
  } else if (Array.isArray(init?.headers)) {
    for (const [key, value] of init.headers) {
      if (typeof value !== "undefined") headers.set(key, String(value));
    }
  } else if (init?.headers) {
    for (const [key, value] of Object.entries(init.headers)) {
      if (typeof value !== "undefined") headers.set(key, String(value));
    }
  }

  return headers;
}

function rewritePayload(body) {
  const TOOL_PREFIX = "mcp_";
  if (!body || typeof body !== "string") return body;

  try {
    const parsed = JSON.parse(body);

    if (parsed.system && Array.isArray(parsed.system)) {
      parsed.system = parsed.system.map((item) => {
        if (item.type === "text" && item.text) {
          return {
            ...item,
            text: item.text
              .replace(/OpenCode/g, "Claude Code")
              .replace(/opencode/gi, "Claude"),
          };
        }
        return item;
      });
    }

    if (parsed.tools && Array.isArray(parsed.tools)) {
      parsed.tools = parsed.tools.map((tool) => ({
        ...tool,
        name: tool.name ? `${TOOL_PREFIX}${tool.name}` : tool.name,
      }));
    }

    if (parsed.messages && Array.isArray(parsed.messages)) {
      parsed.messages = parsed.messages.map((msg) => {
        if (msg.content && Array.isArray(msg.content)) {
          msg.content = msg.content.map((block) => {
            if (block.type === "tool_use" && block.name) {
              return {
                ...block,
                name: `${TOOL_PREFIX}${block.name}`,
              };
            }
            return block;
          });
        }
        return msg;
      });
    }

    return JSON.stringify(parsed);
  } catch {
    return body;
  }
}

function rewriteStreamingResponse(response) {
  if (!response.body) return response;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }

      let text = decoder.decode(value, { stream: true });
      text = text.replace(/"name"\s*:\s*"mcp_([^"]+)"/g, '"name": "$1"');
      controller.enqueue(encoder.encode(text));
    },
  });

  return new Response(stream, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

/**
 * Anthropic auth plugin with configurable User-Agent.
 *
 * Configure the user-agent with:
 *   OPENCODE_ANTHROPIC_USER_AGENT='...'
 */
export const AnthropicUserAgentPlugin = async ({ client }) => {
  return {
    "experimental.chat.system.transform": (input, output) => {
      const prefix =
        "You are Claude Code, Anthropic's official CLI for Claude.";
      if (input.model?.providerID === "anthropic") {
        output.system.unshift(prefix);
        if (output.system[1]) {
          output.system[1] = prefix + "\n\n" + output.system[1];
        }
      }
    },
    auth: {
      provider: "anthropic",
      async loader(getAuth, provider) {
        const auth = await getAuth();
        if (auth.type !== "oauth") return {};

        for (const model of Object.values(provider.models)) {
          model.cost = {
            input: 0,
            output: 0,
            cache: {
              read: 0,
              write: 0,
            },
          };
        }

        return {
          apiKey: "",
          async fetch(input, init) {
            const auth = await getAuth();
            if (auth.type !== "oauth") return fetch(input, init);

            if (!auth.access || auth.expires < Date.now()) {
              const response = await fetch(
                "https://console.anthropic.com/v1/oauth/token",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "User-Agent": getUserAgent(),
                  },
                  body: JSON.stringify({
                    grant_type: "refresh_token",
                    refresh_token: auth.refresh,
                    client_id: CLIENT_ID,
                  }),
                },
              );

              if (!response.ok) {
                let body = "";
                try {
                  body = await response.text();
                } catch {}
                throw new Error(
                  `Token refresh failed: ${response.status}${body ? ` body=${body}` : ""}`,
                );
              }

              const json = await response.json();
              await client.auth.set({
                path: { id: "anthropic" },
                body: {
                  type: "oauth",
                  refresh: json.refresh_token,
                  access: json.access_token,
                  expires: Date.now() + json.expires_in * 1000,
                },
              });
              auth.access = json.access_token;
            }

            const requestHeaders = applyRequestHeaders(input, init);
            const incomingBeta = requestHeaders.get("anthropic-beta") || "";
            const incomingBetasList = incomingBeta
              .split(",")
              .map((b) => b.trim())
              .filter(Boolean);
            const requiredBetas = [
              "oauth-2025-04-20",
              "interleaved-thinking-2025-05-14",
            ];
            const mergedBetas = [
              ...new Set([...requiredBetas, ...incomingBetasList]),
            ].join(",");

            requestHeaders.set("authorization", `Bearer ${auth.access}`);
            requestHeaders.set("anthropic-beta", mergedBetas);
            requestHeaders.set("user-agent", getUserAgent());
            requestHeaders.delete("x-api-key");

            let requestInput = input;
            let requestUrl = null;
            try {
              if (typeof input === "string" || input instanceof URL) {
                requestUrl = new URL(input.toString());
              } else if (input instanceof Request) {
                requestUrl = new URL(input.url);
              }
            } catch {
              requestUrl = null;
            }

            if (
              requestUrl &&
              requestUrl.pathname === "/v1/messages" &&
              !requestUrl.searchParams.has("beta")
            ) {
              requestUrl.searchParams.set("beta", "true");
              requestInput =
                input instanceof Request
                  ? new Request(requestUrl.toString(), input)
                  : requestUrl;
            }

            const response = await fetch(requestInput, {
              ...(init ?? {}),
              body: rewritePayload(init?.body),
              headers: requestHeaders,
            });

            return rewriteStreamingResponse(response);
          },
        };
      },
      methods: [
        {
          label: "Claude Pro/Max",
          type: "oauth",
          authorize: async () => {
            const { url, verifier } = await authorize("max");
            return {
              url,
              instructions: "Paste the authorization code here: ",
              method: "code",
              callback: async (code) => exchange(code, verifier),
            };
          },
        },
        {
          label: "Create an API Key",
          type: "oauth",
          authorize: async () => {
            const { url, verifier } = await authorize("console");
            return {
              url,
              instructions: "Paste the authorization code here: ",
              method: "code",
              callback: async (code) => {
                const credentials = await exchange(code, verifier);
                if (credentials.type === "failed") return credentials;

                const result = await fetch(
                  "https://api.anthropic.com/api/oauth/claude_cli/create_api_key",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "User-Agent": getUserAgent(),
                      authorization: `Bearer ${credentials.access}`,
                    },
                  },
                ).then((r) => r.json());

                return { type: "success", key: result.raw_key };
              },
            };
          },
        },
        {
          provider: "anthropic",
          label: "Manually enter API Key",
          type: "api",
        },
      ],
    },
    "chat.headers": async (input, output) => {
      if (
        input.provider.info.id === "anthropic-work-api" ||
        input.provider.info.id === "anthropic"
      ) {
        output.headers["user-agent"] = getUserAgent();
      }
    },
  };
};

export default AnthropicUserAgentPlugin;
