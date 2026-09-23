// Imports .seed/seed.ndjson into the dataset from studio/.env.
// `sanity dataset import` does not read the dataset from sanity.cli.ts, so pass it explicitly.

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
  ['sanity', 'dataset', 'import', '.seed/seed.ndjson', '--dataset', dataset, '--replace'],
  {cwd: root, stdio: 'inherit', shell: process.platform === 'win32'},
)
process.exit(status ?? 1)
