'use strict'

// GLOBAL function for body and font size settings dynamic adjustment
// it is used by all other pages
export function adjustBodyAndFontSizes() { 





  








  // defines the min window height and the window to font ratio
  const bodyMinHeight = 600;  
  const windowToFontRatio = 0.014;
  // sets the body min height
  document.body.style.minHeight = bodyMinHeight + 'px';
  // limits the min height for font size purposes
  let windowCurrentHeight = window.innerHeight;
  if ( windowCurrentHeight < bodyMinHeight ) {
     windowCurrentHeight = bodyMinHeight; 
  }
  // sets the base font size
  let adjustedFontSize = windowCurrentHeight * windowToFontRatio;
  document.body.style.fontSize = adjustedFontSize + 'px';

  // defines the main header sizes
  let headers1 = document.querySelectorAll('.header1');
  let headers2 = document.querySelectorAll('.header2');
  let headers3 = document.querySelectorAll('.header3');
  let headers4 = document.querySelectorAll('.header4');
  let headers5 = document.querySelectorAll('.header5');
  let headers10 = document.querySelectorAll('.header10');
  let baseFontMinus = document.querySelectorAll('.baseFontMinus');

  // dynamically adjusts all headers
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

// loads and monitors size settings for the current page
adjustBodyAndFontSizes();
window.addEventListener('resize', adjustBodyAndFontSizes);

// checks if the browser is Chrome and displays a prompt
const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
if (!isChrome) {
  alert(`This application is optimised for Google Chrome.
Please switch to Chrome Browser for the best experience.`);
}