# luster-log-file

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
            stdout : "/var/run/luster/myapp/output.log",
            stderr : "/var/run/luster/myapp/errors.log"
        }
    }
};
```

Have fun! Use `console` logging methods or write to `process.stdout`, no workers code modification required.
