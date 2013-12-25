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
    var ts = (new Date(Date.now() + 1000 * 60 * 60 * 4)) // @todo <<<= it's really crazy
        .toISOString().replace('T', ' ').replace('Z', '');

    return [ ts, ' ', line, '\n' ].join('');
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