export function exists <T> (
  value ?: T | null
) : value is NonNullable<T> {
  if (typeof value === 'undefined' || value === null) {
    return false
  }
  return true
}

export function is_number (value : unknown) : value is number {
  return (typeof value === 'number' && !Number.isNaN(value))
}

export function is_bigint (value : unknown) : value is bigint {
  return typeof value === 'bigint'
}

export function is_hex (
  value : unknown
) : value is string {
  if (
    typeof value === 'string'            &&
    value.match(/[^a-fA-F0-9]/) === null &&
    value.length % 2 === 0
  ) {
    return true
  }
  return false
}

export function is_hash (value : unknown) : value is string {
  if (is_hex(value) && value.length === 64) {
    return true
  }
  return false
}
