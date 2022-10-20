export default class Base64 {
  static encode = b64encode
  static decode = b64decode
}

function b64encode(str) {
  if (typeof window !== 'undefined') {
    return btoa(str)
  }
  return Buffer.from(str).toString('base64')
}

function b64decode(str) {
  if (typeof window !== 'undefined') {
    return atob(str)
  }
  return Buffer.from(str, 'base64').toString('utf8')
}
