const crypto = require('crypto');
const path = require('path');
const md5FileSync = require('md5-file').sync;
const statSync = require('fs').statSync;
const { readFileSync, writeFileSync } = require('fs');

const DEFAULT_ENCRYPTED_FILENAME = '.env.enc';
const DEFAULT_DECRYPTED_FILENAME = '.env';
const ALGOR = 'aes-256-ctr';
const IV_LENGTH = 16;
const MAX_KEY_LENGTH = 32;
const BUFFER_PADDING = Buffer.alloc(MAX_KEY_LENGTH); // key used in createCipheriv()/createDecipheriv() buffer needs to be 32 bytes

/**
 * Checks if a file or directory exists
 * @param     {String}  fileOrDir   name of file or directory
 * @returns   {Boolean}             if @fileOrDir exists and is readable file or directory
 */
function exists(fileOrDir) {
  let stats;
  try {
    stats = statSync(fileOrDir);
    return stats.isFile() || stats.isDirectory();
  } catch (err) {
    return false;
  }
}

/**
 * Goes up folder hierarchy looking for encrypted file; search stops when either root folder or folder with 'package.json' is reached
 * @param     {String}     file     the file to look for
 * @returns   {String}              the full pathname of passed @file or throws error if not found
 */
function findFileLocation(file) {
  let location = './';
  while (true) {
    if (exists(location + file)) {
      break;
    } else if (exists(location + 'package.json') || location === '/') {
      // Assumption is that reaching the app root folder or the system '/' marks the end of the search
      throw new Error(`Failed to find file "${file}" within the project`);
    }
    // Go one level up
    location = path.resolve('../' + location) + '/';
  }
  return location;
}

/**
 * Write to disk decrypted file (.env) from encrypted file (.env.enc)
 * Does not load the variables into process.env
 * @param     {String}    passwd              the key used to encrypt the .env into .env.enc we'll use now for decrpypting
 * @param     {String}    encryptedFilename   the encrypted file's name
 * @returns   {String}                        writes the decrypted file to disk at same location where the decrypted file was found and returns its md5 checksum
 */
function decrypt(passwd, encryptedFilename = DEFAULT_ENCRYPTED_FILENAME) {
  if (!passwd) {
    throw new Error('decryption requires a password');
  }
  const encryptedFileLocation = findFileLocation(encryptedFilename);
  const encryptedFileFullPath = encryptedFileLocation + encryptedFilename;
  const decryptedFileFullPath = encryptedFileLocation + DEFAULT_DECRYPTED_FILENAME; // we write decrypted file at same location as where we found encrypted file

  const allData = readFileSync(encryptedFileFullPath);
  const [ivText, encText] = allData.toString().split(':');
  const ivBuff = Buffer.from(ivText, 'hex');
  const encBuff = Buffer.from(encText, 'hex');
  const decipher = crypto.createDecipheriv(ALGOR, Buffer.concat([Buffer.from(passwd), BUFFER_PADDING], MAX_KEY_LENGTH), ivBuff);
  const decBuff = Buffer.concat([decipher.update(encBuff), decipher.final()]);
  writeFileSync(decryptedFileFullPath, decBuff);
  return md5FileSync(decryptedFileFullPath);
}

/**
 * Write to disk encrypted file (.env.enc) from decrypted file (.env)
 * @param     {String}    passwd              the key used to encrypt the .env into .env.enc
 * @param     {String}    encryptedFilename   the encrypted file's name
 * @returns   {String}                        writes the encrypted file to disk at same location where the encrypted file was found and returns its md5 checksum
 */
function encrypt(passwd, encryptedFilename = DEFAULT_ENCRYPTED_FILENAME) {
  if (!passwd) {
    throw new Error('encryption requires a password');
  }
  const decryptedFileLocation = findFileLocation(DEFAULT_DECRYPTED_FILENAME);
  const decryptedFileFullPath = decryptedFileLocation + DEFAULT_DECRYPTED_FILENAME;
  const encryptedFileFullPath = decryptedFileLocation + encryptedFilename; // we write encrypted file at same location as where we found decrypted file

  const ivBuff = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGOR, Buffer.concat([Buffer.from(passwd), BUFFER_PADDING], MAX_KEY_LENGTH), ivBuff);
  const encBuff = Buffer.concat([cipher.update(readFileSync(decryptedFileFullPath)), cipher.final()]);
  writeFileSync(encryptedFileFullPath, ivBuff.toString('hex') + ':' + encBuff.toString('hex'));
  return md5FileSync(encryptedFileFullPath);
}

module.exports = decrypt; // default operation
module.exports.encrypt = encrypt;
