var fs = require('fs');
var util = require('util');

var logs = [];

function LogStream() {
    fs.WriteStream.apply(this, arguments);
    logs.push(this);
}
util.inherits(LogStream, fs.WriteStream);

LogStream.prototype.reopen = function() {
    this.close(this.open.bind(this));
};

LogStream.reopenAll = function() {
    logs.forEach(function(l) {
        l.reopen();
    });
};

module.exports = LogStream;
