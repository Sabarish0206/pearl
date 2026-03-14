import mime from 'mime-types';

export function getMimeType(fileName) {
  return mime.lookup(fileName) || 'application/octet-stream';
}
