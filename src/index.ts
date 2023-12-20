import { DEFAULT_CONFIG, CONFIG_FILENAME } from './util/constant/index'

import MechaGurun from './MechaGurun'
import jsonfile from './util/jsonfile'
import { join } from 'path'
import type { MechaGurunConfiguration } from './types/config'
import type { PackageJson } from 'types-package-json'

void (async () => {
  // log title
  ;(await import('cfonts')).say('- mechagurun -', {
    colors: ['yellowBright'],
    font: 'tiny',
  })
  // load environment variables in development mode
  if (process.env.NODE_ENV === 'development') {
    ;(await import('dotenv')).config()
  }
  // load package.json
  const packageJSON = await jsonfile.read<Partial<PackageJson>>(
    join(__dirname, '../package.json'),
    {},
  )
  // load config
  const config: MechaGurunConfiguration = await jsonfile.read(
    join(__dirname, CONFIG_FILENAME),
    DEFAULT_CONFIG,
  )
  // start bot
  const gurun = new MechaGurun(config, packageJSON)
  await gurun.start(process.env.DISCORD_BOT_TOKEN)
})()
