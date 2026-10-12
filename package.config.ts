import {defineConfig} from '@sanity/pkg-utils'

export default defineConfig({
  legacyExports: true,
  dist: 'dist',
  tsconfig: 'tsconfig.dist.json',

  css: true,
})
