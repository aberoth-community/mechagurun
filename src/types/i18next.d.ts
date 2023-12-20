import 'i18next'
import type { tt } from '../util/i18next'
import type enUS from '../locales/en-US.json'
import type ptBR from '../locales/pt-BR.json'

declare module 'i18next' {
  interface CustomInstanceExtenstions {
    tt: typeof tt
  }
  interface CustomTypeOptions {
    resources: {
      'en-US': { translation: typeof enUS }
      'pt-BR': { translation: typeof ptBR }
    }
  }
}

export {}
