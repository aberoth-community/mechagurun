/* eslint-disable no-var */

import type { PackageJson } from 'types-package-json'

declare global {
  var packageJSON: Partial<PackageJson>
}
export {}
