import { readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'

export const DEFAULT_STACK_NAME = 'cdk-basic-website-template'

export function loadDotEnv(pathPrefix?: string) {
  try {
    for (const [key, value] of Object.entries(parseEnv(readFileSync(`${pathPrefix ?? ''}.env`, 'utf-8'))))
      // Existing environment variables take precedence over .env
      if (!(key in process.env)) process.env[key] = value
  } catch {
    // no .env, that's fine
  }
}
