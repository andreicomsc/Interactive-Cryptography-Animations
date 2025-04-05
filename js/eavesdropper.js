'use strict'
// imports the body and font global settings
import { adjustBodyAndFontSizes } from '../js/index.js';
// applies them once on load, and then re-adjusts them every time the window is resized
adjustBodyAndFontSizes();
window.addEventListener('resize', adjustBodyAndFontSizes);

// generates and returns a key bit of required type
function getBit(bitType) {
  switch ( bitType ) {
    // returns key bit 0
    case '0':
      return {
        obj: duplicate(bit0),
        st: '0'
      };
    // returns key bit 1
    case '1':
      return {
        obj: duplicate(bit1),
        st: '1'
      };
  };
};

// generates and returns a random element of required type
function getRandom(elementType) {
  switch ( elementType ) {
    // random key bit
    case 'bit':
      if ( Math.floor(Math.random() * 2) ) {
        // returns key bit 1
        return {
          obj: duplicate(bit1),
          st: '1'
        };
      }
      else {
        // returns key bit 0
        return {
          obj: duplicate(bit0),
          st: '0'
        };
      }
    // random basis choice  
    case 'basis':
      if ( Math.floor(Math.random() * 2) ) {
        // returns diagonal basis
        return {
          obj: duplicate(basisD),
          st: '1'
        };
      }
      else {
        // returns rectilinear basis
        return {
          obj: duplicate(basisR),
          st: '0'
        };
      }
    // random measuring device choice 
    case 'device':
      if ( Math.floor(Math.random() * 2) ) {
        // returns diagonal measuring device
        return {
          obj: duplicate(deviceD),
          st: '1'
        };
      }
      else {
        // returns rectilinear measuring device
        return {
          obj: duplicate(deviceR),
          st: '0'
        };
      };        
  };
};

// creates an independent copy of an object
function duplicate(obj) {
  return obj.cloneNode(true);
}

// check if the answer given by the user is correct or not, provides appropriate info messages to the user
function checkAnswer() {
  // removes the event listeners once the user chose an answer to prevent duplicated answer
  yesButton.removeEventListener('click', checkAnswer);
  noButton.removeEventListener('click', checkAnswer);
  // compares the user answer with the "eveDetection" status and sets up further justification for the user
  // "Yes" button is pressed by the user
  if ( this === yesButton ) { 
    if ( eveDetection ) {
      // eavesdropper detected correctly      
      resultText.style.color = '#00ff00';
      resultText.innerText = 'Correct.';
      // display the answer message
      gsap.to(resultText, {
        opacity: 1,
        duration: 0
      });
    }
    else {
      // eavesdropper detected incorrectly
      resultText.style.color = '#990000';
      resultText.innerText = 'Not Correct.';
      revealTransmissions = '.match';
      revealTransmissionsColour = '#00ff00';
      resultLine2.style.color = '#00ff00';
      resultLine2.innerText = 'All Key Bits Matched.';       
      // display the answer message
      gsap.to(resultText, {
        opacity: 1,
        duration: 0
      });
      // display the reveal button
      gsap.to(justificationButton, {    
        opacity: 1,   
        duration: 0
      });   
      // activate the reveal button
      gsap.to(justificationButton, {    
        disabled: false,
        cursor: 'pointer',    
        duration: 0
      });   
    }
  }
  // "No" button is pressed by the user
  else {
    // eavesdropper not detected by the user
    if ( eveDetection ) {
      resultText.style.color = '#990000';
      resultText.innerText = 'Not Correct.';   
      revealTransmissions = '.eve';  
      revealTransmissionsColour = 'red'; 
      resultLine2.style.color = '#990000'; 
      resultLine2.innerText = 'Non-matching Key Bits Detected.';      
      // display the answer message
      gsap.to(resultText, {
        opacity: 1,
        duration: 0
      });    
      // display the reveal button    
      gsap.to(justificationButton, {    
        opacity: 1,   
        duration: 0
      })    
      // activate the reveal button
      gsap.to(justificationButton, {    
        disabled: false,
        cursor: 'pointer',    
        duration: 0
      });  
    }
    else {
      // eavesdropper not detected correctly
      resultText.style.color = '#00ff00';
      resultText.innerText = 'Correct.';   
      // display the answer message
      gsap.to(resultText, {
        opacity: 1,
        duration: 0
      });   
    };
  };  
};

// reveals justification for cases when the user chose an incorrect answer
function revealJustification() {
  // highlight the affected transmissions
  gsap.to(revealTransmissions, {  
    backgroundColor: revealTransmissionsColour,  
    boxShadow: '0 0 5px 5px ' + revealTransmissionsColour,    
    duration: 3
  });  
  // disable the reveal button
  gsap.to(justificationButton, {    
    disabled: true,
    cursor: 'auto',
    duration: 0
  }, '<') 
  // hide the reveal button
  gsap.to(justificationButton, {
    opacity: 0,
    duration: 1.5
  }, '<') 
  // fade out the initial message
  gsap.to(resultText, {
    opacity: 0,
    duration: 1.5
  }, '<');
  // display the justification message
  gsap.to(resultLine2, {
    opacity: 1,  
    duration: 1.5
  }, '+=0.001');
};

// MAIN section
// defines initial settings
const keySize = 10;
// defines key bit objects
const bit0 = document.getElementById('bit0');
const bit1 = document.getElementById('bit1');
// defines basis objects
const basisR = document.getElementById('basisR');
const basisD = document.getElementById('basisD');
// defines measuring devices objects
const deviceR = document.getElementById('deviceR');
const deviceD = document.getElementById('deviceD');
// tragets the data containers for sender and receiver
const aliceData = document.getElementById('aliceData');
const bobData = document.getElementById('bobData');
// targets the output message containers
const resultText = document.getElementById('resultText');
const resultLine2 = document.getElementById('resultLine2');
// set up the reveal justification button
const justificationButton = document.getElementById('justificationButton');
justificationButton.onclick = revealJustification;
justificationButton.disabled = true;
justificationButton.style.cursor = 'auto';
// set up the answer buttons
const yesButton = document.getElementById('yesButton');
const noButton = document.getElementById('noButton');

// fill sender random data
let aliceKeyString = '';
let aliceBasisString = '';
let newElement = {};
for ( let i = 0; i < keySize; i++ ) {
  let newTransmissionAlice = document.createElement('div');
  newTransmissionAlice.setAttribute('class', 'transmissionsAlice');
  newElement = getRandom('bit');
  newTransmissionAlice.append(newElement.obj);
  aliceKeyString += newElement.st;
  newElement = getRandom('basis');
  newTransmissionAlice.append(newElement.obj);
  aliceBasisString += newElement.st;
  aliceData.append(newTransmissionAlice);
};

// fill receiver data
let bobKeyString = '';
let bobDeviceString = '';
let newBit = {};
let newDevice = {};
let eveStatus = Math.floor(Math.random() * 2);

for ( let i = 0; i < keySize; i++ ) {
  // generates a new transmission
  let newTransmisisonBob = document.createElement('div');
  newTransmisisonBob.setAttribute('class', 'transmissionsBob');
  // generates a random measuring device at receiver side
  newDevice = getRandom('device');
  // based on the matching status of both bases, generates either a random or predicted key bit
  if ( newDevice.st === aliceBasisString[i] ) {
    if ( eveStatus ) {
      newBit = getRandom('bit');
    }
    else {
      newBit = getBit(aliceKeyString[i]);
    }
  }
  else {
    newBit = getRandom('bit');
  }
  // appends the new generated data to receiver storage  
  bobKeyString += newBit.st;
  bobDeviceString += newDevice.st;
  // displays the new transmission
  newTransmisisonBob.append(newBit.obj)
  newTransmisisonBob.append(newDevice.obj)
  bobData.append(newTransmisisonBob)      
};

// calculates the correct answer and assigns the appropriade marks for the justification stage
let eveDetection = false;
for ( let i = 0; i < keySize; i++ ) {
  if ( aliceBasisString[i] === bobDeviceString[i] ) {
    if ( aliceKeyString[i] === bobKeyString[i] ) {
      aliceData.children[i].classList.add('match');
      bobData.children[i].classList.add('match');      
    }
    else {
      aliceData.children[i].classList.add('eve');
      bobData.children[i].classList.add('eve');
      eveDetection = true;
    }
  }
};
// display the transmissions with stagger effect
gsap.to('.transmissionsAlice', { opacity: 1, stagger: 0.1 })
gsap.to('.transmissionsBob', { opacity: 1, stagger: 0.1 }, '<')

// justification variables
let revealTransmissions = '';
let revealTransmissionsColour = '';
let revealText = '';
// adds triggers to answer buttons
yesButton.addEventListener('click', checkAnswer);
noButton.addEventListener('click', checkAnswer);