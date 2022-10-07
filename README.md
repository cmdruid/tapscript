# BTON
A basic library for working with Bitcoin transaction data.

## How to Import
```html
<script src="https://unpkg.com/bton-lib"></script>
```
```js
import BTON from 'bton-lib'
```

## How to Use
```js
BTON.encode = {
  tx     : (txObject, options)  => 'hex encoded string',
  script : (scriptArr, options) => 'hex encoded string'
}

BTON.decode = {
  tx       : (hexString, options) => { 'Tx Object' },
  script   : (hexString, options) => [ 'Script Array' ]
}

BTON.convert = (object, options)  => { 'Tx Object' }

BTON.digest = {
  sigHash  : (txObject, options) => 'hex encoded signature hash',
  script   : (script, options)   => 'hex encoded script hash',
  template : (script, options)   => 'hex encoded template hash',
  metadata : null /* Not yet implemented! */
}
```

## Example Transaction Object
```js
{
  version: 0,                 // Version number.
  vin: [
    {
      prevTxid  : 'abcd1234', // 32-byte UTXO transaction ID.
      prevOut   : 0,          // Index of UTXO being spent.
      scriptSig : [],         // Array of unlocking arguments.
      sequence  : 'FFFFFFFF', // Sequence modifier.
      witness : [           // Array of witness arguments.

        'argument2',
        'argument1',
        /* 'P2WSH redeem script' */

      ]
    }
  ],
  vout: [
    {
      value: 100000000,       // Output value.
      scriptPubkey: [         // Array of locking arguments.

        'opcodes (or witness version)',
        'more opcodes (or locking hash)'

      ]
    }
  ],
  locktime: 0,                // Transaction lock-time.

  /* You can also include metadata! */
  meta: {

    /* Anything that is valid JSON can 
       go here. Simply remove the meta 
       field and re-encode the object 
       to get broadcast-able hex.
    */

  }
}
```

## Tentative Features
* More calculated fields (txid, size, weight, etc).
* Commitment hash for metadata field.
* Linting and validation of scripts / transactions.
* More support for script templates and metadata.
* Signature verification (requires libsecp256k1).

## Contribution
Feel free to fork and make contributions. Issue suggestions are also welcome!

## License
Use this library however you want!
