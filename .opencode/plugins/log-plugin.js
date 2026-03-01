import { appendFileSync, mkdirSync, existsSync, statSync, renameSync, readdirSync, unlinkSync } from "fs"
import { join } from "path"

const MAX_SHARD_SIZE = 10 * 1024 * 1024
const MAX_TOTAL_SIZE = 100 * 1024 * 1024
const MAX_SHARDS = 10

const getLogDir = (directory) => {
  const logDir = join(directory, ".opencode", "logs")
  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true })
  }
  return logDir
}

const getLogFile = (directory, sessionID, shard = 0) => {
  const logDir = getLogDir(directory)
  if (shard === 0) {
    return join(logDir, `conversation-${sessionID}.log`)
  }
  return join(logDir, `conversation-${sessionID}-shard-${shard}.log`)
}

const getFileSize = (filePath) => {
  try {
    return statSync(filePath).size
  } catch {
    return 0
  }
}

const getSessionLogFiles = (directory, sessionID) => {
  const logDir = getLogDir(directory)
  const files = readdirSync(logDir)
  const sessionFiles = files
    .filter(f => f.startsWith(`conversation-${sessionID}`))
    .map(f => join(logDir, f))
    .filter(f => existsSync(f))
  return sessionFiles.sort()
}

const getTotalLogSize = (directory, sessionID) => {
  const files = getSessionLogFiles(directory, sessionID)
  return files.reduce((total, f) => total + getFileSize(f), 0)
}

const cleanupOldestShards = (directory, sessionID) => {
  const files = getSessionLogFiles(directory, sessionID)
  while (files.length > MAX_SHARDS) {
    const oldest = files.shift()
    try {
      unlinkSync(oldest)
    } catch {}
  }
}

const rotateLog = (directory, sessionID, filePath) => {
  const size = getFileSize(filePath)
  if (size < MAX_SHARD_SIZE) {
    return filePath
  }

  const files = getSessionLogFiles(directory, sessionID)
  let shard = 1
  while (existsSync(getLogFile(directory, sessionID, shard))) {
    shard++
  }

  if (shard >= MAX_SHARDS) {
    const oldest = files.shift()
    if (oldest) {
      try {
        unlinkSync(oldest)
      } catch {}
    }
  }

  const baseName = filePath.replace(/\.log$/, "")
  const newShardPath = `${baseName}-shard-${shard}.log`
  renameSync(filePath, newShardPath)

  cleanupOldestShards(directory, sessionID)

  return filePath
}

const writeLog = (directory, sessionID, filePath, entry) => {
  const timestamp = new Date().toISOString()
  const logEntry = JSON.stringify({
    timestamp,
    ...entry,
  }, null, 2)
  const logContent = `\n${"=".repeat(80)}\n${logEntry}\n`

  const rotatedPath = rotateLog(directory, sessionID, filePath)
  appendFileSync(rotatedPath, logContent, "utf-8")
}

export const LogPlugin = async ({ client, directory }) => {
  const logDir = getLogDir(directory)

  await client.app.log({
    body: {
      service: "log-plugin",
      level: "info",
      message: "Log plugin initialized - conversation logging enabled",
      extra: { logDir },
    },
  })

  const sessionLogs = new Map()

  const getOrCreateLogFile = (sessionID) => {
    if (!sessionLogs.has(sessionID)) {
      const filePath = getLogFile(directory, sessionID)
      sessionLogs.set(sessionID, filePath)

      const initEntry = {
        type: "session_started",
        sessionID,
      }
      writeLog(directory, sessionID, filePath, initEntry)
    }
    return sessionLogs.get(sessionID)
  }

  const chatMessageHook = async (input, output) => {
    try {
      const sessionID = input.sessionID
      if (!sessionID) return

      const filePath = getOrCreateLogFile(sessionID)

      writeLog(directory, sessionID, filePath, {
        type: "chat_message",
        input: input,
        output: output,
      })
    } catch (error) {
      await client.app.log({
        body: {
          service: "log-plugin",
          level: "error",
          message: "Failed to log chat message",
          extra: { error: error.message },
        },
      })
    }
  }

  const chatMessagesTransformHook = async (input, output) => {
    try {
      const sessionID = output.messages[0]?.info?.sessionID
      if (!sessionID) return

      const filePath = getOrCreateLogFile(sessionID)

      writeLog(directory, sessionID, filePath, {
        type: "chat_messages_transform",
        input: input,
        output: output,
      })
    } catch (error) {
      await client.app.log({
        body: {
          service: "log-plugin",
          level: "error",
          message: "Failed to log chat messages transform",
          extra: { error: error.message },
        },
      })
    }
  }

  const chatSystemTransformHook = async (input, output) => {
    try {
      const sessionID = input.sessionID
      if (!sessionID) return

      const filePath = getOrCreateLogFile(sessionID)

      writeLog(directory, sessionID, filePath, {
        type: "chat_system_transform",
        input: input,
        output: output,
      })
    } catch (error) {
      await client.app.log({
        body: {
          service: "log-plugin",
          level: "error",
          message: "Failed to log chat system transform",
          extra: { error: error.message },
        },
      })
    }
  }

  const eventHook = async (event) => {
    try {
      const sessionID = event.properties?.sessionID || "global"
      const filePath = getOrCreateLogFile(sessionID)

      writeLog(directory, sessionID, filePath, {
        type: "event",
        event: event,
      })
    } catch (error) {
      await client.app.log({
        body: {
          service: "log-plugin",
          level: "error",
          message: "Failed to log event",
          extra: { error: error.message, eventType: event?.type },
        },
      })
    }
  }

  const toolDefinitionHook = async (input, output) => {
    try {
      const sessionID = input.sessionID || "global"
      const filePath = getOrCreateLogFile(sessionID)

      writeLog(directory, sessionID, filePath, {
        type: "tool_definition",
        input: input,
        output: output,
      })
    } catch (error) {
      await client.app.log({
        body: {
          service: "log-plugin",
          level: "error",
          message: "Failed to log tool definition",
          extra: { error: error.message, toolID: input?.toolID },
        },
      })
    }
  }

  return {
    "chat.message": chatMessageHook,
    "experimental.chat.messages.transform": chatMessagesTransformHook,
    "experimental.chat.system.transform": chatSystemTransformHook,
    "event": eventHook,
    "tool.definition": toolDefinitionHook,
  }
}
