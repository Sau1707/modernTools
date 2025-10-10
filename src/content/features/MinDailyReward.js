// ==UserScript==
// @name         Grepolis – Auto-minimize Daily Reward
// @namespace    https://example.local
// @version      1.0
// @description  Minimizes the daily reward window on game start.
// @match        https://*.grepolis.com/game/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function minimizeDailyReward() {
        const daily = document.querySelector('.daily_login');
        if (!daily) return;

        // Click the "minimize" button if present
        const btn = daily.querySelector('.minimize');
        if (btn && typeof btn.click === 'function') {
            btn.click();
        }
    }

    function initObserver() {
        // In case the window is already present
        minimizeDailyReward();

        // Watch for the window being added, then stop after a short time
        const obs = new MutationObserver(() => {
            minimizeDailyReward();
        });

        obs.observe(document.body, { childList: true, subtree: true });

        // Disconnect after a few seconds like Flasktool does
        setTimeout(() => obs.disconnect(), 3000);
    }

    if (document.readyState === 'loading') {
        // Start as early as possible
        document.addEventListener('DOMContentLoaded', initObserver, { once: true });
    } else {
        initObserver();
    }
})();
