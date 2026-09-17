import conf from '@/conf/conf';

export type EncryptedEnvelope = {
  iv: string;
  tag: string;
  data: string;
};

export function isPayloadEncryptionEnabled(): boolean {
  return conf.payloadEncryption;
}

function getKeyBytes(): Uint8Array {
  const raw = conf.payloadEncryptionKey;
  if (!raw) {
    throw new Error('NEXT_PUBLIC_PAYLOAD_ENCRYPTION_KEY is required when encryption is on');
  }

  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    const bytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      bytes[i] = parseInt(raw.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
  }

  const enc = new TextEncoder().encode(raw);
  if (enc.length !== 32) {
    throw new Error('NEXT_PUBLIC_PAYLOAD_ENCRYPTION_KEY must be 32 bytes or 64 hex chars');
  }
  return enc;
}

async function importKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    getKeyBytes() as BufferSource,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

function b64encode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i++) {
    s += String.fromCharCode(bytes[i]);
  }
  return btoa(s);
}

function b64decode(str: string): Uint8Array {
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
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

export async function encryptPayload(obj: unknown): Promise<EncryptedEnvelope> {
  const key = await importKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(obj ?? null));
  const cipherBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    plaintext
  );
  // WebCrypto appends the 16-byte auth tag at the end
  const all = new Uint8Array(cipherBuf);
  const data = all.slice(0, all.length - 16);
  const tag = all.slice(all.length - 16);
  return {
    iv: b64encode(iv),
    tag: b64encode(tag),
    data: b64encode(data),
  };
}

export async function decryptPayload(envelope: EncryptedEnvelope): Promise<unknown> {
  const key = await importKey();
  const iv = b64decode(envelope.iv);
  const tag = b64decode(envelope.tag);
  const data = b64decode(envelope.data);
  const combined = new Uint8Array(data.length + tag.length);
  combined.set(data);
  combined.set(tag, data.length);
  const plainBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    combined as BufferSource
  );
  return JSON.parse(new TextDecoder().decode(plainBuf));
}
