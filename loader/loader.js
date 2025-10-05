/**
 * Loads a file on filePath and calls callbackFunction with data formatted from json
 * 
 * @param {string} filePath - path to file (relative or absolute)
 * @param {Function} callbackFunction - function to call after data load
 */
export function loadJSONFile(filePath, callbackFunction) {
    fetch(filePath)
        .then(response => {
            return response.json()
        })
        .then(jsonData => {
            callbackFunction(jsonData)
        })
}