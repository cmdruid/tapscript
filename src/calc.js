import { bytesToHex, bytesToJSON } from './convert.js'
import { hash256, sha256 } from './crypto.js'
import { encodeTx } from './encoder.js'

export async function appendTxData(tx, txhex) {
  const base = await hash256(getBaseRawTx(tx))
  const hash = await hash256(txhex)
  const weight = tx.bsize * 3 + tx.size - 6
  const vsize = Math.floor(weight / 4) + (weight % 4 > 0)

  await getPrevData(tx)
  await getMetaData(tx)

  return {
    txid: bytesToHex(base.reverse()),
    hash: bytesToHex(hash.reverse()),
    ...tx,
    weight,
    vsize,
    totalValue: getTxValueData(tx),
    raw: txhex
  }
}

function getBaseRawTx(tx) {
  return encodeTx(
    tx, { omitWitness: true, omitMeta: true }
  )
}

function getTxValueData(tx) {
  let totalValue = 0
  for (const { value } of tx.vout) {
    totalValue += value
  }
  return totalValue
}

async function getPrevData(tx, fn = (x) => null) {
  for (const vin of tx.vin) {
    vin.prevData = await fn(vin)
  }
}

async function getMetaData(tx) {
  const { meta } = tx
  if (meta && meta?.data) {
    const { data } = meta
    tx.meta = {
      data: bytesToJSON(data),
      hash: bytesToHex(await sha256(data))
    }
  }
}
