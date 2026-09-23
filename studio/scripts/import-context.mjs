// Creates or replaces the search agent's Context document (context/search-context.json)
// in the dataset from studio/.env. The @sanity/context Studio plugin needs Sanity v6,
// so this document is edited as JSON and imported, not authored in the Studio.

import {existsSync} from 'node:fs'
import {spawnSync} from 'node:child_process'
import {dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const envFile = resolve(root, '.env')
if (existsSync(envFile)) process.loadEnvFile(envFile)

const dataset = process.env.SANITY_STUDIO_DATASET
if (!dataset) {
  console.error('SANITY_STUDIO_DATASET is not set. Add it to studio/.env.')
  process.exit(1)
}

const {status} = spawnSync(
  'npx',
  ['sanity', 'documents', 'create', 'context/search-context.json', '--replace', '--dataset', dataset],
  {cwd: root, stdio: 'inherit', shell: process.platform === 'win32'},
)
process.exit(status ?? 1)
