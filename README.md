# Opencode Log Plugin

A conversation logging plugin for Opencode that automatically records all session interactions to local files.

## Features

- 📝 **Automatic Logging** - Automatically records all conversation interactions to `.opencode/logs/` directory
- 🔍 **Session Isolation** - Each session generates a separate log file
- 📊 **Detailed Records** - Logs inputs, outputs, events, and timestamps
- 🛡️ **Error Handling** - Comprehensive error handling and logging fallback mechanisms

## Installation

Place the plugin file in the project's `.opencode/plugins/` directory:

```bash
.opencode/
└── plugins/
    └── log-plugin.js
```

## Usage

The plugin automatically loads and records all sessions. Log files are stored at:

```
<project-root>/.opencode/logs/conversation-<sessionID>.log
```

### Log Format

Each log entry contains the following information:

```json
{
  "timestamp": "2026-03-01T12:00:00.000Z",
  "type": "chat_message",
  "input": { /* input parameters */ },
  "output": { /* output results */ }
}
```

### Log Types

| Type | Description |
|------|-------------|
| `session_started` | Session started |
| `chat_message` | Chat message |
| `chat_messages_transform` | Message transformation |
| `chat_system_transform` | System prompt transformation |
| `event` | Event recording |

## Implemented Hooks

The plugin implements the following hooks:

| Hook | Description |
|------|-------------|
| `chat.message` | Logs chat messages |
| `experimental.chat.messages.transform` | Logs message transformations |
| `experimental.chat.system.transform` | Logs system prompt transformations |
| `event` | Logs all events |

## Development

### Dependencies

- Node.js 22+
- @opencode-ai/plugin

### Code Structure

```
.opencode/plugins/
└── log-plugin.js
```

Main modules:

- `getLogDir()` - Get log directory
- `getLogFile()` - Get log file path
- `writeLog()` - Write log entry
- `LogPlugin` - Main plugin function

## Configuration

No additional configuration required. The plugin works automatically.

## Notes

- Log files grow continuously; clean up old logs periodically
- Logs contain complete conversation content; be mindful of privacy
- Plugin uses synchronous file writes; heavy logging may impact performance

## License

MIT

---

📖 [中文说明](README.zh.md)
