const ENC_PASSWD = 'myTestingEncryptionPassword',
    DECRYPTED_FILE = './.env',
    DECRYPTED_FILE_SAMPLE = './.env.sample',
    ENCRYPTED_FILE = './.env.enc',
    ENCRYPTED_FILE_CUSTOM = './.env.enc.custom',

const dotenvenc = require('../index');
const fs = require('fs');
const md5FileSync = require('md5-file').sync;
const expect = require('chai').expect;

describe('encryption', () => {
    beforeEach(() => {
        try {
            // Reproduce .env from pristine .env.sample
            fs.writeFileSync(DECRYPTED_FILE, fs.readFileSync(DECRYPTED_FILE_SAMPLE));
            // Remove potentially already existing .env.enc
            fs.unlinkSync(ENCRYPTED_FILE);
        } catch (err) {
            // file didn't exist; ignore
        }
    });

    afterEach(() => {
        try {
            fs.unlinkSync(ENCRYPTED_FILE);
            fs.unlinkSync(DECRYPTED_FILE);
        } catch (err) {
            // file didn't exist; ignore
        }
    });

    it('should encrypt .env into valid .env.enc', () => {
        let encryptedFileMD5 = dotenvenc.encrypt(ENC_PASSWD);
        expect(encryptedFileMD5).to.equal(md5FileSync(ENCRYPTED_FILE));
    });

    it('should encrypt .env into valid .env.enc.custom', () => {
        let encryptedFileMD5 = dotenvenc.encrypt(ENC_PASSWD, ENCRYPTED_FILE_CUSTOM);
        expect(encryptedFileMD5).to.equal(md5FileSync(ENCRYPTED_FILE_CUSTOM));
    });
});

describe('decryption', () => {
    beforeEach(() => {
        try {
            // Reproduce .env.enc from pristine .env.enc.sample
            fs.writeFileSync(ENCRYPTED_FILE, fs.readFileSync(ENCRYPTED_FILE_SAMPLE));
            // Remove potentially already existing .env
            fs.unlinkSync(DECRYPTED_FILE);
        } catch (err) {
            // file didn't exist; ignore
        }
    });

    afterEach(() => {
        try {
            fs.unlinkSync(ENCRYPTED_FILE);
            fs.unlinkSync(DECRYPTED_FILE);
        } catch (err) {
            // file didn't exist; ignore
        }
    });

    it('should decrypt .env.enc into valid .env', () => {
        let decryptedFileMD5 = dotenvenc(ENC_PASSWD);
        expect(decryptedFileMD5).to.equal(md5FileSync(DECRYPTED_FILE));
    });

    it('should decrypt .env.enc.custom into valid .env', () => {
        let decryptedFileMD5 = dotenvenc(ENC_PASSWD, ENCRYPTED_FILE_CUSTOM);
        expect(decryptedFileMD5).to.equal(md5FileSync(DECRYPTED_FILE));
    });
});


