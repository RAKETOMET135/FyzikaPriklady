/**
 * Returns a random number in range(min, max) with max being excluded.
 * 
 * @param {number} min - minimal number (included)
 * @param {number} max - maximal number (excluded)
 * 
 * @returns {number} Random number in range(min, max)
 */
export function getRandomNumber(min, max) {
    if (min >= max) {
        throw new Error("Minimal number can not be higher or equal to maximal number")
    }

    const diff = max - min
    const randomNumber = Math.floor(Math.random() * diff)

    return min + randomNumber
}