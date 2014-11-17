var util = require('util'),
    Transform = require('stream').Transform,
    StringDecoder = require('string_decoder').StringDecoder;

/**
 * @constructor
 * @class TimestampStream
 * @augments Transform
 * @param {Object} options
 */
function TimestampStream(options) {
    if ( ! (this instanceof TimestampStream)) {
        return new TimestampStream(options);
    }

    Transform.call(this, options);

    this._decoder = new StringDecoder('utf8');
}

util.inherits(TimestampStream, Transform);

/**
 * Add timestamp in the line start
 * @param {String} line
 * @returns {string}
 * @private
 */
TimestampStream.prototype._timestamp = function(line) {
    var d = new Date(),
        month = d.getMonth() + 1,
        date = d.getDate(),
        h = d.getHours(),
        m = d.getMinutes(),
        s = d.getSeconds(),
        ms = d.getMilliseconds();

    return d.getFullYear() + '-' +
        (month > 9 ? month : '0' + month) + '-' +
        (date > 9 ? date : '0' + date) + ' ' +
        (h > 9 ? h : '0' + h) + ':' +
        (m > 9 ? m : '0' + m) + ':' +
        (s > 9 ? s : '0' + s) + '.' +
        (ms > 99 ? ms : '0' + (ms > 9 ? ms : '0' + ms)) +
        ' ' + line + '\n';
};

/**
 * implements Transform#_transform
 * @param {Buffer} chunk
 * @param {String} encoding
 * @param {Function} cb
 * @private
 */
TimestampStream.prototype._transform = function(chunk, encoding, cb) {
    var lines = this._decoder.write(chunk).split('\n');

    lines.forEach(function(line, idx) {
        if ( ! (idx === lines.length - 1 && line === '')) {
            this.push(this._timestamp(line));
        }
    }, this);

    cb();
};

/**
 * write rest of decoded chunk on stream flush
 * @param {Function} cb
 * @private
 */
TimestampStream.prototype._flush = function(cb) {
    this.push(this._decoder.end());
    cb();
};

module.exports = TimestampStream;
