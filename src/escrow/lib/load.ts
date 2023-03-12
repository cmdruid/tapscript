import { readdir } from 'node:fs/promises'
import path from 'path'

import { ContractTemplate } from '../schema/types.js'

export async function load_templates (
  filepath : string
) : Promise<ContractTemplate[]> {
  return import_files<ContractTemplate>(filepath, { assert: { type: 'json' } })
}

export async function load_methods (
  filepath : string
) : Promise<Function[]> {
  return import_files<Function>(filepath)
}

async function import_files<T> (
  filepath : string,
  opt = {}
) : Promise<T[]> {
  const basepath  = path.join(process.cwd(), filepath)
  const filenames = await readdir(basepath)
  const imports : T[] = []

  for (const name of filenames) {
    const fullpath = basepath + '/' + name
    const { default: template = {} } = await import(fullpath, opt)
    imports.push(template)
  }

  return imports
}
