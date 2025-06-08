import { getLogger, setup, LogLevels } from "@std/log";
import { ConsoleHandler } from "@std/log/console_handler";
import { BaseHandler } from "@std/log/base_handler"; // For type if needed, but ConsoleHandler is concrete

// Ensure this is only run once
let loggingConfigured = false;

/**
 * Configures the logging system for the application.
 * This function sets up handlers (e.g., console output) and defines loggers
 * with specific levels for different parts of the application (default, server, gemini_client).
 * It ensures that logging is configured only once.
 *
 * Log levels can be adjusted here (e.g., to "DEBUG" for more verbosity).
 * Currently, it uses a fixed `ConsoleHandler` with default formatting.
 *
 * @returns A promise that resolves when logging setup is complete.
 */
export async function configureLogging(): Promise<void> {
  if (loggingConfigured) {
    return;
  }

  // Determine log level from environment variable, default to INFO
  // For simplicity in this task, we'll fix it. Enhancement could be Deno.env.get("LOG_LEVEL")
  const defaultLogLevel: LogLevels = "INFO"; // Could be "DEBUG" for more verbosity
  const geminiClientLogLevel: LogLevels = "INFO";

  await setup({
    handlers: {
      console: new ConsoleHandler(defaultLogLevel, {
        // Use default formatter which is StdLogFormatter
      }),
    },
    loggers: {
      default: {
        level: defaultLogLevel,
        handlers: ["console"],
      },
      server: { // Specific logger for the server
        level: defaultLogLevel, // Or "DEBUG" for more server details
        handlers: ["console"],
      },
      gemini_client: {
        level: geminiClientLogLevel,
        handlers: ["console"],
      },
    },
  });
  loggingConfigured = true;
  getLogger("default").info("Logging configured");
}

// Export a function to get a logger, though getLogger can be used directly from @std/log
export { getLogger };

// Example of how to get a logger:
// import { getLogger } from "./logging.ts"; // or directly from "@std/log"
// const logger = getLogger(); // default logger
// const serverLogger = getLogger("server");
// const clientLogger = getLogger("gemini_client");
