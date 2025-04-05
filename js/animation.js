'use strict'
// imports the body and font global settings
import { adjustBodyAndFontSizes } from '../js/index.js';
// applies them once on load, and then re-adjusts them every time the window is resized
adjustBodyAndFontSizes();
window.addEventListener('resize', adjustBodyAndFontSizes);

// controls the starting intro animations to run only once while in animation stage
const firstLoadingStatus = sessionStorage.getItem('firstLoadingStatus');
sessionStorage.setItem('firstLoadingStatus', 'completed');

// home page link, will clear the session variables so the intro animations play again
const logoOrbits = document.getElementById('titleLogo');
const logoNucleus = document.getElementById('polariserLogo');
logoOrbits.onclick = () => {
  sessionStorage.clear();
  window.location.replace('../html/index.html');
}
logoNucleus.onclick = () => {
  sessionStorage.clear();
  window.location.replace('../html/index.html');
}

// defines the bits global colours
const bitKeyColour = '#009900';
const bitBasisColour = '#333333';
// defines the sender's polariser open/closed active gate colours
const polariserOpenedGateColour = '#D3D3D3';
const polariserClosedGateColour = '#808080';
// defines eavesdropper's colours
const eveBitsColour = 'gray';
const eveNotInterferingColour = 'red';
const eveInterferingColour = 'red';
// output sender polariser, receiver device flush animation settings
const polariserDeviceFlushRange = '10px 5px ';
const polariserDeviceFlushColour = 'rgba(255, 255, 0, 0.6)';
// output result analysis highlight settings
const outputShineRangeBits = '3px 3px ';
const outputShineRangeTransmissions = '3px 3px ';
const outputShineOff = '0px 0px ';
const outputBasisShineColour = 'yellow';
const basisMismatchShineColour = 'red';
const outputSubsetKeyShineColour = 'yellow';
const keyMismatchShineColour = 'red';
const sharedKeyColour = '#00ff00';
const sharedKeyEveColour = 'orange';
// generator, dragger settings
const generatorWindowOpacity = '0.3';
const draggerEndAdjustment = 10;

// animation prerequisites
let playStatus = 'start';
let interferenceStatus = false;
let bobOutputKeyString = '';
let eveOutputKeyString = '';
let sharedKeyString = '';
let sharedKeyEveString = '';
let message130 = document.getElementById('message130');

// Input Data prerequisites
let keySize = 0;
let aliceInputKeyString = '';
let aliceInputBasisString = '';
let bobInputBasisString = '';
let eveCheckbox = '';
let eveInterferenceString = '';
let eveBasisString = '';

// active input data transfer
const inputDataFromURL = new URLSearchParams(window.location.search);
aliceInputKeyString = inputDataFromURL.get('inputInitialKeyData');
aliceInputBasisString = inputDataFromURL.get('inputEncodingBasisData');
bobInputBasisString = inputDataFromURL.get('inputMeasuringBasisData');
eveCheckbox = inputDataFromURL.get('checkBoxData');
eveInterferenceString = inputDataFromURL.get('inputEavesdropperData');

// set the initial key size, redirect to input page if no input data submitted
if ( aliceInputKeyString ) { 
  keySize = aliceInputKeyString.length; 
}
else {
  window.location.replace('../html/input.html');
}

// adjust animation layout based on eavesdropper input data
const eveSection = document.getElementById('eve');
if ( eveCheckbox === 'on' ) {
  eveSection.style.visibility = 'visible';

  // genrate random eavesdropper (if present) interference basis type 
  // this will be always different, even for the same input key, as in real protocol
  for (let i = 0; i < keySize; i++) {
    if ( eveInterferenceString[i] === '1') {
      eveBasisString = eveBasisString + Math.floor(Math.random() * 2);
    }
    else {
      // 'A' is just a marker for debugging purposes, does not have computational value
      eveBasisString = eveBasisString + 'A';
    }
  }
}
else {
  // generates a no interference sequence if eavesdropper not present
  eveSection.style.visibility = 'hidden';
  eveInterferenceString = '0'.repeat(keySize);
}

// FUNCTIONS section /////////////////////////////////////////////////////////////////

// following functions generate new independent svg objects
function getNewBit1Basis() {    
  return bit1Basis.cloneNode(true);
}

function getNewBit0Basis() {    
  return bit0Basis.cloneNode(true);
}

function getNewBit1Key() {    
  return bit1Key.cloneNode(true);
}

function getNewBit0Key() {    
  return bit0Key.cloneNode(true);
}

function getNewBasisR() {    
  return basisR.cloneNode(true);
}

function getNewBasisD() {
  return basisD.cloneNode(true);
}

function duplicate(obj) {
  return obj.cloneNode(true);
}

// rotates the sender polariser to the correct angle based on the input key/basis bits
function rotatePolariser(polariser, angle) { 
  polariser.setAttribute('style', 'transform: rotate('+ angle +'deg)');
}

// controls the play button behaviour (interlinked with reverse button and dragger)
function playControls() {
  
  switch (playStatus) {

    case 'paused':
      timeline.play();
      dragger.style.animationDirection = 'normal';
      playButton.textContent = 'Pause';
      reverseButton.textContent = 'Reverse';  
      playStatus = 'playing';          
    break

    case 'playing':      
      timeline.pause();      
      playButton.textContent = 'Play';
      reverseButton.textContent = 'Reverse';
      playStatus = 'paused';      
    break

    default:
      timeline.play();
      dragger.style.animationDirection = 'normal';
      playButton.textContent = 'Pause';
      reverseButton.textContent = 'Reverse';
      playStatus = 'playing';           
    break
  }
}

// controls the reverse button behaviour (interlinked with play button and dragger)
function reverseControls() {
  
  switch (playStatus) {

    case 'paused':
      timeline.reverse();
      dragger.style.animationDirection = 'reverse';
      reverseButton.textContent = 'Pause';
      playButton.textContent = 'Play';  
      playStatus = 'reversing';          
    break

    case 'reversing':
      timeline.pause();      
      reverseButton.textContent = 'Reverse';
      playButton.textContent = 'Play';   
      playStatus = 'paused';         
    break

    default:
      timeline.reverse();
      dragger.style.animationDirection = 'reverse';
      reverseButton.textContent = 'Pause';
      playButton.textContent = 'Play';    
      playStatus = 'reversing';        
    break
  }
}

// controls the restart button behaviour (interlinked with play, reverse, dragger)
function restartControls() {
  timeline.restart();
  dragger.style.animationDirection = 'normal';
  playButton.textContent = 'Pause';
  reverseButton.textContent = 'Reverse';
  playStatus = 'playing';
}

// generates the transfer coordinates for the gsap timeline animations
function getTranslation(element, toFromElement) {
  // location of the destination element
  let toFromElementXY = toFromElement.getBoundingClientRect();  
  let toFromElementX = toFromElementXY.left + toFromElementXY.width / 2;
  let toFromElementY = toFromElementXY.top + toFromElementXY.height / 2;
  // location of the transferable element
  let elementXY = element.getBoundingClientRect();
  let elementX = toFromElementX - elementXY.left - elementXY.width / 2;
  let elementY = toFromElementY - elementXY.top - elementXY.height / 2;
  // returns relative transferable coordinates between the elements
  return [elementX, elementY];
}

// returns the sender polariser active gate
function openGate(keyBit) {
  if ( keyBit === '0' ) {    
    return '#gate2';
  }

  if ( keyBit === '1' ) {     
    return '#gate1';
  } 
}

// returns the photon polarisation after passing the sender polariser
function getPhotonPolarisationAlice(aliceKeyBit, aliceBasisBit) {

  switch(aliceKeyBit + aliceBasisBit) {

    case '00':
      return photonH;    

    case '10':
      return photonV;    

    case '01':
      return photonD;
    
    case '11':
      return photonA;
    // for debugging purposes
    default:
      return photon;    
  }
}

// returns the photon polarisation after passing the eavesdrpper measuring device
function getPhotonPolarisationEve(eveBasisBit) {
  let randomPhotonChoice = Math.floor(Math.random() * 2) + '';

  switch(eveBasisBit) {

    case '0':
      if ( randomPhotonChoice === '0' ) {
        return { photon: photonH, keyBit: '0' };
      }
      else {
        return { photon: photonV, keyBit: '1' }; 
      }    

    case '1':
      if ( randomPhotonChoice === '0' ) {
        return { photon: photonD, keyBit: '0' };
      }
      else {
        return { photon: photonA, keyBit: '1' }; 
      }
    // for debugging purposes         
    default:
      return photon;
  }
}

// generates an expected key within the non superposition state
function getSameKey(keyBit) {

  if ( keyBit === '0' ) { 
    return [getNewBit0Key(), '0'];
  }
  else { 
    return [getNewBit1Key(), '1'];
  }
}

// generates a random key within the superposition state
function getRandomKey() {
  let randomKey = Math.floor(Math.random() * 2) + '';

  if ( randomKey === '0' ) { 
    return [getNewBit0Key(), '0'];
  }
  else { 
    return [getNewBit1Key(), '1'];
  }
}

// backward adjustment of the dragger position
function adjustDragger() {
  let progress = timeline.progress();
  let mostRightPositionX = railLength - draggerSize - draggerEndAdjustment;
  let nextPositionX = progress * mostRightPositionX;  
  timelineDragger.style.left = nextPositionX + 'px';  
}

function grabDragger(draggerDownEvent) {
  draggerDownEvent.preventDefault();
  
  dragger.style.cursor = 'grabbing';
  dragger.style.animationPlayState = 'paused';
  let initialPositionX = draggerDownEvent.clientX - timelineDragger.offsetLeft;
  // local events
  document.addEventListener('mousemove', mouseMoveTasks);
  document.addEventListener('mouseup', mouseUpTasks);
 
  function mouseMoveTasks(draggerMoveEvent) {    
    let nextPositionX = draggerMoveEvent.clientX - initialPositionX;
    let mostRightPositionX = railLength - draggerSize - draggerEndAdjustment; 
    let limitsX = Math.min(Math.max(0, nextPositionX), mostRightPositionX);
    timelineDragger.style.left = limitsX + 'px';
    let progress = limitsX / mostRightPositionX;
    timeline.progress(progress);    
  }
  
  function mouseUpTasks() {
    dragger.style.cursor = 'grab';
    dragger.style.animationPlayState = 'running';    
    document.removeEventListener('mousemove', mouseMoveTasks);
    document.removeEventListener('mouseup', mouseUpTasks);
  }
};

// skips animation progress directly to the results analysis stage
function jump() {
  // custom label defined within the timeline
  timeline.seek('transmissionsCompleted');
  adjustDragger();
}

// following 3 functions control the results analysis animation sequence

// classic case of eavesdropper detection (unmatched keys detected)
function redCase() {
  return keyMismatchSubset1 + keyMismatchSubset2;
}
// classic case of no eavesdropping
function noEveCase() {
  return !interferenceStatus;
}
// error case when the key size is not large enough to detect the eavesdropper
function eveCase() {
  return interferenceStatus;
}

// LEGEND set up section ///////////////////////////////////////////////////////////
const legendCells = document.querySelectorAll('.legendCells');

// generate the legend key/basis bits from html templates
const bit1Basis = document.getElementById('templateBit1');
bit1Basis.removeAttribute('id');
bit1Basis.children[0].setAttribute('fill', bitBasisColour);

const bit0Basis = document.getElementById('templateBit0');
bit0Basis.removeAttribute('id');
bit0Basis.children[0].setAttribute('fill', bitBasisColour);

const bit1Key = getNewBit1Basis();
bit1Key.children[0].setAttribute('fill', bitKeyColour);

const bit0Key = getNewBit0Basis();
bit0Key.children[0].setAttribute('fill', bitKeyColour);

// set up key bist into the legend
let bit1KeyContainer = document.createElement('div');
bit1KeyContainer.setAttribute('class', 'subLegendCellsTop');
bit1KeyContainer.append(bit1Key);

let bit0KeyContainer = document.createElement('div');
bit0KeyContainer.setAttribute('class', 'subLegendCellsBottom');
bit0KeyContainer.append(bit0Key);

legendCells[12].append(bit1KeyContainer);
legendCells[12].append(bit0KeyContainer);

legendCells[19].append(duplicate(bit1KeyContainer));
legendCells[19].append(duplicate(bit0KeyContainer));

// generate bases from templates, place into legend
const basisR = document.getElementById('templatePolariser');
basisR.removeAttribute('id');

const basisD = getNewBasisR();
rotatePolariser(basisD, -45);
legendCells[16].append(basisD);

// set up the legend measuring devices (open both gates)
const measuringDeviceR = getNewBasisR();
measuringDeviceR.children[1].setAttribute('stroke', polariserOpenedGateColour);
measuringDeviceR.children[2].setAttribute('stroke', polariserOpenedGateColour);
legendCells[13].append(measuringDeviceR);

const measuringDeviceD = getNewBasisD();
measuringDeviceD.children[1].setAttribute('stroke', polariserOpenedGateColour);
measuringDeviceD.children[2].setAttribute('stroke', polariserOpenedGateColour);
legendCells[20].append(measuringDeviceD);

// set up the legend polarisers (one open gate)
// vertical
const polariserV = getNewBasisR();
rotatePolariser(polariserV, -90);
polariserV.children[2].setAttribute('stroke', polariserOpenedGateColour);
let polariserVContainer = document.createElement('div');
polariserVContainer.setAttribute('class', 'subLegendCellsTop');
polariserVContainer.append(polariserV);
legendCells[10].append(polariserVContainer);
// horizontal
const polariserH = getNewBasisR();
polariserH.children[2].setAttribute('stroke', polariserOpenedGateColour);
let polariserHContainer = document.createElement('div');
polariserHContainer.setAttribute('class', 'subLegendCellsBottom');
polariserHContainer.append(polariserH);
legendCells[10].append(polariserHContainer);
// anti-diagonal
const polariserA = getNewBasisD();
rotatePolariser(polariserA, -135);
polariserA.children[2].setAttribute('stroke', polariserOpenedGateColour);
let polariserAContainer = document.createElement('div');
polariserAContainer.setAttribute('class', 'subLegendCellsTop');
polariserAContainer.append(polariserA);
legendCells[17].append(polariserAContainer);
// diagonal
const polariserD = getNewBasisD();
polariserD.children[2].setAttribute('stroke', polariserOpenedGateColour);
let polariserDContainer = document.createElement('div');
polariserDContainer.setAttribute('class', 'subLegendCellsBottom');
polariserDContainer.append(polariserD);
legendCells[17].append(polariserDContainer);

// set up the legend polarised photons
const generatorLegend2 = document.getElementById('generatorLegend').cloneNode(true);
for (let i = 1; i <= 4; i++) {
  let newPhotonContainer = document.createElement('div');
  if ( i === 1 || i === 3 ) { 
    newPhotonContainer.setAttribute('class', 'subLegendCellsTop');
  }
  else {
    newPhotonContainer.setAttribute('class', 'subLegendCellsBottom');
  }
  
  let newPhoton = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  newPhoton.setAttribute('viewBox', '0 0 100 100');
  newPhoton.append(generatorLegend2.children[2]);  
  newPhotonContainer.append(newPhoton)

  if ( i <= 2 ) { 
    legendCells[11].append(newPhotonContainer);
  }
  else {
    legendCells[18].append(newPhotonContainer);
  }
}

// set up receiver measuring devices
const bobDeviceContainer = document.getElementById('bobDeviceContainer');
const bobDevice = duplicate(measuringDeviceR);
bobDeviceContainer.append(bobDevice);
// set up eavesdropper measuring devices
const eveDeviceContainer = document.getElementById('eveDeviceContainer');
const eveDevice = duplicate(measuringDeviceR);
eveDeviceContainer.append(eveDevice);
// set up the Generator
const generatorBack = document.getElementById('generatorBack');
const photon = document.querySelectorAll('.photon'); 
const photonH = document.getElementById('photonH');
const photonV = document.getElementById('photonV');
const photonD = document.getElementById('photonD');
const photonA = document.getElementById('photonA');
// set up sender polariser
const polariserContainer = document.getElementById('polariserContainer');
const polariser = getNewBasisR();
polariserContainer.append(polariser);
// define the polariser gates for dynamic switching
let g1 = polariser.children[1];
g1.setAttribute('id', 'gate1');
let g2 = polariser.children[2];
g2.setAttribute('id', 'gate2');
let c2 = polariser.children[3];

// sender global polariser location coordinates (of its centre)
let polariserLoc = polariser.getBoundingClientRect();
let polariserLocX = polariserLoc.left + polariserLoc.width / 2;
let polariserLocY = polariserLoc.top + polariserLoc.height / 2;
// receiver global measuring device location coordinates (of its centre)
let bobDeviceLoc = bobDevice.getBoundingClientRect();
let bobDeviceLocX = bobDeviceLoc.left + bobDeviceLoc.width / 2;
let bobDeviceLocY = bobDeviceLoc.top + bobDeviceLoc.height / 2;
// eavesdropper global measuring device location coordinates (of its centre)
let eveDeviceLoc = eveDevice.getBoundingClientRect();
let eveDeviceLocX = eveDeviceLoc.left + eveDeviceLoc.width / 2;
let eveDeviceLocY = eveDeviceLoc.top + eveDeviceLoc.height / 2;

// set up control buttons 
let playButton = document.getElementById('play');
playButton.onclick = () => playControls();
playButton.disabled = true;
playButton.style.cursor = 'auto';

let reverseButton = document.getElementById('reverse');
reverseButton.onclick = () => reverseControls();
reverseButton.disabled = true;
reverseButton.style.cursor = 'auto';

let restartButton = document.getElementById('restart');
restartButton.onclick = () => restartControls();
restartButton.disabled = true;
restartButton.style.cursor = 'auto';

let jumpButton = document.getElementById('jumpButton');
jumpButton.addEventListener('click', jump);
jumpButton.disabled = true;
jumpButton.style.cursor = 'auto';

// set up the dragger (slider)
const timelineDraggerRail = document.getElementById('timelineDraggerRail');
const timelineDragger = document.getElementById('timelineDragger');
const dragger = duplicate(measuringDeviceR);
timelineDragger.append(dragger);
let railLength = timelineDraggerRail.offsetWidth;
let draggerSize = timelineDragger.offsetWidth;

// define the data containers
const aliceInputKeyContainer = document.getElementById('aliceInputKey');
const aliceInputBasisContainer = document.getElementById('aliceInputBasis');
const aliceOutputContainer = document.getElementById('aliceOutputContainer');
const eveInterferenceContainer = document.getElementById('eveInterferenceContainer');
const bobInputBasisContainer = document.getElementById('bobInputBasis');
const bobOutputContainer = document.getElementById('bobOutputContainer');
// disable the dragger

// fill input data 
let polarisedPhotonAlice = [];
let polarisedPhotonEve = [];
for (let i = 0; i < keySize; i++) {  
  // sender input key bits
  let newAliceInputKeyBit;
  let newAliceInputKeyBitContainer = document.createElement('div');
  newAliceInputKeyBitContainer.setAttribute('class', 'aliceInputKeyBits');
  if ( aliceInputKeyString[i] === '1' ) { 
    newAliceInputKeyBit = getNewBit1Key(); 
  }
  else { 
    newAliceInputKeyBit = getNewBit0Key(); 
  }
  newAliceInputKeyBitContainer.append(newAliceInputKeyBit);  
  aliceInputKeyContainer.append(newAliceInputKeyBitContainer);

  // sender input basis bits
  let aliceInputBasisBit;
  let aliceInputBasisBitContainer = document.createElement('div');
  aliceInputBasisBitContainer.setAttribute('class', 'aliceInputBasisBits');
  if ( aliceInputBasisString[i] === '1' ) { 
    aliceInputBasisBit = getNewBit1Basis(); 
  }
  else { 
    aliceInputBasisBit = getNewBit0Basis(); 
  }
  aliceInputBasisBitContainer.append(aliceInputBasisBit);
  aliceInputBasisContainer.append(aliceInputBasisBitContainer);

  // sender output container
  let aliceTransmission = document.createElement('div');
  aliceTransmission.setAttribute('class', 'transmissions');

  // sender output key bit
  let aliceOutputKeyBitContainer = document.createElement('div');
  aliceOutputKeyBitContainer.setAttribute('class', 'aliceOutputKeyBits');
  let aliceOutputKeyBit = duplicate(newAliceInputKeyBit);
  aliceOutputKeyBitContainer.append(aliceOutputKeyBit);
  aliceTransmission.append(aliceOutputKeyBitContainer);
  
  // sender output basis bit
  let aliceOutputBasisBitContainer = document.createElement('div');
  aliceOutputBasisBitContainer.setAttribute('class', 'aliceOutputBasisBits');
  let aliceOutputBasisBit;
  if (aliceInputBasisString[i] === '0') {
    aliceOutputBasisBit = duplicate(basisR);
  }
  else {
    aliceOutputBasisBit = duplicate(basisD);
  }
  aliceOutputBasisBitContainer.append(aliceOutputBasisBit);
  aliceOutputBasisBitContainer.style.opacity = '0';
  aliceTransmission.append(aliceOutputBasisBitContainer);
  aliceOutputContainer.append(aliceTransmission);

  // eavesdropper interference bits
  let eveInterferenceBit;
  let eveInterferenceBitContainer = document.createElement('div');
  eveInterferenceBitContainer.setAttribute('class', 'eveInterferenceBits');    
  if ( eveInterferenceString[i] === '1' ) { 
    eveInterferenceBit = getNewBit1Key(); 
  }
  else { 
    eveInterferenceBit = getNewBit0Key(); 
  }
  eveInterferenceBit.children[0].setAttribute('fill', eveBitsColour);
  eveInterferenceBit.style.zIndex = 10;
  eveInterferenceBitContainer.append(eveInterferenceBit);  
  eveInterferenceContainer.append(eveInterferenceBitContainer);

  // receiver input data
  let newBobInputBasisBit, newBobInputBasisBitContainer;
  newBobInputBasisBitContainer = document.createElement('div');
  newBobInputBasisBitContainer.setAttribute('class', 'bobInputBasisBits');
  if ( bobInputBasisString[i] === '1' ) { 
    newBobInputBasisBit = getNewBit1Basis(); 
  }
  else { 
    newBobInputBasisBit = getNewBit0Basis(); 
  }
  newBobInputBasisBitContainer.append(newBobInputBasisBit);
  bobInputBasisContainer.append(newBobInputBasisBitContainer);

  // receiver output container
  let bobTransmission = document.createElement('div');
  bobTransmission.setAttribute('class', 'transmissions');

  // receiver output key bit
  let bobOutputKeyBitContainer = document.createElement('div');
  bobOutputKeyBitContainer.setAttribute('class', 'bobOutputKeyBits');
  let bobOutputkeyBit;
  let outputKeyString;

  // calculate the photon polarisations after the sender polariser
  polarisedPhotonAlice.push(getPhotonPolarisationAlice(aliceInputKeyString[i], aliceInputBasisString[i]));
  // adjust the photon polarisation based of the eavesdropper interference actions
  // no interference case
  if ( eveInterferenceString[i] === '0' ) {
    polarisedPhotonEve.push(polarisedPhotonAlice[i]);    
    if ( aliceInputBasisString[i] === bobInputBasisString[i] ) {
      [ bobOutputkeyBit, outputKeyString ]  = getSameKey(aliceInputKeyString[i]);
      bobOutputKeyString = bobOutputKeyString + outputKeyString;
    }
    else {
      [ bobOutputkeyBit, outputKeyString ]  = getRandomKey();
      bobOutputKeyString = bobOutputKeyString + outputKeyString;
    }
    eveOutputKeyString = eveOutputKeyString + 'N';
  }
  else {
    // interference case
    // maintains the original photon polarisation when the bases match
    // generates a random output when bases do no match (see "how it works" section)    
    interferenceStatus = true; 
    // calculate Eavesdropper's output
    if  ( aliceInputBasisString[i] === eveBasisString[i] ) {
      polarisedPhotonEve.push(polarisedPhotonAlice[i]);      
      eveOutputKeyString = eveOutputKeyString + aliceInputKeyString[i];
      eveInterferenceContainer.children[i].append(getSameKey(aliceInputKeyString[i])[0]);
    }
    else {
      let eveOutput = getPhotonPolarisationEve(eveBasisString[i]);
      polarisedPhotonEve.push(eveOutput.photon);
      eveOutputKeyString = eveOutputKeyString + eveOutput.keyBit;
      eveInterferenceContainer.children[i].append(getSameKey(eveOutput.keyBit)[0]);
    }       
    // calculate Receiver's output
    if ( eveBasisString[i] === bobInputBasisString[i] ) {
      [ bobOutputkeyBit, outputKeyString ]  = getSameKey(eveOutputKeyString[i]);
      bobOutputKeyString = bobOutputKeyString + outputKeyString;      
    }
    else {      
      [ bobOutputkeyBit, outputKeyString ]  = getRandomKey();
      bobOutputKeyString = bobOutputKeyString + outputKeyString;
    }
  }

  // receiver output key
  bobOutputKeyBitContainer.append(bobOutputkeyBit);
  bobTransmission.append(bobOutputKeyBitContainer);
  bobOutputContainer.append(bobTransmission);

  // receiver output basis
  let bobOutputBasisBitContainer = document.createElement('div');
  bobOutputBasisBitContainer.setAttribute('class', 'bobOutputBasisBits');
  let bobOutputBasisBit;
  if (bobInputBasisString[i] === '0') {
    bobOutputBasisBit = duplicate(measuringDeviceR);
  }
  else {
    bobOutputBasisBit = duplicate(measuringDeviceD);
  }
  bobOutputBasisBitContainer.append(bobOutputBasisBit);
  bobOutputBasisBitContainer.style.opacity = '0';
  bobTransmission.append(bobOutputBasisBitContainer);
}

// results analysis
let matchingBasisCount = 0;
let keyMismatchSubset1 = 0;
let keyMismatchSubset2 = 0;
let keyActiveSubset = 0;
// mark the non-matching bases/transmissions
for (let i = 0; i < keySize; i++) {
  if ( aliceInputBasisString[i] !== bobInputBasisString[i] ) { 
    aliceOutputContainer.children[i].children[1].classList.add('basisMismatch');
    aliceOutputContainer.children[i].classList.add('transmissionBasisMismatch');
    bobOutputContainer.children[i].children[1].classList.add('basisMismatch');
    bobOutputContainer.children[i].classList.add('transmissionBasisMismatch');
  }
  else {
    matchingBasisCount++;    
  }
}
// calculate the non-matching keys between the sender and receiver
// required for eavesdropper detection
let matchingBasisSubCounter = 0;
for (let i = 0; i < keySize; i++) {
  if ( aliceInputBasisString[i] === bobInputBasisString[i] ) {
    matchingBasisSubCounter++;    
    if ( matchingBasisSubCounter <= Math.floor( matchingBasisCount / 2 ) ) {
      if ( aliceInputKeyString[i] !== bobOutputKeyString[i] ) {
        keyMismatchSubset1++;
      }      
    }
    else {
      if ( aliceInputKeyString[i] !== bobOutputKeyString[i] ) {
        keyMismatchSubset2++;
      }
    }
  }
}

// active key subset pseudo random choice for efficient learning purposes
if ( ( keyMismatchSubset1 === 0 && keyMismatchSubset2 === 0 ) || 
   ( keyMismatchSubset1 > 0 && keyMismatchSubset2 > 0 ) ) {
    keyActiveSubset = Math.floor(Math.random() * 2);    
   }
if ( keyMismatchSubset1 === 0 && keyMismatchSubset2 > 0 ) {
  keyActiveSubset = 1;  
}
if ( keyMismatchSubset1 > 0 && keyMismatchSubset2 === 0 ) {
  keyActiveSubset = 0;  
}

// calculates the shared key, marks output key bits for amimation highlight
matchingBasisSubCounter = 0;
for (let i = 0; i < keySize; i++) {
  if ( aliceInputBasisString[i] === bobInputBasisString[i] ) {
    matchingBasisSubCounter++;
    // left output key subset
    if ( matchingBasisSubCounter <= Math.floor( matchingBasisCount / 2 ) ) {
      if ( keyActiveSubset === 0 ) {
        aliceOutputContainer.children[i].children[0].classList.add('aliceOutputSubsetKeyBits');
        bobOutputContainer.children[i].children[0].classList.add('bobOutputSubsetKeyBits');
        aliceOutputContainer.children[i].classList.add('transmissionKeySubset');
        bobOutputContainer.children[i].classList.add('transmissionKeySubset');
        if ( aliceInputKeyString[i] !== bobOutputKeyString[i] ) {
          aliceOutputContainer.children[i].children[0].classList.add('keyMismatch');
          bobOutputContainer.children[i].children[0].classList.add('keyMismatch');
          eveInterferenceContainer.children[i].classList.add('keyMismatch');
        } 
      }
      else {
        sharedKeyString = sharedKeyString + bobOutputKeyString[i];
        sharedKeyEveString = sharedKeyEveString + eveOutputKeyString[i];
        eveInterferenceContainer.children[i].classList.add('sharedKeyEve');
      }
    }
    else {
      // right output key subset
      if ( keyActiveSubset === 1 ) {
        aliceOutputContainer.children[i].children[0].classList.add('aliceOutputSubsetKeyBits');
        bobOutputContainer.children[i].children[0].classList.add('bobOutputSubsetKeyBits');
        aliceOutputContainer.children[i].classList.add('transmissionKeySubset');
        bobOutputContainer.children[i].classList.add('transmissionKeySubset');
        if ( aliceInputKeyString[i] !== bobOutputKeyString[i] ) {
          aliceOutputContainer.children[i].children[0].classList.add('keyMismatch');
          bobOutputContainer.children[i].children[0].classList.add('keyMismatch');
          eveInterferenceContainer.children[i].classList.add('keyMismatch');
        } 
      }
      else {
        sharedKeyString = sharedKeyString + bobOutputKeyString[i];
        sharedKeyEveString = sharedKeyEveString + eveOutputKeyString[i];
        eveInterferenceContainer.children[i].classList.add('sharedKeyEve');
      }
    }
  }
}

// calculates translations locations of all input/output bits
let aliceInputKeyBitLocXY = [];
let aliceInputBasisBitLocXY = [];
let aliceOutputKeyBitLocXY = [];
let aliceOutputBasisBitLocXY = [];
let bobInputBasisBitLocXY = [];
let bobOutputKeyBitLocXY = [];
let bobOutputBasisBitLocXY = [];

for (let i = 0; i < keySize; i++) {
  // sender input key bits
  let aliceInputKeyBitLoc = aliceInputKeyContainer.children[i].getBoundingClientRect()
  let aliceInputKeyBitLocX = polariserLocX - aliceInputKeyBitLoc.left - aliceInputKeyBitLoc.width / 2
  let aliceInputKeyBitLocY = polariserLocY - aliceInputKeyBitLoc.top - aliceInputKeyBitLoc.height / 2
  aliceInputKeyBitLocXY.push([aliceInputKeyBitLocX, aliceInputKeyBitLocY])
  // sender input basis bits
  let aliceInputBasisBitLoc = aliceInputBasisContainer.children[i].getBoundingClientRect()
  let aliceInputBasisBitLocX = polariserLocX - aliceInputBasisBitLoc.left - aliceInputBasisBitLoc.width / 2
  let aliceInputBasisBitLocY = polariserLocY - aliceInputBasisBitLoc.top - aliceInputBasisBitLoc.height / 2
  aliceInputBasisBitLocXY.push([aliceInputBasisBitLocX, aliceInputBasisBitLocY])
  // sender output key bits
  let aliceOutputKeyBitLoc = aliceOutputContainer.children[i].children[0].getBoundingClientRect()
  let aliceOutputKeyBitLocX = polariserLocX - aliceOutputKeyBitLoc.left - aliceOutputKeyBitLoc.width / 2
  let aliceOutputKeyBitLocY = polariserLocY - aliceOutputKeyBitLoc.top - aliceOutputKeyBitLoc.height / 2  
  aliceOutputKeyBitLocXY.push([aliceOutputKeyBitLocX, aliceOutputKeyBitLocY])
  // sender output basis bits
  let aliceOutputBasisBitLoc = aliceOutputContainer.children[i].children[1].getBoundingClientRect()
  let aliceOutputBasisBitLocX = polariserLocX - aliceOutputBasisBitLoc.left - aliceOutputBasisBitLoc.width / 2
  let aliceOutputBasisBitLocY = polariserLocY - aliceOutputBasisBitLoc.top - aliceOutputBasisBitLoc.height / 2
  let aliceOutputBasisBitScale = polariserLoc.height / aliceOutputBasisBitLoc.height
  aliceOutputBasisBitLocXY.push([aliceOutputBasisBitLocX, aliceOutputBasisBitLocY, aliceOutputBasisBitScale])
  // receiver input basis bits
  let bobInputBasisBitLoc = bobInputBasisContainer.children[i].getBoundingClientRect()
  let bobInputBasisBitLocX = bobDeviceLocX - bobInputBasisBitLoc.left - bobInputBasisBitLoc.width / 2
  let bobInputBasisBitLocY = bobDeviceLocY - bobInputBasisBitLoc.top - bobInputBasisBitLoc.height / 2  
  bobInputBasisBitLocXY.push([bobInputBasisBitLocX, bobInputBasisBitLocY])
  // receiver output basis bits
  let bobOutputBasisBitLoc = bobOutputContainer.children[i].children[1].getBoundingClientRect()
  let bobOutputBasisBitLocX = bobDeviceLocX - bobOutputBasisBitLoc.left - bobOutputBasisBitLoc.width / 2
  let bobOutputBasisBitLocY = bobDeviceLocY - bobOutputBasisBitLoc.top - bobOutputBasisBitLoc.height / 2
  let bobOutputBasisBitScale = polariserLoc.height / bobOutputBasisBitLoc.height
  bobOutputBasisBitLocXY.push([bobOutputBasisBitLocX, bobOutputBasisBitLocY, bobOutputBasisBitScale])
  // receiver output key bits
  let bobOutputKeyBitLoc = bobOutputContainer.children[i].children[0].getBoundingClientRect()
  let bobOutputKeyBitLocX = bobDeviceLocX - bobOutputKeyBitLoc.left - bobOutputKeyBitLoc.width / 2
  let bobOutputKeyBitLocY = bobDeviceLocY - bobOutputKeyBitLoc.top - bobOutputKeyBitLoc.height / 2
  bobOutputKeyBitLocXY.push([bobOutputKeyBitLocX, bobOutputKeyBitLocY])
}

// intro animations
// plays once while withing the animation stage including input page
// replays when the user re-enters the animation stage from another page except input page
if ( firstLoadingStatus ) {
  const timelineLoading = gsap.timeline();
  
  timelineLoading 
    // displays the following elements instantly
    .to('#titleLineContainer, #controls, #timelineDraggerRail, .delimiterVertical, #delimiterHorizontal, .legendCells, #alice, #bob, #eve, #channel, #message1', { 
      opacity: 1,
      duration: 0 
    })
    .to('.delimiterVertical', {
      height: '100%',
      ease: 'none',
      duration: 0 
    }, '<')
    .to('#delimiterHorizontal', {
      width: '100%',
      ease: 'none',
      duration: 0 
    }, '<')
    .to('#channel', {
      width: '100%',
      ease: 'none',
      duration: 0 
    }, '<')
    .to('#channel', {
      height: '30%',
      ease: 'none',
      duration: 0 
    }, '<')
    // replays the animaiton for the new input data
    .to('.aliceInputKeyBits', { opacity: 1, stagger: 0.05 })
    .to('.aliceInputBasisBits', { opacity: 1, stagger: 0.05 }, '<')
    .to('.bobInputBasisBits', { opacity: 1, stagger: 0.05 }, '<')
    .to('.eveInterferenceBits', { opacity: 1, stagger: 0.05 }, '<')
    .to('#play, #reverse, #restart, #jumpButton', { 
      disabled: false,
      cursor: 'pointer',
      duration: 0
    }) 
    .call(function() {
      timelineDragger.addEventListener('mousedown', grabDragger); 
    });  
}
else {
  // plays the intro animations in full
  const timelineLoading = gsap.timeline();
  timelineLoading       
    // displays the header, control buttons, dragger with a flashing effect
    .to('#titleLineContainer, #controls, #timelineDraggerRail', { 
      opacity: 1,
      ease: 'none',
      duration: 3 
    })
    // displays the delimiters
    .to('.delimiterVertical, #delimiterHorizontal', { 
      opacity: 1,
      duration: 0 
    }, '<')
    // plays the vertical delimiters with a bouncing effect
    .to('.delimiterVertical', {
      height: '100%',
      ease: 'bounce',
      duration: 5 
    }, '<')
    // plays the horizontal delimiters with a bouncing effect
    .to('#delimiterHorizontal', {
      width: '100%',
      ease: 'bounce',
      duration: 5 
    }, '<')
    // displays the legend with stagger effect
    .to('.legendCells', { opacity: 1, stagger: 0.1 }, '+=1') 
    // displays the participants: sender, receiver, eavesdropper
    .to('#alice', { opacity: 1, duration: 2 }, '+=1')
    .to('#bob', { opacity: 1, duration: 2 })
    .to('#eve', { opacity: 1, duration: 2 })
    // displays the input data with stagger effect
    .to('.aliceInputKeyBits', { opacity: 1, stagger: 0.07 })
    .to('.aliceInputBasisBits', { opacity: 1, stagger: 0.07 }, '<')
    .to('.bobInputBasisBits', { opacity: 1, stagger: 0.07 })
    .to('.eveInterferenceBits', { opacity: 1, stagger: 0.07 })
    // displays the quntum channel
    .to('#channel', { opacity: 1, duration: 0 })
    .to('#channel', {
      width: '100%',
      ease: "none",
      duration: 1 
    })
    .to('#channel', {
      height: '30%',
      ease: "none",
      duration: 1 
    })
    .to('#message1', { opacity: 1, duration: 1 })
    .to('#play, #reverse, #restart, #jumpButton', { 
      disabled: false,
      cursor: 'pointer',
      duration: 0
    })   
    .call(function() {
      timelineDragger.addEventListener('mousedown', grabDragger); 
    }); 
};

// main timeline sequence prerequisites
let polariserTransmissionState = 'H'; // default state, is being used/changed only at run time
// defines the required zIndex values            
aliceInputKeyContainer.style.zIndex = 56;
aliceInputBasisContainer.style.zIndex = 55;
polariser.style.zIndex = 50;
bobInputBasisContainer.style.zIndex = 35;
bobDevice.style.zIndex = 30;
eveDevice.style.zIndex = 38;

// MAIN timeline sequence /////////////////////////////////////////////////////////////////
const timeline = gsap.timeline( {
  paused: true,
  onUpdate: adjustDragger,
  defaults: { duration: 2 }    
});

// loops the animation through all input bits
for (let i = 0; i < keySize; i++) {
  // removes the default message
  timeline.to('#message1', {
    opacity: 0,
    duration: 0 
  });
  // moves the sender input basis bits
  timeline.to(aliceInputBasisContainer.children[i], {
    x: aliceInputBasisBitLocXY[i][0], 
    y: aliceInputBasisBitLocXY[i][1],
    scale: 3    
  });
  // moves the receiver input basis bits at the same time
  timeline.to(bobInputBasisContainer.children[i], {
    x: bobInputBasisBitLocXY[i][0], 
    y: bobInputBasisBitLocXY[i][1],
    scale: 3     
  }, '<');
  // fades out the active bits
  timeline.to(aliceInputBasisContainer.children[i], {
    opacity: 0 
  });
  timeline.to(bobInputBasisContainer.children[i], {
    opacity: 0
  }, '<');
  // rotates the sender polariser to the required position based on the input data
  timeline.to(polariser, {
    rotation: ( 0 - parseInt(aliceInputBasisString[i]) ) * 45,
    duration: function () {
      if ( i === 0 ) {
        if ( aliceInputBasisString[i] === '0' ) { 
          return 0; 
        }
        else {
          return 1; 
        }
      }
      else {
        if ( aliceInputBasisString[i] === aliceInputBasisString[i-1] ) {
          return 0;
        }
        else {
          return 1;
        }
      }
    }    
  });
  // rotates to the required position the receiver measuring device
  timeline.to(bobDevice, {    
    rotation: parseInt(bobInputBasisString[i]) * 45,
    duration: 1
  }, '<');
  // moves the sender input key bit
  timeline.to(aliceInputKeyContainer.children[i], {
    x: aliceInputKeyBitLocXY[i][0], 
    y: aliceInputKeyBitLocXY[i][1],
    scale: 3  
  });
  // fades the sender input key bit out
  timeline.to(aliceInputKeyContainer.children[i], {
    opacity: 0
  });
  // calculates the polariser gate, which should open based on the key bit
  // changes the polariser transmission state
  timeline.call(function() {
    if ( aliceInputBasisString[i] === '0' ) {
      if ( aliceInputKeyString[i] === '0' ) {
        polariser.insertBefore(g2, c2);
        polariserTransmissionState = 'H';        
      }
      else {
        polariser.insertBefore(g1, c2);
        polariserTransmissionState = 'V';        
      }
    }
    else {      
        if ( aliceInputKeyString[i] === '0' ) {
          polariser.insertBefore(g2, c2);
          polariserTransmissionState = 'D';          
        }
        else {
          polariser.insertBefore(g1, c2);
          polariserTransmissionState = 'A';          
        }
    }
  });
  // opens the polariser gate
  timeline.to(openGate(aliceInputKeyString[i]), { 
    stroke: polariserOpenedGateColour 
  });
  // clears the generator window
  // the unpolarised photon becomes visible
  timeline.to('.generatorWindow', {
    opacity: generatorWindowOpacity
  });
  // opens the generator gates
  timeline.to('#generatorUpperGate', {
    rotate: -90,
    duration: 1
  });
  timeline.to('#generatorLowerGate', {
    rotate: 90,
    duration: 1
  }, '<' );
  // moves the unpolarised photon towards sender polariser
  timeline.to(photon, {
    x: getTranslation(photon[0], polariser)[0],
    ease: 'none'   
  });
  // adjusting the zIndex to achieve the continuous moving effect
  timeline.to(photon, {
    zIndex: 40,
    opacity: 0,
    duration: 0
  });
  // leaves visible only the polarised photon for further moving
  timeline.to(polarisedPhotonAlice[i], {    
    opacity: 1,
    duration: 0
  }, '<');
  // moves the polarised photon towards eavesdropper area
  timeline.to(photon, {
    x: getTranslation(photon[0], eveDevice)[0],
    ease: 'none'
  });
  // closes the generator window
  timeline.to('.generatorWindow', {
    opacity: 1
  }, '<');
  // closes the generator gates
  timeline.to('#generatorUpperGate', {
    rotate: 0
  }, '<');
  timeline.to('#generatorLowerGate', {
    rotate: 0
  }, '<');
  // calculates the eavesdropper measuring device interference settings
  timeline.to(eveDevice, {    
    y: (polariserLocY - eveDeviceLocY) * parseInt(eveInterferenceString[i]),
    // scales up/down to match the size of the sender/receiver devices
    scale: function () {
      if ( eveInterferenceString[i] === '1' ) {
        return polariserLoc.height / eveDeviceLoc.height;
      }
      else { return 1; }
    },
    // rotation measuring angle
    rotation: function () {
      if ( eveInterferenceString[i] === '1' ) {
        if ( gsap.getProperty(eveDevice, "rotation") >= 360 ) {
          gsap.set(eveDevice, { 
            rotation: gsap.getProperty(eveDevice, "rotation") - 360 
          });
        }
        return parseInt(eveBasisString[i]) * 45 + 360;
      }
      else {
        return gsap.getProperty(eveDevice, "rotation"); 
      }
    },
    duration: 1
  }, '<');
  // highlights the eavesdropper active interference status by up scale and up movement
  timeline.to(eveInterferenceContainer.children[i], {
    yPercent: function () { 
      if ( eveInterferenceString[i] === '1' ) {
        return -300;
      }      
    },
    scale: function () { 
      if ( eveInterferenceString[i] === '1' ) {
        return 2;
      }      
    },
    duration: 1
  }, '<');
  // highlights the eavesdropper active interference status with different colour
  timeline.to(eveInterferenceContainer.children[i].children[0].children[0], {
    fill: function () { 
      if ( eveInterferenceString[i] === '1' ) {
        return eveInterferingColour;
      }      
      else {
        return eveNotInterferingColour;
      }
    },
    duration: 1
  }, '<');
  // reveals the generated sender output key bit behind the polariser
  timeline.to(aliceOutputContainer.children[i].children[0], {
      opacity: 1,
      duration: 0
    }, '<');
  // moves it to the final position
  timeline.from(aliceOutputContainer.children[i].children[0], {
    x: aliceOutputKeyBitLocXY[i][0], 
    y: aliceOutputKeyBitLocXY[i][1],
    scale: 3
  }, '<');
  // adjusting the photon zIndex to create a continuous moving effect from behind the eavesdropper device
  timeline.to(photon, {
    zIndex: 37,
    opacity: 0, 
    duration: 0    
  });
  // highlights the new photon polarisation after the eavesdropper interference 
  timeline.to(polarisedPhotonEve[i], {    
    opacity: 1,
    duration: 0
  }, '<');
  // moves the photon towards receiver device
  timeline.to(photon, {
    x: getTranslation(photon[0], bobDevice)[0],
    ease: 'none', 
    duration: 2.693
  },);
  // generates the Eavesdropper's measured key bit value
  timeline.to(eveInterferenceContainer.children[i].children[1], {
    zIndex: 15,
    duration: 0
  }, '<');
  // closes the sender polariser gates
  timeline.to('#gate1', { stroke: polariserClosedGateColour }, '<');
  timeline.to('#gate2', { stroke: polariserClosedGateColour }, '<');
  // resets eavesdropper device, bit to original position
  timeline.to(eveDevice, {
    y: 0,
    scale: 1,
    duration: 1
  }, '<1');  
  timeline.to(eveInterferenceContainer.children[i], {
    yPercent: 0,
    scale: 1,
    duration: 1
  }, '<');
  timeline.to(eveInterferenceContainer.children[i].children[0].children[0], {
    fill: eveBitsColour,
    duration: 1
  }, '<');
  // hides the photon behind receiver device
  timeline.to(photon, {
    zIndex: 20,
    opacity: 0,
    duration: 0
  });
  // reveals receiver new calculated key bit behind the device  
  timeline.to(bobOutputContainer.children[i].children[0], {
    opacity: 1,
    duration: 0
  });
  // moves the key bit to its final position
  timeline.from(bobOutputContainer.children[i].children[0], {
    x: bobOutputKeyBitLocXY[i][0], 
    y: bobOutputKeyBitLocXY[i][1],
    scale: 3  
  }, '<');
  // resets the photon to its original state to create the effect of a new photon generation
  timeline.to(photon, {
    x: 0,
    duration: 0 
  }, '<');
  // prepares the photon to a new transmission sequence
  timeline.to(photon, {  
    zIndex: 60, 
    opacity: 1,
    duration: 0
  }, '<');
  // prepares to photograph the sender polariser current state
  timeline.to(aliceOutputContainer.children[i].children[1], { 
    zIndex: 51,    
    opacity: 1,
    duration: 0
  });
  // prepares to photograph the receiver device current state
  timeline.to(bobOutputContainer.children[i].children[1], {   
    zIndex: 31, 
    opacity: 1,
    duration: 0
  }, '<');
  // applies a simulated photographic flushing effect to both devices
  timeline.to(aliceOutputContainer.children[i].children[1], {    
    boxShadow: '0 0 ' + polariserDeviceFlushRange + polariserDeviceFlushColour,
    duration: 0.2,
    repeat: 1
  });
  timeline.to(bobOutputContainer.children[i].children[1], {    
    boxShadow: '0 0 ' + polariserDeviceFlushRange + polariserDeviceFlushColour,
    duration: 0.2,
    repeat: 1
  }, '<');
  // removes the flushing effect
  timeline.to(aliceOutputContainer.children[i].children[1], {    
    boxShadow: 'none',
    duration: 0
  });
  timeline.to(bobOutputContainer.children[i].children[1], {    
    boxShadow: 'none',
    duration: 0
  }, '<');
  // moves both devices to their final positions
  timeline.from(aliceOutputContainer.children[i].children[1], {
    x: aliceOutputBasisBitLocXY[i][0], 
    y: aliceOutputBasisBitLocXY[i][1],
    scale: aliceOutputBasisBitLocXY[i][2]
  });
  timeline.from(bobOutputContainer.children[i].children[1], {
    x: bobOutputBasisBitLocXY[i][0], 
    y: bobOutputBasisBitLocXY[i][1],
    scale: bobOutputBasisBitLocXY[i][2]
  }, '<');
// END of transmission stage
}

// START of the results analysis stage ///////////////////////////////////////////////

// custom label for the "Complete transmissions" button
timeline.addLabel('transmissionsCompleted');
// the following messages inform the user about different stages of the result analysis
// informs the user about the end of transmission stage
timeline.to('#message10', {    
  opacity: 1,
  duration: 3
}, '+=3');
timeline.to('#message10', {    
  opacity: 0 
});
// informs the user about the start of the Results Analysing Stage
timeline.to('#message20', {    
  opacity: 1,  
  duration: 3
});
timeline.to('#message20', {    
  opacity: 0 
});
// Receiver aknowledges publicly the reception of all bits
timeline.to('#message30', {    
  opacity: 1,  
  duration: 3
});
timeline.to('#message30', {    
  opacity: 0 
});
// Sender and Receiver share publicly all bases
timeline.to('#message40', {    
  opacity: 1,  
  duration: 3
});
// highlight all bases
timeline.to('.aliceOutputBasisBits, .bobOutputBasisBits', {    
  boxShadow: '0 0 ' + outputShineRangeBits + outputBasisShineColour,
  duration: 3
}, '<');
timeline.to('#message40', {    
  opacity: 0 
});
// marking of non-matching bases
timeline.to('#message50', {    
  opacity: 1,  
  duration: 3
});
timeline.to('.basisMismatch', {    
  boxShadow: '0 0 ' + outputShineRangeBits + basisMismatchShineColour,
  duration: 3
}, '<');
timeline.to('#message50', {    
  opacity: 0 
});
// highlight and discard the non-matching bases, transmissions
timeline.to('#message60', {    
  opacity: 1,  
  duration: 3
});
timeline.to('.transmissionBasisMismatch', {    
  boxShadow: '0 0 ' + outputShineRangeTransmissions + basisMismatchShineColour,
  backgroundColor: basisMismatchShineColour,
  duration: 3
}, '<');
timeline.to('#message60', {    
  opacity: 0 
});
timeline.to('.transmissionBasisMismatch', {     
  opacity: 0,
  duration: 3
}, '<');
// remove remaining highlighting
timeline.to('.aliceOutputBasisBits, .bobOutputBasisBits', {    
  boxShadow: '0 0 ' + outputShineOff + outputBasisShineColour,
});
// Checking for the Eavesdropper presence
timeline.to('#message70', {    
  opacity: 1,  
  duration: 3
});
timeline.to('#message70', {    
  opacity: 0 
});
// Sender and Receiver share publicly a subset of the output key bits
timeline.to('#message80', {    
  opacity: 1,  
  duration: 3
});
// highlight the subset
timeline.to('.aliceOutputSubsetKeyBits, .bobOutputSubsetKeyBits', {    
  boxShadow: '0 0 ' + outputShineRangeBits + outputSubsetKeyShineColour,
  duration: 3
}, '<');
timeline.to('#message80', {    
  opacity: 0 
});

// RED CASE - eavesdropper detected
timeline.to('#message110', {    
  opacity: function () {
    if ( redCase() ) {
      return 1;
    }
  },  
  duration: function () {
    if ( redCase() ) {
      return 3;
    }
    else {
      return 0;
    }
  }
});
// highlight the non-matching key bits
timeline.to('.keyMismatch', {    
  boxShadow: function () {
    if ( redCase() ) {
      return '0 0 ' + outputShineRangeBits + keyMismatchShineColour;
    }
  },
  duration: function () {
    if ( redCase() ) {
      return 3;
    }
    else {
      return 0;
    }
  }
}, '<');
// timeline gap
timeline.to('#message110', {    
  duration: function () {
    if ( redCase() ) {
      return 2;
    }
    else {
      return 0;
    }
  }
});
// fade out
timeline.to('#message110', {    
  opacity: function () {
    if ( redCase() ) {
      return 0;
    }
  },
  duration: function () {
    if ( redCase() ) {
      return 2;
    }
    else {
      return 0;
    }
  }
}); 
// Eavesdropper detected message
timeline.to('#message120', {    
  opacity: function () {
    if ( redCase() ) {
      return 1;
    }
  },  
  duration: function () {
    if ( redCase() ) {
      return 3;
    }
    else {
      return 0;
    }
  }
});
// timeline gap
timeline.to('#message120', {    
  duration: function () {
    if ( redCase() ) {
      return 5;
    }
    else {
      return 0;
    }
  }
});
// fade out
timeline.to('#message120', {    
  opacity: function () {
    if ( redCase() ) {
      return 0;
    }
  },
  duration: function () {
    if ( redCase() ) {
      return 2;
    }
    else {
      return 0;
    }
  }
}); 
// fade out all participants
timeline.to('.aliceOutputKeyBits, .bobOutputKeyBits, .eveInterferenceBits, .aliceOutputBasisBits, .bobOutputBasisBits', {    
  opacity: function () {
    if ( redCase() ) {
      return 0;
    }
  },
  duration: function () {
    if ( redCase() ) {
      return 2;
    }
    else {
      return 0;
    }
  }
}, '<');
// Animation Completed
timeline.to('#message150', {    
  opacity: function () {
    if ( redCase() ) {
      return 1;
    }
  },  
  duration: function () {
    if ( redCase() ) {
      return 3;
    }
    else {
      return 0;
    }
  }
});
// timeline gap
timeline.to('#message150', {    
  duration: function () {
    if ( redCase() ) {
      return 3;
    }
    else {
      return 0;
    }
  }
});
// fade out
timeline.to('#message150', {    
  opacity: function () {
    if ( redCase() ) {
      return 0;
    }
  },
  duration: function () {
    if ( redCase() ) {
      return 2;
    }
    else {
      return 0;
    }
  }
});


// NOT RED CASE, shared sequence of animations
// All shared Key Bits matched
timeline.to('#message90', {    
  opacity: function () {
    if ( !redCase() ) {
      return 1;
    }
  },  
  duration: function () {
    if ( !redCase() ) {
      return 3;
    }
    else {
      return 0;
    }
  }
});
// highlight the key subset
timeline.to('.transmissionKeySubset', {    
  boxShadow: function () {
    if ( !redCase() ) {
      return '0 0 ' + outputShineRangeTransmissions + outputSubsetKeyShineColour;
    }
  },
  backgroundColor: function () {
    if ( !redCase() ) {
      return outputSubsetKeyShineColour;
    }
  },
  duration: function () {
    if ( !redCase() ) {
      return 3;
    }
    else {
      return 0;
    }
  }
}, '<');
// fade out
timeline.to('#message90', {    
  opacity: function () {
    if ( !redCase() ) {
      return 0;
    }
  },
  duration: function () {
    if ( !redCase() ) {
      return 3;
    }
    else {
      return 0;
    }
  }
});
// remove the subset
timeline.to('.transmissionKeySubset', {     
  opacity: function () {
    if ( !redCase() ) {
      return 0;
    }
  },
  duration: function () {
    if ( !redCase() ) {
      return 3;
    }
    else {
      return 0;
    }
  }
}, '<');


// EVE NOT PRESENT
// prepare the message to the user
timeline.set("#message100", { 
  innerHTML: function () {
    if ( noEveCase() ) {
      return 'No Eavesdropper detected.<br>Quantum channel is safe.<br>Secret key achieved:<br>' + sharedKeyString;
    }
  },
  duration: 0
});
// display the message and shared key to the user
timeline.to("#message100", { 
  opacity: function () {
    if ( noEveCase() ) {
      return 1;
    }
  },
  duration: function () {
    if ( noEveCase() ) {
      return 3;
    }
    else {
      return 0;
    }
  }
});
// highlight the shared key bits
timeline.to('.aliceOutputKeyBits, .bobOutputKeyBits', {    
  boxShadow: function () {
    if ( noEveCase() ) {
      return '0 0 ' + outputShineRangeBits + sharedKeyColour
    }
  },
  duration: function () {
    if ( noEveCase() ) {
      return 3;
    }
    else {
      return 0;
    }
  }
}, '<');
// timeline gap
timeline.to('#message100', {    
  duration: function () {
    if ( noEveCase() ) {
      return 5;
    }
    else {
      return 0;
    }
  }
});
// fade out
timeline.to('#message100', {    
  opacity: function () {
    if ( noEveCase() ) {
      return 0;
    }
  },
  duration: function () {
    if ( noEveCase() ) {
      return 2;
    }
    else {
      return 0;
    }
  }
});
// remove all participants
timeline.to('.aliceOutputKeyBits, .bobOutputKeyBits, .eveInterferenceBits, .aliceOutputBasisBits, .bobOutputBasisBits', {    
  opacity: function () {
    if ( noEveCase() ) {
      return 0;
    }
  },
  duration: function () {
    if ( noEveCase() ) {
      return 2;
    }
    else {
      return 0;
    }
  }
}, '<');
// Animation Completed message
timeline.to('#message150', {    
  opacity: function () {
    if ( noEveCase() ) {
      return 1;
    }
  },  
  duration: function () {
    if ( noEveCase() ) {
      return 3;
    }
    else {
      return 0;
    }
  }
});
// timeline gap
timeline.to('#message150', {    
  duration: function () {
    if ( noEveCase() ) {
      return 3;
    }
    else {
      return 0;
    }
  }
})
timeline.to('#message150', {    
  opacity: function () {
    if ( noEveCase() ) {
      return 0;
    }
  },
  duration: function () {
    if ( noEveCase() ) {
      return 2;
    }
    else {
      return 0;
    }
  }
});

// EVE PRESENT
timeline.to(message130, {    
  opacity: function () {
    if ( eveCase() && !redCase() ) {
      if ( sharedKeyString === sharedKeyEveString ) {
        message130.innerHTML = 'Sender and Receiver could not detect the Eavesdropper.<br>Eavesdropper achieved the secret key.<br><br>Please see the Report, section 4.6.2 for details.';
      }
      else {
        message130.innerHTML = 'Sender and Receiver have achieved a secret key.<br>However, they could not detect the Eavesdropper.<br>Eavesdropper did not achieve this key.<br><br>Please see the Report, section 4.6.2 for details.';
      }      
      return 1;
    }
  },
  duration: function () {
    if ( eveCase() && !redCase() ) {
      return 3;
    }
    else {
      return 0;
    }
  }
});
// display the presumably shared key
timeline.to('.aliceOutputKeyBits, .bobOutputKeyBits, .sharedKeyEve', {    
  boxShadow: function () {
    if ( eveCase() && !redCase() ) {
      return '0 0 ' + outputShineRangeBits + sharedKeyEveColour
    }
  },
  duration: function () {
    if ( eveCase() && !redCase() ) {
      return 3;
    }
    else {
      return 0;
    }
  }
}, '<');
// timeline gap
timeline.to(message130, {    
  duration: function () {
    if ( eveCase() && !redCase() ) {
      return 10;
    }
    else {
      return 0;
    }
  }
});
// fade out
timeline.to(message130, {    
  opacity: function () {
    if ( eveCase() && !redCase() ) {
      return 0;
    }
  },
  duration: function () {
    if ( eveCase() && !redCase() ) {
      return 2;
    }
    else {
      return 0;
    }
  }
});
// remove all participants
timeline.to('.aliceOutputKeyBits, .bobOutputKeyBits, .eveInterferenceBits, .aliceOutputBasisBits, .bobOutputBasisBits', {    
  opacity: function () {
    if ( eveCase() && !redCase() ) {
      return 0;
    }
  },
  duration: function () {
    if ( eveCase() && !redCase() ) {
      return 2;
    }
    else {
      return 0;
    }
  }
}, '<');
// Animation Completed message
timeline.to('#message150', {    
  opacity: function () {
    if ( eveCase() && !redCase() ) {
      return 1;
    }
  },  
  duration: function () {
    if ( eveCase() && !redCase() ) {
      return 3;
    }
    else {
      return 0;
    }
  }
});
// timeline gap
timeline.to('#message150', {    
  duration: function () {
    if ( eveCase() && !redCase() ) {
      return 3;
    }
    else {
      return 0;
    }
  }
})
// fade out
timeline.to('#message150', {    
  opacity: function () {
    if ( eveCase() && !redCase() ) {
      return 0;
    }
  },
  duration: function () {
    if ( eveCase() && !redCase() ) {
      return 2;
    }
    else {
      return 0;
    }
  }
});