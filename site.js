onerror = (e) => {
    document.body.innerHTML = e.message || e.stack
}
const $ = (selector) => document.querySelector(selector)

function $$(tag, options = {}) {
    const element = options.namespaceURI
        ? document.createElementNS(options.namespaceURI, tag)
        : document.createElement(tag)
    let autoFocus, parent = document.body
    for (const name in options) {
        const value = options[name]
        switch (name) {
            case 'className':
                element.className = value
                continue
            case 'autofocus':
                autoFocus = true
                continue
            case 'innerHTML':
                element.innerHTML = value
                continue
            case 'innerText':
                element.innerText = value
                continue
            case 'namespaceURI':
                continue
            case 'parent':
                parent = value
                continue
            case 'style':
                for (const rule in value)
                    element.style[rule] = value[rule]
                continue
        }
        if (name.startsWith('on'))
            element.addEventListener(name.slice(2), value)
        else
            element.setAttribute(name, value)
    }
    parent.appendChild(element)
    if (autoFocus)
        element.focus()
    return element
}

const seed = 1 * (window.location.hash.slice(1) || new Date)
let randomizer = mulberry32(seed)
let questionNumber = 0
let score = 0
let timer
let startTime
let stats = {
    addition: { count: 0, correct: 0, time: 0 },
    subtraction: { count: 0, correct: 0, time: 0 },
    multiplication: { count: 0, correct: 0, time: 0 },
    division: { count: 0, correct: 0, time: 0 }
}
let currentOperator, num1, num2, correctAnswer
const operatorNames = {
    '+': 'addition',
    '–': 'subtraction',
    '×': 'multiplication',
    '÷': 'division'
}
const operators = ['+', '–', '×', '÷']
const maxQuestions = 15
const maxTime = 30

function mulberry32(a) {
    return function (scale) {
        let t = a += 0x6D2B79F5
        t = Math.imul(t ^ t >>> 15, t | 1)
        t ^= t + Math.imul(t ^ t >>> 7, t | 61)
        return Math.floor(((t ^ t >>> 14) >>> 0) / 4294967296 * scale)
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]
    }
}

function generateQuestion() {
    currentOperator = operators[randomizer(4)]
    do {
        num1 = randomizer(1000)
        num2 = randomizer(1000)
    } while (!isValidQuestion(currentOperator, num1, num2))
    correctAnswer = calculateAnswer(currentOperator, num1, num2)
    stats[operatorNames[currentOperator]].count++
}

function isValidQuestion(operator, a, b) {
    switch (operator) {
        case '–': return a >= b
        case '÷': return b > 0 && a % b == 0
    }
    return a * b < 1000
}

function calculateAnswer(operator, a, b) {
    if (operator === '+') return a + b
    if (operator === '–') return a - b
    if (operator === '×') return a * b
    return a / b
}

function generateOptions() {
    const options = [correctAnswer]
    while (options.length < 4) {
        const offset = Math.floor(Math.random() * 10) - 5
        if (offset == 0) continue
        let wrong
        if (currentOperator === '+')
            wrong = num1 + num2 + offset
        else if (currentOperator === '–')
            wrong = num1 - num2 + offset
        else if (currentOperator === '×')
            wrong = num1 * num2 + offset
        else
            wrong = Math.floor(num1 / num2) + offset
        if (wrong >= 0 && !options.includes(wrong))
            options.push(wrong)
    }
    shuffle(options)
    return options
}

function startTimer() {
    let timeLeft = maxTime
    startTime = Date.now()
    timer = setInterval(() => {
        timeLeft--
        const timerDisplay = $('.timer')
        if (timerDisplay)
            timerDisplay.innerText = `Answer correctly to get ${Math.max(0, timeLeft)} points`
        if (timeLeft <= 0) {
            clearInterval(timer)
            nextQuestion(false)
        }
    }, 1000)
}

function gamePhase(phase) {
    $('#intro').style.display = 'none'
    $('#loading').style.display = 'none'
    $('#summary').style.display = 'none'
    $('#game').style.display = 'none'
    $(`#${phase}`).style.display = ''
}

function checkAnswer({ target }) {
    clearInterval(timer)
    const timeTaken = (Date.now() - startTime) / 1000
    const opt = 1 * target.innerText
    const isCorrect = opt === correctAnswer
    if (isCorrect) {
        const points = Math.max(0, maxTime - Math.floor(timeTaken))
        score += points
        const stat = stats[operatorNames[currentOperator]]
        stat.correct++
        stat.time += timeTaken
    }
    nextQuestion(isCorrect)
}

function showQuestion() {
    gamePhase('game')
    const options = generateOptions()
    $('.A').innerText = options[0]
    $('.B').innerText = options[1]
    $('.C').innerText = options[2]
    $('.D').innerText = options[3]
    $('.question').innerText = `What is ${num1} ${currentOperator} ${num2} ?`
    $('.timer').innerText = `Answer correctly to get ${maxTime} points`
    $('.question-number').innerText = `Question ${questionNumber + 1} of ${maxQuestions}`
    $('.score').innerText = `Score: ${score}`
    startTimer()
}

function reveal(selector) {
    const element = $(selector)
    element.style.display = ''
}

function nextQuestion() {
    questionNumber++
    if (questionNumber < maxQuestions) {
        generateQuestion()
        showQuestion()
    } else
        showSummary()
}

function showSummary() {
    gamePhase('summary')
    const totalCorrect = Object
        .values(stats)
        .reduce(
            (acc, curr) => acc + curr.correct,
            0
        )
    const message = totalCorrect === maxQuestions
        ? 'Well done!'
        : ['Need more practice', 'Can do better', 'Try harder next time'][Math.floor(Math.random() * 3)]
    $('#inspire').innerText = message
    $('#score').innerText = `Total Score: ${score}`
    const results = [
        { name: 'Addition', ...stats.addition },
        { name: 'Subtraction', ...stats.subtraction },
        { name: 'Multiplication', ...stats.multiplication },
        { name: 'Division', ...stats.division },
        { name: 'Total', count: maxQuestions, correct: totalCorrect, time: (Date.now() - startTime) / 1000 }
    ].filter(r => r.count > 0)
    for (const r of results) {
        r.avgTime = r.time / r.count
        r.correct = r.correct || 0
    }
    results.sort((a, b) => a.avgTime - b.avgTime)
    const medianIndex = Math.floor(results.length / 2)
    const breakdown = $('#breakdown')
    breakdown.innerHTML = `<tr>
        <td>&nbsp;</th>
        <td>Questions asked</th>
        <td>Answered correctly</th>
        <td>Average time taken</th>
    </tr>`
    results.forEach((r, i) => {
        const colorClass = i < medianIndex ? 'green' : i === medianIndex ? 'yellow' : 'red'
        const row = $$('tr', { parent: breakdown, className: colorClass })
        $$('td', { parent: row, innerText: r.name })
        $$('td', { parent: row, innerText: r.count })
        $$('td', { parent: row, innerText: r.correct })
        $$('td', { parent: row, innerText: `${r.avgTime.toFixed(1)}s` })
    })    
}

function replay() {
    window.location.hash = seed
    window.location.reload()
}

function newGame() {
    window.location.hash = (new Date).valueOf()
    window.location.reload()
}

function share() {
    const userName = prompt('Enter your name:')
    if (!userName) return
    const {origin, pathname} = window.location
    const url = `${origin}${pathname}#${seed}`
    const message = `${userName} scored ${score} points in the Math Quiz! Can you beat that? ${url}`
    navigator.clipboard.writeText(url)
    alert('URL copied! Paste it into a message or social media post.')
}

function start() {
    generateQuestion()
    showQuestion()
}

function showIntro() {
    gamePhase('intro')
}

onbeforeinstallprompt = (e) => {
    console.log('onbeforeinstallprompt', e)
    e.preventDefault()
    const installButton = $$('button', {
        innerText: 'Install',
        onclick: () => {
            e.prompt()
            installButton.style.display = 'none'
        }
    })
}

onload = () => {
    $('.A').onclick = checkAnswer
    $('.B').onclick = checkAnswer
    $('.C').onclick = checkAnswer
    $('.D').onclick = checkAnswer

    showIntro()
    // start()
}