import path from 'path';

export function getPathBasename(p: string, index?: number) {
  if (URL.canParse(p)) {
    p = new URL(p).pathname;
  }

  const sp = p.split(path.sep);
  return sp.at(index ?? sp.length - 1);
}
