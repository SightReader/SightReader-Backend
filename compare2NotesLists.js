/**
* Compares 2 Notes Lists for their similarity
* @param {object} actualNotesList [{duration, pitch, start}]
* @param {object} userNotesList [{duration, pitch, start}]
* @param {Integer} bpm
* @throws
* @return 
*/
function compare2NotesLists(actualNotesList, userNotesList, bpm) {

    var beginningNote = userNotesList[0],
        endingNote = userNotesList[userNotesList.length - 1];

    if (userNotesList.length === 0 && actualNotesList.length !== 0) {
        return {
            similarity: 0
        };
    } 
    else if (userNotesList.length !== 0 && actualNotesList.length === 0) {
        return {
            similarity: 0
        };
    }

    var similarityScore = 0;

    function getIndexOfCorrespondingNote(noteObject, someStartIndex) {
        var stopIndex = userNotesList.length - 1;

        if (isNaN(Number(someStartIndex))) {
            return -1;
        }
        if (!isNaN(Number(someStartIndex)) && 
            Number(someStartIndex) > stopIndex) {
            return -1;
        }

        var startIndex = someStartIndex || 0, 
            middleIndex = Math.floor((stopIndex + startIndex) / 2),

            wholeNoteDuration = 60 / bpm,   // In seconds
            startTimeDifference = actualNotesList[middleIndex].start - 
            noteObject.start;               // In seconds

        while ((startTimeDifference > wholeNoteDuration || 
                startTimeDifference < -wholeNoteDuration) && 
               startIndex < stopIndex) {

            if (startTimeDifference > wholeNoteDuration) {
                startIndex = middleIndex + 1;
            }
            else if (startTimeDifference < wholeNoteDuration) {
                stopIndex = middleIndex - 1;
            }

            middleIndex = Math.floor((stopIndex + startIndex) / 2);
            startTimeDifference = actualNotesList[middleIndex].start - 
                noteObject.start;
        }

        
        if (middleIndex + 1 < actualNotesList.length && 
            actualNotesList[middleIndex + 1].pitch === noteObject.pitch) {
            if (noteObject.duration === 
                actualNotesList[middleIndex + 1].duration) {
                similarityScore += 
                    Math.round((100 / userNotesList.length * 0.5));
            } else {
                similarityScore += 
                    Math.round((100 / userNotesList.length * (0.5 * 0.5)));
            }
            
            similarityScore += 
                Math.round((100 / userNotesList.length * 0.5));
            
            return middleIndex + 1;
            
        }
        
        if (middleIndex - 1 >= 0 && 
            actualNotesList[middleIndex - 1].pitch === noteObject.pitch) {
            if (noteObject.duration === 
                actualNotesList[middleIndex - 1].duration) {
                similarityScore += 
                    Math.round((100 / userNotesList.length * 0.5));
            } else {
                similarityScore += 
                    Math.round((100 / userNotesList.length * (0.5 * 0.5)));
            }
            
            similarityScore += 
                Math.round((100 / userNotesList.length * 0.5));
            
            return middleIndex - 1;
        }
        
        if (actualNotesList[middleIndex].pitch === noteObject.pitch) {
            similarityScore += 
                Math.round((100 / userNotesList.length * 0.5));
            
            if (noteObject.duration === 
                actualNotesList[middleIndex].duration) {
                similarityScore += 
                    Math.round((100 / userNotesList.length * 0.5));
            } else {
                similarityScore += 
                    Math.round((100 / userNotesList.length * (0.5 * 0.5)));
            }
            return middleIndex;
        } 
        else {
            similarityScore += (100 / userNotesList.length * (0.5 * 0.5));
            if (noteObject.duration === 
                actualNotesList[middleIndex].duration) {
                similarityScore += 
                    Math.round((100 / userNotesList.length * 0.5));
            } else {
                similarityScore += 
                    Math.round((100 / userNotesList.length * (0.5 * 0.5)));
            }
            
            return middleIndex;
        }
    }
    
    
    for (var i = 0; i < userNotesList.length; i++) {
        getIndexOfCorrespondingNote(userNotesList[i], i);
    }
    
    return {
        similarity: similarityScore
    };

}

module.exports = exports = compare2NotesLists;