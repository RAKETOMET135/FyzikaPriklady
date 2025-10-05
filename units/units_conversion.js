/**
 * Converts value from unit to target unit. Returns empty Object if conversion failes
 * 
 * @param {Array} unitSet - data for unit conversions
 * @param {string} unit - unit to convert
 * @param {number} unitValue - value to convert
 * @param {string} targetUnit - unit to convert to
 * 
 * @returns {Object} - Returns object containing targetUnit as 'unit' and converted value as 'value' 
 */
export function getConvertedUnits(unitSet, unit, unitValue, targetUnit) {
    const unitData = getUnitData(unitSet, unit)

    if (!unitData) {
        return createUnitObject()
    }

    const mainUnit = unitData.main_unit
    let mainUnitValue = unitValue

    if (unit !== mainUnit) {
        mainUnitValue = convertToMainUnit(unitData, unit, unitValue)
    }

    if (!mainUnitValue) {
        return createUnitObject()
    }

    if (targetUnit === mainUnit) {
        return createUnitObject(mainUnit, mainUnitValue)
    }

    let convertedUnitValue = convertFromMainUnit(unitData, targetUnit, mainUnitValue)

    if (!convertedUnitValue) {
        return createUnitObject()
    }

    return createUnitObject(targetUnit, convertedUnitValue)
}

function createUnitObject(unit, unitValue) {
    if (!unit || !unitValue) return {}

    const unitObject = {
        unit: unit,
        value: unitValue
    }

    return unitObject
}

function getUnitConversion(unitData, unit) {
    for (const data of unitData.units) {
        const dataUnit = data.unit

        if (dataUnit !== unit) continue

        const dataConversion = data.conversion

        return dataConversion
    }

    return null
}

function convertToMainUnit(unitData, unit, unitValue) {
    const unitConversion = getUnitConversion(unitData, unit)

    if (!unitConversion) return null

    const conversionType = unitConversion.slice(0, 1)
    const conversionNumberString = unitConversion.slice(1, unitConversion.length)
    const conversionNumber = parseFloat(conversionNumberString)

    if (!conversionNumber) return null

    let newUnitValue = null

    switch (conversionType) {
        case "*":
            newUnitValue = unitValue / conversionNumberString

            break
        case "/":
            newUnitValue = unitValue * conversionNumberString

            break
    }

    return newUnitValue
}

function convertFromMainUnit(unitData, targetUnit, mainUnitValue) {
    const unitConversion = getUnitConversion(unitData, targetUnit)

    if (!unitConversion) return null

    const conversionType = unitConversion.slice(0, 1)
    const conversionNumberString = unitConversion.slice(1, unitConversion.length)
    const conversionNumber = parseFloat(conversionNumberString)

    if (!conversionNumber) return null

    let newUnitValue = null

    switch (conversionType) {
        case "*":
            newUnitValue = mainUnitValue * conversionNumberString

            break
        case "/":
            newUnitValue = mainUnitValue / conversionNumberString

            break
    }

    return newUnitValue
}

function getUnitData(unitSet, unit) {
    for (const setUnit of unitSet) {
        const mainSetUnit = setUnit.main_unit
        const otherUnits = setUnit.units

        if (mainSetUnit === unit) return setUnit

        for (const otherUnit of otherUnits) {
            const otherUnitUnit = otherUnit.unit

            if (otherUnitUnit === unit) return setUnit
        }
    }

    return null
}   