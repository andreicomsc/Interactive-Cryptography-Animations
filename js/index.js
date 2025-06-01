'use strict'

// GLOBAL function for body and font size settings dynamic adjustment
// it is used by all other pages
export function adjustBodyAndFontSizes() { 

  // define the constants for the enclosure and font ratios
  const enclosureRatio = 1.9;
  const enclosureFontRatio = 0.014;
  
  // define variables
  let enclosureWidth = window.innerWidth;
  let enclosureHeight = window.innerHeight;
  let enclosure = document.getElementById("enclosure");

  // adjust enclosure size to keep inside viewport
  if ( enclosureWidth > enclosureHeight ) {
    if ( enclosureWidth / enclosureHeight > enclosureRatio ) {
      enclosureWidth = enclosureHeight * enclosureRatio;
    }
    else {
      enclosureHeight = enclosureWidth / enclosureRatio;
    }
  }
  else {
    enclosureHeight = enclosureWidth / enclosureRatio;
  }

  // assign new values to enclosure size
  enclosure.style.height = enclosureHeight + 'px';
  enclosure.style.width = enclosureWidth + 'px';

  // set the base font size
  let adjustedFontSize = enclosureHeight * enclosureFontRatio;
  document.body.style.fontSize = adjustedFontSize + 'px';

  // define the main header sizes
  let headers1 = document.querySelectorAll('.header1');
  let headers2 = document.querySelectorAll('.header2');
  let headers3 = document.querySelectorAll('.header3');
  let headers4 = document.querySelectorAll('.header4');
  let headers5 = document.querySelectorAll('.header5');
  let headers10 = document.querySelectorAll('.header10');
  let baseFontMinus = document.querySelectorAll('.baseFontMinus');

  // dynamically adjust all headers
  headers1.forEach(function(header) {
        header.style.fontSize = adjustedFontSize * 1.5 + 'px';
  });
  headers2.forEach(function(header) {
    header.style.fontSize = adjustedFontSize * 2 + 'px';
  });
  headers3.forEach(function(header) {
    header.style.fontSize = adjustedFontSize * 3 + 'px';
  });
  headers4.forEach(function(header) {
    header.style.fontSize = adjustedFontSize * 4 + 'px';
  });
  headers5.forEach(function(header) {
    header.style.fontSize = adjustedFontSize * 5 + 'px';
  });
  headers10.forEach(function(header) {
    header.style.fontSize = adjustedFontSize * 10 + 'px';
  });
  baseFontMinus.forEach(function(baseFont) {
    baseFont.style.fontSize = adjustedFontSize * 0.96 + 'px';
  });
};

function isMobile() {
  return /Mobi|Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isPhone() {  
  let screenWidth = screen.width;
  let screenHeight = screen.height;
  let screenRatio = 0;

  if ( screenWidth > screenHeight ) { screenRatio = screenWidth / screenHeight }
  else { screenRatio = screenHeight / screenWidth }
  
  if ( screenRatio > 2 ) { return true; }
  else { return false; }
}

function isChrome() {
  return /Chrome/i.test(navigator.userAgent) && /Google Inc/i.test(navigator.vendor);
}

// loads and monitors size settings for the current page
adjustBodyAndFontSizes();
window.addEventListener('resize', adjustBodyAndFontSizes);

if ( isMobile() || isPhone() ) {
  alert(`This application is optimised for Desktop only. Please switch to a PC/Laptop for the best experience.`);
}  
else {
  if ( !isChrome() ) {
    alert(`This application is optimised for Google Chrome Browser. Please switch to Chrome for the best experience.`);
  }
}