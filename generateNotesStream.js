var objectAssign = require('object-assign');

/**
* @private
* @param {object} data - 
*   {
*       bpm,
*       pitch: {
*           low,
*           high
*       },
*       maximumNoteDuration
*   }
* @returns {object} -
*   {
*       duration,
*       pitch
*   }
*/
function _randomNote(data) {
    var bpm = data.bpm, 
        pitch = data.pitch, 
        maximumNoteDuration = data.maximumNoteDuration;

    function randomDuration() {
        // 1 for whole note, 2 for half note, 
        // 3 for quarter note, 4 for eights note
        var duration = Math.floor(Math.random() * 4) + 1;

        // whole note
        if (duration === 1) {
            return maximumNoteDuration;
        } 
        // half note
        else if (duration === 2) {
            return maximumNoteDuration / 2;
        }
        // quarter note
        else if (duration === 3) {
            return maximumNoteDuration / 4;
        }
        // eight note
        else if (duration === 4) {
            return maximumNoteDuration / 8;
        }
    }

    function randomPitch() {
        var keyRange = pitch.high - pitch.low;
        return Math.floor(Math.random() * keyRange) + 
            pitch.low;
    }

    return {
        duration: randomDuration(), 
        pitch: randomPitch()
    };
}



/**
* Generates a list of notes
* @param {object} data - 
*   {
*       bpm -> Beats Per Minute (Integer),
*       duration -> Length (in minutes) of notes to play (Integer),
*       pitch: {
*           low -> Lowest key to generate (Integer),
*           high -> Highest key to generate (Integer)
*       }
*   }
* @throws
* @return {Array} 
*   [{
*       start, 
*       duration,
*       pitch
*   }]
*/
function generateNotesStream(data) {
    if (typeof data !== "object" || 
        !("bpm" in data) || !("duration" in data) || !("pitch" in data) || 
        !("low" in data.pitch) || !("high" in data.pitch)) {
        throw new Error("Invalid generateNotesStream parameter");
    }
    
    var notesList = [], 
        i = 0,
        bpm = data.bpm,
        duration = data.duration,
        pitch = data.pitch;
    
    if (bpm < 1) {
        throw new Error("BPM must be a positive, non-zero number");
    }
    if (duration < 1) {
        throw new Error("Music duration must be at least 1 minute");
    }
        
    var numberOfNotesToGenerate = bpm * duration - 1, 
        maximumNoteDuration = 60 / bpm; // Duration of a note in seconds
    
    while (i <= numberOfNotesToGenerate) {
        var proposedStartTime = maximumNoteDuration * i, // In seconds
            randomNote = _randomNote({
                bpm: bpm,
                pitch: pitch,
                maximumNoteDuration: maximumNoteDuration
            });
        
        proposedStartTime += (maximumNoteDuration - 
                              randomNote.duration) / 2;
        
        notesList.push(objectAssign(
            randomNote,
            {start: proposedStartTime}
        ));
        i++;
    }
    
    return notesList;
}

module.exports = exports = generateNotesStream;