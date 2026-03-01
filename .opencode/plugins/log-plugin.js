import { appendFileSync, mkdirSync, existsSync } from "fs"
import { join } from "path"

const getLogDir = (directory) => {
  const logDir = join(directory, ".opencode", "logs")
  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true })
  }
  return logDir
}

const getLogFile = (directory, sessionID) => {
  const logDir = getLogDir(directory)
  return join(logDir, `conversation-${sessionID}.log`)
}

const writeLog = (filePath, entry) => {
  const timestamp = new Date().toISOString()
  const logEntry = JSON.stringify({
    timestamp,
    ...entry,
  }, null, 2)
  appendFileSync(filePath, `\n${"=".repeat(80)}\n${logEntry}\n`, "utf-8")
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
      writeLog(filePath, initEntry)
    }
    return sessionLogs.get(sessionID)
  }

  const chatMessageHook = async (input, output) => {
    try {
      const sessionID = input.sessionID
      if (!sessionID) return

      const filePath = getOrCreateLogFile(sessionID)

      writeLog(filePath, {
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

      writeLog(filePath, {
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

      writeLog(filePath, {
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

      writeLog(filePath, {
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

      writeLog(filePath, {
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
