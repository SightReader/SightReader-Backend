/**
* Generate a random string of a certain length. 
* This string is alpha numeric
* @param {number} length - Length of random string to generate
* @throws
* @returns {string}
*/
function randomStringGenerator(length) {
    
    var randomString = '', 
        i = 0;
    
    if (length <= 0) {
        throw new Error("Positive non-zero length required");
    }
    
    /**
    * Helper function that generates a random char
    * @returns {string} 1-character string
    */
    function randomCharGenerator() {
        var numberOrLetter = Math.round(Math.random());
        
        // Generate a number
        if (numberOrLetter === 0) {
            return String(Math.round(Math.random() * 9));
        } 
        
        // Generate a letter
        return String.fromCharCode('a'.charCodeAt(0) + 
                                   Math.round(Math.random() * 26));
    }
    
    while (i < length) {
        randomString += randomCharGenerator();
        i++;
    }
    
    return randomString;
    
}


module.exports = exports = randomStringGenerator;