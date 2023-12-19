import 'i18next'

import type en_US from '../locales/en-US.json'
import type pt_BR from '../locales/pt-BR.json'

export interface Locale<T> {
  translation: T
}

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      'en-US': Locale<typeof en_US>
      'pt-BR': Locale<typeof pt_BR>
    }
  }
}

export {}
