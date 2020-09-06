import { shuffle } from './shuffle.js'

// Pages
const [gamePage, scorePage, splahPage, countdownPage, startForm] = [
  'game-page',
  'score-page',
  'splash-page',
  'countdown-page',
  'start-form'
].map(id => document.getElementById(id))

const [radioContainers, radioInputs, bestScoreEls] = [
  '.radio-container',
  'input',
  '.best-score-value'
].map(query => document.querySelectorAll(query))

const [
  countdown,
  itemContainer,
  finalTimeEl,
  baseTimeEl,
  penaltyTimeEl,
  playAgainBtn
] = [
  '.countdown',
  '.item-container',
  '.final-time',
  '.base-time',
  '.penalty-time',
  '.play-again'
].map(query => document.querySelector(query))

let bestScores

// Equations
let questionAmount = 0
let equationsArray = []
let playerGuessArray = []

// Game Page
let firstNumber = 0
let secondNumber = 0
let equationObject = {}
const wrongFormat = []

// Time
let timer
let timePlayed = 0
let penaltyTime = 0
let finalTime = 0

const scoreToDOM = () => {
  baseTimeEl.textContent = `Base time: ${timePlayed.toFixed(1)}s`
  penaltyTimeEl.textContent = `Penalty time: +${penaltyTime.toFixed(1)}s`
  finalTimeEl.textContent = `Final time: ${finalTime.toFixed(1)}s`
}

const checkScore = () => {
  penaltyTime = playerGuessArray.reduce((a, c, i) => {
    const penalty = c === equationsArray[i].evaluated ? 0 : 0.5
    return a + penalty
  }, penaltyTime)
  finalTime = timePlayed + penaltyTime
}

const checkTime = () => {
  if (playerGuessArray.length === questionAmount) {
    clearInterval(timer)
    checkScore()
    scoreToDOM()
    //  scroll to top
    itemContainer.scrollTo({ top: 0, behavior: 'instant' })
    setTimeout(() => (playAgainBtn.hidden = false), 1000)
    fromTo(gamePage, scorePage)
  }
}

const addTime = () => {
  timePlayed += 0.1
  checkTime()
}
const startTimer = () => {
  timePlayed = 0
  penaltyTime = 0
  finalTime = 0

  timer = setInterval(addTime, 100)
  gamePage.removeEventListener('click', startTimer)
}
// Scroll
let valueY = 0
const select = guessedTrue => {
  valueY += 80
  itemContainer.scroll(0, valueY)
  return playerGuessArray.push(guessedTrue)
}

// Create Correct/Incorrect Random Equations
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max))
}

function createEquations() {
  const correctEquations = getRandomInt(questionAmount)
  const wrongEquations = questionAmount - correctEquations
  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9)
    secondNumber = getRandomInt(9)
    const equationValue = firstNumber * secondNumber
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`
    equationObject = { value: equation, evaluated: true }
    equationsArray.push(equationObject)
  }
  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9)
    secondNumber = getRandomInt(9)
    const equationValue = firstNumber * secondNumber
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`
    wrongFormat[3] = `${firstNumber} x ${secondNumber} = ${equationValue + 1}`
    const formatChoice = getRandomInt(4)
    const equation = wrongFormat[formatChoice]
    equationObject = { value: equation, evaluated: false }
    equationsArray.push(equationObject)
  }
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = ''
  // Spacer
  const topSpacer = document.createElement('div')
  topSpacer.classList.add('height-240')
  // Selected Item
  const selectedItem = document.createElement('div')
  selectedItem.classList.add('selected-item')
  // Append
  itemContainer.append(topSpacer, selectedItem)

  // Create Equations, Build Elements in DOM
  createEquations()
  equationsArray = shuffle(equationsArray)
  equationsToDOM()
  // Set Blank Space Below
  const bottomSpacer = document.createElement('div')
  bottomSpacer.classList.add('height-500')
  itemContainer.appendChild(bottomSpacer)
}

const fromTo = (fromPage, toPage) => {
  fromPage.hidden = true
  toPage.hidden = false
}

const countdownStart = () => {
  countdown.textContent = 3
  const id = setInterval(() => {
    if (+countdownPage.textContent !== 1) {
      countdown.textContent--
    } else {
      countdown.textContent = 'GO!'
    }
  }, 1000)
  setTimeout(() => {
    clearInterval(id)
    fromTo(countdownPage, gamePage)
  }, 4000)
}

const showCountdown = () => {
  if (questionAmount) {
    fromTo(splahPage, countdownPage)
    countdownStart()
    populateGamePage()
  }
}

const equationsToDOM = () => {
  equationsArray.forEach(({ value }) => {
    const item = document.createElement('div')
    item.classList.add('item')
    const equationText = document.createElement('h1')
    equationText.textContent = value
    item.appendChild(equationText)
    itemContainer.appendChild(item)
  })
  // itemContainer.children[0].classList.add('selected-item')
}

// Get the value from selected radio button
const getRadioValue = () => {
  let radioValue
  radioInputs.forEach(({ checked, value }) => {
    if (checked) {
      radioValue = value
    }
  })
  return radioValue
}
//  Form that decides amount of questions
const selectQuestionAmount = event => {
  event.preventDefault()
  questionAmount = +getRadioValue()
  showCountdown()
}

startForm.addEventListener('click', () => {
  radioContainers.forEach(radioEl => {
    radioEl.classList.remove('selected-label')
    if (radioEl.children[1].checked) {
      radioEl.classList.add('selected-label')
    }
  })
})

const playAgain = () => {
  saveBestScore()
  bestScoresToDOM()
  gamePage.addEventListener('click', startTimer)
  fromTo(scorePage, splahPage)
  equationsArray = []
  playerGuessArray = []
  playAgain.hidden = true
  valueY = 0
  timePlayed = 0
  penaltyTime = 0
  finalTime = 0
}

const getSavedBestScores = () => {
  if (localStorage.getItem('bestScores')) {
    bestScores = JSON.parse(localStorage.getItem('bestScores'))
  } else {
    bestScores = {
      10: finalTime.toFixed(1),
      25: finalTime.toFixed(1),
      50: finalTime.toFixed(1),
      99: finalTime.toFixed(1)
    }
    localStorage.setItem('bestScores', JSON.stringify(bestScores))
  }
}

const saveBestScore = () => {
  if (
    finalTime < +bestScores[questionAmount] ||
    bestScores[questionAmount] === '0.0'
  ) {
    bestScores[questionAmount] = finalTime.toFixed(1)
    localStorage.setItem('bestScores', JSON.stringify(bestScores))
  }
}

const bestScoresToDOM = () => {
  Object.values(bestScores).forEach((bestScore, i) => {
    bestScoreEls[i].textContent = `${bestScore}s`
  })
}

startForm.addEventListener('submit', selectQuestionAmount)
gamePage.addEventListener('click', startTimer)

window.select = select
window.playAgain = playAgain

getSavedBestScores()
bestScoresToDOM()
