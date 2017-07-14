const ENC_PASSWD = 'myTestingEncryptionPassword',
    DECRYPTED_FILE = './.env',
    DECRYPTED_FILE_BACKUP = './.env.backup',
    ENCRYPTED_FILE = './.env.enc',
    ENCRYPTED_FILE_BACKUP = './.env.enc.backup';

let dotenvenc = require('../index'),
    fs = require('fs'),
    md5FileSync = require('md5-file').sync,
    expect = require('chai').expect;

describe('encryption', () => {
    beforeEach(() => {
        try {
            // Reproduce .env from pristine .env.backup
            fs.writeFileSync(DECRYPTED_FILE, fs.readFileSync(DECRYPTED_FILE_BACKUP));
            // Remove potentially already existing .env.enc
            fs.unlinkSync(ENCRYPTED_FILE);
        } catch (err) {
            // file didn't exist; ignore
        }
    });

    it('should encrypt .env into valid .env.enc', () => {
        let encryptedFileMD5 = dotenvenc.encrypt(ENC_PASSWD);
        expect(encryptedFileMD5).to.equal(md5FileSync(ENCRYPTED_FILE));
    });
});

describe('decryption', () => {
    beforeEach(() => {
        try {
            // Reproduce .env.enc from pristine .env.enc.backup
            fs.writeFileSync(ENCRYPTED_FILE, fs.readFileSync(ENCRYPTED_FILE_BACKUP));
            // Remove potentially already existing .env
            fs.unlinkSync(DECRYPTED_FILE);
        } catch (err) {
            // file didn't exist; ignore
        }
    });

    it('should decrypt .env.enc into valid .env', () => {
        let decryptedFileMD5 = dotenvenc(ENC_PASSWD);
        expect(decryptedFileMD5).to.equal(md5FileSync(DECRYPTED_FILE));
    });
});


