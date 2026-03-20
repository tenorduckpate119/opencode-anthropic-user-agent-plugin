# opencode-anthropic-user-agent-plugin

Portable OpenCode plugin that overrides Anthropic `User-Agent` handling for:

- Claude Pro/Max OAuth login
- OAuth token refresh
- Anthropic prompt/message requests
- Anthropic API key creation
- Anthropic-compatible custom providers via `chat.headers`

The plugin is meant for users who need to change the Anthropic-facing `User-Agent`
without patching OpenCode's cached plugin files by hand.

## Install

### From npm

Add the package to your OpenCode config:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-anthropic-user-agent-plugin"]
}
```

### As a local plugin

If you are developing locally, symlink or copy `index.js` into:

- `~/.config/opencode/plugins/`
- or `.opencode/plugins/`

## Configure

Set the outgoing user-agent string with an environment variable:

```sh
export OPENCODE_ANTHROPIC_USER_AGENT='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15'
```

If unset, the plugin uses the Safari string above by default.

## Notes

- This plugin reimplements the Anthropic OAuth auth hook so it can control the
  headers used during login and refresh.
- It also applies the same `User-Agent` to Anthropic message traffic.
- If OpenCode changes its internal Anthropic auth flow in a future release,
  this plugin may need to be updated to stay in sync.
