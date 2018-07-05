var path = require('path'),
    util = require('util'),
    StringDecoder = require('string_decoder').StringDecoder,
    mkdirp = require('mkdirp'),
    LogStream = require('./log_stream'),
    TimestampStream = require('./timestamp_stream'),
    extension = {},

    /**
     * IO streams used by extension
     * @const
     * @type {String[]}
     * @private
     */
    IO_STREAMS = [ 'stderr', 'stdout'],

    /**
     * @const
     * @type {Object}
     * @private
     */
    CONSOLE_METHODS = {
        log : 'DEBUG',
        error : 'ERROR',
        warn : 'WARNING',
        info : 'INFO'
    };

/**
 * @param {String} marker
 * @param {WritableStream} stream
 * @returns {Function} (Buffer chunk) Split chunk to lines and
 *      add prepend each line with `marker`.
 */
extension.createWriter = function(marker, stream) {
    var decoder = new StringDecoder('utf8');

    return function(chunk) {
        stream.write(
            decoder.write(chunk)
                // remove redundant \n on the last line
                .replace(/\n$/, '')
                // mark each line with worker.wid
                .replace(/^/gm, marker),
            'utf8');
    };
};

/**
 * @param {String} streamName process stream to handle ("stderr" or "stdout")
 * @param {WritableStream} stream to write catched data
 * @returns {Function} (Worker worker)
 */
extension.createWorkerStreamHandler = function(streamName, stream) {
    var self = this;

    return function(worker) {
        worker.process[streamName].on('data',
            self.createWriter('[work:' + worker.wid + '] ', stream));
    };
};

/**
 * @param {String} streamName
 */
extension.setupStdioTransform = function(streamName) {
    var self = this,
        tsStream = new TimestampStream(),
        processStream = process[streamName],
        originalWrite = processStream.write;

    tsStream.on('data', function(chunk) {
        // hack to pass-through libuv assertions
        originalWrite.call(processStream, chunk, 'utf8', function() {});
    });

    tsStream.on('error', function(error) {
        // restore original _write if custom stream broken
        processStream.write = originalWrite;

        console.error('Logger "%s" transform error', streamName);
        self.master.emit('error', error);
    });

    process[streamName].write = this.createWriter('[master] ', tsStream);

    this.master.on('worker fork', this.createWorkerStreamHandler(streamName, tsStream));
};

/**
 * @param {String} streamName process stream to handle ("stderr" or "stdout")
 * @param {String} logPath log file path
 */
extension.setupStream = function(streamName, logPath) {
    var self = this,
        fileStream,
        tsStream = new TimestampStream(),
        processStream = process[streamName],
        originalWrite = processStream.write;

    function onStreamError(error) {
        // restore original _write if custom stream broken
        processStream.write = originalWrite;

        console.error('Logger "%s" file stream error', streamName);
        self.master.emit('error', error);
    }

    mkdirp.sync(path.dirname(logPath));

    fileStream = new LogStream(logPath, { flags : 'a' });
    tsStream.pipe(fileStream);

    fileStream.on('error', onStreamError);
    tsStream.on('error', onStreamError);

    process[streamName].write = this.createWriter('[master] ', tsStream);

    this.master.on('worker fork', this.createWorkerStreamHandler(streamName, tsStream));
};

/**
 * Extend console.info, .warn and .error methods
 * with log-level mark at the begin of the message.
 */
extension.extendConsole = function() {
    Object.keys(CONSOLE_METHODS).forEach(function(methodName) {
        var _method = console[methodName],
            level = CONSOLE_METHODS[methodName],
            levelMark = level.replace(/./g, '>');

        console[methodName] = function() {
            return _method.call(this,
                util.format.apply(util, arguments)
                    .replace(/^/mg, function(m, offset) {
                        return (offset ? levelMark : level) + ' ';
                    }));
        };
    });
};

/**
 * Called on Master configuration
 * @param {Master} master
 */
extension.initMaster = function(master) {
    this.master = master;

    master.setup({ silent : true });

    IO_STREAMS.forEach(function(streamName) {
        const streamConfig = this.config.get(streamName);

        if (typeof streamConfig === 'string' && streamConfig.length > 0) {
            // redirect children output to file through TimestampStream
            this.setupStream(streamName, this.config.resolve(streamName));
        } else if (streamConfig) {
            // redirect children output to master output streams through TimestampStream
            this.setupStdioTransform(streamName);
        }
    }, this);

    master.on('reopen-logs', LogStream.reopenAll);
};

/**
 * @param {Configuration} config
 * @param {Master|Worker} proc luster Master or Worker
 * @see {@link "https://github.com/nodules/luster#plugins-development"}
 */
extension.configure = function(config, proc) {
    this.config = config;

    if (this.config.get('extendConsole')) {
        this.extendConsole();
    }

    if (proc.isMaster) {
        this.initMaster(proc);
    }
};

module.exports = extension;
