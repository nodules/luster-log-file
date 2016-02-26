var fs = require('fs');
var util = require('util');

var logs = [];

function LogStream() {
    fs.WriteStream.apply(this, arguments);
    logs.push(this);
}
util.inherits(LogStream, fs.WriteStream);

LogStream.prototype.reopenSync = function() {
    fs.closeSync(this.fd);
    this.fd = fs.openSync(this.path, this.flags, this.mode);
};

LogStream.reopenAll = function() {
    logs.forEach(function(l) {
        l.reopenSync();
    });
};

module.exports = LogStream;
