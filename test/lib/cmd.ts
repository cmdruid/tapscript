import { spawn } from 'child_process'

interface ReturnCall<T> {
  ok   : boolean
  code : number | null
  data : T
}

export default async function call<T> (
  method  : string,
  ...args : string[]
) : Promise<ReturnCall<T>> {

  return new Promise((resolve, reject) => {
    const proc = spawn(method, args)

    let blob = ''

    proc.stdout.on('data', data => {
      blob += data.toString()
    })

    proc.stderr.on('data', data => {
      reject(new Error(data.toString()))
    })

    proc.on('error', err => {
      reject(err)
    })

    proc.on('close', code => {
      resolve({ ok: code === 0, code, data: JSON.parse(blob) })
    })
  })
}
