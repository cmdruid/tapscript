# BTON
A basic library for working with Bitcoin transaction data.

## How to Import
```html
<script src="https://unpkg.com/@cmdcode/tapscript"></script>
<script> const BTON = window.bton </script>
```
```ts
import * as BTON from '@cmdcode/tapscript'
```

## How to Use
```ts
BTON.script = {
  encode : (script : ScriptData, varint = true) => string,
  decode : (script : string) => ScriptData
}

BTON.sig = {
  segwit: {
    hash :   // Calculate the signature hash.
  }
  taproot: {
    hash :        // Calulate the signature hash.
    sign :        // Sign a transaction.
    verify :      // Verify a signed transaction.
    tweakPubkey : // Tweak a public key.
    tweakPrvkey : // Tweak a private key.
  }
}

BTON.tap = {
  // Returns a 'hashtag' used for padding.
  getTag
  // Returns a 'tapleaf' used for building a tree.
  getLeaf
  // Returns a 'branch' which combines two leaves.
  getBranch
  // Returns the merkle root of a tree.
  getRoot
  // Returns a 'taptweak' which is used to tweak the internal key.
  getTweak
  // Returns the merkle-proof needed for validating a tapleaf.
  getPath
  // Checks if a merkle-proof is valid for a given tapleaf.
  checkPath
  // Encodes a public key into a taproot address.
  encodeAddress
  // Decodes a taproot address into a public key.
  decodeAddress
}

BTON.tx = {
  // Serializes a JSON transaction into a hex-encoded string.
  encode : (txObject, options)  => 'hex encoded string',
  // Parses a hex-encoded transaction into a JSON object.
  decode : (scriptArr, options) => 'hex encoded string'
}
```

## Example Transaction Object
```ts
interface TxData {
  version : number
  input   : [
    {
      txid      : string
      vout      : number
      scriptSig : string | string[]
      sequence  : number
      prevout   : { value : number | bigint, scriptPubKey : string | string[] }
      witness   : Array<string | string[]>
    }
  ],
  output : [
    { value: number | bigint, scriptPubkey: string | string[] }
  ],
  locktime: number
}
```

## Contribution
Feel free to fork and make contributions. Suggestions are also welcome!

## License
Use this library however you want!
