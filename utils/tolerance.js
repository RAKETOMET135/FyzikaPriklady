/**
 * Checks if the checkNumber is in tolerance to targetNumber
 * 
 * @param {number} checkNumber - Number to check
 * @param {number} targetNumber - Correct number
 * @param {number} tolerance - Digits not tolerated (1 -> the first digit has to be the same)
 * 
 * @returns {boolean} - True if number is in tolerance
 */
export function checkNumberTolerance(checkNumber, targetNumber, tolerance) {
    if (!checkLenght(checkNumber, targetNumber))

    checkNumber = getRealDigitsFromNumber(checkNumber)
    targetNumber = getRealDigitsFromNumber(targetNumber)

    checkNumber = getMantissaAsInteger(checkNumber)
    targetNumber = getMantissaAsInteger(targetNumber)

    let checkTolerance = Math.floor(checkNumber).toString().length
    let targetTolerance = Math.floor(targetNumber).toString().length

    let checkNumberMulti = checkNumber * Math.pow(10, tolerance - checkTolerance)
    let targetNumberMulti = targetNumber * Math.pow(10, tolerance - targetTolerance)

    checkNumberMulti = Math.floor(checkNumberMulti)
    targetNumberMulti = Math.floor(targetNumberMulti)

    return checkNumberMulti === targetNumberMulti
}

function checkLenght(num0, num1) {
    let num0String = num0.toString()
    let num1String = num1.toString()

    console.log(num0String, num1String)
    

    let isValid = false

    for (let i = 0; i < num0String.length; i++) {
        const letter0 = num0String.slice(i, i + 1)

        if (i < num1String.length) {
            const letter1 = num1String.slice(i, i + 1)

            if (letter0 === "." || letter1 === "." || letter0 === "e" || letter1 === "e") {
                if (letter0 === letter1) {
                    isValid = true
                }

                break
            }
        }
        else {
            break
        }
    }

    return isValid
}

function getMantissaAsInteger(num) {
    let [mantissa] = num.toExponential().split("e")

    return Number(mantissa.replace(".", ""))
}

function getRealDigitsFromNumber(number) {
    return parseFloat(number.toPrecision(10))
}