export function fmt(template: string, ...params: any[]) {
  return template.replace(/\$(\d+)/g, (_, index) => (params[index] != null ? params[index] : ""));
}
