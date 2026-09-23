import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

function getEncryptionKey(): Buffer {
  const key = process.env.X_TOKEN_ENCRYPTION_KEY;

  if (!key) {
    throw new Error(
      "X_TOKEN_ENCRYPTION_KEY is not configured."
    );
  }

  if (!/^[0-9a-fA-F]{64}$/.test(key)) {
    throw new Error(
      "X_TOKEN_ENCRYPTION_KEY must be exactly 64 hexadecimal characters."
    );
  }

  const buffer = Buffer.from(key, "hex");

  if (buffer.length !== KEY_LENGTH) {
    throw new Error(
      "X_TOKEN_ENCRYPTION_KEY must represent exactly 32 bytes."
    );
  }

  return buffer;
}

export function encryptXToken(value: string): string {
  if (!value) {
    throw new Error("Cannot encrypt an empty X token.");
  }

  const key = getEncryptionKey();

  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(
    ALGORITHM,
    key,
    iv,
    {
      authTagLength: AUTH_TAG_LENGTH,
    }
  );

  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  /*
   * Stored format:
   *
   * iv:authTag:ciphertext
   *
   * All values are encoded as hexadecimal.
   */
  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

export function decryptXToken(encryptedValue: string): string {
  if (!encryptedValue) {
    throw new Error("Cannot decrypt an empty encrypted X token.");
  }

  const key = getEncryptionKey();

  const parts = encryptedValue.split(":");

  if (parts.length !== 3) {
    throw new Error(
      "Invalid encrypted X token format."
    );
  }

  const [ivHex, authTagHex, ciphertextHex] = parts;

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const ciphertext = Buffer.from(ciphertextHex, "hex");

  if (iv.length !== IV_LENGTH) {
    throw new Error("Invalid X token initialization vector.");
  }

  if (authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error("Invalid X token authentication tag.");
  }

  if (ciphertext.length === 0) {
    throw new Error("Invalid X token ciphertext.");
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    iv,
    {
      authTagLength: AUTH_TAG_LENGTH,
    }
  );

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}