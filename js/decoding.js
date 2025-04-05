'use strict'
// imports the body and font global settings
import { adjustBodyAndFontSizes } from '../js/index.js';
// applies them once on load, and then re-adjusts them every time the window is resized
adjustBodyAndFontSizes();
window.addEventListener('resize', adjustBodyAndFontSizes);
// this function takes as input the polarised photon and measuring device basis (receiver measuring conditions)
// returns the correct key bit object (receiver output)
function getCorrectAnswer(photonDevicePair) {
  switch (photonDevicePair) {
    // superposition state, 50%/50% random output
    case '10':
      return superpositionBits;
    // rectilinear basis
    case '20':
      return keyBit1;
    // superposition state, 50%/50% random output
    case '30':
      return superpositionBits;
    // rectilinear basis
    case '40':
      return keyBit0;
    // diagonal basis
    case '11':
      return keyBit1;
    // superposition state, 50%/50% random output
    case '21':
      return superpositionBits;
    // diagonal basis
    case '31':
      return keyBit0;
    // superposition state, 50%/50% random output
    case '41':
      return superpositionBits;
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
  keyBit0.removeEventListener('click', moveAnswer);
  keyBit1.removeEventListener('click', moveAnswer);
  superpositionBits.removeEventListener('click', moveAnswer);
  // the answer choosen by the user (makes it explicit)
  activeAnswer = this;  
  // fades out the question mark
  gsap.to(resultKeyContainer, {    
    opacity: 0,
    duration: 1
  });
  // animates the chosen answer to the question mark location
  gsap.to(activeAnswer, {    
    x: getTranslation(activeAnswer, resultKeyContainer)[0],
    y: getTranslation(activeAnswer, resultKeyContainer)[1],
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
    resultText.style.color = '#990000';
    resultText.innerText = 'Not Correct.';    
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
  if ( correctAnswer === superpositionBits ) {
    gsap.to(correctAnswer.children[0], {   
      boxShadow: '0 0 15px 15px rgba(0, 255, 0, 1)',
      duration: 2
    });
  }
  else {
    gsap.to(correctAnswer, {   
      boxShadow: '0 0 15px 15px rgba(0, 255, 0, 1)',
      duration: 2
    });
  }
  
};

// MAIN Start - set up the all the required ojbects
// question section
// first operator (polarised photon)
const photonA = document.getElementById('photonA');
const photonV = document.getElementById('photonV');
const photonD = document.getElementById('photonD');
const photonH = document.getElementById('photonH');
// second operator (measuring device)
const deviceR = document.getElementById('deviceR');
const deviceD = document.getElementById('deviceD');
// user result location
const resultKeyContainer = document.getElementById('resultKeyContainer')
// result section
const resultText = document.getElementById('resultText');
const answerRevealButton = document.getElementById('answerRevealButton');
answerRevealButton.onclick = revealCorrectAnswer;
// disables the button to avoid accidental clicks and revealing the correct answer early
answerRevealButton.disabled = true;
answerRevealButton.style.cursor = 'auto';
// answer section
const keyBit0 = document.getElementById('keyBit0');
const keyBit1 = document.getElementById('keyBit1');
const superpositionBit0 = document.getElementById('superpositionBit0');
const superpositionBit1 = document.getElementById('superpositionBit1');
const superpositionBits = document.getElementById('superpositionBits');
const superpositionBitsBack = document.getElementById('superpositionBitsBack');
// animates the superposition bits to achieve the effect of randomness
const timelineKeyBits = gsap.timeline({ 
  defaults: { duration: 1 }, 
  repeat: -1 
});
timelineKeyBits
  .to(superpositionBit0, { opacity: 0 })
  .to(superpositionBit1, { opacity: 1, rotation: 360 }, '<')
  .to(superpositionBit0, { opacity: 1, rotation: 360 })
  .to(superpositionBit1, { opacity: 0}, '<')

// retrieves from session storage the last question
let storedPhoton = sessionStorage.getItem('storedPhoton');
let storedDevice = sessionStorage.getItem('storedDevice');
// pass ticket for the first while loop iteration
let activePhoton = storedPhoton;
let activeDevice = storedDevice;
// this assignment is for debugging purposes only
let activeAnswer = superpositionBits;
let correctAnswer = superpositionBits;
// next question random generator
// first iteration always goes through
while ( activePhoton + activeDevice === storedPhoton + storedDevice ) {
  // generates random question choices
  // runs until the next question is different from the immediate previous
  activePhoton = Math.floor(Math.random() * 4) + 1 + '';
  activeDevice = Math.floor(Math.random() * 2) + '';
}

// reveals the next question choices for polariser photon
switch (activePhoton) {
  case '1':
    photonA.style.opacity = 1;
  break

  case '2':
    photonV.style.opacity = 1;
  break

  case '3':
    photonD.style.opacity = 1;
  break

  case '4':
    photonH.style.opacity = 1;
  break
};
// reveals the next question choices for measuring device
switch (activeDevice) {
  case '0':
    deviceR.style.opacity = 1;
  break

  case '1':
    deviceD.style.opacity = 1;
  break
};

// records the last question choice in session storage to avoid duplication on the immediate next question
sessionStorage.setItem('storedPhoton', activePhoton);
sessionStorage.setItem('storedDevice', activeDevice);
// calculates the correct answer
correctAnswer = getCorrectAnswer(activePhoton + activeDevice);
// set up the event listeners for the answer choices
keyBit0.addEventListener('click', moveAnswer);
keyBit1.addEventListener('click', moveAnswer);
superpositionBits.addEventListener('click', moveAnswer);