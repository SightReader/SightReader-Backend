// Log levels: quiet, verbose
var logLevel = 'verbose';

/**
* Sets the Logger Level
* "Verbose" is if logger is supposed to be console.log-ing
* every time the log function is called. "Quiet" is the 
* other way around
* @param {string} level - "verbose", "quiet"
* @throws
*/
function setLoggerLevel(level) {
    if (level !== 'verbose' && level !== 'quiet') {
        throw new Error("Invalid logger level");
    }
    
    logLevel = level;
}

/**
* Report a message for debugging
* @param {string} message - the message to report
*/
function log(message) {
    if (logLevel === 'verbose') {
        console.log(message);
    }
}

exports.setLoggerLevel = setLoggerLevel;
exports.log = log;