# Miro MCP Server Setup Guide

Quick reference for connecting Miro's MCP Server to various AI coding tools.

**Miro MCP URL:** `https://mcp.miro.com/`

---

## Quick Setup by Tool

### Claude Code (Terminal)

```bash
# Add Miro MCP
claude mcp add --transport http miro https://mcp.miro.com/

# Authenticate
/mcp auth

# Use built-in prompts
/miro-mcp:code_explain_on_board
```

**Example prompt:** "Summarize the content on this board: [board-URL]"

---

### Cursor

1. Go to: Settings → Cursor Settings → MCP → Add a Custom MCP Server
2. Add this JSON:

```json
{
  "mcpServers": {
    "miro-mcp": {
      "url": "https://mcp.miro.com/",
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

3. Click **Authenticate** → Complete Miro OAuth flow
4. Done! Tools and prompts will be available.

---

### VSCode + GitHub Copilot

1. Find Miro's MCP Server on [GitHub's MCP Registry](https://github.com/mcp/miroapp/mcp-server)
2. Click "Install MCP server"
3. Complete Miro OAuth flow
4. Use `/` to see Miro prompts or click the tools icon

**Example prompt:** "create me a sequence diagram of the data flow for [app] and add it to this board [board-URL]"

---

### Windsurf

1. Go to: Settings → WindSurf Settings → Cascade → Manage MCPs → Configure
2. Add this JSON:

```json
{
  "mcpServers": {
    "miro-mcp": {
      "url": "https://mcp.miro.com/",
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

3. Complete Miro OAuth flow
4. Start prompting with board URLs

---

### Kiro IDE

1. Open Kiro settings
2. Go to Workspace settings → Search "MCP"
3. Open Workspace MCP Config (opens `mcp.json`)
4. Add:

```json
{
  "mcpServers": {
    "miro-mcp": {
      "url": "https://mcp.miro.com/",
      "oauthScopes": []
    }
  }
}
```

5. Allow Kiro app → Complete Miro OAuth flow

---

### Kiro CLI

Ensure your `~/.kiro/settings/mcp.json` looks like:

```json
{
  "mcpServers": {
    "miro-mcp": {
      "url": "https://mcp.miro.com/",
      "oauthScopes": []
    }
  }
}
```

Then complete OAuth and start prompting.

---

### Claude Web/Desktop App

1. In Claude chat, click **+** → **Add connectors**
2. Select **Web** tab → Search "Miro"
3. Click **+** on Miro card → **Connect**
4. Complete Miro OAuth flow
5. "Connected to Miro" confirmation appears

---

### Lovable

1. Log into [lovable.dev](https://lovable.dev/)
2. Profile (top right) → Settings → Integrations
3. Scroll to "Your MCP Servers" → Find Miro → **Set up**
4. **Connect** → Complete Miro OAuth flow

---

### Replit

1. Click Miro MCP install button in Replit integrations
2. Click **Test & Save**
3. Click **Authorize with OAuth**
4. Select your Miro Team

---

## Common Prompt Examples

| Task | Prompt |
|------|--------|
| Summarize board | `"Summarize the content on this board: [board-URL]"` |
| Create diagram | `"Create me a sequence diagram of [topic] and add it to this board [board-URL]"` |
| Code from board | `"Build me a landing page based on the content of this board: [board-URL]"` |
| Explain code on board | `"Explain the code on this board: [board-URL]"` |

---

## Important Notes

⚠️ **Enterprise Users:** You must first enable Miro's MCP Server for your org. See [Admin Guide](https://help.miro.com/hc/en-us/articles/31625761037202-Miro-MCP-Server-admin-guide).

⚠️ **Board Access:** The board you reference must be in the same team where you authorized Miro MCP.

⚠️ **OAuth Flow:** The Miro OAuth flow is the same across all tools—you authorize once per team.

---

## Resources

- [Miro MCP Docs](https://developers.miro.com/docs/connecting-miro-mcp-to-ai-coding-tools)
- [Claude Code MCP Docs](https://code.claude.com/docs/en/mcp)
- [Miro MCP Prompts & Tools](https://developers.miro.com/docs/miro-mcp-prompts)

---

*Last updated: 2026-02-20*
