// ==UserScript==
// @name         Grepolis Mouse Wheel View Switch
// @namespace    https://flasktools.altervista.org
// @version      1.0
// @description  Allows changing the city/map/overview view with the mouse wheel.
// @match        https://*.grepolis.com/game/*
// @grant        none
// ==/UserScript==

// Credi sia possibile aggiungere una shortcut da tastiera a questo bottone?

(function () {
    'use strict';

    const uw = unsafeWindow || window;

    // Prevent zoom and use scroll to switch views
    window.addEventListener('wheel', function (e) {
        if (e.ctrlKey) return; // don't interfere with browser zoom
        e.preventDefault();
        if (e.deltaY < 0) {
            uw.Layout.wnd.switchViewPrevious && uw.Layout.wnd.switchViewPrevious();
        } else {
            uw.Layout.wnd.switchViewNext && uw.Layout.wnd.switchViewNext();
        }
    }, { passive: false });
})();

