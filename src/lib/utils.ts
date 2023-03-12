export function safeThrow (msg : string, bool : boolean) : boolean {
  if (bool) {
    throw new Error(msg)
  } else { return false }
}
