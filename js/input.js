'use strict'
// imports the body and font global settings
import { adjustBodyAndFontSizes } from '../js/index.js';
// applies them once on load, and then re-adjusts them every time the window is resized
adjustBodyAndFontSizes();
window.addEventListener('resize', adjustBodyAndFontSizes);

// generates a random input bit strings for all fields on button click
function getRandomInput() {  
  // max bit string lengths
  const keySize = 15;
  // get access to input fields
  let initialKeyField = document.getElementById('inputInitialKeyId');
  let encodingBasisField = document.getElementById('inputEncodingBasisId');
  let measuringBasisField = document.getElementById('inputMeasuringBasisId');
  let eavesdropperField = document.getElementById('inputEavesdropperId');
  // initialise input fields
  let initialKeyFieldString = '';
  let encodingBasisFieldString = '';
  let measuringBasisFieldString = '';
  let eavesdropperFieldString = '';
  // matching bases counter, to ensure the efficient work of the protocol
  let basisMatchCounter = 0;
  while ( basisMatchCounter < minBasisMatchThreshold ) {
    // reinitialise in case a repeated while loop sequence will be required
    initialKeyFieldString = '';
    encodingBasisFieldString = '';
    measuringBasisFieldString = '';
    eavesdropperFieldString = '';    
    basisMatchCounter = 0;
    for (let i = 0; i < keySize; i++) {
      // generate random values for every field/transmission
      initialKeyFieldString = initialKeyFieldString + Math.floor(Math.random() * 2);
      encodingBasisFieldString = encodingBasisFieldString + Math.floor(Math.random() * 2);
      measuringBasisFieldString = measuringBasisFieldString + Math.floor(Math.random() * 2);
      eavesdropperFieldString = eavesdropperFieldString + Math.floor(Math.random() * 2);
    };
    // generator results analysis, if the bases match counter reached the min threshold
    for (let i = 0; i < keySize; i++) {
      if ( encodingBasisFieldString[i] === measuringBasisFieldString[i] ) {
        basisMatchCounter++;
      }
    }    
  }
  // assigns the valid generated values to the input fields
  // the user has the option to amend the values
  initialKeyField.value = initialKeyFieldString;
  encodingBasisField.value = encodingBasisFieldString;
  measuringBasisField.value = measuringBasisFieldString;  
  if ( eveCheckbox.checked ) {
    eavesdropperField.value = eavesdropperFieldString;
  }  
};

// MAIN section
// initialise the main objects
const inputForm = document.getElementById('inputForm');
const minBasisMatchThreshold = 4;
// eavesdropper section
let eveCheckbox = document.getElementById('checkBoxId');
let eveSection = document.getElementById('eveSection');
let eveInputField = document.getElementById('inputEavesdropperId');
// buttons section
const randomiseButton = document.getElementById('randomiseButton');
randomiseButton.addEventListener('click', getRandomInput);
inputForm.addEventListener('reset', function() {
  eveSection.style.opacity = 0.3;
  eveInputField.disabled = true;
});

// check box, eve section visibility settings
if ( eveCheckbox.checked ) {
  eveSection.style.opacity = 1;
  eveInputField.disabled = false;
 }
 else {
  eveSection.style.opacity = 0.3;
  eveInputField.disabled = true;
 }

// defines actions on check box change
eveCheckbox.addEventListener('change', function(checkBoxEvent) {
  if (checkBoxEvent.target.checked) {
    eveSection.style.opacity = 1;
    eveInputField.disabled = false;
  } else {
    eveSection.style.opacity = 0.3;
    eveInputField.disabled = true;
  }
});

// defines actions on input form submit
inputForm.addEventListener('submit', function(inputFormEvent) {
  inputFormEvent.preventDefault();
  // retrieve the values from input fields
  const initialKeyFieldString = document.getElementById('inputInitialKeyId').value;
  const encodingBasisFieldString = document.getElementById('inputEncodingBasisId').value;
  const measuringBasisFieldString = document.getElementById('inputMeasuringBasisId').value;
  // retrieve the eavesdropper status
  const checkBoxStatus = document.getElementById('checkBoxId');
  const eavesdropperFieldString = document.getElementById('inputEavesdropperId').value;
  // retrieve the error messages objects
  let lengthError = document.getElementById('lengthError');
  let basisMatchError = document.getElementById('basisMatchError');
  
  // length error validation section
  if (checkBoxStatus.checked) {
    if ( initialKeyFieldString.length === encodingBasisFieldString.length && 
         initialKeyFieldString.length === measuringBasisFieldString.length &&
         initialKeyFieldString.length === eavesdropperFieldString.length ) {} // no action
    else {      
      alert('Please review the top section, condition 2.');   
      lengthError.style.color = 'red'; 
      return;
    }
  }
  else {
    if ( initialKeyFieldString.length === encodingBasisFieldString.length && 
         initialKeyFieldString.length === measuringBasisFieldString.length ) {} // no action
    else {      
      alert('Please review the top section, condition 2.');   
      lengthError.style.color = 'red'; 
      return;
    }    
  }

  // bases match error validation section
  let basisMatchCounter = 0;
  for (let i = 0; i < encodingBasisFieldString.length; i++) {
    if ( encodingBasisFieldString[i] === measuringBasisFieldString[i] ) {
      basisMatchCounter++;
    }
  }
  if ( basisMatchCounter < minBasisMatchThreshold ) {
    alert('Please review the top section, condition 3.'); 
    basisMatchError.style.color = 'red';    
    return;
  }
  else {          
    inputForm.submit();
    inputForm.reset();
  }
});