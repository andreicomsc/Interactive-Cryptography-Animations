'use strict'
// imports the body and font global settings
import { adjustBodyAndFontSizes } from '../js/index.js';
// applies them once on load, and then re-adjusts them every time the window is resized
adjustBodyAndFontSizes();
window.addEventListener('resize', adjustBodyAndFontSizes);

// this function takes as input a key bit and encoding basis bit (sender input details)
// returns a polarised photon object
function getCorrectAnswer(keyBasisPair) {
  switch (keyBasisPair) {
    // rectilinear basis
    case '00':
      return photonH;
    // rectilinear basis
    case '10':
      return photonV;
    // diagonal basis
    case '01':
      return photonD;
    // diagonal basis
    case '11':
      return photonA;
  }
};
// this function returns the translation coordinates of "element" to location of "toFromElement"
function getTranslation(element, toFromElement) {
  // calculates the centre of destination locaion
  let toFromElementXY = toFromElement.getBoundingClientRect();
  let toFromElementX = toFromElementXY.left + toFromElementXY.width / 2;
  let toFromElementY = toFromElementXY.top + toFromElementXY.height / 2;
  // calculates the translation between the centres of starting location and destination locaion
  let elementXY = element.getBoundingClientRect();
  let bobInputBasisBitLocX = toFromElementX - elementXY.left - elementXY.width / 2;
  let bobInputBasisBitLocY = toFromElementY - elementXY.top - elementXY.height / 2;
  // returns the X and Y translation 
  return [bobInputBasisBitLocX, bobInputBasisBitLocY];
};
// this function animates the answer choosen by the user to the answer location 
function moveAnswer() {
  // removes the event listeners once the user chose an answer to prevent duplicated answer
  photonContainer.removeEventListener('click', moveAnswer);
  photonA.removeEventListener('click', moveAnswer);
  photonV.removeEventListener('click', moveAnswer);
  photonD.removeEventListener('click', moveAnswer);
  photonH.removeEventListener('click', moveAnswer);
  // the answer choosen by the user (makes it explicit)
  activeAnswer = this;
  // fades out the question mark
  gsap.to(resultPhotonContainer, {    
    opacity: 0,
    duration: 1
  });
  // animates the chosen answer to the question mark location
  gsap.to(activeAnswer, {    
    x: getTranslation(activeAnswer, resultPhotonContainer)[0],
    y: getTranslation(activeAnswer, resultPhotonContainer)[1],
    duration: 3
  });
  // checks if the chosen answer is correct or not and displays the appropriate message to user
  if ( activeAnswer === correctAnswer ) {
    resultText.style.color = '#00ff00';
    resultText.innerText = 'Correct.';
    // displays the positive message
    gsap.to(resultText, {    
      opacity: 1,
      duration: 0
    }, '+=0.001');
  }
  else {
    resultText.style.color = '#990000'
    resultText.innerText = 'Not Correct.'
    // displays the negative message
    gsap.to(resultText, {    
      opacity: 1,
      duration: 0
    }, '+=0.001');
    // reveals the correct answer button in case the answer was negative
    gsap.to(answerRevealButton, {    
      opacity: 1,
      duration: 0
    }, '<');
    // activates the correct answer button
    gsap.to(answerRevealButton, {    
      disabled: false,
      cursor: 'pointer',
      duration: 0
    }, '<'); 
  } 
};
// animates the highlighting of the correct answer
function revealCorrectAnswer() {  
  gsap.to(correctAnswer.parentNode, {   
    boxShadow: 'inset 0 0 15px 15px rgba(0, 255, 0, 1)',
    duration: 2
  });
};

// MAIN Start - set up the all the required ojbects
// question section
// first operator (key bit)
const keyBit0 = document.getElementById('keyBit0');
const keyBit1 = document.getElementById('keyBit1');
// second operator (basis bit)
const basisBit0 = document.getElementById('basisBit0');
const basisBit1 = document.getElementById('basisBit1');
// user result location
const resultPhotonContainer = document.getElementById('resultPhotonContainer');
// result section
const resultText = document.getElementById('resultText');
const answerRevealButton = document.getElementById('answerRevealButton');
answerRevealButton.onclick = revealCorrectAnswer;
// disables the button to avoid accidental clicks and revealing the correct answer early
answerRevealButton.disabled = true;
answerRevealButton.style.cursor = 'auto';
// answer section
const photonContainer = document.getElementById('photonContainer');
const photonH = document.getElementById('photonH');
const photonV = document.getElementById('photonV');
const photonA = document.getElementById('photonA');
const photonD = document.getElementById('photonD');
// retrieves from session storage the last question
let storedKeyBit = sessionStorage.getItem('storedKeyBit');
let storedBasisBit = sessionStorage.getItem('storedBasisBit');
// pass ticket for the first while loop iteration
let activeKeyBit = storedKeyBit;
let activeBasisBit = storedBasisBit;
// this assignment is for debugging purposes only
let activeAnswer = photonContainer;
let correctAnswer = photonContainer;
// next question random generator
// first iteration always goes through
while ( activeKeyBit + activeBasisBit === storedKeyBit + storedBasisBit ) {
  // generates random bit choices
  // runs until the next question is different from the immediate previous
  activeKeyBit = Math.floor(Math.random() * 2) + '';
  activeBasisBit = Math.floor(Math.random() * 2) + '';
}

// reveals the next question bits
if ( activeKeyBit === '0' ) {
  keyBit0.style.opacity = 1;
}
else {
  keyBit1.style.opacity = 1;
}

if ( activeBasisBit === '0' ) {
  basisBit0.style.opacity = 1;
}
else {
  basisBit1.style.opacity = 1;
}

// records the last question choice in session storage to avoid duplication on the immediate next question
sessionStorage.setItem('storedKeyBit', activeKeyBit);
sessionStorage.setItem('storedBasisBit', activeBasisBit);
// calculates the correct answer
correctAnswer = getCorrectAnswer(activeKeyBit + activeBasisBit);
// set up the event listeners for the answer choices
photonContainer.addEventListener('click', moveAnswer);
photonA.addEventListener('click', moveAnswer);
photonV.addEventListener('click', moveAnswer);
photonD.addEventListener('click', moveAnswer);
photonH.addEventListener('click', moveAnswer);