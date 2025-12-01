// ==UserScript==
// @name         MinDailyReward
// @author       Sau1707 - Taken from Flasktool
// @description  Auto-minimize Daily Reward
// @version      1.0.0
// @include      http://*.grepolis.*/game/*
// @icon         https://raw.githubusercontent.com/Sau1707/modernTools/refs/heads/main/public/logo.png
// @updateURL    https://github.com/Sau1707/modernTools/raw/refs/heads/main/src/content/MinDailyReward.user.js
// @downloadURL  https://github.com/Sau1707/modernTools/raw/refs/heads/main/src/content/MinDailyReward.user.js
// @grant        unsafeWindow
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
