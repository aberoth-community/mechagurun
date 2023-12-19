import { CONFIG_DEFAULTS, CONFIG_FILENAME } from '$constant/index'

import MechaGurun from './MechaGurun'
import { i18init } from '$util/i18next'
import jsonfile from '$util/jsonfile'
import logger from '$util/logger'
import path from 'path'
import type { MechaGurunConfiguration } from '$types/config'

void (async () => {
  logger.info(`starting mechagurun v${MECHAGURUN_VERSION}...`)
  // load environment variables in development mode
  if (process.env.NODE_ENV === 'development') {
    ;(await import('dotenv')).config()
  }
  // load config
  const config: MechaGurunConfiguration = await jsonfile.read(
    path.join(__dirname, CONFIG_FILENAME),
    CONFIG_DEFAULTS,
  )
  // initialize i18next
  const languages = await i18init(path.join(__dirname, './locales'), config)
  logger.debug(`loaded ${languages.length} localization(s)...`, { languages })
  // start bot
  const gurun = new MechaGurun(config)
  await gurun.start(process.env.DISCORD_BOT_TOKEN)
})()
