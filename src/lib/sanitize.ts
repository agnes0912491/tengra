export function sanitizeInput(value: string, maxLength = 256): string {
  if (!value) return value;
  // Trim and limit length
  let v = value.trim().slice(0, maxLength);

  // Remove common SQL metacharacters and comment tokens
  // This is a client-side defensive measure; server must still use prepared statements.
  v = v.replace(/(--|;|\/\*|\*\/|\bOR\b|\bAND\b)/gi, "");

  // Remove dangling quotes/backslashes
  v = v.replace(/["'`\\]/g, "");

  return v;
}
