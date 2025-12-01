// ==UserScript==
// @name         Grepolis Mouse Wheel View Switch
// @namespace    https://flasktools.altervista.org
// @version      1.0
// @description  Allows changing the city/map/overview view with the mouse wheel.
// @match        https://*.grepolis.com/game/*
// @grant        none
// ==/UserScript==


(function () {
    'use strict';
    const uw = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

    uw.addEventListener('wheel', function (e) {
        if (e.ctrlKey) return; // don't interfere with browser zoom
        e.preventDefault();
        if (e.deltaY < 0) {
            uw.Layout.wnd.switchViewPrevious && uw.Layout.wnd.switchViewPrevious();
        } else {
            uw.Layout.wnd.switchViewNext && uw.Layout.wnd.switchViewNext();
        }
    }, { passive: false });

    // Add the keyboard shortcuts for switching views
    uw.document.onkeydown = function (e) {
        e = e || uw.window.event;
        var target = e.target.tagName.toLowerCase();
        console.log(e);

        function letter(letter) { return e.key == letter.toLowerCase() || e.key == letter.toUpperCase() }

        // If not in a text input and no modifier keys are pressed
        if (!uw.$(e.target).is('textarea') && !uw.$(e.target).is('input') && !e.ctrlKey && !e.metaKey && !e.altKey) {
            // Switch to previous view with 'Q'
            if (letter("k")) uw.PlaceWindowFactory.openPlaceWindow('culture');
            // simulator
            if (letter("j")) uw.PlaceWindowFactory.openPlaceWindow('simulator', open);
            // Troupes en dehors
            if (letter("h")) uw.PlaceWindowFactory.openPlaceWindow('units_beyond');
            // Défense (Agora)
            if (letter("g")) uw.PlaceWindowFactory.openPlaceWindow('index');
            // Remparts
            if (letter("m")) uw.BuildingWindowFactory.open('wall');
            // RACOURCI Administrateur
            if (letter("q")) uw.TownOverviewWindowFactory.openTradeOverview();
            if (letter("w")) uw.TownOverviewWindowFactory.openCommandOverview();
            if (letter("e")) uw.TownOverviewWindowFactory.openMassRecruitOverview();
            if (letter("r")) uw.TownOverviewWindowFactory.openUnitsOverview();
            if (letter("t")) uw.TownOverviewWindowFactory.openOuterUnitsOverview();
            if (letter("y")) uw.TownOverviewWindowFactory.openBuildingsOverview();
            if (letter("u")) uw.TownOverviewWindowFactory.openCultureOverview();
            if (letter("i")) uw.TownOverviewWindowFactory.openGodsOverview();
            if (letter("o")) uw.TownOverviewWindowFactory.openHidesOverview();
            if (letter("p")) uw.TownOverviewWindowFactory.openTownGroupOverview();
            if (e.key == "²" || e.code == "Minus" || e.keyCode == "63" || e.key == "-") uw.TownOverviewWindowFactory.openTownsOverview();
            // Villages de paysans
            if (letter("x")) (() => { const e = FarmTownOverviewWindowFactory.openFarmTownOverview(); setTimeout(() => { e.getElement().querySelector(".select_all")?.click() }, 500 + Math.random() * 500) })();
            if (e.key == "Enter") $('#fto_claim_button').length && $('#fto_claim_button').trigger('click');
            // Plannificateur
            if (e.key == "`" || e.code == "Equal" || (MID == 'de' ? letter("r") : letter("z"))) uw.AttackPlannerWindowFactory.openAttackPlannerWindow();
            // Outil de réservation
            if (e.code == "ShiftRight") uw.hOpenWindow.openReservationList(); void (0);
            // Council of heroes
            if (letter("h") && $('.ui_heroes_overview_container').is(':visible')) uw.HeroesWindowFactory.openHeroesWindow();
            // FLASK-Tools settings
            if (letter("d")) openSettings();
        }
    };
})();

