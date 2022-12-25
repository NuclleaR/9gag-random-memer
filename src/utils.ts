
export function buildUrl(url: string, data: Record<string, string | number | boolean>) {
  let str = url;
  Object.keys(data).forEach(key => {
    str = str.replace(`:${key}`, data[key].toString());
  });

  return str;
}

export function getRandomInt(from: number, to: number): number {
  return Math.floor(Math.random() * (to - from + 1)) + from;
}
