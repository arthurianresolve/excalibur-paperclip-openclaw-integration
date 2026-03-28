export function redactAuth(headerValue: string | undefined): string {
  if (!headerValue) {
    return "";
  }
  return headerValue.replace(/.{4}(?=.{4})/g, "*");
}
