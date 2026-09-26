/** Keep bundled demo provenance and rights labels immutable at runtime. */
export function freezeDemoContent<T>(value: T): Readonly<T> {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freezeDemoContent(child);
    Object.freeze(value);
  }
  return value;
}
