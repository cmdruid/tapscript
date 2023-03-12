export function safeThrow (
  errorMsg    : string,
  shouldThrow : boolean
) : boolean {
  if (shouldThrow) {
    throw new Error(errorMsg)
  } else { return false }
}
