import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET,
  },
  deployment: {
    // Hosted at https://vertex-n2c3rnrz.sanity.studio. The Context MCP only serves
    // datasets with a deployed Studio.
    appId: 'cu2mlxoej9tmqgadxq0x1ey4',
    autoUpdates: true,
  },
  typegen: {
    // Queries live in the Next.js app at the repo root.
    path: ['../lib/**/*.{ts,tsx}', '../app/**/*.{ts,tsx}'],
    schema: 'schema.json',
    generates: '../sanity.types.ts',
    overloadClientMethods: true,
  },
})
