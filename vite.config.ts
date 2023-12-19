import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import jsonfile from './src/util/jsonfile'
import type { PackageJson } from 'types-package-json'

const packageJson = await jsonfile.read<PackageJson>('./package.json')

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    lib: {
      entry: 'src/index.ts',
      fileName: 'mechagurun',
      formats: ['es'],
      name: 'mechagurun',
    },
    ssr: 'src/index.ts',
  },
  define: {
    MECHAGURUN_HOMEPAGE: JSON.stringify(packageJson.homepage),
    MECHAGURUN_ISSUES: JSON.stringify(packageJson.bugs),
    MECHAGURUN_VERSION: JSON.stringify(packageJson.version),
  },
  ssr: {
    external: Object.keys(packageJson?.dependencies ?? {}),
  },
  test: {
    include: ['src/test/**/*.test.ts'],
  },
})
