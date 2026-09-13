const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%"

export function generatePassword(length = 14) {
  const values = new Uint32Array(length)
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(values)
  } else {
    for (let i = 0; i < length; i++) values[i] = Math.floor(Math.random() * 4294967295)
  }

  let password = ""
  for (let i = 0; i < length; i++) {
    password += CHARSET[values[i] % CHARSET.length]
  }
  return password
}
