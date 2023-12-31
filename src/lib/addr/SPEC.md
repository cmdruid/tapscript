```ts
Address = {
  from_asm    : () => string,
  from_hex    : () => string,
  from_pubkey : () => string,
  from_script : () => string,
  from_txo    : () => string,
  parse       : () => ScriptKey
}
```

```ts
ScriptKey = {
  from_asm
  from_hex
  from_pubkey
  from_script
  from_address
}
```
