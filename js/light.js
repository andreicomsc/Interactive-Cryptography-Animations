'use strict'
// imports the body and font global settings
import { adjustBodyAndFontSizes } from '../js/index.js';
// applies them once on load, and then re-adjusts them every time the window is resized
adjustBodyAndFontSizes();
window.addEventListener('resize', adjustBodyAndFontSizes);

// monitors the superposition state of the photons, and displays a message to user
function superpositionState(state) {
  superpositionTexts.forEach(function(text) {
    text.style.opacity = state;
  })
}

// MAIN section
// initialise the grid polariser and the photons
const polariser = document.getElementById('polariserGrid');
const photonV = document.getElementById('photonV');
const photonH = document.getElementById('photonH');
// initialise the bits and message containers
const bit0 = document.getElementById('bit0');
const bit1 = document.getElementById('bit1');
const bit0Text = document.getElementById('bit0Text');
const bit1Text = document.getElementById('bit1Text');
const superpositionTexts = document.querySelectorAll('.superpositionText');

// initialise the variables for probability calculation
let polariserStyle = '';
let polariserStyleNumbers = []; 
let polariserRotationAngleDegrees = 350; // 350 assigned for debugging
let polariserRotationAngleRadians = 6; // 6 assigned for debugging
let probabilityV = 1;
let probabilityH = 0;
// makes sure the user can see the pure quantum states (not superposition)
const mouseSensitivityAdjustment = 0.001;
bit0Text.innerText = '0%';
bit1Text.innerText = '100%';
Draggable.create(polariser, {  
  type: 'rotation',

  // dynamically update the bits' probabilities on polariser rotation
  onDrag: function () {    
    // get the rotation angle
    polariserStyle = polariser.getAttribute('style');
    polariserStyleNumbers = polariserStyle.match(/\d+(.\d+)?/g);
    polariserRotationAngleDegrees = parseFloat(polariserStyleNumbers[polariserStyleNumbers.length-1]);  
    polariserRotationAngleRadians = polariserRotationAngleDegrees * ( Math.PI / 180 );
    
    // calculate the probability values for bits and photons
    probabilityV = Math.abs(Math.cos(polariserRotationAngleRadians)) * 
                   Math.abs(Math.cos(polariserRotationAngleRadians));

    probabilityH = Math.abs(Math.sin(polariserRotationAngleRadians)) * 
                   Math.abs(Math.sin(polariserRotationAngleRadians));

    // apply the probability values to the bit "1" and the vertical photon
    photonV.style.opacity = probabilityV;
    bit1.style.opacity = probabilityV;

    // isolate for the user the superposition state    
    if ( probabilityV < mouseSensitivityAdjustment ) {
      bit1Text.innerText = '0%';
      superpositionState(0);
    }
    else {
      if ( probabilityV > 1 - mouseSensitivityAdjustment ) {
        bit1Text.innerText = '100%';
        superpositionState(0);
      }
      else {
        bit1Text.innerText = (probabilityV * 100).toFixed(3) + '%';
        superpositionState(1);
      }
    }
  
    // apply the opacity values to the bit "0" and the horizontal photon  
    photonH.style.opacity = probabilityH;
    bit0.style.opacity = probabilityH;
    // isolate for the user the superposition state  
    if ( probabilityH < mouseSensitivityAdjustment ) {
      bit0Text.innerText = '0%';
    }
    else {
      if ( probabilityH > 1 - mouseSensitivityAdjustment ) {
        bit0Text.innerText = '100%';
      }
      else {
        bit0Text.innerText = (probabilityH * 100).toFixed(3) + '%';
      }
    }      
  }
});