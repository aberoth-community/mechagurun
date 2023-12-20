import { createLogger, format, transports } from 'winston'

/** Winston logger */
const logger = createLogger({
  format: format.combine(format.json(), format.timestamp(), format.errors()),
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  transports: [new transports.Console()],
})
export default logger
