import { createHash } from 'crypto';

export class Hashing {
  /**
   * Hash a string using SHA256
   * @param {string} input - The string to hash
   * @returns {string} SHA256 hash in uppercase hexadecimal format
   */
  static hashString(input) {
    const hash = createHash('sha256');
    hash.update(input, 'utf8');
    return hash.digest('hex').toUpperCase();
  }

  /**
   * Hash a string using MD5
   * @param {string} input - The string to hash
   * @returns {string} MD5 hash in uppercase hexadecimal format
   */
  static hashMD5(input) {
    const hash = createHash('md5');
    hash.update(input, 'utf8');
    return hash.digest('hex').toUpperCase();
  }

  /**
   * Hash a string using SHA512
   * @param {string} input - The string to hash
   * @returns {string} SHA512 hash in uppercase hexadecimal format
   */
  static hashSHA512(input) {
    const hash = createHash('sha512');
    hash.update(input, 'utf8');
    return hash.digest('hex').toUpperCase();
  }

  /**
   * Hash a string using a custom algorithm
   * @param {string} input - The string to hash
   * @param {string} algorithm - The hash algorithm (e.g., 'sha256', 'md5', 'sha512')
   * @returns {string} Hash in uppercase hexadecimal format
   */
  static hash(input, algorithm = 'sha256') {
    const hash = createHash(algorithm);
    hash.update(input, 'utf8');
    return hash.digest('hex').toUpperCase();
  }
}
