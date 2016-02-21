var express = require('express'), 
    socketIo = require('socket.io'), 
    http = require('http'),

    randomStringGenerator = require('./randomStringGenerator'), 
    logger = require('./logger');

var expressApp = express(), 
    ioApp = socketIo(expressApp.listen(80));


ioApp.on('connection', function (socket) {

    var _sessionNumber,
        _bpm,
        _keys;
    
    socket.join(_sessionNumber);

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
            keys = data.keys;
        
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
        
        _sessionNumber = randomStringGenerator(5);
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
        var musicStreamDuration = data.duration;
        
        // Make sure that parameters of request are valid
        if (_sessionNumber === undefined) {
            callbackFunction(new Error("Session not inialized. Error."));
            logger.log("Session not initialized. Error.");
            return;
        }
        if (isNaN(Number(musicStreamDuration)) || 
            musicStreamDuration < 1) {
            callbackFunction(new Error("Positive, non-zero music " + 
                                       "stream duration (in minutes) " + 
                                       "required."));
            logger.log("Positive, non-zero music stream duration " + 
                       "(in minutes) required.");
            return;
        }
        
        // Minimum amount of beats to generate for Music Stream
        var minimumBeatsToGenerate = _bpm * musicStreamDuration, 
            // Low and High limit for pitches of notes 
            pitchRange = (function () {
                var leftoverOffset = (128 - _keys) / 2;
                return {
                    low: leftoverOffset,
                    high: _keys + leftoverOffset
                };
            }());
        
        
        ioApp.to(_sessionNumber);
    });

});