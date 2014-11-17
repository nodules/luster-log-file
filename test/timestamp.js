/* global describe, it, before, after */
var fs = require('fs'),
    path = require('path'),
    assert = require('assert'),
    TimestampStream = require('../lib/timestamp_stream');

describe('TimestampStream', function() {
    /* jshint unused:false */
    var _Date = Date;

    before(function() {
        /* jshint ignore:start */
        Date = function() {
            return new _Date('2014-10-10T01:10:53.234Z');
        };
        Date.now = _Date.now;
        /* jshint ignore:end */
    });

    after(function() {
        /* jshint ignore:start */
        Date = _Date;
        /* jshint ignore:end */
    });

    it('should prefix each line of input with timestamp', function(done) {
        var result = '',
            tss = fs
                .createReadStream(path.resolve(__dirname, 'data/input.log'), { encoding: 'utf8' })
                .pipe(new TimestampStream());

        tss.on('data', function(chunk) {
            result += chunk;
        });

        tss.on('end', function() {
            var expected = fs.readFileSync(path.resolve(__dirname, 'data/timestamped.log'), { encoding: 'utf8' });

            assert.equal(expected, result);
            done();
        });
    });
});
