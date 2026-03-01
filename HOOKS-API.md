# OpenCode Plugin Hooks API Reference

来源：https://github.com/anomalyco/opencode/blob/dev/packages/plugin/src/index.ts

## Plugin 类型定义

```typescript
export type PluginInput = {
  client: ReturnType<typeof createOpencodeClient>
  project: Project
  directory: string
  worktree: string
  serverUrl: URL
  $: BunShell
}

export type Plugin = (input: PluginInput) => Promise<Hooks>
```

## Hooks 完整列表

### 基础钩子

| Hook | 类型 | 说明 |
|------|------|------|
| `event` | `(input: { event: Event }) => Promise<void>` | 监听所有事件 |
| `config` | `(input: Config) => Promise<void>` | 修改配置 |
| `tool` | `{ [key: string]: ToolDefinition }` | 注册自定义工具 |
| `auth` | `AuthHook` | 认证提供者 |

### Chat 相关钩子

| Hook | 输入 | 输出 | 说明 |
|------|------|------|------|
| `chat.message` | `{ sessionID, agent?, model?, messageID?, variant? }` | `{ message: UserMessage, parts: Part[] }` | 修改接收到的消息 |
| `chat.params` | `{ sessionID, agent, model, provider, message }` | `{ temperature, topP, topK, options }` | 修改 LLM 参数 |
| `chat.headers` | `{ sessionID, agent, model, provider, message }` | `{ headers: Record<string, string> }` | 修改请求头 |

### 权限与环境钩子

| Hook | 输入 | 输出 | 说明 |
|------|------|------|------|
| `permission.ask` | `Permission` | `{ status: "ask" \| "deny" \| "allow" }` | 处理权限请求 |
| `shell.env` | `{ cwd, sessionID?, callID? }` | `{ env: Record<string, string> }` | 修改 Shell 环境变量 |

### 命令与工具钩子

| Hook | 输入 | 输出 | 说明 |
|------|------|------|------|
| `command.execute.before` | `{ command, sessionID, arguments }` | `{ parts: Part[] }` | 命令执行前钩子 |
| `tool.execute.before` | `{ tool, sessionID, callID }` | `{ args: any }` | 工具执行前钩子 |
| `tool.execute.after` | `{ tool, sessionID, callID, args }` | `{ title, output, metadata }` | 工具执行后钩子 |
| `tool.definition` | `{ toolID: string }` | `{ description: string, parameters: any }` | 修改工具定义 |

### 实验性钩子

| Hook | 输入 | 输出 | 说明 |
|------|------|------|------|
| `experimental.chat.messages.transform` | `{}` | `{ messages: { info: Message, parts: Part[] }[] }` | 转换消息列表 |
| `experimental.chat.system.transform` | `{ sessionID?, model }` | `{ system: string[] }` | 转换 system prompt |
| `experimental.session.compacting` | `{ sessionID: string }` | `{ context: string[], prompt?: string }` | Session 压缩前钩子 |
| `experimental.text.complete` | `{ sessionID, messageID, partID }` | `{ text: string }` | 文本补全钩子 |

## Events 完整列表

通过 `event` 钩子可订阅以下事件：

### Command Events
- `command.executed`

### File Events
- `file.edited`
- `file.watcher.updated`

### Installation Events
- `installation.updated`

### LSP Events
- `lsp.client.diagnostics`
- `lsp.updated`

### Message Events
- `message.part.removed`
- `message.part.updated`
- `message.removed`
- `message.updated`

### Permission Events
- `permission.asked`
- `permission.replied`

### Server Events
- `server.connected`

### Session Events
- `session.created`
- `session.compacted`
- `session.deleted`
- `session.diff`
- `session.error`
- `session.idle`
- `session.status`
- `session.updated`

### Todo Events
- `todo.updated`

### Shell Events
- `shell.env`

### Tool Events
- `tool.execute.after`
- `tool.execute.before`

### TUI Events
- `tui.prompt.append`
- `tui.command.execute`
- `tui.toast.show`

## 示例代码

```typescript
import type { Plugin } from "@opencode-ai/plugin"

export const MyPlugin: Plugin = async ({ client, project, directory, worktree, $ }) => {
  return {
    // 监听事件
    event: async ({ event }) => {
      if (event.type === "session.idle") {
        console.log("Session completed")
      }
    },

    // 工具执行前
    "tool.execute.before": async (input, output) => {
      if (input.tool === "bash") {
        // 修改参数
        output.args.command = escape(output.args.command)
      }
    },

    // 工具执行后
    "tool.execute.after": async (input, output) => {
      // 修改输出
      output.title = "Custom Title"
    },

    // 注入环境变量
    "shell.env": async (input, output) => {
      output.env.MY_API_KEY = "secret"
    },

    // 注册自定义工具
    tool: {
      mytool: tool({
        description: "This is a custom tool",
        args: {
          foo: tool.schema.string(),
        },
        async execute(args, context) {
          return `Hello ${args.foo}`
        },
      }),
    },
  }
}
```

## 相关文档

- 官方文档：https://opencode.ai/docs/plugins
- 源码：https://github.com/anomalyco/opencode/blob/dev/packages/plugin/src/index.ts
- SDK 文档：https://opencode.ai/docs/sdk
