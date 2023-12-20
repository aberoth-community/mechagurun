import { readdirSync } from 'fs'
import i18next from 'i18next'
import jsonfile from './jsonfile'
import { basename, join } from 'path'

import type { InitOptions, Resource } from 'i18next'
import type { MechaGurunConfiguration } from 'src/types'

/**
 * Load locale resources
 * @param dir        Locales directory path
 * @param languages  Locales to load
 * @returns          Locale resources
 */
export const getLocaleResources = async (
  dir: string,
  languages: string[],
): Promise<InitOptions['resources']> => {
  const resource: Resource = {}
  await Promise.all(
    languages.map(async (lang) => {
      resource[lang] = { translation: await jsonfile.read(join(dir, lang + '.json')) }
    }),
  )
  return resource
}

/**
 * Get a translation for all languages
 * @param key  Property key
 * @returns    Translations
 */
export const tt = (key: string): Record<string, string> => {
  return i18next.languages.reduce((acc, lng) => {
    return {
      ...acc,
      [lng]: i18next.t(key, { lng }),
    }
  }, {})
}

/**
 * Initialize i18next
 * @param dir     Locales directory path
 * @param config  MechaGurun configuration
 * @returns       Loaded languages
 */
export const i18nextInitialize = async (
  dir: string,
  config: MechaGurunConfiguration,
): Promise<string[]> => {
  const languages = readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => basename(f, '.json'))
  await i18next.init({
    lng: config.localization?.default_language,
    fallbackLng: languages,
    load: 'currentOnly',
    resources: await getLocaleResources(dir, languages),
  })
  i18next.tt = tt
  return languages
}
