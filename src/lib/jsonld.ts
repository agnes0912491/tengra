export function safeJsonLd<T>(obj: T): string {
  // Prevent closing script tag injection inside JSON
  return JSON.stringify(obj).replace(/<\//g, "<\\/");
}
