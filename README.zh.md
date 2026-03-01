# Opencode Log Plugin

一个用于 Opencode 的对话日志插件，自动记录所有会话交互到本地文件。

## 功能特性

- 📝 **自动日志记录** - 自动记录所有对话交互到 `.opencode/logs/` 目录
- 🔍 **会话隔离** - 每个会话生成独立的日志文件
- 📊 **详细记录** - 记录输入、输出、事件和时间戳
- 🛡️ **错误处理** - 完善的错误处理和日志回退机制

## 安装

将插件文件放置在项目的 `.opencode/plugins/` 目录下：

```bash
.opencode/
└── plugins/
    └── log-plugin.js
```

## 使用方法

插件会自动加载并记录所有会话。日志文件存储在：

```
<project-root>/.opencode/logs/conversation-<sessionID>.log
```

### 日志格式

每条日志记录包含以下信息：

```json
{
  "timestamp": "2026-03-01T12:00:00.000Z",
  "type": "chat_message",
  "input": { /* 输入参数 */ },
  "output": { /* 输出结果 */ }
}
```

### 日志类型

| 类型 | 说明 |
|------|------|
| `session_started` | 会话开始 |
| `chat_message` | 聊天消息 |
| `chat_messages_transform` | 消息转换 |
| `chat_system_transform` | 系统提示转换 |
| `event` | 事件记录 |

## 钩子实现

插件实现了以下钩子：

| 钩子 | 说明 |
|------|------|
| `chat.message` | 记录聊天消息 |
| `experimental.chat.messages.transform` | 记录消息转换 |
| `experimental.chat.system.transform` | 记录系统提示转换 |
| `event` | 记录所有事件 |

## 开发

### 依赖

- Node.js 22+
- @opencode-ai/plugin

### 代码结构

```
.opencode/plugins/
└── log-plugin.js
```

主要功能模块：

- `getLogDir()` - 获取日志目录
- `getLogFile()` - 获取日志文件路径
- `writeLog()` - 写入日志
- `LogPlugin` - 主插件函数

## 配置

无需额外配置，插件自动工作。

## 注意事项

- 日志文件会持续增长，定期清理旧日志
- 日志包含完整的对话内容，注意隐私保护
- 插件使用同步文件写入，大量日志可能影响性能

## 许可证

MIT

---

📖 [English Documentation](README.md)
