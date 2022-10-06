// Copyright (c) 2017, 2021 Pieter Wuille
// Revisions made by Christopher Scott (2022)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

const encodings = {
  BECH32: "bech32",
  BECH32M: "bech32m",
};

function getEncodingConst(enc) {
  switch (enc) {
    case encodings.BECH32:
      return 1
    case encodings.BECH32M:
      return 0x2bc830a3
    default:
      return null
  }
}

function polymod(values) {
  var chk = 1;
  for (var p = 0; p < values.length; ++p) {
    var top = chk >> 25;
    chk = (chk & 0x1ffffff) << 5 ^ values[p];
    for (var i = 0; i < 5; ++i) {
      if ((top >> i) & 1) {
        chk ^= GENERATOR[i];
      }
    }
  }
  return chk;
}

function hrpExpand(hrp) {
  /** Expand the HRP into values for checksum computation. */
  const ret = [];
  let p;
  for (p = 0; p < hrp.length; ++p) {
    ret.push(hrp.charCodeAt(p) >> 5);
  }
  ret.push(0);
  for (p = 0; p < hrp.length; ++p) {
    ret.push(hrp.charCodeAt(p) & 31);
  }
  return ret;
}

function convertBits(data, fromBits, toBits, pad=true) {
  /** Power of 2 base conversion. */
  const ret = [];

  let acc = 0, bits = 0;

  let maxVal = (1 << toBits) - 1,
      maxAcc = (1 << (fromBits + toBits - 1)) - 1
  
  for (let val of data) {
    if (val < 0 || (val >> fromBits)) {
      return null
    }
    acc = ((acc << fromBits) | val) & maxAcc
    bits += fromBits
    while (bits >= toBits) {
      bits -= toBits
      ret.push((acc >> bits) & maxVal)
    }
  }

  if (pad) {
    if (bits) {
      ret.push((acc << (toBits - bits)) & maxVal)
    }
  } else if (bits >= fromBits || (acc << (toBits - bits)) & maxVal) {
    return null
  }
  return ret
}

function verifyChecksum(hrp, data, enc) {
  const combined = hrpExpand(hrp).concat(data)
  return polymod(combined) === getEncodingConst(enc);
}

function createChecksum(hrp, data, enc) {
  var values = hrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
  var mod = polymod(values) ^ getEncodingConst(enc);
  var ret = [];
  for (var p = 0; p < 6; ++p) {
    ret.push((mod >> 5 * (5 - p)) & 31);
  }
  return ret;
}

function encode(hrp, data, enc) {
  const combined = data.concat(createChecksum(hrp, data, enc))
  let ret = hrp + '1';
  for (var p = 0; p < combined.length; ++p) {
    ret += CHARSET.charAt(combined[p]);
  }
  return ret;
}

function decode(bechstr, version) {
  const enc = (version) ? 'bech32m' : 'bech32'

  if (!checkBounds(bechstr)) {
    return [ null, null ];
  }

  bechstr = bechstr.toLowerCase();
  
  if (!checkSeparatorPos(bechstr)) {
    return [ null, null ];
  }

  const data = []

  let pos = bechstr.lastIndexOf('1'),
      hrp = bechstr.substring(0, pos);

  for (let p = pos + 1; p < bechstr.length; ++p) {
    let d = CHARSET.indexOf(bechstr.charAt(p));
    if (d === -1) {
      return [ null, null ];
    }
    data.push(d);
  }

  return (verifyChecksum(hrp, data, enc))
    ? [ hrp, data.slice(0, data.length - 6) ]
    : [ null, null ]
}

function checkBounds(bechstr) {
  let p, char, has_lower = false, has_upper = false;

  for (p = 0; p < bechstr.length; ++p) {
    char = bechstr.charCodeAt(p)
    if (char < 33 || char > 126) {
      return false;
    }
    if (char >= 97 && char <= 122) {
        has_lower = true;
    }
    if (char >= 65 && char <= 90) {
        has_upper = true;
    }
  }

  return !(has_lower && has_upper)
}

function checkSeparatorPos(bechstr) {
  let pos = bechstr.lastIndexOf('1');
  return !(
    pos < 1 
    || pos + 7 > bechstr.length 
    || bechstr.length > 90
  )
}

function bech32encode(hrp, data, version=0) {
  const dat = [ version, ...convertBits(data, 8, 5) ]
  const enc = (version) ? 'bech32m' : 'bech32'
  const str = encode(hrp, dat, enc)
  const chk = bech32decode(str, version)
  return (chk) ? str : null
}

function bech32decode(string, version=0) {
  const hrp = string.split('1', 1)[0]
  const [ hrpgot, data ] = decode(string, version)
  const decoded = convertBits(data.slice(1), 5, 8, false)
  const length  = decoded.length

  switch (true) {
    case (hrp !== hrpgot):
      // Returned hrp string is invalid.
      return null
    case (decoded === null || length < 2 || length > 40):
      // Decoded string is invalid or out of spec.
      return null
    case (data[0] > 16):
      // Returned version bit is out of range.
      return null
    case (data[0] === 0 && length !== 20 && length !== 32):
      // Decoded string does not match version 0 spec.
      return null
    case (data[0] === 0 && version !== 0):
      // Decoded version bit does not match.
      return null
    case (data[0] !== 0 && version !== 1):
      // Decoded version bit does not match.
      return null
    default:
      return decoded
  }
}

export class Bech32 {
  static encode = bech32encode
  static decode = bech32decode
}
