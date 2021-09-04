const ENC_PASSWD = 'myTestingEncryptionPassword';
const SAMPLE_DECRYPTED_FILE = './.env.sample';
const SAMPLE_ENCRYPTED_FILE = './.env.enc.sample';
const DEFAULT_DECRYPTED_FILE = './.env';
const CUSTOM_DECRYPTED_FILE = './.env.custom';
const DEFAULT_ENCRYPTED_FILE = './.env.enc';
const CUSTOM_ENCRYPTED_FILE = './.env.enc.custom';

const dotenvenc = require('../index');
const fs = require('fs');
const md5FileSync = require('md5-file').sync;
const expect = require('chai').expect;

function removeFile(filename) {
    try {
        fs.unlinkSync(filename);
    } catch (err) {
        // file didn't exist; ignore
    }
}

describe('encryption', () => {
    beforeEach(() => {
        // Restore decrypted files from pristine sample
        fs.writeFileSync(DEFAULT_DECRYPTED_FILE, fs.readFileSync(SAMPLE_DECRYPTED_FILE));
        fs.writeFileSync(CUSTOM_DECRYPTED_FILE, fs.readFileSync(SAMPLE_DECRYPTED_FILE));
        // Remove potentially existing encrypted files
        removeFile(DEFAULT_ENCRYPTED_FILE);
        removeFile(CUSTOM_ENCRYPTED_FILE);
    });

    afterEach(() => {
        removeFile(DEFAULT_ENCRYPTED_FILE);
        removeFile(CUSTOM_ENCRYPTED_FILE);
        removeFile(DEFAULT_DECRYPTED_FILE);
        removeFile(CUSTOM_ENCRYPTED_FILE);
    });

    it(`should encrypt default decrypted file ${DEFAULT_DECRYPTED_FILE} into default encrypted file ${DEFAULT_ENCRYPTED_FILE}`, () => {
        let encryptedFileMD5 = dotenvenc.encrypt({ passwd: ENC_PASSWD });
        expect(encryptedFileMD5).to.equal(md5FileSync(DEFAULT_ENCRYPTED_FILE));
    });

    it(`should encrypt default decrypted file ${DEFAULT_DECRYPTED_FILE} into custom encrypted file ${CUSTOM_ENCRYPTED_FILE}`, () => {
        let encryptedFileMD5 = dotenvenc.encrypt({ passwd: ENC_PASSWD, encryptedPathname: CUSTOM_ENCRYPTED_FILE });
        expect(encryptedFileMD5).to.equal(md5FileSync(CUSTOM_ENCRYPTED_FILE));
    });

    it(`should encrypt custom decrypted file ${CUSTOM_DECRYPTED_FILE} into default encrypted file ${DEFAULT_ENCRYPTED_FILE}`, () => {
        let encryptedFileMD5 = dotenvenc.encrypt({ passwd: ENC_PASSWD, decryptedPathname: CUSTOM_DECRYPTED_FILE });
        expect(encryptedFileMD5).to.equal(md5FileSync(DEFAULT_ENCRYPTED_FILE));
    });

    it(`should encrypt custom decrypted file ${CUSTOM_DECRYPTED_FILE} into custom encrypted file ${CUSTOM_ENCRYPTED_FILE}`, () => {
        let encryptedFileMD5 = dotenvenc.encrypt({ passwd: ENC_PASSWD, decryptedPathname: CUSTOM_DECRYPTED_FILE, encryptedPathname: CUSTOM_ENCRYPTED_FILE });
        expect(encryptedFileMD5).to.equal(md5FileSync(CUSTOM_ENCRYPTED_FILE));
    });
});

describe('decryption', () => {
    beforeEach(() => {
        // Restore encrypted files from pristine sample
        fs.writeFileSync(DEFAULT_ENCRYPTED_FILE, fs.readFileSync(SAMPLE_ENCRYPTED_FILE));
        fs.writeFileSync(CUSTOM_ENCRYPTED_FILE, fs.readFileSync(SAMPLE_ENCRYPTED_FILE));
        // Remove potentially already existing decrypted file
        removeFile(DEFAULT_DECRYPTED_FILE);
        removeFile(CUSTOM_DECRYPTED_FILE);
    });

    afterEach(() => {
        removeFile(DEFAULT_ENCRYPTED_FILE);
        removeFile(CUSTOM_ENCRYPTED_FILE);
        removeFile(DEFAULT_DECRYPTED_FILE);
        removeFile(CUSTOM_DECRYPTED_FILE);
    });

    it(`should decrypt default encrypted file ${DEFAULT_ENCRYPTED_FILE} into default decrypted file ${DEFAULT_DECRYPTED_FILE}`, () => {
        let decryptedFileMD5 = dotenvenc.decrypt({ passwd: ENC_PASSWD });
        expect(decryptedFileMD5).to.equal(md5FileSync(DEFAULT_DECRYPTED_FILE));
    });

    it(`should decrypt default encrypted file ${DEFAULT_ENCRYPTED_FILE} into custom decrypted file ${CUSTOM_DECRYPTED_FILE}`, () => {
        let decryptedFileMD5 = dotenvenc.decrypt({ passwd: ENC_PASSWD, decryptedPathname: CUSTOM_DECRYPTED_FILE });
        expect(decryptedFileMD5).to.equal(md5FileSync(CUSTOM_DECRYPTED_FILE));
    });

    it(`should decrypt custom encrypted file ${CUSTOM_ENCRYPTED_FILE} into default decrypted file ${DEFAULT_DECRYPTED_FILE}`, () => {
        let decryptedFileMD5 = dotenvenc.decrypt({ passwd: ENC_PASSWD, encryptedPathname: CUSTOM_ENCRYPTED_FILE });
        expect(decryptedFileMD5).to.equal(md5FileSync(DEFAULT_DECRYPTED_FILE));
    });

    it(`should decrypt custom encrypted file ${CUSTOM_ENCRYPTED_FILE} into custom decrypted file ${CUSTOM_DECRYPTED_FILE}`, () => {
        let decryptedFileMD5 = dotenvenc.decrypt({ passwd: ENC_PASSWD, encryptedPathname: CUSTOM_ENCRYPTED_FILE, decryptedPathname: CUSTOM_DECRYPTED_FILE });
        expect(decryptedFileMD5).to.equal(md5FileSync(CUSTOM_DECRYPTED_FILE));
    });
});


