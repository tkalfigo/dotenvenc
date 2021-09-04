const crypto = require('crypto');
const md5FileSync = require('md5-file').sync;
const { readFileSync, writeFileSync } = require('fs');

const DEFAULT_ENCRYPTED_PATHNAME = './.env.enc';
const DEFAULT_DECRYPTED_PATHNAME = './.env';
const ALGOR = 'aes-256-ctr';
const IV_LENGTH = 16;
const MAX_KEY_LENGTH = 32;
const BUFFER_PADDING = Buffer.alloc(MAX_KEY_LENGTH); // key used in createCipheriv()/createDecipheriv() buffer needs to be 32 bytes


/**
 * Write to disk decrypted file from encrypted file
 * @param     {String}    passwd              the key used to encrypt the .env into .env.enc we'll use now for decrpypting
 * @param     {String}    [encryptedPathname] the full path of encrypted file or DEFAULT_ENCRYPTED_PATHNAME if ommitted
 * @param     {String}    [decryptedPathname] the full path of decrypted file or DEFAULT_DECRYPTED_PATHNAME if ommitted
 * @param     {Boolean}   [write]             by default writes file on disk; if set to false the data will be instead returned as buffer
 * @returns   {String}                        either writes the decrypted file to disk and returns its md5 checksum or returns buffer of data
 */
function decrypt({ passwd, encryptedPathname = DEFAULT_ENCRYPTED_PATHNAME, decryptedPathname = DEFAULT_DECRYPTED_PATHNAME, write = true }) {
  if (!passwd) {
    throw new Error('decryption requires a password');
  }
  const allData = readFileSync(encryptedPathname);
  const [ivText, encText] = allData.toString().split(':');
  const ivBuff = Buffer.from(ivText, 'hex');
  const encBuff = Buffer.from(encText, 'hex');
  const decipher = crypto.createDecipheriv(ALGOR, Buffer.concat([Buffer.from(passwd), BUFFER_PADDING], MAX_KEY_LENGTH), ivBuff);
  const decBuff = Buffer.concat([decipher.update(encBuff), decipher.final()]);
  if (write) {
    writeFileSync(decryptedPathname, decBuff);
    return md5FileSync(decryptedPathname);
  } else {
    return decBuff;
  }
}

/**
 * Write to disk encrypted file from decrypted file
 * @param     {String}    passwd                the key used to encrypt the .env into .env.enc
 * @param     {String}    [decryptedPathname]   the full path of decrypted file or DEFAULT_DECRYPTED_PATHNAME if ommitted
 * @param     {String}    [encryptedPathname]   the full path of encrypted file or DEFAULT_ENCRYPTED_PATHNAME if ommitted
 * @param     {Boolean}   [write]               by default writes file on disk; if set to false the data will be instead returned as buffer
 * @returns   {String}                          either writes the encrypted file to disk and returns its md5 checksum or returns buffer of data
 */
function encrypt({ passwd, decryptedPathname = DEFAULT_DECRYPTED_PATHNAME, encryptedPathname = DEFAULT_ENCRYPTED_PATHNAME, write = true }) {
  if (!passwd) {
    throw new Error('encryption requires a password');
  }
  const ivBuff = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGOR, Buffer.concat([Buffer.from(passwd), BUFFER_PADDING], MAX_KEY_LENGTH), ivBuff);
  const encBuff = Buffer.concat([cipher.update(readFileSync(decryptedPathname)), cipher.final()]);
  if (write) {
    writeFileSync(encryptedPathname, ivBuff.toString('hex') + ':' + encBuff.toString('hex'));
    return md5FileSync(encryptedPathname);
  } else {
    return encBuff;
  }
}

module.exports = {
  decrypt,
  encrypt
};
