var express = require('express'), 
    socketIo = require('socket.io'), 
    http = require('http'),

    compare2NotesLists = require('./compare2NotesLists'),
    randomStringGenerator = require('./randomStringGenerator'), 
    logger = require('./logger'),
    generateNotesStream = require('./generateNotesStream');

var expressApp = express().listen(80), 
    ioApp = socketIo(expressApp);

expressApp.use(express.static('web'));

expressApp.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods',
                  'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers',
                  'X-Requested-With, content-type, authorization, ' + 
                  'accept, origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === "OPTIONS") {
        res.send(200);
    } else {
        next();	
    }
});


function generateSessionNumber() {
    return randomStringGenerator(6);
}

ioApp.on('connection', function (socket) {

    var _sessionNumber,
        _bpm,
        _keys,
        
        _notesToPlay,
        _notesPlayed;

    /* 
        Browser web app is initializing a session
        Must receive this from the front-end: 
        {
            bpm -> Beats Per Minute (Integer),
            keys -> # of keys, value ranging from 1 to 128 (Integer)
        }
    */
    socket.on('initializeSession', function (data, callbackFunction) {
        var bpm = data.bpm,
            keys = data.keys, 
            
            sessionNumber = generateSessionNumber();
        
        if (isNaN(Number(bpm)) || bpm < 1) {
            callbackFunction(new Error("BPM must be a positive, " + 
                                       "non-zero number."));
            logger.log("BPM must be a positive, non-zero number.");
            return;
        }
        if (isNaN(Number(keys)) || keys < 1 || keys > 128) {
            callbackFunction(new Error("Keys must be a positive, " + 
                                       "non-zero number between 1 " + 
                                       "and 128."));
            logger.log("Keys must be a positive, non-zero number " + 
                       "between 1 and 128.");
            return;
        }
        
        socket.join(sessionNumber);
        
        _sessionNumber = sessionNumber;
        _bpm = bpm;
        _keys = keys;
        callbackFunction({
            sessionNumber: _sessionNumber
        });
    });
    
    /*
        Browser web app is requesting a stream of notes
        Must receive this from the front-end:
        {
            duration -> # of minutes that denote the length 
                of music to provide as practice for the user. (Integer)
        }
    */
    socket.on('requestNotesStream', function (data, callbackFunction) {
        // Interval of Music Stream (in minutes)
        var duration = data.duration;
        
        // Make sure that parameters of request are valid
        if (_sessionNumber === undefined || _sessionNumber === null) {
            callbackFunction(new Error("Session not initialized. Error."));
            logger.log("Session not initialized. Error.");
            return;
        }
        if (isNaN(Number(duration)) || 
            duration < 1) {
            callbackFunction(new Error("Positive, non-zero music " + 
                                       "stream duration (in minutes) " + 
                                       "required."));
            logger.log("Positive, non-zero music stream duration " + 
                       "(in minutes) required.");
            return;
        }
        
        // Low and High limit for pitches of notes 
        var pitchRange = (function () {
                var leftoverOffset = (128 - _keys) / 2;
                return {
                    low: Math.ceil(leftoverOffset),
                    high: Math.floor(_keys + leftoverOffset)
                };
            }()),
            
            notesStream = generateNotesStream({
                pitch: pitchRange, 
                bpm: _bpm, 
                duration: duration
            });
        
        _notesToPlay = notesStream;
        
        callbackFunction(notesStream);
        
        socket
            .broadcast
            .to(_sessionNumber)
            .emit('responseNotesStream', notesStream);
    });
    
    /*
        Browser web app is requesting to provide a stream of notes
        Must receive this from the front-end:
        [{
            start (Float),
            pitch (Integer),
            duration (Float)
        }]
    */
    socket.on('provideNotesStream', function (data, callbackFunction) {
        if (_notesToPlay === undefined || _notesToPlay === null) {
            callbackFunction(new Error("requestNotesStream hasn't been " + 
                                       "called. Error."));
            logger.log("requestNotesStream hasn't been called. Error");
            return;
        }
        
        // Make sure that parameters of request are valid
        if ([].constructor === Array) {
            callbackFunction(new Error("You must provide an Array " + 
                                       "of Objects"));
            logger.log("You must provide an Array of Objects");
            return;
        }
        var listFormattedCorrectly = 
            data.reduce(function (previousValue, currentValue) {
                if (previousValue === false) {
                    return false;
                }

                if (data.hasOwnProperty('start') && 
                    data.hasOwnProperty('pitch') && 
                    data.hasOwnProperty('duration')) {
                    return true;
                }
            }, true);
        if (!listFormattedCorrectly) {
            callbackFunction(new Error("You must provide a correctly " +
                                       "formatted Array of Objects"));
            logger.log("You must provide a correctly formatted " + 
                       "Array of Objects");
            return;
        }
        
        _notesPlayed.concat(data);
        
        var analysis = compare2NotesLists(_notesToPlay, data, _bpm);
        
        callbackFunction(analysis);
        logger.log(JSON.stringify(analysis));
    });
    
    
    /* 
        Browser web app is requesting its session to be merged to 
        another session.
    */
    socket.on('joinSession', function (data, callbackFunction) {
        var sessionNumber = data.sessionNumber;
        
        // Make sure that parameters of request are valid
        if (sessionNumber === undefined || sessionNumber === null || 
            String(sessionNumber).length !== 6) {
            callbackFunction(new Error("Session ID is invalid."));
            logger.log(new Error("Session ID is invalid."));
            return;
        }
        
        socket.join(sessionNumber);
        _sessionNumber = sessionNumber;
        
        callbackFunction(sessionNumber);
    });
    
    /*
        Browser web app is requesting to leave a session
    */
    socket.on('leaveSession', function (data, callbackFunction) {
        
        // Make sure that the state of the app is correct
        if (_sessionNumber === undefined || _sessionNumber === null) {
            callbackFunction(new Error("You are not in a session."));
            logger.log(new Error("You are not in a session."));
            return;
        }
        
        socket.leave(_sessionNumber);
        _sessionNumber = generateSessionNumber();
        
        callbackFunction(_sessionNumber);
    });

});