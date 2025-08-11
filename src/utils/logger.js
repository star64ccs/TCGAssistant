// 日誌工具類
class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isDebugEnabled = process.env.REACT_APP_DEBUG === 'true';
  }

  // 基礎日誌方法
  log(level, message, ...args) {
    if (this.isDevelopment || this.isDebugEnabled) {      const timestamp = new Date().toISOString();      const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;      switch (level) {        case 'error':          break;        case 'warn':          break;        case 'info':          // eslint-disable-next-line no-console          console.info(formattedMessage, ...args);          break;        case 'debug':          if (this.isDebugEnabled) {          // eslint-disable-next-line no-console            console.debug(formattedMessage, ...args);          }          break;        default:
      }
    }
  }

  // 便捷方法
  error(message, ...args) {
    this.log('error', message, ...args);
  }

  warn(message, ...args) {
    this.log('warn', message, ...args);
  }

  info(message, ...args) {
    this.log('info', message, ...args);
  }

  debug(message, ...args) {
    this.log('debug', message, ...args);
  }

  // 靜默方法（生產環境下不輸出）
  devLog(message, ...args) {
    if (this.isDevelopment) {    }
  }
}

// 創建單例實例
const logger = new Logger();

export default logger;
