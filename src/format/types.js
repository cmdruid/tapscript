/* eslint-disable key-spacing */
/* eslint-disable no-multi-spaces */

export default class Type {
  static is = {
    undefined : x => typeof x === 'undefined',
    infinity  : x => x === Infinity,
    null   : x => x === null,
    hex    : x => isHex(x),
    string : x => typeof x === 'string',
    bigint : x => typeof x === 'bigint',
    number : x => typeof x === 'number',
    array  : x => Array.isArray(x),
    uint8  : x => x instanceof Uint8Array,
    uint16 : x => x instanceof Uint16Array,
    uint32 : x => x instanceof Uint32Array,
    buffer : x => x instanceof ArrayBuffer,
    object : x => typeof x === 'object'
  }

  static array = {
    isString: x => x.every(e => Type.is.string(e)),
    isNumber: x => x.every(e => Type.is.number(e)),
    isBigInt: x => x.every(e => Type.is.bigint(e))
  }

  static equals = (x, t) => x instanceof t

  static of = x => {
    for (const type of Object.keys(Type.is)) {
      if (Type.is[type](x)) {
        return type
      }
    }
    return 'none'
  }
}

function isHex(str) {
  switch (true) {
    case (typeof str !== 'string'):
      return false
    case (/[^0-9a-fA-F]/.test(str)):
      return false
    case (str.length % 2):
      return false
    default:
      return true
  }
}
