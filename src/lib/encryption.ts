import crypto from "crypto";

// Kunci rahasia 32-byte untuk AES-256. 
// Di production, wajib diatur di .env (ENCRYPTION_KEY=...)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "kipan-default-secret-key-32-chars-!!";
const ALGORITHM = "aes-256-cbc";

// Memastikan kunci selalu 32 bytes menggunakan SHA-256
const key = crypto.createHash("sha256").update(String(ENCRYPTION_KEY)).digest();

// Menggunakan Deterministic Encryption agar NIK tetap bisa di-query (dicari) di Database
// menggunakan exact-match (WHERE nik = ?). 
// IV (Initialization Vector) dibuat statis 16 bytes dari MD5 kunci.
const staticIV = crypto.createHash("md5").update(String(ENCRYPTION_KEY)).digest();

/**
 * Mengenkripsi NIK / KTP menggunakan AES-256-CBC.
 */
export function encryptNIK(text: string): string {
  if (!text) return text;
  try {
    const cipher = crypto.createCipheriv(ALGORITHM, key, staticIV);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
  } catch (err) {
    console.error("Encryption error:", err);
    return text;
  }
}

/**
 * Mendekripsi NIK / KTP kembali ke teks asli (Plain Text).
 * Memiliki fallback jika data yang tersimpan adalah data lama (belum terenkripsi).
 */
export function decryptNIK(encryptedText: string): string {
  if (!encryptedText) return encryptedText;
  
  // Heuristik: ciphertext hex AES-256-CBC untuk input 16 karakter (NIK) panjangnya 32 karakter
  const isHex = /^[0-9a-fA-F]{32,}$/.test(encryptedText);
  if (!isHex) {
    // Kemungkinan besar data lama yang belum terenkripsi
    return encryptedText;
  }

  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, staticIV);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    // Jika gagal decrypt, kembalikan teks aslinya (mungkin data lama tapi kebetulan 32 chars)
    return encryptedText;
  }
}
