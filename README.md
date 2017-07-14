# dotenvenc

  Encrypt and decrypt your .env so it doesn't expose sensitive information (passwords, tokens etc.)

## Usage

You have a `.env` file in your project and are using it with a package like [`dotenv`](https://www.npmjs.com/package/dotenv)
to expose its contents as environment variables.
But this your `.env` contains sensitive information (passwords, tokens etc.) in clear-text so you don't want to place it in
your versioned code. Using `dotenvenc` you generate from `.env` an encrypted version `.env.enc` and only share
this in your project.

Tip: add `.env` in your `.gitignore`.

## Installation

Install and save as a local dependency in your project:
```
npm i -S dotenvenc
```

## Encryption

Generate the encrypted `.env.enc` from the clear-text `.env` (for this file's format, consult the [`dotenv`](https://www.npmjs.com/package/dotenv) docs)
using the installed command line script `dotenvenc`:

```
$ <PROJECT_PATH>/node_modules/.bin/dotenvenc myPassword
```
or equivalently with an explicit '-e' argument:
```
$ <PROJECT_PATH>/node_modules/.bin/dotenvenc -e myPassword
```

You need to do this once in the beginning or when you make changes to your `.env`.

This script will search for the `.env` in the folder where you execute the command and will move up till it either finds it
or till it reaches the app's root folder (app's root is considered to be the folder that contains a `package.json`).

## Decryption

Once you have created the `.env.enc` (by default will be stored in same folder where `.env` was found), you need to
regenerate the clear-text `.env` so you can use the password, tokens etc.

There are two ways to do this.

### Javascript code

From inside your project you regenerate the `.env` and, combined with `dotenv`, create from it the corresponding environment variables to use in your code.
```
require('dotenvenc')('myPassword'); // will only regenerate `.env`; it will not create any environment variables from it
require('dotenv').config(); // this will read the generated `.env` and populate process.env.* accordingly
```

### Command line

Using the aforementioned script with the `-d` flag:
```
$ <PROJECT_PATH>/node_modules/.bin/dotenvenc -d myPassword
```

This can be useful if you corrupt your `.env` (remember that `.env` is an unversioned file). This way you can recreate it to its last
functioning state from your `.env.enc` unless you corrupted that one too by running the `Encryption` step above on the corrupted `.env`.

NOTE: this only regenerates the `.env` from the encrypted `.env.enc` file (no environment variables are created from its contents).

## Inspired by

* [Keeping passwords in source control](http://ejohn.org/blog/keeping-passwords-in-source-control/)
* [envenc](https://www.npmjs.com/package/envenc)
