import { InputData, TxData, TxTemplate } from '../../schema/types.js'

export function createTx (template : TxTemplate) : TxData {
  const { version = 2, vin = [], vout = [], locktime = 0 } = template
  const inputs = vin.map(e => {
    if (e.witness === undefined) e.witness = []
    return e as InputData
  })
  return { version, vin: inputs, vout, locktime }
}
