import crypto from 'crypto';
import conf from '@/conf/conf';

export type EncryptedEnvelope = {
  iv: string;
  tag: string;
  data: string;
};

export function isPayloadEncryptionEnabled(): boolean {
  return conf.payloadEncryption;
}

function getKey(): Buffer {
  const raw = conf.payloadEncryptionKey;
  if (!raw) {
    throw new Error('NEXT_PUBLIC_PAYLOAD_ENCRYPTION_KEY is required when encryption is on');
  }

  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, 'hex');
  }

  const buf = Buffer.from(raw, 'utf8');
  if (buf.length !== 32) {
    throw new Error('NEXT_PUBLIC_PAYLOAD_ENCRYPTION_KEY must be 32 bytes or 64 hex chars');
  }
  return buf;
}

export function isEncryptedEnvelope(body: unknown): body is EncryptedEnvelope {
  return (
    !!body &&
    typeof body === 'object' &&
    typeof (body as EncryptedEnvelope).iv === 'string' &&
    typeof (body as EncryptedEnvelope).tag === 'string' &&
    typeof (body as EncryptedEnvelope).data === 'string'
  );
}

export function encryptPayload(obj: unknown): EncryptedEnvelope {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const plaintext = Buffer.from(JSON.stringify(obj ?? null), 'utf8');
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: encrypted.toString('base64'),
  };
}

export function decryptPayload(envelope: EncryptedEnvelope): unknown {
  if (!envelope || typeof envelope !== 'object') {
    throw new Error('Invalid encrypted envelope');
  }
  const { iv, tag, data } = envelope;
  if (!iv || !tag || !data) {
    throw new Error('Missing iv/tag/data');
  }

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    getKey(),
    Buffer.from(iv, 'base64')
  );
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(data, 'base64')),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString('utf8'));
}
