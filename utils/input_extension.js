/**
 * Adds special event listeners to HTMLElement to provide supscriptors and subscriptors insertion
 * 
 * @param {HTMLDivElement} htmlElement
 * @param {Function} enterAction 
 */
export function assignInput(htmlElement, enterAction) {
    function onInput(e) {
        const key = e.key

        if (key === "_") {
            e.preventDefault()
            
            wrapSelection("sub")
        }
        else if (key === "^") {
            e.preventDefault()

            wrapSelection("sup")
        }
        else if (key === "Enter") {
            e.preventDefault()
            e.stopPropagation()

            enterAction()
        }
    }

    htmlElement.addEventListener("keydown", onInput)
}

function wrapSelection(tag) {
    const sel = window.getSelection()
    if (!sel.rangeCount) return

    const range = sel.getRangeAt(0)
    const parent = sel.anchorNode.parentElement

    if (parent && parent.tagName.toLowerCase() === tag) {
        const frag = document.createDocumentFragment()

        while (parent.firstChild) frag.appendChild(parent.firstChild)

        parent.replaceWith(frag)

        return
    }

    const el = document.createElement(tag)
    range.surroundContents(el)

    const spacer = document.createTextNode(" ")
    el.after(spacer)

    range.setStartAfter(spacer)
    range.setEndAfter(spacer)
    sel.removeAllRanges()
    sel.addRange(range)
}