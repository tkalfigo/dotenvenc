# dotenvenc

Encrypt and decrypt your .env so it doesn't expose sensitive information (passwords, tokens etc.)

## Use case

You have a `.env` file in your project (usually at the app's root folder) and are using it with a package
like [`dotenv`](https://www.npmjs.com/package/dotenv) to expose its contents as environment variables in your app.
But your `.env` contains sensitive information (passwords, tokens etc.) in clear-text so you don't want to place it in
your versioned code. Using `dotenvenc` you generate from `.env` an encrypted version `.env.enc` and only share
this in your project. In your code you regenerate `.env` from `.env.enc` at runtime when you need to access the sensitive data.

NOTE: this package is meaningful only if used in combination with a package like [`dotenv`](https://www.npmjs.com/package/dotenv) 
which actually creates the environment variables found in the generated decrypted `.env` file.

TIP: add `.env` in your `.gitignore` so it's guaranteed to never get versioned.

## Installation

Install and save as a local dependency in your project:
```bash
npm i dotenvenc
```

## Encryption

### Step 1

Generate the encrypted `.env.enc` from the clear-text `.env` (for this file's format, consult the [`dotenv`](https://www.npmjs.com/package/dotenv) docs)
using the installed command line script `dotenvenc`:

```bash
<PROJECT_PATH>/node_modules/.bin/dotenvenc -e myPassword
```

Also you can define custom pathnames for both the input and output file of the encryption or decryption operation.

For example to create encrypt a custom clear-text file `/somewhere/.env.custom` into custom encrypted file `./somewhere/else/.env.enc.custom`:

```bash
<PROJECT_PATH>/node_modules/.bin/dotenvenc -e -i /somewhere/.env.custom -o ./somewhere/else/.env.enc.custom myPassword
```

You need to do this once in the beginning or when you make changes to your `.env`.

If `-i` and `-o` are ommitted, the defaults are:

   * `./.env` for the unencrypted file used as input for the encryption or as output for the decryption
   * `./.env.enc` for the encrypted file used as output for the encryption or as input for the decryption

NOTE: If you have npm@5.2.0 or better, then you have in your path also [npx](https://www.npmjs.com/package/npx), so the above command is simply:
```bash
npx dotenvenc ...
```

#### Step 2

Save the key `myPassword` as environment variable in your `.bashrc` or `.bash_profile`:
```bash
export DOTENVENC_KEY='myPassword';
```

You can choose any name for this variable.

## Decryption

Once you have created the `.env.enc` you need to regenerate the clear-text `.env` at runtime to access the password, tokens etc.

Assuming your `.env` with the sensitive data is:
```
DB_PASS='mySupercalifragilisticexpialidociousPassword'
CHASTITY_KEY='youShallNotPass'
```
and you have generated `.env.enc` with the key `myPassword` which you saved in environment variale `DOTENVENC_KEY` (see `Ecryption` above), there are two ways to do this.

### Option 1: Javascript code

```javascript
require('dotenvenc').decrypt({ passwd: process.env.DOTENVENC_KEY});
require('dotenv').config();
// From here on you have access the passwords through process.env.DB_PASS and process.env.CHASTITIY_KEY
```

Or if you used custom encrypted and decrypted pathnames e.g. `./somewhere/.env.enc.custom` and `./somewhere/else/.env.custom` respectively, then:

```javascript
require('dotenvenc').decrypt({ passwd: process.env.DOTENVENC_KEY, encryptedPathname: './somewhere/.env.enc.custom', decryptedPathname: './somewhere/else/.env.custom'});
require('dotenv').config();
// From here on you have access the passwords through process.env.DB_PASS and process.env.CHASTITIY_KEY
```

### Option 2: Command line

Using the script mentioned earlier with the `-d` flag:
```bash
<PROJECT_PATH>/node_modules/.bin/dotenvenc -d myPassword
```

Or if you used custom encrypted and decrypted pathnames e.g. `./somewhere/.env.enc.custom` and `./somewhere/else/.env.custom` respectively, then:

```bash
<PROJECT_PATH>/node_modules/.bin/dotenvenc -d  -i ./somewhere/.env.enc.custom -o ./somewhere/else/.env.custom myPassword
```

This can be useful if you corrupt your `.env` (remember that `.env` is an unversioned file). With the `dotenvenc` script
you can recreate it to its last functioning state from your `.env.enc` unless you corrupted that one too by running
the `Encryption` step above on the corrupted `.env` (then you're done!)

NOTE: this only regenerates the `.env` from the encrypted `.env.enc` file (no environment variables are created from its contents).

## Testing

There are two sample files used for the tests.

File `.env.sample` with contents:

```
FOO=bar
```

and its encrypted counterpart `.env.enc.sample`.

To run the tests:

```bash
npm t
```

## Inspired by

* [Keeping passwords in source control](http://ejohn.org/blog/keeping-passwords-in-source-control/)
* [envenc](https://www.npmjs.com/package/envenc)
