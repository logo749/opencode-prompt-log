# AGENTS.md - Opencode Log Plugin

## Project Overview
This is an Opencode plugin project that allows extending Opencode functionality. The plugin system uses JavaScript/TypeScript modules that export async functions receiving a client context.

## Build & Development Commands

### Package Management
- **Install dependencies**: `bun install` (recommended) or `npm install`
- **Add dependency**: `bun add <package>` or `npm install <package>`

### Type Checking
- **Type check (plugin package)**: `bun run typecheck` or `tsgo --noEmit`
- **Type check (SDK)**: `bun run typecheck` in @opencode-ai/sdk

### Building
- **Build plugin**: `bun run build` or `tsc`
- **Build SDK**: `bun run build` in @opencode-ai/sdk (uses `bun ./script/build.ts`)

### Testing
- **No test framework configured** - this is a minimal plugin project
- To add tests: consider `bun test`, `vitest`, or `jest`

### Running a Single Test (when tests are added)
- Bun: `bun test path/to/test.test.ts`
- Vitest: `npx vitest run path/to/test.test.ts`
- Jest: `npx jest path/to/test.test.ts`

## Code Style Guidelines

### Language & Modules
- **Module system**: ES Modules (`"type": "module"` in package.json)
- **Syntax**: Use `export const` for named exports
- **Imports**: Use relative paths for local imports, bare specifiers for packages

### TypeScript
- **Target**: Node 22 (`@tsconfig/node22`)
- **Strict typing**: Enabled via TypeScript config
- **Type definitions**: Generated via `tsc` build step
- **Zod**: Used for runtime validation (v4 recommended)

### Naming Conventions
- **Files**: kebab-case (e.g., `log-plugin.js`, `tool-definition.ts`)
- **Variables/Functions**: camelCase (e.g., `myFunction`, `clientInput`)
- **Types/Interfaces**: PascalCase (e.g., `PluginInput`, `ToolDefinition`)
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Plugin exports**: PascalCase (e.g., `MyPlugin`, `LogPlugin`)

### Formatting
- **Quotes**: Double quotes for strings
- **Trailing commas**: Use trailing commas in objects/arrays
- **Semicolons**: Use semicolons consistently
- **Indentation**: 2 spaces
- **Line length**: ~100 characters (soft limit)

### Error Handling
- **Async functions**: Always return promises, use try/catch for expected errors
- **Plugin pattern**: Return empty object `{}` on success, throw on failure
- **Validation**: Use Zod schemas for input validation
- **Logging**: Use `client.app.log()` for plugin logging

### Plugin Structure
```javascript
export const MyPlugin = async ({ client }) => {
  // Plugin initialization code
  await client.app.log({
    body: {
      service: "my-plugin",
      level: "info",
      message: "Plugin initialized",
    },
  })
  return {} // Return hooks object or empty object
}
```

### Available Hooks (return in plugin's returned object)
- `event` - Listen to events
- `tool` - Register custom tools
- `auth` - Authentication providers
- `chat.message` - Modify incoming messages
- `chat.params` - Modify LLM parameters
- `chat.headers` - Modify request headers
- `permission.ask` - Handle permission requests
- `command.execute.before` - Pre-command hook
- `tool.execute.before/after` - Pre/post tool execution
- `shell.env` - Modify shell environment

## Project Structure
```
.opencode/
├── plugins/           # Plugin source files
│   └── log-plugin.js
├── node_modules/      # Dependencies
├── package.json       # Project config
├── bun.lock           # Bun lockfile
└── .gitignore
```

## Dependencies
- `@opencode-ai/plugin`: Core plugin API
- `@opencode-ai/sdk`: Opencode SDK (transitive)
- `zod`: Runtime validation

## Git & Version Control
- No git repo initialized in this project
- Follow conventional commits if adding git
- Keep plugin files in `.opencode/plugins/`

## Notes for Agents
1. This is a minimal plugin project - extend carefully
2. Always check existing plugin code before adding new features
3. Use `client.app.log()` for debugging instead of console.log
4. Plugin functions must be async and return an object (hooks or empty)
5. Prefer TypeScript for new plugins (current example uses JS)
