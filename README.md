luster-log-file [![NPM version][npm-image]][npm-link]
===============

[![Dependency status][deps-image]][deps-link]
[![devDependency status][devdeps-image]][devdeps-link]
[![peerDependency status][peerdeps-image]][peerdeps-link]

Stream all output from luster master and workers to files.

## Usage

Install extension module to application:

```console
$ npm install --save luster-log-file
```

Add `"luster-log-file"` to `"extensions"` section in the luster configuration:

```javascript
module.exports = {
    // ...

    extensions : {
        "luster-log-file" : {
            // override `console.log`, `.warn`, `.info` and `.error` methods
            // to add severity marks to output
            extendConsole : true,

            // logs files, both optional
            //   {string} fileName – stream output to file
            //   true – don't redirect output, keep as is
            //   false – shut down output
            stdout : "/var/run/luster/myapp/output.log",
            stderr : "/var/run/luster/myapp/errors.log"
        }
    }
};
```

Have fun! Use `console` logging methods or write to `process.stdout`, no workers code modification required.
[npm-image]: https://img.shields.io/npm/v/luster-log-file.svg?style=flat
[npm-link]: https://npmjs.org/package/luster-log-file
[deps-image]: https://img.shields.io/david/nodules/luster-log-file.svg?style=flat
[deps-link]: https://david-dm.org/nodules/luster-log-file
[devdeps-image]: https://img.shields.io/david/dev/nodules/luster-log-file.svg?style=flat
[devdeps-link]: https://david-dm.org/nodules/luster-log-file#info=peerDependencies
[peerdeps-image]: https://img.shields.io/david/peer/nodules/luster-log-file.svg?style=flat
[peerdeps-link]: https://david-dm.org/nodules/luster-log-file#info=peerDependencies
