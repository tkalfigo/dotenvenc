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
<PROJECT_PATH>/node_modules/.bin/dotenvenc myPassword
```
or equivalently with the explicit '-e' flag:
```bash
<PROJECT_PATH>/node_modules/.bin/dotenvenc -e myPassword
```

Also (starting with version 2.1.0) you can define a custom filename for the encrypted file to override the default `.env`. 
For example to create custom encrypted file `.env.enc.custom`:

```bash
<PROJECT_PATH>/node_modules/.bin/dotenvenc myPassword -f .env.enc.custom
```
or equivalently with the explicit '-e' flag:
```bash
<PROJECT_PATH>/node_modules/.bin/dotenvenc -e myPassword -f .env.enc.custom
```

You need to do this once in the beginning or when you make changes to your `.env`.

This script will search for the `.env` in the folder where you execute the command and will move up till it either finds it
or till it reaches the app's root folder (app's root is considered to be the folder that contains a `package.json` and
is the location where commonly `.env` and consequently `.env.enc` are stored).

NOTE: If you have npm@5.2.0 or better, then you have in your path also [npx](https://www.npmjs.com/package/npx), so the above command is simply:
```bash
npx dotenvenc myPassword
```

#### Step 2

Save the key `myPassword` as environment variable in your `.bashrc` or `.bash_profile`:
```bash
export DOTENVENC_KEY='myPassword';
```

You can choose any name for this variable.

## Decryption

Once you have created the `.env.enc` (by default will be stored in same folder where `.env` was found), you need to regenerate the clear-text `.env` at runtime to access the password, tokens etc.

Assuming your `.env` with the sensitive data is:
```
DB_PASS='mySupercalifragilisticexpialidociousPassword'
CHASTITY_KEY='youShallNotPass'
```
and you have generated `.env.enc` with the key `myPassword` which you saved in environment variale `DOTENVENC_KEY` (see `Ecryption` above), there are two ways to do this.

### Option 1: Javascript code

```javascript
require('dotenvenc')(process.env.DOTENVENC_KEY);
require('dotenv').config();
// From here on you have access the passwords through process.env.DB_PASS and process.env.CHASTITIY_KEY
```

Or if you used a custom encrypted filename e.g. `.env.enc.custom`:

```javascript
require('dotenvenc')(process.env.DOTENVENC_KEY, '.env.enc.custom');
require('dotenv').config();
// From here on you have access the passwords through process.env.DB_PASS and process.env.CHASTITIY_KEY
```

### Option 2: Command line

Using the script mentioned earlier with the `-d` flag:
```bash
<PROJECT_PATH>/node_modules/.bin/dotenvenc -d myPassword
```

Or if you used a custom encrypted filename e.g. `.env.enc.custom`:

```bash
<PROJECT_PATH>/node_modules/.bin/dotenvenc -d myPassword -f .env.enc.custom
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

and its encrypted counterpart file `.env.enc.custom`.

To run the tests:

```bash
npm t
```

## Inspired by

* [Keeping passwords in source control](http://ejohn.org/blog/keeping-passwords-in-source-control/)
* [envenc](https://www.npmjs.com/package/envenc)
