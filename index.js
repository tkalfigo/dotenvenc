let crypto = require('crypto'),
  path = require('path'),
  md5FileSync = require('md5-file').sync,
  statSync = require('fs').statSync,
  readFile = require('fs').readFileSync,
  writeFile = require('fs').writeFileSync,
  algor = 'aes-256-ctr';

const ENCRYPTED_FILENAME = '.env.enc',
  DECRYPTED_FILENAME = '.env';

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
 * @param     {String}    passwd      the key used to encrypt the .env into .env.enc we'll use now for decrpypting
 * @returns   {String}                writes the decrypted file to disk at same location where the decrypted file was found and returns its md5 checksum
 */
function decrypt(passwd) {
  let decipher = crypto.createDecipher(algor, passwd),
    encryptedFileLocation = findFileLocation(ENCRYPTED_FILENAME),
    encryptedFileFullPath = encryptedFileLocation + ENCRYPTED_FILENAME,
    decryptedFileFullPath = encryptedFileLocation + DECRYPTED_FILENAME, // we write decrypted file at same location as where we found encrypted file
    decBuff;
  if (!passwd) {
    throw new Error('decryption requires a password');
  }
  decBuff = Buffer.concat([decipher.update(readFile(encryptedFileFullPath)), decipher.final()]);
  writeFile(decryptedFileFullPath, decBuff);
  return md5FileSync(decryptedFileFullPath);
}

/**
 * Write to disk encrypted file (.env.enc) from decrypted file (.env)
 * @param     {String}    passwd      the key used to encrypt the .env into .env.enc
 * @returns   {String}                writes the encrypted file to disk at same location where the encrypted file was found and returns its md5 checksum
 */
function encrypt(passwd) {
  let cipher = crypto.createCipher(algor, passwd),
    decryptedFileLocation = findFileLocation(DECRYPTED_FILENAME),
    decryptedFileFullPath = decryptedFileLocation + DECRYPTED_FILENAME,
    encryptedFileFullPath = decryptedFileLocation + ENCRYPTED_FILENAME, // we write encrypted file at same location as where we found decrypted file
    encBuff;
  if (!passwd) {
    throw new Error('encryption requires a password');
  }
  encBuff = Buffer.concat([cipher.update(readFile(decryptedFileFullPath)), cipher.final()]);
  writeFile(encryptedFileFullPath, encBuff);
  return md5FileSync(encryptedFileFullPath);
}

module.exports = decrypt;
module.exports.encrypt = encrypt;
