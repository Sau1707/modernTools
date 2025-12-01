// ==UserScript==
// @name         Incoming Attack Alarm + Persistent X Button
// @namespace    extracted.grcrt.alarm.toggleX.persistent
// @match        *://*.grepolis.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function () {

    const ALARM_SOUND = "https://cdn.grcrt.net/ui/s/alarm.mp3";
    let alarmEnabled = true;

    let audio = new Audio(ALARM_SOUND);
    audio.loop = true;


    // --------------------------------------------------
    // Add X button inside #toolbar_activity_attack_indicator
    // Called repeatedly by MutationObserver
    // --------------------------------------------------
    function addXButton() {
        const container = document.querySelector("#toolbar_activity_attack_indicator");
        if (!container) return;

        // If removed or replaced, recreate
        let xBtn = document.getElementById("alarmToggleX");
        if (!xBtn) {
            xBtn = document.createElement("div");
            xBtn.id = "alarmToggleX";
            xBtn.textContent = "X";
            xBtn.style.zIndex = "1"
            xBtn.style.position = "absolute";
            xBtn.style.top = "-27px";
            xBtn.style.right = "1px";
            xBtn.style.cursor = "pointer";
            xBtn.style.fontWeight = "bold";
            xBtn.style.fontSize = "11px";
            xBtn.style.color = alarmEnabled ? "#ff4444" : "#888";
            xBtn.title = "Disable/Enable alarm";

            xBtn.onclick = () => {
                alarmEnabled = !alarmEnabled;
                xBtn.style.color = alarmEnabled ? "#ff4444" : "#888";
                if (!alarmEnabled) {
                    audio.pause();
                    audio.currentTime = 0;
                }
            };

            container.style.position = "relative";
            container.appendChild(xBtn);
        }
    }


    // --------------------------------------------------
    // Alarm trigger (original behavior)
    // --------------------------------------------------
    function triggerAlarm(count) {
        if (!alarmEnabled) return;

        if (count > 0) {
            audio.play().catch(() => { });
        } else {
            audio.pause();
            audio.currentTime = 0;
        }
    }


    // --------------------------------------------------
    // Get incoming count
    // --------------------------------------------------
    function getIncomingCount() {
        try {
            return require("helpers/commands").getTotalCountOfIncomingAttacks();
        } catch (e) {
            return 0;
        }
    }

    // Polling
    setInterval(() => {
        triggerAlarm(getIncomingCount());
    }, 10000);

    triggerAlarm(getIncomingCount());


    // --------------------------------------------------
    // Observe attack indicator AND re-add button on each change
    // --------------------------------------------------
    function observeIndicator() {
        const el = document.querySelector("div.activity.attack_indicator");
        if (!el) {
            setTimeout(observeIndicator, 200);
            return;
        }

        // Add button immediately
        addXButton();

        new MutationObserver(() => {
            // Add/re-add button every time DOM changes
            addXButton();

            const active = el.classList.contains("active");
            const cntEl = el.querySelector("div.count");
            const count = active && cntEl ? parseInt(cntEl.textContent.trim()) : 0;
            triggerAlarm(count);

        }).observe(el, { childList: true, attributes: true, subtree: true });
    }

    observeIndicator();

})();
