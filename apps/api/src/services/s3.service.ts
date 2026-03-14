import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import type { Readable } from 'stream';

const REGION = process.env.AWS_REGION || 'ap-south-1';
const BUCKET = process.env.AWS_RESUME_BUCKET;

if (!BUCKET) {
  // Fail fast so misconfiguration is obvious in logs
  // eslint-disable-next-line no-console
  console.error('AWS_RESUME_BUCKET is not set in environment');
}

const s3 = new S3Client({ region: REGION });

export async function uploadToS3(key: string, body: Buffer, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await s3.send(command);
  return key;
}

export async function getFromS3(key: string): Promise<Readable> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  const response = await s3.send(command);
  return response.Body as Readable;
}
