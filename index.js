var express = require('express'), 
    socketIo = require('socket.io'), 
    http = require('http'),

    randomStringGenerator = require('./randomStringGenerator'), 
    logger = require('./logger');

var expressApp = express(), 
    ioApp = socketIo(expressApp.listen(80));


ioApp.on('connection', function (socket) {

    var sessionNumber,
        bpm;
    
    socket.join(sessionNumber);

    // Browser web app is initializing a session
    socket.on('initializeSession', function (data, callbackFunction) {
        sessionNumber = randomStringGenerator(5);
        bpm = data.bpm;
        callbackFunction({
            sessionNumber: sessionNumber
        });
    });

    // Browser web app is requesting a stream of notes
    socket.on('requestMusicStream', function (data, callbackFunction) {
        // Interval of Music Stream (in minutes)
        var musicStreamDuration = data.musicStreamDuration;
        
        if (sessionNumber === undefined) {
            callbackFunction(new Error("Session not inialized. Error."));
            logger.log("Session not initialized. Error.");
            return;
        }
        
        if (musicStreamDuration < 1) {
            callbackFunction(new Error("Positive, non-zero music " + 
                                       "stream duration (in minutes) " + 
                                       "required."));
            logger.log("Positive, non-zero music stream duration " + 
                       "(in minutes) required.");
            return;
        }
        
        // Maximum Beats to generate for Music Stream
        var maximumBeatsToGenerate = data.beatsToGenerate;
        ioApp.to(sessionNumber);
    });

});