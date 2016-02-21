var express = require('express'), 
    socketIo = require('socket.io'), 
    http = require('http'),

    randomStringGenerator = require('./randomStringGenerator'), 
    logger = require('./logger'),
    generateNotesStream = require('./generateNotesStream');

var expressApp = express().listen(80), 
    ioApp = socketIo(expressApp);


ioApp.on('connection', function (socket) {

    var _sessionNumber,
        _bpm,
        _keys;

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
            
            sessionNumber = randomStringGenerator(5);
        
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
        if (_sessionNumber === undefined) {
            callbackFunction(new Error("Session not inialized. Error."));
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
        
        
        callbackFunction(notesStream);
        socket
            .broadcast
            .to(_sessionNumber)
            .emit('responseNotesStream', notesStream);
    });

});