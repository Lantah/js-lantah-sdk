js-lantah-sdk is a Javascript library for communicating with a
[Lantah Orbitr server](https://github.com/lantah/go/tree/master/services/orbitr).
It is used for building Stellar apps either on Node.js or in the browser.

It provides:

- a networking layer API for Orbitr endpoints.
- facilities for building and signing transactions, for communicating with a
  Lantah Orbitr instance, and for submitting transactions or querying network
  history.

### lantah-sdk vs lantah-base

lantah-sdk is a high-level library that serves as client-side API for Orbitr.
[lantah-base](https://github.com/lantah/js-lantah-base) is lower-level
library for creating Lantah primitive constructs via XDR helpers and wrappers.

**Most people will want lantah-sdk instead of lantah-base.** You should only
use lantah-base if you know what you're doing!

If you add `lantah-sdk` to a project, **do not add `lantah-base`!** Mis-matching
versions could cause weird, hard-to-find bugs. `lantah-sdk` automatically
installs `lantah-base` and exposes all of its exports in case you need them.

> **Important!** The Node.js version of the `lantah-base` (`lantah-sdk` dependency) package
> uses the [`sodium-native`](https://www.npmjs.com/package/sodium-native) package as
> an [optional dependency](https://docs.npmjs.com/files/package.json#optionaldependencies). `sodium-native` is
> a low level binding to [libsodium](https://github.com/jedisct1/libsodium),
> (an implementation of [Ed25519](https://ed25519.cr.yp.to/) signatures).
> If installation of `sodium-native` fails, or it is unavailable, `lantah-base` (and `lantah-sdk`) will
> fallback to using the [`tweetnacl`](https://www.npmjs.com/package/tweetnacl) package implementation.
>
> If you are using `lantah-sdk`/`lantah-base` in a browser you can ignore
> this. However, for production backend deployments you should be
> using `sodium-native`. If `sodium-native` is successfully installed and working the
> `LantahSdk.FastSigning` variable will return `true`.


## Install

### To use as a module in a Node.js project

1. Install it using npm:

```shell
npm install --save lantah-sdk
```

2. require/import it in your JavaScript:

```js
var LantahSdk = require('lantah-sdk');
```

### To self host for use in the browser

1. Install it using [bower](http://bower.io):

```shell
bower install lantah-sdk
```

2. Include it in the browser:

```html
<script src="./bower_components/lantah-sdk/lantah-sdk.js"></script>
<script>
  console.log(LantahSdk);
</script>
```

### To develop and test js-lantah-sdk itself

1. Clone the repo:

```shell
git clone https://github.com/lantah/js-lantah-sdk.git
```

2. Install dependencies inside js-lantah-sdk folder:

```shell
cd js-lantah-sdk
npm install
```

3. Install Node 16

Because we support the oldest maintenance version of Node, please install and develop on Node 16 so you don't get surprised when your code works locally but breaks in CI.

Here's how to install `nvm` if you haven't: https://github.com/creationix/nvm

```shell
nvm install

# if you've never installed 16 before you'll want to re-install yarn
npm install -g yarn
```

If you work on several projects that use different Node versions, you might it
helpful to install this automatic version manager:
https://github.com/wbyoung/avn

4. Observe the project's code style

While you're making changes, make sure to run the linter-watcher to catch any
   linting errors (in addition to making sure your text editor supports ESLint)

```shell
node_modules/.bin/gulp watch
```


## Usage

For information on how to use js-lantah-sdk, take a look at [the
documentation](https://stellar.github.io/js-stellar-sdk/), or [the
examples](https://github.com/lantah/js-lantah-sdk/tree/master/docs/reference).

There is also Horizon REST API Documentation
[here](https://developers.stellar.org/api/introduction/).

### Usage with React-Native

1. Install `yarn add --dev rn-nodeify`
2. Add the following postinstall script:
```
yarn rn-nodeify --install url,events,https,http,util,stream,crypto,vm,buffer --hack --yarn
```
3. Uncomment `require('crypto')` on shim.js
4. `react-native link react-native-randombytes`
5. Create file `rn-cli.config.js`
```
module.exports = {
  resolver: {
    extraNodeModules: require("node-libs-react-native"),
  },
};
```
6. Add `import "./shim";` to the top of `index.js`
7. `yarn add lantah-sdk`

#### Using in an Expo managed workflow

1. Install `yarn add --dev rn-nodeify`
2. Add the following postinstall script:
```
yarn rn-nodeify --install process,url,events,https,http,util,stream,crypto,vm,buffer --hack --yarn
```
3. Add `import "./shim";` to the your app's entry point (by default `./App.js`)
4. `yarn add lantah-sdk`
5. `expo install expo-random`

At this point, the Lantah SDK will work, except that `LantahSdk.Keypair.random()` will throw an error. To work around this, you can create your own method to generate a random keypair like this:

```javascript
import * as Random from 'expo-random';
import LantahSdk from 'lantah-sdk';

const generateRandomKeypair = () => {
  const randomBytes = Random.getRandomBytes(32);

  return LantahSdk.Keypair.fromRawEd25519Seed(Buffer.from(randomBytes));
};
```

## Testing

To run all tests:

```shell
yarn test
```

To run a specific set of tests:

```shell
yarn test:node
yarn test:browser
```

To generate and check the documentation site:

```shell
# install the `serve` command if you don't have it already
npm install -g serve

# generate the docs files
yarn docs

# get these files working in a browser
cd jsdoc && serve .

# you'll be able to browse the docs at http://localhost:5000
```

## Documentation

Documentation for this repo lives in
[Developers site](https://github.com/lantah/js-lantah-sdk/blob/master/docs/reference/readme.md).

## Contributing

For information on how to contribute, please refer to our
[contribution guide](https://github.com/lantah/js-lantah-sdk/blob/master/CONTRIBUTING.md).

## Publishing to npm

```
npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease]
```

A new version will be published to npm **and** Bower by GitHub actions.

npm >= 2.13.0 required. Read more about
[npm version](https://docs.npmjs.com/cli/version).

## License

js-lantah-sdk is licensed under an Apache-2.0 license. See the
[LICENSE](https://github.com/lantah/js-lantah-sdk/blob/master/LICENSE) file
for details.
