// Log levels: quiet, verbose
var logLevel = 'verbose';

function setLoggerLevel(level) {
    if (logLevel !== 'verbose' || logLevel !== 'quiet') {
        throw new Error("Invalid logger level");
    }
    
    logLevel = level;
}

function log(message) {
    if (logLevel === 'verbose') {
        console.log(message);
    }
}

exports.setLoggerLevel = setLoggerLevel;
exports.log = log;