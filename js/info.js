'use strict'
// imports the body and font global settings
import { adjustBodyAndFontSizes } from '../js/index.js';
// applies them once on load, and then re-adjusts them every time the window is resized
adjustBodyAndFontSizes();
window.addEventListener('resize', adjustBodyAndFontSizes);

// defines the animation for key bits interchange
const timelineKeyBits = gsap.timeline({ 
  defaults: { duration: 2 }, 
  repeat: -1 
});
timelineKeyBits
  .to('.superpositionBit0', { opacity: 0 })
  .to('.superpositionBit1', { opacity: 1 }, '<')
  .to('.superpositionBit0', { opacity: 1 })
  .to('.superpositionBit1', { opacity: 0 }, '<')