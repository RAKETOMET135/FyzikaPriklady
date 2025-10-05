import { loadJSONFile } from "./loader/loader.js"
import { getRandomNumber } from "./utils/random.js"
import { getConvertedUnits } from "./units/units_conversion.js"
import { checkNumberTolerance } from "./utils/tolerance.js"
import { assignInput } from "./utils/input_extension.js"

const exerciseQuestion = document.querySelector("#exercise-question")
const exerciseCanvas = document.querySelector("#exercise-canvas")
const exerciseAnswerLabel = document.querySelector("#exercise-answer-label")
const exerciseAnswer = document.querySelector("#exercise-answer")
const submitButton = document.querySelector("#submit-button")

const brushColorInput = document.querySelector("#brush-color")
const brushWidthInput = document.querySelector("#brush-width")

const hintButton = document.querySelector("#hint-button")
const vzorecky = document.querySelector("#vzorecky")
const vzoreckyClose = document.querySelector("#vzorecky-close")

const canvasContext = exerciseCanvas.getContext("2d")
const brushSettings = {
    stroke: "white",
    width: 5,
    cap: "round"
}
const brushState = {
    drawing: false,
    lastX: 0,
    lastY: 0
}
const undoStack = {
    content: [],
    maxUndo: 50
}
const data = {
    units: null,
    exercises: null
}
const userData = {
    exercises: [],
    incorrectExercises: [],
    correct: 0,
    incorrect: 0,
    streak: 0
}
let currentExercise = null
let submittedAnswer = false

function loadBrush() {
    canvasContext.strokeStyle = brushSettings.stroke
    canvasContext.lineWidth = brushSettings.width
    canvasContext.lineCap = brushSettings.cap
}

function getMousePosition(e) {
    const canvasRect = exerciseCanvas.getBoundingClientRect()
    const x = (e.clientX - canvasRect.left) * (exerciseCanvas.width / canvasRect.width)
    const y = (e.clientY - canvasRect.top) * (exerciseCanvas.height / canvasRect.height)
    
    return {
        x: x,
        y: y
    }
}

function canvasMouseDown(e) {
    const mousePosition = getMousePosition(e)

    brushState.drawing = true
    brushState.lastX = mousePosition.x
    brushState.lastY = mousePosition.y
    
    saveCanvasState()

    canvasContext.beginPath()
    canvasContext.moveTo(brushState.lastX, brushState.lastY)
    canvasContext.lineTo(mousePosition.x, mousePosition.y)
    canvasContext.stroke()
}

function canvasMouseMove(e) {
    if (!brushState.drawing) return

    const mousePosition = getMousePosition(e)

    canvasContext.beginPath()
    canvasContext.moveTo(brushState.lastX, brushState.lastY)
    canvasContext.lineTo(mousePosition.x, mousePosition.y)
    canvasContext.stroke()

    brushState.lastX = mousePosition.x
    brushState.lastY = mousePosition.y
}

function canvasMouseUp(e) {
    brushState.drawing = false
}

function canvasMouseOut(e) {
    brushState.drawing = false
}

function saveCanvasState() {
    if (undoStack.content.length >= undoStack.maxUndo){
        undoStack.content.shift()
    }    

    undoStack.content.push(exerciseCanvas.toDataURL())
}

function loadLastCanvasState() {
    if (undoStack.content.length === 0) return

    const imageData = new Image()
    imageData.src = undoStack.content.pop()
    imageData.onload = () => {
        canvasContext.clearRect(0, 0, exerciseCanvas.width, exerciseCanvas.height)
        canvasContext.drawImage(imageData, 0, 0)
    }
}

function getExercise() {
    if (userData.exercises.length === 0) {
        assembleUserExercises()
    }

    let randomIndex = 0
    if (userData.exercises.length === 1) {
        randomIndex = 0
    }
    else {
        randomIndex = getRandomNumber(0, userData.exercises.length)
    }

    const exercise = userData.exercises[randomIndex]

    userData.exercises.splice(randomIndex, 1)

    return exercise
}

function loadExercise() {
    const exercise = getExercise()

    currentExercise = exercise

    exerciseQuestion.innerHTML = exercise.question
    exerciseAnswerLabel.innerText = exercise.answer_text
}

function incorrectAnswer() {
    const unit = currentExercise.answer_units
    const answer = currentExercise.answer

    if (unit !== "" && typeof(answer) === "number") {
        const betterAnswer = getConvertedUnits(data.units.unit_set, unit, answer, currentExercise.main_unit)

        const str = betterAnswer.value.toString()
        let innerHTML = ""
        
        let isE = false
        let e = ""
        for (let i = 0; i < str.length; i++) {
            const letter = str.slice(i, i + 1)

            if (letter === "e") {
                isE = true

                continue
            }

            if (isE) {
                e += letter
            }
            else {
                innerHTML += letter
            }
        }

        if (e.length > 0) {
            innerHTML += " * 10<sup>" + e + "</sup>"
        }

        exerciseAnswer.innerHTML = innerHTML + " " + currentExercise.main_unit
    }
    else {
        exerciseAnswer.innerHTML = answer
    }
    
    exerciseAnswer.style.color = "red"
    exerciseAnswer.contentEditable = false
    submittedAnswer = true
}   

function correctAnswer() {
    exerciseAnswer.style.color = "green"
    exerciseAnswer.contentEditable = false
    submittedAnswer = true
}

function validateAnswer() {
    const tokenTypes = Object.freeze({
        NUMBER: "NUMBER",
        OPERATOR: "OPERATOR",
        NULL: "NULL"
    })

    function getTokens(htmlString) {
        const tokens = []

        htmlString = htmlString.replaceAll(",", ".")

        let words = []
        let buildedWord = ""
        let isTag = false
        for (let i = 0; i < htmlString.length; i++) {
            const char = htmlString.slice(i, i + 1)

            if (char === " " && !isTag) {
                if (buildedWord.length > 0) {
                    words.push(buildedWord)

                    buildedWord = ""
                }

                continue
            }
            
            if (char === "<") {
                isTag = true
            }
            else if (char === ">") {
                isTag = false
            }

            buildedWord += char
        }
        if (buildedWord.length > 0) {
            words.push(buildedWord)
        }

        let numberTokens = []
        let wordTokens = []

        for (const word of words) {
            if (parseFloat(word) || word === "0") {
                let num = ""
                let numExp = ""

                let exp = false
                for (let i = 0; i < word.length; i++) {
                    const letter = word[i]

                    if (!parseFloat(letter) && letter !== "0" && !exp && letter !== "." && letter !== "-") {
                        if (letter === "<") {
                            exp = true

                            continue
                        }

                        break
                    }

                    if (exp) {
                        if (parseFloat(letter) || letter === "0" || letter === "-") {
                            numExp += letter
                        }
                        else if (letter === ">" && numExp.length > 0) {
                            break
                        }
                    }
                    else {
                        num += letter
                    }
                }

                if (numExp) {
                    num = parseFloat(num)
                    num = Math.pow(num, parseFloat(numExp))
                    num = num.toString()
                }

                numberTokens.push(num)
            }
            else if (word === "+" || word === "-" || word === "*" || word === "/") {
                numberTokens.push(word)
            }
            else {
                break
            }
        }

        for (const word of words) {
            if (!parseFloat(word) && word !== "0") {
                wordTokens.push(word)
            }
        }

        return [numberTokens, wordTokens]
    }

    const userAnswerInput = exerciseAnswer.innerHTML

    const tokens = getTokens(userAnswerInput)

    let evalString = ""
    for (const token of tokens[0]) {
        evalString += " " + token
    }
    if (evalString.length > 0) {
        evalString = evalString.slice(1, evalString.length)
    }
    const endLetter = evalString.slice(evalString.length - 1, evalString.length)

    if (endLetter === "/" || endLetter === "*" || endLetter === "+" || endLetter === "-") {
        evalString = evalString.slice(0, evalString.length - 1)
    }
    
    let value = null

    try {
        value = eval(evalString)
    }
    catch {}

    let unit = ""
    for (const token of tokens[1]) {
        unit += token
    }
    unit = unit.replaceAll(" ", "")

    if (unit.slice(0, 1) === "*" || unit.slice(0, 1) === "/" || unit.slice(0, 1) === "+" || unit.slice(0, 1) === "-") {
        unit = unit.slice(1, unit.length)
    }

    const answerUnit = currentExercise.answer_units
    const answerValue = currentExercise.answer

    function almostEqualRelative(a, b, relTol = 0.01) {
        if (b === 222000) {
            relTol = 0.1
        }

        const diff = Math.abs(a - b)
        const maxVal = Math.max(Math.abs(a), Math.abs(b))

        return diff <= relTol * maxVal
    }

    if (answerUnit === "") {
        if (answerValue === unit) {
            correctAnswer()

            return
        }
        else if (typeof(answerValue) === "number") {
            if (almostEqualRelative(value, answerValue)) {
                correctAnswer()

                return
            }

            incorrectAnswer()

            return
        }
    }

    if (unit === "" || !value && value !== 0) {
        incorrectAnswer()

        return
    }

    const convertedUnits = getConvertedUnits(data.units.unit_set, unit, value, answerUnit)
    const convertedValue = convertedUnits.value

    if (!convertedValue && convertedValue !== 0) {
        incorrectAnswer()

        return
    }

    if (almostEqualRelative(convertedValue, answerValue)) {
        correctAnswer()

        return
    }
    
    incorrectAnswer()
}

function assembleUserExercises() {
    userData.exercises = []

    for (const exercise of data.exercises.exercises) {
        userData.exercises.push(exercise)
    }
}

function next() {
    submittedAnswer = false

    exerciseAnswer.contentEditable = true
    exerciseAnswer.innerHTML = ""
    exerciseAnswer.style.color = "white"

    canvasContext.clearRect(0, 0, exerciseCanvas.width, exerciseCanvas.height)
    undoStack.content = []

    loadExercise()
}

function keyDown(e) {
    if (e.key === "z" && e.ctrlKey) {
        e.preventDefault()
        e.stopPropagation()

        loadLastCanvasState()
    }
    else if (e.key === "Enter") {
        if (submittedAnswer) {
            next()
        }
    }
}

function onExercisesDataLoad(jsonData) {
    data.exercises = jsonData

    for (const exercise of data.exercises.exercises) {
        if (!exercise.answer_power) continue

        exercise.answer = exercise.answer * Math.pow(10, exercise.answer_power)
        exercise.answer = parseFloat(exercise.answer.toExponential(2))
    }
}

function onUnitsDataLoad(jsonData) {
    data.units = jsonData
}

function waitForDataLoad(iid) {
    if (!data.exercises || !data.units) return

    loadExercise()

    clearInterval(iid)
}

function setupData() {
    loadJSONFile("units/units.json", onUnitsDataLoad)
    loadJSONFile("exercises/test.json", onExercisesDataLoad)
}

function submit() {
    if (submittedAnswer) {
        next()
    }
    else {
        validateAnswer()
    }
}

function brushColorOnInput() {
    const value = brushColorInput.value

    if (value === "") {
        brushSettings.stroke = "white"

        loadBrush()

        return
    }

    brushSettings.stroke = value

    loadBrush()
}

function brushWidthOnInput() {
    const value = brushWidthInput.value
    const number = parseFloat(value)
    
    if (!number) {
        brushSettings.width = 5

        loadBrush()

        return
    }

    brushSettings.width = value

    loadBrush()
}

function vzoreckyState() {
    if (vzorecky.style.display === "none") {
        vzorecky.style.display = "block"
    }
    else {
        vzorecky.style.display = "none"
    }
}

function canvasTouchStart(e) {
    e.stopPropagation()
    e.preventDefault()

    const touch = e.touches[0]

    canvasMouseDown(touch)
}

function canvasTouchMove(e) {
    e.stopPropagation()
    e.preventDefault()

    const touch = e.touches[0]

    canvasMouseMove(touch)
}

function main() {
    setupData()
    loadBrush()    
    assignInput(exerciseAnswer, validateAnswer)
    
    exerciseCanvas.addEventListener("mousedown", canvasMouseDown)
    exerciseCanvas.addEventListener("mousemove", canvasMouseMove)    
    exerciseCanvas.addEventListener("mouseup", canvasMouseUp)
    exerciseCanvas.addEventListener("mouseout", canvasMouseOut)

    exerciseCanvas.addEventListener("touchstart", canvasTouchStart)
    exerciseCanvas.addEventListener("touchmove", canvasTouchMove)
    exerciseCanvas.addEventListener("touchend", canvasMouseUp)
    exerciseCanvas.addEventListener("touchcancel", canvasMouseOut)
    
    submitButton.addEventListener("click", submit)

    brushColorInput.addEventListener("input", brushColorOnInput)
    brushWidthInput.addEventListener("input", brushWidthOnInput)

    vzorecky.style.display = "none"
    hintButton.addEventListener("click", vzoreckyState)
    vzoreckyClose.addEventListener("click", vzoreckyState)

    document.addEventListener("keydown", keyDown)

    const iid = setInterval(() => { waitForDataLoad(iid) }, 100)

    let startTime = 0

    exerciseCanvas.addEventListener("touchstart", (e) => {
        if (e.touches.length >= 2) {
            startTime = new Date().getTime()
        }
    })

    exerciseCanvas.addEventListener("touchend", (e) => {
        const endTime = new Date().getTime()
        const tapDuration = endTime - startTime

        if (tapDuration > 100 && e.changedTouches.length >= 2) {
            canvasContext.clearRect(0, 0, exerciseCanvas.width, exerciseCanvas.height)
            undoStack.content = []
        }
    })
}

main()
