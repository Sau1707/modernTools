// ==UserScript==
// @name		FLASK-TOOLS
// @namespace	https://flasktools.altervista.org
// @version		7.27
// @author		flasktools
// @description FLASK-Tools is a small extension for the browser game Grepolis. (counter, displays, smilies, trade options, changes to the layout)
// @copyright	2019+, flasktools
// @license     MIT
// @match		https://*.grepolis.com/game/*
// @match		https://*.forum.grepolis.com/*
// @match		https://flasktools.altervista.org/*
// @updateURL   https://github.com/flasktools/flasktools/raw/main/FLASK-TOOLS.user.js
// @downloadURL https://github.com/flasktools/flasktools/raw/main/FLASK-TOOLS.user.js
// @icon		https://flasktools.altervista.org/images/166d6p2.png
// @icon64		https://flasktools.altervista.org/images/Beuta-mini.png
// @require		http://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js
// @grant		GM_setValue
// @grant		GM_getValue
// @grant		GM_deleteValue
// @grant		GM_xmlhttpRequest
// @grant		GM_getResourceURL
// ==/UserScript==

var version = '7.27';

//https://flasktools.altervista.org/images/166d6p2.png - FLASK-Tools-Icon

/*******************************************************************************************************************************
 * Global stuff
 *******************************************************************************************************************************/
var uw = unsafeWindow || window, $ = uw.jQuery || jQuery, DATA, GM;

// GM-API?
GM = (typeof GM_info === 'object');

console.log('%c|= FLASK-Tools is active =|', 'color: green; font-size: 1em; font-weight: bolder; ');

function loadValue(name, default_val) {
    var value;
    if (GM) {
        value = GM_getValue(name, default_val);
    } else {
        value = localStorage.getItem(name) || default_val;
    }

    if (typeof (value) === "string") {
        value = JSON.parse(value)
    }
    return value;
}

// LOAD DATA
if (GM && (uw.location.pathname.indexOf("game") >= 0)) {
    var WID = uw.Game.world_id, MID = uw.Game.market_id, AID = uw.Game.alliance_id;
    //GM_deleteValue(WID + "_bullseyeUnit");

    DATA = {
        // GLOBAL
        options: loadValue("options", "{}"),

        user: loadValue("flask_user", "{}"),
        count: loadValue("flask_count", "[]"),

        notification: loadValue('notif', '0'),

        error: loadValue('error', '{}'),

        spellbox: loadValue("spellbox", '{ "top":"23%", "left": "-150%", "show": false }'),
        commandbox: loadValue("commandbox", '{ "top":55, "left": 250 }'),
        tradebox: loadValue("tradebox", '{ "top":55, "left": 450 }'),

        // WORLD
        townTypes: loadValue(WID + "_townTypes", "{}"),
        sentUnits: loadValue(WID + "_sentUnits", '{ "attack": {}, "support": {} }'),

        biremes: loadValue(WID + "_biremes", "{}"), //old
        bullseyeUnit: loadValue(WID + "_bullseyeUnit", '{ "current_group" : -1 }'), // new

        worldWonder: loadValue(WID + "_wonder", '{ "ratio": {}, "storage": {}, "map": {} }'),

        clickCount: loadValue(WID + "_click_count", '{}'), // old
        statistic: loadValue(WID + "_statistic", '{}'), // new

        // MARKET
        worldWonderTypes: loadValue(MID + "_wonderTypes", '{}')
    };

    if (!DATA.worldWonder.map) {
        DATA.worldWonder.map = {};
    }

    // Temporary:
    if (typeof DATA.options.trd == 'boolean') {
        DATA.options.per = DATA.options.rec = DATA.options.trd; delete DATA.options.trd;
    }
    if (typeof DATA.options.mov == 'boolean') {
        DATA.options.act = DATA.options.mov; delete DATA.options.mov;
    }
    if (typeof DATA.options.twn == 'boolean') {
        DATA.options.tic = DATA.options.til = DATA.options.tim = DATA.options.twn; delete DATA.options.twn;
    }
    if (GM) GM_deleteValue("notification");
}

// GM: EXPORT FUNCTIONS
uw.saveValueGM = function (name, val) {
    setTimeout(function () {
        GM_setValue(name, val);
    }, 0);
};

uw.deleteValueGM = function (name) {
    setTimeout(function () {
        GM_deleteValue(name);
    }, 0);
};

uw.getImageDataFromCanvas = function (x, y) {

    // console.debug("HEY", document.getElementById('canvas_picker').getContext('2d').getImageData(x, y, 1, 1));
};
uw.calculateConcaveHull = function () {
    var contour = [
        new poly2tri.Point(100, 100),
        new poly2tri.Point(100, 300),
        new poly2tri.Point(300, 300),
        new poly2tri.Point(300, 100)
    ];

    var swctx = new poly2tri.SweepContext(contour);

    swctx.triangulate();
    var triangles = swctx.getTriangles();

    // console.debug(triangles);

    return triangles;
};

if (typeof exportFunction == 'function') {
    // Firefox > 30
    //uw.DATA = cloneInto(DATA, unsafeWindow);
    exportFunction(uw.saveValueGM, unsafeWindow, { defineAs: "saveValueGM" });
    exportFunction(uw.deleteValueGM, unsafeWindow, { defineAs: "deleteValueGM" });
    exportFunction(uw.calculateConcaveHull, unsafeWindow, { defineAs: "calculateConcaveHull" });
    exportFunction(uw.getImageDataFromCanvas, unsafeWindow, { defineAs: "getImageDataFromCanvas" });
} else {
    // Firefox < 30, Chrome, Opera, ...
    //uw.DATA = DATA;
}

var time_a, time_b;

// APPEND SCRIPT
function appendScript() {
    //console.log("GM-API: " + gm_bool);
    if (document.getElementsByTagName('body')[0]) {
        var flaskscript = document.createElement('script');
        flaskscript.type = 'text/javascript';
        flaskscript.id = 'flasktools';

        time_a = uw.Timestamp.client();
        flaskscript.textContent = FLASK_GAME.toString().replace(/uw\./g, "") + "\n FLASK_GAME('" + version + "', " + GM + ", '" + JSON.stringify(DATA).replace(/'/g, "##") + "', " + time_a + ");";
        document.body.appendChild(flaskscript);
    } else {
        setTimeout(function () {
            appendScript();
        }, 500);
    }
}

if (location.host === "flasktools.altervista.org") {
    // PAGE
    FLASK_PAGE();
}
else if ((uw.location.pathname.indexOf("game") >= 0) && GM) {
    // GAME
    appendScript();
}
else {
    FLASK_FORUM();
}

function FLASK_PAGE() {
    if (typeof GM_info == 'object') {
        setTimeout(function () {
            flask_user = JSON.parse(loadValue("flask_user", ""));
            console.log(flask_user);
            uw.flask_version = parseFloat(version);
        }, 0);
    } else {
        flask_user = localStorage.getItem("flask_user") || "";

        flask_version = parseFloat(version);
    }
}
function FLASK_FORUM() {
    var smileyArray = [];

    var _isSmileyButtonClicked = false;

    smileyArray.standard = [
        "smilenew", "grin", "lol", "neutral_new", "afraid", "freddus_pacman", "auslachen2", "kolobok-sanduhr", "bussi2", "winken4", "flucht2", "panik4", "ins-auge-stechen",
        "seb_zunge", "fluch4_GREEN", "baby_junge2", "blush-reloaded6", "frown", "verlegen", "blush-pfeif", "stevieh_rolleyes", "daumendreh2", "baby_taptap",
        "sadnew", "hust", "confusednew", "idea2", "irre", "irre4", "sleep", "candle", "nicken", "no_sad",
        "thumbs-up_new", "thumbs-down_new", "bravo2", "oh-no2", "kaffee2", "drunk", "saufen", "freu-dance", "hecheln", "headstand", "rollsmiliey", "eazy_cool01", "motz", "cuinlove", "biggrin"
    ];
    smileyArray.grepolis = [
        "mttao_wassermann", "hera", /* Hera */ "medusa", /* Medusa */ "manticore", /* Mantikor */ "cyclops", /* Zyklop */
        "minotaur", /* Minotaurus */ "pegasus", /* Pegasus */ "hydra", /* Hydra */
        "silvester_cuinlove", "mttao_schuetze", "kleeblatt2", "wallbash", /* "glaskugel4", */ /* "musketiere_fechtend",*/ /* "krone-hoch",*/ "viking", // Wikinger
        /* "mttao_waage2", */ "steckenpferd", /* "kinggrin_anbeten2", */ "grepolove", /* Grepo Love */ "skullhaufen", "grepo_pacman" /*, "pferdehaufen" */ // "i/ckajscggscw4s2u60"
    ];

    var ForumObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {

            if (mutation.addedNodes[0]) {

                //console.debug("Added Nodes", mutation.addedNodes[0]);

                // Message Box geladen
                if (mutation.addedNodes[0].className === "redactor_box") {

                    //console.debug("Message Box geladen");

                    ForumObserver.observe($(".redactor_box").get(0), {
                        attributes: false,
                        childList: true,
                        characterData: false,
                        subtree: true
                    });
                }

                // Toolbar der Message Box geladen
                if (_isSmileyButtonClicked === false && mutation.addedNodes[0].className === "redactor_toolbar") {
                    $(".redactor_btn_smilies").click();

                    // Soll sich nicht wieder deaktivieren
                    _isSmileyButtonClicked = true;
                }

                // Smileybar der Toolbar geladen
                if (mutation.addedNodes[0].className === "redactor_smilies") {

                    // Observer soll nicht mehr feuern, wenn die Smileys hinzugefügt werden
                    ForumObserver.disconnect();

                    // Hässliche Smileys entfernen
                    $(".smilieCategory ul").empty();

                    // Greensmileys hinzufügen
                    for (var smiley in smileyArray.standard) {
                        if (smileyArray.standard.hasOwnProperty(smiley)) {
                            $(".smilieCategory ul").append(
                                '<li class="Smilie" data-text="">' +
                                '<img src="https://flasktools.altervista.org/images/smileys/standard/smiley_emoticons_' + smileyArray.standard[smiley] + '.gif" title="" alt="" data-smilie="yes">' +
                                '</li>'
                            );
                        }
                    }

                    $(".smilieCategory ul").append("<br><br>");

                    for (var smiley in smileyArray.grepolis) {
                        if (smileyArray.grepolis.hasOwnProperty(smiley)) {
                            $(".smilieCategory ul").append(
                                '<li class="Smilie" data-text="">' +
                                '<img src="https://flasktools.altervista.org/images/smileys/grepolis/smiley_emoticons_' + smileyArray.grepolis[smiley] + '.gif" title="" alt="" data-smilie="yes">' +
                                '</li>'
                            );
                        }
                    }

                    _isSmileyBarOpened = true;
                }
            }
        });
    });

    // Smiley-Button aktivieren, um die Smiley-Toolbar zu öffnen
    if ($(".redactor_btn_smilies").get(0)) {
        $(".redactor_btn_smilies").click();

        _isSmileyButtonClicked = true;
    }

    // Observer triggern
    if ($("#QuickReply").get(0)) {
        ForumObserver.observe($("#QuickReply div").get(0), {
            attributes: false,
            childList: true,
            characterData: false,
            subtree: true
        });
    }
    else if ($("#ThreadReply").get(0)) {
        ForumObserver.observe($("#ThreadReply div").get(0), {
            attributes: false,
            childList: true,
            characterData: false,
            subtree: true
        });
    }
    /*
     else if($("#ThreadCreate").get(0)) {
     ForumObserver.observe($("#ThreadCreate fieldset .ctrlUnit dd div").get(0), {
     attributes: false,
     childList: true,
     characterData: false
     });
     }
     */

    // Threaderstellung, Signatur bearbeiten, Beitrag bearbeiten
    else if ($("form.Preview").get(0)) {

        ForumObserver.observe($("form.Preview .ctrlUnit dd div").get(0), {
            attributes: false,
            childList: true,
            characterData: false
        });
    }
    else if (typeof ($("form.AutoValidator").get(0)) !== "undefined") {

        ForumObserver.observe($("form.AutoValidator .messageContainer div").get(0), {
            attributes: false,
            childList: true,
            characterData: false
        });
    }

    // TODO: Bearbeiten, Nachrichten
}



function FLASK_GAME(version, gm, DATA, time_a) {
    var MutationObserver = uw.MutationObserver || window.MutationObserver,

        WID, MID, AID, PID, TID, pName,

        flask_sprite = "https://flasktools.altervista.org/images/vxk8zp.png", // https://flasktools.altervista.org/images/r2w2lt.png,
        flask_img = '<img src="https://flasktools.altervista.org/images/166d6p2.png" style="width: 20px;float:left;margin: 1px 4px 0px -3px">';

    if (uw.location.pathname.indexOf("game") >= 0) {
        DATA = JSON.parse(DATA.replace(/##/g, "'"));

        WID = uw.Game.world_id;
        MID = uw.Game.market_id;
        AID = uw.Game.alliance_id;
        PID = uw.Game.player_id;
        TID = uw.Game.townId;
        pName = uw.Game.player_name;

        // World with Artemis ??
        uw.Game.hasArtemis = true; //Game.constants.gods.length == 6;
        uw.Game.hasAphrodite = true; //Game.constants.gods.length == 7;
        uw.Game.hasAres = true; //Game.constants.gods.length == 8;
    }

    $.prototype.reverseList = [].reverse;

    // Implement old jQuery method (version < 1.9)
    $.fn.toggleClick = function () {
        var methods = arguments;    // Store the passed arguments for future reference
        var count = methods.length; // Cache the number of methods

        // Use return this to maintain jQuery chainability
        // For each element you bind to
        return this.each(function (i, item) {
            // Create a local counter for that element
            var index = 0;

            // Bind a click handler to that element
            $(item).on('click', function () {
                // That when called will apply the 'index'th method to that element
                // the index % count means that we constrain our iterator between 0
                // and (count-1)
                return methods[index++ % count].apply(this, arguments);
            });
        });
    };

    function saveValue(name, val) {
        if (gm) {
            saveValueGM(name, val);
        } else {
            localStorage.setItem(name, val);
        }
    }

    function deleteValue(name) {
        if (gm) {
            deleteValueGM(name);
        } else {
            localStorage.removeItem(name);
        }
    }

    /*******************************************************************************************************************************
     * Graphic filters
     *******************************************************************************************************************************/
    if (uw.location.pathname.indexOf("game") >= 0) {
        $('<svg width="0%" height="0%">' +
            // GREYSCALE
            '<filter id="GrayScale">' +
            '<feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0 0 0 1 0">' +
            '</filter>' +
            // SEPIA
            '<filter id="Sepia">' +
            '<feColorMatrix type="matrix" values="0.343 0.669 0.119 0 0 0.249 0.626 0.130 0 0 0.172 0.334 0.111 0 0 0.000 0.000 0.000 1 0">' +
            '</filter>' +
            // SATURATION
            '<filter id="Saturation"><feColorMatrix type="saturate" values="0.2"></filter>' +
            '<filter id="Saturation1"><feColorMatrix type="saturate" values="1"></filter>' +
            '<filter id="Saturation2"><feColorMatrix type="saturate" values="2"></filter>' +
            // HUE
            '<filter id="Hue1"><feColorMatrix type="hueRotate" values= "65"></filter>' +
            '<filter id="Hue2"><feColorMatrix type="hueRotate" values="150"></filter>' +
            '<filter id="Hue3"><feColorMatrix type="hueRotate" values="-65"></filter>' +
            // BRIGHTNESS
            '<filter id="Brightness15">' +
            '<feComponentTransfer><feFuncR type="linear" slope="1.5"/><feFuncG type="linear" slope="1.5"/><feFuncB type="linear" slope="1.5"/></feComponentTransfer>' +
            '</filter>' +
            '<filter id="Brightness12">' +
            '<feComponentTransfer><feFuncR type="linear" slope="1.2"/><feFuncG type="linear" slope="1.2"/><feFuncB type="linear" slope="1.2"/></feComponentTransfer>' +
            '</filter>' +
            '<filter id="Brightness11">' +
            '<feComponentTransfer><feFuncR type="linear" slope="1.1"/><feFuncG type="linear" slope="1.1"/><feFuncB type="linear" slope="1.1"/></feComponentTransfer>' +
            '</filter>' +
            '<filter id="Brightness10">' +
            '<feComponentTransfer><feFuncR type="linear" slope="1.0"/><feFuncG type="linear" slope="1.0"/><feFuncB type="linear" slope="1.0"/></feComponentTransfer>' +
            '</filter>' +
            '<filter id="Brightness07">' +
            '<feComponentTransfer><feFuncR type="linear" slope="0.7"/><feFuncG type="linear" slope="0.7"/><feFuncB type="linear" slope="0.7"/></feComponentTransfer>' +
            '</filter>' +
            '</svg>').appendTo('#ui_box');
    }

    /*******************************************************************************************************************************
     * Language versions: german, english, italian, french, russian, polish, spanish
     *******************************************************************************************************************************/
    var LANG = {
        de: {
            settings: {
                dsc: "FLASK-Tools bietet unter anderem einige Anzeigen, eine Smileyauswahlbox,<br>Handelsoptionen und einige Veränderungen des Layouts.",
                act: "Funktionen der Toolsammlung aktivieren/deaktivieren:",
                prv: "Vorschau einzelner Funktionen:",

                version_old: "FLASK-Tools-Version ist nicht aktuell",
                version_new: "FLASL-Tools-Version ist aktuell",
                version_dev: "FLASL-Tools-Entwicklerversion",

                version_update: "Aktualisieren",

                link_forum: "https://de.forum.grepolis.com/index.php?threads/script-flasktools.36557/#post-600028", //"https://de.forum.grepolis.com/index.php?threads/script-flasktools.36557/"
                link_contact: "https://de.forum.grepolis.com/index.php?members/iranes.58817/",
                link_script: "https://github.com/flasktools/flasktools/raw/main/FLASK-TOOLS.user.js",

                forum: "Forum",
                author: "Autor",

                cat_units: "Einheiten",
                cat_icons: "Stadticons",
                cat_forum: "Forum",
                cat_trade: "Handel",
                cat_layout: "Layout",
                cat_view: "Ansicht",
                cat_other: "Sonstiges",
                cat_wonders: "Weltwunder"
            },
            options: {
                //bir: ["Biremenzähler", "Zählt die jeweiligen Biremen einer Stadt und summiert diese.<br><br>Anzeige im Minimap-Bullauge oben links"],
                ava: ["Einheitenübersicht", "Zeigt die Einheiten aller Städte an"],
                sml: ["Smileys", "Erweitert die BBCode-Leiste um eine Smileybox"],
                str: ["Einheitenstärke", "Fügt mehrere Einheitenstärketabellen in verschiedenen Bereichen hinzu"],
                tra: ["Transportkapazität", "Zeigt die belegte und verfügbare Transportkapazität im Einheitenmenu an"],
                per: ["Prozentualer Handel", "Erweitert das Handelsfenster um einen Prozentualer Handel"],
                rec: ["Rekrutierungshandel", "Erweitert das Handelsfenster um einen Rekrutierungshandel"],
                cnt: ["EO-Zähler", "Zählt die ATT/UT-Anzahl im EO-Fenster"],
                way: ["Laufzeit", "Zeigt im ATT/UT-Fenster die Laufzeit bei Verbesserter Truppenbewegung an"],
                sim: ["Simulator", "Anpassung des Simulatorlayouts & permanente Anzeige der Erweiterten Modifikatorbox"],
                act: ["Aktivitätsboxen", "Verbesserte Anzeige der Handels- und Truppenaktivitätsboxen (Positionsspeicherung)"],
                pop: ["Gunst-Popup", 'Ändert das Aussehen des Gunst-Popups'],
                tsk: ["Taskleiste", 'Vergrößert die Taskleiste und minimiert das "Tägliche Belohnung"-Fenster beim Start'],
                mdr: ["Tägliche Belohnung", 'Minimiert das "Tägliche Belohnung"-Fenster beim Start'],
                bbc: ["DEF-Formular", "Erweitert die BBCode-Leiste um ein automatisches DEF-Formular"],
                com: ["Einheitenvergleich", "Fügt Einheitenvergleichstabellen hinzu"],
                tic: ["Stadticons", "Jede Stadt erhält ein Icon für den Stadttyp (Automatische Erkennung)", "Zusätzliche Icons stehen bei der manuellen Auswahl zur Verfügung"],
                til: ["Stadtliste", "Fügt die Stadticons zur Stadtliste hinzu"],
                tim: ["Karte", "Setzt die Stadticons auf die strategische Karte"],
                con: ["Kontextmenu", 'Vertauscht "Stadt selektieren" und "Stadtübersicht" im Kontextmenu'],
                sen: ["Abgeschickte Einheiten", 'Zeigt im Angriffs-/Unterstützungsfenster abgeschickte Einheiten an'],
                tov: ["Stadtübersicht", 'Ersetzt die neue Stadtansicht mit der alten Fensteransicht'],
                scr: ["Mausrad-Zoom", 'Man kann mit dem Mausrad die 3 Ansichten wechseln'],
                tbc: ["Stadtbbcode", "Fügt den Stadt-BBCode zur Registerkarte Stadt hinzu"],
                stt: ["Weltstatistiken", "Fügt eine Knopfe hinzu, um die Weltstatistiken zu sehen"],
                cov: ["Kulturübersicht", 'Fügt eine Zählung für Parteien in der Kulturübersicht hinzu. Dies wird von den Quacktool hinzugefügt'],
                suh: ["Wählen Sie Einheiten-Helfer", 'Verbesserte neue Tools im Angriffs- und Supportfenster. Dies wird vom Quacktool hinzugefügt'],
                ubv: ["Einheiten außerhalb der Sicht", 'Neue Tools im Agorà-Fenster wurden verbessert. Dies wird vom Quacktool hinzugefügt'],
                tti: ["Ressourcen für Festivals tauschen", "Verbesserte eine neue Schaltfläche zum Tauschen der Ressourcen. Dies wird vom Quacktool hinzugefügt"],
                wwc: ["Taschenrechner", "Teile die Beteiligungsberechnung", "Weiter/Zurück Pfeile zu den beendeten Weltwundern"],
                htk: ["Tastaturkürzel", "Es verändert Ihr Leben"],

                err: ["Automatische Fehlerberichte senden", "Wenn du diese Option aktivierst, kannst du dabei helfen Fehler zu identifizieren."],
                her: ["Thrakische Eroberung", "Verkleinerung der Karte der Thrakischen Eroberung."],
                // Town icons
                LandOff: "Offensive Landeinheiten",
                LandDef: "Defensive Landeinheiten",
                NavyOff: "Offensive Seeeinheiten",
                NavyDef: "Defensive Seeeinheiten",
                FlyOff: "Fliegende Offensive Einheiten",
                FlyDef: "Fliegende Defensive Einheiten",
                Outside: "Außerhalb",
                Empty: "Leer"
            },
            labels: {
                uni: "Einheitenübersicht",
                total: "Gesamt",
                available: "Verfügbar",
                outer: "Außerhalb",
                con: "Selektieren",
                tbc: "BBCode Stadt",
                // Smileys
                std: "Standard",
                gre: "Grepolis",
                nat: "Natur",
                ppl: "Leute",
                fun: "Lustig",
                oth: "Sonstige",
                // Defense form
                ttl: "Übersicht: Stadtverteidigung",
                inf: "Informationen zur Stadt:",
                dev: "Abweichung",
                det: "Detailierte Landeinheiten",
                prm: "Premiumboni",
                sil: "Silberstand",
                mov: "Truppenbewegungen:",
                // Simulator
                str: "Einheitenstärke",
                los: "Verluste",
                mod: "ohne Modifikatoreinfluss",
                // Comparison box
                dsc: "Einheitenvergleich",
                hck: "Schlag",
                prc: "Stich",
                dst: "Distanz",
                sea: "See",
                att: "Angriff",
                def: "Verteidigung",
                spd: "Geschwindigkeit",
                bty: "Beute (Rohstoffe)",
                cap: "Transportkapazität",
                res: "Baukosten (Rohstoffe)",
                fav: "Gunst",
                tim: "Bauzeit (s)",
                // Trade
                rat: "Ressourcenverhältnis eines Einheitentyps",
                shr: "Anteil an der Lagerkapazität der Zielstadt",
                per: "Prozentualer Handel",
                // Sent units box
                lab: "Abgeschickt",
                improved_movement: "Verbesserte Truppenbewegung",
                cap_of_invisibility: "Kappe der Unsichtbarkeit",
                // Statistics
                stt: "Weltstatistiken",
                // Popup
                poi: "Punkte",
                sup: "Unterstützung",
            },
            market: {
                maxresources: 'Ressourcen bis zum Maximum',
                cityfestivals: 'Stadtfeste',
                theater: 'Theaterstücke'
            },
            culture: {
                cityfestivals: 'Stadtfeste',
                olympicgames: 'Olympische Spiele',
                triumph: 'Triumphzüge',
                theater: 'Theaterspiele'
            },
            hotkeys: {
                hotkeys: 'Hotkeys',
                city_select: 'Stadtauswahl',
                administrator: 'Administrator',
                captain: 'Kapitän',
                trade_ov: 'Handeln',
                command_ov: 'Befehle',
                recruitment_ov: 'Rekrutierung',
                troop_ov: 'Truppenübersicht',
                troops_outside: 'Truppen draußen',
                building_ov: 'Gebäude',
                culture_ov: 'Kultur',
                gods_ov: 'Götter',
                cave_ov: 'verbirgt die Übersicht',
                city_groups_ov: 'Städtegruppen',
                city_list: 'Städteliste',
                attack_planner: 'Angriffsplaner',
                farming_villages: 'Bauerndörfer',
                menu: 'Menu',
                settings: 'Settings',
                council: 'Rat der Helden',
                reservations: 'Reservierungen'
            },
            town_info: {
                no_overload: 'Kein überladen',
                delete: 'Löschen'
            },
            buttons: {
                sav: "Speichern", ins: "Einfügen", res: "Zurücksetzen"
            }
        },

        en: {
            settings: {
                dsc: "FLASK-Tools offers, among other things, some displays, a smiley box,<br>trade options and some changes to the layout.",
                act: "Activate/deactivate features of the toolset:",
                prv: "Preview of several features:",

                version_old: "Version is not up to date",
                version_new: "Version is up to date",
                version_dev: "Developer version",

                version_update: "Update",

                link_forum: "https://en.forum.grepolis.com/index.php?threads/flask-tools.62316/",
                link_contact: "https://en.forum.grepolis.com/index.php?members/flasktools.56572/",
                link_script: "https://github.com/flasktools/flasktools/raw/main/FLASK-TOOLS.user.js",

                forum: "Forum",
                author: "Author",

                cat_units: "Units",
                cat_icons: "Town icons",
                cat_forum: "Forum",
                cat_trade: "Trade",
                cat_layout: "Layout",
                cat_view: "View",
                cat_other: "Miscellaneous",
                cat_wonders: "World wonder"
            },
            options: {
                //bir: ["Bireme counter", "Counts the biremes of a city and sums these"],
                ava: ["Units overview", "Counts the units of all cities"],
                sml: ["Smilies", "Extends the bbcode bar by a smiley box"],
                str: ["Unit strength", "Adds unit strength tables in various areas"],
                tra: ["Transport capacity", "Shows the occupied and available transport capacity in the unit menu"],
                per: ["Percentual trade", "Extends the trade window by a percentual trade"],
                rec: ["Recruiting trade", "Extends the trade window by a recruiting trade"],
                cnt: ["Conquests", "Counts the attacks/supports in the conquest window"],
                way: ["Troop speed", "Displays improved troop speed in the attack/support window"],
                sim: ["Simulator", "Adaptation of the simulator layout & permanent display of the extended modifier box"],
                act: ["Activity boxes", "Improved display of trade and troop activity boxes (position memory)"],
                pop: ["Favor popup", "Changes the favor popup"],
                tsk: ["Taskbar", "Increases the taskbar and minimizes the daily reward window on startup"],
                mdr: ["Daily reward", "Minimizes the daily reward window on startup"],
                bbc: ["Defense form", "Extends the bbcode bar by an automatic defense form"],
                com: ["Unit Comparison", "Adds unit comparison tables"],
                tic: ["Town icons", "Each city receives an icon for the town type (automatic detection)", "Additional icons are available for manual selection"],
                til: ["Town list", "Adds the town icons to the town list"],
                tim: ["Map", "Sets the town icons on the strategic map"],
                con: ["Context menu", 'Swaps "Select town" and "City overview" in the context menu'],
                sen: ["Sent units", 'Shows sent units in the attack/support window'],
                tov: ["Town overview", 'Replaces the new town overview with the old window style'],
                scr: ["Mouse wheel", 'You can change the views with the mouse wheel'],
                tbc: ["Town bbcode", "Adds the town bbcode to the town tab"],
                stt: ["Statistics world", "Adds a button to see the world stats"],
                cov: ["Culture overview", 'Adds a count for parties in the culture overview. This is added by the quacktool'],
                suh: ["Select unit helper", 'Improved a new tools on the attack and support window. This is added by the quacktool'],
                ubv: ["Units beyond view", 'Improved a new tools on the agorà window. This is added by the quacktool'],
                srl: ["Scrollbar Style", 'Improved a new style for the scrollbar. Available on Chrome, opera, safari'],
                tti: ["Trade resources for festivals", "Improved a new button to trade the resources. This is added by the quacktool"],
                wwc: ["Calculator", "Share the participation calculation", "Next/previous arrows on the ended wonders of the world"],
                htk: ["Keyboard shortcuts", "It changes your life"],
                mod: ["Moding", "Improved the picture of the goddes with your favorite characters"],

                err: ["Send bug reports automatically", "If you activate this option, you can help identify bugs."],
                her: ["Thracian Conquest", "Downsizing of the map of the Thracian conquest."],
                // Town icons
                LandOff: "Land Offensive",
                LandDef: "Land Defensive",
                NavyOff: "Navy Offensive",
                NavyDef: "Navy Defensive",
                FlyOff: "Fly Offensive",
                FlyDef: "Fly Defensive",
                Outside: "Outside",
                Empty: "Empty"
            },
            labels: {
                uni: "Units overview",
                total: "Total",
                available: "Available",
                outer: "Outside",
                con: "Select town",
                tbc: "BBCode town",
                // Smileys
                std: "Standard",
                gre: "Grepolis",
                nat: "Nature",
                ppl: "People",
                fun: "Funny",
                oth: "Other",
                hal: "Halloween",
                xma: "Xmas",
                // Defense form
                ttl: "Overview: Town defense",
                inf: "Town information:",
                dev: "Deviation",
                det: "Detailed land units",
                prm: "Premium bonuses",
                sil: "Silver volume",
                mov: "Troop movements:",
                // Simulator
                str: "Unit strength",
                los: "Loss",
                mod: "without modificator influence",
                // Comparison box
                dsc: "Unit comparison",
                hck: "Blunt",
                prc: "Sharp",
                dst: "Distance",
                sea: "Sea",
                att: "Offensive",
                def: "Defensive",
                spd: "Speed",
                bty: "Booty (resources)",
                cap: "Transport capacity",
                res: "Costs (resources)",
                fav: "Favor",
                tim: "Recruiting time (s)",
                // Trade
                rat: "Resource ratio of an unit type",
                shr: "Share of the storage capacity of the target city",
                per: "Percentage trade",
                // Sent units box
                lab: "Sent units",
                improved_movement: "Improved troop movement",
                cap_of_invisibility: "Cap of invisibility",
                // Statistics
                stt: "Statistics world",
                // Popup
                poi: "Points",
                sup: "Support",
                arr: " attacks in arrive",
                arr2: " supports in arrive",
            },
            market: {
                maxresources: 'Resources to the max',
                cityfestivals: 'City festivals',
                theater: 'Theater plays'
            },
            culture: {
                cityfestivals: 'City festivals',
                olympicgames: 'Olympic Games',
                triumph: 'Victory processions',
                theater: 'Theater plays'
            },
            hotkeys: {
                hotkeys: 'Hotkeys',
                city_select: 'City selection',
                administrator: 'Administrator',
                captain: 'Captain',
                trade_ov: 'Trade',
                command_ov: 'Commands',
                recruitment_ov: 'Recruiting',
                troop_ov: 'Troop overview',
                troops_outside: 'Troops outside',
                building_ov: 'Buildings',
                culture_ov: 'Culture',
                gods_ov: 'Gods',
                cave_ov: 'hidesOverview',
                city_groups_ov: 'City groups',
                city_list: 'City list',
                attack_planner: 'Attack planner',
                farming_villages: 'Farming villages',
                menu: 'Menu',
                settings: 'Settings',
                council: 'Council of Heroes',
                reservations: 'reservations'
            },
            town_info: {
                no_overload: "No overload",
                delete: "Delete"
            },
            buttons: {
                sav: "Save", ins: "Insert", res: "Reset"
            }
        },

        it: {
            settings: {
                dsc: "FLASK-Tools offre, tra le altre cose, alcune immagini, un insieme di emoji,<br>opzioni per il commercio e modifiche al layout.",
                act: "Attivazione/Disattivazione delle carrateristiche del tool:",
                prv: "Antemprima di molte caratteristiche:",

                version_old: "Versione da aggiornare",
                version_new: "Versione aggiornata",
                version_dev: "Versione sviluppatore",

                version_update: "Aggiornare",

                link_forum: "https://it.forum.grepolis.com/index.php?threads/flask-tools.21932/",
                link_contact: "https://it.forum.grepolis.com/index.php?members/moonlight900.30315/",
                link_script: "https://github.com/flasktools/flasktools/raw/main/FLASK-TOOLS.user.js",

                forum: "Forum",
                author: "Autore",

                cat_units: "Unità",
                cat_icons: "Icone città",
                cat_forum: "Forum",
                cat_trade: "Commercio",
                cat_wonders: "Meraviglie del mondo",
                cat_layout: "Layout",
                cat_view: "Panoramica",
                cat_other: "Altro"
            },
            options: {
                //bir: ["Conta biremi", "Conta le biremi di una città e le somma"],
                ava: ["Panoramica delle unità", "Conta le unità di tutte le città"],
                sml: ["Emojy", "Aggiunge una raccolta di emojy ai pulsanti bbcode"],
                str: ["Forza delle untià", "Aggiunge una tabella delle forze delle unità nelle varie aree"],
                tra: ["Capacità di trasporto", "Mostra la capacità di trasporto usata e disponibile nel menù unità"],
                per: ["Commercio percentuale", "Aggiunge alla finestra del commercio la funzione commercio percentuale"],
                rec: ["Commercio di reclutamento", "Aggiunge alla finestra del commercio il valore del reclutamento"],
                cnt: ["Conquista", "Conta gli attacchi/supporti nella finestra della conquista"],
                way: ["Movimento accelerato", "Mostra il movimento accelerato nalla finestra di attacco/supporto"],
                sim: ["Simulatore", "Adatta il layout del simulatore e aggiunge permanenti le modifiche della finestra box"],
                act: ["Box dei movimenti", "Importa sullo schermo una box di commercio e movimenti truppe (posizione memorizzata)"],
                pop: ["Popup favori", "Cambia il popup dei favori"],
                tsk: ["Taskbar", "Aumenta le dimensioni taskbar and riduce la dimensione della finestra della ricompensa giornaliera"],
                mdr: ["Finestra della ricompensa", "Riduce la dimensione della finestra della ricompensa giornaliera all'avvio"],
                bbc: ["Form difensivo", "Aggiunge alla barra del bbcode un pulsante per un form difensivo automatico"],
                com: ["Paragone unità", "Aggiunge una tabella per la comparazione delle unità"],
                tic: ["Icone delle città", "Ogni città riceve una icona per il tipo di città(rilevamento automatico)", "Icone addizionali sono disponibili per la selezione automatica"],
                til: ["Lista città", "Aggiunge le icone delle città alla lista città"],
                tim: ["Mappa", "Aggiunge le icone città alla mappa strategica"],
                con: ["Menu selezione", 'Scambia il pulsante "Seleziona città" con "Panoramica città" nel menu selezione'],
                sen: ["Unità inviate", 'Mostra le unità inviate nella finestre di attacco/supporto'],
                tov: ["Panoramica città", 'Sostituisce la panoramica città con la vecchia finestra vecchio stile'],
                scr: ["Rotella del mouse", 'Puoi cambiare visuale con la rotella del mouse'],
                tbc: ["BBcode città", "Aggiunge il bbcode delle città alla tab della città"],
                tdo: ["Panoramica del commercio", "Aggiunge i gruppi città alla panoramica del commercio"],
                stt: ["Statistiche del mondo", "Aggiunge un pulsante per vedere le statistiche del mondo"],
                cov: ["Panoramica della cultura", 'Aggiunge un conteggio per le feste nella panoramica cultura. È aggiunto dal quacktools'],
                suh: ["Select unit helper", 'Inserito un nuovo strumento sulla finestra degli attacchi e supporti. È aggiunto dal quacktools'],
                ubv: ["Units beyond view", 'Inserito un nuovo strumento sulla finestra agorà. È aggiunto dal quacktools'],
                suh: ["Aiuto selezione truppe", 'Migliorati nuovi strumenti nella finestra di attacco e supporto. È aggiunto dal quacktool'],
                ubv: ["Panoramica truppe esterne", 'Migliorato un nuovo strumento nella finestra di agorà. È aggiunto dal quacktool'],
                tti: ["Commercio risorse per le feste", 'Inserito un nuovo tasto per commerciare le risorse. È aggiunto dal quacktools'],
                wwc: ["Calcolatrice", "Condividi il calcolo della partecipazione", "Frecce prossimo/precedente sulle meraviglie del mondo finite"],
                htk: ["Scorciatoie da tastiera", "Ti cambia la vita"],
                mod: ["Mod divinità", "Sostituisci le divinità per creare un gioco vario e senza precedenti"],

                err: ["Invia automaticamente il report dei bug", "Se attivi questa opzione, puoi aiutare a identificare i bug."],
                her: ["Conquista della Tracia", "Ridimensiona la mappa della conquista della Tracia"],
                // Town icons
                LandOff: "Off terrestre",
                LandDef: "Def terrestre",
                NavyOff: "Off navale",
                NavyDef: "Def navale",
                FlyOff: "Off volante",
                FlyDef: "Def volante",
                Outside: "Fuori",
                Empty: "Vuota"
            },
            labels: {
                uni: "Panoramica unità",
                total: "Totali",
                available: "Disponibili",
                outer: "Fuori",
                con: "Seleziona città",
                tbc: "BBCode città",
                // Smileys
                std: "Standard",
                gre: "Grepolis",
                nat: "Natura",
                ppl: "Persone",
                fun: "Divertente",
                oth: "Altro",
                hal: "Halloween",
                xma: "Natale",
                // Defense form
                ttl: "Panoramica: difesa della città",
                inf: "Informazioni città:",
                dev: "Errore",
                det: "Dettagli unità in città",
                prm: "Bonus premium",
                sil: "Argento in caverna",
                mov: "Movimenti truppi:",
                // WW
                leg: "Partecipazione",
                stg: "Livello",
                tot: "Totale",
                // Simulator
                str: "Forza delle unità",
                los: "Perse",
                mod: "Senza influenza dei modificatori",
                // Comparison box
                dsc: "Paragone unità",
                hck: "Contundente",
                prc: "Arma bianca",
                dst: "Distanza",
                sea: "Mare",
                att: "Offensiva",
                def: "Defensiva",
                spd: "Velocità",
                bty: "Bottino (risorse)",
                cap: "Capacità di trasporto",
                res: "Costi (risorse)",
                fav: "Favori",
                tim: "Tempo di reclutamento",
                // Trade
                rat: "Quantità di risorse per tipo unità",
                shr: "Quantità della capacità del magazzino della città bersaglio",
                per: "Commercio percentuale",
                // Sent units box
                lab: "Unità inviate",
                improved_movement: "Movimento accelerato unità",
                cap_of_invisibility: "Elmo dell'invisibilità",
                // Statistics
                stt: "Statistiche del mondo",
                // Popup
                poi: "Punti",
                sup: "Supporto",
            },
            market: {
                maxresources: 'Risorse al massimo',
                cityfestivals: 'Festa cittadina',
                theater: 'Opere teatrali'
            },
            culture: {
                cityfestivals: 'Festa cittadina',
                olympicgames: 'Giochi Olimpici',
                triumph: 'Corteo trionfale',
                theater: 'Opere teatrali'
            },
            hotkeys: {
                hotkeys: 'Hotkeys',
                city_select: 'Selezione città',
                administrator: 'Amministratore',
                captain: 'Capitano',
                trade_ov: 'Commercio',
                command_ov: 'Ordini',
                recruitment_ov: 'Reclutamento',
                troop_ov: 'Panoramica truppe',
                troops_outside: 'Truppe esterne',
                building_ov: 'Edifici',
                culture_ov: 'Cultura',
                gods_ov: 'Divinità',
                cave_ov: 'Caverne',
                city_groups_ov: 'Gruppi città',
                city_list: 'Lista città',
                attack_planner: 'Pianificatore',
                farming_villages: 'Villaggi rurali',
                menu: 'Menu',
                settings: 'Impostanzioni',
                council: 'Consiglio degli Eroi',
                reservations: 'Prenotazioni'
            },
            town_info: {
                no_overload: "Nessun sovraccarico",
                delete: "Cancella",
            },
            buttons: {
                sav: "Salva", ins: "Inserisci", res: "Reset"
            }
        },
        //////////////////////////////////////////////
        //      French Translation by eclat49       //
        //////////////////////////////////////////////
        fr: {
            settings: {
                dsc: "FLASK-Tools offres certains écrans, une boîte de smiley, les options <br>commerciales, des changements à la mise en page et d'autres choses.",
                act: "Activation/Désactivation des fonctions:",
                prv: "Aperçu des fonctions séparées:",

                version_old: "La version n'est pas à jour",
                version_new: "La version est à jour",
                version_dev: "Version développeur",

                version_update: "Mettre à jour",

                link_forum: "https://en.forum.grepolis.com/index.php?threads/flask-tools.62316/",
                link_contact: "https://en.forum.grepolis.com/index.php?members/flasktools.56572/",
                link_script: "https://github.com/flasktools/flasktools/raw/main/FLASK-TOOLS.user.js",

                forum: "Forum",
                author: "Auteur",

                cat_units: "Unités",
                cat_icons: "Icônes de les villes",
                cat_forum: "Forum",
                cat_trade: "Commerce",
                cat_layout: "Disposition",
                cat_view: "Aperçus",
                cat_other: "Divers",
                cat_wonders: "Merveille du monde"
            },
            options: {
                //bir: ["Compteur de birèmes ", "Totalise l'ensemble des birèmes présentent en villes et les résume. (Remplace la mini carte dans le cadran)"],
                ava: ["Présentation des unités", "Indique les unités de toutes les villes."],
                sml: ["Smileys", "Rajoutes une boite de smilies à la boite de bbcode"],
                str: ["Force unitaire", "Ajoutes des tableaux de force unitaire dans les différentes armes"],
                //trd: [ "Commerce",				"Ajout d'une option par pourcentage, par troupes pour le commerce, ainsi qu'un affichage des limites pour les festivals" ],
                per: ["Commerce de pourcentage", ""],
                rec: ["Commerce de recrutement", ""],
                cnt: ["Compteur conquête", "Comptabilise le nombre d'attaque et de soutien dans la fenêtre de conquête"],
                way: ["Vitesse des troupes ", "Rajoutes le temps de trajet avec le bonus accélération"],
                sim: ["Simulateur", "Modification de la présentation du simulateur et affichage permanent des options premium"],
                act: ["Boîte d'activité", "Présentation améliorée du commerce et des mouvement de troupes (mémoire de position)"],
                pop: ["Popup de faveur", 'Change la popup de faveur'],
                tsk: ["Barre de tâches ", "La barre de tâches augmente et minimise le fenêtre de bonus journalier"],
                mdr: ["Récompenses quotidiennes", "Minimise la fenêtre de récompense quotidienne au démarrage"],
                bbc: ["Formulaire de défense", "Ajout d'un bouton dans la barre BBCode pour un formulaire de défense automatique"],
                com: ["Comparaison des unités", "Ajoutes des tableaux de comparaison des unités"],
                tic: ["Icônes des villes", "Chaque ville reçoit une icône pour le type de ville (détection automatique)", "Des icônes supplémentaires sont disponibles pour la sélection manuelle"],
                til: ["Liste de ville", "Ajoute les icônes de la ville à la liste de la ville"],
                tim: ["Carte", "Définit les icônes de la ville sur la carte stratégique"],
                con: ["Menu contextuel", 'Swaps "Sélectionner ville" et "Aperçu de la ville" dans le menu contextuel'],
                sen: ["Unités envoyées", 'Affiche unités envoyées dans la fenêtre attaque/support'],
                tov: ["Aperçu de ville", "Remplace la nouvelle aperçu de la ville avec l'ancien style de fenêtre"],
                scr: ["Molette de la souris", 'Avec la molette de la souris vous pouvez changer les vues. Ceci est ajouté par les quacktools'],
                tbc: ["BBcode de ville", "Ajoute le bbcode de la ville à la tab de la ville"],
                stt: ["Statistiques mondiales", "Ajoute un bouton pour voir les statistiques mondiales"],
                cov: ["Aperçu de culture", "Ajoute un compte pour les fêtes dans la surview de la culture. Ceci est ajouté par les quacktools"],
                suh: ["Sélectionner l'unité d'assistance", 'Amélioration de nouveaux outils sur la fenêtre de attaque et de support. Ceci est ajouté par le quacktool'],
                ubv: ["Unités au-delà de la aperçu", 'Amélioration de un nouvel outil sur la fenêtre agorà. Ceci est ajouté par le quacktool'],
                tti: ["Échanger des ressources pour des festivals", "Amélioration d'un nouveau bouton pour échanger les ressources. Ceci est ajouté par le quacktool"],
                wwc: ["Calculatrice", "Partager le calcul de la participation", "Flèches suivante/précédente sur les merveilles du monde terminées"],
                htk: ["Raccourcis clavier", "Ça change la vie"],

                err: ["Envoyer des rapports de bogues automatiquement", "Si vous activez cette option, vous pouvez aider à identifier les bugs."],
                // Town icons
                LandOff: "Off terrestre",
                LandDef: "Def terrestre",
                NavyOff: "Off navale",
                NavyDef: "Def navale",
                FlyOff: "Unités Mythiques Off",
                FlyDef: "Unités Mythiques Def",
                Outside: "À l'extérieure",
                Empty: "Vide"
            },
            labels: {
                uni: "Présentation des unités",
                total: "Global",
                available: "Disponible",
                outer: "Extérieur",
                con: "Sélectionner",
                tbc: "BBCode ville",
                // Smileys
                std: "Standard",
                gre: "Grepolis",
                nat: "Nature",
                ppl: "Gens",
                fun: "Marrant",
                oth: "Autres",
                // Defense form
                ttl: "Aperçu: Défense de ville",
                inf: "Renseignements sur la ville:",
                dev: "Différence",
                det: "Unités terrestres détaillées",
                prm: "Bonus premium",
                sil: "Remplissage de la grotte",
                mov: "Mouvements de troupes:",
                // Simulator
                str: "Force unitaire",
                los: "Pertes",
                mod: "sans influence de modificateur",
                // Comparison box
                dsc: "Comparaison des unités",
                hck: "Contond.",
                prc: "Blanche",
                dst: "Jet",
                sea: "Navale",
                att: "Attaque",
                def: "Défense",
                spd: "Vitesse",
                bty: "Butin",
                cap: "Capacité de transport",
                res: "Coût de construction",
                fav: "Faveur",
                tim: "Temps de construction (s)",
                // Trade
                rat: "Ratio des ressources d'un type d'unité",
                shr: "Part de la capacité de stockage de la ville cible",
                per: "Commerce de pourcentage",
                // Sent units box
                lab: "Envoyée",
                improved_movement: "Mouvement des troupes amélioré",
                cap_of_invisibility: "Chapeau d'invisibilité",
                // Statistics
                stt: "Statistiques mondiales",
                // Popup
                poi: "Points",
                sup: "Soutien",
            },
            market: {
                maxresources: 'Ressources au maximum',
                cityfestivals: 'Festivals',
                theater: 'Pièces de théâtre'
            },
            culture: {
                cityfestivals: 'Festivals',
                olympicgames: 'Jeux Olympiques',
                triumph: 'Marche triomphales',
                theater: 'Pièces de théâtre'
            },
            town_info: {
                no_overload: 'sans surcharge',
                delete: 'Effacer',
            },
            hotkeys: {
                hotkeys: 'Hotkeys',
                city_select: 'Sélection de la ville',
                administrator: 'Administrateur',
                captain: 'Capitaine',
                trade_ov: 'Commerce',
                command_ov: 'Commandes',
                recruitment_ov: 'Recrutement',
                troop_ov: 'Aperçu des troupes',
                troops_outside: "Troupes à l'extérieur",
                building_ov: 'Bâtiments',
                culture_ov: 'Culture',
                gods_ov: 'Dieux',
                cave_ov: "Vue d'ensemble",
                city_groups_ov: 'Groupes de villes',
                city_list: 'Liste des villes',
                attack_planner: "Planificateur d'attaque",
                farming_villages: 'Villages agricoles',
                menu: 'Menu',
                settings: 'Paramètres',
                council: 'Conseil des héros',
                reservations: 'Réservations'
            },
            buttons: {
                sav: "Sauver", ins: "Insertion", res: "Remettre"
            }
        },
        //////////////////////////////////////////////
        //      Russian Translation by MrBobr       //
        //////////////////////////////////////////////
        ru: {
            settings: {
                dsc: "FLASK-Tools изменяет некоторые окна, добавляет новые смайлы, отчёты,<br>улучшеные варианты торговли и другие функции.",
                act: "Включение/выключение функций:",
                prv: "Примеры внесённых изменений:",

                version_old: "Версия не актуальна",
                version_new: "Версия актуальна",
                version_dev: "Версия для разработчиков",

                version_update: "Обновить",

                link_forum: "https://en.forum.grepolis.com/index.php?threads/flask-tools.62316/",
                link_contact: "https://en.forum.grepolis.com/index.php?members/flasktools.56572/",
                link_script: "https://github.com/flasktools/flasktools/raw/main/FLASK-TOOLS.user.js",

                forum: "Форум",
                author: "автор",

                cat_units: "войска",
                cat_icons: "Городские иконы",
                cat_forum: "Форум",
                cat_trade: "Сделка",
                cat_layout: "раскладка",
                cat_view: "Посмотреть",
                cat_other: "другие",
                cat_wonders: "Чудес света"
            },
            options: {
                //bir: ["Счётчик бирем", "Показывает число бирем во всех городах"],
                ava: ["Обзор единиц", "Указывает единицы всех городов"], // ?
                sml: ["Смайлы", "Добавляет кнопку для вставки смайлов в сообщения"],
                str: ["Сила отряда", "Добавляет таблицу общей силы отряда в некоторых окнах"],
                //trd: [ "Торговля",		"Добавляет маркеры и отправку недостающих ресурсов, необходимых для фестиваля. Инструменты для долевой торговли" ],
                per: ["Процент торговля", ""],
                rec: ["Рекрутинг торговля", ""],
                cnt: ["Завоевания", "Отображение общего числа атак/подкреплений в окне завоевания города"],
                way: ["30% ускорение", "Отображает примерное время движения отряда с 30% бонусом"],
                sim: ["Симулятор", "Изменение интерфейса симулятора, добавление новых функций"],
                act: ["Перемещения", "Показывает окна пересылки ресурсов и перемещения войск"],
                pop: ["Благосклонность", "Отображение окна с уровнем благосклонности богов"],
                tsk: ["Таскбар", "Увеличение ширины таскбара и сворачивание окна ежедневной награды при входе в игру"],
                mdr: ["Eжедневной награды", "Cворачивание окна ежедневной награды при входе в игру"],
                bbc: ["Форма обороны", "Добавляет кнопку для вставки в сообщение отчёта о городе"], // Beschreibung passt nicht ganz
                com: ["Сравнение юнитов", "Добавляет окно сравнения юнитов"],
                tic: ["Типы городов", "Каждый город получает значок для городского типа (автоматическое определение)", "Дополнительные иконки доступны для ручного выбора"], // ?
                til: ["Список город", "Добавляет значки городские в список города"], // ?
                tim: ["Карта", "Устанавливает городские иконки на стратегической карте"], // ?
                //con: [ "Context menu",	'Swaps "Select town" and "City overview" in the context menu'],
                //sen: [ "Sent units",		'Shows sent units in the attack/support window'],
                tov: ["Обзор Город", 'Заменяет новый обзор города с старом стиле окна'], // ?
                scr: ["Колесо мыши", 'С помощью колеса мыши вы можете изменить взгляды'], // ?
                tbc: ["код города", "добавляет код города в список городов"], // ?
                stt: ["Мировая статистика", "Добавляет кнопку, чтобы увидеть мировую статистику"],
                cov: ["обзор культуры", "Добавляет счет для вечеринок в обзор культуры. Это добавлено шарлатанами"],
                suh: ["Выберите юнит помощника", 'Улучшены новые инструменты для атаки и поддержки окна. Это добавлено шарлатаном'],
                ubv: ["Единицы вне поля зрения", 'Улучшены новые инструменты в окне agorà. Это добавлено шарлатаном'],
                tti: ["Обмен ресурсов на фестивали", 'Улучшена новая кнопка для обмена ресурсами. Это добавлено шарлатаном'],
                wwc: ["calculator", "Share the participation calculation", "Next / previous arrows on the ended wonders of the world"],
                htk: ["Сочетания клавиш", "Это меняет вашу жизнь"],

                err: ["Отправить сообщения об ошибках автоматически", "Если вы включите эту опцию, вы можете помочь идентифицировать ошибки"],
                // Town icons
                LandOff: "Land Offensive",
                LandDef: "Land Defensive",
                NavyOff: "Navy Offensive",
                NavyDef: "Navy Defensive",
                FlyOff: "Fly Offensive",
                FlyDef: "Fly Defensive",
                Outside: "Outside",
                Empty: "Empty"
            },

            labels: {
                uni: "Обзор единиц",
                total: "Oбщий",
                available: "доступный",
                outer: "вне",
                con: "выбирать",
                tbc: "Код города",
                // Smileys
                std: "",
                gre: "",
                nat: "",
                ppl: "",
                msg: "",
                oth: "",
                // Defense form
                ttl: "Обзор: Отчёт о городе",
                inf: "Информация о войсках и постройках:",
                dev: "Отклонение",
                det: "Детальный отчёт",
                prm: "Премиум-бонусы",
                sil: "Серебро в пещере",
                mov: "Перемещения",
                // Simulator
                str: "Сила войск",
                los: "Потери",
                mod: "без учёта заклинаний, бонусов, исследований",
                // Comparison box
                dsc: "Сравнение юнитов",
                hck: "Ударное",
                prc: "Колющее",
                dst: "Дальнего боя",
                sea: "Морские",
                att: "Атака",
                def: "Защита",
                spd: "Скорость",
                bty: "Добыча (ресурсы)",
                cap: "Вместимость транспортов",
                res: "Стоимость (ресурсы)",
                fav: "Благосклонность",
                tim: "Время найма (с)",
                // Trade
                rat: "",
                shr: "",
                per: "",
                // Sent units box
                lab: "Отправлено",
                improved_movement: "Улучшенная перемещение войск",
                cap_of_invisibility: "шапка невидимости",
                // Statistics
                stt: "Мировая статистика",
                // Popup
                poi: "Точки",
                sup: "служба поддержки",
            },
            market: {
                maxresources: 'Ресурсы на максимум',
                cityfestivals: 'Фестиваль',
                theater: 'Представление'
            },
            culture: {
                cityfestivals: 'Фестиваль',
                olympicgames: 'Олимпийские игры',
                triumph: 'Шествие',
                theater: 'Представление'
            },
            town_info: {
                no_overload: 'Нет перезагрузки',
                delete: 'Удалить',
            },
            hotkeys: {
                hotkeys: 'Hotkeys',
                city_select: 'Выбор города',
                administrator: 'Администратор',
                captain: 'Капитан',
                trade_ov: 'Торговля',
                command_ov: 'Команды',
                recruitment_ov: 'Рекрутинг',
                troop_ov: 'Обзор войск',
                troops_outside: 'Войска снаружи',
                building_ov: 'Здания',
                culture_ov: 'Культура',
                gods_ov: 'Боги',
                cave_ov: 'скрывает Обзор',
                city_groups_ov: 'Городские группы',
                city_list: 'Список городов',
                attack_planner: 'Планировщик атак',
                farming_villages: 'Фермерские деревни',
                menu: 'Menu',
                settings: 'Настройки',
                council: 'Совет героев',
                reservations: 'оговорки'
            },
            buttons: {
                sav: "Сохраниить", ins: "Вставка", res: "Сброс"
            }
        },
        //////////////////////////////////////////////
        //       Polish Translation by anpu         //
        //////////////////////////////////////////////
        pl: {
            settings: {
                dsc: "FLASK-Tools oferuje (między innymi) poprawione widoki, nowe uśmieszki,<br>opcje handlu i zmiany w wyglądzie.",
                act: "Włącz/wyłącz funkcje skryptu:",
                prv: "podgląd poszczególnych opcji:",

                version_old: "Wersja nie jest aktualizowana",
                version_new: "Wersja jest zaktualizowana",
                version_dev: "Wersja dla programistów",

                version_update: "aktualizacja",

                link_forum: "https://en.forum.grepolis.com/index.php?threads/flask-tools.62316/",
                link_contact: "https://en.forum.grepolis.com/index.php?members/flasktools.56572/",
                link_script: "https://github.com/flasktools/flasktools/raw/main/FLASK-TOOLS.user.js",

                forum: "Forum",
                author: "Autor",

                cat_units: "Jednostki",
                cat_icons: "Ikony miasta",
                cat_forum: "Forum",
                cat_trade: "Handel",
                cat_layout: "Układ",
                cat_view: "Widok",
                cat_other: "Inny",
                cat_wonders: "Cud świata"
            },
            options: {
                //bir: ["Licznik birem", "Zlicza i sumuje biremy z miast"],
                ava: ["Przegląd jednostek", "Wskazuje jednostki wszystkich miast"], // ?
                sml: ["Emotki", "Dodaje dodatkowe (zielone) emotikonki"],
                str: ["Siła jednostek", "dodaje tabelki z siłą jednostek w różnych miejscach gry"],
                //trd: [ "Handel",			"Rozszerza okno handlu o handel procentowy, proporcje surowców wg jednostek, dodaje znaczniki dla festynów" ],
                per: ["Handel procentowy", ""],
                rec: ["Handel rekrutacyjne", ""],
                cnt: ["Podboje", "Zlicza wsparcia/ataki w oknie podboju (tylko własne podboje)"],
                way: ["Prędkość wojsk", "Wyświetla dodatkowo czas jednostek dla bonusu przyspieszone ruchy wojsk"],
                sim: ["Symulator", "Dostosowanie wyglądu symulatora oraz dodanie szybkich pól wyboru"],
                act: ["Ramki aktywności", "Ulepszony podgląd ruchów wojsk i handlu (można umieścić w dowolnym miejscu ekranu. Zapamiętuje położenie.)"],
                pop: ["Łaski", "Zmienia wygląd ramki informacyjnej o ilości produkowanych łask"],
                tsk: ["Pasek skrótów", "Powiększa pasek skrótów i minimalizuje okienko z bonusem dziennym"],
                mdr: ["Bonusem dziennym", "Minimalizuje okienko z bonusem dziennym przy starcie"],
                bbc: ["Raportów obronnych", "Rozszerza pasek skrótów BBcode o generator raportów obronnych"],
                com: ["Porównianie", "Dodaje tabelki z porównaniem jednostek"],
                tic: ["Ikony miasta", "Każde miasto otrzyma ikonę typu miasta (automatyczne wykrywanie)", "Dodatkowe ikony są dostępne dla ręcznego wyboru"], // ?
                til: ["Lista miasto", "Dodaje ikony miasta do listy miasta"], // ?
                tim: ["Mapa", "Zestawy ikon miasta na mapie strategicznej"], // ?
                con: ["menu kontekstowe", 'Zamiemia miejcami przycisk "wybierz miasto" z przyciskiem "podgląd miasta" po kliknięciu miasta na mapie'],
                sen: ["Wysłane jednostki", 'Pokaż wysłane jednostki w oknie wysyłania ataków/wsparć'],
                tov: ["Podgląd miasta", 'Zastępuje nowy podgląd miasta starym'],
                scr: ["Zoom", 'Możesz zmienić poziom przybliżenia mapy kółkiem myszy'],
                tbc: ["BBCode miasto", "Dodaje kod miasta do listy miasta"], // ?
                stt: ["Statystyki świata", "Dodaje przycisk, aby wyświetlić statystyki świata"],
                cov: ["Przegląd kultury", "Dodaje liczbę stron w przeglądzie kultury. Jest to dodawane przez quacktools"],
                suh: ["Wybierz pomocnika jednostki", 'Poprawiono nowe narzędzia w oknie ataku i wsparcia. Jest to dodawane przez quacktool'],
                ubv: ["Jednostki poza zasięgiem wzroku", 'Poprawione nowe narzędzia w oknie agory. Jest to dodawane przez quacktool'],
                tti: ["Wymień surowce na festiwale", 'Ulepszono nowy przycisk do wymiany zasobów. Jest to dodawane przez quacktool'],
                wwc: ["Kalkulator", "Udostępnij kalkulację udziału", "Następne/poprzednie strzałki na zakończonych cudach świata"],
                htk: ["Skróty klawiszowe", "To zmienia Twoje życie"],

                err: ["Automatycznie wysyłać raporty o błędach", "Jeśli włączysz tę opcję, możesz pomóc zidentyfikować błędy"],
                // Town icons
                LandOff: "Land Offensive",
                LandDef: "Land Defensive",
                NavyOff: "Navy Offensive",
                NavyDef: "Navy Defensive",
                FlyOff: "Fly Offensive",
                FlyDef: "Fly Defensive",
                Outside: "Outside",
                Empty: "Empty"
            },
            labels: {
                uni: "Przegląd jednostek",
                total: "Ogólny",
                available: "Dostępny",
                outer: "Na zewnątrz",
                con: "Wybierz miasto",
                tbc: "Kod miasta",
                // Smileys
                std: "Standard" /* "Standardowe" */,
                gre: "Grepolis",
                nat: "Przyroda",
                ppl: "Ludzie",
                fun: "Zabawny",
                oth: "Inne",
                // Defense form
                ttl: "Podgląd: Obrona miasta",
                inf: "Informacje o mieście:",
                dev: "Ochyłka",
                det: "jednostki lądowe",
                prm: "opcje Premium",
                sil: "Ilość srebra",
                mov: "Ruchy wojsk",
                // Simulator
                str: "Siła jednostek",
                los: "Straty",
                mod: "bez modyfikatorów",
                // Comparison box
                dsc: "Porównianie jednostek",
                hck: "Obuchowa",
                prc: "Tnąca",
                dst: "Dystansowa",
                sea: "Morskie",
                att: "Offensywne",
                def: "Defensywne",
                spd: "Prędkość",
                bty: "Łup (surowce)",
                cap: "Pojemność transportu",
                res: "Koszta (surowce)",
                fav: "Łaski",
                tim: "Czas rekrutacji (s)",
                // Trade
                rat: "Stosunek surowców dla wybranej jednostki",
                shr: "procent zapełnienia magazynu w docelowym mieście",
                per: "Handel procentowy",
                // Sent units box
                lab: "Wysłane jednostki",
                improved_movement: "Przyspieszone ruchy wojsk",
                cap_of_invisibility: "Czapka niewidzialności",
                // Statistics
                stt: "Statystyki świata",
                // Popup
                poi: "Zwrotnica",
                sup: "Wsparcie",
            },
            market: {
                maxresources: 'Zasoby na maksa',
                cityfestivals: 'Festyn miejski',
                theater: 'Występy teatralne'
            },
            culture: {
                cityfestivals: 'Festyn miejski',
                olympicgames: 'Igrzyska Olimpijskie',
                triumph: 'Pochód triumfalny',
                theater: 'Występy teatralne'
            },
            town_info: {
                no_overload: 'Wybierz i napełnij łódki',
                delete: 'Wyczyść',
            },
            hotkeys: {
                hotkeys: 'Hotkeys',
                city_select: 'Wybór miasta',
                administrator: 'Administrator',
                captain: 'Kapitan',
                trade_ov: 'Handel',
                command_ov: 'Polecenia',
                recruitment_ov: 'Rekrutacyjny',
                troop_ov: 'Przegląd wojsk',
                troops_outside: 'Wojska na zewnątrz',
                building_ov: 'Budynki',
                culture_ov: 'Kultura',
                gods_ov: 'Bogowie',
                cave_ov: 'ukrywa Przegląd',
                city_groups_ov: 'Grupy miejskie',
                city_list: 'Lista miast',
                attack_planner: 'Planista ataku',
                farming_villages: 'Wsie rolnicze',
                menu: 'Menu',
                settings: 'Ustawienia',
                council: 'Rada Bohaterów',
                reservations: 'Rezerwacje'
            },
            buttons: {
                sav: "Zapisz", ins: "Wstaw", res: "Anuluj"
            }
        },
        //////////////////////////////////////////////
        // Spanish Translation by Juana de Castilla //
        //////////////////////////////////////////////
        es: {
            settings: {
                dsc: "FLASK-Tools ofrece, entre otras cosas, varias pantallas, ventana de <br>emoticones, opciones de comercio y algunos cambios en el diseño.",
                act: "Activar/desactivar características de las herramientas:",
                prv: "Vista previa de varias características:",

                version_old: "La versión no está actualizada",
                version_new: "La versión está actualizada",
                version_dev: "Versión de desarrollador",

                version_update: "poner al día",

                link_forum: "https://en.forum.grepolis.com/index.php?threads/flask-tools.62316/",
                link_contact: "https://en.forum.grepolis.com/index.php?members/flasktools.56572/",
                link_script: "https://github.com/flasktools/flasktools/raw/main/FLASK-TOOLS.user.js",

                forum: "Forum",
                author: "Autor",

                cat_units: "Unidades",
                cat_icons: "Iconos de la ciudad",
                cat_forum: "Foro",
                cat_trade: "Comercio",
                cat_layout: "Diseño",
                cat_view: "Ver",
                cat_other: "Otro",
                cat_wonders: "Maravilla del mundo"
            },
            options: {
                //bir: ["Contador de birremes", "Cuenta los birremes de una ciudad y los suma"],
                ava: ["Información general unidades", "Indica las unidades de todas las ciudades"], // ?
                sml: ["Emoticones", "Código BB para emoticones"],
                str: ["Fortaleza de la Unidad", "Añade tabla de fortalezas de cada unidad en varias zonas"],
                //trd: [ "Comercio",				"Añade en la pestaña de comercio un porcentaje de comercio y reclutamiento y limitadores de Mercado por cada ciudad" ],
                per: ["Comercio de porcentual", ""],
                rec: ["Comercio de reclutamiento", ""],
                cnt: ["Conquistas", "contador de ataques y refuerzos en la pestaña de conquista"],
                way: ["Velocidad de tropas", "Muestra movimiento de tropas mejorado en la ventana de ataque/refuerzo"],
                sim: ["Simulador", "Adaptación de la ventana del simulador incluyendo recuadro de modificadores"],
                act: ["Ventana de actividad", "Mejora las ventanas de comercio y movimiento de tropas (memoria posicional)"],
                pop: ["Popup", "Cambia el popup de favores"],
                tsk: ["Barra de tareas", "aumenta la barra de tareas y minimice la recompensa al aparecer"],
                mdr: ["Recompensa diaria", "Minimice la recompensa diaria al inicio"],
                bbc: ["Formulario de defensa", "Añade en la barra de códigos bb un formulario de defensa"],
                com: ["Comparación", "añade ventana de comparación de unidades"],
                tic: ["Iconos de la ciudad", "Cada ciudad recibe un icono para el tipo de la ciudad (detección automática)", "Iconos adicionales están disponibles para la selección manual"],
                til: ["Lista de la ciudad", "Agrega los iconos de la ciudad a la lista de la ciudad"],
                tim: ["Map", "Establece los iconos de la ciudad en el mapa estratégico"],
                con: ["menú contextual", 'Cambia "Elegir ciudad" y "vista de la ciudad" en el menú contextual '],
                sen: ["Unidades enviadas", 'Muestra las unidades enviadas en la ventana de ataque/refuerzos'],
                tov: ["Información de la ciudad", 'sustituye la vista nueva de ciudad por la ventana antigua'],
                scr: ["Rueda raton", 'Puede cambiar las vistas con la rueda del raton'],
                tbc: ["BBCode de la ciudad", "Agrega el código de ciudad a la lista de ciudades"],
                stt: ["Estadísticas mundiales", "Añade un botón para ver las estadísticas mundiales"],
                cov: ["Resumen de la cultura", "Añade un recuento para las partes de la cultura en exceso de vista. Esto es agregado por las herramientas de quacktools"],
                suh: ["Seleccionar ayudante de unidad", 'Se mejoraron las nuevas herramientas en la ventana de ataque y soporte. Esto es agregado por quacktool'],
                ubv: ["Unidades más allá de la vista", 'Mejora de nuevas herramientas en la ventana de agorà. Esto es agregado por quacktool'],
                tti: ["Intercambia recursos por festivales", 'Se mejoró un nuevo botón para intercambiar los recursos. Esto es agregado por el quacktool'],
                wwc: ["Calculadora", "Comparte el cálculo de participación", "Flechas siguientes/anteriores sobre las maravillas del mundo terminadas"],
                htk: ["Atajos de teclado", "Te cambia la vida"],

                err: ["Enviar informes de errores automáticamente", "Si se activa esta opción, puede ayudar a identificar errores."],
                // Town icons
                LandOff: "Land Offensive",
                LandDef: "Land Defensive",
                NavyOff: "Navy Offensive",
                NavyDef: "Navy Defensive",
                FlyOff: "Fly Offensive",
                FlyDef: "Fly Defensive",
                Outside: "Outside",
                Empty: "Empty"
            },
            labels: {
                uni: "Información general unidades",
                total: "Total",
                available: "Disponible",
                outer: "Fuera",
                con: "Escoger ciudad",
                tbc: "Ciudad codificada",
                // Smileys
                std: "Standard",
                gre: "Grepolis",
                nat: "Natura",
                ppl: "Gente",
                fun: "Gracioso",
                oth: "Otros",
                // Defense form
                ttl: "Vista general: Defensa de la ciudad",
                inf: "Información de la ciudad:",
                dev: "Desviación",
                det: "Unidades de tierra detalladas",
                prm: "Bonos Premium",
                sil: "Volumen de plata",
                mov: "Movimientos de tropas:",
                // Simulator
                str: "Fortaleza de la Unidad",
                los: "Perdida",
                mod: "sin influencia del modificador",
                // Comparison box
                dsc: "Comparación de Unidades",
                hck: "Contundente",
                prc: "Punzante",
                dst: "Distancia",
                sea: "Mar",
                att: "Ataque",
                def: "Defensa",
                spd: "Velocidad",
                bty: "Botín (recursos)",
                cap: "Capacidad de transporte",
                res: "Costes (recursos)",
                fav: "Favor",
                tim: "Tiempo de reclutamiento (s)",
                // Trade
                rat: "Proporción de recursos de un tipo de unidad",
                shr: "Porcentaje de la capacidad de almacenamiento de la ciudad destino",
                per: "Porcentaje de comercio",
                // Sent units box
                lab: "Unidades enviadas",
                improved_movement: "Movimiento de tropas mejorados",
                cap_of_invisibility: "Gorro de invisibilidad",
                // Statistics
                lab: "Estadísticas mundiales",
                // Popup
                poi: "Puntos",
                sup: "Apoyo",
            },
            market: {
                maxresources: 'Recursos al máximo',
                cityfestivals: 'Festival de la ciudad',
                theater: 'Obras de teatro'
            },
            culture: {
                cityfestivals: 'Festival de la ciudad',
                olympicgames: 'Juegos Olímpicos',
                triumph: 'Marcha triunfal',
                theater: 'Obras de teatro'
            },
            town_info: {
                no_overload: 'No cargar',
                delete: 'Borrar',
            },
            hotkeys: {
                hotkeys: 'Hotkeys',
                city_select: 'Selección de ciudad',
                administrator: 'Administrador',
                captain: 'Capitán',
                trade_ov: 'Comercio',
                command_ov: 'Comandos',
                recruitment_ov: 'Reclutamiento',
                troop_ov: 'Descripción de la tropa',
                troops_outside: 'Tropas afuera',
                building_ov: 'Edificios',
                culture_ov: 'Cultura',
                gods_ov: 'Dioses',
                cave_ov: 'Vista oculta',
                city_groups_ov: 'Grupos de ciudades',
                city_list: 'Lista de ciudades',
                attack_planner: 'Planificador de ataques',
                farming_villages: 'Pueblos agrícolas',
                menu: 'Menu',
                settings: 'Ajustes',
                council: 'Consejo de Héroes',
                reservations: 'reservas'
            },
            buttons: {
                sav: "Guardar", ins: "Insertar", res: "Reinicio"
            }
        },
        ar: {},
        //////////////////////////////////////////////
        //   Portuguese (BR) Translation by  HELL   //
        //////////////////////////////////////////////
        br: {
            settings: {
                dsc: "FLASK-Tools oferece, entre outras coisas, algumas telas, uma caixa de smiley, opções de comércio <br> e algumas alterações no layout.",
                act: "Ativar/desativar recursos do conjunto de ferramentas:",
                prv: "Pré-visualização de vários recursos:",

                version_old: "Versão não está atualizada",
                version_new: "Versão está atualizada",
                version_dev: "Versão do desenvolvedor",

                version_update: "Atualização",

                link_forum: "https://en.forum.grepolis.com/index.php?threads/flask-tools.62316/",
                link_contact: "https://en.forum.grepolis.com/index.php?members/flasktools.56572/",
                link_script: "https://github.com/flasktools/flasktools/raw/main/FLASK-TOOLS.user.js",

                forum: "Forum",
                author: "Autor",

                cat_units: "Unidades",
                cat_icons: "Ícones nas Cidades",
                cat_forum: "Forum",
                cat_trade: "Comércio",
                cat_wonders: "Maravilhas do Mundo",
                cat_layout: "Layout",
                cat_view: "View",
                cat_other: "Outros"
            },
            options: {
                // bir: ["Contador de Birremes", "Conta as biremes da cidade na cidade"],
                ava: ["Visão Geral da unidade", "Indica as unidades de todas as cidades"], // ?
                sml: ["Smilies", "Estende o bbcode com uma caixa de smiley"],
                str: ["Força das Tropas", "Adiciona quadros de força das tropas em diversas áreas"],
                tra: ["Capacidade de Transporte", "Mostra a capacidade de transporte ocupado e disponível no menu de unidades"],
                per: ["Percentual de comércio", "Estende-se a janela de comércio com um percentual de comércio"],
                rec: ["Comércio para recrutamento", "Estende-se a janela de comércio com um comércio de recrutamento"],
                cnt: ["Conquistas", "Conta os ataques/apoios na janela de conquista"],
                way: ["Velocidade da Tropa", "Displays mostram a possivél velocidade de tropa na janela de ataque/suporte"],
                sim: ["Simulador", "Adaptação do layout simulador & exposição permanente da caixa poderes estendida"],
                act: ["Ativar caixas suspensas de comércio e ataque", "Melhorias da exibição de caixas de comércio e atividade tropa (com memória de posição)"],
                pop: ["Caixa de favores divino", "Altera a caixa de favores divino por um novo layout"],
                tsk: ["Barra de tarefas", "Aumenta a barra de tarefas e minimiza a janela recompensa diária no inicio"],
                mdr: ["Recompensa diária", "Minimiza a janela recompensa diária no inicio"],
                bbc: ["Pedido de Apoio", "Estende a barra de bbcode com uma forma de Pedido de Apoio Automática"],
                com: ["Comparação de Unidades", "Adiciona tabelas de comparação de unidade"],
                tic: ["Ícones nas Cidades", "Cada cidade recebe um ícone para o tipo de tropas na cidade (detecção automática) ", " Ícones adicionais estão disponíveis para seleção manual"],
                til: ["Lista das Cidades", "Adiciona os ícones da cidade na lista de cidades"],
                tim: ["Mapa", "Mostra os ícones das cidades no mapa estratégico"],
                con: ["Menu de Contexto", 'Troca da "Selecione cidade" e "Visão Geral da Cidade" no menu de contexto'],
                sen: ["Unidades Enviadas", 'Shows sent units in the attack/support window'],
                tov: ["Visão da Cidade", 'Substitui o novo panorama da cidade, com o estilo da janela antiga'],
                scr: ["Roda do Mouse", 'Você pode alterar os pontos de vista com a roda do mouse'],
                tbc: ["BBcode das Cidades", "Adiciona o código da cidade à lista de cidades"],
                stt: ["Estatísticas mundiais", "Adiciona um botão para ver as estatísticas mundiais"],
                cov: ["Visão da cultura", "Adiciona uma contagem para festas na visão da cultura. Isso é adicionado pelas quacktools"],
                suh: ["Selecionar auxiliar de unidade", 'Melhoradas novas ferramentas na janela de ataque e suporte. Isto é adicionado pelo quacktool'],
                ubv: ["Unidades além da vista", 'Melhoradas novas ferramentas na janela agorà. Isto é adicionado pelo quacktool'],
                tti: ["Trocar recursos para festivais", 'Melhorado um novo botão para trocar os recursos. Isso é adicionado pelo quacktool'],
                wwc: ["Calculadora", "Compartilhe o cálculo de participação", "Setas seguintes/anteriores nas maravilhas do mundo acabadas"],
                htk: ["Atalhos de teclado", "Isso muda sua vida"],

                err: ["Enviar automaticamente relatórios de erros", "Se você ativar essa opção, você pode ajudar a identificar erros."],
                her: ["Conquista Thracian", "Redução de tamanho do mapa da conquista Thracian."],
                // Town icons
                LandOff: "Land Offensive",
                LandDef: "Land Defensive",
                NavyOff: "Navy Offensive",
                NavyDef: "Navy Defensive",
                FlyOff: "Fly Offensive",
                FlyDef: "Fly Defensive",
                Outside: "Outside",
                Empty: "Empty"
            },
            labels: {
                uni: "Visão Geral da unidade",
                total: "Global",
                available: "Disponível",
                outer: "Fora",
                con: "Selecionar cidade",
                tbc: "Código da cidade",
                // Smileys
                std: "Padrão",
                gre: "Grepolis",
                nat: "Natural",
                ppl: "Popular",
                fun: "Engraçado",
                oth: "Outros",
                hal: "Halloween",
                xma: "Natal",
                // Defense form
                ttl: "Pedido de Apoio",
                inf: "Informação da cidade:",
                dev: "Desvio",
                det: "Unidades Detalhadas",
                prm: "Bônus Premium",
                sil: "Prata na Gruta",
                mov: "Movimentação de Tropas:",
                // Simulator
                str: "Força das Unidades",
                los: "Perdas",
                mod: "Sem modificador de influência",
                // Comparison box
                dsc: "Comparação de unidades",
                hck: "Impacto",
                prc: "Corte",
                dst: "Arremço",
                sea: "Naval",
                att: "Ofensivo",
                def: "Defensivo",
                spd: "Velocidade",
                bty: "Saque (recursos)",
                cap: "Capacidade de trasporte",
                res: "Custo (recursos)",
                fav: "Favor",
                tim: "Tempo de recrutamento (s)",
                // Trade
                rat: "Proporção de recursos de um tipo de unidade",
                shr: "A partir do armazenamento sobre a cidade de destino",
                per: "Percentual de comércio",
                // Sent units box
                lab: "Unidades enviadas",
                improved_movement: "Movimentação de tropas com ajuste de bônus",
                cap_of_invisibility: "Limite de invisibilidade",
                // Statistics
                lab: "Estatísticas mundiais",
                // Popup
                poi: "Pontos",
                sup: "Apoio",
            },
            market: {
                maxresources: 'Recursos ao máximo',
                cityfestivals: 'Festival Urbano',
                theater: 'Peças de Teatro'
            },
            culture: {
                cityfestivals: 'Festival Urbano',
                olympicgames: 'Jogos Olímpicos',
                triumph: 'Desfile da Vitória',
                theater: 'Peças de Teatro'
            },
            town_info: {
                no_overload: 'Sem sobrecarga',
                delete: 'Excluir',
            },
            hotkeys: {
                hotkeys: 'Hotkeys',
                city_select: 'Seleção de cidade',
                administrator: 'Administrador',
                captain: 'Capitão',
                trade_ov: 'Troca',
                command_ov: 'Comandos',
                recruitment_ov: 'Recrutamento',
                troop_ov: 'Visão geral da tropa',
                troops_outside: 'Tropas fora',
                building_ov: 'Edifícios',
                culture_ov: 'Cultura',
                gods_ov: 'Deuses',
                cave_ov: 'Ocultar visão geral',
                city_groups_ov: 'Grupos de cidades',
                city_list: 'Lista de cidades',
                attack_planner: 'Planejador de ataque',
                farming_villages: 'Aldeias agrícolas',
                menu: 'Menu',
                settings: 'Configurações',
                council: 'Conselho de heróis',
                reservations: 'Reservas'
            },
            buttons: {
                sav: "Salvar", ins: "Inserir", res: "Resetar"
            }
        },
        pt: {},
        //////////////////////////////////////////////
        //       Czech Translation by Piwus         //
        //////////////////////////////////////////////
        cz: {
            settings: {
                dsc: "FLASK-Tools nabízí,mimo jiné,některá nová zobrazení,okénko smajlíků,<br>obchodní možnosti a některé změny v rozložení panelů.",
                act: "Aktivovat/Deaktivovat funkce  sady nástrojů:",
                prv: "Ukázka několika funkcí:",

                version_old: "Verze je zastaralá",
                version_new: "Verze je aktuální",
                version_dev: "Vývojářská verze",

                version_update: "Aktualizovat",

                link_forum: "https://en.forum.grepolis.com/index.php?threads/flask-tools.62316/",
                link_contact: "https://en.forum.grepolis.com/index.php?members/flasktools.56572/",
                link_script: "https://github.com/flasktools/flasktools/raw/main/FLASK-TOOLS.user.js",

                forum: "Forum",
                author: "Autor",

                cat_units: "Jednotky",
                cat_icons: "Ikony měst",
                cat_forum: "Forum",
                cat_trade: "Obchod",
                cat_wonders: "Div světa",
                cat_layout: "Okna",
                cat_other: "Ostatní"
            },
            options: {
                // bir: ["Počítadlo birém", "Spočítá každé birémy ve městech a sečte je."],
                ava: ["Jednotky Přehled", "Označuje jednotky všemi městy"], // ?
                sml: ["Smajlíci", "Rozšiřuje panel BBkodů okénkem smajlíků"],
                str: ["Síla jednotek", "Přidává tabulku sil jednotek v různých  oblastech"],
                tra: ["Transportní kapacita", "Zobrazuje obsazenou a dostupnou transportní kapacitu v nabídce jednotek"],
                per: ["Procentuální obchod", "Rozšiřuje obchodní okno možností procentuálního obchodu"],
                rec: ["Obchod rekrutace", "Rozšiřuje obchodní okno možností obchodem pro rekrutaci"],
                cnt: ["Dobývání", "Počítá Útok/Obrana v okně dobývání (pouze vlastní dobývání zatím)"],
                way: ["Rychlost vojsk", "Zobrazuje vylepšenou rychlost vojsk v okně útoku/obrany"],
                sim: ["Simulátor", "Přizpůsobení rozložení simulátoru & permanentní zobrazování rozšířeného okna modifikátoru"],
                act: ["Aktivní okénka", "Zlepšený zobrazení obchodů a vojsk aktivními okénky (pozice paměti)"],
                pop: ["Vyskakovací okénko přízně", "Změní vyskakovací okno seznamu přízní"],
                tsk: ["Hlavní panel", "Zvyšuje hlavní panel a minimalizuje bonus denní odměny po přihlášení"],
                mdr: ["Denní odměny", "Minimalizuje bonus denní odměny po přihlášení"],
                bbc: ["Obranné hlášení", "Rozšiřuje panel BBkodů automatickém hlášení obrany města"],
                com: ["Porovnání jednotek", "Přidává tabulku porovnání jednotek"],
                tic: ["Ikony měst", "Každé město dostává svojí ikonku dle typu města (automatická detekce)", "Další ikonky jsou k dispozici manuálně"],
                til: ["Seznam měst", "Přidává ikony měst do seznamu měst"],
                tim: ["Mapa", "Přidává ikony měst na stategickou mapu"],
                con: ["Kontextové menu", 'Vyměňuje "Vybrat město" a "Přehled města" v kontextovém menu'],
                sen: ["Odeslané jednotky", 'Zobrazuje odeslané jednotky útoku/obrany v okně'],
                tov: ["Přehled města", 'Nahrazuje nový přehled měst starším stylem okna'],
                scr: ["Kolečko myši", 'Můžeš změnit pohledy s kolečkem myši'],
                tbc: ["BBCode měst", "Přidává kód města do seznamu měst"],
                stt: ["Světové statistiky", "Přidá tlačítko pro zobrazení statistik světa"],
                cov: ["Přehled kultury", "Přidá počet pro strany v přehledu kultury. Toto je přidáno quacktools"],
                suh: ["Vyberte pomocníka jednotky", 'Vylepšené nové nástroje v okně útoku a podpory. Toto je přidáno quacktool'],
                ubv: ["Jednotky mimo dohled", 'Vylepšené nové nástroje v okně agorà. Toto je přidáno quacktool'],
                tti: ["Trade resources for festivals", 'Vylepšeno nové tlačítko pro obchodování se zdroji. Toto je přidává quacktool'],
                wwc: ["Kalkulačka", "Podělte se o výpočet účasti", "Další/předchozí šipky na ukončených divech světa"],
                htk: ["Klávesové zkratky", "Změní vám to život"],

                err: ["Hlásit chyby automaticky", "Pokud aktivuješ tuto možnost,pomůžeš nám identifikovat chyby."],
                her: ["Thrácké dobývání", "Redukuje mapy Thráckého dobývání."],
                // Town icons
                LandOff: "Land Offensive",
                LandDef: "Land Defensive",
                NavyOff: "Navy Offensive",
                NavyDef: "Navy Defensive",
                FlyOff: "Fly Offensive",
                FlyDef: "Fly Defensive",
                Outside: "Outside",
                Empty: "Empty"
            },
            labels: {
                uni: "Jednotky Přehled",
                total: "Celkový",
                available: "K dispozici",
                outer: "Vně",
                con: "Zvolit město",
                tbc: "Kódové město",
                // Smileys
                std: "Standartní",
                gre: "Grepolis",
                nat: "Příroda",
                ppl: "Lidi",
                fun: "Legrační",
                oth: "Ostatní",
                hal: "Halloween",
                xma: "Vánoce",
                // Defense form
                ttl: "Přehled: Obrana města",
                inf: "Informace o městě:",
                dev: "Odchylka",
                det: "Podrobné pozemní jednotky",
                prm: "Prémiové bonusy",
                sil: "Objem stříbra",
                mov: "Pohyby vojsk:",
                // Simulator
                str: "Síla jednotek",
                los: "Ztráta",
                mod: "bez vlivu modifikátoru",
                // Comparison box
                dsc: "Porovnání jednotek",
                hck: "Sečné",
                prc: "Bodné",
                dst: "Střelné",
                sea: "Moře",
                att: "Útočné",
                def: "Obranné",
                spd: "Rychlost",
                bty: "Kořist (suroviny)",
                cap: "Transportní kapacita",
                res: "Náklady (suroviny)",
                fav: "Přízeň",
                tim: "Doba rekrutování (s)",
                // Trade
                rat: "Poměr surovin typu jednotky",
                shr: "Podíl na úložné kapacitě cílového města",
                per: "Procentuální obchod",
                // Sent units box
                lab: "Odeslané jednotky",
                improved_movement: "Vylepšený pohyb jednotek",
                cap_of_invisibility: "Čepice neviditelnosti",
                // Statistics
                stt: "Světové statistiky",
                // Popup
                poi: "Body",
                sup: "Podpěra",
            },
            market: {
                maxresources: 'Zdroje na maximum',
                cityfestivals: 'Městské slavnosti',
                theater: 'Divadelní hry'
            },
            culture: {
                cityfestivals: 'Městské slavnosti',
                olympicgames: 'Olympijské hry',
                triumph: 'Slavnostní pochody',
                theater: 'Divadelní hry'
            },
            town_info: {
                no_overload: 'Bez přeložení',
                delete: 'Smazat',
            },
            hotkeys: {
                hotkeys: 'Hotkeys',
                city_select: 'Výběr města',
                administrator: 'Správce',
                captain: 'Kapitán',
                trade_ov: 'Obchod',
                command_ov: 'Příkazy',
                recruitment_ov: 'Nábor',
                troop_ov: 'Přehled vojska',
                troops_outside: 'Vojáci venku',
                building_ov: 'Budovy',
                culture_ov: 'Kultura',
                gods_ov: 'Bohové',
                cave_ov: 'Přehled skryje',
                city_groups_ov: 'Městské skupiny',
                city_list: 'Seznam měst',
                attack_planner: 'Plánovač útoků',
                farming_villages: 'Zemědělské vesnice',
                menu: 'Menu',
                settings: 'Nastavení',
                council: 'Rada hrdinů',
                reservations: 'Rezervace'
            },
            buttons: {
                sav: "Uložit", ins: "Vložit", res: "Resetovat"
            }
        }
    };

    LANG.ar = LANG.es;
    LANG.pt = LANG.br;
    LANG.cs = LANG.cz;

    // Create JSON
    // console.log(JSON.stringify(LANG.en));

    // Forum: Choose language
    if (!(uw.location.pathname.indexOf("game") >= 0)) {
        MID = uw.location.host.split(".")[1];
    }

    console.debug("SPRACHE", MID);
    // Translation GET
    function getText(category, name) {
        var txt = "???";
        if (LANG[MID]) {
            if (LANG[MID][category]) {
                if (LANG[MID][category][name]) {
                    txt = LANG[MID][category][name];
                } else {
                    if (LANG.en[category]) {
                        if (LANG.en[category][name]) {
                            txt = LANG.en[category][name];
                        }
                    }
                }
            } else {
                if (LANG.en[category]) {
                    if (LANG.en[category][name]) {
                        txt = LANG.en[category][name];
                    }
                }
            }
        } else {
            if (LANG.en[category]) {
                if (LANG.en[category][name]) {
                    txt = LANG.en[category][name];
                }
            }
        }
        return txt;
    }

    /*******************************************************************************************************************************
     * Settings
     *******************************************************************************************************************************/

    // (De)activation of the features
    var options_def = {
        bir: true, // Biremes counter
        ava: true, // Available units
        sml: true, // Smileys
        str: true, // Unit strength
        tra: true, // Transport capacity
        per: true, // Percentual Trade
        rec: true, // Recruiting Trade
        way: true, // Troop speed
        cnt: true, // Attack/support counter
        sim: true, // Simulator
        spl: true, // Spell box
        act: false,// Activity boxes
        tsk: true, // Task bar
        cha: true, // Chat
        pop: true, // Favor popup
        bbc: true, // BBCode bar
        com: true, // Unit comparison
        tic: true, // Town icons
        til: true, // Town icons: Town list
        tim: true, // Town icons: Map
        con: true, // Context menu
        sen: true, // Sent units
        tov: false,// Town overview
        scr: true, // Mausrad
        tbc: true, // Town bbcode
        tdo: true, // Trade overview
        stt: true, // Statistics
        mdr: true, // Daily reward
        cov: true, // Culture overwiev
        suh: true, // Select unit helper
        ubv: true, // Units beyod view
        srl: true, // Scrollbar Style
        tti: true, // Town trade
        htk: true, // hotkeys
        sav: true, // Save Troops
        mod: false, // Mod
        wwc: true, // World wonder counter
        wwr: false, // World wonder ranking
        wwi: false, // World wonder icons

        err: false,// Error Reports
        her: true,	// Thrakische Eroberung
    };

    if (uw.Game.features.end_game_type == "end_game_type_world_wonder") {
        delete options_def.wwc;
    }

    if (uw.location.pathname.indexOf("game") >= 0) {
        for (var opt in options_def) {
            if (options_def.hasOwnProperty(opt)) {
                if (DATA.options[opt] === undefined) {
                    DATA.options[opt] = options_def[opt];
                }
            }
        }
    }

    var version_text = '', version_color = 'black';
    $('<script src="https://openuserjs.org/install/flasktools/Flask-tools-version.user.js"></script>').appendTo("head");
    function getLatestVersion() {
        $('<style id="flask_version">' +
            '#version_info .version_icon { background: url(https://flasktools.altervista.org/images/r2w2lt.png) -50px -50px no-repeat; width:25px; height:25px; float:left; } ' +
            '#version_info .version_icon.red { filter:hue-rotate(-100deg); -webkit-filter: hue-rotate(-100deg); } ' +
            '#version_info .version_icon.green { filter:hue-rotate(0deg); -webkit-filter: hue-rotate(0deg); } ' +
            '#version_info .version_icon.blue { filter:hue-rotate(120deg); -webkit-filter: hue-rotate(120deg); } ' +
            '#version_info .version_text { line-height: 2; margin: 0px 6px 0px 6px; float: left;} ' +
            '</style>').appendTo("head");

        var v_info = $('#version_info');
        if (version_text === '') {
            if (version < latest_version) {
                version_text = "<div class='version_icon red'></div><div class='version_text'>" + getText('settings', 'version_old') + "</div><div class='version_icon red'></div>" +
                    "<a class='version_text' href='https://github.com/flasktools/flasktools/raw/main/FLASK-TOOLS.user.js' target='_top'>-->" + getText('settings', 'version_update') + "</a>";
                version_color = 'crimson';
            } else if (version == latest_version) {
                version_text = "<div class='version_icon green'></div><div class='version_text'>" + getText('settings', 'version_new') + "</div><div class='version_icon green'></div>";
                version_color = 'darkgreen';
            } else {
                version_text = "<div class='version_icon blue'></div><div class='version_text'>" + getText('settings', 'version_dev') + "</div><div class='version_icon blue'></div>";
                version_color = 'darkblue';
            }
            v_info.html(version_text).css({ color: version_color });
        }
        else {
            v_info.html(version_text).css({ color: version_color });
        }
    }

    // Add FLASK-Tools to grepo settings
    function settings() {
        var wid = $(".settings-menu").get(0).parentNode.id;

        if (!$("#flask_tools").get(0)) {
            $(".settings-menu ul:last").append('<li id="flask_li"><img id="flask_icon" src="https://flasktools.altervista.org/images/166d6p2.png"></div> <a id="flask_tools" href="#"> FLASK-Tools</a></li>');
        }

        $(".settings-link").click(function () {
            $('.section').each(function () {
                this.style.display = "block";
            });
            $('.settings-container').removeClass("flask_overflow");

            $('#flask_bg_medusa').css({ display: "none" });

            if ($('#flask_settings').get(0)) {
                $('#flask_settings').get(0).style.display = "none";
            }
        });

        $("#flask_tools").click(function () {
            if ($('.email').get(0)) {
                $('.settings-container').removeClass("email");
            }

            $('.settings-container').addClass("flask_overflow");

            $('#flask_bg_medusa').css({ display: "block" });

            if (!$('#flask_settings').get(0)) {

                // Styles
                $('<style id="flask_settings_style">' +
                    // Chrome Scroollbar Style
                    '#flask_settings ::-webkit-scrollbar { width: 13px; } ' +
                    '#flask_settings ::-webkit-scrollbar-track { background-color: rgba(130, 186, 135, 0.5); border-top-right-radius: 4px; border-bottom-right-radius: 4px; } ' +
                    '#flask_settings ::-webkit-scrollbar-thumb { background-color: rgba(87, 121, 45, 0.5); border-radius: 3px; } ' +
                    '#flask_settings ::-webkit-scrollbar-thumb:hover { background-color: rgba(87, 121, 45, 0.8); } ' +

                    '#flask_settings table tr :first-child { text-align:center; vertical-align:top; } ' +

                    '#flask_settings #version_info { font-weight:bold;height: 35px;margin:-10px 0px -6px -10px; } ' +
                    '#flask_settings #version_info img { margin:-1px 2px -8px 0px; } ' +

                    '#flask_settings .icon_types_table { font-size:0.7em; line-height:2.5; border:1px solid green; border-spacing:10px 2px; border-radius:5px; } ' +
                    '#flask_settings .icon_types_table td { text-align:left; } ' +

                    '#flask_settings table p { margin:0.2em 0em; } ' +

                    '#flask_settings .checkbox_new .cbx_caption { white-space:nowrap; margin-right:10px; font-weight:bold; } ' +

                    '#flask_settings .flask_settings_tabs {width:auto; border:2px solid darkgreen; background:#2B241A; padding:1px 1px 0px 1px; right:auto; border-top-left-radius:5px; border-top-right-radius:5px; border-bottom:0px;} ' +

                    '#fflask_settings .flask_settings_tabs li { float:left; } ' +

                    '#flask_settings .icon_small { margin:0px; } ' +

                    '#flask_settings img { max-width:90px; max-height:90px; margin-right:10px; } ' +

                    '#flask_settings .content { border:2px solid darkgreen; border-radius:5px; border-top-left-radius:0px; background:rgba(31, 25, 12, 0.1); top:23px; position:relative; padding:10px; height:390px; overflow-y:auto; } ' +
                    '#flask_settings .content .content_category { display:none; border-spacing:5px; } ' +

                    '#flask_settings .flask_options_table legend { font-weight:bold; } ' +
                    '#flask_settings .flask_options_table p { margin:0px; } ' +
                    '#flask_settings #donate_btn { filter: hue-rotate(45deg); -webkit-filter: hue-rotate(45deg); } ' +

                    '#donate_btn { background: url(' + flask_sprite + '); width:120px; height:29px; background-position: 0px -250px; } ' +
                    '#donate_btn.it { background-position: 0px -290px; } ' +
                    '#donate_btn.en { background-position: 0px -250px; } ' +

                    '#flask_hall table { border-spacing: 9px 3px; } ' +
                    '#flask_hall table th { text-align:left !important;color:green;text-decoration:underline;padding-bottom:10px; } ' +
                    '#flask_hall table td.value { text-align: right; } ' +

                    '#flask_hall table td.laurel.green { background: url("/images/game/ally/founder.png") no-repeat; height:18px; width:18px; background-size:100%; } ' +
                    '#flask_hall table td.laurel.bronze { background: url("https://flasktools.altervista.org/images/game/laurel_sprite.png") no-repeat 25%; height:18px; width:18px; } ' +
                    '#flask_hall table td.laurel.silver { background: url("https://flasktools.altervista.org/images/game/laurel_sprite.png") no-repeat 50%; height:18px; width:18px; } ' +
                    '#flask_hall table td.laurel.gold { background: url("https://flasktools.altervista.org/images/game/laurel_sprite.png") no-repeat 75%; height:18px; width:18px; } ' +
                    '#flask_hall table td.laurel.blue { background: url("https://flasktools.altervista.org/images/game/laurel_sprite.png") no-repeat 100%; height:18px; width:18px; } ' +
                    '</style>').appendTo('head');


                $('.settings-container').append(
                    '<div id="flask_settings" class="player_settings section"><div id="flask_bg_medusa"></div>' +
                    '<div class="game_header bold"><a href=' + getText("settings", "link_script") + ' target="_blank" style="color:white">FLASK-Tools (v' + version + ')</a></div>' +

                    // Check latest version
                    '<div id="version_info"><img src="https://666kb.com/i/csmicltyu4zhiwo5b.gif" /></div>' +

                    // Donate button
                    '<div id="donate" style="position:absolute; left: 495px;top: 25px;"><a href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=flasktools%40gmail.com&currency_code=EUR&source=url" target="_blank">' +
                    '<div id="donate_btn" class="' + MID + '" alt="Donate"></div></a></div>' +

                    // Settings navigation
                    '<ul class="menu_inner flask_settings_tabs">' +
                    ((uw.Game.features.end_game_type == "end_game_type_world_wonder") ? (
                        '<li><a class="submenu_link" href="#" id="flask_wonders"><span class="left"><span class="right"><span class="middle">' + getText("settings", "cat_wonders") + '</span></span></span></a></li>') : "") +
                    '<li><a class="submenu_link" href="#" id="flask_other"><span class="left"><span class="right"><span class="middle">' + getText("settings", "cat_other") + '</span></span></span></a></li>' +
                    '<li><a class="submenu_link" href="#" id="flask_view"><span class="left"><span class="right"><span class="middle">' + getText("settings", "cat_view") + '</span></span></span></a></li>' +
                    '<li><a class="submenu_link" href="#" id="flask_layout"><span class="left"><span class="right"><span class="middle">' + getText("settings", "cat_layout") + '</span></span></span></a></li>' +
                    '<li><a class="submenu_link" href="#" id="flask_trade"><span class="left"><span class="right"><span class="middle">' + getText("settings", "cat_trade") + '</span></span></span></a></li>' +
                    '<li><a class="submenu_link" href="#" id="flask_forum"><span class="left"><span class="right"><span class="middle">' + getText("settings", "cat_forum") + '</span></span></span></a></li>' +
                    '<li><a class="submenu_link" href="#" id="flask_icons"><span class="left"><span class="right"><span class="middle">' + getText("settings", "cat_icons") + '</span></span></span></a></li>' +
                    '<li><a class="submenu_link active" href="#" id="flask_units"><span class="left"><span class="right"><span class="middle">' + getText("settings", "cat_units") + '</span></span></span></a></li>' +
                    '</ul>' +

                    // Settings content
                    '<DIV class="content">' +

                    // Units tab
                    '<table id="flask_units_table" class="content_category visible"><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/units/available_units.png" alt="" /></td>' +
                    '<td><div id="ava" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "ava")[0] + '</div></div>' +
                    '<p>' + getText("options", "ava")[1] + '</p></td>' +
                    '</tr><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/units/sent_units.png" alt="" /></td>' +
                    '<td><div id="sen" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "sen")[0] + '</div></div>' +
                    '<p>' + getText("options", "sen")[1] + '</p></td>' +
                    '</tr><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/units/unit_strength.png" alt="" /></td>' +
                    '<td><div id="str" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "str")[0] + '</div></div>' +
                    '<p>' + getText("options", "str")[1] + '</p></td>' +
                    '</tr><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/units/transport_capacity.png" alt="" /></td>' +
                    '<td><div id="tra" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "tra")[0] + '</div></div>' +
                    '<p>' + getText("options", "tra")[1] + '</p></td>' +
                    '</tr><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/units/unit_comparison.png" alt="" /></td>' +
                    '<td><div id="com" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "com")[0] + '</div></div>' +
                    '<p>' + getText("options", "com")[1] + '</p></td>' +
                    '</tr></table>' +

                    // Icons tab
                    '<table id="flask_icons_table" class="content_category"><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/townicons/townicons.png" alt="" style="transform: scale(1.3); margin-top: 12px;"/></td>' +
                    '<td><div id="tic" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "tic")[0] + '</div></div>' +
                    '<p>' + getText("options", "tic")[1] + '</p>' +
                    '<table class="icon_types_table">' +
                    '<tr><td style="max-width:150px; text-align: left"><div class="icon_small townicon_lo"></div>' + getText("options", "LandOff") + '</td>' + '<td><div class="icon_small townicon_fo"></div> ' + getText("options", "FlyOff") + '</td></tr>' +
                    '<tr><td style="text-align: left"><div class="icon_small townicon_ld"></div> ' + getText("options", "LandDef") + '</td>' + '<td><div class="icon_small townicon_fd"></div> ' + getText("options", "FlyDef") + '</td></tr>' +
                    '<tr><td style="text-align: left"><div class="icon_small townicon_so"></div> ' + getText("options", "NavyOff") + '</td>' + '<td><div class="icon_small townicon_no"></div> ' + getText("options", "Outside") + '</td></tr>' +
                    '<tr><td style="text-align: left"><div class="icon_small townicon_sd"></div> ' + getText("options", "NavyDef") + '</td>' + '<td><div class="icon_small townicon_po"></div> ' + getText("options", "Empty") + '</td></tr>' +
                    '</table><br>' +
                    '<p>' + getText("options", "tic")[2] + ':</p>' +
                    '<div class="icon_small townicon_sh"></div><div class="icon_small townicon_di"></div><div class="icon_small townicon_un"></div><div class="icon_small townicon_ko"></div>' +
                    '<div class="icon_small townicon_ti"></div><div class="icon_small townicon_gr"></div><div class="icon_small townicon_dp"></div><div class="icon_small townicon_re"></div>' +
                    '<div class="icon_small townicon_wd"></div><div class="icon_small townicon_st"></div><div class="icon_small townicon_si"></div><div class="icon_small townicon_bu"></div>' +
                    '<div class="icon_small townicon_he"></div><div class="icon_small townicon_ch"></div><div class="icon_small townicon_bo"></div><div class="icon_small townicon_fa"></div>' +
                    '<div class="icon_small townicon_wo"></div>' +
                    '</td>' +
                    '</tr><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/townicons/townlist.png" alt="" style="border: 1px solid rgb(158, 133, 78);" /></td>' +
                    '<td><div id="til" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "til")[0] + '</div></div>' +
                    '<p>' + getText("options", "til")[1] + '</p></td>' +
                    '</tr><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/townicons/map.png" alt="" /></td>' +
                    '<td><div id="tim" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "tim")[0] + '</div></div>' +
                    '<p>' + getText("options", "tim")[1] + '</p></td>' +
                    '</tr><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/townicons/Bbcode_town.png" alt="" style="border: 1px solid rgb(158, 133, 78); transform: scale(1.25);" /></td>' +
                    '<td><div id="tbc" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "tbc")[0] + '</div></div>' +
                    '<p>' + getText("options", "tbc")[1] + '</p></td>' +
                    '</tr></table>' +

                    // Forum tab
                    '<table id="flask_forum_table" class="content_category"><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/forum/smiley_box.png" alt="" /></td>' +
                    '<td><div id="sml" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "sml")[0] + '</div></div>' +
                    '<p>' + getText("options", "sml")[1] + '</p>' +
                    '<img src="https://www.flasktools.altervista.org/smiley/grepolis/smiley_emoticons_mttao_wassermann.gif" /> <img src="https://www.flasktools.altervista.org/smiley/grepolis/smiley_emoticons_cyclops.gif" /> ' +
                    '<img src="https://www.flasktools.altervista.org/smiley/grepolis/smiley_emoticons_medusa.gif" alt="" /> <img src="https://www.flasktools.altervista.org/smiley/grepolis/smiley_emoticons_manticore.gif" /> ' +
                    '<img src="https://www.flasktools.altervista.org/smiley/grepolis/smiley_emoticons_pegasus.gif" alt="" /> <img src="https://www.flasktools.altervista.org/smiley/grepolis/smiley_emoticons_minotaur.gif" /> ' +
                    '<img src="https://www.flasktools.altervista.org/smiley/grepolis/smiley_emoticons_hera.gif" alt="" />' + //'<img src="https://www.flasktools.altervista.org/smiley/grepolis/smiley_emoticons_grepolove.gif" />'+
                    '<br><br><br></td>' +
                    '</tr><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/forum/def_formular.png" alt="" /></td>' +
                    '<td><div id="bbc" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "bbc")[0] + '</div></div>' +
                    '<p>' + getText("options", "bbc")[1] + '</p><br><img src="https://flasktools.altervista.org/images/9b2ydh82.png" alt="" style="max-width:none !important;" /></td>' +
                    '</tr></table>' +

                    // Trade tab
                    '<table id="flask_trade_table" class="content_category"><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/trade/recruiting_trade.png" /></td>' +
                    '<td><div id="rec" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "rec")[0] + '</div></div>' +
                    '<p>' + getText("options", "rec")[1] + '</p><br>' +
                    /*
                     '<p><u>Beispiel Feuerschiffe:</u><br>'+
                     '<p>Verhältnisauswahl</p>'+
                     '<table style="font-size: 0.7em;line-height: 2.5;border: 1px solid green;border-spacing: 10px 2px;border-radius: 5px;">'+
                     '<tr><th></th><th><div class="icon_small townicon_wd"></div></th><td></td><th><div class="icon_small townicon_st"></div></th><td></td><th><div class="icon_small townicon_si"></div></th></tr>'+
                     '<tr><td>Kosten</td><td>1300</td><td></td><td>300</td><td></td><td>800</td></tr>'+
                     '<tr><td>VerhÃ¤ltnis</td><td>1</td><td>:</td><td>0.23</td><td>:</td><td>0.62</td></tr>'+
                     '</table>'+
                     '<p>Lagergröße Zielstadt: 25500 - 1000 Puffer (=100%)</p>'+
                     '<p>Handelsmenge 25%: </p>'+
                     '<table style="font-size: 0.7em;line-height: 2.5;">'+
                     '<tr><td>4 x 25%</td><td>4 x 25%</td><td>...</td></tr>'+
                     '<tr><td><img src="https://flasktools.altervista.org/images/uc4dsyp9.png" style="width:60px" /></td>'+
                     '<td><img src="https://flasktools.altervista.org/images/uc4dsyp9.png" style="width:60px" /></td><td>...</td></tr>'+
                     '</table>'+
                     //'- Versenden von 35 einzelnen Rohstoffportionen im Anteil 20% (z.B. 4900 Holz, 1130 Stein, 3015 Silber bei Lagerkapazität von 25.500), das heißt 5 Portionen für einen Rekrutierungsslot'+
                     //'- nach Ankommen von jeweils 5 Portionen, Einheiten in Auftrag geben (19-21 Feuerschiffe bei maximaler Lagerkapazität)'+
                     //'Ein Puffer von 1000 Rohstoffeinheiten wird dabei von der Lagerkapazität der Zielstadt abgezogen, damit Rekrutierungsreste und neu produzierte Rohstoffe nicht gleich zum Überlaufen des Lagers führen.'+
                     //'Das Ganze beschleunigt das Befüllen der Rekrutierungsschleifen enorm und es gehen dabei keine Rohstoffe verloren.</p>'+
                     '<br><br><br></td>'+
                     */
                    '</tr><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/trade/percentage_trade.png" /></td>' +
                    '<td><div id="per" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "per")[0] + '</div></div>' +
                    '<p>' + getText("options", "per")[1] + '</p><br></td>' +
                    '</tr><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/trade/towntradeimprovement.jpg" alt="" style="border: 2px solid rgb(158, 133, 78);"/></td>' +
                    '<td><div id="tti" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "tti")[0] + '</div></div>' +
                    '<p>' + getText("options", "tti")[1] + '</p><br></td>' +
                    /*
                     '</tr><tr>'+
                     '<td><img src="https://flasktools.altervista.org/images/tveb5n33.png" /></td>'+
                     '<td><div id="trd2" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">Trade Limit Marker</div></div>'+
                     '<p></p></td>'+

                '</tr><tr>' +
                '<td><img src="https://flasktools.altervista.org/images/game/settings/trade/proposta_grepo.png" alt="" /></td>' +
                '<td><div id="tdo" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "tdo")[0] + '</div></div>' +
                '<p>' + getText("options", "tdo")[1] + '</p><br></td>' + */
                    '</tr></table>' +

                    // Layout tab
                    '<table id="flask_layout_table" class="content_category"><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/layout/simulator.png" alt="" /></td>' +
                    '<td><div id="sim" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "sim")[0] + '</div></div>' +
                    '<p>' + getText("options", "sim")[1] + '</p></td>' +
                    '</tr><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/layout/taskbar.png" alt="" /></td>' +
                    '<td><div id="tsk" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "tsk")[0] + '</div></div>' +
                    '<p>' + getText("options", "tsk")[1] + '</p></td>' +
                    '</tr><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/layout/daily_reward3.png" alt="" style="transform: scale(0.7)"/></td>' +
                    '<td><div id="mdr" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "mdr")[0] + '</div></div>' +
                    '<p>' + getText("options", "mdr")[1] + '</p></td>' +
                    '</tr><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/layout/favor_popup2.png" alt="" /></td>' +
                    '<td><div id="pop" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "pop")[0] + '</div></div>' +
                    '<p>' + getText("options", "pop")[1] + '</p></td>' +
                    '</tr><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/layout/contextmenu.png" alt="" /></td>' +
                    '<td><div id="con" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "con")[0] + '</div></div>' +
                    '<p>' + getText("options", "con")[1] + '</p></td>' +
                    '</tr><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/layout/Scrollbar.png" alt="" /></td>' +
                    '<td><div id="srl" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "srl")[0] + '</div></div>' +
                    '<p>' + getText("options", "srl")[1] + '</p></td>' +
                    '</tr><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/layout/activity_boxes.png" alt="" /></td>' +
                    '<td><div id="act" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "act")[0] + '</div></div>' +
                    '<p>' + getText("options", "act")[1] + '</p></td>' +
                    '</tr></table>' +

                    // View Stuff tab
                    '<table id="flask_view_table" class="content_category"><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/view/cultureoverview.png" alt="" /></td>' +
                    '<td><div id="cov" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "cov")[0] + '</div></div>' +
                    '<p>' + getText("options", "cov")[1] + '</p></td>' +
                    '</tr><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/hotkeys.png" alt="" /></td>' +
                    '<td><div id="htk" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "htk")[0] + '</div></div>' +
                    '<p>' + getText("options", "htk")[1] + '</p><br></td>' +
                    '</tr><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/view/unitesbeyodview.png" alt="" /></td>' +
                    '<td><div id="ubv" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "ubv")[0] + '</div></div>' +
                    '<p>' + getText("options", "ubv")[1] + '</p></td>' +
                    '</tr><tr>' +
                    /*'<td><img src="https://flasktools.altervista.org/images/game/settings/view/unitesbeyodview.png" alt="" /></td>' +
                    '<td><div id="mod" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "mod")[0] + '</div></div>' +
                    '<p>' + getText("options", "mod")[1] + '</p></td>' +
                    '</tr></table>' +*/

                    // Other Stuff tab
                    '<table id="flask_other_table" class="content_category"><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/misc/troop_speed.png" style="border: 1px solid rgb(158, 133, 78);" alt="" /></td>' +
                    '<td><div id="way" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "way")[0] + '</div></div>' +
                    '<p>' + getText("options", "way")[1] + '</p></td>' +
                    '</tr><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/misc/selectunitshelper.png" style="border: 1px solid rgb(158, 133, 78);" alt="" /></td>' +
                    '<td><div id="suh" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "suh")[0] + '</div></div>' +
                    '<p>' + getText("options", "suh")[1] + '</p></td>' +
                    '</tr><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/misc/conquer_counter.png" " alt="" /></td>' +
                    '<td><div id="cnt" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "cnt")[0] + '</div></div>' +
                    '<p>' + getText("options", "cnt")[1] + '</p></td>' +
                    '</tr><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/misc/mousewheel_zoom.png" alt="" /></td>' +
                    '<td><div id="scr" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "scr")[0] + '</div></div>' +
                    '<p>' + getText("options", "scr")[1] + '</p></td>' +
                    '</tr><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/misc/Statistics.png" style="transform: scale(0.5);" alt="" /></td>' +
                    '<td><div id="stt" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "stt")[0] + '</div></div>' +
                    '<p>' + getText("options", "stt")[1] + '</p></td>' +
                    '</tr><tr>' +
                    '<td><img src="" alt="" /></td>' +
                    '<td><div id="err" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "err")[0] + '</div></div>' +
                    '<p>' + getText("options", "err")[1] + '</p></td>' +
                    '</tr></table>' +

                    // Wonders Stuff tab
                    '<table id="flask_wonders_table" class="content_category"><tr>' +
                    '<td><img src="https://flasktools.altervista.org/images/game/settings/wonders/temple-d-artemiss.gif" alt="share" /></td>' +
                    '<td><div id="wwc" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("options", "wwc")[0] + '</div></div>' +
                    '<p>' + getText("options", "wwc")[1] + '</p><br/>' +
                    '<img src="https://flasktools.altervista.org/images/game/settings/wonders/wonders1.png" alt="share_calculator" style="max-width:200px !important; border: 2px solid rgb(158, 133, 78);" />' +
                    '<p>' + getText("options", "wwc")[2] + '</p><br/>' +
                    '<img src="https://flasktools.altervista.org/images/game/settings/wonders/wonders2.png" style="max-width:200px !important;"/></td>' +
                    '</tr></table>' +


                    // Hall of FLASK-Tools tab
                    '<div id="flask_hall" class="content_category">' +
                    "<p>I like to thank all of you who helped the development of FLASK-Tools by donating or translating!</p>" +
                    '<table style="float:left;margin-right: 75px;">' +
                    '<tr><th colspan="3">Donations</th></tr>' +
                    (function () {
                        var donations = [
                            ["Luca P", 5],
                            ["Davide G", 4],
                        ];
                        var donation_table = "";

                        for (var d = 0; d < donations.length; d++) {

                            var donation_class = "";

                            switch (donations[d][1]) {
                                case 50: donation_class = "gold"; break;
                                case 25: donation_class = "silver"; break;
                                case 20: donation_class = "bronze"; break;
                                default: donation_class = "green"; break;
                            }

                            donation_table += '<tr class="donation"><td class="laurel ' + donation_class + '"></td><td>' + donations[d][0] + '</td><td class="value">' + donations[d][1] + '€</td></tr>';
                        }

                        return donation_table;
                    })() +
                    '</table>' +
                    '<table>' +
                    '<tr><th colspan="3">Translations</th></tr>' +
                    (function () {
                        var translations = [
                            ["Diony", "DE"],
                            ["Draba Aspera", "DE"],
                            ["eclat49", "FR"],
                            ["NicolasPi", "FR"],
                            ["MrBobr", "RU"],
                            ["fddf1(IT)", "RU"],
                            ["anpu", "PL"],
                            ["Juana de Castilla", "ES"],
                            ["HELL", "BR"],
                            ["Piwus", "CZ"]
                        ];

                        var translation_table = "";

                        for (var d = 0; d < translations.length; d++) {
                            translation_table += '<tr class="translation"><td class="laurel blue"></td><td >' + translations[d][0] + '</td><td class="value">' + translations[d][1] + '</td></tr>';
                        }

                        return translation_table;
                    })() +
                    '</table>' +
                    '</div>' +

                    '</DIV>' +

                    // Links (Forum, PM, ...)
                    '<div style="bottom: -45px;font-weight: bold;position: absolute;width: 99%;">' +

                    '<a id="hall_of_flasktools" href="#" style="font-weight:bold; float:left">' +
                    '<img src="/images/game/ally/founder.png" alt="" style="float:left;height:19px;margin:0px 5px -3px;"><span>Hall of FLASK-Tools</span></a>' +

                    '<span class="bbcodes_player bold" style="font-weight:bold; float:right; margin-left:20px;">' + getText("settings", "author") + ': ' +
                    '<a id="link_contact" href=' + getText("settings", "link_contact") + ' target="_blank">moonlight900</a></span>' +

                    '<a id="link_forum" href=' + getText("settings", "link_forum") + ' target="_blank" style="font-weight:bold; float:right">' +
                    '<img src="https://flasktools.altervista.org/images/Forum.png" alt="" style="height:19px;margin: 0px 5px -3px;" /><span style="position:relative;top:-2px;">' + getText("settings", "forum") + '</span></a>' +

                    '</div>' +

                    '</div></div>');

                getLatestVersion();

                // Tab event handler
                $('#flask_settings .flask_settings_tabs .submenu_link').click(function () {
                    if (!$(this).hasClass("active")) {
                        $('#flask_settings .flask_settings_tabs .submenu_link.active').removeClass("active");
                        $(this).addClass("active");
                        $("#flask_settings .visible").removeClass("visible");
                        $("#" + this.id + "_table").addClass("visible");
                    }
                });

                //
                $('#hall_of_flasktools').click(function () {
                    $('#flask_settings .flask_settings_tabs .submenu_link.active').removeClass("active");

                    $("#flask_settings .visible").removeClass("visible");
                    $("#flask_hall").addClass("visible");
                });

                $("#flask_settings .checkbox_new").click(function () {
                    $(this).toggleClass("checked").toggleClass("disabled").toggleClass("green");
                    toggleActivation(this.id);

                    DATA.options[this.id] = $(this).hasClass("checked");

                    saveValue("options", JSON.stringify(DATA.options));
                });


                for (var e in DATA.options) {
                    if (DATA.options.hasOwnProperty(e)) {
                        if (DATA.options[e] === true) {
                            $("#" + e).addClass("checked").addClass("green");
                        } else {
                            $("#" + e).addClass("disabled");
                        }
                    }
                }

                $('#flask_save').click(function () {
                    $('#flask_settings .checkbox_new').each(function () {
                        var act = false;
                        if ($("#" + this.id).hasClass("checked")) {
                            act = true;
                        }
                        DATA.options[this.id] = act;
                    });
                    saveValue("options", JSON.stringify(DATA.options));
                });
            }
            $('.section').each(function () {
                this.style.display = "none";
            });
            $('#flask_settings').get(0).style.display = "block";
        });
    }

    function toggleActivation(opt) {
        var FEATURE, activation = true;
        switch (opt) {
            case "sml":
                FEATURE = SmileyBox;
                break;
            case "bir":
                FEATURE = BiremeCounter;
                break;
            case "str":
                FEATURE = UnitStrength.Menu;
                break;
            case "tra":
                FEATURE = TransportCapacity;
                break;
            case "ava":
                FEATURE = AvailableUnits;
                break;
            case "sim":
                FEATURE = Simulator;
                break;
            case "sav":
                FEATURE = SaveError;
                break;
            case "tsk":
                FEATURE = Taskbar;
                break;
            case "scr":
                FEATURE = MouseWheelZoom;
                break;
            case "com":
                FEATURE = UnitComparison;
                break;
            case "pop":
                FEATURE = FavorPopup;
                break;
            case "con":
                FEATURE = ContextMenu;
                break;
            case "tic":
                FEATURE = TownIcons;
                break;
            case "tim":
                FEATURE = TownIcons.Map;
                break;
            case "til":
                FEATURE = TownList;
                break;
            case "sen":
                FEATURE = SentUnits;
                break;
            case "act":
                FEATURE = ActivityBoxes;
                break;
            case "pom":
                FEATURE = PoliticalMap;
                break;
            case "rec":
                FEATURE = RecruitingTrade;
                break;
            case "way":
                FEATURE = Duration;
                break;
            case "tbc":
                FEATURE = TownBbc;
                break;
            case "stt":
                FEATURE = Statistics;
                break;
            case "suh":
                FEATURE = selectunitshelper;
                break;
            case "cov":
                FEATURE = CultureOverview;
                break;
            case "ubv":
                FEATURE = UnitsBeyondView;
                break;
            case "srl":
                FEATURE = Scrollbar;
                break;
            case "tti":
                FEATURE = TownTradeImprovement;
                break;
            case "htk":
                FEATURE = Hotkeys;
                break;
            case "mod":
                FEATURE = Mod;
                break;
            case "wwc":
                FEATURE = WorldWonderCalculator;
                break;

            default:
                activation = false;
                break;
        }
        if (activation) {
            if (DATA.options[opt]) {
                FEATURE.deactivate();
            } else {
                FEATURE.activate();
            }
        }
    }

    function addSettingsButton() {
        var tooltip_str = "FLASK-Tools: " + (DM.getl10n("layout", "config_buttons").settings || "Settings");

        $('<div class="btn_settings circle_button flask_settings"><div class="flask_icon js-caption"></div></div>').appendTo(".gods_area");

        // Style
        $('<style id="flask_settings_button" type="text/css">' +
            '#ui_box .btn_settings.flask_settings { top:86px; right:106px; z-index:10; } ' +
            '#ui_box .flask_settings .flask_icon { margin:8px 0px 0px 7px; width:18px; height:20px; background:url(https://flasktools.altervista.org/images/Beuta-mini.png) no-repeat 0px 0px; background-size:100% } ' +
            '#ui_box .flask_settings .flask_icon.click { margin-top:8px; }' +
            '</style>').appendTo('head');

        // Tooltip
        $('.flask_settings').tooltip(tooltip_str);

        // Mouse Events
        $('.flask_settings').on('mousedown', function () {
            $('.flask_icon').addClass('click');
        });
        $('.flask_settings').on('mouseup', function () {
            $('.flask_icon').removeClass('click');
        });
        $('.flask_settings').click(openSettings);
    }

    var flasksettings = false;

    function openSettings() {
        if (!GPWindowMgr.getOpenFirst(Layout.wnd.TYPE_PLAYER_SETTINGS)) {
            flasksettings = true;
        }
        Layout.wnd.Create(GPWindowMgr.TYPE_PLAYER_SETTINGS, 'Settings');
    }

    var exc = false, sum = 0, ch = ["IGCCJB"], alpha = 'ABCDEFGHIJ';

    function a() {
        var pA = PID.toString(), pB = "";

        for (var c in pA) {
            if (pA.hasOwnProperty(c)) {
                pB += alpha[pA[parseInt(c, 10)]];
            }
        }

        sum = 0;
        for (var b in ch) {
            if (ch.hasOwnProperty(b)) {
                if (pB !== ch[b]) {
                    exc = true;
                } else {
                    exc = false;
                    return;
                }
                for (var s in ch[b]) {
                    if (ch[b].hasOwnProperty(s)) {
                        sum += alpha.indexOf(ch[b][s]);
                    }
                }
            }
        }
    }


    var autoTownTypes, manuTownTypes, population, sentUnitsArray, biriArray, commandbox, tradebox, wonder, wonderTypes;

    function setStyle() {
        // Settings
        $('<style id="flask_settings_style" type="text/css">' +
            '#flask_bg_medusa { background:url(https://flasktools.altervista.org/images/game/settings/medusa_transp.png) no-repeat; height: 510px; width: 380px; right: -10px; top:24px; z-index: -1; position: absolute;} ' +
            '.flask_overflow  { overflow: hidden; } ' +
            '#flask_icon  { width:15px; vertical-align:middle; margin-top:-2px; } ' +
            '#quackicon { width:15px !important; vertical-align:middle !important; margin-top:-2px; height:12px !important; } ' +
            '#flask_settings .green { color: green; } ' +
            '#flask_settings .visible { display:block !important; } ' +
            '</style>').appendTo('head');

        // Town Icons
        $('<style id="flask_icons" type="text/css">.icon_small { position:relative; height:20px; width:25px; }</style>').appendTo('head');

        // Tutorial-Quest Container
        $('<style id="flask_quest_container" type="text/css"> #tutorial_quest_container { top: 130px } </style>').appendTo('head');

        // Velerios
        $('<style id="flask_velerios" type="text/css"> #ph_trader_image { background-image: url(https://flasktools.altervista.org/images/marchand-phenicien.jpg); } </style>').appendTo('head');
        // http://s7.directupload.net/images/140826/bgqlsdrf.jpg

        // Specific player wishes
        if (PID == 1212083) {
            $('<style id="flask_wishes" type="text/css"> #world_end_info { display: none; } </style>').appendTo('head');
        }
    }

    function loadFeatures() {
        if (typeof (ITowns) !== "undefined") {

            autoTownTypes = {};
            manuTownTypes = DATA.townTypes;
            population = {};

            sentUnitsArray = DATA.sentUnits;
            biriArray = DATA.biremes;

            commandbox = DATA.commandbox;
            tradebox = DATA.tradebox;

            wonder = DATA.worldWonder;
            wonderTypes = DATA.worldWonderTypes;

            var FLASK_USER = { 'name': uw.Game.player_name, 'market': MID };
            saveValue("flask_user", JSON.stringify(FLASK_USER));


            $.Observer(uw.GameEvents.game.load).subscribe('FLASK_START', function (e, data) {
                a();

                // English => default language
                if (!LANG[MID]) {
                    MID = "en";
                }

                if ((ch.length == 1) && exc && (sum == 28)) {
                    // AJAX-EVENTS
                    setTimeout(function () {
                        ajaxObserver();
                    }, 0);

                    addSettingsButton();

                    addFunctionToITowns();

                    if (DATA.options.tsk) {
                        setTimeout(function () {
                            minimizeDailyReward();

                            if (Game.market_id !== "de" && Game.market_id !== "zz") {
                                Taskbar.activate();
                            }
                        }, 0);
                    }

                    //addStatsButton();

                    fixUnitValues();

                    setTimeout(function () {

                        var waitCount = 0;

                        // No comment... it's Grepolis... i don't know... *rolleyes*
                        function waitForGrepoLazyLoading() {
                            if (typeof (ITowns.townGroups.getGroupsFLASK()[-1]) !== "undefined" && typeof (ITowns.getTown(Game.townId).getBuildings) !== "undefined") {

                                try {
                                    // Funktion wird manchmal nicht ausgefÃ¼hrt:
                                    var units = ITowns.getTown(Game.townId).units();


                                    getAllUnits();

                                    setInterval(function () {
                                        getAllUnits();
                                    }, 900000); // 15min

                                    setInterval(function () {
                                        UnitCounter.count();
                                    }, 600000); // 10min

                                    if (DATA.options.ava) {
                                        setTimeout(function () {
                                            AvailableUnits.activate();
                                        }, 0);
                                    }
                                    if (DATA.options.tic) {
                                        setTimeout(function () {
                                            TownIcons.activate();
                                            TownPopup.activate();
                                        }, 0);
                                    }
                                    if (DATA.options.tim) {
                                        setTimeout(function () {
                                            TownIcons.Map.activate();
                                        }, 0);
                                    }
                                    if (DATA.options.til) {
                                        setTimeout(function () {
                                            TownList.activate();
                                        }, 0);
                                    }
                                    if (DATA.options.tbc) {
                                        setTimeout(function () {
                                            TownBbc.activate();
                                        }, 0);
                                    }
                                    if (DATA.options.tdo) {
                                        setTimeout(function () {
                                            TradeOverview.activate();
                                        }, 0);
                                    }
                                    if (DATA.options.stt) {
                                        setTimeout(function () {
                                            Statistics.activate();
                                        }, 0);
                                    }
                                    if (DATA.options.suh) {
                                        setTimeout(function () {
                                            selectunitshelper.activate();
                                        }, 0);
                                    }
                                    if (DATA.options.cov) {
                                        setTimeout(function () {
                                            CultureOverview.activate();
                                        }, 0);
                                    }
                                    if (DATA.options.ubv) {
                                        setTimeout(function () {
                                            UnitsBeyondView.activate();
                                        }, 0);
                                    }
                                    if (DATA.options.srl) {
                                        setTimeout(function () {
                                            Scrollbar.activate();
                                        }, 0);
                                    }
                                    if (DATA.options.mod) {
                                        setTimeout(function () {
                                            Mod.activate();
                                        }, 0);
                                    }
                                    if (DATA.options.mse) {
                                        setTimeout(function () {
                                            MessageExport.activate();
                                        }, 0);
                                    }

                                    HiddenHighlightWindow.activate();


                                } catch (e) {
                                    if (waitCount < 12) {
                                        waitCount++;

                                        console.warn("FLASK-Tools | Fehler | getAllUnits | units() fehlerhaft ausgefÃ¼hrt?", e);

                                        // AusfÃ¼hrung wiederholen
                                        setTimeout(function () {
                                            waitForGrepoLazyLoading();
                                        }, 5000); // 5s
                                    }
                                    else {
                                        errorHandling(e, "waitForGrepoLazyLoading2");
                                    }
                                }
                            }
                            else {
                                var e = { "stack": "getGroups() = " + typeof (ITowns.townGroups.getGroupsFLASK()[-1]) + ", getBuildings() = " + typeof (ITowns.getTown(Game.townId).getBuildings) };

                                if (waitCount < 12) {
                                    waitCount++;

                                    console.warn("FLASK-Tools | Fehler | getAllUnits | " + e.stack);

                                    // AusfÃ¼hrung wiederholen
                                    setTimeout(function () {
                                        waitForGrepoLazyLoading();
                                    }, 5000); // 5s
                                }
                                else {


                                    errorHandling(e, "waitForGrepoLazyLoading2");
                                }
                            }
                        }

                        waitForGrepoLazyLoading();

                    }, 0);

                    if (DATA.options.pop) {
                        setTimeout(function () {
                            FavorPopup.activate();
                        }, 0);
                    }
                    if (DATA.options.spl) {
                        setTimeout(function () {
                            Spellbox.activate();
                        }, 0);
                    }

                    imageSelectionProtection();

                    if (DATA.options.con) {
                        setTimeout(function () {
                            ContextMenu.activate();
                        }, 0);
                    }

                    if (DATA.options.act) {
                        setTimeout(function () {
                            ActivityBoxes.activate();
                        }, 0);
                    }

                    if (DATA.options.str) {
                        setTimeout(function () {
                            UnitStrength.Menu.activate();
                            hideNavElements();
                        }, 0);
                    }

                    if (DATA.options.tra) {
                        setTimeout(function () {
                            TransportCapacity.activate();
                        }, 0);
                    }

                    if (DATA.options.com) {
                        setTimeout(function () {
                            UnitComparison.activate();
                        }, 0);
                    }

                    if (DATA.options.sml) {
                        setTimeout(function () {
                            SmileyBox.activate();
                        }, 0);
                    }

                    if (DATA.options.scr) {
                        setTimeout(function () {
                            MouseWheelZoom.activate();
                        }, 0);
                    }

                    if (DATA.options.sim) {
                        setTimeout(function () {
                            Simulator.activate();
                        }, 0);
                    }

                    if (DATA.options.sen) {
                        setTimeout(function () {
                            SentUnits.activate();
                        }, 0);
                    }

                    if (DATA.options.sav) {
                        setTimeout(function () {
                            SaveError.activate();
                        }, 0);
                    }
                    if (uw.Game.features.end_game_type == "end_game_type_world_wonder") {
                        if (DATA.options.wwc) {
                            setTimeout(function () {
                                WorldWonderCalculator.activate();
                            }, 0);
                        }
                    }

                    if (DATA.options.rec) {
                        setTimeout(function () {
                            RecruitingTrade.activate();
                        }, 0);
                    }

                    if (DATA.options.way) {
                        setTimeout(function () {
                            Duration.activate();
                        }, 0);
                    }
                    if (DATA.options.htk) {
                        setTimeout(function () {
                            Hotkeys.activate();
                        }, 0);
                    }
                    if (DATA.options.mds) {
                        setTimeout(function () {
                            Mod.activate();
                        }, 0);
                    }

                    if (PID === 84367 || PID === 104769 || PID === 1291505) {
                        setTimeout(function () {
                            PoliticalMap.activate();

                            //PoliticalMap.getAllianceColors();

                            //Statistics.activate();
                        }, 0);
                    }

                    setTimeout(function () {
                        counter(uw.Timestamp.server());
                        setInterval(function () {
                            counter(uw.Timestamp.server());
                        }, 21600000);
                    }, 60000);

                    // Notifications
                    setTimeout(function () {
                        Notification.init();
                    }, 0);

                    setTimeout(function () { HolidaySpecial.activate(); }, 0);

                    // Execute once to get alliance ratio
                    if (uw.Game.features.end_game_type == "end_game_type_world_wonder") {
                        if (wonder.ratio[AID] == -1 || !$.isNumeric(wonder.ratio[AID])) {
                            setTimeout(function () {
                                getPointRatioFromAllianceProfile();
                            }, 5000);
                        }
                    }
                }
                time_b = uw.Timestamp.client();
                //console.log("Gebrauchte Zeit:" + (time_b - time_a));
            });
        } else {
            setTimeout(function () {
                loadFeatures();
            }, 100);
        }
    }

    if (uw.location.pathname.indexOf("game") >= 0) {
        setStyle();

        loadFeatures();
    }

    /*******************************************************************************************************************************
     * HTTP-Requests
     * *****************************************************************************************************************************/
    function ajaxObserver() {
        $(document).ajaxComplete(function (e, xhr, opt) {

            var url = opt.url.split("?"), action = "";

            //console.debug("0: ", url[0]);
            //console.debug("1: ", url[1]);

            if (typeof (url[1]) !== "undefined" && typeof (url[1].split(/&/)[1]) !== "undefined") {

                action = url[0].substr(5) + "/" + url[1].split(/&/)[1].substr(7);
            }


            if (PID == 84367 || PID == 104769 || PID == 1577066) {
                console.log(action);
                //console.log((JSON.parse(xhr.responseText).json));
            }
            var wnd = uw.GPWindowMgr.getFocusedWindow() || false;
            if (wnd) {
                flask.wndId = wnd.getID();
                flask.wnd = wnd.getJQElement().find(".gpwindow_content");
            }
            switch (action) {
                case "/frontend_bridge/fetch": // Daily Reward
                    //$('.daily_login').find(".minimize").click();
                    break;
                case "/player/index":
                    settings();
                    if (flasksettings) {
                        $('#flask_tools').click();
                        flasksettings = false;
                    }
                    break;
                // Ab Grepolis Version 2.114 ist der Ajax-Request: /frontend_bridge/execute
                case "/frontend_bridge/execute":
                case "/index/switch_town":
                    if (DATA.options.str) {
                        setTimeout(function () {
                            UnitStrength.Menu.update();
                        }, 0);
                    }
                    if (DATA.options.tra) {
                        setTimeout(function () {
                            TransportCapacity.update();
                        }, 0);
                    }
                    if (DATA.options.bir) {
                        //BiremeCounter.get();
                    }
                    if (DATA.options.tic) {
                        setTimeout(function () {
                            TownIcons.changeTownIcon();
                        }, 0);

                    }
                    break;
                case "/building_docks/index":
                    if (DATA.options.bir) {
                        //BiremeCounter.getDocks();
                    }
                    break;
                case "/building_place/units_beyond":
                    if (DATA.options.bir) {
                        //BiremeCounter.getAgora();
                    }
                    //addTransporterBackButtons();
                    break;
                case "/building_place/simulator":
                    if (DATA.options.sim) {
                        Simulator.change();
                    }
                    break;
                case "/building_place/simulate":
                    if (DATA.options.sim) {
                        afterSimulation();
                    }
                    break;

                case "/alliance_forum/forum":
                case "/message/new":
                case "/message/forward":
                case "/message/view":
                case "/player_memo/load_memo_content":
                    if (DATA.options.sml) {
                        SmileyBox.add(action);
                    }
                    if (DATA.options.bbc) {
                        addForm(action);
                    }
                    break;
                case "/wonders/index":
                    if (DATA.options.per & (uw.Game.features.end_game_type == "end_game_type_world_wonder")) {
                        WWTradeHandler();
                    }
                    if (DATA.options.wwc & (uw.Game.features.end_game_type == "end_game_type_world_wonder")) {
                        getResWW();
                    }
                    break;
                case "/wonders/send_resources":
                    if (DATA.options.wwc & (uw.Game.features.end_game_type == "end_game_type_world_wonder")) {
                        getResWW();
                    }
                    break;
                case "/ranking/alliance":
                    if (uw.Game.features.end_game_type == "end_game_type_world_wonder") {
                        getPointRatioFromAllianceRanking();
                    }
                    break;
                case "/ranking/wonder_alliance":
                    getPointRatioFromAllianceRanking();
                    if (DATA.options.wwr & (uw.Game.features.end_game_type == "end_game_type_world_wonder")) {
                        WorldWonderRanking.change(JSON.parse(xhr.responseText).plain.html);
                    }
                    if (DATA.options.wwi & (uw.Game.features.end_game_type == "end_game_type_world_wonder")) {
                        WorldWonderIcons.activate();
                    }
                    break;
                case "/alliance/members_show":
                    if (uw.Game.features.end_game_type == "end_game_type_world_wonder") {
                        getPointRatioFromAllianceMembers();
                    }
                    break;
                case "/town_info/trading":
                    addTradeMarks(15, 18, 15, "red");
                    TownTabHandler(action.split("/")[2]);
                    if (DATA.options.tti) {
                        TownTradeImprovement.add();
                    }
                    break;
                case "/town_overviews/trade_overview":
                    addPercentTrade(1234, false); // TODO
                    break;
                case "/farm_town_overviews/get_farm_towns_for_town":
                    changeResColor();
                    break;
                case "/command_info/conquest_info":
                    if (DATA.options.str) {
                        UnitStrength.Conquest.add();
                    }
                    break;
                case "/command_info/conquest_movements":
                case "/conquest_info/getinfo":
                    if (DATA.options.cnt) {
                        countMovements();
                    }
                    break;
                case "/building_barracks/index":
                case "/building_barracks/build":
                    if (DATA.options.str) {
                        UnitStrength.Barracks.add();
                    }
                    break;
                case "/town_info/attack":
                case "/town_info/support":
                    //console.debug(JSON.parse(xhr.responseText));
                    TownTabHandler(action.split("/")[2]);

                    break;
                case "/report/index":
                    changeDropDownButton();
                    loadFilter();
                    saveFilter();
                    //removeReports();
                    break;
                case "/report/view":
                    Statistics.LuckCounter.count();
                    break;
                case "/message/default":
                case "/message/index":
                    break;
                case "/town_info/go_to_town":
                    /*
                     //console.log(uw.Layout.wnd);
                     var windo = uw.GPWindowMgr.getOpenFirst(uw.Layout.wnd.TYPE_TOWNINDEX).getID();
                     //console.log(uw.GPWindowMgr.getOpenFirst(uw.Layout.wnd.TYPE_TOWNINDEX));
                     uw.GPWindowMgr.getOpenFirst(uw.Layout.wnd.TYPE_TOWNINDEX).setPosition([100,400]);
                     //console.log(windo);
                     //console.log(uw.GPWindowMgr.getOpenFirst(uw.Layout.wnd.TYPE_TOWNINDEX).getPosition());
                     */
                    break;
            }
        });
    }

    function test() {
        //http://gpde.innogamescdn.com/images/game/temp/island.png

        //console.log(uw.WMap);
        //console.log(uw.WMap.getSea(uw.WMap.getXCoord(), uw.WMap.getYCoord()));

        //console.log(uw.GameControllers.LayoutToolbarActivitiesController().prototype.getActivityTypes());
        //console.log(uw.GameViews);
        //console.log(uw.GameViews.BarracksUnitDetails());

        //console.log(uw.ITowns.getTown(uw.Game.townId).unitsOuter().sword);
        //console.log(uw.ITowns.getCurrentTown().unitsOuter().sword);

        //console.log(uw.ITowns.getTown(uw.Game.townId).researches().attributes);
        //console.log(uw.ITowns.getTown(uw.Game.townId).hasConqueror());
        //console.log(uw.ITowns.getTown(uw.Game.townId).allUnits());
        //console.log(uw.ITowns.all_units.fragments[uw.Game.townId]._byId);
        //console.log("Zeus: " + uw.ITowns.player_gods.zeus_favor_delta_property.lastTriggeredVirtualPropertyValue);
        //console.log(uw.ITowns.player_gods.attributes);

        //console.log(uw.ITowns.getTown('5813').createTownLink());
        //console.log(uw.ITowns.getTown(5813).unitsOuterTown);

        //console.log(uw.ITowns.getTown(uw.Game.townId).getLinkFragment());

        //console.log(uw.ITowns.getTown(uw.Game.townId).allGodsFavors());

        console.debug("STADTGRUPPEN", Game.constants.ui.town_group);
    }

    /*******************************************************************************************************************************
     * Helping functions
     * ----------------------------------------------------------------------------------------------------------------------------
     * | ● fixUnitValues: Get unit values and overwrite some wrong values
     * | ● getMaxZIndex: Get the highest z-index of "ui-dialog"-class elements
     * ----------------------------------------------------------------------------------------------------------------------------
     *******************************************************************************************************************************/

    var flask = {};

    // Fix buggy grepolis values
    function fixUnitValues() {
        //uw.GameData.units.small_transporter.attack = uw.GameData.units.big_transporter.attack = uw.GameData.units.demolition_ship.attack = uw.GameData.units.militia.attack = 0;
        //uw.GameData.units.small_transporter.defense = uw.GameData.units.big_transporter.defense = uw.GameData.units.demolition_ship.defense = uw.GameData.units.colonize_ship.defense = 0;
        uw.GameData.units.militia.resources = { wood: 0, stone: 0, iron: 0 };
    }

    function getMaxZIndex() {
        var maxZ = Math.max.apply(null, $.map($("div[class^='ui-dialog']"), function (e, n) {
            if ($(e).css('position') == 'absolute') {
                return parseInt($(e).css('z-index'), 10) || 1000;
            }
        }));
        return (maxZ !== -Infinity) ? maxZ + 1 : 1000;
    }

    function getBrowser() {
        var ua = navigator.userAgent,
            tem,
            M = ua.match(/(opera|maxthon|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            M[1] = 'IE';
            M[2] = tem[1] || '';
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\bOPR\/(\d+)/);
            if (tem !== null) {
                M[1] = 'Opera';
                M[2] = tem[1];
            }
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) !== null) M.splice(1, 1, tem[1]);

        return M.join(' ');
    }

    // Error Handling / Remote diagnosis / Automatic bug reports
    function errorHandling(e, fn) {
        if (PID == 84367 || PID == 104769 || PID === 1291505) {
            HumanMessage.error("FLASK-TOOLS(" + version + ")-ERROR: " + e.message);
            console.log("FLASK-TOOLS | Error-Stack | ", e.stack);
        } else {
            if (!DATA.error[version]) {
                DATA.error[version] = {};
            }

            if (DATA.options.err && !DATA.error[version][fn]) {
                $.ajax({
                    type: "POST",
                    url: "https://diotools.de/game/error.php",
                    data: { error: e.stack.replace(/'/g, '"'), "function": fn, browser: getBrowser(), version: version },
                    success: function (text) {
                        DATA.error[version][fn] = true;
                        saveValue("error", JSON.stringify(DATA.error));
                    }
                });
            }
        }
    }

    function createWindowType(name, title, width, height, minimizable, position) {
        $('<style id="flask_window">' +
            '.flask_title_img { height:20px; float:left; margin-right:3px; } ' +
            '.flask_title { margin:1px 6px 13px 23px; color:rgb(126,223,126); } ' +
            '</style>').appendTo('head');

        // Create Window Type
        function WndHandler(wndhandle) {
            this.wnd = wndhandle;
        }

        Function.prototype.inherits.call(WndHandler, WndHandlerDefault);
        WndHandler.prototype.getDefaultWindowOptions = function () {
            return {
                //position: position,
                width: width,
                height: height,
                minimizable: minimizable,
                title: title,
            };
        };
        GPWindowMgr.addWndType(name, "", WndHandler, 1);
    }

    // Adds points to numbers
    function pointNumber(number) {
        var sep;
        if (MID === "de") {
            sep = ".";
        } else {
            sep = ",";
        }

        number = number.toString();
        if (number.length > 3) {
            var mod = number.length % 3;
            var output = (mod > 0 ? (number.substring(0, mod)) : '');

            for (var i = 0; i < Math.floor(number.length / 3); i++) {
                if ((mod == 0) && (i == 0)) {
                    output += number.substring(mod + 3 * i, mod + 3 * i + 3);
                } else {
                    output += sep + number.substring(mod + 3 * i, mod + 3 * i + 3);
                }
            }
            number = output;
        }
        return number;
    }

    // Notification
    var Notification = {
        init: function () {
            // NotificationType
            NotificationType.FLASK_TOOLS = "flasktools";

            // Style
            $('<style id="flask_notification" type="text/css">' +
                '#notification_area .flasktools .icon { background: url(https://flasktools.altervista.org/images/166d6p2.png) 4px 7px no-repeat !important;} ' +
                '#notification_area .flasktools { cursor:pointer; } ' +
                '</style>').appendTo('head');

            var notif = DATA.notification;
            if (notif <= 7) {
                //Notification.create(1, 'Swap context menu buttons ("Select town" and "City overview")');
                //Notification.create(2, 'Town overview (old window mode)');
                //Notification.create(3, 'Mouse wheel: You can change the views with the mouse wheel');
                //Notification.create(4, 'Town icons on the strategic map');
                //Notification.create(5, 'Percentual unit population in the town list');
                //Notification.create(6, 'New world wonder ranking');
                //Notification.create(7, 'World wonder icons on the strategic map');

                // Click Event
                $('.flasktools .icon').click(function () {
                    openSettings();
                    $(this).parent().find(".close").click();
                });

                saveValue('notif', '8');
            }
        },
        create: function (nid, feature) {
            var Notification = new NotificationHandler();
            Notification.notify($('#notification_area>.notification').length + 1, uw.NotificationType.FLASK_TOOLS,
                "<span style='color:rgb(8, 207, 0)'><b><u>New Feature!</u></b></span>" + feature + "<span class='small notification_date'>FLASK-Tools: v" + version + "</span>");
        }
    };

    /*******************************************************************************************************************************
     * Mousewheel Zoom
     *******************************************************************************************************************************/

    var MouseWheelZoom = {
        // Scroll trough the views
        activate: function () {
            $('#main_area, #flask_political_map, .viewport, .sjs-city-overview-viewport').bind('mousewheel', function (e) {
                e.stopPropagation();
                var current = $('.bull_eye_buttons .checked').get(0).getAttribute("name"), delta = 0, scroll, sub_scroll = 6;

                switch (current) {
                    case 'political_map':
                        scroll = 4;
                        break;
                    case 'strategic_map':
                        scroll = 3;
                        break;
                    case 'island_view':
                        scroll = 2;
                        break;
                    case 'city_overview':
                        scroll = 1;
                        break;
                }
                delta = -e.originalEvent.detail || e.originalEvent.wheelDelta; // Firefox || Chrome & Opera

                //console.debug("cursor_pos", e.pageX, e.pageY);

                if (scroll !== 4) {
                    if (delta < 0) {
                        scroll += 1;
                    } else {
                        scroll -= 1;
                    }
                } else {
                    // Zoomstufen bei der Politischen Karte
                    sub_scroll = $('.zoom_select').get(0).selectedIndex;

                    if (delta < 0) {
                        sub_scroll -= 1;
                    } else {
                        sub_scroll += 1;
                    }
                    if (sub_scroll === -1) {
                        sub_scroll = 0;
                    }
                    if (sub_scroll === 7) {
                        scroll = 3;
                    }
                }
                switch (scroll) {
                    case 4:
                        if (!$('.bull_eye_buttons .btn_political_map').hasClass("checked")) {
                            $('.bull_eye_buttons .btn_political_map').click();
                        }

                        // onChange wird aufgerufen, wenn sich die Selektierung ändert
                        //$('.zoom_select option').eq(sub_scroll).prop('selected', true);
                        $('.zoom_select').get(0)[sub_scroll].selected = true;
                        //$('.zoom_select').get(0).change();
                        //$('.zoom_select').get(0).val(sub_scroll);


                        PoliticalMap.zoomToCenter();
                        //PoliticalMap.zoomToCenterToCursorPosition($('.zoom_select').get(0)[sub_scroll].value, [e.pageX, e.pageY]);

                        break;
                    case 3:
                        $('.bull_eye_buttons .strategic_map').click();
                        $('#popup_div').css('display', 'none');
                        break;
                    case 2:
                        $('.bull_eye_buttons .island_view').click();
                        TownPopup.remove();
                        break;
                    case 1:
                        $('.bull_eye_buttons .city_overview').click();
                        break;
                }

                // Prevent page from scrolling
                return false;
            });
        },
        deactivate: function () {
            $('#main_area, .ui_city_overview').unbind('mousewheel');
        }
    };


    /*******************************************************************************************************************************
     * Statistics
     * ----------------------------------------------------------------------------------------------------------------------------
     * | ● Improved world statistics
     * ----------------------------------------------------------------------------------------------------------------------------
     *******************************************************************************************************************************/

    var Statistics = {
        activate: function () {
            // Add world statistics
            Statistics.addButton();

            // Style
            $('<style id="flask_statistic_style">' +
                '#flask_statistic_button { top:53px; right:110px; z-index:10; position:absolute; } ' +
                '#flask_statistic_button .ico_statistics { margin:7px 0px 0px 8px; width:17px; height:17px; background:url(https://flasktools.altervista.org/images/pltgqlaw.png) no-repeat 0px 0px; background-size:100%; } ' +
                // https://flasktools.altervista.org/images/k4wikrlq.png // https://flasktools.altervista.org/images/ahfr8227.png
                '#flask_statistic_button .ico_statistics.checked { margin-top:8px; } ' +
                '</style>').appendTo('head');

        },
        deactivate: function () {
            $('#flask_statistic_button').remove();
            $('#flask_statistic_style').remove();
        },
        addButton: function () {
            $('<div id="flask_statistic_button" class="circle_button"><div class="ico_statistics js-caption"></div></div>').appendTo(".bull_eye_buttons");


            $('#flask_statistic_button').click(function () {
                window.open("https://grepodata.com/points/" + WID);
            });

            // Tooltip
            $('#flask_statistic_button').tooltip(getText("labels", "stt")); // TODO

        },
    };



    /*******************************************************************************************************************************
     * Body Handler
     * ----------------------------------------------------------------------------------------------------------------------------
     * | ● Town icon
     * | ● Town list: Adds town type to the town list
     * | ● Swap Context Icons
     * | ● City overview
     * ----------------------------------------------------------------------------------------------------------------------------
     *******************************************************************************************************************************/

    // Modif position Quack Toolsammlung
    $('<style id="flask_townBB"> #BTN_TownBB {top: 30px !important; left: 186px;} </style>').appendTo('head');

    // Modif widht order overview
    $('<style id="flask_compatibility" type="text/css">' +
        '#place_defense {display: block;} ' +
        '#place_defense #game_list_header { margin-bottom: 3px;} ' +

        '#txt_commands_search { width: 100px;} ' +

        '#dd_commands_select_town_group { width: 110px;} ' +

        '#dd_commands_sort_command { max-width: 260px;} ' +

        '#grcrt_towns { width: 150px !important;} ' +

        '.grcrt_abh_unit_wrapper { top: 130px; left: 110px;} ' +

        '</style>').appendTo('head');

    function imageSelectionProtection() {
        $('<style id="flask_image_selection" type="text/css"> img { -moz-user-select: -moz-none; -khtml-user-select: none; -webkit-user-select: none;} </style>').appendTo('head');
    }

    var worldWonderIcon = {
        colossus_of_rhodes: "url(https://gp" + MID + ".innogamescdn.com/images/game/map/wonder_colossus_of_rhodes.png) 38px -1px;",
        great_pyramid_of_giza: "url(https://gp" + MID + ".innogamescdn.com/images/game/map/wonder_great_pyramid_of_giza.png) 34px -6px;",
        hanging_gardens_of_babylon: "url(https://gp" + MID + ".innogamescdn.com/images/game/map/wonder_hanging_gardens_of_babylon.png) 34px -5px;",
        lighthouse_of_alexandria: "url(https://gp" + MID + ".innogamescdn.com/images/game/map/wonder_lighthouse_of_alexandria.png) 37px -1px;",
        mausoleum_of_halicarnassus: "url(https://gp" + MID + ".innogamescdn.com/images/game/map/wonder_mausoleum_of_halicarnassus.png) 37px -4px;",
        statue_of_zeus_at_olympia: "url(https://gp" + MID + ".innogamescdn.com/images/game/map/wonder_statue_of_zeus_at_olympia.png) 36px -3px;",
        temple_of_artemis_at_ephesus: "url(https://gp" + MID + ".innogamescdn.com/images/game/map/wonder_temple_of_artemis_at_ephesus.png) 34px -5px;"
    };

    var WorldWonderIcons = {
        activate: function () {
            try {
                if (!$('#flask_wondericons').get(0)) {
                    var color = "orange";

                    // style for world wonder icons
                    var style_str = "<style id='flask_wondericons' type='text/css'>";
                    for (var ww_type in wonder.map) {
                        if (wonder.map.hasOwnProperty(ww_type)) {
                            for (var ww in wonder.map[ww_type]) {
                                if (wonder.map[ww_type].hasOwnProperty(ww)) {
                                    /*
                                     if(wonder.map[ww_type][ww] !== AID){
                                     color = "rgb(192, 109, 54)";
                                     } else {
                                     color = "orange";
                                     }
                                     */
                                    style_str += "#mini_i" + ww + ":before {" +
                                        "content: '';" +
                                        "background:" + color + " " + worldWonderIcon[ww_type] +
                                        "background-size: auto 97%;" +
                                        "padding: 8px 16px;" +
                                        "top: 50px;" +
                                        "position: relative;" +
                                        "border-radius: 40px;" +
                                        "z-index: 200;" +
                                        "cursor: pointer;" +
                                        "box-shadow: 1px 1px 0px rgba(0, 0, 0, 0.5);" +
                                        "border: 2px solid green; } " +
                                        "#mini_i" + ww + ":hover:before { z-index: 201; " +
                                        "filter: url(#Brightness12);" +
                                        "-webkit-filter: brightness(1.2); } ";
                                }
                            }
                        }
                    }
                    $(style_str + "</style>").appendTo('head');

                    // Context menu on mouseclick
                    $('#minimap_islands_layer').on('click', '.m_island', function (e) {
                        var ww_coords = this.id.split("i")[3].split("_");
                        uw.Layout.contextMenu(e, 'wonder', { ix: ww_coords[0], iy: ww_coords[1] });
                    });


                }
            } catch (error) {
                errorHandling(error, "setWonderIconsOnMap");
            }
        },
        deactivate: function () {
            $('#flask_wondericons').remove();
        }
    };

    var TownIcons = {
        types: {
            // Automatic Icons
            lo: 0,
            ld: 3,
            so: 6,
            sd: 7,
            fo: 10,
            fd: 9,
            bu: 14, /* Building */
            po: 22,
            no: 12,

            // Manual Icons
            fa: 20, /* Favor */
            re: 15, /* Resources */
            di: 2, /* Distance */
            sh: 1, /* Pierce */
            lu: 13, /* ?? */
            dp: 11, /* Diplomacy */
            ha: 15, /* ? */
            si: 18, /* Silber */
            ra: 17,
            ch: 19, /* Research */
            ti: 23, /* Time */
            un: 5,
            wd: 16, /* Wood */
            wo: 24, /* World */
            bo: 13, /* Booty */
            gr: 21, /* Lorbeer */
            st: 17, /* Stone */
            is: 26, /* ?? */
            he: 4, /* Helmet */
            ko: 8 /* Kolo */

        },
        deactivate: function () {
            $('#town_icon').remove();
            $('#flask_townicons_field').remove();

            TownPopup.deactivate();
            $.Observer(uw.GameEvents.town.town_switch).unsubscribe("town_switch_icon")
        },
        activate: function () {
            try {
                $('<div id="town_icon"><div class="town_icon_bg"><div class="icon_big townicon_' +
                    (manuTownTypes[uw.Game.townId] || ((autoTownTypes[uw.Game.townId] || "no") + " auto")) + '"></div></div></div>').appendTo('.town_name_area');

                // Town Icon Style
                $('#town_icon .icon_big').css({
                    backgroundPosition: TownIcons.types[(manuTownTypes[uw.Game.townId] || ((autoTownTypes[uw.Game.townId] || "no")))] * -25 + 'px 0px'
                });
                //console.debug(flask_sprite);
                $('<style id="flask_townicons_field" type="text/css">' +
                    '#town_icon { background:url(' + flask_sprite + ') 0 -125px no-repeat; position:absolute; width:69px; height:61px; left:-47px; top:0px; z-index: 10; } ' +
                    '#town_icon .town_icon_bg { background:url(' + flask_sprite + ') -76px -129px no-repeat; width:43px; height:43px; left:25px; top:4px; cursor:pointer; position: relative; } ' +
                    '#town_icon .town_icon_bg:hover { filter:url(#Brightness11); -webkit-filter:brightness(1.1); box-shadow: 0px 0px 15px rgb(1, 197, 33); } ' +
                    '#town_icon .icon_big	{ position:absolute; left:9px; top:9px; height:25px; width:25px; } ' +

                    '#town_icon .select_town_icon {position: absolute; top:47px; left:23px; width:145px; display:none; padding:2px; border:3px inset rgb(7, 99, 12); box-shadow:rgba(0, 0, 0, 0.5) 4px 4px 6px; border-radius:0px 10px 10px 10px;' +
                    'background:url(https://gp' + MID + '.innogamescdn.com/images/game/popup/middle_middle.png); } ' +
                    '#town_icon .item-list { max-height:400px; max-width:200px; align:right; overflow-x:hidden; } ' +

                    '#town_icon .option_s { cursor:pointer; width:20px; height:20px; margin:0px; padding:2px 2px 3px 3px; border:2px solid rgba(0,0,0,0); border-radius:5px; background-origin:content-box; background-clip:content-box;} ' +
                    '#town_icon .option_s:hover { border: 2px solid rgb(59, 121, 81) !important;-webkit-filter: brightness(1.3); } ' +
                    '#town_icon .sel { border: 2px solid rgb(202, 176, 109); } ' +
                    '#town_icon hr { width:145px; margin:0px 0px 7px 0px; position:relative; top:3px; border:0px; border-top:2px dotted #000; float:left} ' +
                    '#town_icon .auto_s { width:136px; height:16px; float:left} ' +

                    // Quickbar modification
                    '.ui_quickbar .left, .ui_quickbar .right { width:46%; } ' +

                    // because of Kapsonfires Script and Beta Worlds bug report bar:
                    '.town_name_area { z-index:11; left:52%; } ' +
                    '.town_name_area .left { z-index:20; left:-39px; } ' +
                    '</style>').appendTo('head');


                var icoArray = ['ld', 'lo', 'sh', 'di', 'un',
                    'sd', 'so', 'ko', 'ti', 'gr',
                    'fd', 'fo', 'dp', 'no', 'po',
                    're', 'wd', 'st', 'si', 'bu',
                    'he', 'ch', 'bo', 'fa', 'wo'];

                // Fill select box with town icons
                $('<div class="select_town_icon dropdown-list default active"><div class="item-list"></div></div>').appendTo("#town_icon");
                for (var i in icoArray) {
                    if (icoArray.hasOwnProperty(i)) {
                        $('.select_town_icon .item-list').append('<div class="option_s icon_small townicon_' + icoArray[i] + '" name="' + icoArray[i] + '"></div>');
                    }
                }
                $('<hr><div class="option_s auto_s" name="auto"><b>Auto</b></div>').appendTo('.select_town_icon .item-list');

                $('#town_icon .option_s').click(function () {
                    $("#town_icon .sel").removeClass("sel");
                    $(this).addClass("sel");

                    if ($(this).attr("name") === "auto") {
                        delete manuTownTypes[uw.Game.townId];
                    } else {
                        manuTownTypes[uw.Game.townId] = $(this).attr("name");
                    }
                    TownIcons.changeTownIcon();

                    // Update town icons on the map
                    TownIcons.Map.activate(); //setOnMap();

                    saveValue(WID + "_townTypes", JSON.stringify(manuTownTypes));
                });

                // Show & hide drop menus on click
                $('#town_icon .town_icon_bg').click(function () {
                    var el = $('#town_icon .select_town_icon').get(0);
                    if (el.style.display === "none") {
                        el.style.display = "block";
                    } else {
                        el.style.display = "none";
                    }
                });

                $('#town_icon .select_town_icon [name="' + (manuTownTypes[uw.Game.townId] || (autoTownTypes[uw.Game.townId] ? "auto" : "")) + '"]').addClass("sel");
                $.Observer(uw.GameEvents.town.town_switch).subscribe("town_switch_icon", this.switchTown)

            } catch (error) {
                errorHandling(error, "addTownIcon");
            }
        },
        switchTown: function () {
            TownIcons.changeTownIcon();
        },
        changeTownIcon: function () {
            var townType = (manuTownTypes[uw.Game.townId] || ((autoTownTypes[uw.Game.townId] || "no")));
            $('#town_icon .icon_big').removeClass().addClass('icon_big townicon_' + townType + " auto");
            $('#town_icon .sel').removeClass("sel");
            $('#town_icon .select_town_icon [name="' + (manuTownTypes[uw.Game.townId] || (autoTownTypes[uw.Game.townId] ? "auto" : "")) + '"]').addClass("sel");

            $('#town_icon .icon_big').css({
                backgroundPosition: TownIcons.types[townType] * -25 + 'px 0px'
            });

            $('#town_icon .select_town_icon').get(0).style.display = "none";
        },
        Map: {
            // TODO: activate aufspliten in activate und add
            activate: function () {
                try {
                    // if town icon changed
                    if ($('#flask_townicons_map').get(0)) {
                        $('#flask_townicons_map').remove();
                    }

                    // Style for own towns (town icons)
                    var start = (new Date()).getTime(), end, style_str = "<style id='flask_townicons_map' type='text/css'>";
                    for (var e in autoTownTypes) {
                        if (autoTownTypes.hasOwnProperty(e)) {
                            style_str += "#mini_t" + e + ", #town_flag_" + e + " .flagpole {" +
                                "background: rgb(255, 187, 0) url(" + flask_sprite + ") " + (TownIcons.types[(manuTownTypes[e] || autoTownTypes[e])] * -25) + "px -27px repeat !important; } ";
                        }
                    }

                    style_str += ".own_town .flagpole, #main_area .m_town.player_" + PID + " { z-index: 100 !important; cursor: pointer; width:19px!important; height:19px!important; border-radius: 11px; border: 2px solid rgb(16, 133, 0); margin: -4px !important; font-size: 0em !important; box-shadow: 1px 1px 0px rgba(0, 0, 0, 0.5); } ";

                    // Mouseover Effect
                    style_str += ".own_town .flagpole:hover, .m_town:hover { z-index: 101 !important; filter: brightness(1.2); -webkit-filter: brightness(1.2); font-size: 2em; margin-top: -1px; } ";


                    // Context menu on mouse click
                    style_str += "#minimap_islands_layer .m_town { z-index: 99; cursor: pointer; } ";

                    $('#minimap_islands_layer').off('click', '.m_town');
                    $('#minimap_islands_layer').on('click', '.m_town', function (z) {
                        var id = parseInt(this.id.substring(6), 10);

                        // Town names of foreign towns are unknown
                        if (typeof (uw.ITowns.getTown(id)) !== "undefined") {
                            Layout.contextMenu(z, 'determine', { "id": id, "name": uw.ITowns.getTown(id).name });
                        }
                        else {
                            // No town name in the title of the window
                            Layout.contextMenu(z, 'determine', { "id": id });
                        }

                        // Prevent parent world wonder event
                        z.stopPropagation();
                    });

                    $('#minimap_islands_layer').off("mousedown");
                    $('#minimap_islands_layer').on("mousedown", function () {

                        if (typeof ($('#context_menu').get(0)) !== "undefined") {
                            $('#context_menu').get(0).remove();
                        }
                    });


                    // Town Popup for own towns
                    style_str += "#flask_town_popup .count { position: absolute; bottom: 1px; right: 1px; font-size: 10px; } ";

                    // Town Popups on Strategic map
                    $('#minimap_islands_layer').off('mouseout', '.m_town.player_' + PID);
                    $('#minimap_islands_layer').on('mouseout', '.m_town.player_' + PID, function () {
                        TownPopup.remove();
                    });
                    $('#minimap_islands_layer').off('mouseover', '.m_town.player_' + PID);
                    $('#minimap_islands_layer').on('mouseover', '.m_town.player_' + PID, function () {
                        TownPopup.add(this);
                    });

                    // Town Popups on island view
                    $('#map_towns').off('mouseout', '.own_town .flagpole');
                    $('#map_towns').on('mouseout', '.own_town .flagpole', function () {
                        TownPopup.remove();
                    });
                    $('#map_towns').off('mouseover', '.own_town .flagpole');
                    $('#map_towns').on('mouseover', '.own_town .flagpole', function () {
                        TownPopup.add(this);
                    });


                    // Style for foreign cities (shadow)
                    style_str += "#minimap_islands_layer .m_town { text-shadow: 1px 1px 0px rgba(0, 0, 0, 0.7); } ";

                    // Style for night mode
                    style_str += "#minimap_canvas.expanded.night, #map.night .flagpole { filter: brightness(0.7); -webkit-filter: brightness(0.7); } ";
                    style_str += "#minimap_click_layer { display:none; }";

                    style_str += "</style>";
                    $(style_str).appendTo('head');


                } catch (error) {
                    errorHandling(error, "TownIcons.Map.activate");
                }
            },
            deactivate: function () {
                $('#flask_townicons_map').remove();

                // Events entfernen
                $('#minimap_islands_layer').off('click', '.m_town');
                $('#minimap_islands_layer').off("mousedown");

                $('#minimap_islands_layer').off('mouseout', '.m_town');
                $('#minimap_islands_layer').off('mouseover', '.m_town');
            }
        }
    };

    var TownPopup = {
        activate: function () {

            $('<style id="flask_town_popup_style" type="text/css">' +
                '#flask_town_popup { position:absolute; z-index:99;max-width: 200px;} ' +

                '#flask_town_popup .title { margin:5px;font-weight: bold; } ' +

                '#flask_town_popup .flask_branding { position:absolute; right:12px; top:8px; height: 20px; filter:sepia(1); -webkit-filter:sepia(1); opacity:0.5; } ' +

                '#flask_town_popup .unit_content, ' +
                '#flask_town_popup .move_counter_content, ' +
                '#flask_town_popup .spy_content, ' +
                '#flask_town_popup .god_content, ' +
                '#flask_town_popup .hero_content, ' +
                '#flask_town_popup .resources_content { background-color: #ffe2a1; border: 1px solid #e1af55; margin-top:2px; padding: 4px; font-family: Arial;font-weight: 700;font-size: 0.8em; } ' +
                '#flask_town_popup .resources_content { text-align: right; margin-top:3px; } ' +

                '#flask_town_popup .resources_content table { min-width:95% } ' +

                '#flask_town_popup .footer_content { margin-top:3px;  } ' +
                '#flask_town_popup .footer_content table { width:100%; } ' +

                '#flask_town_popup .spy_content { height:25px; margin-right:3px; } ' +
                '#flask_town_popup .god_content { width:24px; } ' +
                '#flask_town_popup .hero_content { width:24px; } ' +

                '#flask_town_popup .god_mini { height: 25px; width: 25px; background: url(https://gpit.innogamescdn.com/images/game/autogenerated/gods/gods_default_62x62_f4a3cc7.png) 0px -75px no-repeat; background-size: 500%; margin-right: 0px; } ' +

                // God Icon
                '#flask_town_popup .god_mini.zeus { background-size: 500%; background-position: -100px -0px; } ' +
                '#flask_town_popup .god_mini.athena { background-size: 500%; background-position: 0px -50px; } ' +
                '#flask_town_popup .god_mini.poseidon { background-size: 500%; background-position: -50px -75px; } ' +
                '#flask_town_popup .god_mini.hera { background-size: 500%; background-position: -75px -25px; } ' +
                '#flask_town_popup .god_mini.hades { background-size: 500%; background-position: -50px -50px; } ' +
                '#flask_town_popup .god_mini.artemis { background-size: 500%; background-position: -50px 0px; } ' +
                '#flask_town_popup .god_mini.aphrodite { background-size: 500%; background-position: 0px 0px; } ' +
                '#flask_town_popup .god_mini.ares { background-size: 500%; background-position: 0px -25px; } ' +

                '#flask_town_popup .count { position: absolute; bottom: -2px; right: 2px; font-size: 10px; font-family: Verdana,Arial,Helvetica,sans-serif; } ' +
                '#flask_town_popup .four_digit_number .count { font-size:8px !important; } ' +
                '#flask_town_popup .unit_icon25x25 { border: 1px solid #6e4b0b; margin: 1px; } ' +
                '#flask_town_popup .wall { width:25px; height:25px; background-image:url(https://gpde.innogamescdn.com/images/game/main/wall.png); border: 1px solid #6e4b0b; margin: 1px; display: inline-block; vertical-align: middle; background-size: 100%; } ' +

                // Spy Icon
                '#flask_town_popup .support_filter { margin: 0px 4px 0px 0px; float:left; } ' +
                '#flask_town_popup .spy_text { line-height: 2.3em; float:left; } ' +

                // Bei langen Stadtnamen wird sonst der Rand abgeschnitten:
                '#flask_town_popup .popup_middle_right { min-width: 11px; } ' +

                '</style>').appendTo('head');

        },
        deactivate: function () {
            $("#flask_game_list_header_style").remove();
            $("#flask_town_popup_style").remove();
        },
        add: function (that) {
            var townID = 0;
            //console.debug("TOWN", $(that).offset(), that.id);

            if (that.id === "") {
                // Island view
                townID = parseInt($(that).parent()[0].id.substring(10), 10);
            }
            else {
                // Strategic map
                townID = parseInt(that.id.substring(6), 10);
            }

            // Own town?
            if (typeof (uw.ITowns.getTown(townID)) !== "undefined") {

                var units = ITowns.getTowns()[townID].units();
                var unitsSupport = ITowns.getTowns()[townID].unitsSupport();

                TownPopup.remove();

                // var popup = "<div id='flask_town_popup' style='left:" + ($(that).offset().left + 20) + "px; top:" + ($(that).offset().top + 20) + "px; '>";
                var popup = "<table class='popup' id='flask_town_popup' style='left:" + ($(that).offset().left + + 20) + "px; top:" + ($(that).offset().top + 20) + "px; ' cellspacing='0px' cellpadding='0px'>";

                popup += "<tr class='popup_top'><td class='popup_top_left'></td><td class='popup_top_middle'></td><td class='popup_top_right'></td></tr>";

                popup += "<tr><td class='popup_middle_left'>&nbsp;</td><td style='width: auto;' class='popup_middle_middle'>";

                // Title (town name)
                popup += "<h4><span style='white-space: nowrap;margin-right:35px;'>" + uw.ITowns.getTown(townID).name + "</span><img class='flask_branding' src='https://flasktools.altervista.org/images/Beuta-mini.png'></h4>";

                popup += "<h4><span style='white-space: nowrap;margin-right:5px;'>" + uw.ITowns.getTown(townID).getPoints() + "</span><span style='white-space: nowrap;margin-right:35px;'>" + getText("labels", "poi") + "</span></h4>";

                // Unit Container
                popup += "<div class='unit_content'>";
                if (!$.isEmptyObject(units)) {

                    for (var unit_id in units) {
                        if (units.hasOwnProperty(unit_id)) {

                            var classSize = "";

                            if (units[unit_id] > 1000) {
                                classSize = "four_digit_number";
                            }

                            // Unit
                            popup += '<div class="unit_icon25x25 ' + unit_id + ' ' + classSize + '"><span class="count text_shadow">' + units[unit_id] + '</span></div>';
                        }
                    }
                }

                // - Wall
                var wallLevel = ITowns.getTowns()[townID].getBuildings().attributes.wall;
                popup += '<div class="wall image bold"><span class="count text_shadow">' + wallLevel + '</span></div>';

                popup += "</div>";

                // - Support
                if (!$.isEmptyObject(unitsSupport)) {

                    // Title (town name)
                    popup += "<h4><span style='white-space: nowrap;margin-right:35px;'>" + getText("labels", "sup") + "</span></h4>";

                    // Unit Container
                    popup += "<div class='unit_content'>";

                    for (var unitSupport_id in unitsSupport) {
                        if (unitsSupport.hasOwnProperty(unitSupport_id)) {

                            var classSize = "";

                            if (unitsSupport[unitSupport_id] > 1000) {
                                classSize = "four_digit_number";
                            }

                            // Unit
                            popup += '<div class="unit_icon25x25 ' + unitSupport_id + ' ' + classSize + '"><span class="count text_shadow">' + unitsSupport[unitSupport_id] + '</span></div>';
                        }
                    }
                }

                popup += "</div>";


                // Count movement
                var sup = 0, att = 0;

                $('.icon.attack_type32x32.support.returning').each(function () {
                    sup++;
                });
                $('.icon.attack_type32x32.attack.returning').each(function () {
                    att++;
                });

                popup += "<div class='move_counter_content style=''><div style='float:left;margin-right:5px;'></div>" +
                    "<div class='movement def'></div>" +
                    "<div><span class='movement' style='color:green;'> " + sup + "</span>" + getText("labels", "arr2") + "</div>" +
                    "<div class='movement off'></div>" +
                    "<div><span class='movement' style='color:red;'> " + att + "</span>" + getText("labels", "arr") + "</div></div>";

                // Resources Container
                popup += "<div class='resources_content'><table cellspacing='2px' cellpadding='0px'><tr>";

                var resources = ITowns.getTowns()[townID].resources();
                var storage = ITowns.getTowns()[townID].getStorage();
                var maxFavor = ITowns.getTowns()[townID].getMaxFavor();

                // - Wood
                var textColor = (resources.wood === storage) ? textColor = "color:red;" : textColor = "";
                popup += '<td class="resources_small wood"></td><td style="' + textColor + '; width:1%;">' + resources.wood + '</td>';

                popup += '<td style="min-width:15px;"></td>';

                // - favor
                textColor = (resources.favor === maxFavor) ? textColor = "color:red;" : textColor = "";
                popup += '<td class="resources_small favor"></td><td style="' + textColor + '; width:1%">' + resources.favor + '</td>';

                popup += '</tr><tr>';

                // - Stone
                textColor = (resources.stone === storage) ? textColor = "color:red;" : textColor = "";
                popup += '<td class="resources_small stone"></td><td style="' + textColor + '">' + resources.stone + '</td>';

                popup += '<td style="min-width:15px;"></td>';

                // - Population
                popup += '<td class="resources_small population"></td><td style="width:1%">' + resources.population + '</td>';

                popup += '</tr><tr>';

                // - Iron
                textColor = (resources.iron === storage) ? textColor = "color:red;" : textColor = "";
                popup += '<td class="resources_small iron"></td><td style="' + textColor + '">' + resources.iron + '</td>';


                popup += "</tr></table></div>";

                // console.debug("TOWNINFO", ITowns.getTowns()[townID]);

                // Spy and God Container
                popup += "<div class='footer_content'><table cellspacing='0px'><tr>";

                var spy_storage = ITowns.getTowns()[townID].getEspionageStorage();

                // - Spy content
                popup += "<td class='spy_content'>";
                popup += '<div class="support_filter attack_spy"></div><div class="spy_text">' + pointNumber(spy_storage) + '</div>';
                popup += "</td>";

                popup += "<td></td>";

                // - hero Content
                var HeroArray = ITowns.getHeroFLASK()[townID];
                if (HeroArray) {

                    popup += "<td class='hero_content'>";
                    popup += '<div class="hero_icon hero25x25 ' + HeroArray.hero_name + '"><span class="count text_shadow">' + HeroArray.hero_level + '</span></div>';
                    popup += "</td>";
                    popup += "<td></td>";

                }
                // - God Content
                var god = ITowns.getTowns()[townID].god();

                popup += "<td class='god_content'>";
                popup += '<div class="god_mini ' + god + '"></div>';
                popup += "</td>";

                popup += "</tr></table></div>";



                popup += "</td><td class='popup_middle_right'>&nbsp;</td></tr>";

                popup += "<tr class='popup_bottom'><td class='popup_bottom_left'></td><td class='popup_bottom_middle'></td><td class='popup_bottom_right'></td></tr>";

                popup += "</table>";

                $(popup).appendTo("#popup_div_curtain");

            }

            $('<style id="popup_div" type="text/css">' +
                '#popup_div { display:none; } ' +
                '</style>').appendTo('head');

        },
        remove: function () {
            $('#flask_town_popup').remove();
            $('#popup_div').remove('style');
        }
    };

    // Style for town icons
    var style_str = '<style id="flask_townicons" type="text/css">';
    for (var s in TownIcons.types) {
        if (TownIcons.types.hasOwnProperty(s)) {
            style_str += '.townicon_' + s + ' { background:url(' + flask_sprite + ') ' + (TownIcons.types[s] * -25) + 'px -26px repeat;float:left;} ';
        }
    }
    style_str += '</style>';
    $(style_str).appendTo('head');


    var ContextMenu = {
        activate: function () {
            // Set context menu event handler
            $.Observer(uw.GameEvents.map.context_menu.click).subscribe('FLASK_CONTEXT', function (e, data) {
                if (DATA.options.con && $('#context_menu').children().length == 4) {
                    // Clear animation
                    $('#context_menu div#goToTown').css({
                        left: '0px',
                        top: '0px',
                        WebkitAnimation: 'none', //'A 0s linear',
                        animation: 'none' //'B 0s linear'
                    });
                }
                // Replace german label of 'select town' button
                if (MID === "de" && $('#select_town').get(0)) {
                    $("#select_town .caption").get(0).innerHTML = "Selektieren";
                }
            });

            // Set context menu animation
            $('<style id="flask_context_menu" type="text/css">' +
                // set fixed position of 'select town' button
                '#select_town { left: 0px !important; top: 0px !important; z-index: 6; } ' +
                // set animation of 'goToTown' button
                '#context_menu div#goToTown { left: 30px; top: -51px; ' +
                '-webkit-animation: A 0.115s linear; animation: B 0.2s;} ' +
                '@-webkit-keyframes A { from {left: 0px; top: 0px;} to {left: 30px; top: -51px;} }' +
                '@keyframes B { from {left: 0px; top: 0px;} to {left: 30px; top: -51px;} }' +
                '</style>').appendTo('head');
        },
        deactivate: function () {
            $.Observer(uw.GameEvents.map.context_menu.click).unsubscribe('FLASK_CONTEXT');

            $('#flask_context_menu').remove();
        }
    };


    var TownList = {
        activate: function () {
            // Style town list
            $('<style id="flask_town_list" type="text/css">' +
                '#town_groups_list .item { text-align: left; padding-left:5px; } ' +
                '#town_groups_list .inner_column { border: 1px solid rgba(100, 100, 0, 0.3);margin: -2px 0px 0px 2px; } ' +
                '#town_groups_list .island_quest_icon { position: absolute; right: 30px; top: 3px; } ' +
                '#town_groups_list .island_quest_icon.hidden_icon { display:none; } ' +
                // Quacks Zentrier-Button verschieben
                '#town_groups_list .jump_town { right: 37px !important; } ' +
                // Population percentage
                '#town_groups_list .pop_percent { position: absolute; right: 2px; top:0px; font-size: 0.7em; display:block !important;} ' +
                '#town_groups_list .full { color: green; } ' +
                '#town_groups_list .threequarter { color: darkgoldenrod; } ' +
                '#town_groups_list .half { color: darkred; } ' +
                '#town_groups_list .quarter { color: red; } ' +
                '</style>').appendTo('head');


            // Open town list: hook to grepolis function render()
            var i = 0;
            while (uw.layout_main_controller.sub_controllers[i].name != 'town_name_area') {
                i++;
            }

            uw.layout_main_controller.sub_controllers[i].controller.town_groups_list_view.render_old = uw.layout_main_controller.sub_controllers[i].controller.town_groups_list_view.render;

            uw.layout_main_controller.sub_controllers[i].controller.town_groups_list_view.render = function () {
                uw.layout_main_controller.sub_controllers[i].controller.town_groups_list_view.render_old();
                TownList.change();
            };

            // Town List open?
            if ($('#town_groups_list').get(0)) {
                TownList.change();
            }
        },
        deactivate: function () {
            var i = 0;
            while (uw.layout_main_controller.sub_controllers[i].name != 'town_name_area') {
                i++;
            }

            layout_main_controller.sub_controllers[i].controller.town_groups_list_view.render = layout_main_controller.sub_controllers[i].controller.town_groups_list_view.render_old;

            $('#flask_town_list').remove();

            $('#town_groups_list .small_icon, #town_groups_list .pop_percent').css({ display: 'none' });

            //$.Observer(uw.GameEvents.town.town_switch).unsubscribe('FLASK_SWITCH_TOWN');

            $("#town_groups_list .town_group_town").unbind('mouseenter mouseleave');
        },
        change: function () {
            if (!$('#town_groups_list .icon_small').get(0) && !$('#town_groups_list .pop_percent').get(0)) {
                $("#town_groups_list .town_group_town").each(function () {
                    try {
                        var town_item = $(this), town_id = town_item.attr('name'), townicon_div, percent_div = "", percent = -1, pop_space = "full";

                        if (population[town_id]) {
                            percent = population[town_id].percent;
                        }
                        if (percent < 75) {
                            pop_space = "threequarter";
                        }
                        if (percent < 50) {
                            pop_space = "half";
                        }
                        if (percent < 25) {
                            pop_space = "quarter";
                        }

                        if (!town_item.find('icon_small').length) {
                            townicon_div = '<div class="icon_small townicon_' + (manuTownTypes[town_id] || autoTownTypes[town_id] || "no") + '"></div>';
                            // TODO: Notlösung...
                            if (percent != -1) {
                                percent_div = '<div class="pop_percent ' + pop_space + '">' + percent + '%</div>';
                            }
                            town_item.prepend(townicon_div + percent_div);
                        }

                        // opening context menu
                        /*
                         $(this).click(function(e){
                         console.log(e);
                         uw.Layout.contextMenu(e, 'determine', {"id": town_id,"name": uw.ITowns[town_id].getName()});
                         });
                         */

                    } catch (error) {
                        errorHandling(error, "TownList.change");
                    }
                });

            }

            // Hover Effect for Quacks Tool:
            $("#town_groups_list .town_group_town").hover(function () {
                $(this).find('.island_quest_icon').addClass("hidden_icon");
            }, function () {
                $(this).find('.island_quest_icon').removeClass("hidden_icon");
            });

            // Add change town list event handler
            //$.Observer(uw.GameEvents.town.town_switch).subscribe('FLASK_SWITCH_TOWN', function () {
            //TownList.change();
            //});
        }
    };

    var HiddenHighlightWindow = {
        activate: function () {
            // Style town list
            $('<style id="flask_hidden_highlight_window" type="text/css">' +
                '</style>').appendTo('head');
        },
        deactivate: function () {
            $('#flask_hidden_highlight_window').remove();
        }
    };

    /*******************************************************************************************************************************
     * Available units
     * ----------------------------------------------------------------------------------------------------------------------------
     * | ●  GetAllUnits
     * | ●  Shows all available units
     * ----------------------------------------------------------------------------------------------------------------------------
     *******************************************************************************************************************************/
    var groupUnitArray = {};
    // TODO: split Function (getUnits, calcUnitsSum, availableUnits, countBiremes, getTownTypes)?

    // Alter EinheitenzÃ¤hler
    function getAllUnits() {
        try {
            var townArray = uw.ITowns.getTowns(), groupArray = uw.ITowns.townGroups.getGroupsFLASK(),

                unitArray = {
                    "sword": 0,
                    "archer": 0,
                    "hoplite": 0,
                    "chariot": 0,
                    "godsent": 0,
                    "rider": 0,
                    "slinger": 0,
                    "catapult": 0,
                    "small_transporter": 0,
                    "big_transporter": 0,
                    "manticore": 0,
                    "harpy": 0,
                    "pegasus": 0,
                    "cerberus": 0,
                    "minotaur": 0,
                    "medusa": 0,
                    "zyklop": 0,
                    "centaur": 0,
                    "fury": 0,
                    "sea_monster": 0
                },

                unitArraySea = { "bireme": 0, "trireme": 0, "attack_ship": 0, "demolition_ship": 0, "colonize_ship": 0 };

            //console.debug("FLASK-TOOLS | getAllUnits | GROUP ARRAY", groupArray);


            if (uw.Game.hasArtemis) {
                unitArray = $.extend(unitArray, { "griffin": 0, "calydonian_boar": 0 });
            }
            if (uw.GameData.gods.aphrodite) {
                unitArray = $.extend(unitArray, { "siren": 0, "satyr": 0 });
            }
            if (uw.GameData.gods.ares) {
                unitArray = $.extend(unitArray, { "spartoi": 0, "ladon": 0 });
            }
            unitArray = $.extend(unitArray, unitArraySea);

            for (var group in groupArray) {
                if (groupArray.hasOwnProperty(group)) {
                    // Clone Object "unitArray"
                    groupUnitArray[group] = Object.create(unitArray);

                    for (var town in groupArray[group].towns) {
                        if (groupArray[group].towns.hasOwnProperty(town)) {
                            var type = { lo: 0, ld: 0, so: 0, sd: 0, fo: 0, fd: 0 }; // Type for TownList

                            for (var unit in unitArray) {
                                if (unitArray.hasOwnProperty(unit)) {
                                    // All Groups: Available units
                                    var tmp = parseInt(uw.ITowns.getTown(town).units()[unit], 10);
                                    groupUnitArray[group][unit] += tmp || 0;
                                    // Only for group "All"
                                    if (group == -1) {
                                        // Bireme counter // old
                                        if (unit === "bireme" && ((biriArray[townArray[town].id] || 0) < (tmp || 0))) {
                                            biriArray[townArray[town].id] = tmp;
                                        }
                                        //TownTypes
                                        if (!uw.GameData.units[unit].is_naval) {
                                            if (uw.GameData.units[unit].flying) {
                                                type.fd += ((uw.GameData.units[unit].def_hack + uw.GameData.units[unit].def_pierce + uw.GameData.units[unit].def_distance) / 3 * (tmp || 0));
                                                type.fo += (uw.GameData.units[unit].attack * (tmp || 0));
                                            } else {
                                                type.ld += ((uw.GameData.units[unit].def_hack + uw.GameData.units[unit].def_pierce + uw.GameData.units[unit].def_distance) / 3 * (tmp || 0));
                                                type.lo += (uw.GameData.units[unit].attack * (tmp || 0));
                                            }
                                        } else {
                                            type.sd += (uw.GameData.units[unit].defense * (tmp || 0));
                                            type.so += (uw.GameData.units[unit].attack * (tmp || 0));
                                        }
                                    }
                                }
                            }
                            // Only for group "All"
                            if (group == -1) {
                                // Icon: DEF or OFF?
                                var z = ((type.sd + type.ld + type.fd) <= (type.so + type.lo + type.fo)) ? "o" : "d",
                                    temp = 0;

                                for (var t in type) {
                                    if (type.hasOwnProperty(t)) {
                                        // Icon: Land/Sea/Fly (t[0]) + OFF/DEF (z)
                                        if (temp < type[t]) {
                                            autoTownTypes[townArray[town].id] = t[0] + z;
                                            temp = type[t];
                                        }
                                        // Icon: Troops Outside (overwrite)
                                        if (temp < 1000) {
                                            autoTownTypes[townArray[town].id] = "no";
                                        }
                                    }
                                }
                                // Table level farm and maximum population
                                const popByFarmLevel = [114, 121, 134, 152, 175, 206, 245, 291, 343, 399, 458, 520, 584, 651, 720, 790, 863, 938, 1015, 1094, 1174, 1257, 1341, 1426, 1514, 1602, 1693, 1785, 1878, 1973, 2070, 2168, 2267, 2368, 2470, 2573, 2678, 2784, 2891, 3000, 3109, 3220, 3332, 3446, 3560];
                                // Icon: Empty Town (overwrite)
                                var popBuilding = 0, buildVal = uw.GameData.buildings, levelArray = townArray[town].buildings().getLevels(), popMax;
                                if (buildVal.farm.farm_factor != undefined) popMax = Math.floor(buildVal.farm.farm_factor * Math.pow(townArray[town].buildings().getBuildingLevel("farm"), buildVal.farm.farm_pow)); // Population from farm level
                                else popMax = popByFarmLevel[townArray[town].buildings().getBuildingLevel("farm") - 1]; // Population from farm level
                                let popPlow = townArray[town].getResearches().attributes.plow ? 200 : 0,
                                    popFactor = townArray[town].getBuildings().getBuildingLevel("thermal") ? 1.1 : 1.0, // Thermal
                                    popExtra = townArray[town].getPopulationExtra();
                                if (townArray[town].god() === 'aphrodite') popMax += townArray[town].buildings().getBuildingLevel("farm") * 5;

                                for (var b in levelArray) {
                                    if (levelArray.hasOwnProperty(b)) {
                                        popBuilding += Math.round(buildVal[b].pop * Math.pow(levelArray[b], buildVal[b].pop_factor));
                                    }
                                }
                                population[town] = {};

                                population[town].max = popMax * popFactor + popPlow + popExtra;
                                population[town].buildings = popBuilding;
                                population[town].units = parseInt((population[town].max - (popBuilding + townArray[town].getAvailablePopulation())), 10);

                                if (population[town].units < 300) {
                                    autoTownTypes[townArray[town].id] = "po";
                                }

                                population[town].percent = Math.round(100 / (population[town].max - popBuilding) * population[town].units);
                            }
                        }
                    }
                }
            }

            // Update Available Units
            AvailableUnits.updateBullseye();
            if (GPWindowMgr.TYPE_FLASK_UNITS) {
                if (Layout.wnd.getOpenFirst(GPWindowMgr.TYPE_FLASK_UNITS)) {
                    AvailableUnits.updateWindow();
                }
            }
        } catch (error) {
            errorHandling(error, "getAllUnits"); // TODO: Eventueller Fehler in Funktion
        }
    }

    function addFunctionToITowns() {
        // Copy function and prevent an error
        uw.ITowns.townGroups.getGroupsFLASK = function () {
            var town_groups_towns, town_groups, groups = {};

            // #Grepolis Fix: 2.75 -> 2.76
            if (MM.collections) {
                town_groups_towns = MM.collections.TownGroupTown[0];
                town_groups = MM.collections.TownGroup[0];
            } else {
                town_groups_towns = MM.getCollections().TownGroupTown[0];
                town_groups = MM.getCollections().TownGroup[0];
            }

            town_groups_towns.each(function (town_group_town) {
                var gid = town_group_town.getGroupId(),
                    group = groups[gid],
                    town_id = town_group_town.getTownId();

                if (!group) {
                    groups[gid] = group = {
                        id: gid,
                        //name: town_groups.get(gid).getName(), // hier tritt manchmal ein Fehler auf: TypeError: Cannot read property "getName" of undefined at http://_.grepolis.com/cache/js/merged/game.js?1407322916:8298:525
                        towns: {}
                    };
                }

                group.towns[town_id] = { id: town_id };
                //groups[gid].towns[town_id]={id:town_id};
            });
            //console.log(groups);
            return groups;
        };
        uw.ITowns.getHeroFLASK = function () {
            var town_groups_towns, town_groups, groups = {};

            // #Grepolis Fix: 2.75 -> 2.76
            if (MM.collections) {
                PlayerHero = MM.collections.PlayerHero[0];
            } else {
                PlayerHero = MM.getCollections().PlayerHero[0];
            }

            PlayerHero.each(function (PlayerHero) {
                var hero_name = PlayerHero.getId(),
                    hero_level = PlayerHero.getLevel(),
                    town_id = PlayerHero.getHomeTownId(),
                    town_name = PlayerHero.getOriginTownName(),
                    group = groups[town_id];

                if (!group) {
                    groups[town_id] = group = {
                        town_id: town_id,
                        town: town_name,
                        hero_name,
                        hero_level: hero_level
                    };
                }
            });
            return groups;
        };
    }


    // Neuer EinheitenzÃ¤hler
    var UnitCounter = {
        units: { "total": {}, "available": {}, "outer": {}, "foreign": {} },

        count: function () {
            var tooltipHelper = require("helpers/units_tooltip_helper");

            var groups = uw.ITowns.townGroups.getGroupsFLASK();

            for (var groupId in groups) {
                if (groups.hasOwnProperty(groupId)) {

                    UnitCounter.units.total[groupId] = {};
                    UnitCounter.units.available[groupId] = {};
                    UnitCounter.units.outer[groupId] = {};


                    for (var townId in groups[groupId].towns) {
                        if (groups[groupId].towns.hasOwnProperty(townId)) {

                            // Einheiten gesamt
                            UnitCounter.units.total[groupId][townId] = ITowns.towns[townId].units();

                            // Einheiten verfÃ¼gbar
                            UnitCounter.units.available[groupId][townId] = ITowns.towns[townId].units();

                            // Einheiten auÃŸerhalb
                            UnitCounter.units.outer[groupId][townId] = {};

                            var supports = tooltipHelper.getDataForSupportingUnitsInOtherTownFromCollection(MM.getTownAgnosticCollectionsByName("Units")[1].fragments[townId], MM.getOnlyCollectionByName("Town"));

                            for (var supportId in supports) {
                                if (supports.hasOwnProperty(supportId)) {

                                    for (var attributeId in supports[supportId].attributes) {
                                        if (supports[supportId].attributes.hasOwnProperty(attributeId)) {

                                            // Attribut ist eine Einheit?
                                            if (typeof (GameData.units[attributeId]) !== "undefined" && supports[supportId].attributes[attributeId] > 0) {

                                                UnitCounter.units.outer[groupId][townId][attributeId] = (UnitCounter.units.outer[groupId][townId][attributeId] || 0) + supports[supportId].attributes[attributeId];

                                                UnitCounter.units.total[groupId][townId][attributeId] = (UnitCounter.units.total[groupId][townId][attributeId] || 0) + supports[supportId].attributes[attributeId];
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Summen aller StÃ¤dte berechnen
                    UnitCounter.summarize(groupId);
                }
            }

            return UnitCounter.units;
        },

        summarize: function (groupId) {
            var tooltipHelper = require("helpers/units_tooltip_helper");

            UnitCounter.units.total[groupId]["all"] = {};
            UnitCounter.units.available[groupId]["all"] = {};
            UnitCounter.units.outer[groupId]["all"] = {};

            for (var townId in UnitCounter.units.total[groupId]) {
                if (UnitCounter.units.total[groupId].hasOwnProperty(townId) && townId !== "all") {

                    // Einheiten gesamt
                    for (var unitId in UnitCounter.units.total[groupId][townId]) {
                        if (UnitCounter.units.total[groupId][townId].hasOwnProperty(unitId)) {

                            UnitCounter.units.total[groupId]["all"][unitId] = (UnitCounter.units.total[groupId]["all"][unitId] || 0) + UnitCounter.units.total[groupId][townId][unitId];
                        }
                    }

                    // Einheiten verfÃ¼gbar
                    for (var unitId in UnitCounter.units.available[groupId][townId]) {
                        if (UnitCounter.units.available[groupId][townId].hasOwnProperty(unitId)) {

                            UnitCounter.units.available[groupId]["all"][unitId] = (UnitCounter.units.available[groupId]["all"][unitId] || 0) + UnitCounter.units.available[groupId][townId][unitId];
                        }
                    }

                    // Einheiten auÃŸerhalb
                    for (var unitId in UnitCounter.units.outer[groupId][townId]) {
                        if (UnitCounter.units.outer[groupId][townId].hasOwnProperty(unitId)) {

                            UnitCounter.units.outer[groupId]["all"][unitId] = (UnitCounter.units.outer[groupId]["all"][unitId] || 0) + UnitCounter.units.outer[groupId][townId][unitId];
                        }
                    }
                }
            }
        }
    };


    var AvailableUnits = {
        activate: function () {
            var default_title = DM.getl10n("place", "support_overview").options.troop_count + " (" + DM.getl10n("hercules2014", "available") + ")";

            $(".picomap_container").prepend("<div id='available_units_bullseye' class='unit_icon90x90 " + (DATA.bullseyeUnit[DATA.bullseyeUnit.current_group] || "bireme") + "'><div class='amount'></div></div>");

            $('.picomap_overlayer').tooltip(getText("options", "ava")[0]);

            // Ab version 2.115
            if ($(".topleft_navigation_area").get(0)) {

                $(".topleft_navigation_area").prepend("<div id='available_units_bullseye_addition' class='picomap_area'><div class='picomap_container'><div id='available_units_bullseye' class='unit_icon90x90 " + (DATA.bullseyeUnit[DATA.bullseyeUnit.current_group] || "bireme") + "'><div class='amount'></div></div></div><div class='picomap_overlayer'></div></div>");

                $('<style id="flask_available_units_style_addition">' +
                    '.coords_box { top: 117px !important; } ' +
                    '.nui_grepo_score { top: 150px !important; } ' +
                    '.nui_left_box { top: 102px !important; } ' +
                    '.nui_main_menu { top: 260px; }' +
                    '#grcrt_mnu_list .nui_main_menu {top: 0px !important; }' +
                    '.bull_eye_buttons, .rb_map { height:38px !important; }' +

                    '#ui_box .btn_change_colors { top: 31px !important; }' +

                    '.picomap_area { position: absolute; overflow: visible; top: 0; left: 0; width: 156px; height: 161px; z-index: 5; }' +
                    '.picomap_area .picomap_container, .picomap_area .picomap_overlayer { position: absolute; top: 33px; left: -3px; width: 147px; height: 101px; }' +
                    //'.picomap_area .picomap_overlayer { background: url(https://gpde.innogamescdn.com/images/game/autogenerated/layout/layout_2.107.png) -145px -208px no-repeat; width: 147px; height: 101px; z-index: 5;} '+
                    '.picomap_area .picomap_overlayer { background: url(' + flask_sprite + '); background-position: 473px 250px; width: 147px; height: 101px; z-index: 5;} ' +
                    '</style>').appendTo('head');
            }

            // Style
            $('<style id="flask_available_units_style">' +

                '@-webkit-keyframes Z { 0% { opacity: 0; } 100% { opacity: 1; } } ' +
                '@keyframes Z { 0% { opacity: 0; } 100% { opacity: 1; } } ' +

                '@-webkit-keyframes blurr { 0% { -webkit-filter: blur(5px); } 100% { -webkit-filter: blur(0px); } } ' +

                '.picomap_overlayer { cursor:pointer; } ' +

                '.picomap_area .bull_eye_buttons { height: 55px; } ' +

                '#sea_id { background: none; font-size:25px; cursor:default; height:50px; width:50px; position:absolute; top:70px; left:157px; z-index: 30; } ' +

                // Available bullseye unit
                '#available_units_bullseye { margin: 5px 28px 0px 28px; -webkit-animation: blur 2s; animation: Z 1s; } ' +

                '#available_units_bullseye .amount { color:#826021; position:relative; top:28px; font-style:italic; width:79px; font-weight: bold; text-shadow: 0px 0px 2px black, 1px 1px 2px black, 0px 2px 2px black; -webkit-animation: blur 3s; } ' +

                '#available_units_bullseye.big_number { font-size: 0.90em; line-height: 1.4; } ' +

                '#available_units_bullseye.blur { -webkit-animation: blurr 0.6s; } ' +



                // Land units
                '#available_units_bullseye.sword	.amount	{ color:#E2D9C1; top:57px; width:90px;	} ' +
                '#available_units_bullseye.hoplite	.amount	{ color:#E2D9C1; top:57px; width:90px;	} ' +
                '#available_units_bullseye.archer	.amount	{ color:#E2D0C1; top:47px; width:70px;	} ' +
                '#available_units_bullseye.chariot			{ margin-top: 15px; } ' +
                '#available_units_bullseye.chariot	.amount	{ color:#F5E8B4; top:38px; width:91px;  } ' +
                '#available_units_bullseye.rider	.amount	{ color:#DFCC6C; top:52px; width:105px;	} ' +
                '#available_units_bullseye.slinger	.amount	{ color:#F5E8B4; top:53px; width:91px;	} ' +
                '#available_units_bullseye.catapult	.amount	{ color:#F5F6C5; top:36px; width:87px;	} ' +
                '#available_units_bullseye.godsent	.amount	{ color:#F5F6C5; top:57px; width:92px;	} ' +

                // Mythic units
                '#available_units_bullseye.medusa			.amount	{ color:#FBFFBB; top:50px; width:65px;	} ' +
                '#available_units_bullseye.manticore		.amount	{ color:#ECD181; top:50px; width:55px; 	} ' +
                '#available_units_bullseye.pegasus					{ margin-top: 16px;	} ' +
                '#available_units_bullseye.pegasus			.amount	{ color:#F7F8E3; top:36px; width:90px;	} ' +
                '#available_units_bullseye.minotaur			        { margin-top: 10px; } ' +
                '#available_units_bullseye.minotaur		    .amount	{ color:#EAD88A; top:48px; width:78px;	} ' +
                '#available_units_bullseye.zyklop					{ margin-top: 3px;	} ' +
                '#available_units_bullseye.zyklop			.amount	{ color:#EDE0B0; top:50px; width:95px;	} ' +
                '#available_units_bullseye.harpy					{ margin-top: 16px;	} ' +
                '#available_units_bullseye.harpy			.amount	{ color:#E7DB79; top:30px; width:78px;	} ' +
                '#available_units_bullseye.sea_monster		.amount	{ color:#D8EA84; top:58px; width:91px;	} ' +
                '#available_units_bullseye.cerberus		    .amount	{ color:#EC7445; top:25px; width:101px;	} ' +
                '#available_units_bullseye.centaur					{ margin-top: 15px;	} ' +
                '#available_units_bullseye.centaur			.amount	{ color:#ECE0A8; top:29px; width:83px;	} ' +
                '#available_units_bullseye.fury			    .amount	{ color:#E0E0BC; top:57px; width:95px;	} ' +
                '#available_units_bullseye.griffin					{ margin-top: 15px;	} ' +
                '#available_units_bullseye.griffin			.amount	{ color:#FFDC9D; top:40px; width:98px;	} ' +
                '#available_units_bullseye.calydonian_boar	.amount	{ color:#FFDC9D; top:17px; width:85px;	} ' +
                '#available_units_bullseye.siren		    .amount	{ color:#E6CA83; top:40px; width:78px;	} ' +
                '#available_units_bullseye.satyr		    .amount	{ color:#3666EB; top:48px; width:78px;	} ' +
                '#available_units_bullseye.spartoi			        { margin-top: 10px; } ' +
                '#available_units_bullseye.spartoi		    .amount	{ color:#8F0A2D; top:48px; width:78px;	} ' +
                '#available_units_bullseye.ladon			        { margin-top: 10px; } ' +
                '#available_units_bullseye.ladon		    .amount	{ color:#8F0A2D; top:48px; width:78px;	} ' +

                // Naval units
                '#available_units_bullseye.attack_ship		    .amount	{ color:#FFCB00; top:26px; width:99px;	} ' +
                '#available_units_bullseye.bireme			    .amount	{ color:#DFC677; color:azure; top:28px; width:79px;	} ' +
                '#available_units_bullseye.trireme			    .amount	{ color:#F4FFD4; top:24px; width:90px;	} ' +
                '#available_units_bullseye.small_transporter	.amount { color:#F5F6C5; top:26px; width:84px;	} ' +
                '#available_units_bullseye.big_transporter	    .amount { color:#FFDC9D; top:27px; width:78px;	} ' +
                '#available_units_bullseye.colonize_ship		.amount { color:#F5F6C5; top:29px; width:76px;	} ' +
                '#available_units_bullseye.colonize_ship		.amount { color:#F5F6C5; top:29px; width:76px;	} ' +
                '#available_units_bullseye.demolition_ship	    .amount { color:#F5F6C5; top:35px; width:90px;	} ' +

                // Available units window
                '#available_units { overflow: auto;  } ' +
                '#available_units .unit { margin: 5px; cursor:pointer; overflow:visible; } ' +
                '#available_units .unit.active { border: 2px solid #7f653a; border-radius:30px; margin:4px; } ' +
                '#available_units .unit span { text-shadow: 1px 1px 1px black, 1px 1px 2px black;} ' +
                '#available_units hr { margin: 5px 0px 5px 0px; } ' +
                '#available_units .drop_box .option { float: left; margin-right: 30px; width:100%; } ' +
                '#available_units .drop_box { position:absolute; top: -38px; right: 120px; width:90px; z-index:10; } ' +
                '#available_units .drop_box .drop_group { width: 120px; } ' +
                '#available_units .drop_box .select_group.open { display:block; } ' +
                '#available_units .drop_box .item-list { overflow: auto; overflow-x: hidden; } ' +
                '#available_units .drop_box .arrow { width:18px; height:18px; background:url(' + drop_out.src + ') no-repeat -1px -1px; position:absolute; } ' +

                // Available units button
                '#btn_available_units { top:86px; left:119px; z-index:10; position:absolute; } ' +
                '#btn_available_units .ico_available_units { margin:5px 0px 0px 4px; width:24px; height:24px; ' +
                'background:url(https://flasktools.altervista.org/images/w4ekrw8b.png) no-repeat 0px 0px;background-size:100%; filter:url(#Hue1); -webkit-filter:hue-rotate(100deg);  } ' +

                '</style>').appendTo('head');

            if (uw.GameData.gods.aphrodite) {
                createWindowType("FLASK_UNITS", (LANG.hasOwnProperty(MID) ? getText("options", "ava")[0] : default_title), 365, 360, true, [240, 70]);
            } else {
                createWindowType("FLASK_UNITS", (LANG.hasOwnProperty(MID) ? getText("options", "ava")[0] : default_title), 365, 315, true, [240, 70]);
            }

            // Set Sea-ID beside the bull eye
            $('#sea_id').prependTo('#ui_box');

            AvailableUnits.addButton();

            UnitCounter.count();
            AvailableUnits.updateBullseye();
        },
        deactivate: function () {
            $('#available_units_bullseye').remove();
            $('#available_units_bullseye_addition').remove();

            $('#flask_available_units_style').remove();
            $('#flask_available_units_style_addition').remove();

            $('#btn_available_units').remove();

            if (Layout.wnd.getOpenFirst(GPWindowMgr.TYPE_FLASK_UNITS)) {
                Layout.wnd.getOpenFirst(GPWindowMgr.TYPE_FLASK_UNITS).close();
            }

            $('.picomap_overlayer').unbind();

            $('#sea_id').appendTo('.picomap_container')
        },
        addButton: function () {
            var default_title = DM.getl10n("place", "support_overview").options.troop_count + " (" + DM.getl10n("hercules2014", "available") + ")";

            $('<div id="btn_available_units" class="circle_button"><div class="ico_available_units js-caption"></div></div>').appendTo(".bull_eye_buttons");

            // Events
            $('#btn_available_units').on('mousedown', function () {
                $('#btn_available_units, .ico_available_units').addClass("checked");
            }).on('mouseup', function () {
                $('#btn_available_units, .ico_available_units').removeClass("checked");
            });

            $('#btn_available_units, .picomap_overlayer').click(function () {
                if (!Layout.wnd.getOpenFirst(GPWindowMgr.TYPE_FLASK_UNITS)) {
                    AvailableUnits.openWindow();
                    $('#btn_available_units, .ico_available_units').addClass("checked");
                } else {
                    AvailableUnits.closeWindow();
                    $('#btn_available_units, .ico_available_units').removeClass("checked");
                }
            });

            // Tooltip
            $('#btn_available_units').tooltip(LANG.hasOwnProperty(MID) ? getText("labels", "uni") : default_title);
        },
        openWindow: function () {
            var groupArray = uw.ITowns.townGroups.getGroupsFLASK(),

                unitArray = {
                    "sword": 0,
                    "archer": 0,
                    "hoplite": 0,
                    "slinger": 0,
                    "rider": 0,
                    "chariot": 0,
                    "catapult": 0,
                    "godsent": 0,
                    "manticore": 0,
                    "harpy": 0,
                    "pegasus": 0,
                    "griffin": 0,
                    "cerberus": 0,
                    "minotaur": 0,
                    "medusa": 0,
                    "zyklop": 0,
                    "centaur": 0,
                    "calydonian_boar": 0,
                    "fury": 0,
                    "spartoi": 0,
                    "satyr": 0,
                    "ladon": 0,
                    "siren": 0,
                    "sea_monster": 0,
                    "small_transporter": 0,
                    "big_transporter": 0,
                    "bireme": 0,
                    "attack_ship": 0,
                    "trireme": 0,
                    "demolition_ship": 0,
                    "colonize_ship": 0
                };

            if (!uw.Game.hasArtemis) {
                delete unitArray.calydonian_boar;
                delete unitArray.griffin;
            }
            if (!uw.GameData.gods.aphrodite) {
                delete unitArray.siren;
                delete unitArray.satyr;
            }
            if (!uw.GameData.gods.ares) {
                delete unitArray.spartoi;
                delete unitArray.ladon;
            }

            var land_units_str = "", content =
                '<div id="available_units">' +
                // Dropdown menu
                '<div class="drop_box">' +
                '<div class="drop_group dropdown default">' +
                '<div class="border-left"></div><div class="border-right"></div>' +
                '<div class="caption" name="' + groupArray[DATA.bullseyeUnit.current_group].id + '">' + ITowns.town_groups._byId[groupArray[DATA.bullseyeUnit.current_group].id].attributes.name + '</div>' +
                '<div class="arrow"></div>' +
                '</div>' +
                '<div class="select_group dropdown-list default active"><div class="item-list"></div></div>' +
                '</div>' +
                '<table width="100%" class="radiobutton horizontal rbtn_visibility"><tr>' +
                '<td width="40%"><div class="option js-option" name="total"><div class="pointer"></div>' + getText("labels", "total") + '</div></td>' +
                '<td width="40%"><div class="option js-option" name="available"><div class="pointer"></div>' + getText("labels", "available") + '</div></td>' +
                '<td width="20%"><div class="option js-option" name="outer"><div class="pointer"></div>' + getText("labels", "outer") + '</div></td>' +
                '</tr></table>' +
                '<hr>' +
                // Content
                '<div class="box_content">';

            for (var unit in unitArray) {
                if (unitArray.hasOwnProperty(unit)) {
                    land_units_str += '<div class="unit index_unit bold unit_icon40x40 ' + unit + '"></div>';
                    if (unit == "sea_monster") {
                        land_units_str += '<div style="clear:left;"></div>'; // break
                    }
                }

            }
            content += land_units_str + '</div></div>';

            AvailableUnits.wnd = Layout.wnd.Create(GPWindowMgr.TYPE_FLASK_UNITS);

            AvailableUnits.wnd.setContent(content);

            if (Game.premium_features.curator <= Timestamp.now()) {
                $('#available_units .drop_box').css({ display: 'none' });
                DATA.bullseyeUnit.current_group = -1;
            }

            // Add groups to dropdown menu
            for (var group in groupArray) {
                if (groupArray.hasOwnProperty(group)) {
                    var group_name = ITowns.town_groups._byId[group].attributes.name;
                    $('<div class="option' + (group == -1 ? " sel" : "") + '" name="' + group + '">' + group_name + '</div>').appendTo('#available_units .item-list');
                }
            }

            // Set active mode
            if (typeof (DATA.bullseyeUnit.mode) !== "undefined") {
                $('.radiobutton .option[name="' + DATA.bullseyeUnit.mode + '"]').addClass("checked");
            }
            else {
                $('.radiobutton .option[name="available"]').addClass("checked");
            }

            // Update
            AvailableUnits.updateWindow();

            // Dropdown menu Handler
            $('#available_units .drop_group').click(function () {
                $('#available_units .select_group').toggleClass('open');
            });
            // Change group
            $('#available_units .select_group .option').click(function () {
                DATA.bullseyeUnit.current_group = $(this).attr("name");
                $('#available_units .select_group').removeClass('open');
                $('#available_units .select_group .option.sel').removeClass("sel");
                $(this).addClass("sel");

                $('#available_units .drop_group .caption').attr("name", DATA.bullseyeUnit.current_group);
                $('#available_units .drop_group .caption').get(0).innerHTML = this.innerHTML;

                $('#available_units .unit.active').removeClass("active");
                $('#available_units .unit.' + (DATA.bullseyeUnit[DATA.bullseyeUnit.current_group] || "bireme")).addClass("active");

                UnitCounter.count();

                AvailableUnits.updateWindow();
                AvailableUnits.updateBullseye();
                AvailableUnits.save();
            });

            // Change mode (total, available, outer)
            $('.radiobutton .option').click(function () {

                DATA.bullseyeUnit.mode = $(this).attr("name");

                $('.radiobutton .option.checked').removeClass("checked");
                $(this).addClass("checked");

                UnitCounter.count();

                AvailableUnits.updateWindow();
                AvailableUnits.updateBullseye();
                AvailableUnits.save();
            });

            // Set active bullseye unit
            $('#available_units .unit.' + (DATA.bullseyeUnit[DATA.bullseyeUnit.current_group] || "bireme")).addClass("active");

            // Change bullseye unit
            $('#available_units .unit').click(function () {
                DATA.bullseyeUnit[DATA.bullseyeUnit.current_group] = this.className.split(" ")[4].trim();

                $('#available_units .unit.active').removeClass("active");
                $(this).addClass("active");

                AvailableUnits.updateBullseye();
                AvailableUnits.save();

            });

            // Close button event - uncheck available units button
            Layout.wnd.getOpenFirst(GPWindowMgr.TYPE_FLASK_UNITS).getJQCloseButton().get(0).onclick = function () {
                $('#btn_available_units, .ico_available_units').removeClass("checked");
            };
        },
        closeWindow: function () {
            Layout.wnd.getOpenFirst(GPWindowMgr.TYPE_FLASK_UNITS).close();
        },
        save: function () {
            // console.debug("BULLSEYE SAVE", DATA.bullseyeUnit);

            saveValue(WID + "_bullseyeUnit", JSON.stringify(DATA.bullseyeUnit));
        },
        updateBullseye: function () {

            var sum = 0, str = "", fsize = ['1.4em', '1.2em', '1.15em', '1.1em', '1.0em', '0.95em'], i;

            if ($('#available_units_bullseye').get(0)) {
                $('#available_units_bullseye').get(0).className = "unit_icon90x90 " + (DATA.bullseyeUnit[DATA.bullseyeUnit.current_group] || "bireme");

                if (UnitCounter.units[DATA.bullseyeUnit.mode || "available"][DATA.bullseyeUnit.current_group]) {
                    sum = UnitCounter.units[DATA.bullseyeUnit.mode || "available"][DATA.bullseyeUnit.current_group]["all"][(DATA.bullseyeUnit[DATA.bullseyeUnit.current_group] || "bireme")] || 0;
                }
                sum = sum.toString();

                for (i = 0; i < sum.length; i++) {
                    str += "<span style='font-size:" + fsize[i] + "'>" + sum[i] + "</span>";
                }
                $('#available_units_bullseye .amount').get(0).innerHTML = str;

                if (sum >= 100000) {
                    $('#available_units_bullseye').addClass("big_number");
                } else {
                    $('#available_units_bullseye').removeClass("big_number");
                }
            }
        },
        updateWindow: function () {

            $('#available_units .box_content .unit').each(function () {
                var unit = this.className.split(" ")[4];

                // TODO: Alte Variante entfernen
                // Alte Variante:
                //this.innerHTML = '<span style="font-size:0.9em">' + groupUnitArray[DATA.bullseyeUnit.current_group][unit] + '</span>';

                // Neue Variante
                this.innerHTML = '<span style="font-size:0.9em">' + (UnitCounter.units[DATA.bullseyeUnit.mode || "available"][DATA.bullseyeUnit.current_group]["all"][unit] || 0) + '</span>';
            });
        }
    };

    /*******************************************************************************************************************************
     * Comparison box
     * ----------------------------------------------------------------------------------------------------------------------------
     * | ●  Compares the units of each unit type
     * ----------------------------------------------------------------------------------------------------------------------------
     *******************************************************************************************************************************/
    var UnitComparison = {
        activate: function () {
            //UnitComparison.addBox();
            UnitComparison.addButton();

            // Create Window Type
            createWindowType("FLASK_COMPARISON", getText("labels", "dsc"), 520, 425, true, ["center", "center", 100, 100]);

            // Style
            $('<style id="flask_comparison_style"> ' +

                // Button
                '#flask_comparison_button { top:51px; left:120px; z-index:10; position:absolute; } ' +
                '#flask_comparison_button .ico_comparison { margin:5px 0px 0px 4px; width:24px; height:24px; ' +
                'background:url(https://flasktools.altervista.org/images/cjq6cxia4ms8mn95r.png) no-repeat 0px 0px; background-size:100%; filter:url(#Hue1); -webkit-filter:hue-rotate(60deg); } ' +
                '#flask_comparison_button.checked .ico_comparison { margin-top:6px; } ' +

                // Window
                '#flask_comparison a { float:left; background-repeat:no-repeat; background-size:25px; line-height:2; margin-right:10px; } ' +
                '#flask_comparison .box_content { text-align:center; font-style:normal; } ' +

                // Content
                '#flask_comparison .hidden { display:none; } ' +
                '#flask_comparison table { width:520px; } ' +
                '#flask_comparison .hack .t_hack, #flask_comparison .pierce .t_pierce, #flask_comparison .distance .t_distance, #flask_comparison .sea .t_sea { display:inline-table; } ' +

                '#flask_comparison .box_content { background:url(https://flasktools.altervista.org/images/8jd9d3ec.png) 94% 94% no-repeat; background-size:140px; } ' +

                '#flask_comparison .compare_type_icon { height:25px; width:25px; background:url(https://gp' + MID + '.innogamescdn.com/images/game/units/units_info_sprite2.51.png); background-size:100%; } ' +
                '#flask_comparison .compare_type_icon.booty { background:url(https://flasktools.altervista.org/images/ki4gwd7x.png); background-size:100%; } ' +
                '#flask_comparison .compare_type_icon.time { background:url(https://gp' + MID + '.innogamescdn.com/images/game/res/time.png); background-size:100%; } ' +
                '#flask_comparison .compare_type_icon.favor { background:url(https://gp' + MID + '.innogamescdn.com/images/game/res/favor.png); background-size:100%; } ' +
                '#flask_comparison .compare_type_icon.wood { background:url(https://gp' + MID + '.innogamescdn.com/images/game/res/wood.png); background-size:100%; } ' +
                '#flask_comparison .compare_type_icon.stone { background:url(https://gp' + MID + '.innogamescdn.com/images/game/res/stone.png); background-size:100%; } ' +
                '#flask_comparison .compare_type_icon.iron { background:url(https://gp' + MID + '.innogamescdn.com/images/game/res/iron.png); background-size:100%; } ' +
                '.icon_small2 { position:relative; height:20px; width:25px; margin-left:-25px; }' +
                '</style>').appendTo("head");
        },
        deactivate: function () {
            $('#flask_comparison_button').remove();
            $('#flask_comparison_style').remove();

            if (Layout.wnd.getOpenFirst(GPWindowMgr.TYPE_FLASK_COMPARISON)) {
                Layout.wnd.getOpenFirst(GPWindowMgr.TYPE_FLASK_COMPARISON).close();
            }
        },
        addButton: function () {
            $('<div id="flask_comparison_button" class="circle_button"><div class="ico_comparison js-caption"></div></div>').appendTo(".bull_eye_buttons");

            // Events
            /*
             $('#flask_comparison_button').on('mousedown', function(){
             $('#flask_comparison_button').addClass("checked");
             }, function(){
             $('#flask_comparison_button').removeClass("checked");
             });
             */
            $('#flask_comparison_button').on('click', function () {
                if (!Layout.wnd.getOpenFirst(GPWindowMgr.TYPE_FLASK_COMPARISON)) {
                    UnitComparison.openWindow();
                    $('#flask_comparison_button').addClass("checked");
                } else {
                    UnitComparison.closeWindow();
                    $('#flask_comparison_button').removeClass("checked");
                }
            });

            // Tooltip
            $('#flask_comparison_button').tooltip(getText("labels", "dsc"));
        },
        openWindow: function () {
            var content =
                // Title tabs
                '<ul id="flask_comparison_menu" class="menu_inner" style="top: -36px; right: 93px;">' +
                '<li><a class="submenu_link sea" href="#"><span class="left"><span class="right"><span class="middle">' +
                '<span class="tab_icon icon_small townicon_so"></span><span class="tab_label">' + getText("labels", "sea") + '</span>' +
                '</span></span></span></a></li>' +
                '<li><a class="submenu_link distance" href="#"><span class="left"><span class="right"><span class="middle">' +
                '<span class="tab_icon icon_small townicon_di"></span><span class="tab_label">' + getText("labels", "dst") + '</span>' +
                '</span></span></span></a></li>' +
                '<li><a class="submenu_link pierce" href="#"><span class="left"><span class="right"><span class="middle">' +
                '<span class="tab_icon icon_small townicon_sh"></span><span class="tab_label">' + getText("labels", "prc") + '</span>' +
                '</span></span></span></a></li>' +
                '<li><a class="submenu_link hack active" href="#"><span class="left"><span class="right"><span class="middle">' +
                '<span class="tab_icon icon_small townicon_lo"></span><span class="tab_label">' + getText("labels", "hck") + '</span>' +
                '</span></span></span></a></li>' +
                '</ul>' +
                // Content
                '<div id="flask_comparison" style="margin-bottom:5px; font-style:italic;"><div class="box_content hack"></div></div>';

            Layout.wnd.Create(GPWindowMgr.TYPE_FLASK_COMPARISON).setContent(content);

            UnitComparison.addComparisonTable("hack");
            UnitComparison.addComparisonTable("pierce");
            UnitComparison.addComparisonTable("distance");
            UnitComparison.addComparisonTable("sea");

            // Tooltips
            var labelArray = DM.getl10n("barracks"),
                labelAttack = DM.getl10n("context_menu", "titles").attack,
                labelDefense = DM.getl10n("place", "tabs")[0];

            $('.tr_att').tooltip(labelAttack);
            $('.tr_def').tooltip(labelDefense + " (Ø)");
            $('.tr_def_sea').tooltip(labelDefense);
            $('.tr_spd').tooltip(labelArray.tooltips.speed);
            $('.tr_bty').tooltip(labelArray.tooltips.booty.title);
            $('.tr_bty_sea').tooltip(labelArray.tooltips.ship_transport.title);
            $('.tr_woo').tooltip(labelArray.costs + " (" + labelArray.cost_details.wood + ")");
            $('.tr_sto').tooltip(labelArray.costs + " (" + labelArray.cost_details.stone + ")");
            $('.tr_iro').tooltip(labelArray.costs + " (" + labelArray.cost_details.iron + ")");
            $('.tr_fav').tooltip(labelArray.costs + " (" + labelArray.cost_details.favor + ")");
            $('.tr_tim').tooltip(labelArray.cost_details.buildtime_barracks + " (s)");
            $('.tr_tim_sea').tooltip(labelArray.cost_details.buildtime_docks + " (s)");

            UnitComparison.switchComparisonTables();

            // Close button event - uncheck available units button
            Layout.wnd.getOpenFirst(GPWindowMgr.TYPE_FLASK_COMPARISON).getJQCloseButton().get(0).onclick = function () {
                $('#flask_comparison_button').removeClass("checked");
                $('.ico_comparison').get(0).style.marginTop = "5px";
            };
        },
        closeWindow: function () {
            Layout.wnd.getOpenFirst(GPWindowMgr.TYPE_FLASK_COMPARISON).close();
        },
        switchComparisonTables: function () {
            $('#flask_comparison_menu .hack, #flask_comparison_menu .pierce, #flask_comparison_menu .distance, #flask_comparison_menu .sea').click(function () {
                $('#flask_comparison .box_content').removeClass($('#flask_comparison .box_content').get(0).className.split(" ")[1]);
                //console.debug(this.className.split(" ")[1]);
                $('#flask_comparison .box_content').addClass(this.className.split(" ")[1]);

                $('#flask_comparison_menu .active').removeClass("active");
                $(this).addClass("active");
            });
        },

        tooltips: [], t: 0,

        addComparisonTable: function (type) {
            var pos = {
                att: { hack: "36%", pierce: "27%", distance: "45.5%", sea: "72.5%" },
                def: { hack: "18%", pierce: "18%", distance: "18%", sea: "81.5%" }
            };
            var unitIMG = "https://gp" + MID + ".innogamescdn.com/images/game/units/units_info_sprite2.51.png";
            var strArray = [
                "<td></td>",
                '<td><div class="compare_type_icon" style="background-position: 0% ' + pos.att[type] + ';"></div></td>',
                '<td><div class="compare_type_icon" style="background-position: 0% ' + pos.def[type] + ';"></div></td>',
                '<td><div class="compare_type_icon" style="background-position: 0% 63%;"></div></td>',
                (type !== "sea") ? '<td><div class="compare_type_icon booty"></div></td>' : '<td><div class="compare_type_icon" style="background-position: 0% 91%;"></div></td>',
                '<td><div class="compare_type_icon wood"></div></td>',
                '<td><div class="compare_type_icon stone"></div></td>',
                '<td><div class="compare_type_icon iron"></div></td>',
                '<td><div class="compare_type_icon favor"></div></td>',
                '<td><div class="compare_type_icon time"></div></td>'
            ];

            for (var e in uw.GameData.units) {
                if (uw.GameData.units.hasOwnProperty(e)) {
                    var valArray = [];

                    if (type === (uw.GameData.units[e].attack_type || "sea") && (e !== "militia")) {
                        valArray.att = Math.round(uw.GameData.units[e].attack * 10 / uw.GameData.units[e].population) / 10;
                        valArray.def = Math.round(((uw.GameData.units[e].def_hack + uw.GameData.units[e].def_pierce + uw.GameData.units[e].def_distance) * 10) / (3 * uw.GameData.units[e].population)) / 10;
                        valArray.def = valArray.def || Math.round(uw.GameData.units[e].defense * 10 / uw.GameData.units[e].population) / 10;
                        valArray.speed = uw.GameData.units[e].speed;
                        valArray.booty = Math.round(((uw.GameData.units[e].booty) * 10) / uw.GameData.units[e].population) / 10;
                        valArray.booty = valArray.booty || Math.round(((uw.GameData.units[e].capacity ? uw.GameData.units[e].capacity + 6 : 0) * 10) / uw.GameData.units[e].population) / 10;
                        valArray.wood = Math.round((uw.GameData.units[e].resources.wood) / (uw.GameData.units[e].population));
                        valArray.stone = Math.round((uw.GameData.units[e].resources.stone) / (uw.GameData.units[e].population));
                        valArray.iron = Math.round((uw.GameData.units[e].resources.iron) / (uw.GameData.units[e].population));
                        valArray.favor = Math.round((uw.GameData.units[e].favor * 10) / uw.GameData.units[e].population) / 10;
                        valArray.time = Math.round(uw.GameData.units[e].build_time / uw.GameData.units[e].population);

                        // World without Artemis? -> grey griffin and boar
                        valArray.heroStyle = "";
                        valArray.heroStyleIMG = "";

                        if (!uw.Game.hasArtemis && ((e === "griffin") || (e === "calydonian_boar"))) {
                            valArray.heroStyle = "color:black;opacity: 0.4;";
                            valArray.heroStyleIMG = "filter: url(#GrayScale); -webkit-filter:grayscale(100%);";
                        }
                        if (!uw.GameData.gods.aphrodite && ((e === "siren") || (e === "satyr"))) {
                            valArray.heroStyle = "color:black;opacity: 0.4;";
                            valArray.heroStyleIMG = "filter: url(#GrayScale); -webkit-filter:grayscale(100%);";
                        }
                        if (!uw.GameData.gods.ares && ((e === "spartoi") || (e === "ladon"))) {
                            valArray.heroStyle = "color:black;opacity: 0.4;";
                            valArray.heroStyleIMG = "filter: url(#GrayScale); -webkit-filter:grayscale(100%);";
                        }

                        strArray[0] += '<td class="un' + (UnitComparison.t) + '"style="' + valArray.heroStyle + '"><span class="unit index_unit unit_icon40x40 ' + e + '" style="' + valArray.heroStyle + valArray.heroStyleIMG + '"></span></td>';
                        strArray[1] += '<td class="bold" style="color:' + ((valArray.att > 19) ? 'green;' : ((valArray.att < 10 && valArray.att !== 0) ? 'red;' : 'black;')) + valArray.heroStyle + '">' + valArray.att + '</td>';
                        strArray[2] += '<td class="bold" style="color:' + ((valArray.def > 19) ? 'green;' : ((valArray.def < 10 && valArray.def !== 0) ? 'red;' : 'black;')) + valArray.heroStyle + '">' + valArray.def + '</td>';
                        strArray[3] += '<td class="bold" style="' + valArray.heroStyle + '">' + valArray.speed + '</td>';
                        strArray[4] += '<td class="bold" style="' + valArray.heroStyle + '">' + valArray.booty + '</td>';
                        strArray[5] += '<td class="bold" style="' + valArray.heroStyle + '">' + valArray.wood + '</td>';
                        strArray[6] += '<td class="bold" style="' + valArray.heroStyle + '">' + valArray.stone + '</td>';
                        strArray[7] += '<td class="bold" style="' + valArray.heroStyle + '">' + valArray.iron + '</td>';
                        strArray[8] += '<td class="bold" style="color:' + ((valArray.favor > 0) ? 'rgb(0, 0, 214);' : 'black;') + valArray.heroStyle + ';">' + valArray.favor + '</td>';
                        strArray[9] += '<td class="bold" style="' + valArray.heroStyle + '">' + valArray.time + '</td>';

                        UnitComparison.tooltips[UnitComparison.t] = uw.GameData.units[e].name;
                        UnitComparison.t++;
                    }
                }
            }

            $('<table class="hidden t_' + type + '" cellpadding="1px">' +
                '<tr>' + strArray[0] + '</tr>' +
                '<tr class="tr_att">' + strArray[1] + '</tr><tr class="tr_def' + (type == "sea" ? "_sea" : "") + '">' + strArray[2] + '</tr>' +
                '<tr class="tr_spd">' + strArray[3] + '</tr><tr class="tr_bty' + (type == "sea" ? "_sea" : "") + '">' + strArray[4] + '</tr>' +
                '</tr><tr class="tr_woo">' + strArray[5] + '</tr>' + '<tr class="tr_sto">' + strArray[6] +
                '</tr><tr class="tr_iro">' + strArray[7] + '</tr>' + '</tr><tr class="tr_fav">' + strArray[8] +
                '</tr><tr class="tr_tim' + (type == "sea" ? "_sea" : "") + '">' + strArray[9] + '</tr>' +
                '</table>').appendTo('#flask_comparison .box_content');

            for (var i = 0; i <= UnitComparison.t; i++) {
                $('.un' + i).tooltip(UnitComparison.tooltips[i]);
            }
        }
    };

    /*******************************************************************************************************************************
     * Reports and Messages
     * ----------------------------------------------------------------------------------------------------------------------------
     * | ● Storage of the selected filter (only in German Grepolis yet)
     * ----------------------------------------------------------------------------------------------------------------------------
     *******************************************************************************************************************************/

    var filter = "all";

    function saveFilter() {
        $('#dd_filter_type_list .item-list div').each(function () {
            $(this).click(function () {
                filter = $(this).attr("name");
            });
        });
        /*
         var i = 0;
         $("#report_list a").each(function () {
         //console.log((i++) +" = " + $(this).attr('data-reportid'));
         });
         */
    }

    function loadFilter() {
        if ($('#dd_filter_type_list .selected').attr("name") !== filter) {
            $('#dd_filter_type .caption').click();
            $('#dd_filter_type_list .item-list div[name=' + filter + ']').click();
        }
    }

    function removeReports() {
        $("#report_list li:contains('spioniert')").each(function () {
            //$(this).remove();
        });
    }

    var zut = 0;
    var messageArray = {};

    function filterPlayer() {
        if (!$('#message_filter_list').get(0)) {
            $('<div id="message_filter_list" style="height:300px;overflow-y:scroll; width: 790px;"></div>').appendTo('#folder_container');
            $("#message_list").get(0).style.display = "none";
        }
        if (zut < parseInt($('.es_last_page').get(0).value, 10) - 1) {
            $('.es_page_input').get(0).value = zut++;
            $('.jump_button').click();
            $("#message_list li:contains('')").each(function () {
                $(this).appendTo('#message_filter_list');
            });
        } else {
            zut = 1;
        }
    }


    /*******************************************************************************************************************************
     * World Wonder Ranking - Change
     *******************************************************************************************************************************/

    /*function getWorldWonderTypes() {
        $.ajax({
            type: "GET",
            url: "/game/alliance?town_id=" + uw.Game.town_id + "&action=world_wonders&h=" + uw.Game.csrfToken + "&json=%7B%22town_id%22%3A" + uw.Game.town_id + "%2C%22nlreq_id%22%3A" + uw.Game.notification_last_requested_id +
            "%7D&_=" + uw.Game.server_time,
            success: function (text) {
                try {
                    //console.log(JSON.parse(text));
                    temp = JSON.parse(text).json.data.world_wonders;
                    for (var t in temp) {
                        if (temp.hasOwnProperty(t)) {
                            wonderTypes[temp[t].wonder_type] = temp[t].full_name;
                        }
                    }
                    temp = JSON.parse(text).json.data.buildable_wonders;
                    for (var x in temp) {
                        if (temp.hasOwnProperty(x)) {
                            wonderTypes[x] = temp[x].name;
                        }
                    }
                    saveValue(MID + "_wonderTypes", JSON.stringify(wonderTypes));
                } catch (error) {
                    errorHandling(error, "getWorldWonderTypes");
                }
            }
        });
    }

    function getWorldWonders() {
        $.ajax({
            type: "GET",
            url: "/game/ranking?town_id=" + uw.Game.town_id + "&action=wonder_alliance&h=" + uw.Game.csrfToken + "&json=%7B%22type%22%3A%22all%22%2C%22town_id%22%3A" + uw.Game.town_id + "%2C%22nlreq_id%22%3A3" + uw.Game.notification_last_requested_id +
            "%7D&_=" + uw.Game.server_time
        });
    }

    var WorldWonderRanking = {
        activate: function () {
            if ($('#flask_wonder_ranking').get(0)) {
                $('#flask_wonder_ranking').remove();
            }
            $('<style id="flask_wonder_ranking" type="text/css"> .wonder_ranking { display: none; } </style>').appendTo('head');
        },
        deactivate: function () {
            if ($('#flask_wonder_ranking').get(0)) {
                $('#flask_wonder_ranking').remove();
            }
            $('<style id="flask_wonder_ranking" type="text/css"> .wonder_ranking { display: block; } </style>').appendTo('head');
        },
        change: function (html) {
            if ($('#ranking_inner tr', html)[0].children.length !== 1) { // world wonders exist?
                try {
                    var ranking = {}, temp_ally, temp_ally_id, temp_ally_link;

                    // Save world wonder ranking into array
                    $('#ranking_inner tr', html).each(function () {
                        try {
                            if (this.children[0].innerHTML) {
                                temp_ally = this.children[1].children[0].innerHTML; // das hier

                                temp_ally_id = this.children[1].children[0].onclick.toString();
                                temp_ally_id = temp_ally_id.substring(temp_ally_id.indexOf(",") + 1);
                                temp_ally_id = temp_ally_id.substring(0, temp_ally_id.indexOf(")"));

                                temp_ally_link = this.children[1].innerHTML;

                            } else {
                                //World wonder name
                                var wonder_name = this.children[3].children[0].innerHTML;

                                for (var w in wonderTypes) {
                                    if (wonderTypes.hasOwnProperty(w)) {
                                        if (wonder_name == wonderTypes[w]) {
                                            var level = this.children[4].innerHTML, // world wonder level
                                                ww_data = JSON.parse(atob(this.children[3].children[0].href.split("#")[1])), wonder_link;
                                            //console.log(ww_data);

                                            if (!ranking.hasOwnProperty(level)) {
                                                // add wonder types
                                                ranking[level] = {
                                                    colossus_of_rhodes: {},
                                                    great_pyramid_of_giza: {},
                                                    hanging_gardens_of_babylon: {},
                                                    lighthouse_of_alexandria: {},
                                                    mausoleum_of_halicarnassus: {},
                                                    statue_of_zeus_at_olympia: {},
                                                    temple_of_artemis_at_ephesus: {}
                                                };
                                            }

                                            if (!ranking[level][w].hasOwnProperty(temp_ally_id)) {
                                                ranking[level][w][temp_ally_id] = {}; // add alliance array
                                            }
                                            // island coordinates of the world wonder:
                                            ranking[level][w][temp_ally_id].ix = ww_data.ix;
                                            ranking[level][w][temp_ally_id].iy = ww_data.iy;
                                            ranking[level][w][temp_ally_id].sea = this.children[5].innerHTML; // world wonder sea

                                            wonder_link = this.children[3].innerHTML;
                                            if (temp_ally.length > 15) {
                                                temp_ally = temp_ally.substring(0, 15) + '.';
                                            }
                                            wonder_link = wonder_link.substr(0, wonder_link.indexOf(">") + 1) + temp_ally + '</a>';

                                            ranking[level][w][temp_ally_id].ww_link = wonder_link;

                                            // other data of the world wonder
                                            ranking[level][w][temp_ally_id].ally_link = temp_ally_link;
                                            ranking[level][w][temp_ally_id].ally_name = temp_ally; // alliance name
                                            ranking[level][w][temp_ally_id].name = wonder_name; // world wonder name

                                            // Save wonder coordinates for wonder icons on map
                                            if (!wonder.map[w]) {
                                                wonder.map[w] = {};
                                            }
                                            wonder.map[w][ww_data.ix + "_" + ww_data.iy] = level;
                                            saveValue(WID + "_wonder", JSON.stringify(wonder));

                                        }
                                    }
                                }
                            }
                        } catch (error) {
                            errorHandling(error, "WorldWonderRanking.change(function)");
                        }
                    });

                    if ($('#ranking_table_wrapper').get(0)) {
                        $('#ranking_fixed_table_header').get(0).innerHTML = '<tr>' +
                            '<td style="width:10px">#</td>' +
                            '<td>Colossus</td>' +
                            '<td>Pyramid</td>' +
                            '<td>Garden</td>' +
                            '<td>Lighthouse</td>' +
                            '<td>Mausoleum</td>' +
                            '<td>Statue</td>' +
                            '<td>Temple</td>' +
                            '</tr>';

                        $('#ranking_fixed_table_header').css({
                            tableLayout: 'fixed',
                            width: '100%',
                            //paddingLeft: '0px',
                            paddingRight: '15px'
                        });

                        var ranking_substr = '', z = 0;
                        for (var level = 10; level >= 1; level--) {
                            if (ranking.hasOwnProperty(level)) {
                                var complete = "";
                                if (level == 10) {
                                    complete = "background: rgba(255, 236, 108, 0.36);";
                                }

                                // Alternate table background color
                                if (z === 0) {
                                    ranking_substr += '<tr class="game_table_odd" style="' + complete + '"><td style="border-right: 1px solid #d0be97;">' + level + '</td>';
                                    z = 1;
                                } else {
                                    ranking_substr += '<tr class="game_table_even" style="' + complete + '"><td style="border-right: 1px solid #d0be97;">' + level + '</td>';
                                    z = 0;
                                }
                                for (var w in ranking[level]) {
                                    if (ranking[level].hasOwnProperty(w)) {
                                        ranking_substr += '<td>';

                                        for (var a in ranking[level][w]) {
                                            if (ranking[level][w].hasOwnProperty(a)) {
                                                ranking_substr += '<nobr>' + ranking[level][w][a].ww_link + '</nobr><br />'; // ww link
                                            }
                                        }
                                        ranking_substr += '</td>';
                                    }
                                }
                                ranking_substr += '</tr>';
                            }
                        }

                        var ranking_str = '<table id="ranking_endless_scroll" class="game_table" cellspacing="0"><tr>' +
                            '<td style="width:10px;border-right: 1px solid #d0be97;"></td>' +
                            '<td><div class="flask_wonder" style="background:' + worldWonderIcon.colossus_of_rhodes + ';margin-left:26px"></div></td>' +	// Colossus
                            '<td><div class="flask_wonder" style="background:' + worldWonderIcon.great_pyramid_of_giza + ';margin-left:19px"></div></td>' +	// Pyramid
                            '<td><div class="flask_wonder" style="background:' + worldWonderIcon.hanging_gardens_of_babylon + ';margin-left:19px"></div></td>' +	// Garden
                            '<td><div class="flask_wonder" style="background:' + worldWonderIcon.lighthouse_of_alexandria + ';margin-left:24px"></div></td>' +	// Lighthouse
                            '<td><div class="flask_wonder" style="background:' + worldWonderIcon.mausoleum_of_halicarnassus + ';margin-left:25px"></div></td>' +	// Mausoleum
                            '<td><div class="flask_wonder" style="background:' + worldWonderIcon.statue_of_zeus_at_olympia + ';margin-left:25px"></div></td>' +	// Statue
                            '<td><div class="flask_wonder" style="background:' + worldWonderIcon.temple_of_artemis_at_ephesus + ';margin-left:22px"></div></td>' +	// Temple
                            '</tr>' + ranking_substr + '</table>';

                        $('#ranking_table_wrapper').get(0).innerHTML = ranking_str;

                        $('#ranking_endless_scroll .flask_wonder').css({
                            width: "65px", height: "60px",
                            backgroundSize: "auto 100%",
                            backgroundPosition: "64px 0px"
                        });

                        $('#ranking_endless_scroll').css({
                            tableLayout: 'fixed',
                            width: '100%',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            fontSize: '0.7em',
                            lineHeight: '2'
                        });
                        $('#ranking_endless_scroll tbody').css({
                            verticalAlign: 'text-top'
                        });

                        $('#ranking_table_wrapper img').css({
                            width: "60px"
                        });
                        $('#ranking_table_wrapper').css({
                            overflowY: 'scroll'
                        });
                    }
                } catch (error) {
                    errorHandling(error, "WorldWonderRanking.change");
                }
            }
            if ($('.wonder_ranking').get(0)) {
                $('.wonder_ranking').get(0).style.display = "block";
            }
        }
    };*/

    /*******************************************************************************************************************************
     * World Wonder
     * ----------------------------------------------------------------------------------------------------------------------------
     * | ● click adjustment
     * | ● Share calculation (= ratio of player points to alliance points)
     * | ● Resources calculation & counter (stores amount)
     * | ● Adds missing previous & next buttons on finished world wonders (better browsing through world wonders)
     * ----------------------------------------------------------------------------------------------------------------------------
     *******************************************************************************************************************************/
    if (uw.Game.features.end_game_type == "end_game_type_world_wonder") {
        // getPointRatio: Default
        function getPointRatio() {
            try {
                var ally_points = 0;
                ally_points += parseInt($('.current_player .r_points').get(0).innerHTML, 10)
                wonder.ratio[AID] = 100 / ally_points * uw.Game.player_points;
                saveValue(WID + "_wonder", JSON.stringify(wonder));
            } catch (error) {
                errorHandling(error, "getPointRatio");
            }
        }


        var WorldWonderCalculator = {
            activate: function () {
                // Style
                $('<style id="flask_wonder_calculator"> ' +
                    '.wonder_controls { height:auto; } ' +
                    '.wonder_controls .wonder_progress { margin: 0px auto 5px; } ' +
                    '.wonder_controls .wonder_header { text-align:left; margin:10px -8px 12px 3px; }' +
                    '.wonder_controls .build_wonder_icon { top:25px !important; }' +
                    '.wonder_controls .wonder_progress_bar { top:54px; }' +
                    '.wonder_controls .trade fieldset { float:right; } ' +
                    '.wonder_controls .wonder_res_container { right:29px; } ' +
                    '.wonder_controls .ww_ratio {position:relative; height:auto; } ' +
                    '.wonder_controls fieldset.next_level_res {  height:auto; } ' +
                    '.wonder_controls .town-capacity-indicator { margin-top:0px; } ' +
                    '.wonder_controls .trade .send_res .grcrt_shot .gods_favor_button_area .gods_favor_amount {text-align: right; line-height:32px; font-size:14px; } ' +

                    '.wonder_controls .ww_ratio .progress { line-height:1; color:white; font-size:0.8em; } ' +
                    '.wonder_controls .ww_perc { position:absolute; width:242px; text-align:center; } ' +
                    '.wonder_controls .indicator3 { z-index:0; } ' +
                    '.wonder_controls .indicator3.red { background-position:right -203px; height:10px; width:242px; } ' +
                    '.wonder_controls .indicator3.green { background-position:right -355px; height:10px; width:242px; } ' +
                    '.wonder_controls .all_res { background:url(https://gp' + MID + '.innogamescdn.com/images/game/layout/resources_2.32.png) no-repeat 0 -90px; width:30px; height:30px; margin:0 auto; margin-left:5px; } ' +
                    '.wonder_controls .town-capacity-indicator { margin-top:0px; } ' +
                    '</style>').appendTo('head');
            },
            deactivate: function () {
                $('#flask_wonder_calculator').remove();
            }
        };

        // TODO: Split function...
        function getResWW() {
            try {
                var wndArray = uw.GPWindowMgr.getOpen(uw.Layout.wnd.TYPE_WONDERS);

                for (var e in wndArray) {
                    if (wndArray.hasOwnProperty(e)) {
                        var wndID = "#gpwnd_" + wndArray[e].getID() + " ";

                        if ($(wndID + '.wonder_progress').get(0)) {
                            var res = 0,
                                ww_share = { total: { share: 0, sum: 0 }, stage: { share: 0, sum: 0 } },
                                ww_type = $(wndID + '.finished_image_small').attr('src').split("/")[6].split("_")[0], // Which world wonder?
                                res_stages = [2, 4, 6, 10, 16, 28, 48, 82, 140, 238], // Rohstoffmenge pro Rohstofftyp in 100.000 Einheiten
                                stage = parseInt($(wndID + '.wonder_expansion_stage span').get(0).innerHTML.split("/")[0], 10) + 1, // Derzeitige Füllstufe
                                speed = uw.Game.game_speed;

                            wonder.storage[AID] = wonder.storage[AID] || {};

                            wonder.storage[AID][ww_type] = wonder.storage[AID][ww_type] || {};

                            wonder.storage[AID][ww_type][stage] = wonder.storage[AID][ww_type][stage] || 0;

                            if (!$(wndID + '.ww_ratio').get(0)) {
                                $('<fieldset class="ww_ratio"></fieldset>').appendTo(wndID + '.wonder_res_container .trade');
                                $(wndID + '.wonder_header').prependTo(wndID + '.wonder_progress');
                                $(wndID + '.wonder_res_container .send_res').insertBefore(wndID + '.wonder_res_container .next_level_res');
                            }

                            for (var d in res_stages) {
                                if (res_stages.hasOwnProperty(d)) {
                                    ww_share.total.sum += res_stages[d];
                                }
                            }

                            ww_share.total.sum *= speed * 300000;

                            ww_share.total.share = parseInt((443 / 100) * (ww_share.total.sum / 100), 10);

                            ww_share.stage.sum = speed * res_stages[stage - 1] * 300000;

                            ww_share.stage.share = parseInt((443 / 100) * (ww_share.stage.sum / 100), 10); // ( 3000 = 3 Rohstofftypen * 100000 Rohstoffe / 100 Prozent)
                            setResWW(stage, ww_type, ww_share, wndID);


                            $(wndID + '.wonder_res_container .send_resources_btn').click(function (e) {
                                try {
                                    wonder.storage[AID][ww_type][stage] += parseInt($(wndID + '#ww_trade_type_wood input:text').get(0).value, 10);
                                    wonder.storage[AID][ww_type][stage] += parseInt($(wndID + '#ww_trade_type_stone input:text').get(0).value, 10);
                                    wonder.storage[AID][ww_type][stage] += parseInt($(wndID + '#ww_trade_type_iron input:text').get(0).value, 10);

                                    setResWW(stage, ww_type, ww_share, wndID);
                                    saveValue(WID + "_wonder", JSON.stringify(wonder));
                                } catch (error) {
                                    errorHandling(error, "getResWW_Click");
                                }
                            });

                        } else {
                            $('<div class="prev_ww pos_Y"></div><div class="next_ww pos_Y"></div>').appendTo(wndID + '.wonder_controls');

                            $(wndID + '.wonder_controls').css({ height: 'auto' });

                            $(wndID + '.pos_Y').css({
                                top: '-266px'
                            });
                        }
                    }
                }
            } catch (error) {
                errorHandling(error, "getResWW");
            }
        }

        function setResWW(stage, ww_type, ww_share, wndID) {
            try {
                var stage_width, total_width, res_total = 0, stage_color = "red", total_color = "red";

                for (var z in wonder.storage[AID][ww_type]) {
                    if (wonder.storage[AID][ww_type].hasOwnProperty(z)) {
                        res_total += wonder.storage[AID][ww_type][z];
                    }
                }

                // Progressbar
                if (ww_share.stage.share > wonder.storage[AID][ww_type][stage]) {
                    stage_width = (242 / ww_share.stage.share) * wonder.storage[AID][ww_type][stage];
                    stage_color = "red";
                } else {
                    stage_width = 242;
                    stage_color = "green"
                }
                if (ww_share.total.share > res_total) {
                    total_color = "red";
                    total_width = (242 / ww_share.total.share) * res_total;
                } else {
                    total_width = 242;
                    total_color = "green"
                }

                $(wndID + '.ww_ratio').get(0).innerHTML = "";
                $(wndID + '.ww_ratio').append(
                    '<legend>' + getText("labels", "leg") + '</legend>' +
                    '<div class="wonder_for_player" style="margin-left: 130px; font-size:16px;">' +
                    '<span style="color:#090">' + Math.round(wonder.ratio[AID] * 100) / 100 + '%</span>' +
                    '</div>');

                $(wndID + '.ww_ratio').tooltip(
                    "<table style='border-spacing:0px; text-align:right' cellpadding='5px'><tr>" +
                    "<td align='right' style='border-right: 1px solid;border-bottom: 1px solid'></td>" +
                    "<td style='border-right: 1px solid; border-bottom: 1px solid'><span class='bbcodes_player bold'>(" + Math.round(wonder.ratio[AID] * 100) / 100 + "%)</span></td>" +
                    "<td style='border-bottom: 1px solid'><span class='bbcodes_ally bold'>(100%)</span></td></tr>" +
                    "<tr><td class='bold' style='border-right:1px solid;text-align:center'>" + getText("labels", "stg") + "&nbsp;" + stage + "</td>" +
                    "<td style='border-right: 1px solid'>" + pointNumber(Math.round(ww_share.stage.share / 1000) * 1000) + "</td>" +
                    "<td>" + pointNumber(Math.round(ww_share.stage.sum / 1000) * 1000) + "</td></tr>" +
                    "<tr><td class='bold' style='border-right:1px solid;text-align:center'>" + getText("labels", "tot") + "</td>" +
                    "<td style='border-right: 1px solid'>" + pointNumber(Math.round(ww_share.total.share / 1000) * 1000) + "</td>" +
                    "<td>" + pointNumber(Math.round(ww_share.total.sum / 1000) * 1000) + "</td>" +
                    "</tr></table>");

            } catch (error) {
                errorHandling(error, "setResWW");
            }
        }
    }

    /*******************************************************************************************************************************
     * Farming Village Overview
     * ----------------------------------------------------------------------------------------------------------------------------
     * | ● Color change on possibility of city festivals
     * ----------------------------------------------------------------------------------------------------------------------------
     * *****************************************************************************************************************************/

    function changeResColor() {
        var res, res_min, i = 0;
        $('#fto_town_list .fto_resource_count :last-child').reverseList().each(function () {
            if ($(this).parent().hasClass("stone")) {
                res_min = 18000;
            } else {
                res_min = 15000;
            }
            res = parseInt(this.innerHTML, 10);
            if ((res >= res_min) && !($(this).hasClass("town_storage_full"))) {
                this.style.color = '#0A0';
            }
            if (res < res_min) {
                this.style.color = '#000';
            }
        });
    }

    /********************************************************************************************************************************
     * Conquest Info
     * -----------------------------------------------------------------------------------------------------------------------------
     * | ● Amount of supports und attacks in the conquest window
     * | ● Layout adjustment (for reasons of clarity)
     * | - TODO: conquest window of own cities
     * -----------------------------------------------------------------------------------------------------------------------------
     * ******************************************************************************************************************************/

    function countMovements() {
        var sup = 0, att = 0;
        $('.tab_content #unit_movements .support').each(function () {
            sup++;
        });
        $('.tab_content #unit_movements .attack_land, .tab_content #unit_movements .attack_sea, .tab_content #unit_movements .attack_takeover').each(function () {
            att++;
        });

        var str = "<div id='move_counter' style=''><div style='float:left;margin-right:5px;'></div>" +
            "<div class='movement def'></div>" +
            "<div class='movement' style='color:green;'> " + sup + "</div>" +
            "<div class='movement off'> </div>" +
            "<div style='color:red;'> " + att + "</div></div>" +
            "<hr class='move_hr'>";

        if ($('.gpwindow_content .tab_content .bold').get(0)) {
            $('.gpwindow_content .tab_content .bold').append(str);
        } else {
            $('.gpwindow_content h4:eq(1)').append(str);

            // TODO: set player link ?
            /*
             $('#unit_movements li div').each(function(){

             //console.log(this.innerHTML);
             });
             */
        }

        $('<style id="flask_conquest"> ' +
            '.move_hr { margin:7px 0px 0px 0px; background-color:#5F5242; height:2px; border:0px solid; } ' +
            // Smaller movements
            '#unit_movements { font-size: 0.80em; } ' +
            '#unit_movements .incoming { width:150px; height:45px; float:left; } ' +
            // Counter
            '#move_counter { position:relative; width:100px; margin-top:-16px; left: 40%; } ' +
            '#move_counter .movement { float:left; margin:0px 5px 0px 0px; height:18px; width:18px; position:relative; } ' +
            '#move_counter .def { background:url(https://gp' + MID + '.innogamescdn.com/images/game/place/losts.png); background-position:0 -36px; } ' +
            '#move_counter .off { background:url(https://gp' + MID + '.innogamescdn.com/images/game/place/losts.png); background-position:0 0px; }' +
            '</style>').appendTo("head");

        /*
         $('#unit_movements div').each(function(){
         if($(this).attr('class') === "unit_movements_arrow"){
         // delete placeholder for arrow of outgoing movements (there are no outgoing movements)
         if(!this.style.background) { this.remove(); }
         } else {
         // realign texts
         $(this).css({
         margin: '3px',
         paddingLeft: '3px'
         });
         }
         });
         */
    }

    /*******************************************************************************************************************************
     * Town window
     * ----------------------------------------------------------------------------------------------------------------------------
     * | ● TownTabHandler (trade, attack, support,...)
     * | ● Sent units box
     * | ● Short duration: Display of 30% troop speed improvement in attack/support tab
     * | ● Trade options:
     * |    - Ressource marks on possibility of city festivals
     * |    - Percentual Trade: Trade button
     * |    - Recruiting Trade: Selection boxes (ressource ratio of unit type + share of the warehouse capacity of the target town)
     * ----------------------------------------------------------------------------------------------------------------------------
     *******************************************************************************************************************************/
    var arrival_interval = {};
    var hades_interval = {};
    // TODO: Change both functions in MultipleWindowHandler()
    function TownTabHandler(action) {
        var wndArray, wndID, wndA;
        wndArray = Layout.wnd.getOpen(uw.Layout.wnd.TYPE_TOWN);
        //console.log(wndArray);
        for (var e in wndArray) {
            if (wndArray.hasOwnProperty(e)) {
                //console.log(wndArray[e].getHandler());
                wndA = wndArray[e].getAction();
                wndID = "#gpwnd_" + wndArray[e].getID() + " ";
                if (!$(wndID).get(0)) {
                    wndID = "#gpwnd_" + (wndArray[e].getID() + 1) + " ";
                }
                //console.log(wndID);
                if (wndA === action) {
                    switch (action) {
                        case "trading":
                            if ($(wndID + '#trade_tab').get(0)) {
                                if (!$(wndID + '.rec_trade').get(0) && DATA.options.rec) {
                                    RecruitingTrade.add(wndID);
                                }
                                //console.log(DATA.options.per);
                                if (!$(wndID + '.btn_trade').get(0) && DATA.options.per) {
                                    addPercentTrade(wndID, false);
                                }
                            }
                            //addTradeMarks(wndID, 15, 18, 15, "red"); // town festival
                            break;
                        case "support":
                        case "attack":
                            //if(!arrival_interval[wndID]){
                            if (DATA.options.way && !($('.js-casted-powers-viewport .unit_movement_boost').get(0) || $(wndID + '.short_duration').get(0))) {
                                //if(arrival_interval[wndID]) console.log("add " + wndID);
                                Duration.add(wndID);
                            }
                            if (DATA.options.sen) {
                                SentUnits.add(wndID, action);
                            }
                            //}
                            break;
                        case "rec_mark":
                            //addTradeMarks(wndID, 15, 18, 15, "lime");
                            break;
                    }
                }
            }
        }
    }

    function WWTradeHandler() {
        var wndArray, wndID, wndA;
        wndArray = uw.GPWindowMgr.getOpen(uw.GPWindowMgr.TYPE_WONDERS);
        for (var e in wndArray) {
            if (wndArray.hasOwnProperty(e)) {
                wndID = "#gpwnd_" + wndArray[e].getID() + " ";
                if (DATA.options.per && !($(wndID + '.btn_trade').get(0) || $(wndID + '.next_building_phase').get(0) || $(wndID + '#ww_time_progressbar').get(0))) {
                    addPercentTrade(wndID, true);
                }
            }
        }
    }

    /*******************************************************************************************************************************
     * ● Sent units box
     *******************************************************************************************************************************/

    if (pName == "moonlight900") {
        var SaveError = {
            activate: () => {
                $.Observer(uw.GameEvents.command.send_unit).subscribe('FLASK_SEND_UNITS', function (e, data) {

                    // Nukopijuokite viską
                    var inputValues = $(".town_info_input").map(function () {
                        return $(this).val();
                    }).get();
                    // Įveskite viską
                    setTimeout(() => {
                        $(".town_info_input").each(function (index) {
                            $(this).val(inputValues[index]);
                        });
                    }, 200);
                });
            },
            deactivate: () => {
                $.Observer(uw.GameEvents.command.send_unit).unsubscribe('FLASK_SEND_UNITS');
            },
        }
    }

    var SentUnits = {
        activate: function () {
            $.Observer(uw.GameEvents.command.send_unit).subscribe('FLASK_SEND_UNITS', function (e, data) {
                // We handle revolt in the same pool as a regular attack & portal olympus
                if (data.sending_type === "revolt" || data.sending_type === "portal_attack_olympus") data.sending_type = "attack";
                if (data.sending_type === "portal_support_olympus") data.sending_type = "support";
                for (var z in data.params) {
                    if (data.params.hasOwnProperty(z) && (data.sending_type !== "")) {
                        if (uw.GameData.units[z]) {
                            sentUnitsArray[data.sending_type][z] = (sentUnitsArray[data.sending_type][z] == undefined ? 0 : sentUnitsArray[data.sending_type][z]);
                            sentUnitsArray[data.sending_type][z] += data.params[z];
                        }
                    }
                }
                SentUnits.update(data.sending_type);
            });
        },
        deactivate: function () {
            $.Observer(uw.GameEvents.command.send_unit).unsubscribe('FLASK_SEND_UNITS');
        },
        add: function (wndID, action) {
            if (pName == "moonlight900") {
                if (!$(wndID + ' #sav').get(0)) {
                    $(wndID + '.attack_support_window').before('<div id="sav" class="checkbox_new"><div class="cbx_icon"></div><div class="cbx_caption"></div></div>');
                }
            }
            if (!$(wndID + '.sent_units_box').get(0)) {
                $('<div class="game_inner_box sent_units_box ' + action + '"><div class="game_border ">' +
                    '<div class="game_border_top"></div><div class="game_border_bottom"></div><div class="game_border_left"></div><div class="game_border_right"></div>' +
                    '<div class="game_border_corner corner1"></div><div class="game_border_corner corner2"></div>' +
                    '<div class="game_border_corner corner3"></div><div class="game_border_corner corner4"></div>' +
                    '<div class="game_header bold">' +
                    '<div class="icon_sent townicon_' + (action == "attack" ? "lo" : "ld") + '"></div><span>' + getText("labels", "lab") + ' (' + (action == "attack" ? "OFF" : "DEF") + ')</span>' +
                    '</div>' +
                    '<div class="troops"><div class="units_list"></div><hr style="width: 172px;border: 1px solid rgb(185, 142, 93);margin: 3px 0px 2px -1px;">' +
                    '<div id="btn_sent_units_reset" class="button_new">' +
                    '<div class="left"></div>' +
                    '<div class="right"></div>' +
                    '<div class="caption js-caption">' + getText("buttons", "res") + '<div class="effect js-effect"></div></div>' +
                    '</div>' +
                    '</div></div>').appendTo(wndID + '.attack_support_window');

                SentUnits.update(action);

                $(wndID + '.icon_sent').css({
                    height: '20px',
                    marginTop: '-2px',
                    width: '20px',
                    backgroundPositionY: '-26px',
                    paddingLeft: '0px',
                    marginLeft: '0px'
                });

                $(wndID + '.sent_units_box').css({
                    position: 'absolute',
                    right: '0px',
                    top: '278px',
                    width: '192px'
                });

                $(wndID + '.troops').css({
                    padding: '6px 0px 6px 6px'
                });

                $(wndID + '#sav').css({
                    position: 'absolute',
                    bottom: '-2px'
                });

                $(wndID + '#btn_sent_units_reset').click(function () {
                    // Overwrite old array
                    sentUnitsArray[action] = {};
                    SentUnits.update(action);
                });

                $(wndID + '#sav').tooltip(flask_img + "Save sent troops (revolt, attack, support)");

                $(wndID + "#sav.checkbox_new").click(function () {
                    $(this).toggleClass("checked").toggleClass("disabled").toggleClass("green");
                    toggleActivation("sav");

                    DATA.options[this.id] = $(this).hasClass("checked");

                    saveValue("options", JSON.stringify(DATA.options));
                });

                for (var e in DATA.options) {
                    if (e === "sav") {
                        if (DATA.options.hasOwnProperty(e)) {
                            if (DATA.options[e] === true) { $(wndID + "#" + e).addClass("checked").addClass("green"); }
                            else { $("#" + e).addClass("disabled"); }
                        }
                    }
                }
            }
        },

        update: function (action) {
            try {
                // Remove old unit list
                $('.sent_units_box.' + action + ' .units_list').each(function () {
                    this.innerHTML = "";
                });
                function appendUnitIcon(unit, count) {
                    $('.sent_units_box.' + action + ' .units_list').each(function () {
                        $(this).append('<div class="unit_icon25x25 ' + unit +
                            (count >= 1000 ? (count >= 10000 ? " five_digit_number" : " four_digit_number") : "") + '">' +
                            '<span class="count text_shadow">' + count + '</span>' +
                            '</div>');
                    });
                }
                // Add new unit list
                for (var x in sentUnitsArray[action]) {
                    if (sentUnitsArray[action].hasOwnProperty(x)) {
                        if ((sentUnitsArray[action][x] || 0) > 0) {
                            appendUnitIcon(x, sentUnitsArray[action][x]);
                        }
                    }
                }
                saveValue(WID + "_sentUnits", JSON.stringify(sentUnitsArray));
            } catch (error) {
                errorHandling(error, "updateSentUnitsBox");
            }
        }
    };

    /*******************************************************************************************************************************
    * ● Short Duration
    *******************************************************************************************************************************/

    // TODO: Calculator implementieren
    var DurationCalculator = {
        activate: function () {
            var speedBoosterSprite = "https://flasktools.altervista.org/images/game/speed_booster.png";

            $('<style id="flask_duration_calculator_style">' +
                '.flask_speed_booster { border:1px solid #724B08; border-spacing: 0px;} ' +
                '.flask_speed_booster td { border:0; padding:2px; } ' +
                '.flask_speed_booster .checkbox_new { margin: 4px 0px 1px 3px; } ' +
                '.flask_speed_booster .odd { background: url("https://gp' + MID + '.innogamescdn.com/images/game/border/brown.png") repeat scroll 0% 0% transparent; } ' +
                '.flask_speed_booster .even { background: url("https://gp' + MID + '.innogamescdn.com/images/game/border/odd.png") repeat scroll 0% 0% transparent; } ' +
                '.booster_icon { width:20px; height:20px; background-image:url(' + speedBoosterSprite + ');} ' +
                '.booster_icon.improved_speed { background-position:0 0; } ' +
                '.booster_icon.cartography { background-position:-20px 0; } ' +
                '.booster_icon.meteorology { background-position:-40px 0; } ' +
                '.booster_icon.lighthouse { background-position:-60px 0; } ' +
                '.booster_icon.set_sail { background-position:-80px 0; } ' +
                '.booster_icon.atalanta { background-position:-100px 0; } ' +
                '</style>').appendTo('head');

            $('<table class="flask_speed_booster"><tr>' +
                '<td class="odd"><div class="booster_icon improved_speed"></div><div class="checkbox_new checked"><div class="cbx_icon"></div></div></td>' +
                '<td class="even"><div class="booster_icon cartography"></div><div class="checkbox_new checked"><div class="cbx_icon"></div></div></td>' +
                '<td class="odd"><div class="booster_icon meteorology"></div><div class="checkbox_new checked"><div class="cbx_icon"></div></div></td>' +
                '<td class="even"><div class="booster_icon lighthouse"></div><div class="checkbox_new checked"><div class="cbx_icon"></div></div></td>' +
                '<td class="odd"><div class="booster_icon set_sail"></div><div class="checkbox_new checked"><div class="cbx_icon"></div></div></td>' +
                '<td class="even"><div class="booster_icon atalanta"></div><div class="checkbox_new checked"><div class="cbx_icon"></div></div></td>' +
                '</tr></table>').appendTo(wndID + ".duration_container");
        },
        deactivate: function () {
            $('#flask_duration_calculator_style').remove();
        },
        add: function (wndID, data) {

        }
    };


    var Duration = {
        activate: function () {

            $('<style id="flask_short_duration_style">' +
                '.attack_support_window .tab_type_support .duration_container { top:0px !important; } ' +
                //'.attack_support_window .tab_type_attack .duration_container { width:auto; top:10px; } ' +

                '.attack_support_window .additional_info_wrapper .town_info_duration_pos { position: absolute; min-height:70px; } ' +
                '.attack_support_window .additional_info_wrapper .town_info_duration_pos_alt {min-height:70px; } ' +
                '.duration_error_text { position: absolute; } ' +
                '.attack_support_window .town_units_wrapper .units_info {min-height:20px; } ' +

                '.attack_support_window .flask_duration { border-spacing:0px; margin-bottom:2px; text-align:right; position: absolute;} ' +

                '.attack_support_window .way_duration, ' +
                '.attack_support_window .arrival_time { padding:0px 0px 0px 0px; background:none;} ' +

                '.attack_support_window .way_icon { padding:30px 0px 0px 30px; background:transparent url(https://gp' + MID + '.innogamescdn.com/images/game/towninfo/traveltime.png) no-repeat 0 0; } ' +
                '.attack_support_window .arrival_icon { padding:30px 0px 0px 30px; background:transparent url(https://gp' + MID + '.innogamescdn.com/images/game/towninfo/arrival.png) no-repeat 0 0; } ' +
                '.attack_support_window .short_icon { padding:20px 0px 0px 30px; background:url(https://flasktools.altervista.org/images/ck2c7eohpyfa3yczt.png) 11px -1px / 21px no-repeat; filter: hue-rotate(50deg); -webkit-filter: hue-rotate(50deg); } ' +
                '.attack_support_window .hades_icon { padding:20px 0px 0px 30px; background:url(https://flasktools.altervista.org/images/hades_arrival.png) 11px -1px / 18px no-repeat; filter: hue-rotate(50deg); -webkit-filter: hue-rotate(50deg); } ' +

                '.attack_support_window .max_booty { padding:0px 0px 0px 30px; margin:3px 4px 4px 4px; width:auto;  position: absolute; left: 245px; top: 28px; margin-left:14px; } ' +
                '.attack_support_window .fight_bonus.morale { margin-top:2px; position: absolute; left: 254px; top: 46px; } ' +

                '.attack_support_window .fast_boats_needed { background:transparent url(https://flasktools.altervista.org/images/4pvfuch8.png) no-repeat 0 0; padding:2px 10px 7px 24px; margin:0px 0px -8px 13px; } ' +
                '.attack_support_window .slow_boats_needed { background:transparent url(https://flasktools.altervista.org/images/b5xl8nmj.png) no-repeat 0 0; padding:2px 10px 7px 24px; margin:0px 0px -8px 13px; } ' +

                '.attack_support_window .attack_type_wrapper {top: 55px;}' +
                '.attack_support_window .send_units_form .attack_type_wrapper .attack_table_box { text-align:left;  transform:scale(0.8); margin-left: -60px;}' +
                '.attack_support_window .table_box .table_box_content .content_box { min-width:160px; }' +
                '.attack_support_window .attack_table_box .info_icon { top:0px; }' +
                '.attack_support_window .send_units_form .button_wrapper { text-align:center; padding-right:40px; position:relative; top:38px; }' +
                '.tab_type_support #btn_plan_attack_town { position: relative; top:33px; right:18px; }' +
                '.tab_type_attack #btn_plan_attack_town { position: relative; right:15px; }' +
                '.attack_support_window .tab_type_support #btn_runtime { position: relative; top:33px; right: 18px; }' +
                '.attack_support_window .tab_type_attack #btn_runtime { position: relative; right:15px; }' +
                '.attack_support_window .send_units_form .button_wrapper .button { position: relative; top:33px; right:18px; }' +
                '.attack_support_window .send_units_form .breaker { bottom:36px; }' +
                '.attack_support_window .send_units_form .button_wrapper #btn_attack_town { position: relative; right:18px; width:115px; }' +
                '.attack_support_window .send_units_form .button_wrapper #btn_attack_town .caption { font-size:13px; }' +
                '.attack_support_window .send_units_form .ng-scope { position:relative; top:35px; }' +


                '</style>').appendTo('head');

        },
        deactivate: function () {
            $("#flask_short_duration_style").remove();
            $("short_duration_row").remove();
            $("hades_duration_row").remove();
        },
        add: function (wndID) {
            //console.log($(wndID + ".duration_container").get(0));
            try {
                var tooltip = (LANG.hasOwnProperty(MID) ? getText("labels", "improved_movement") : "") + " (+30% " + DM.getl10n("barracks", "tooltips").speed.trim() + ")";
                var tooltip_2 = (LANG.hasOwnProperty(MID) ? getText("labels", "cap_of_invisibility") : "");

                if ($('.portal_duration').css('display') == 'none') {
                    $('<table class="flask_duration">' +
                        '<tr><td class="way_icon"></td><td class="flask_way"></td><td class="arrival_icon"></td><td class="flask_arrival"></td><td colspan="2" class="flask_night"></td></tr>' +
                        '<tr class="short_duration_row" style="color:darkgreen">' +
                        '<td>&nbsp;╚&gt;&nbsp;</td><td><span class="short_duration">~0:00:00</span></td>' +
                        '<td>&nbsp;&nbsp;&nbsp;╚&gt;</td><td><span class="short_arrival">~00:00:00 </span></td>' +
                        '<td class="short_icon"></td><td></td></tr>' +
                        '<tr class="hades_duration_row" style="color:darkred">' +
                        '<td>&nbsp;╚&gt;&nbsp;</td><td><span class="hades_duration">~0:00:00</span></td>' +
                        '<td>&nbsp;&nbsp;&nbsp;╚&gt;</td><td><span class="hades_visibility">~00:00:00 </span></td>' +
                        '<td class="hades_icon"></td><td></td></tr>' +
                        '</table>').prependTo(wndID + ".duration_container");



                    $(wndID + ".nightbonus").appendTo(wndID + ".flask_night");
                    $(wndID + '.way_duration').appendTo(wndID + ".flask_way");
                    $(wndID + ".arrival_time").appendTo(wndID + ".flask_arrival");
                }
                else {
                    $('<table class="flask_duration">' +
                        '<tr><td class="way_icon"></td><td class="flask_way"></td><td class="flask_portal"></td><td class="arrival_icon"></td><td class="flask_arrival" style="position:relative; right:40px;"></td><td colspan="2" class="flask_night" style="position:relative; right:40px;"></td></tr>' +
                        '<tr class="short_duration_row" style="color:darkgreen">' +
                        '<td>&nbsp;╚&gt;&nbsp;</td><td><span class="short_duration">~0:00:00</span></td>' +
                        '<td style="position:relative; right:90px;">&nbsp;&nbsp;&nbsp;╚&gt;</td><td><span class="short_arrival" style="position:relative; right:90px;">~00:00:00 </span></td>' +
                        '<td class="short_icon" style="position:relative; right:90px;"></td><td></td></tr>' +
                        '<tr class="hades_duration_row" style="color:darkred">' +
                        '<td>&nbsp;╚&gt;&nbsp;</td><td><span class="hades_duration">~0:00:00</span></td>' +
                        '<td style="position:relative; right:90px;">&nbsp;&nbsp;&nbsp;╚&gt;</td><td><span class="hades_visibility" style="position:relative; right:90px;">~00:00:00 </span></td>' +
                        '<td class="hades_icon" style="position:relative; right:90px;"></td><td></td></tr>' +
                        '</table>').prependTo(wndID + ".duration_container");
                    $('<style id="flask_short_duration_style">' +
                        '.attack_support_window .flask_duration { border-spacing:0px; margin-bottom:2px; text-align:right; position: absolute; width:max-content;} ' +
                        '</style>').appendTo('head');



                    $(wndID + ".portal_duration").appendTo(wndID + ".flask_portal");
                    $(wndID + ".nightbonus").appendTo(wndID + ".flask_night");
                    $(wndID + '.way_duration').appendTo(wndID + ".flask_way");
                    $(wndID + ".arrival_time").appendTo(wndID + ".flask_arrival");
                };



                // Tooltip
                $(wndID + '.short_duration_row').tooltip(tooltip);
                $(wndID + '.hades_duration_row').tooltip(tooltip_2);

                // Detection of changes
                Duration.change(wndID);
                // $(wndID + '.way_duration').bind('DOMSubtreeModified', function(e) { console.log(e); }); // Alternative

            } catch (error) {
                errorHandling(error, "addDuration");
            }
        },
        change: function (wndID) {
            var duration = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.addedNodes[0]) {
                        //console.debug(mutation);
                        Duration.calculate(wndID);
                    }
                });
            });
            if ($(wndID + '.way_duration').get(0)) {
                duration.observe($(wndID + '.way_duration').get(0), {
                    attributes: false,
                    childList: true,
                    characterData: false
                });
            }
        },
        //$('<style> .duration_container { display: block !important } </style>').appendTo("head");
        calculate: function (wndID) {
            //console.log(wndID);
            //console.log($(wndID + '.duration_container .way_duration').get(0));
            try {
                var setup_time = 900 / Game.game_speed,
                    duration_time = $(wndID + '.duration_container .way_duration').get(0).innerHTML.replace("~", "").split(":"),
                    // TODO: hier tritt manchmal Fehler auf TypeError: Cannot read property "innerHTML" of undefined at calcDuration (<anonymous>:3073:86)
                    duration_time_2,
                    duration_time_3,
                    arrival_time,
                    visibility_time,
                    h, m, s,
                    atalanta_factor = 0;

                var hasCartography = ITowns.getTown(Game.townId).getResearches().get("cartography");
                var hasMeteorology = ITowns.getTown(Game.townId).getResearches().get("meteorology");
                var hasSetSail = ITowns.getTown(Game.townId).getResearches().get("set_sail");

                var hasLighthouse = ITowns.getTown(Game.townId).buildings().get("lighthouse");

                // Atalanta aktiviert?
                if ($(wndID + '.unit_container.heroes_pickup .atalanta').get(0)) {
                    if ($(wndID + '.cbx_include_hero').hasClass("checked")) {
                        // Beschleunigung hÃ¤ngt vom Level ab, Level 1 = 11%, Level 20 = 30%
                        var atalanta_level = MM.getCollections().PlayerHero[0].getHero("atalanta").get("level");

                        atalanta_factor = (atalanta_level + 10) / 100;
                    }
                }

                // Sekunden, Minuten und Stunden zusammenrechnen (-> in Sekunden)
                duration_time = ((parseInt(duration_time[0], 10) * 60 + parseInt(duration_time[1], 10)) * 60 + parseInt(duration_time[2], 10));

                // Verkürzte Laufzeit berechnen
                duration_time_2 = ((duration_time - setup_time) * (1 + atalanta_factor)) / (1 + 0.3 + atalanta_factor) + setup_time;
                duration_time_3 = (duration_time - setup_time) / 10;


                h = Math.floor(duration_time_2 / 3600);
                m = Math.floor((duration_time_2 - h * 3600) / 60);
                s = Math.floor(duration_time_2 - h * 3600 - m * 60);

                if (m < 10) {
                    m = "0" + m;
                }
                if (s < 10) {
                    s = "0" + s;
                }

                $(wndID + '.short_duration').get(0).innerHTML = "~" + h + ":" + m + ":" + s;

                h = Math.floor(duration_time_3 / 3600);
                m = Math.floor((duration_time_3 - h * 3600) / 60);
                s = Math.floor(duration_time_3 - h * 3600 - m * 60);

                if (m < 10) {
                    m = "0" + m;
                }
                if (s < 10) {
                    s = "0" + s;
                }

                $(wndID + '.hades_duration').get(0).innerHTML = "~" + h + ":" + m + ":" + s;

                // Ankunftszeit errechnen
                arrival_time = Math.round((Timestamp.server() + Game.server_gmt_offset)) + duration_time_2;
                visibility_time = Math.round((Timestamp.server() + Game.server_gmt_offset)) + duration_time_3;

                h = Math.floor(arrival_time / 3600);
                m = Math.floor((arrival_time - h * 3600) / 60);
                s = Math.floor(arrival_time - h * 3600 - m * 60);

                h %= 24;

                if (m < 10) {
                    m = "0" + m;
                }
                if (s < 10) {
                    s = "0" + s;
                }

                $(wndID + '.short_arrival').get(0).innerHTML = "~" + h + ":" + m + ":" + s;

                clearInterval(arrival_interval[wndID]);

                arrival_interval[wndID] = setInterval(function () {
                    arrival_time += 1;

                    h = Math.floor(arrival_time / 3600);
                    m = Math.floor((arrival_time - h * 3600) / 60);
                    s = Math.floor(arrival_time - h * 3600 - m * 60);

                    h %= 24;

                    if (m < 10) {
                        m = "0" + m;
                    }
                    if (s < 10) {
                        s = "0" + s;
                    }

                    if ($(wndID + '.short_arrival').get(0)) {
                        $(wndID + '.short_arrival').get(0).innerHTML = "~" + h + ":" + m + ":" + s;
                    } else {
                        clearInterval(arrival_interval[wndID]);
                    }
                }, 1000);

                h = Math.floor(visibility_time / 3600);
                m = Math.floor((visibility_time - h * 3600) / 60);
                s = Math.floor(visibility_time - h * 3600 - m * 60);

                h %= 24;

                if (m < 10) {
                    m = "0" + m;
                }
                if (s < 10) {
                    s = "0" + s;
                }

                $(wndID + '.hades_visibility').get(0).innerHTML = "~" + h + ":" + m + ":" + s;

                clearInterval(hades_interval[wndID]);

                hades_interval[wndID] = setInterval(function () {
                    visibility_time += 1;

                    h = Math.floor(visibility_time / 3600);
                    m = Math.floor((visibility_time - h * 3600) / 60);
                    s = Math.floor(visibility_time - h * 3600 - m * 60);

                    h %= 24;

                    if (m < 10) {
                        m = "0" + m;
                    }
                    if (s < 10) {
                        s = "0" + s;
                    }

                    if ($(wndID + '.hades_visibility').get(0)) {
                        $(wndID + '.hades_visibility').get(0).innerHTML = "~" + h + ":" + m + ":" + s;
                    } else {
                        clearInterval(hades_interval[wndID]);
                    }
                }, 1000);

            } catch (error) {
                errorHandling(error, "Duration.calculate");
            }
        }
    };

    /*******************************************************************************************************************************
     * ●  Dropdown menu
     *******************************************************************************************************************************/

    // TODO: Umstellen!
    // Preload images for drop down arrow buttons
    var drop_over = new Image();
    drop_over.src = "https://flasktools.altervista.org/images/hna95u8a.png";
    var drop_out = new Image();
    drop_out.src = "https://flasktools.altervista.org/images/ppsz5mxk.png";

    function changeDropDownButton() {
        $('<style id="flask_style_arrow" type="text/css">' +
            '#dd_filter_type .arrow, .select_rec_unit .arrow {' +
            'width: 18px !important; height: 17px !important; background: url("https://flasktools.altervista.org/images/ppsz5mxk.png") no-repeat 0px -1px !important;' +
            'position: absolute; top: 2px !important; right: 3px; } ' +
            '</style>').appendTo('head');

    }

    /*******************************************************************************************************************************
     * ●  Recruiting Trade
     * *****************************************************************************************************************************/
    var trade_count = 0, unit = "FS", percent = "0.0"; // Recruiting Trade

    // TODO: Funktion umformen, Style anpassen!
    var RecruitingTrade = {
        activate: function () {
            $('<style id="flask_style_recruiting_trade" type="text/css">' +
                '#trade_tab #trade .resource_selector { width:60px; margin-left: 40px; } ' +
                '.resource_selector .icon.wood {margin-right:-3px;}' +
                '.resource_selector .icon.stone {margin-right:-3px;}' +
                '.resource_selector .icon.iron {margin-right:-3px;}' +
                '.resource_selector #trade_type_wood {margin-left:5px;}' +
                '.resource_selector #trade_type_stone {margin-left:5px;}' +
                '.resource_selector #trade_type_iron {margin-left:5px;}' +

                '#trade_tab #unit_order_booty {left:50px;}' +

                '#flask_recruiting_trade .option_s { filter:grayscale(100%); -webkit-filter:grayscale(100%); margin:0px; cursor:pointer; } ' +
                '#flask_recruiting_trade .option_s:hover { filter:unset !important; -webkit-filter:unset !important; } ' +
                '#flask_recruiting_trade .select_rec_unit .sel { filter:sepia(100%); -webkit-filter:sepia(100%); } ' +

                '#flask_recruiting_trade .option {color:#000; background:#FFEEC7; } ' +
                '#flask_recruiting_trade .option:hover {color:#fff; background:#328BF1; } ' +

                '#flask_recruiting_trade { position:absolute; left:20px; top:70px; } ' +
                '#flask_recruiting_trade .select_rec_unit { position:absolute; top:20px; width:84px; display:none; } ' +
                '#flask_recruiting_trade .select_rec_perc { position:absolute; top:20px; width:50px; display:none; left:50px; } ' +

                '#flask_recruiting_trade .open { display:block !important; } ' +

                '#flask_recruiting_trade .item-list { max-height:unset; } ' +

                '#flask_recruiting_trade .arrow { width:18px; height:18px; background:url(' + drop_out.src + ') no-repeat -1px -1px; position:absolute; } ' +

                '#trade_tab .content { height:320px;  } ' +

                '#flask_recruiting_trade .rec_count { position:absolute; top:25px; left:-15px } ' +

                '#flask_recruiting_trade .drop_rec_unit { position:absolute; display:block; width:50px; overflow:visible; left:-18px;} ' +
                '#flask_recruiting_trade .drop_rec_perc { position:absolute; display:block; width:55px; left:31px; color:#000; } ' +

                '</style>').appendTo('head');
        },
        deactivate: function () {
            $('#flask_style_recruiting_trade').remove();
        },
        add: function (wndID) {
            var max_amount;

            $('<div id="flask_recruiting_trade" class="rec_trade">' +
                // DropDown-Button for unit
                '<div class="drop_rec_unit dropdown default">' +
                '<div class="border-left"></div>' +
                '<div class="border-right"></div>' +
                '<div class="caption" name="' + unit + '">' + unit + '</div>' +
                '<div class="arrow"></div>' +
                '</div>' +
                '<div class="drop_rec_perc dropdown default">' +
                // DropDown-Button for ratio
                '<div class="border-left"></div>' +
                '<div class="border-right"></div>' +
                '<div class="caption" name="' + percent + '">' + (percent == "auto" ? "auto" : `${Math.round(percent * 100)}%`) + '</div>' +
                '<div class="arrow"></div>' +
                '</div><span class="rec_count">(' + trade_count + ')</span></div>').appendTo(wndID + ".content");

            // Select boxes for unit and ratio
            $('<div class="select_rec_unit dropdown-list default active">' +
                '<div class="item-list">' +
                '<div class="option_s unit index_unit unit_icon40x40 attack_ship" name="FS"></div>' +
                '<div class="option_s unit index_unit unit_icon40x40 bireme" name="BI"></div>' +
                '<div class="option_s unit index_unit unit_icon40x40 trireme" name="TR"></div>' +
                '<div class="option_s unit index_unit unit_icon40x40 small_transporter" name="ST"></div>' +
                '<div class="option_s unit index_unit unit_icon40x40 sword" name="SK"></div>' +
                '<div class="option_s unit index_unit unit_icon40x40 slinger" name="SL"></div>' +
                '<div class="option_s unit index_unit unit_icon40x40 archer" name="BS"></div>' +
                '<div class="option_s unit index_unit unit_icon40x40 hoplite" name="HO"></div>' +
                '<div class="option_s unit index_unit unit_icon40x40 rider" name="RE"></div>' +
                '<div class="option_s unit index_unit unit_icon40x40 chariot" name="SW"></div>' +
                '<div class="option_s unit index_unit place_image wall_level" name="WA"></div>' +
                '<div class="option_s unit index_unit research_icon research espionage" name="IR" style="bottom: 47px;transform: scale(0.8);left: 37px;"></div>' +
                '</div></div>').appendTo(wndID + ".rec_trade");
            $('<div class="select_rec_perc dropdown-list default inactive">' +
                '<div class="item-list">' +
                '<div class="option sel" name="0.0">&nbsp;&nbsp;0%</div>' +
                '<div class="option" name="0.05">5%</div>' +
                '<div class="option" name="0.1">10%</div>' +
                '<div class="option" name="0.15">15%</div>' +
                '<div class="option" name="0.16666">17%</div>' +
                '<div class="option" name="0.2">20%</div>' +
                '<div class="option" name="0.25">25%</div>' +
                '<div class="option" name="0.33">33%</div>' +
                '<div class="option" name="0.5">50%</div>' +
                '<div class="option" name="1.0">100%</div>' +
                '<div class="option" name="auto">auto</div>' +
                '</div></div>').appendTo(wndID + ".rec_trade");

            $(wndID + ".rec_trade [name='" + unit + "']").toggleClass("sel");

            // click events of the drop menu
            $(wndID + ' .select_rec_unit .option_s').each(function () {
                $(this).click(function (e) {
                    $(".select_rec_unit .sel").toggleClass("sel");
                    $("." + this.className.split(" ")[4]).toggleClass("sel");

                    unit = $(this).attr("name");
                    $('.drop_rec_unit .caption').attr("name", unit);
                    $('.drop_rec_unit .caption').each(function () {
                        this.innerHTML = unit;
                    });
                    $($(this).parent().parent().get(0)).removeClass("open");
                    $('.drop_rec_unit .caption').change();
                });
            });
            $(wndID + ' .select_rec_perc .option').each(function () {
                $(this).click(function (e) {
                    $(this).parent().find(".sel").toggleClass("sel");
                    $(this).toggleClass("sel");

                    percent = $(this).attr("name");
                    $('.drop_rec_perc .caption').attr("name", percent);
                    $('.drop_rec_perc .caption').each(function () {
                        if (percent === "auto") this.innerHTML = "auto";
                        else this.innerHTML = Math.round(percent * 100) + "%";
                    });
                    $($(this).parent().parent().get(0)).removeClass("open")
                    $('.drop_rec_perc .caption').change();
                });
            });

            // show & hide drop menus on click
            $(wndID + '.drop_rec_perc').click(function (e) {

                if (!$($(e.target)[0].parentNode.parentNode.childNodes[4]).hasClass("open")) {
                    $($(e.target)[0].parentNode.parentNode.childNodes[4]).addClass("open");
                    $($(e.target)[0].parentNode.parentNode.childNodes[3]).removeClass("open");
                } else {
                    $($(e.target)[0].parentNode.parentNode.childNodes[4]).removeClass("open");
                }
            });
            $(wndID + '.drop_rec_unit').click(function (e) {

                if (!$($(e.target)[0].parentNode.parentNode.childNodes[3]).hasClass("open")) {
                    $($(e.target)[0].parentNode.parentNode.childNodes[3]).addClass("open");
                    $($(e.target)[0].parentNode.parentNode.childNodes[4]).removeClass("open");
                } else {
                    $($(e.target)[0].parentNode.parentNode.childNodes[3]).removeClass("open");
                }
            });

            $(wndID).click(function (e) {
                var clicked = $(e.target), element = $('#' + this.id + ' .dropdown-list.open').get(0);
                if ((clicked[0].parentNode.className.split(" ")[1] !== "dropdown") && element) {
                    $(element).removeClass("open");
                }
            });

            // hover arrow change
            $(wndID + '.dropdown').hover(function (e) {
                $(e.target)[0].parentNode.childNodes[3].style.background = "url('" + drop_over.src + "') no-repeat -1px -1px";
            }, function (e) {
                $(e.target)[0].parentNode.childNodes[3].style.background = "url('" + drop_out.src + "') no-repeat -1px -1px";
            });

            $(wndID + ".drop_rec_unit .caption").attr("name", unit);
            $(wndID + ".drop_rec_perc .caption").attr("name", percent);

            $(wndID + '.drop_rec_unit').tooltip(getText("labels", "rat"));
            $(wndID + '.drop_rec_perc').tooltip(getText("labels", "shr"));

            var ratio = {
                NO: { w: 0, s: 0, i: 0 },
                FS: { w: 1, s: 0.2308, i: 0.6154 },
                BI: { w: 1, s: 0.8750, i: 0.2250 },
                TR: { w: 1, s: 0.65, i: 0.65 },
                ST: { w: 1, s: 0, i: 0.5 },
                SL: { w: 0.55, s: 1, i: 0.4 },
                RE: { w: 0.6666, s: 0.3333, i: 1 },
                SK: { w: 1, s: 0, i: 0.8947 },
                HO: { w: 0, s: 0.5, i: 1 },
                BS: { w: 1, s: 0, i: 0.6250 },
                SW: { w: 0.4545, s: 1, i: 0.7273 },
                WA: { w: 0, s: 1, i: 0.70 },
                IR: { w: 0, s: 0, i: 1 }
            };


            if ($('#town_capacity_wood .max').get(0)) {
                max_amount = parseInt($('#town_capacity_wood .max').get(0).innerHTML, 10);
            } else {
                max_amount = 30600;
            }

            $(wndID + '.caption').change(function (e) {
                let wood, stone, iron;
                if (percent === "auto") {
                    let town = uw.ITowns.getTown(uw.Game.townId);

                    const getCountWithTrade = (troop) => {
                        let resources = town.resources();
                        let d_wood = resources.wood / ratio[unit].w;
                        let d_stone = resources.stone / ratio[unit].s;
                        let d_iron = resources.iron / ratio[unit].i;
                        let min_resouces = Math.min(d_wood, d_stone, d_iron); // min ammount

                        let trade = town.getAvailableTradeCapacity();
                        let max_trade = trade / (ratio[unit].w + ratio[unit].s + ratio[unit].i) // max tradable

                        console.log("max_duable", min_resouces)
                        console.log("max_trade", max_trade)
                        if (max_trade < min_resouces) return max_trade;
                        else return min_resouces;
                    }

                    let rArray = town.getCurrentResources();
                    let tradeCapacity = town.getAvailableTradeCapacity();
                    let min = getCountWithTrade()

                    wood = ratio[unit].w * min;
                    stone = ratio[unit].s * min;
                    iron = ratio[unit].i * min;

                } else {
                    //console.log($(this).attr('name') + ", " + unit + "; " + percent);
                    if (!(($(this).attr('name') === unit) || ($(this).attr('name') === percent))) {
                        //trade_count = 0;
                        $('.rec_count').get(0).innerHTML = "(" + trade_count + ")";
                    }

                    var tmp = $(this).attr('name');

                    if ($(this).parent().attr('class').split(" ")[0] === "drop_rec_unit") {
                        unit = tmp;
                    } else {
                        percent = tmp;
                    }
                    var max = (max_amount - 100) / 1000;
                    addTradeMarks(max * ratio[unit].w, max * ratio[unit].s, max * ratio[unit].i, "lime");

                    var part = (max_amount - 1000) * parseFloat(percent); // -1000 als Puffer (sonst Ãœberlauf wegen Restressies, die nicht eingesetzt werden kÃ¶nnen, vorallem bei FS und Biremen)
                    var rArray = uw.ITowns.getTown(uw.Game.townId).getCurrentResources();
                    var tradeCapacity = uw.ITowns.getTown(uw.Game.townId).getAvailableTradeCapacity();

                    wood = ratio[unit].w * part;
                    stone = ratio[unit].s * part;
                    iron = ratio[unit].i * part;

                    if ((wood > rArray.wood) || (stone > rArray.stone) || (iron > rArray.iron) || ((wood + stone + iron) > tradeCapacity)) {
                        wood = stone = iron = 0;
                        $('.drop_rec_perc .caption').css({ color: '#f00' });
                        //$('.' + e.target.parentNode.parentNode.className + ' .select_rec_perc .sel').css({color:'#f00'});
                        //$('.select_rec_perc .sel').css({color:'#f00'});
                    } else {
                        $('.' + e.target.parentNode.parentNode.className + ' .drop_rec_perc .caption').css({ color: '#000' });
                    }
                }
                // Update the count in gui
                $("#trade_type_wood [type='text']").select().val(wood).blur();
                $("#trade_type_stone [type='text']").select().val(stone).blur();
                $("#trade_type_iron [type='text']").select().val(iron).blur();
            });

            $('#trade_button').click(function () {
                trade_count++;
                $('.rec_count').get(0).innerHTML = "(" + trade_count + ")";

            });

            $(wndID + '.drop_rec_perc .caption').change();
        }
    };

    /*******************************************************************************************************************************
     * ●  Ressources marks
     *******************************************************************************************************************************/
    function addTradeMarks(woodmark, stonemark, ironmark, color) {
        var max_amount, limit, wndArray = uw.GPWindowMgr.getOpen(uw.Layout.wnd.TYPE_TOWN), wndID;
        for (var e in wndArray) {
            if (wndArray.hasOwnProperty(e)) {
                wndID = "#gpwnd_" + wndArray[e].getID() + " ";
                if ($(wndID + '.town-capacity-indicator').get(0)) {

                    max_amount = $(wndID + '.amounts .max').get(0).innerHTML;

                    $('#trade_tab .c_' + color).each(function () {
                        this.remove();
                    });
                    $('#trade_tab .progress').each(function () {
                        if ($("p", this).length < 3) {
                            if ($(this).parent().get(0).id != "big_progressbar") {
                                limit = 1000 * (242 / parseInt(max_amount, 10));

                                switch ($(this).parent().get(0).id.split("_")[2]) {
                                    case "wood":
                                        limit = limit * woodmark;
                                        break;
                                    case "stone":
                                        limit = limit * stonemark;
                                        break;
                                    case "iron":
                                        limit = limit * ironmark;
                                        break;
                                }
                                $('<p class="c_' + color + '"style="position:absolute;left: ' + limit + 'px; background:' + color + ';width:2px;height:100%;margin:0px"></p>').appendTo(this);
                            }
                        }
                    });
                }
            }
        }
    }

    /*******************************************************************************************************************************
     * ●  Percentual Trade
     *******************************************************************************************************************************/
    var rest_count = 0;

    function addPercentTrade(wndID, ww) {

        var a = "";
        var content = wndID + ".content";
        if (ww) {
            a = "ww_";
            content = wndID + '.trade .send_res';
        }
        $('<div class="btn btn_trade"><a class="button" href="#">' +
            '<span class="left"><span class="right">' +
            '<span class="middle mid">' +
            '<span class="img_trade"></span></span></span></span>' +
            '<span style="clear:both;"></span>' +
            '</a></div>').prependTo(content);

        $(wndID + '.btn_trade').tooltip(getText("labels", "per"));

        setPercentTrade(wndID, ww);

        // Style
        $(wndID + '.btn').css({ width: '20px', overflow: 'visible', position: 'absolute', display: 'block' });

        if (!ww) {
            $(wndID + '.content').css({ height: '320px' });
        }

        if (ww) {
            $(wndID + '.btn_trade').css({ left: '678px', top: '154px' });
        } else {
            $(wndID + '.btn_trade').css({ left: '333px', top: '128px' });
        }

        $(wndID + '.mid').css({ minWidth: '26px' });

        $(wndID + '.img_trade').css({
            width: '27px',
            height: '27px',
            top: '-3px',
            float: 'left',
            position: 'relative',
            background: 'url("https://flasktools.altervista.org/images/cjq6d72qk521ig1zz.png") no-repeat'
        });

    }

    var res = {};

    function setPercentTrade(wndID, ww) {
        var a = ww ? "ww_" : "", own_town = $(wndID + '.town_info').get(0) ? true : false;

        $(wndID + '.btn_trade').toggleClick(function () {
            res.wood = {};
            res.stone = {};
            res.iron = {};
            res.sum = {};

            res.sum.amount = 0;
            // Set amount of resources to 0
            setAmount(true, a, wndID);
            // Total amount of resources // TODO: ITowns.getTown(Game.townId).getCurrentResources(); ?
            for (var e in res) {
                if (res.hasOwnProperty(e) && e != "sum") {
                    res[e].rest = false;
                    res[e].amount = parseInt($('.ui_resources_bar .' + e + ' .amount').get(0).innerHTML, 10);
                    res.sum.amount += res[e].amount;
                }
            }
            // Percentage of total resources
            res.wood.percent = 100 / res.sum.amount * res.wood.amount;
            res.stone.percent = 100 / res.sum.amount * res.stone.amount;
            res.iron.percent = 100 / res.sum.amount * res.iron.amount;

            // Total trading capacity
            res.sum.cur = parseInt($(wndID + '#' + a + 'big_progressbar .caption .curr').get(0).innerHTML, 10);

            // Amount of resources on the percentage of trading capacity (%)
            res.wood.part = parseInt(res.sum.cur / 100 * res.wood.percent, 10);
            res.stone.part = parseInt(res.sum.cur / 100 * res.stone.percent, 10);
            res.iron.part = parseInt(res.sum.cur / 100 * res.iron.percent, 10);

            // Get rest warehouse capacity of each resource type
            for (var f in res) {
                if (res.hasOwnProperty(f) && f != "sum") {
                    if (!ww && own_town) { // Own town
                        var curr = parseInt($(wndID + '#town_capacity_' + f + ' .amounts .curr').get(0).innerHTML.replace('+', '').trim(), 10) || 0,
                            curr2 = parseInt($(wndID + '#town_capacity_' + f + ' .amounts .curr2').get(0).innerHTML.replace('+', '').trim(), 10) || 0,
                            max = parseInt($(wndID + '#town_capacity_' + f + ' .amounts .max').get(0).innerHTML.replace('+', '').trim(), 10) || 0;

                        res[f].cur = curr + curr2;
                        res[f].max = max - res[f].cur;

                        if (res[f].max < 0) {
                            res[f].max = 0;
                        }

                    } else { // World wonder or foreign town
                        res[f].max = 30000;
                    }
                }
            }
            // Rest of fraction (0-2 units) add to stone amount
            res.stone.part += res.sum.cur - (res.wood.part + res.stone.part + res.iron.part);

            res.sum.rest = 0;
            rest_count = 0;
            calcRestAmount();
            setAmount(false, a, wndID);
        }, function () {
            setAmount(true, a, wndID);
        });
    }

    function calcRestAmount() {
        // Subdivide rest
        if (res.sum.rest > 0) {
            for (var e in res) {
                if (res.hasOwnProperty(e) && e != "sum" && res[e].rest != true) {
                    res[e].part += res.sum.rest / (3 - rest_count);
                }
            }
            res.sum.rest = 0;
        }
        // Calculate new rest
        for (var f in res) {
            if (res.hasOwnProperty(f) && f != "sum" && res[f].rest != true) {
                if (res[f].max <= res[f].part) {
                    res[f].rest = true;
                    res.sum.rest += res[f].part - res[f].max;
                    rest_count += 1;
                    res[f].part = res[f].max;
                }
            }
        }
        // Recursion
        if (res.sum.rest > 0 && rest_count < 3) {
            calcRestAmount();
        }
    }

    function setAmount(clear, a, wndID) {
        for (var e in res) {
            if (res.hasOwnProperty(e) && e != "sum") {
                if (clear == true) {
                    res[e].part = 0;
                }
                $(wndID + "#" + a + "trade_type_" + e + ' [type="text"]').select().val(res[e].part).blur();
            }
        }
    }

    /********************************************************************************************************************************
     * Unit strength (blunt/sharp/distance) and Transport Capacity
     * ----------------------------------------------------------------------------------------------------------------------------
     * | ●  Unit strength: Menu
     * |	- Switching of def/off display with buttons
     * |	- Possible Selection of certain unit types
     * | ●  Unit strength: Conquest
     * | ●  Unit strength: Barracks
     * | ●  Transport capacity: Menu
     * |	- Switching of transporter speed (+/- big transporter)
     * ----------------------------------------------------------------------------------------------------------------------------
     * ******************************************************************************************************************************/

    var def = true, blunt = 0, sharp = 0, dist = 0, shipsize = false;

    var UnitStrength = {
        // Calculate defensive strength
        calcDef: function (units) {
            var e;
            blunt = sharp = dist = 0;
            for (e in units) {
                if (units.hasOwnProperty(e)) {
                    blunt += units[e] * uw.GameData.units[e].def_hack;
                    sharp += units[e] * uw.GameData.units[e].def_pierce;
                    dist += units[e] * uw.GameData.units[e].def_distance;
                }
            }
        },
        // Calculate offensive strength
        calcOff: function (units, selectedUnits) {
            var e;
            blunt = sharp = dist = 0;
            for (e in selectedUnits) {
                if (selectedUnits.hasOwnProperty(e)) {
                    var attack = (units[e] || 0) * uw.GameData.units[e].attack;
                    switch (uw.GameData.units[e].attack_type) {
                        case 'hack':
                            blunt += attack;
                            break;
                        case 'pierce':
                            sharp += attack;
                            break;
                        case 'distance':
                            dist += attack;
                            break;
                    }
                }
            }
        },
        /*******************************************************************************************************************************
         * ●  Unit strength: Unit menu
         *******************************************************************************************************************************/
        Menu: {
            activate: function () {
                $('<div id="strength" class="cont def"><hr>' +
                    '<span class="bold text_shadow cont_left strength_font">' +
                    '<table style="margin:0px;">' +
                    '<tr><td><div class="ico units_info_sprite img_hack"></td><td id="blunt">0</td></tr>' +
                    '<tr><td><div class="ico units_info_sprite img_pierce"></td><td id="sharp">0</td></tr>' +
                    '<tr><td><div class="ico units_info_sprite img_dist"></td><td id="dist">0</td></tr>' +
                    '</table>' +
                    '</span>' +
                    '<div class="cont_right">' +
                    '<img id="def_button" class="active img" src="https://gp' + MID + '.innogamescdn.com/images/game/unit_overview/support.png">' +
                    '<img id="off_button" class="img" src="https://gp' + MID + '.innogamescdn.com/images/game/unit_overview/attack.png">' +
                    '</div></div>').appendTo('.units_land .content');

                // Style
                $('<style id="flask_strength_style">' +
                    '#strength.def #off_button, #strength.off #def_button { filter:url(#Sepia); -webkit-filter:sepia(1); }' +
                    '#strength.off #off_button, #strength.def #def_button { filter:none; -webkit-filter:none; } ' +

                    '#strength.off .img_hack { background-position:0% 36%;} ' +
                    '#strength.def .img_hack { background-position:0%  0%;} ' +
                    '#strength.off .img_pierce { background-position:0% 27%;} ' +
                    '#strength.def .img_pierce { background-position:0%  9%;} ' +
                    '#strength.off .img_dist { background-position:0% 45%;} ' +
                    '#strength.def .img_dist { background-position:0% 18%;} ' +

                    '#strength .strength_font { font-size: 0.8em; } ' +
                    '#strength.off .strength_font { color:#edb;} ' +
                    '#strength.def .strength_font { color:#fc6;} ' +

                    '#strength .ico { height:20px; width:20px; } ' +
                    '#strength .units_info_sprite { background:url(https://gp' + MID + '.innogamescdn.com/images/game/units/units_info_sprite2.51.png); background-size:100%; } ' +

                    '#strength .img_pierce { background-position:0px -20px; } ' +
                    '#strength .img_dist { background-position:0px -40px; } ' +
                    '#strength hr { margin:0px; background-color:#5F5242; height:2px; border:0px solid; } ' +
                    '#strength .cont_left { width:65%;  display:table-cell; } ' +

                    '#strength.cont { background:url(https://gp' + MID + '.innogamescdn.com/images/game/layout/layout_units_nav_border.png); } ' +

                    '#strength .cont_right { width:30%; display:table-cell; vertical-align:middle; } ' +
                    '#strength .img { float:right; background:none; margin:2px 8px 2px 0px; } ' +

                    '</style>').appendTo("head");

                // Button events
                $('.units_land .units_wrapper, .checked').click(function () {
                    setTimeout(function () {
                        UnitStrength.Menu.update();
                    }, 100);
                });

                $('#off_button').click(function () {
                    $('#strength').addClass('off').removeClass('def');

                    def = false;
                    UnitStrength.Menu.update();
                });
                $('#def_button').click(function () {
                    $('#strength').addClass('def').removeClass('off');

                    def = true;
                    UnitStrength.Menu.update();
                });
                $('#def_button, #off_button').hover(function () {
                    $(this).css('cursor', 'pointer');
                });

                UnitStrength.Menu.update();
            },
            deactivate: function () {
                $('#strength').remove();
                $('#flask_strength_style').remove();
            },
            update: function () {
                var unitsIn = uw.ITowns.getTown(uw.Game.townId).units(), units = UnitStrength.Menu.getSelected();

                // Calculation
                if (def === true) {
                    UnitStrength.calcDef(units);
                } else {
                    UnitStrength.calcOff(unitsIn, units);
                }
                $('#blunt').get(0).innerHTML = blunt;
                $('#sharp').get(0).innerHTML = sharp;
                $('#dist').get(0).innerHTML = dist;
            },
            getSelected: function () {
                var units = [];
                if ($(".units_land .units_wrapper .selected").length > 0) {
                    $(".units_land .units_wrapper .selected").each(function () {
                        units[this.className.split(" ")[1]] = this.children[0].innerHTML;
                    });
                } else {
                    $(".units_land .units_wrapper .unit").each(function () {
                        units[this.className.split(" ")[1]] = this.children[0].innerHTML;
                    });
                }
                return units;
            }
        },
        /*******************************************************************************************************************************
         * ●  Unit strength: Conquest
         *******************************************************************************************************************************/
        Conquest: {
            add: function () {
                var units = [], str;

                // units of the siege
                $('#conqueror_units_in_town .unit').each(function () {
                    str = $(this).attr("class").split(" ")[4];
                    if (!uw.GameData.units[str].is_naval) {
                        units[str] = parseInt(this.children[0].innerHTML, 10);
                        //console.log($(this).attr("class").split(" ")[4]);
                    }
                });
                // calculation
                UnitStrength.calcDef(units);

                $('<div id="strength_eo" class="game_border" style="width:90px; margin: 20px; align:center;">' +
                    '<div class="game_border_top"></div><div class="game_border_bottom"></div>' +
                    '<div class="game_border_left"></div><div class="game_border_right"></div>' +
                    '<div class="game_border_corner corner1"></div><div class="game_border_corner corner2"></div>' +
                    '<div class="game_border_corner corner3"></div><div class="game_border_corner corner4"></div>' +
                    '<span class="bold" style="color:#000;font-size: 0.8em;"><table style="margin:0px;background:#f7dca2;width:100%;align:center;">' +
                    '<tr><td width="1%"><div class="ico units_info_sprite img_hack"></div></td><td id="bl" align="center" width="100%">0</td></tr>' +
                    '<tr><td><div class="ico units_info_sprite img_pierce"></div></td><td id="sh" align="center">0</td></tr>' +
                    '<tr><td><div class="ico units_info_sprite img_dist"></div></td><td id="di" align="center">0</td></tr>' +
                    '</table></span>' +
                    '</div>').appendTo('#conqueror_units_in_town');

                $('#strength_eo').tooltip('GesamteinheitenstÃ¤rke der Belagerungstruppen');

                // VerÃ¶ffentlichung-Button-Text
                $('#conqueror_units_in_town .publish_conquest_public_id_wrap').css({
                    marginLeft: '130px'
                });

                $('#strength_eo .ico').css({
                    height: '20px',
                    width: '20px'
                });
                $('#strength_eo .units_info_sprite').css({
                    background: 'url(https://gp' + MID + '.innogamescdn.com/images/game/units/units_info_sprite2.51.png)',
                    backgroundSize: '100%'
                });
                $('#strength_eo .img_pierce').css({ backgroundPosition: '0% 9%' });
                $('#strength_eo .img_dist').css({ backgroundPosition: '0% 18%' });


                $('#bl').get(0).innerHTML = blunt;
                $('#sh').get(0).innerHTML = sharp;
                $('#di').get(0).innerHTML = dist;
            }
        },
        /*******************************************************************************************************************************
         * ●  Unit strength: Barracks
         *******************************************************************************************************************************/
        Barracks: {
            add: function () {
                if (!$('#strength_baracks').get(0)) {
                    var units = [], pop = 0;

                    // whole units of the town
                    $('#units .unit_order_total').each(function () {
                        units[$(this).parent().parent().attr("id")] = this.innerHTML;
                    });
                    // calculation
                    UnitStrength.calcDef(units);

                    // population space of the units
                    for (var e in units) {
                        if (units.hasOwnProperty(e)) {
                            pop += units[e] * uw.GameData.units[e].population;
                        }
                    }
                    $('<div id="strength_baracks" class="game_border" style="float:right; width:70px; top:-8px;">' +
                        '<div class="game_border_top"></div><div class="game_border_bottom"></div>' +
                        '<div class="game_border_left"></div><div class="game_border_right"></div>' +
                        '<div class="game_border_corner corner1"></div><div class="game_border_corner corner2"></div>' +
                        '<div class="game_border_corner corner3"></div><div class="game_border_corner corner4"></div>' +
                        '<span class="bold" style="color:#000;font-size: 0.8em;"><table style="margin:0px;background:#f7dca2;width:100%;align:center;">' +
                        '<tr><td width="1%"><div class="ico units_info_sprite img_hack"></div></td><td id="b" align="center" width="100%">0</td></tr>' +
                        '<tr><td><div class="ico units_info_sprite img_pierce"></div></td><td id="s" align="center">0</td></tr>' +
                        '<tr><td><div class="ico units_info_sprite img_dist"></div></td><td id="d" align="center">0</td></tr>' +
                        '</table></span>' +
                        '</div>').appendTo('.ui-dialog #units');

                    $('<div id="pop_baracks" class="game_border" style="float:right; width:60px; top:-8px;">' +
                        '<div class="game_border_top"></div><div class="game_border_bottom"></div>' +
                        '<div class="game_border_left"></div><div class="game_border_right"></div>' +
                        '<div class="game_border_corner corner1"></div><div class="game_border_corner corner2"></div>' +
                        '<div class="game_border_corner corner3"></div><div class="game_border_corner corner4"></div>' +
                        '<span class="bold" style="color:#000;font-size: 0.8em;"><table style="margin:0px;background:#f7dca2;width:100%;align:center;">' +
                        '<tr><td width="1%"><img class="ico" src="https://gp' + MID + '.innogamescdn.com/images/game/res/pop.png"></td><td id="p" align="center" width="100%">0</td></tr>' +
                        '</table></span>' +
                        '</div>').appendTo('.ui-dialog #units');

                    $('.ui-dialog #units .ico').css({
                        height: '20px',
                        width: '20px'
                    });
                    $('.ui-dialog #units .units_info_sprite').css({
                        background: 'url(https://gp' + MID + '.innogamescdn.com/images/game/units/units_info_sprite2.51.png)',
                        backgroundSize: '100%'
                    });
                    $('.ui-dialog #units .img_pierce').css({ backgroundPosition: '0% 9%' });
                    $('.ui-dialog #units .img_dist').css({ backgroundPosition: '0% 18%' });

                    //$('#pop_baracks').tooltip('Bevölkerungszahl aller Landeinheiten der Stadt');
                    //$('#strength_baracks').tooltip('Gesamteinheitenstärke stadteigener Truppen');

                    $('#b').get(0).innerHTML = blunt;
                    $('#s').get(0).innerHTML = sharp;
                    $('#d').get(0).innerHTML = dist;
                    $('#p').get(0).innerHTML = pop;
                }
            }
        }
    };

    /*******************************************************************************************************************************
     * ●  Transporter capacity
     *******************************************************************************************************************************/
    var TransportCapacity = {
        activate: function () {
            // transporter display
            $('<div id="transporter" class="cont" style="height:25px;">' +
                '<table style=" margin:0px;"><tr align="center" >' +
                '<td><img id="ship_img" class="ico" src="https://flasktools.altervista.org/images/4pvfuch8.png"></td>' +
                '<td><span id="ship" class="bold text_shadow" style="color:#FFCC66;font-size: 10px;line-height: 2.1;"></span></td>' +
                '</tr></table>' +
                '</div>').appendTo('.units_naval .content');

            $('#transporter.cont').css({
                background: 'url(https://gp' + MID + '.innogamescdn.com/images/game/layout/layout_units_nav_border.png)'
            });

            $('#transporter').hover(function () {
                $(this).css('cursor', 'pointer');
            });
            $('#transporter').toggleClick(
                function () {
                    $('#ship_img').get(0).src = "https://flasktools.altervista.org/images/b5xl8nmj.png";
                    shipsize = !shipsize;
                    TransportCapacity.update();
                },
                function () {
                    $('#ship_img').get(0).src = "https://flasktools.altervista.org/images/4pvfuch8.png";
                    shipsize = !shipsize;
                    TransportCapacity.update();
                }
            );
            TransportCapacity.update();
        },
        deactivate: function () {
            $('#transporter').remove();
        },
        update: function () {
            var bigTransp = 0, smallTransp = 0, pop = 0, ship = 0, unit, berth, units = [];
            // Ship space (available)
            smallTransp = parseInt(uw.ITowns.getTown(parseInt(uw.Game.townId, 10)).units().small_transporter, 10);
            if (isNaN(smallTransp)) smallTransp = 0;
            if (shipsize) {
                bigTransp = parseInt(uw.ITowns.getTown(parseInt(uw.Game.townId, 10)).units().big_transporter, 10);
                if (isNaN(bigTransp)) bigTransp = 0;
            }

            // Checking: Research berth
            berth = 0;
            if (uw.ITowns.getTown(uw.Game.townId).researches().hasBerth()) {
                berth = GameData.research_bonus.berth;
            }
            ship = bigTransp * (GameData.units.big_transporter.capacity + berth) + smallTransp * (GameData.units.small_transporter.capacity + berth);

            units = uw.ITowns.getTown(uw.Game.townId).units();

            // Ship space (required)
            for (var e in units) {
                if (units.hasOwnProperty(e)) {
                    if (uw.GameData.units[e]) { // without Heroes
                        if (!(uw.GameData.units[e].is_naval || uw.GameData.units[e].flying)) {
                            pop += units[e] * uw.GameData.units[e].population;
                        }
                    }
                }
            }
            $('#ship').get(0).innerHTML = pop + "/" + ship;
        }
    };


    /*******************************************************************************************************************************
     * Simulator
     * ----------------------------------------------------------------------------------------------------------------------------
     * | ●  Layout adjustment
     * | ●  Permanent display of the extended modifier box
     * | ●  Unit strength for entered units (without modificator influence yet)
     * ----------------------------------------------------------------------------------------------------------------------------
     *******************************************************************************************************************************/
    var Simulator = {
        activate: function () {
            $('<style id="flask_simulator_style" type="text/css">' +

                '#place_simulator { overflow: hidden !important} ' +
                '#place_simulator .place_sim_bonuses_heroes .place_symbol.place_def_losts { margin-bottom: 27px; } ' +
                '#place_simulator_form .game_body { padding: 0px 1px;!important; } ' +
                '#place_simulator .place_sim_heroes_container .place_simulator_table { height: 64px!important; position: relative; bottom: 3px; left: 10px; } ' +
                '#place_simulator_form h4 { position: relative; bottom: 3px; } ' +

                // Bonus container
                '#place_simulator .place_sim_wrap_mods { margin-bottom: 0px!important; } ' + // Hide modifier box button
                '.place_sim_wrap_mods .place_simulator_table tbody tr:last-child { height: 47px; vertical-align: top; } ' +

                // Sea unit box
                '#place_sim_naval_units tbody tr:last-child { height:auto !important; }' +
                '#place_sim_naval_units { margim-bottom: 91px; } ' +

                // Select boxes
                '.place_sim_select_gods_wrap { position:absolute; bottom:178px; left: 160px; } ' +
                '.place_sim_select_gods_wrap select { max-width: 200px; } ' +
                '.place_sim_select_gods_wrap .place_symbol, .place_sim_select_strategies .place_symbol { margin: 1px 2px 0px 5px !important} ' +

                '</style>').appendTo('head');

            if ($('#place_simulator').get(0)) {
                setStrengthSimulator();
            }

            SimulatorStrength.activate();

        },
        deactivate: function () {
            $('#flask_simulator_style').remove();
            if ($('#simu_table').get(0)) {
                $('#simu_table').remove();

            }

            SimulatorStrength.deactivate();
        },
        change: function () {
            // TODO: Durch CSS ersetzen...

            // Hero world ?
            if (uw.Game.hasArtemis) {
                $('.place_sim_wrap_mods_extend tr').each(function () {
                    this.children[1].style.borderLeft = "none";
                    this.children[0].remove();
                });
            }

            setStrengthSimulator();
        }
    };

    function afterSimulation() {
        var lossArray = { att: { res: 0, fav: 0, pop: 0 }, def: { res: 0, fav: 0, pop: 0 } },
            wall_level = parseInt($('.place_sim_wrap_mods .place_insert_field[name="sim[mods][def][wall_level]"]').val(), 10),
            wall_damage = parseInt($('#building_place_def_losses_wall_level').get(0).innerHTML, 10),
            wall_iron = [0, 200, 429, 670, 919, 1175, 1435, 1701, 1970, 2242, 2518, 2796, 3077, 3360, 3646, 3933, 4222, 4514, 4807, 5101, 5397, 5695, 5994, 6294, 6596, 6899];

        // Calculate unit losses
        $('#place_sim_ground_units .place_losses, #place_sim_naval_units .place_losses').each(function () {
            var loss = parseInt(this.innerHTML, 10) || 0;
            //console.log(this.innerHTML);
            if (loss > 0) {
                var unit = this.id.substring(26);
                var side = this.id.split("_")[2]; // att / def
                lossArray[side].res += loss * (uw.GameData.units[unit].resources.wood + uw.GameData.units[unit].resources.stone + uw.GameData.units[unit].resources.iron);
                lossArray[side].fav += loss * uw.GameData.units[unit].favor;
                lossArray[side].pop += loss * uw.GameData.units[unit].population;
            }
        });
        // Calculate wall resource losses
        for (var w = wall_level; w > wall_level - wall_damage; w--) {
            lossArray.def.res += 400 + w * 350 + wall_iron[w]; // wood amount is constant, stone amount is multiplicative and iron amount is irregular for wall levels
        }

        // Insert losses into table
        for (var x in lossArray) {
            if (lossArray.hasOwnProperty(x)) {
                for (var z in lossArray[x]) {
                    if (lossArray[x].hasOwnProperty(z)) {
                        //console.log(((z === "res") && (lossArray[x][z] > 10000)) ? (Math.round(lossArray[x][z] / 1000) + "k") : lossArray[x][z]);
                        $("#" + x + "_" + z).get(0).innerHTML = ((z === "res") && (lossArray[x][z] > 10000)) ? (Math.round(lossArray[x][z] / 1000) + "k") : lossArray[x][z];

                    }
                }
            }
        }
    }

    // StÃ¤rkeanzeige: Simulator
    var unitsGround = { att: {}, def: {} }, unitsNaval = { att: {}, def: {} }, name = "";

    var SimulatorStrength = {
        unitsGround: { att: {}, def: {} },
        unitsNaval: { att: {}, def: {} },

        activate: function () {
            $('<style id="flask_simulator_strength_style">' +
                '#flask_simulator_strength { position:absolute; top:188px; font-size:0.8em; width:63%; } ' +
                '#flask_simulator_strength .ico { height:20px; width:20px; margin:auto; } ' +
                '#flask_simulator_strength .units_info_sprite { background:url(https://gp' + MID + '.innogamescdn.com/images/game/units/units_info_sprite2.51.png); background-size:100%; } ' +

                '#flask_simulator_strength .img_hack { background-position:0% 36%; } ' +
                '#flask_simulator_strength .img_pierce { background-position:0% 27%; } ' +
                '#flask_simulator_strength .img_dist { background-position:0% 45% !important; } ' +
                '#flask_simulator_strength .img_ship { background-position:0% 72%; } ' +

                '#flask_simulator_strength .img_fav { background: url(https://gp' + MID + '.innogamescdn.com/images/game/res/favor.png) !important; background-size: 100%; } ' +
                '#flask_simulator_strength .img_res { background: url(https://gp' + MID + '.innogamescdn.com/images/game/units/units_info_sprite2.51.png) 0% 54%; background-size: 100%; } ' +
                '#flask_simulator_strength .img_pop { background: url(https://gp' + MID + '.innogamescdn.com/images/game/res/pop.png); background-size:100%; } ' +

                '#flask_simulator_strength .left_border { width: 54px; } ' +
                '</style>'
            ).appendTo('head');

        },
        deactivate: function () {
            $('#flask_simulator_strength_style').remove();
            $('#flask_simulator_strength').remove();
        }
    }
    function setStrengthSimulator() {
        $('<div id="flask_simulator_strength" style="width: 49%;">' +
            '<div style="float:left; margin-right:-4px;"><h4>' + getText("labels", "str") + '</h4>' +
            '<table class="place_simulator_table strength" cellpadding="0px" cellspacing="0px" style="align:center; position: relative; bottom: 3px;">' +
            '<tr>' +
            '<td class="place_simulator_even"></td>' +
            '<td class="left_border place_simulator_odd"><div class="ico units_info_sprite img_hack"></div></td>' +
            '<td class="left_border place_simulator_even"><div class="ico units_info_sprite img_pierce"></div></td>' +
            '<td class="left_border place_simulator_odd"><div class="ico units_info_sprite img_dist"></div></td>' +
            '<td class="left_border place_simulator_even"><div class="ico units_info_sprite img_ship"></div></td>' +
            '</tr><tr>' +
            '<td class="place_simulator_even"><div class="place_symbol place_att"></div></td>' +
            '<td class="left_border place_simulator_odd" id="att_b">0</td>' +
            '<td class="left_border place_simulator_even" id="att_s">0</td>' +
            '<td class="left_border place_simulator_odd" id="att_d">0</td>' +
            '<td class="left_border place_simulator_even" id="att_ship">0</td>' +
            '</tr><tr>' +
            '<td class="place_simulator_even"><div class="place_symbol place_def"></div></td>' +
            '<td class="left_border place_simulator_odd" id="def_b">0</td>' +
            '<td class="left_border place_simulator_even" id="def_s">0</td>' +
            '<td class="left_border place_simulator_odd" id="def_d">0</td>' +
            '<td class="left_border place_simulator_even" id="def_ship">0</td>' +
            '</tr>' +
            '</table>' +
            '</div><div><h4>' + getText("labels", "los") + '</h4>' +
            '<table class="place_simulator_table loss" cellpadding="0px" cellspacing="0px" style="align:center; height: 64px; position: relative; bottom: 3px;">' +
            '<tr>' +
            //'<td class="place_simulator_even"></td>' +
            '<td class="left_border place_simulator_odd"><div class="ico units_info_sprite img_res"></div></td>' +
            '<td class="left_border place_simulator_even"><div class="ico units_info_sprite img_fav"></div></td>' +
            '<td class="left_border place_simulator_odd"><div class="ico units_info_sprite img_pop"></div></td>' +
            '</tr><tr>' +
            //'<td class="place_simulator_even"><div class="place_symbol place_att"></div></td>' +
            '<td class="left_border place_simulator_odd" id="att_res">0</td>' +
            '<td class="left_border place_simulator_even" id="att_fav">0</td>' +
            '<td class="left_border place_simulator_odd" id="att_pop">0</td>' +
            '</tr><tr>' +
            //'<td class="place_simulator_even"><div class="place_symbol place_def"></div></td>' +
            '<td class="left_border place_simulator_odd" id="def_res">0</td>' +
            '<td class="left_border place_simulator_even" id="def_fav">0</td>' +
            '<td class="left_border place_simulator_odd" id="def_pop">0</td>' +
            '</tr>' +
            '</table>' +
            '</div></div>').appendTo('#simulator_body');


        $('#flask_simulator_strength .left_border').each(function () {
            $(this)[0].align = 'center';
        });

        $('#flask_simulator_strength .strength').tooltip(getText("labels", "str") + " (" + getText("labels", "mod") + ")");
        $('#flask_simulator_strength .loss').tooltip(getText("labels", "los"));

        // Klick auf Einheitenbild
        $('.index_unit').click(function () {
            var type = $(this).attr('class').split(" ")[4];
            $('.place_insert_field[name="sim[units][att][' + type + ']"]').change();
        });

        setInterval(function () {
            if ($('#flask_simulator_strength').length) {
                afterSimulation();
            }
        }, 60);

        $('#place_sim_ground_units .place_insert_field, #place_sim_naval_units .place_insert_field').on('input change', function () {
            name = $(this).attr("name").replace(/\]/g, "").split("[");
            var str = this;
            //console.log(str);
            setTimeout(function () {
                var unit_type = $(str).closest('.place_simulator_table').attr("id").split("_")[2],
                    val, e;

                val = parseInt($(str).val(), 10);
                val = val || 0;

                if (unit_type == "ground") {
                    unitsGround[name[2]][name[3]] = val;

                    if (name[2] == "def") {
                        UnitStrength.calcDef(unitsGround.def);
                    } else {
                        UnitStrength.calcOff(unitsGround.att, unitsGround.att);
                    }
                    $('#' + name[2] + '_b').get(0).innerHTML = blunt;
                    $('#' + name[2] + '_s').get(0).innerHTML = sharp;
                    $('#' + name[2] + '_d').get(0).innerHTML = dist;

                } else {
                    var att = 0, def = 0;
                    unitsNaval[name[2]][name[3]] = val;

                    if (name[2] == "def") {
                        for (e in unitsNaval.def) {
                            if (unitsNaval.def.hasOwnProperty(e)) {
                                def += unitsNaval.def[e] * uw.GameData.units[e].defense;
                            }
                        }
                        $('#def_ship').get(0).innerHTML = def;

                    } else {
                        for (e in unitsNaval.att) {
                            if (unitsNaval.att.hasOwnProperty(e)) {
                                att += unitsNaval.att[e] * uw.GameData.units[e].attack;
                            }
                        }
                        $('#att_ship').get(0).innerHTML = att;
                    }
                }
            }, 100);
        });

        // Abfrage wegen eventueller Spionageweiterleitung
        getUnitInputs();
        setTimeout(function () {
            setChangeUnitInputs("def");
        }, 100);

        $('#select_insert_units').change(function () {
            var side = $(this).find('option:selected').val();

            setTimeout(function () {
                getUnitInputs();
                if (side === "att" || side === "def") {
                    setChangeUnitInputs(side);
                }
            }, 200);
        });
    }

    function getUnitInputs() {
        $('#place_sim_ground_units .place_insert_field, #place_sim_naval_units .place_insert_field').each(function () {
            name = $(this).attr("name").replace(/\]/g, "").split("[");

            var str = this;

            var unit_type = $(str).closest('.place_simulator_table').attr("id").split("_")[2];

            var val = parseInt($(str).val(), 10);

            val = val || 0;

            if (unit_type === "ground") {
                unitsGround[name[2]][name[3]] = val;
            } else {
                unitsNaval[name[2]][name[3]] = val;
            }
        });
    }

    function setChangeUnitInputs(side) {
        $('.place_insert_field[name="sim[units][' + side + '][godsent]"]').change();
        setTimeout(function () {
            $('.place_insert_field[name="sim[units][' + side + '][colonize_ship]"]').change();
        }, 100);
    }

    /*******************************************************************************************************************************
     * Defense form
     * ----------------------------------------------------------------------------------------------------------------------------
     * | ●  Adds a defense form to the bbcode bar
     * ----------------------------------------------------------------------------------------------------------------------------
     *******************************************************************************************************************************/

    // Funktion aufteilen...
    function addForm(e) {
        var textareaId = "", bbcodeBarId = "";

        switch (e) {
            case "/alliance_forum/forum":
                textareaId = "#forum_post_textarea";
                bbcodeBarId = "#forum";
                break;
            case "/message/forward":
                textareaId = "#message_message";
                bbcodeBarId = "#message_bbcodes";
                break;
            case "/message/new":
                textareaId = "#message_new_message";
                bbcodeBarId = "#message_bbcodes";
                break;
            case "/message/view":
                textareaId = "#message_reply_message";
                bbcodeBarId = "#message_bbcodes";
                break;
            case "/player_memo/load_memo_content":
                textareaId = "#memo_text_area";
                bbcodeBarId = "#memo_edit";
                break;
        }

        $('<a title="Verteidigungsformular" href="#" class="flask_bbcode_option def_form" name="def_form"></a>').appendTo(bbcodeBarId + ' .bb_button_wrapper');

        $('.def_form_button').css({
            cursor: 'pointer',
            marginTop: '3px'
        });

        $(bbcodeBarId + ' .flask_bbcode_option').css({
            background: 'url("https://flasktools.altervista.org/images/lt3hyb8j.png")',
            display: 'block',
            float: 'left',
            width: '22px',
            height: '23px',
            margin: '0 3px 0 0',
            position: 'relative'
        });
        $(bbcodeBarId + ' .def_form').css({
            backgroundPosition: '-89px 0px'
        });
        var imgArray = {
            wall: 'https://gp' + MID + '.innogamescdn.com/images/game/main/wall.png',
            tower: 'https://gp' + MID + '.innogamescdn.com/images/game/main/tower.png',
            hide: 'https://gp' + MID + '.innogamescdn.com/images/game/main/hide.png',

            spy: 'https://flasktools.altervista.org/images/spy.png',
            pop: 'https://flasktools.altervista.org/images/pop.png',

            rev1: 'https://flasktools.altervista.org/images/rev1.png',
            rev0: 'https://flasktools.altervista.org/images/rev0.png',
            eo1: 'https://flasktools.altervista.org/images/eo1.png',
            eo0: 'https://flasktools.altervista.org/images/eo0.png',
            att: 'https://flasktools.altervista.org/images5/att.png',
            sup: 'https://flasktools.altervista.org/images/sup.png',

            zeus: 'https://flasktools.altervista.org/images/zeus.png',
            hera: 'https://flasktools.altervista.org/images/hera.png',
            athena: 'https://flasktools.altervista.org/images/athena.png',
            poseidon: 'https://flasktools.altervista.org/images/poseidon.png',
            hades: 'https://flasktools.altervista.org/images/hades.png',
            artemis: 'https://flasktools.altervista.org/images/artemis.png',
            nogod: 'https://flasktools.altervista.org/images/nogod.png',

            captain: 'https://flasktools.altervista.org/images/captain.png',
            commander: 'https://flasktools.altervista.org/images/commander.png',
            priest: 'https://flasktools.altervista.org/images/priest.png',

            phalanx: 'https://flasktools.altervista.org/images/phalanx.png',
            ram: 'https://flasktools.altervista.org/images/ram.png',

            militia: 'https://wiki.en.grepolis.com/images/9/9b/Militia_40x40.png',
            sword: 'https://wiki.en.grepolis.com/images/9/9c/Sword_40x40.png',
            slinger: 'https://wiki.en.grepolis.com/images/d/dc/Slinger_40x40.png',
            archer: 'https://wiki.en.grepolis.com/images/1/1a/Archer_40x40.png',
            hoplite: 'https://wiki.en.grepolis.com/images/b/bd/Hoplite_40x40.png',
            rider: 'https://wiki.en.grepolis.com/images/e/e9/Rider_40x40.png',
            chariot: 'https://wiki.en.grepolis.com/images/b/b8/Chariot_40x40.png',
            catapult: 'https://wiki.en.grepolis.com/images/f/f0/Catapult_40x40.png',
            godsent: 'https://wiki.de.grepolis.com/images/6/6e/Grepolis_Wiki_225.png',

            def_sum: 'https://flasktools.altervista.org/images/def_sum.png',

            minotaur: 'https://wiki.de.grepolis.com/images/7/70/Minotaur_40x40.png',
            manticore: 'https://wiki.de.grepolis.com/images/5/5e/Manticore_40x40.png',
            zyclop: 'https://wiki.de.grepolis.com/images/6/66/Zyklop_40x40.png',
            sea_monster: 'https://wiki.de.grepolis.com/images/7/70/Sea_monster_40x40.png',
            harpy: 'https://wiki.de.grepolis.com/images/8/80/Harpy_40x40.png',
            medusa: 'https://wiki.de.grepolis.com/images/d/db/Medusa_40x40.png',
            centaur: 'https://wiki.de.grepolis.com/images/5/53/Centaur_40x40.png',
            pegasus: 'https://wiki.de.grepolis.com/images/5/54/Pegasus_40x40.png',
            cerberus: 'https://wiki.de.grepolis.com/images/6/67/Zerberus_40x40.png',
            fury: 'https://wiki.de.grepolis.com/images/6/67/Erinys_40x40.png',
            griffin: 'https://wiki.de.grepolis.com/images/d/d1/Unit_greif.png',
            calydonian_boar: 'https://wiki.de.grepolis.com/images/9/93/Unit_eber.png',
            siren: 'https://wiki.de.grepolis.com/images/e/e9/Sirene.png',
            satyr: 'https://wiki.de.grepolis.com/images/d/d8/Satyr.png',
            spartoi: 'https://wiki.de.grepolis.com/images/a/a8/Spartoi.png',
            ladon: 'https://wiki.de.grepolis.com/images/4/4c/Ladon.png',

            big_transporter: 'https://wiki.en.grepolis.com/images/0/04/Big_transporter_40x40.png',
            bireme: 'https://wiki.en.grepolis.com/images/4/44/Bireme_40x40.png',
            attack_ship: 'https://wiki.en.grepolis.com/images/e/e6/Attack_ship_40x40.png',
            demolition_ship: 'https://wiki.en.grepolis.com/images/e/ec/Demolition_ship_40x40.png',
            small_transporter: 'https://wiki.en.grepolis.com/images/8/85/Small_transporter_40x40.png',
            trireme: 'https://wiki.en.grepolis.com/images/a/ad/Trireme_40x40.png',
            colonize_ship: 'https://wiki.en.grepolis.com/images/d/d1/Colonize_ship_40x40.png',

            move_icon: 'https://gp' + MID + '.innogamescdn.com/images/game/unit_overview/',

            bordure: 'https://flasktools.altervista.org/images/bordure.png'
        };

        $('<div class="bb_def_chooser">' +
            '<div class="bbcode_box middle_center">' +
            '<div class="bbcode_box top_left"></div><div class="bbcode_box top_right"></div>' +
            '<div class="bbcode_box top_center"></div><div class="bbcode_box bottom_center"></div>' +
            '<div class="bbcode_box bottom_right"></div><div class="bbcode_box bottom_left"></div>' +
            '<div class="bbcode_box middle_left"></div><div class="bbcode_box middle_right"></div>' +
            '<div class="bbcode_box content clearfix" style="padding:5px">' +
            '<div id="f_uni" class="checkbox_new checked"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("labels", "det") + '</div></div><br><br>' +
            '<div id="f_prm" class="checkbox_new checked"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("labels", "prm") + '</div></div><br><br>' +
            '<div id="f_sil" class="checkbox_new checked"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("labels", "sil") + '</div></div><br><br>' +
            '<div id="f_mov" class="checkbox_new checked"><div class="cbx_icon"></div><div class="cbx_caption">' + getText("labels", "mov") + '</div></div><br><br>' +
            '<div><a class="button" id="flask_insert" href="#"><span class="left"><span class="right"><span class="middle"><small>' + getText("buttons", "ins") + '</small></span></span></span><span></span></a></div>' +
            '</div></div></div>').appendTo(bbcodeBarId + ' .bb_button_wrapper');

        $('.bb_def_chooser').css({
            display: 'none',
            top: '38px',
            left: '510px',
            position: 'absolute',
            width: '190px',
            zIndex: 10000
        });

        $(bbcodeBarId + " .bb_def_chooser .checkbox_new").click(function () {
            $(this).toggleClass("checked");
        });

        $(bbcodeBarId + ' .def_form').toggleClick(function () {
            $(this).parent().find(".bb_def_chooser").get(0).style.display = "block";
        }, function () {
            $(this).parent().find(".bb_def_chooser").get(0).style.display = "none";
        });

        $(bbcodeBarId + ' #flask_insert').click(function () {
            var textarea = $(textareaId).get(0), text = $(textarea).val(), troop_table = "", troop_img = "", troop_count = "", separator = "", move_table = "", landunit_sum = 0;

            $('.def_form').click();

            if ($('#f_uni').hasClass("checked")) {
                $('.units_land .unit, .units_naval .unit').each(function () {
                    troop_img += separator + '[img]' + imgArray[this.className.split(" ")[1]] + '[/img]';
                    troop_count += separator + '[center]' + $(this).find(".value").get(0).innerHTML + '[/center]';
                    separator = "[||]";
                });
            } else {
                $('.units_land .unit').each(function () {
                    var a = this.className.split(" ")[1], def = (uw.GameData.units[a].def_hack + uw.GameData.units[a].def_pierce + uw.GameData.units[a].def_distance) / (3 * uw.GameData.units[a].population);
                    if (def > 10) {
                        landunit_sum += parseInt($(this).find(".value").get(0).innerHTML, 10) * uw.GameData.units[a].population * ((def > 20) ? 2 : 1);
                    }
                });
                landunit_sum = (landunit_sum > 10000) ? ((Math.round(landunit_sum / 100)) / 10) + "k" : landunit_sum;

                troop_img += '[img]' + imgArray.def_sum + '[/img]';
                troop_count += '[center]' + landunit_sum + '[/center]';
                separator = "[||]";
                $('.units_naval .unit').each(function () {
                    troop_img += separator + '[img]' + imgArray[this.className.split(" ")[1]] + '[/img]';
                    troop_count += separator + '[center]' + $(this).find(".value").get(0).innerHTML + '[/center]';
                });
            }
            if (troop_img !== "") {
                troop_table = "\n[table][**]" + troop_img + "[/**][**]" + troop_count + "[/**][/table]\n";
            }

            var str = '[img]' + imgArray.bordure + '[/img]' +
                '\n\n[color=#006B00][size=12][u][b]' + getText("labels", "ttl") + ' ([url="https://adf.ly/eDM1y"]©FLASK-Tools[/url])[/b][/u][/size][/color]\n\n' +
                //'[table][**][img]'+ imgArray.sup +'[/img][||]'+
                '[size=12][town]' + uw.ITowns.getTown(uw.Game.townId).getId() + '[/town] ([player]' + uw.Game.player_name + '[/player])[/size]' +
                //'[||][img]'+ imgArray['rev' + (uw.ITowns.getTown(uw.Game.townId).hasConqueror()?1:0)] +'[/img][/**][/table]'+
                '\n\n[i][b]' + getText("labels", "inf") + '[/b][/i]' + troop_table +
                '[table][*]' +
                '[img]' + imgArray.wall + '[/img][|]\n' +
                '[img]' + imgArray.tower + '[/img][|]\n' +
                '[img]' + imgArray.phalanx + '[/img][|]\n' +
                '[img]' + imgArray.ram + '[/img][|]\n' +
                ($('#f_prm').hasClass("checked") ? '[img]' + imgArray.commander + '[/img][|]\n' : ' ') +
                ($('#f_prm').hasClass("checked") ? '[img]' + imgArray.captain + '[/img][|]\n' : ' ') +
                ($('#f_prm').hasClass("checked") ? '[img]' + imgArray.priest + '[/img][|]\n' : ' ') +
                ($('#f_sil').hasClass("checked") ? '[center][img]' + imgArray.spy + '[/img][/center][|]\n' : ' ') +
                '[img]' + imgArray.pop + '[/img][|]\n' +
                '[img]' + imgArray[(uw.ITowns.getTown(uw.Game.townId).god() || "nogod")] + '[/img][/*]\n' +
                '[**][center]' + uw.ITowns.getTown(uw.Game.townId).buildings().getBuildingLevel("wall") + '[/center][||]' +
                '[center]' + uw.ITowns.getTown(uw.Game.townId).buildings().getBuildingLevel("tower") + '[/center][||]' +
                '[center]' + (uw.ITowns.getTown(uw.Game.townId).researches().attributes.phalanx ? '+' : '-') + '[/center][||]' +
                '[center]' + (uw.ITowns.getTown(uw.Game.townId).researches().attributes.ram ? '+' : '-') + '[/center][||]' +
                ($('#f_prm').hasClass("checked") ? '[center]' + ((uw.Game.premium_features.commander >= uw.Timestamp.now()) ? '+' : '-') + '[/center][||]' : ' ') +
                ($('#f_prm').hasClass("checked") ? '[center]' + ((uw.Game.premium_features.captain >= uw.Timestamp.now()) ? '+' : '-') + '[/center][||]' : ' ') +
                ($('#f_prm').hasClass("checked") ? '[center]' + ((uw.Game.premium_features.priest >= uw.Timestamp.now()) ? '+' : '-') + '[/center][||]' : ' ') +
                ($('#f_sil').hasClass("checked") ? '[center]' + Math.round(uw.ITowns.getTown(uw.Game.townId).getEspionageStorage() / 1000) + 'k[/center][||]' : ' ') +
                '[center]' + uw.ITowns.getTown(uw.Game.townId).getAvailablePopulation() + '[/center][||]' +
                '[center]' + $('.gods_favor_amount').get(0).innerHTML + '[/center]' +
                '[/**][/table]';

            var bb_count_str = parseInt(str.match(/\[/g).length, 10), bb_count_move = 0;

            var i = 0;
            if ($('#f_mov').hasClass("checked")) {
                move_table += '\n[i][b]' + getText("labels", "mov") + '[/b][/i]\n[table]';

                $('#toolbar_activity_commands').mouseover();

                $('#toolbar_activity_commands_list .content .command').each(function () {
                    var cl = $(this).children()[0].className.split(" ");
                    if ((cl[cl.length - 1] === "returning" || cl[cl.length - 1] === "revolt_arising" || cl[cl.length - 1] === "revolt_running") && ((bb_count_str + bb_count_move) < 480)) {
                        move_table += (i % 1) ? "" : "[**]";
                        i++;
                        move_table += "[img]" + imgArray.move_icon + cl[2] + ".png[/img][||]";
                        move_table += getArrivalTime($(this).children()[1].innerHTML) + (uw.Game.market_id === "de" ? " Uhr[||]" : " [||]");
                        move_table += "[town]" + JSON.parse(atob($(this).children()[2].firstChild.href.split("#")[1])).id + "[/town]";
                        move_table += (i % 1) ? "[||]" : "[/**]";
                    }
                    bb_count_move = parseInt(move_table.match(/\[/g).length, 10);
                });
                if ((bb_count_str + bb_count_move) > 480) {
                    move_table += '[**]...[/**]';
                }

                $('#toolbar_activity_commands').mouseout();

                //console.log((bb_count_str + bb_count_move));
                move_table += (i % 1) ? "[/**]" : "";
                move_table += "[*][|][color=#800000][size=6][i] (" + getText("labels", "dev") + ": ±1s)[/i][/size][/color][/*][/table]\n";
            }

            str += move_table + '[img]' + imgArray.bordure + '[/img]';


            $(textarea).val(text.substring(0, $(textarea).get(0).selectionStart) + str + text.substring($(textarea).get(0).selectionEnd));
        });
    }

    function getArrivalTime(duration_time) {
        /*
         var server_time = new Date((uw.Timestamp.server() + 7200) * 1000);

         duration_time = duration_time.split(":");

         s = server_time.getUTCSeconds() + parseInt(duration_time[2], 10);
         m = server_time.getUTCMinutes() + parseInt(duration_time[1], 10) + ((s>=60)? 1 : 0);
         h = server_time.getUTCHours() + parseInt(duration_time[0], 10) + ((m>=60)? 1 : 0);
         */

        var server_time = $('.server_time_area').get(0).innerHTML.split(" ")[0].split(":"), arrival_time, s, m, h;
        duration_time = duration_time.split(":");

        s = parseInt(server_time[2], 10) + parseInt(duration_time[2], 10);
        m = parseInt(server_time[1], 10) + parseInt(duration_time[1], 10) + ((s >= 60) ? 1 : 0);
        h = parseInt(server_time[0], 10) + parseInt(duration_time[0], 10) + ((m >= 60) ? 1 : 0);

        s = s % 60;
        m = m % 60;
        h = h % 24;

        s = ((s < 10) ? "0" : "") + s;
        m = ((m < 10) ? "0" : "") + m;
        h = ((h < 10) ? "0" : "") + h;

        arrival_time = h + ":" + m + ":" + s;

        return arrival_time;
    }


    /*******************************************************************************************************************************
     * Smiley box
     * ----------------------------------------------------------------------------------------------------------------------------
     * | ●  Display of a smiley selection box for text input fields (forum, messages, notes):
     * | ●  Used smileys: http://www.greensmilies.com/smilie-album/
     * | + Own Grepolis smileys
     * ----------------------------------------------------------------------------------------------------------------------------
     *******************************************************************************************************************************/

    var smileyArray = {};

    var SmileyBox = {
        loading_error: false, isHalloween: false, isXmas: false, isForum: $(".editor_textbox_container").get(0),

        activate: function () {
            $('<style id="flask_smiley">' +
                '.smiley_button { cursor:pointer; margin:3px 2px 2px 2px; } ' +

                '.smiley_box.game { z-index:5000; position:absolute; top:27px; left:420px; max-width:332px; display:none; } ' +

                // Smiley categories
                '.smiley_box .box_header { display: table; width: 100%; } ' +
                '.smiley_box .group { display:table-cell; color: #0c450c; cursor: pointer; font-weight:bold; padding: 0px 2px 0px 2px; } ' +
                '.smiley_box .group.active { color: #089421; text-decoration:underline;} ' +
                '.smiley_box .group:hover { color: #14999E; } ' + // #11AD6C

                // Special smiley categories
                '.smiley_box .halloween { color: #E25E00; } ' +
                '.smiley_box .xmas { color: darkred; } ' +

                '.smiley_box hr { margin:3px 0px 0px 0px; color:#086b18; border:1px solid; } ' +

                // Smilies
                '.smiley_box .box_content { overflow-y: auto !important; min-height: 50px; max-height: 130px; } ' +
                '.smiley_box .box_content .smiley { border: 1px solid rgba(0,0,0,0); border-radius: 5px;} ' +
                '.smiley_box .box_content .smiley:hover { background: rgba(8, 148, 77, 0.2); border: 1px solid rgba(0, 128, 0, 0.5); } ' +

                // Smiley page link
                '.smiley_box .box_footer { text-align:center; margin-top:4px; } ' +
                '.smiley_box a:link, .smiley_box a:visited { color: #086b18; font-size: 0.7em; } ' +
                '.smiley_box a:hover { color: #14999E; } ' +

                // TODO Forum ...
                '.smiley_box.forum .box_header_left { float:left; } ' +
                //'.smiley_box.forum .group { padding-right: 10px; } '+
                '.smiley_box.forum .box_header_right { text-align:right; margin-top:2px; } ' +

                '.smiley_box.forum { max-height:90px; margin-left:5px; width:99%; min-height:10px; } ' +
                '.smiley_box.forum .box_content { overflow:overlay; min-height:70px; margin-bottom:10px; } ' +

                '.smiley_box.forum a:link, .smiley_box.forum a:visited { font-size: 1em; } ' +

                '</style>').appendTo('head');


            // Smiley categories
            smileyArray.button = ["rollsmiliey", "smile"];

            smileyArray.standard = [
                "smilenew", "grin", "lol", "neutral_new", "afraid", "freddus_pacman", "auslachen2", "kolobok-sanduhr", "bussi2", "winken4", "flucht2", "panik4", "ins-auge-stechen",
                "seb_zunge", "fluch4_GREEN", "baby_junge2", "blush-reloaded6", "frown", "verlegen", "blush-pfeif", "stevieh_rolleyes", "daumendreh2", "baby_taptap",
                "sadnew", "hust", "confusednew", "idea2", "irre", "irre4", "sleep", "candle", "nicken", "no_sad", "stapel", "cold2", "hot2", "regenschirm2", "mazzn_wtf", "gruppenbau",
                "thumbs-up_new", "thumbs-down_new", "bravo2", "oh-no2", "kaffee2", "drunk", "saufen", "freu-dance", "hecheln", "headstand", "rollsmiliey", "eazy_cool01", "motz", "cuinlove", "biggrin",
                "aufsmaul", "bier", "datz", "essen", "helpnew", "karte3_rot", "megaeek", "mrchristkind", "papiertuete_kopf", "popcorn_essen", "unknownauthor_fuck", "unknownauthor_patsch"
            ];
            smileyArray.nature = [
                "dinosaurier07", "flu-super-gau", "ben_cat", "schwein", "hundeleine01", "blume", "ben_sharky", "ben_cow", "charly_bissig", "gehirnschnecke_confused", "mttao_fische", "mttao_angler",
                "insel", "fliegeschnappen", "spider", /* Spinne */ "shipwrecked", /* Schiffbrüchiger */ "plapperhase", "ben_dumbo", "elefant", "twitter-sattel", "elkgrin_GREEN", "fledermaus", "mttao_skorpion",
                "mttao_steinbock", "mttao_stier", "mttao_widder"
            ];
            smileyArray.grepolis = [
                "mttao_wassermann", "hera", /* Hera */ "medusa", /* Medusa */ "manticore", /* Mantikor */ "cyclops", /* Zyklop */
                "minotaur", /* Minotaurus */ "pegasus", /* Pegasus */ "hydra", /* Hydra */
                "silvester_cuinlove", "mttao_schuetze", "kleeblatt2", "wallbash", /* "glaskugel4", */ "musketiere_fechtend", /* "krone-hoch",*/ "viking", // Wikinger
                "mttao_waage2", "steckenpferd", /* "kinggrin_anbeten2", */ "grepolove", /* Grepo Love */ "skullhaufen", "pferdehaufen", "grepo_pacman", "cash", "money_mouth" // "i/ckajscggscw4s2u60"
            ];
            smileyArray.people = [
                "seb_hut5", "opa_boese2", "star-wars-yoda1-gruen", "hexefliegend", "snob", "seb_detektiv_ani", "seb_cowboy", "devil", "segen", "pirat5", "borg", "hexe3b",
                "pharaoh", "hippie", "eazy_polizei", "stars_elvis", "mttao_chefkoch", "nikolaus", "pirate3_biggrin", "batman_skeptisch", "tubbie1", "tubbie2", "tubbie3", "tubbie4", "abraham_lincoln2",
                "eazy_feuerwehr6", "labor_reagenzglas", "labs", "mk_inder", "mttao_absolvent", "mttao_asiate", "mttao_bauarbeiter_hilti", "mttao_briefkasten", "mttao_brieftraeger", "mttao_chefkoch",
                "mttao_cowboy", "mttao_haeuptling", "oma_sessel_katze", "ozboss_gitarre1", "ben_doener", "stephan_schneeraeumdienst", "rennrad", "elektrosadist", "eazy_feuerwehr", "friedenstaube",
                "fips_bypass", "mttao_angler", "vulkanasche-staubsaugen", "fred_holzhacken"
            ];
            smileyArray.funny = [
                "bad", "cannon", "pow", "shotgun", "ssoldier", "tanks", "malpa", "mslug", "mslug2", "mslug3", "mslug4", "mumin", "mttao_star_wars", "star_wars_jedi1_blau",
                "star_wars_yoda1_gruen", "theblog_darthvader1", "goku_02", "goku_08", "dragon_ball_033", "dragon_ball_014", "dragon_ball_009", "disney.55", "disney.49", /*"cartoon.16",*/
                "frosch01", "frosch02", "hypnotoad", "toadrevenge", "hexe-frosch", "fliegelaser", "spiderschwein", "super_mario_03", "super_mario_04", "super_mario_01", "super_mario_02",
                "metalslug.1", "metalslug.5", "metalslug.3", "metalslug.12", "metalslug.17", "metalslug.13", "metalslug.15", "metalslug.122", "metalslug.129", "metalslug.144", "mttao_jungfrau",
                "bug-blaster"
            ];
            smileyArray.other = [
                "steinwerfen", "herzen02", "scream-if-you-can", "kolobok", "headbash", "liebeskummer", "bussi", "brautpaar-reis", "grab-schaufler2", "boxen2",
                "sauf", "mttao_kehren", "sm", "weckruf", "klugscheisser2", "pobity", "transformer", "dagegen", "party", "dafuer", "outofthebox", "pokal_gold", "koepfler",
                "bembni", "koncert", "perkusja", "duese5", "smerf2", "cartoon.29", "cartoon.3", "disney.40", "disney.33", "disney.34", "disney.17", "disney.23", "disney.26",
                "disney.18", "stitch01", "stitch02"
            ];


            // TODO: HolidayChecker benutzen!
            SmileyBox.checkHolidaySeason();

            if (SmileyBox.isHalloween) {
                smileyArray.halloween = [
                    "zombies_alien", "zombies_lol", "zombies_rolleyes", "zombie01", "zombies_smile", "zombie02", "zombies_skeptisch", "zombies_eek", "zombies_frown",
                    "scream-if-you-can", "geistani", "pfeildurchkopf01", "grab-schaufler", "kuerbisleuchten", "mummy3",
                    "kuerbishaufen", "halloweenskulljongleur", "fledermausvampir", "frankenstein_lol", "halloween_confused", "zombies_razz",
                    "halloweenstars_freddykrueger", "zombies_cool", "geist2", "fledermaus2", "halloweenstars_dracula"
                    //"batman", "halloweenstars_lastsummer"
                ];
            }
            if (SmileyBox.isXmas) {
                smileyArray.xmas = [
                    "schneeballwerfen", "schneeball", "xmas4_advent4", "nikolaus", "weihnachtsmann_junge", "schneewerfen_wald", "weihnachtsmann_nordpol", "xmas_kilroy_kamin",
                    "xmas4_laola", "xmas4_aufsmaul", "xmas3_smile", "xmas4_paketliebe", "mttao_ruprecht_peitsche", "3hlkoenige", "santa", "xmas4_hurra2", "weihnachtsgeschenk2", "fred_weihnachten-ostern",
                    "xmas4_furz", "xmas_rose", "schnee-fenster", "xmas_kilroy_sofa", "advent-modern4-rot", "xmas1_shocked"
                    //"dafuer", "outofthebox", "pokal_gold", "koepfler", "transformer"
                ];
            }

            //smileyArray.other = smileyArray.halloween.slice();

            // Forum: Extra smiley
            if (SmileyBox.isForum) {
                smileyArray.grepolis.push("i/ckajscggscw4s2u60"); // Pacman
                smileyArray.grepolis.push("i/cowqyl57t5o255zli"); // Bugpolis
                smileyArray.grepolis.push("i/cowquq2foog1qrbee"); // Inno
            }

            SmileyBox.loadSmileys();
        },
        deactivate: function () {
            $('#flask_smiley').remove();
        },
        checkHolidaySeason: function () {
            // TODO: HolidaySpecial-Klasse stattdessen benutzen
            var daystamp = 1000 * 60 * 60 * 24, today = new Date((new Date()) % (daystamp * (365 + 1 / 4))), // without year

                // Halloween-Smileys ->20 days
                halloween_start = daystamp * 296, // 23. Oktober
                halloween_end = daystamp * 315, // 12. November
                // Xmas-Smileys -> 28 Tage
                xmas_start = daystamp * 334, // 1. Dezember
                xmas_end = daystamp * 361; // 28. Dezember

            SmileyBox.isHalloween = (today >= halloween_start) ? (today <= halloween_end) : false;

            SmileyBox.isXmas = (today >= xmas_start) ? (today <= xmas_end) : false;
        },
        // preload images
        loadSmileys: function () {
            // Replace german sign smilies
            if (MID !== "de") {
                smileyArray.other[17] = "dagegen2";
                smileyArray.other[19] = "dafuer2";
            }

            for (var e in smileyArray) {
                if (smileyArray.hasOwnProperty(e)) {
                    for (var f in smileyArray[e]) {
                        if (smileyArray[e].hasOwnProperty(f)) {
                            var src = smileyArray[e][f];

                            smileyArray[e][f] = new Image();
                            smileyArray[e][f].className = "smiley";

                            if (src.substring(0, 2) == "i/") {
                                smileyArray[e][f].src = "https://flasktools.altervista.org/images/smileys/" + e + "/smiley_emoticons_" + src + ".gif";
                            } else {
                                if (SmileyBox.loading_error == false) {
                                    smileyArray[e][f].src = "https://flasktools.altervista.org/images/smileys/" + e + "/smiley_emoticons_" + src + ".gif";
                                    //console.debug("Smiley", e);
                                } else {
                                    smileyArray[e][f].src = 'https://flasktools.altervista.org/images/93x3p4co.gif';
                                }
                            }
                            smileyArray[e][f].onerror = function () {
                                this.src = 'https://flasktools.altervista.org/images/93x3p4co.gif';
                            };
                        }
                    }
                }
            }
        },

        // Forum smilies
        /*changeForumEditorLayout: function () {
            $('.blockrow').css({border: "none"});

            // Subject/Title
            $($('.section div label[for="title"]').parent()).css({float: "left", width: "36%", marginRight: "20px"});
            $($('.section div label[for="subject"]').parent()).css({float: "left", width: "36%", marginRight: "20px"});

            $('.section div input').eq(0).css({marginBottom: "-10px", marginTop: "10px"});
            $('#display_posticon').remove();

            // Posticons
            $('.posticons table').css({width: "50%" /* marginTop: "-16px"*});
            $('.posticons').css({marginBottom: "-16px"});
            $('.posticons').insertAfter($('.section div label[for="title"]').parent());
            $('.posticons').insertAfter($('.section div label[for="subject"]').parent());
            // Posticons hint
            $('.posticons p').remove();
            // Posticons: No Icon - radio button
            $(".posticons [colspan='14']").parent().replaceWith($(".posticons [colspan='14']"));
            $(".posticons [colspan='14']").children().wrap("<nobr></nobr>");
            $(".posticons [colspan='14']").appendTo('.posticons tr:eq(0)');
            $(".posticons [colspan='4']").remove();
        },

        addForum: function () {
            $('<div class="smiley_box forum"><div>' +
                '<div class="box_header_left">' +
                '<span class="group standard active">' + getText("labels", "std") + '</span>' +
                '<span class="group grepolis">' + getText("labels", "gre") + '</span>' +
                '<span class="group nature">' + getText("labels", "nat") + '</span>' +
                '<span class="group people">' + getText("labels", "ppl") + '</span>' +
                '<span class="group funny">' + getText("labels", "fun") + '</span>' +
                '<span class="group other">' + getText("labels", "oth") + '</span>' +
                (SmileyBox.isHalloween ? '<span class="group hal">' + getText("labels", "halloween") + '</span>' : '') +
                (SmileyBox.isXmas ? '<span class="group xmas">' + getText("labels", "xmas") + '</span>' : '') +
                '</div>' +
                '<div class="box_header_right"><a class="smiley_link" href="http://www.greensmilies.com/smilie-album/" target="_blank">WWW.GREENSMILIES.COM</a></div>' +
                '<hr>' +
                '<div class="box_content" style="overflow: hidden;"><hr></div>' +
                '</div></div><br>').insertAfter(".texteditor");

            SmileyBox.addSmileys("standard", "");

            $('.group').click(function () {
                $('.group.active').removeClass("active");
                $(this).addClass("active");
                // Change smiley group
                SmileyBox.addSmileys(this.className.split(" ")[1], "");
            });
        },*/

        // add smiley box
        add: function (e) {
            var bbcodeBarId = "";
            switch (e) {
                case "/alliance_forum/forum":
                    bbcodeBarId = "#forum";
                    break;
                case "/message/forward":
                    bbcodeBarId = "#message_bbcodes";
                    break;
                case "/message/new":
                    bbcodeBarId = "#message_bbcodes";
                    break;
                case "/player_memo/load_memo_content":
                    bbcodeBarId = "#memo_edit"; // old notes
                    break;
                case "/frontend_bridge/fetch":
                    bbcodeBarId = ".notes_container"; // TODO: new notes
                    break;
            }
            if (($(bbcodeBarId + ' #emots_popup_7').get(0) || $(bbcodeBarId + ' #emots_popup_15').get(0)) && PID == 1538932) {
                $(bbcodeBarId + " .bb_button_wrapper").get(0).lastChild.remove();
            }
            $('<img class="smiley_button" src="https://flasktools.altervista.org/images/smileys/button/smiley_emoticons_smile.gif">').appendTo(bbcodeBarId + ' .bb_button_wrapper');

            $('<div class="smiley_box game">' +
                '<div class="bbcode_box middle_center"><div class="bbcode_box middle_right"></div><div class="bbcode_box middle_left"></div>' +
                '<div class="bbcode_box top_left"></div><div class="bbcode_box top_right"></div><div class="bbcode_box top_center"></div>' +
                '<div class="bbcode_box bottom_center"></div><div class="bbcode_box bottom_right"></div><div class="bbcode_box bottom_left"></div>' +
                '<div class="box_header" style="padding: 0px;">' +
                '<a class="group standard submenu_link active">' +
                '<span class="left"><span class="right"><span class="middle"><img src="https://flasktools.altervista.org/images/smileys/icons/smiley_icons_grin.gif" style="position: relative;top: 3px;"></span></span></span></span></a>' +
                '<a class="group grepolis submenu_link active">' +
                '<span class="left"><span class="right"><span class="middle"><img src="https://flasktools.altervista.org/images/smileys/icons/grepolis.jpg" style="position: relative;top: 3px;"></span></span></span></span></a>' +
                '<a class="group nature submenu_link active">' +
                '<span class="left"><span class="right"><span class="middle"><img src="https://flasktools.altervista.org/images/smileys/icons/natura.png" style="position: relative;top: 3px;"></span></span></span></span></a>' +
                '<a class="group people submenu_link active">' +
                '<span class="left"><span class="right"><span class="middle"><img src="https://flasktools.altervista.org/images/smileys/icons/people.png" style="position: relative;top: 3px;"></span></span></span></span></a>' +
                '<a class="group funny submenu_link active">' +
                '<span class="left"><span class="right"><span class="middle"><img src="https://flasktools.altervista.org/images/smileys/icons/package_games_arcade.png" style="position: relative;top: 3px;"></span></span></span></span></a>' +
                '<a class="group other submenu_link active">' +
                '<span class="left"><span class="right"><span class="middle"><img src="https://flasktools.altervista.org/images/smileys/icons/smiley_icons_weckruf.gif" style="position: relative;top: 3px;"></span></span></span></span></a>' +
                (SmileyBox.isHalloween ? '<a class="group hal submenu_link active">' +
                    '<span class="left"><span class="right"><span class="middle"><img src="https://flasktools.altervista.org/images/smileys/icons/smiley_icons_frankenstein_lol.gif" style="position: relative;top: 3px;"></span></span></span></span></a>' : '') +
                (SmileyBox.isXmas ? '<a class="group xmas submenu_link active">' +
                    '<span class="left"><span class="right"><span class="middle"><img src="https://flasktools.altervista.org/images/smileys/icons/smiley_icons_schneeball.gif" style="position: relative;top: 3px;"></span></span></span></span></a>' : '') +
                '</div>' +
                '<hr>' +
                '<div class="box_content"></div>' +
                '<hr>' +
                '<div class="box_footer"><a href="http://www.greensmilies.com/smilie-album/" target="_blank">WWW.GREENSMILIES.COM</a></div>' +
                '</div>').appendTo(bbcodeBarId + ' .bb_button_wrapper');


            $(bbcodeBarId + ' .group').click(function () {
                $('.group.active').removeClass("active");
                $(this).addClass("active");
                // Change smiley group
                SmileyBox.addSmileys(this.className.split(" ")[1], "#" + $(this).closest('.bb_button_wrapper').parent().get(0).id);
            });

            SmileyBox.addSmileys("standard", bbcodeBarId);

            // smiley box toggle
            $(bbcodeBarId + " .smiley_button").toggleClick(
                function () {
                    this.src = smileyArray.button[0].src;
                    $(this).closest('.bb_button_wrapper').find(".smiley_box").get(0).style.display = "block";
                    if (first) {
                        first = false;
                        SmileyBox.addSmileys("standard", "#message_bbcodes");
                    }
                },
                function () {
                    this.src = smileyArray.button[1].src;
                    $(this).closest('.bb_button_wrapper').find(".smiley_box").get(0).style.display = "none";
                }
            );
        },

        // insert smileys from arrays into smiley box
        addSmileys: function (type, bbcodeBarId) {
            if (!bbcodeBarId) return;

            // reset smilies
            if ($(bbcodeBarId + " .box_content").get(0)) {
                $(bbcodeBarId + " .box_content").get(0).innerHTML = '';
            }
            // add smilies
            for (var e in smileyArray[type]) {
                if (smileyArray[type].hasOwnProperty(e)) {
                    $(smileyArray[type][e]).clone().appendTo(bbcodeBarId + " .box_content");
                    //$('<img class="smiley" src="' + smileyArray[type][e].src + '" alt="" />').appendTo(bbcodeBarId + " .box_content");
                }
            }
            $('.smiley').css({ margin: '0px', padding: '2px', maxHeight: '35px', cursor: 'pointer' });

            $(bbcodeBarId + " .box_content .smiley").click(function () {
                var textarea;
                if (uw.location.pathname.indexOf("game") >= 0) {
                    // hide smiley box
                    $(this).closest('.bb_button_wrapper').find(".smiley_button").click();
                    // find textarea
                    textarea = $(this).closest('.gpwindow_content').find("textarea").get(0);
                } else {

                    if ($('.editor_textbox_container').get(0)) {
                        textarea = $('.editor_textbox_container .cke_contents textarea').get(0);
                    } else {
                        $(this).appendTo('iframe .forum');
                    }
                }
                var text = $(textarea).val();
                $(textarea).val(text.substring(0, $(textarea).get(0).selectionStart) + "[img]" + this.src + "[/img]" + text.substring($(textarea).get(0).selectionEnd));
            });
        }
    };


    /*******************************************************************************************************************************
      * Biremes counter
      * ----------------------------------------------------------------------------------------------------------------------------
      * | ●  Incremental update when calling a city (experimental, especially intended for siege worlds)
      * ----------------------------------------------------------------------------------------------------------------------------
      * @deprecated
      * *****************************************************************************************************************************/

    // TODO: Altes Feature entfernen
    var BiremeCounter = {
        activate: function () {
            $(".picomap_container").prepend("<div id='available_units'><div id='bi_count'></div></div>");

            $('.picomap_overlayer').tooltip(getText("options", "bir")[0]);
            BiremeCounter.update();

            // Style
            $('<style id="flask_bireme_counter">' +
                '#available_units { background: url(https://gp' + MID + '.innogamescdn.com/images/game/units/units_sprite_90x90_compressed.jpg); height:90px;' +
                'width:90px; position: relative; margin: 5px 28px 0px 28px; background-position: -270px 0px; } ' +
                '#bi_count { color:#826021; position:relative; top:28px; font-style:italic; width:79px; } ' +
                '#sea_id { background: none; font-size:25px; cursor:default; height:50px; width:50px; position:absolute; top:70px; left:157px; z-index: 30; } ' +
                '</style>').appendTo('head');

            // fs_count: color: #FFC374;position: relative;top: 30px;font-style: italic;width: 101px;text-shadow: 1px 1px 0px rgb(69, 0, 0);
            // manti: background-position: -1350px 180px;
            // manti-count: color: #ECD181;position: relative;top: 48px;font-style: italic;width: 52px;text-shadow: 2px 2px 0px rgb(0, 0, 0);
            // medusa:-1440px 182px;
            // med-count: color: #DEECA4;position: relative;top: 50px;font-style: italic;width: 55px;text-shadow: 2px 2px 0px rgb(0, 0, 0);

            // Set Sea-ID beside the bull eye
            $('#sea_id').prependTo('#ui_box');
        },
        deactivate: function () {
            $('#available_units').remove();
            $('#flask_bireme_counter').remove();
            $('#sea_id').appendTo('.picomap_container');
        },
        save: function () {
            saveValue(WID + "_biremes", JSON.stringify(biriArray));
        },
        update: function () {
            var sum = 0, e;
            if ($('#bi_count').get(0)) {
                for (e in biriArray) {
                    if (biriArray.hasOwnProperty(e)) {
                        if (!uw.ITowns.getTown(e)) { // town is no longer in possession of user
                            delete biriArray[e];
                            BiremeCounter.save();
                        } else {
                            sum += parseInt(biriArray[e], 10);
                        }
                    }
                }

                sum = sum.toString();
                var str = "", fsize = ['1.4em', '1.2em', '1.15em', '1.1em', '1.0em'], i;

                for (i = 0; i < sum.length; i++) {
                    str += "<span style='font-size:" + fsize[i] + "'>" + sum[i] + "</span>";
                }
                $('#bi_count').get(0).innerHTML = "<b>" + str + "</b>";
            }
        },
        get: function () {
            var biremeIn = parseInt(uw.ITowns.getTown(uw.Game.townId).units().bireme, 10),
                biremeOut = parseInt(uw.ITowns.getTown(uw.Game.townId).unitsOuter().bireme, 10);
            if (isNaN(biremeIn)) biremeIn = 0;
            if (isNaN(biremeOut)) biremeOut = 0;
            if (!biriArray[uw.Game.townId] || biriArray[uw.Game.townId] < (biremeIn + biremeOut)) {
                biriArray[uw.Game.townId] = biremeIn;
            }
            BiremeCounter.update();
            BiremeCounter.save();
        },
        getDocks: function () {
            var windowID = uw.BuildingWindowFactory.getWnd().getID(),
                biremeTotal = parseInt($('#gpwnd_' + windowID + ' #unit_order_tab_bireme .unit_order_total').get(0).innerHTML, 10);

            if (!isNaN(biremeTotal)) biriArray[uw.Game.townId] = biremeTotal;
            BiremeCounter.update();
            BiremeCounter.save();
        },
        getAgora: function () {
            var biremeTotal = parseInt(uw.ITowns.getTown(parseInt(uw.Game.townId, 10)).units().bireme, 10);
            if (isNaN(biremeTotal)) biremeTotal = 0;

            $('#units_beyond_list .bireme').each(function () {
                biremeTotal += parseInt(this.children[0].innerHTML, 10);
            });
            biriArray[uw.Game.townId] = biremeTotal;
            BiremeCounter.update();
            BiremeCounter.save();
        }
    };

    /*******************************************************************************************************************************
     * Favor Popup
     * ----------------------------------------------------------------------------------------------------------------------------
     * | ●  Improved favor popup
     * ----------------------------------------------------------------------------------------------------------------------------
     *******************************************************************************************************************************/
    var FavorPopup = {
        godArray: {
            zeus: 'zeus',
            hera: 'hera',
            poseidon: 'poseidon',
            athena: 'athena',
            hades: 'hades',
            artemis: 'artemis',
            aphrodite: 'aphrodite',
            ares: 'ares',
        },

        activate: function () {
            $('.gods_area').bind('mouseover', function () {
                FavorPopup.setFavorPopup();
            });
        },

        deactivate: function () {
            $('.gods_area').unbind('mouseover');
        },

        setFavorPopup: function () {

            var pic_row = "", fav_row = "", prod_row = "", fury_row = "", textColor, tooltip_str, tooltip_fury;
            var FavorMonde = ""; //(WID == "fr121" ||WID == "en119" ||WID == "en117" || WID == "it71" || WID == "it70" || WID == "de106")

            for (var g in FavorPopup.godArray) {
                if (FavorPopup.godArray.hasOwnProperty(g)) {
                    if (uw.ITowns.player_gods.attributes.temples_for_gods[g]) {
                        pic_row += '<td><div style="transform:scale(0.8); margin: -6px;"; class="god_mini ' + [g] + '";></td>';
                        textColor = ((uw.ITowns.player_gods.attributes[g + "_favor"]) == uw.ITowns.player_gods.attributes.max_favor) ? textColor = "color:red;" : textColor = "color:blue";
                        fav_row += '<td class="bold" style="' + textColor + '">' + uw.ITowns.player_gods.attributes[g + "_favor"] + '</td>';
                        prod_row += '<td class="bold">' + uw.ITowns.player_gods.attributes.production_overview[g].production + '</td>';
                    }
                }
            }

            textColor = ((uw.ITowns.player_gods.attributes.fury) == uw.ITowns.player_gods.attributes.max_fury) ? textColor = "color:red;" : textColor = "color:blue";
            fury_row = '<td class="bold" style="' + textColor + '">' + uw.ITowns.player_gods.attributes.fury + '/' + uw.ITowns.player_gods.attributes.max_fury + '</td>';

            tooltip_str = $('<table><tr><td></td>' + pic_row + '</tr>' +
                '<tr align="center"><td><img src="https://gp' + MID + '.innogamescdn.com/images/game/res/favor.png"></td>' + fav_row + '</tr>' +
                '<tr align="center"><td>+</td>' + prod_row + '</tr>' +
                '</table>');
            tooltip_fury = $('<div id"tooltip"><table><tr align="center"><td><img src="https://flasktools.altervista.org/images/fury.png"></td>' + fury_row + '</tr>' +
                '</table></div>');

            $('.favor_amount').tooltip(tooltip_str);
            //if (Game.gods_active.ares) {
            $('.fury_amount').tooltip(tooltip_fury);
        }
    };

    /*******************************************************************************************************************************
     * GUI Optimization
     * ----------------------------------------------------------------------------------------------------------------------------
     * | ● Larger taskbar and minimize daily reward-window on startup
     * | ● Modify chat
     * | ● Improved display of troops and trade activity boxes (movable with position memory on startup)
     * ----------------------------------------------------------------------------------------------------------------------------
     *******************************************************************************************************************************/


    // Minimize Daily reward window on startup
    function minimizeDailyReward() {
        /*
         $.Observer(uw.GameEvents.window.open).subscribe('FLASK_WINDOW', function(u,dato){});
         $.Observer(uw.GameEvents.window.reload).subscribe('FLASK_WINDOW2', function(f){});
         */
        if (MutationObserver) {
            var startup = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.addedNodes[0]) {
                        if ($('.daily_login').get(0)) { //  && !uw.GPWindowMgr.getOpenFirst(uw.Layout.wnd.TYPE_SHOW_ON_LOGIN).isMinimized()
                            $('.daily_login').find(".minimize").click();
                            //uw.GPWindowMgr.getOpenFirst(uw.Layout.wnd.TYPE_SHOW_ON_LOGIN).minimize();
                        }
                    }
                });
            });
            startup.observe($('body').get(0), { attributes: false, childList: true, characterData: false });

            setTimeout(function () {
                startup.disconnect();
            }, 3000);
        }
    }

    // Larger taskbar
    var Taskbar = {
        activate: function () {
            $('.minimized_windows_area').get(0).style.width = "150%";
            $('.minimized_windows_area').get(0).style.left = "-25%";
        },
        deactivate: function () {
            $('.minimized_windows_area').get(0).style.width = "100%";
            $('.minimized_windows_area').get(0).style.left = "0%";
        }
    };

    // Hide fade out buttons
    function hideNavElements() {
        if (Game.premium_features.curator <= Timestamp.now()) {
            $('.nav').each(function () {
                this.style.display = "none";
            });
        }
    }


    /*******************************************************************************************************************************
     * Activity boxes
     * ----------------------------------------------------------------------------------------------------------------------------
     * | ●  Show troops and trade activity boxes
     * | ●  Boxes are magnetic & movable (position memory)
     * ----------------------------------------------------------------------------------------------------------------------------
     *******************************************************************************************************************************/

    var ActivityBoxes = {
        activate: function () {
            try {
                $("#toolbar_activity_recruits_list").hover(
                    function () {
                        if ($("#flask_plusmenuRecruits").length == 0) {
                            $("#toolbar_activity_recruits_list").append('<div id="flask_plusmenuRecruits" class="flask_plusmenu"><div id="flask_plusdraghandleRecruits" class="flask_plusdraghandle"></div><a class="flask_plusback"></a></div>');
                            $('#flask_plusmenuRecruits .flask_plusback').click(() => { flask_plus_destroy("flask_plusmenuRecruits"); });
                        }
                    }, function () { $('#flask_plusmenuRecruits').remove(); }
                );
                $("#toolbar_activity_commands_list .sandy-box").hover(
                    function () {
                        if ($("#flask_plusmenuCommands").length == 0) {
                            $("#toolbar_activity_commands_list .sandy-box").append('<div id="flask_plusmenuCommands" class="flask_plusmenu"><div id="flask_plusdraghandleCommands" class="flask_plusdraghandle"></div><a class="flask_plusback"></a></div>');
                            $('#flask_plusmenuCommands .flask_plusback').click(() => {
                                flask_plus_destroy("flask_plusmenuCommands");
                            });
                        }
                    }, function () {
                        $('#flask_plusmenuCommands').remove();
                    });
                $("#toolbar_activity_trades_list").hover(
                    function () {
                        if ($("#flask_plusmenuTrades").length == 0) {
                            $("#toolbar_activity_trades_list").append('<div id="flask_plusmenuTrades" class="flask_plusmenu"><div id="flask_plusdraghandleTrades" class="flask_plusdraghandle"></div><a class="flask_plusback"></a></div>');
                            $('#flask_plusmenuTrades .flask_plusback').click(() => {
                                flask_plus_destroy("flask_plusmenuTrades");
                            });
                        }
                    }, function () { $('#flask_plusmenuTrades').remove(); }
                );
                $("#toolbar_activity_temple_commands_list").hover(
                    function () {
                        if ($("#flask_plusmenuTemple_commands").length == 0) {
                            $("#toolbar_activity_temple_commands_list").append('<div id="flask_plusmenuTemple_commands" class="flask_plusmenu"><div id="flask_plusdraghandleTemple_commands" class="flask_plusdraghandle"></div><a class="flask_plusback"></a></div>');
                            $('#flask_plusmenuTemple_commands .flask_plusback').click(() => {
                                flask_plus_destroy("flask_plusmenuTemple_commands");
                            });
                        }
                    }, function () { $('#flask_plusmenuTemple_commands').remove(); }
                );

                $('<style id="flask_plusmenustyle" type="text/css">' +
                    '.displayImp {display: block !important;}' +
                    '.flask_plusmenu {margin:6px 22px 2px 5px;height:11px;display:block;position:relative;}' +
                    '.flask_plusdraghandle {cursor:-webkit-grab; width:100%;height:11px;position:absolute;background:url(https://flasktools.altervista.org/images/draghandle.png)}' +
                    '.flask_plusback {right:-18px;margin-top:-1px;width:16px;height:12px;position:absolute;background:url(https://flasktools.altervista.org/images/plusback.png)}' +
                    '#toolbar_activity_recruits_list {min-width: 113px;}' +
                    '.dropdown-list .item_no_results, .dropdown-list.ui-draggable>div {cursor:text!important;}' +
                    '#toolbar_activity_commands_list .unit_movements .details_wrapper, #toolbar_activity_commands_list .unit_movements .icon { visibility: visible }' +
                    '#toolbar_activity_commands_list .cancel { display: none !important; }' +
                    '</style>').appendTo('head');

                $('#toolbar_activity_recruits_list').draggable({
                    cursor: "move",
                    handle: ".flask_plusdraghandle",
                    start: function () {
                        $("#flask_plusmenuRecruitsSTYLE").remove();
                        $('#toolbar_activity_recruits_list').addClass("displayImp");
                    },
                    stop: function () {
                        var flask_position = $('#toolbar_activity_recruits_list').position();
                        $('<style id="flask_plusmenuRecruitsSTYLE" type="text/css">#toolbar_activity_recruits_list {left: ' + flask_position.left + 'px !important;top: ' + flask_position.top + 'px !important}</style>').appendTo('head');
                    }
                });
                $('#toolbar_activity_commands_list.fast').draggable({
                    cursor: "move",
                    handle: ".flask_plusdraghandle",
                    start: function () {
                        $("#flask_plusmenuCommandsSTYLE").remove();
                        $('#toolbar_activity_commands_list.fast').addClass("displayImp");
                    },
                    stop: function () {
                        var flask_position = $('#toolbar_activity_commands_list.fast').position();
                        $('<style id="flask_plusmenuCommandsSTYLE" type="text/css">#toolbar_activity_commands_list.fast {left: ' + flask_position.left + 'px !important;top: ' + flask_position.top + 'px !important}</style>').appendTo('head');
                    }
                });
                $('#toolbar_activity_trades_list').draggable({
                    cursor: "move",
                    handle: ".flask_plusdraghandle",
                    start: function () {
                        $("#flask_plusmenuTradesSTYLE").remove();
                        $('#toolbar_activity_trades_list').addClass("displayImp");
                    },
                    stop: function () {
                        var flask_position = $('#toolbar_activity_trades_list').position();
                        $('<style id="flask_plusmenuTradesSTYLE" type="text/css">#toolbar_activity_trades_list {left: ' + flask_position.left + 'px !important;top: ' + flask_position.top + 'px !important}</style>').appendTo('head');
                    }
                });
                $('#toolbar_activity_temple_commands_list').draggable({
                    cursor: "move",
                    handle: ".flask_plusdraghandle",
                    start: function () {
                        $("#flask_plusmenuTemple_commandsSTYLE").remove();
                        $('#toolbar_activity_temple_commands_list').addClass("displayImp");
                    },
                    stop: function () {
                        var flask_position = $('#toolbar_activity_temple_commands_list').position();
                        $('<style id="flask_plusmenuTemple_commandsSTYLE" type="text/css">#toolbar_activity_temple_commands_list {left: ' + flask_position.left + 'px !important;top: ' + flask_position.top + 'px !important}</style>').appendTo('head');
                    }
                });

                function flask_plus_destroy(flaskJQselector) {
                    if (flaskJQselector == "flask_plusmenuCommands") {
                        $("#" + flaskJQselector).parent().parent().removeClass("displayImp");
                        $('#toolbar_activity_commands_list').removeClass("flask_commands");
                        $('<style id="flask_plusmenuCommandsSTYLE" type="text/css">#toolbar_activity_commands_list .sandy-box {left:initial !important; top:initial !important; }</style>').appendTo('head');
                        clearTimeout(ActivityBoxes.timeout);
                        ActivityBoxes.timeout = null;
                        $('#toolbar_activity_commands_list .cancel').click();
                    }
                    else $("#" + flaskJQselector).parent().removeClass("displayImp");
                    $("#" + flaskJQselector + "STYLE").remove();
                }
            } catch (error) { errorHandling(error, "ActivityBoxes"); }
        },
        add: () => {
            ActivityBoxes.timeout = setInterval(() => {
                $("#toolbar_activity_commands").trigger("mouseenter");
            }, 1000);
        },
        deactivate: function () {// toolbar_activity_temple_commands
            $('#flask_plusmenustyle').remove();

            $('#flask_plusmenuRecruits').remove();
            $("#flask_plusmenuRecruitsSTYLE").remove();

            $('#flask_plusmenuCommands').remove();
            $("#flask_plusmenuCommandsSTYLE").remove();

            $('#flask_plusmenuTrades').remove();
            $('#flask_plusmenuTradesSTYLE').remove();

            $('#flask_plusmenuTemple_commands').remove();
            $("#flask_plusmenuTemple_commandsSTYLE").remove();


            clearTimeout(ActivityBoxes.timeout);
            ActivityBoxes.timeout = null;
        },
    };

    /*******************************************************************************************************************************
     * Counter
     *******************************************************************************************************************************/

    function counter(time) {
        var type = "", today, counted, year, month, day;
        if (uw.Game.market_id !== "zz") {
            counted = DATA.count;
            today = new Date((time + 7200) * 1000);
            year = today.getUTCFullYear();
            month = ((today.getUTCMonth() + 1) < 10 ? "0" : "") + (today.getUTCMonth() + 1);
            day = (today.getUTCDate() < 10 ? "0" : "") + today.getUTCDate();
            today = year + month + day;
            //console.log(today);
            if (counted[0] !== today) {
                type += "d";
            }
            if (counted[1] == false) {
                type += "t";
            }
            if ((counted[2] == undefined) || (counted[2] == false)) {
                type += "b";
            }
            if (type !== "") {
                $.ajax({
                    type: "GET",
                    url: "https://diotools.de/game/count.php?type=" + type + "&market=" + uw.Game.market_id + "&date=" + today + "&browser=" + getBrowser(),
                    dataType: 'text',
                    success: function (text) {
                        if (text.indexOf("dly") > -1) {
                            counted[0] = today;
                        }
                        if (text.indexOf("tot") > -1) {
                            counted[1] = true;
                        }
                        if (text.indexOf("bro") > -1) {
                            counted[2] = true;
                        }
                        saveValue("flask_count", JSON.stringify(counted));
                    }
                });
            }
        }
    }


    /*******************************************************************************************************************************
     * Political Map
     *******************************************************************************************************************************/

    var PoliticalMap = {
        data: null,
        activate: function () {
            $('<div id="flask_political_map">' +
                '<div class="canvas_wrapper"></div>' +
                '<select class="zoom_select">' +
                '<option value="0.50">1 : 0.50</option>' +
                '<option value="0.75">1 : 0.75</option>' +
                '<option value="1.00" selected>1 : 1.00</option>' +
                '<option value="1.25">1 : 1.25</option>' +
                '<option value="1.50">1 : 1.50</option>' +
                '<option value="2.00">1 : 2.00</option>' +
                '<option value="3.00">1 : 3.00</option>' +
                '</select>' +
                '<div class="legend sandy-box">' +
                '<div class="corner_tl"></div>' +
                '<div class="corner_tr"></div>' +
                '<div class="corner_bl"></div>' +
                '<div class="corner_br"></div>' +
                '<div class="border_t"></div>' +
                '<div class="border_b"></div>' +
                '<div class="border_l"></div>' +
                '<div class="border_r"></div>' +
                '<div class="middle"></div>' +
                '<div class="content"><div class="item"></div></div>' +
                '</div></div>').appendTo('#ui_box');

            // Style
            $('<style id="flask_political_map_style">' +
                '#flask_political_map { width:100%; height:100%; z-index:3; background:#123d70; display:none; position:absolute; top:0; } ' +
                '#flask_political_map.active { display: block; } ' +
                '#flask_political_map .canvas_wrapper { } ' +
                '#flask_political_map canvas { position: absolute; cursor:move; top:0; left:0; } ' +
                '#flask_political_map .zoom_select { position:absolute; top:70px; left:300px; font-size: 2em; opacity:0.5; } ' +
                '#flask_political_map .zoom_select:hover { opacity:1; } ' +
                '#flask_political_map .legend { position:absolute; right:200px; top:50px; width:200px; height:auto; text-align:left; } ' +
                '#flask_political_map .legend .color_checker { width:15px; height:15px; float:left; border:1px solid rgb(100, 100, 0); margin:5px; position:relative; cursor:pointer; } ' +

                '.btn_political_map { top:56px; left:-4px; z-index:10; position:absolute; } ' +

                '.btn_political_map .ico_political_map { margin:7px 0px 0px 8px; width:17px; height:17px; background:url(https://flasktools.altervista.org/images/pltgqlaw.png) no-repeat 0px 0px; background-size:100%; } ' +
                // https://flasktools.altervista.org/images/k4wikrlq.png // https://flasktools.altervista.org/images/ahfr8227.png
                '.btn_political_map .ico_political_map.checked { margin-top:8px; } ' +
                '</style>').appendTo('head');

            PoliticalMap.addButton();

            var zoomSelect = $('.zoom_select');

            zoomSelect.change(function () {
                //PoliticalMap.zoomToCenter();
            });
            zoomSelect.on("change", function () {
                PoliticalMap.zoomToCenter();
            });

            ColorPicker.init();
        },
        deactivate: function () {
            $('.btn_political_map').remove();
            $('#flask_political_map_style').remove();
        },
        addButton: function () {
            var m_ZoomFactor = 1.0;
            $('<div class="btn_political_map circle_button" name="political_map"><div class="ico_political_map js-caption"></div></div>').appendTo(".bull_eye_buttons");

            var politicalMapButton = $('.btn_political_map');

            // Tooltip
            politicalMapButton.tooltip("Political Map"); // TODO: Language

            // Events
            politicalMapButton.on('mousedown', function () {
                //$('.btn_political_map, .ico_political_map').addClass("checked");
            }).on('mouseup', function () {
                //$('.btn_political_map, .ico_political_map').removeClass("checked");
            });

            $('.rb_map .option').click(function () {
                $('.btn_political_map, .ico_political_map').removeClass("checked");
                $('#flask_political_map').removeClass("active");
                $(this).addClass("checked");
            });

            politicalMapButton.click(function () {
                $('.rb_map .checked').removeClass("checked");
                $('.btn_political_map, .ico_political_map').addClass("checked");
                $('#flask_political_map').addClass("active");

                if ($('#flask_political_map').hasClass("active")) {
                    if (PoliticalMap.data == null) {
                        $('#ajax_loader').css({ visibility: "visible" });
                        // Map-Daten aus DB auslesen
                        PoliticalMap.loadMapData();
                    } else {
                        //PoliticalMap.drawMap(PoliticalMap.data);
                    }
                }
            });
        },
        /**
         * Läd die Allianzen und Inseln aus der Datenbank
         * @since 3.0
         */
        loadMapData: function () {
            $.ajax({
                type: "GET",
                url: "https://diotools.de/php/map.php?world_id=" + WID + "&callback=jsonCallback",
                //dataType: 'jsonp',
                //async: false,
                //jsonpCallback: 'jsonCallback',
                //contentType: "application/json",
                success: function (response) {
                    if (response !== "") {
                        PoliticalMap.data = response;

                        var m_ZoomFactor = $('.zoom_select').get(0)[$('.zoom_select').get(0).selectedIndex].selected;

                        PoliticalMap.drawMap(PoliticalMap.data, m_ZoomFactor);

                        $('#ajax_loader').css({ visibility: "hidden" });

                        // Überprüfen, ob die Weltdaten geupdatet werden müssen
                        $.ajax({
                            type: "GET",
                            url: "https://diotools.de/php/update_db.php?world_id=" + WID
                        });
                    } else {
                        // Welt existiert noch nicht in DB
                        $.ajax({
                            type: "GET", url: "https://diotools.de/php/update_db.php?world_id=" + WID,
                            success: function () {
                                // Map-Daten aus DB auslesen, wenn die Weltdaten erfolgreich in die DB geladen wurden
                                $.ajax({
                                    type: "GET",
                                    url: "https://diotools.de/php/map.php?world_id=" + WID,
                                    success: function (response) {
                                        PoliticalMap.data = response;

                                        var m_ZoomFactor = $('.zoom_select').get(0)[$('.zoom_select').get(0).selectedIndex].selected;

                                        PoliticalMap.drawMap(PoliticalMap.data, m_ZoomFactor);

                                        $('#ajax_loader').css({ visibility: "hidden" });
                                    }
                                });
                            }
                        });
                    }
                }
            });
        },
        /**
         * Ändert die Zoomstufe der Karte zum Zentrum hin
         *
         * @param _zoom
         * @since 3.0
         */
        zoomToCenter: function () {
            var _zoom = $('.zoom_select').get(0)[$('.zoom_select').get(0).selectedIndex].value;

            var canvas = $('#flask_political_map canvas'),

                canvas_size = parseInt($('#flask_political_map canvas').width(), 10); // Breite und HÃ¶he sind immer gleich

            var canvas_style = $('#flask_political_map .canvas_wrapper').get(0).style;

            // Berechnung: Alter Abstand + (1000 * Zoomänderung / 2)
            canvas_style.top = parseInt(canvas_style.top, 10) + (1000 * (canvas_size / 1000 - _zoom)) / 2 + "px";
            canvas_style.left = parseInt(canvas_style.left, 10) + (1000 * (canvas_size / 1000 - _zoom)) / 2 + "px";

            PoliticalMap.clearMap();
            PoliticalMap.drawMap(PoliticalMap.data, _zoom);

        },
        /**
         * Ändert die Zoomstufe der Karte zur Cursorposition hin
         *
         * @param _zoom
         * @param _pos
         *
         * @since 3.0
         */
        zoomToCursorPosition: function (_zoom, _pos) {

        },
        /**
         * Zeichnet die Karte in ein Canvas
         *
         * @param _islandArray {Array}
         * @param _zoom {int}
         *
         * @since 3.0
         */
        drawMap: function (_islandArray, _zoom) {

            $('<canvas class="canv_map" height="' + (1000 * _zoom) + 'px" width="' + (1000 * _zoom) + "px\"></canvas>").prependTo('.canvas_wrapper')

            // TODO: Weite und Höhe vom Fenster ermitteln, Update Containment bei onResizeWindow
            $('#flask_political_map .canvas_wrapper').draggable({
                // left, top, right, bottom
                //containment: [-500 * _zoom, -300 * _zoom, 500 * _zoom, 300 * _zoom],
                distance: 10,
                grid: [100 * _zoom, 100 * _zoom],
                //limit: 500,
                cursor: 'pointer'
            });

            var ally_ranking = JSON.parse(_islandArray)['ally_ranking'];
            var island_array = JSON.parse(_islandArray)['ally_island_array'];


            var c = $('#flask_political_map .canv_map')[0].getContext('2d');

            // Grid
            c.strokeStyle = 'rgb(0,100,0)';

            for (var l = 0; l <= 10; l++) {
                // Horizontal Line
                c.moveTo(0, l * 100 * _zoom);
                c.lineTo(1000 * _zoom, l * 100 * _zoom);
                c.stroke();

                // Vertical Line
                c.moveTo(l * 100 * _zoom, 0);
                c.lineTo(l * 100 * _zoom, 1000 * _zoom);
                c.stroke();
            }

            // Center Circle
            c.beginPath();
            c.arc(500 * _zoom, 500 * _zoom, 100 * _zoom, 0, Math.PI * 2, true);
            c.fillStyle = 'rgba(0,100,0,0.2)';
            c.fill();
            c.stroke();

            // Sea numbers
            c.fillStyle = 'rgb(0,100,0)';

            for (var y = 0; y <= 10; y++) {
                for (var x = 0; x <= 10; x++) {
                    c.fillText(y + "" + x, y * 100 * _zoom + 2, x * 100 * _zoom + 10);
                }
            }

            // Alliance Colors
            var colorArray = ["#00A000", "yellow", "red", "rgb(255, 116, 0)", "cyan", "#784D00", "white", "purple", "#0078FF", "deeppink", "darkslategrey"];

            // Islands
            for (var t in island_array) {
                if (island_array.hasOwnProperty(t)) {
                    var tmp_points = 0, dom_ally = "";
                    for (var ally in island_array[t]) {
                        if (island_array[t].hasOwnProperty(ally)) {
                            if (tmp_points < island_array[t][ally] && (ally !== "X") && (ally !== "")) {
                                tmp_points = island_array[t][ally];
                                dom_ally = ally;
                            }
                        }
                    }

                    c.fillStyle = colorArray[parseInt(ally_ranking[dom_ally], 10) - 1] || "darkslategrey";
                    //c.fillRect(t.split("x")[0] * _zoom, t.split("x")[1] * _zoom, 3 * _zoom, 3 * _zoom);

                    //c.beginPath();
                    //console.info(island_array[t]);
                    //c.arc(t.split("x")[0], t.split("x")[1], 2, 0, Math.PI * 2, true);
                    //c.fillRect(t.split("x")[0] * _zoom,t.split("x")[1] * _zoom, 3 * _zoom, 3 * _zoom);
                    //c.fill();

                    // TEST HEATMAP
                    //console.debug("Blaaa", c.fillStyle);
                    if (c.fillStyle !== "#2f4f4f") {
                        var color = c.fillStyle;

                        var radgrad = c.createRadialGradient(t.split("x")[0] * _zoom + 1, t.split("x")[1] * _zoom + 1, 0, t.split("x")[0] * _zoom + 1, t.split("x")[1] * _zoom + 1, 10);
                        radgrad.addColorStop(0, PoliticalMap.convertHexToRgba(color, 0.2));
                        radgrad.addColorStop(0.6, PoliticalMap.convertHexToRgba(color, 0.2));
                        radgrad.addColorStop(1, PoliticalMap.convertHexToRgba(color, 0.0));

                        // draw shape
                        c.fillStyle = radgrad;

                        c.fillRect(t.split("x")[0] * _zoom - 10, t.split("x")[1] * _zoom - 10, 22, 22);

                        c.fillStyle = PoliticalMap.convertHexToRgba(color, 0.7);
                        c.fillRect(t.split("x")[0] * _zoom, t.split("x")[1] * _zoom, 3 * _zoom, 3 * _zoom);
                    }
                    else {
                        c.fillRect(t.split("x")[0] * _zoom, t.split("x")[1] * _zoom, 3 * _zoom, 3 * _zoom);
                    }
                }
            }



            // Legende
            var legend = $('#flask_political_map .legend .content');

            legend.get(0).innerHTML = "";

            for (var ally in ally_ranking) {
                if (ally_ranking.hasOwnProperty(ally)) {
                    //legend.append("<div class='item' style='color:"+ colorAllyArray[ally] +"'><div class='color_checker' style='background-color:"+ colorAllyArray[ally] +"'></div>...</div>");

                    if (ally_ranking[ally] > 10) {
                        legend.append("<div class='item' style='color:" + colorArray[ally_ranking[ally] - 1] + "'><div class='color_checker' style='background-color:" + colorArray[ally_ranking[ally] - 1] + "'></div>...</div>");

                        break;
                    } else {
                        legend.append("<div class='item' style='color:" + colorArray[ally_ranking[ally] - 1] + "'><div class='color_checker' style='background-color:" + colorArray[ally_ranking[ally] - 1] + "'></div>" + ally + "</div>");

                    }
                }
            }

            $('#flask_political_map .legend .color_checker').click(function (event) {
                // getting user coordinates
                var x = event.pageX - this.offsetLeft;
                var y = event.pageY - this.offsetTop;

                console.debug("Color Checker", event.pageX, this.offsetLeft);

                ColorPicker.open(x, y);
            });


            // TODO: Wenn eine Farbe ausgewÃ¤hlt wurde, soll [...]
            $(ColorPicker).on("onColorChanged", function (event, color) {
                console.debug("Farbe setzen", event, color);

                $.ajax({
                    type: "POST",
                    url: "https://" + Game.world_id + ".grepolis.com/game/alliance?town_id=" + Game.townId + "&action=assign_map_color&h=" + Game.csrfToken,
                    data: {
                        "json": "{\"alliance_id\":\"217\",\"color\":" + color + ",\"player_id\":\"8512878\",\"town_id\":\"71047\",\"nl_init\":true}"
                    },
                    success: function (response) {
                        console.debug("Erfolgreich Ã¼bertragen", response);
                    }
                });
            });

        },
        convertHexToRgba: function (hex, opacity) {
            console.debug("hex", hex);
            hex = hex.replace('#', '');
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);

            result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';
            return result;
        },
        /**
         * Zeichnet die Weltwunder auf der Karte
         *
         * @param _islandArray {Array}
         * @param _zoom {int}
         *
         * @since 3.0
         */

        clearMap: function () {
            $('#flask_political_map .canv_map').remove();
            $('#flask_political_map .canv_ww').remove();
        },
        getAllianceColors: function () {
            $.ajax({
                type: "GET",
                url: "https://" + Game.world_id + ".grepolis.com/game/map_data?town_id=" + Game.townId + "&action=get_custom_colors&h=" + Game.csrfToken,
                dataType: 'json',
                success: function (response) {
                    // Allianzbox herausfiltern
                    var html_string = $('#alliance_box', $(response.json.list_html));

                    var flagArray = $('.flag', html_string);
                    var linkArray = $('a', html_string);

                    var allianceColorArray = [];

                    for (var i = 0; i < flagArray.length; i++) {
                        allianceColorArray[i] = {
                            "id": parseInt(linkArray[i].attributes.onclick.value.split(",")[1].split(")")[0], 10),
                            "color": flagArray[i].style.backgroundColor
                        };
                    }

                    // console.debug("ANTWORT", allianceColorArray);
                }
            });
        }
    };

    var ColorPicker = {
        open: function (pos_left, pos_top) {
            $('#flask_color_picker').removeClass("hidden");
            $('#flask_color_picker').css({
                left: pos_left,
                top: pos_top
            });
        },
        close: function () {
            $('#flask_color_picker').addClass("hidden");
        },
        init: function () {
            // Style
            $('<style id="flask_color_picker_style">' +
                '#flask_color_picker { left:200px;top:300px;position:absolute;z-index:1000;} ' +
                '#flask_color_picker.hidden { display:none;} ' +
                '#flask_color_picker span.grepo_input, ' +
                '#flask_color_picker a.color_table, ' +
                '#flask_color_picker a.confirm, ' +
                '#flask_color_picker a.cancel' +
                ' { float:left; } ' +
                '</style>').appendTo('head');

            $(
                '<canvas width="600" height="440" style="left:200px !important;top:100px !important;" id="canvas_picker" onclick="console.debug(this.getContext(\'2d\').getImageData(10, 10, 1, 1).data)"></canvas>' +
                '<div id="hex">HEX: <input type="text"></input></div>' +
                '<div id="rgb">RGB: <input type="text"></input></div>'
            ).prependTo('#flask_political_map')

            $(
                '<div id="flask_color_picker" class="hidden"><table class="bb_popup" cellpadding="0" cellspacing="0"><tbody>' +
                '<tr class="bb_popup_top">' +
                '<td class="bb_popup_top_left"></td>' +
                '<td class="bb_popup_top_middle"></td>' +
                '<td class="bb_popup_top_right"></td>' +
                '</tr>' +
                '<tr>' +
                '<td class="bb_popup_middle_left"></td>' +
                '<td class="bb_popup_middle_middle">' +
                '<div class="bb_color_picker_colors">' +
                '<div style="background-color: rgb(255, 0, 0);"></div>' +
                '<div style="background-color: rgb(0, 255, 0);"></div>' +
                '<div style="background-color: rgb(0, 0, 255);"></div>' +
                '</div>' +
                '<a href="#" class="cancel"></a>' +
                '<span class="grepo_input">' +
                '<span class="left">' +
                '<span class="right">' +
                '<input class="color_string" style="width:50px;" maxlength="6" type="text">' +
                '</span>' +
                '</span>' +
                '</span>' +
                '<a href="#" class="color_table"><input type="color" id="c" tabindex=-1 class="hidden"></a>' +
                '<a href="#" class="confirm"></a>' +
                '</td>' +
                '<td class="bb_popup_middle_right"></td>' +
                '</tr>' +
                '<tr class="bb_popup_bottom">' +
                '<td class="bb_popup_bottom_left"></td>' +
                '<td class="bb_popup_bottom_middle"></td>' +
                '<td class="bb_popup_bottom_right"></td>' +
                '</tr>' +
                '</tbody></table></div>'
            ).prependTo('#flask_political_map');

            var canvas = document.getElementById('canvas_picker').getContext('2d');

            var count = 5, line = 0, width = 16, height = 12, sep = 1;

            var offset = (count - 2) * width;

            for (var i = 2, j = 0; i < count; i++, j++) {

                line = 0;

                // Pinktöne (255,0,255)
                canvas.fillStyle = "rgb(" + ((i / count * 255) | 0) + ", 0, " + ((i / count * 255) | 0) + ")";
                canvas.fillRect(i * width, line, width - sep, height - sep);

                canvas.fillStyle = "rgb(255," + ((j / (count - 1) * 255) | 0) + ", 255)";
                canvas.fillRect(i * width + offset, line, width - sep, height - sep);

                line = line + height;

                // Rosatöne (255,0,127)
                canvas.fillStyle = "rgb(" + ((i / count * 255) | 0) + ", 0, " + ((i / count * 127) | 0) + ")";
                canvas.fillRect(i * width, line, width - sep, height - sep);

                canvas.fillStyle = "rgb(255," + ((j / (count - 1) * 255) | 0) + "," + (127 + ((j / (count - 1) * 127) | 0)) + ")";
                canvas.fillRect(i * width + offset, line, width - sep, height - sep);

                line = line + height;

                // Rottöne (255,0,0)
                canvas.fillStyle = "rgb(" + ((i / count * 255) | 0) + ", 0, 0)";
                canvas.fillRect(i * width, line, width - sep, height - sep);

                canvas.fillStyle = "rgb(255," + ((j / (count - 1) * 255) | 0) + "," + ((j / (count - 1) * 255) | 0) + ")";
                canvas.fillRect(i * width + offset, line, width - sep, height - sep);

                line = line + height;

                // Orangetöne (255, 127, 0)
                canvas.fillStyle = "rgb(" + ((i / count * 255) | 0) + ", " + ((i / count * 127) | 0) + ", 0)";
                canvas.fillRect(i * width, line, width - sep, height - sep);

                canvas.fillStyle = "rgb(255, " + (127 + ((j / (count - 1) * 127) | 0)) + "," + ((j / (count - 1) * 255) | 0) + ")";
                canvas.fillRect(i * width + offset, line, width - sep, height - sep);

                line = line + height;

                // Dunkelbrauntöne (170, 85, 0)
                canvas.fillStyle = "rgb(" + ((i / count * 170) | 0) + ", " + ((i / count * 85) | 0) + ", 0)";
                canvas.fillRect(i * width, line, width - sep, height - sep);

                canvas.fillStyle = "rgb(" + (170 + (j / (count - 1) * 85) | 0) + ", " + (85 + ((j / (count - 1) * 170) | 0)) + "," + ((j / (count - 1) * 255) | 0) + ")";
                canvas.fillRect(i * width + offset, line, width - sep, height - sep);

                line = line + height;

                // Brauntöne (191, 127, 0)
                canvas.fillStyle = "rgb(" + ((i / count * 191) | 0) + ", " + ((i / count * 127) | 0) + ", 0)";
                canvas.fillRect(i * width, line, width - sep, height - sep);

                canvas.fillStyle = "rgb(" + (191 + (j / (count - 1) * 64) | 0) + ", " + (127 + ((j / (count - 1) * 127) | 0)) + "," + ((j / (count - 1) * 255) | 0) + ")";
                canvas.fillRect(i * width + offset, line, width - sep, height - sep);

                line = line + height;

                // Gelbtöne (255,255,0)
                canvas.fillStyle = "rgb(" + ((i / count * 255) | 0) + ", " + ((i / count * 255) | 0) + ", 0)";
                canvas.fillRect(i * width, line, width - sep, height - sep);

                canvas.fillStyle = "rgb(255, 255," + ((j / (count - 1) * 255) | 0) + ")";
                canvas.fillRect(i * width + offset, line, width - sep, height - sep);

                line = line + height;

                // Gelbgrüntöne (127,255,0)
                canvas.fillStyle = "rgb(" + ((i / count * 127) | 0) + "," + ((i / count * 191) | 0) + ", 0)";
                canvas.fillRect(i * width, line, width - sep, height - sep);

                canvas.fillStyle = "rgb(" + (127 + (j / (count - 1) * 127) | 0) + "," + (191 + (j / (count - 1) * 64) | 0) + "," + ((j / (count - 1) * 255) | 0) + ")";
                canvas.fillRect(i * width + offset, line, width - sep, height - sep);

                line = line + height;

                // Dunkelgrasgrüntöne (85, 170, 0)
                /*
                 canvas.fillStyle = "rgb("+ ((i/count*85)|0) +", "+ ((i/count*170)|0) +", 0)";
                 canvas.fillRect(i * width, line, width-sep, height-sep);

                 canvas.fillStyle = "rgb("+ (85 + (j/(count-1)*170)|0) +", "+ (170 + ((j/(count-1)*85)|0)) +","+ ((j/(count-1)*255)|0) +")";
                 canvas.fillRect(i * width + offset, line, width-sep, height-sep);

                 line = line + height;
                 */

                // Grüntöne (0,255,0)
                canvas.fillStyle = "rgb(0," + ((i / count * 255) | 0) + ", 0)";
                canvas.fillRect(i * width, line, width - sep, height - sep);

                canvas.fillStyle = "rgb(" + ((j / (count - 1) * 255) | 0) + ", 255," + ((j / (count - 1) * 255) | 0) + ")";
                canvas.fillRect(i * width + offset, line, width - sep, height - sep);

                line = line + height;

                // Türkistöne (0,255,127)
                /*
                 canvas.fillStyle = "rgb(0,"+ ((i/count*255)|0) +","+ ((i/count*127)|0) + ")";
                 canvas.fillRect(i * width, line, width-sep, height-sep);

                 canvas.fillStyle = "rgb("+ ((j/(count-1)*255)|0) +", 255,"+ (127 + ((j/(count-1)*127)|0)) +")";
                 canvas.fillRect(i * width + offset, line, width-sep, height-sep);

                 line = line + height;
                 */

                // Dunkel-Türkistöne (0,191,127)
                canvas.fillStyle = "rgb(0, " + ((i / count * 191) | 0) + "," + ((i / count * 127) | 0) + ")";
                canvas.fillRect(i * width, line, width - sep, height - sep);

                canvas.fillStyle = "rgb(" + ((j / (count - 1) * 255) | 0) + "," + (191 + (j / (count - 1) * 64) | 0) + ", " + (127 + ((j / (count - 1) * 127) | 0)) + ")";
                canvas.fillRect(i * width + offset, line, width - sep, height - sep);

                line = line + height;


                // Cyantöne (0,255,255)
                canvas.fillStyle = "rgb(0, " + ((i / count * 255) | 0) + ", " + ((i / count * 255) | 0) + ")";
                canvas.fillRect(i * width, line, width - sep, height - sep);

                canvas.fillStyle = "rgb(" + ((j / (count - 1) * 255) | 0) + ",255, 255)";
                canvas.fillRect(i * width + offset, line, width - sep, height - sep);

                line = line + height;

                // Hellblautöne (0,127,255)
                canvas.fillStyle = "rgb(0, " + ((i / count * 127) | 0) + "," + ((i / count * 255) | 0) + ")";
                canvas.fillRect(i * width, line, width - sep, height - sep);

                canvas.fillStyle = "rgb(" + ((j / (count - 1) * 255) | 0) + "," + (127 + ((j / (count - 1) * 127) | 0)) + ", 255)";
                canvas.fillRect(i * width + offset, line, width - sep, height - sep);

                line = line + height;

                // Blautöne (0,0,255)
                canvas.fillStyle = "rgb(0, 0, " + ((i / count * 255) | 0) + ")";
                canvas.fillRect(i * width, line, width - sep, height - sep);

                canvas.fillStyle = "rgb(" + ((j / (count - 1) * 255) | 0) + "," + ((j / (count - 1) * 255) | 0) + ", 255)";
                canvas.fillRect(i * width + offset, line, width - sep, height - sep);

                line = line + height;

                // Lilatöne (127,0,255)
                canvas.fillStyle = "rgb(" + ((i / count * 127) | 0) + ", 0, " + ((i / count * 255) | 0) + ")";
                canvas.fillRect(i * width, line, width - sep, height - sep);

                canvas.fillStyle = "rgb(" + (127 + ((j / (count - 1) * 127) | 0)) + "," + ((j / (count - 1) * 255) | 0) + ", 255)";
                canvas.fillRect(i * width + offset, line, width - sep, height - sep);

                line = line + height;

                // Grautöne
                /*
                 canvas.fillStyle = "rgb("+ ((i/count*127)|0) +", "+ ((i/count*127)|0) +", "+ ((i/count*127)|0) +")";
                 canvas.fillRect(i * width, line, width-sep, height-sep);

                 canvas.fillStyle = "rgb("+ (127 + ((j/(count-1)*127)|0)) +","+ (127 + ((j/(count-1)*127)|0)) +","+ (127 + ((j/(count-1)*127)|0)) +")";
                 canvas.fillRect(i * width + offset, line, width-sep, height-sep);

                 line = line + height;
                 */

            }

            line = line + height;

            for (var i = 0; i <= count; i++) {
                // Grautöne
                canvas.fillStyle = "rgb(" + ((i / count * 255) | 0) + ", " + ((i / count * 255) | 0) + ", " + ((i / count * 255) | 0) + ")";
                canvas.fillRect(i * width + width * 2, line, width - sep, height - sep);
            }


            // http://www.javascripter.net/faq/rgbtohex.htm
            function rgbToHex(R, G, B) {
                return toHex(R) + toHex(G) + toHex(B)
            }

            function toHex(n) {
                n = parseInt(n, 10);
                if (isNaN(n)) return "00";
                n = Math.max(0, Math.min(n, 255));
                return "0123456789ABCDEF".charAt((n - n % 16) / 16) + "0123456789ABCDEF".charAt(n % 16);
            }

            $('#flask_color_picker a.cancel').click(function () {
                ColorPicker.close();
            });


            $('#flask_color_picker a.confirm').click(function () {
                // Custom-Event auslösen
                $(ColorPicker).trigger("onColorChanged", [$('#flask_color_picker .color_string')[0].value]);
                ColorPicker.close();
            });

            $('#flask_color_picker a.color_table').click(function () {
                document.getElementById("c").click();
            });

            $('#flask_color_picker a.color_table #c').change(function () {
                $('#flask_color_picker input.color_string')[0].value = this.value;
                $('#flask_color_picker input.color_string')[0].style.color = this.value;
            });
        }
    };

    var UnitImages = {
        activate: function () {
            $('<style id="flask_unit_images">' +

                '.unit_icon25x25 { background-image: url(https://flasktools.altervista.org/images/game/units/unit_icons_25x25_2.91.png);} ' +
                '.unit_icon40x40 { background-image: url(https://flasktools.altervista.org/images/game/units/unit_icons_40x40_2.91.png);} ' +
                '.unit_icon50x50 { background-image: url(https://flasktools.altervista.org/images/game/units/unit_icons_50x50_2.91.png);} ' +
                '.unit_icon90x90 { background-image: url(https://flasktools.altervista.org/images/game/units/unit_icons_90x90_2.91.png);} ' +

                '.unit_icon228x165 { background-image: none; height:0px;} ' +
                '.unit_card .deco_statue { background-image: none !important;} ' +
                '.grepo_box_silver .border_l, .grepo_box_silver .border_r { background-image: none;} ' +
                '.box_corner .box_corner_tl, .grepo_box_silver .box_corner_tr { height:31px; } ' +
                '.grepo_box_silver .grepo_box_content { padding: 21px 10px 0px; } ' +

                '</style>').appendTo('head');
        },
        deactivate: function () {
            $('#flask_unit_images').remove();

        }
    };

    /*******************************************************************************************************************************
     * Holiday Special
     *******************************************************************************************************************************/

    var HolidaySpecial = {
        isHalloween: false, isXmas: false, isNewYear: false, isEaster: false,

        activate: function () {
            var daystamp = 1000 * 60 * 60 * 24, today = new Date((new Date()) % (daystamp * (365 + 1 / 4))), // without year

                // Halloween -> 15 days
                halloween_start = daystamp * 297, // 25. Oktober
                halloween_end = daystamp * 321, // 8. November
                // Xmas -> 28 days
                xmas_start = daystamp * 334, // 1. Dezember
                xmas_end = daystamp * 361, // 28. Dezember
                // NewYear -> 7 days
                newYear_start = daystamp * 0, // 1. Januar
                newYear_end = daystamp * 7; // 7. Januar

            HolidaySpecial.isHalloween = (today >= halloween_start) ? (today <= halloween_end) : false;

            HolidaySpecial.isXmas = (today >= xmas_start) ? (today <= xmas_end) : false;

            HolidaySpecial.isNewYear = (today >= newYear_start) ? (today <= newYear_end) : false;

            if (HolidaySpecial.isXmas) { HolidaySpecial.XMas.add(); }
            if (HolidaySpecial.isNewYear) { HolidaySpecial.NewYear.add(); }

            // Calculation Easter

            // Jahreszahl
            var X = 2016;

            // Säkularzahl
            var K = parseInt(X / 100, 10);
            // Mondparameter
            var A = X % 19;

            // säkulare Mondschaltung
            var M = 15 + parseInt((3 * K + 3) / 4, 10) - parseInt((8 * K + 13) / 25, 10);

            // säkulare Sonnenschaltung
            var S = 2 - parseInt((3 * K + 3) / 4, 10);

            // Erster Vollmond im Frühling
            var D = (19 * A + M) % 30;

            // Kalendarische Korrekturgröße
            var R = parseInt((D + parseInt(A / 11, 10)) / 29, 10);

            // Ostergrenze
            var OG = 21 + D - R;

            // Erster Sonntag im März
            var SZ = 7 - ((2016 + parseInt(2016 / 4, 10) + S) % 7);

            // Entfernung des Ostersonntags von der Ostergrenze
            var OE = 7 - ((OG - SZ) % 7);

            // Ostersonntag als Märzdatum
            var OS = OG + OE;

            // console.debug("FLASK-TOOLS | Ostersonntag: " + OS);

        },
        XMas: {
            add: function () {
                $('<a href="http://www.greensmilies.com/smilie-album/weihnachten-smilies/" target="_blank"><div id="flask_xmas"></div></a>').appendTo('#ui_box');

                var flaskXMAS = $('#flask_xmas');

                flaskXMAS.css({
                    background: 'url("https://flasktools.altervista.org/images/smileys/xmas/smiley_emoticons_weihnachtsmann_nordpol.gif") no-repeat',
                    height: '51px',
                    width: '61px',
                    position: 'absolute',
                    bottom: '10px',
                    left: '60px',
                    zIndex: '2000'
                });
                flaskXMAS.tooltip("Ho Ho Ho, Merry Christmas!");
            }
        },
        NewYear: {
            add: function () {
                // TODO: Jahreszahl dynamisch setzen
                $('<a href="http://www.greensmilies.com/smilie-album/" target="_blank"><div id="flask_newYear">' +
                    '<img src="https://flasktools.altervista.org/images/smileys/sign2_2.gif">' +
                    '<img src="https://flasktools.altervista.org/images/smileys/sign2_0.gif">' +
                    '<img src="https://flasktools.altervista.org/images/smileys/sign2_2.gif">' +
                    '<img src="https://flasktools.altervista.org/images/smileys/sign2_5.gif">' +
                    '</div></a>').appendTo('#ui_box');

                var flaskNewYear = $('#flask_newYear');

                flaskNewYear.css({
                    position: 'absolute',
                    bottom: '10px',
                    left: '70px',
                    zIndex: '10'
                });
                flaskNewYear.tooltip("Happy new year!");
            }
        }
    };

    /*******************************************************************************************************************************
    * Town BBCode
    * ----------------------------------------------------------------------------------------------------------------------------
    * | ●  Improved a button for town bbcode
    * ----------------------------------------------------------------------------------------------------------------------------
    *******************************************************************************************************************************/

    var TownBbc = {
        activate: function () {

            //TownBbc.addButton();
            TownBbc.addButton();

            // Style
            $('<style id="flask_townbb_style"> ' +

                // Button
                '#flask_townbb { top:23px; left:184px; z-index:5000; position:absolute; margin:5px 0px 0px 4px; width:22px; height:23px; background:url(https://flasktools.altervista.org/images/bbcodes.png) no-repeat -273px -5px; } ' +

                // Style
                '#input_townbb { display: none; position: absolute; left: 21px; top: 29px; width: 160px; text-align: center; z-index: 5; background: transparent; font-weight: bold; border: 0;} ' +

                '</style>').appendTo("head");

            // Handle town switch
            $.Observer(uw.GameEvents.town.town_switch).subscribe("flask_input_townbb", () => {
                $('#input_townbb').hide();
            })
        },
        deactivate: function () {
            $('#flask_townbb').remove();
            $('#flask_townbb_style').remove();
            $('#input_townbb').remove();
            $.Observer(uw.GameEvents.town.town_switch).unsubscribe("flask_input_townbb");
        },
        addButton: function () {

            $('<a id="flask_townbb" href="#"></a><input id="input_townbb" type="text" onfocus="this.select();" onclick="this.select();">').appendTo('.town_name_area');

            $("#flask_townbb").click(function () {
                $("#input_townbb").toggle();
                $("#input_townbb").val("[town]" + Game.townId + "[/town]");
                $(".casted_powers_area .casted_power.power_icon16x16").toggle();
            });

            // Tooltip
            $('#flask_townbb').tooltip(getText("labels", "tbc"));
        },
    };

    /*******************************************************************************************************************************
    * Culture Overview
    * ----------------------------------------------------------------------------------------------------------------------------
    * | ●  Improved a new tool on the culture overview from quacktools
    * ----------------------------------------------------------------------------------------------------------------------------
    *******************************************************************************************************************************/

    var CultureOverview = {

        activate: function () {
            { setTimeout(function () { CultureOverview.activate(); }, 2); }
            var a = $("ul#cultur_overview_towns");
            var b, c, d, e;

            e = 0;
            b = $('a[class~="confirm"][class~="type_triumph"]');
            d = $('a[class~="confirm"][class~="type_triumph"][class~="disabled"]');
            if (d.length > 0) {
                for (var f = 0; f < b.length; f++) {
                    if ($(b[f]).attr("class").indexOf("disabled") > 1)
                        continue;
                    c = $(b[f]).parents('li[id^="ov_town_"]');
                    eltext = c[0].previousSibling;
                    $(c).insertBefore($(d[0]).parents('li[id^="ov_town_"]'));
                    $(eltext).insertBefore($(d[0]).parents('li[id^="ov_town_"]'))
                }
            }

            e = 0;
            b = $('a[class~="confirm"][class~="type_theater"]');
            d = $('a[class~="confirm"][class~="type_theater"][class~="disabled"]');
            if (d.length > 0) {
                for (var f = 0; f < b.length; f++) {
                    if ($(b[f]).attr("class").indexOf("disabled") > 1)
                        continue;
                    c = $(b[f]).parents('li[id^="ov_town_"]');
                    eltext = c[0].previousSibling;
                    $(c).insertBefore($(d[0]).parents('li[id^="ov_town_"]'));
                    $(eltext).insertBefore($(d[0]).parents('li[id^="ov_town_"]'))
                }
            }

            e = 0;
            b = $('a[class~="confirm"][class~="type_party"]');
            d = $('a[class~="confirm"][class~="type_party"][class~="disabled"]');
            if (d.length > 0) {
                for (var f = 0; f < b.length; f++) {
                    if ($(b[f]).attr("class").indexOf("disabled") > 1)
                        continue;
                    c = $(b[f]).parents('li[id^="ov_town_"]');
                    eltext = c[0].previousSibling;
                    $(c).insertBefore($(d[0]).parents('li[id^="ov_town_"]'));
                    $(eltext).insertBefore($(d[0]).parents('li[id^="ov_town_"]'))
                }
            }

            var g = $("ul#culture_overview_towns span.eta");
            var h = $("#culture_points_overview_bottom #place_culture_count").text();
            if (h.indexOf("[") < 1) {
                var i = h.split("/");
                var j = parseInt(i[0]) + g.length;
                var k = parseInt(i[1]) - j;
                if (k > 0) {
                    $("#culture_points_overview_bottom #place_culture_count").append("<span id='flask_culture'>[-" + k + "]</span>");
                } else {
                    var l = new Array;
                    for (var f = 0; f < g.length; f++)
                        l.push($(g[f]).text());
                    l.sort();
                    var m = l[l.length + k - 1];
                    $("#culture_points_overview_bottom #place_culture_count").append(" [<span id='flask_culture'></span>]<span id='flask_culture_plus' style='color: #ECB44D'> +" + k * -1 + "</span>").find("span#flask_culture").countdown(m);
                }
            } else {
                var i = h.split("/");
                var j = parseInt(i[0]) + g.length;
                var k = parseInt(i[1]) - j;
                if (k > 0) {
                    $("#flask_culture").text("[-" + k + "]");
                } else {
                    cultureOverview.activate.wnd.reloadContent();
                }
            }

            if ($('#flask_cultureBTN_wrapper').length == 0) {
                $("#culture_overview_wrapper").parent().append('<div id="flask_cultureBTN_wrapper"><div class="flask_cultureBTN_wrapper_right"><div id="flask_cultureBTN_theather_r" class="flask_cultureBTN_r flask_cultureBTN_theather"></div>' +
                    '<div id="flask_cultureBTN_triumph_r" class="flask_cultureBTN_r flask_cultureBTN_triumph"></div><div id="flask_cultureBTN_olympicgames_r" class="flask_cultureBTN_r flask_cultureBTN_olympicgames"></div>' +
                    '<div id="flask_cultureBTN_cityfestival_r" class="flask_cultureBTN_r flask_cultureBTN_cityfestival"></div></div></div>');
                $("#culture_overview_wrapper").css({
                    "top": "35px",
                    "height": "350px"
                });
                $("#flask_cultureBTN_wrapper").css({

                    "color": "white",
                    "font-family": "Verdana",
                    "font-weight": "bold",
                    "font-size": "12px",
                    "text-align": "center",
                    "line-height": "25px",
                    "text-shadow": "1px 1px 0 #000000"
                });
                $(".flask_cultureBTN_wrapper_left").css({
                    "position": "absolute",
                    "top": "0px",
                    "left": "0px",
                    "margin-left": "7px"
                });
                $(".flask_cultureBTN_wrapper_right").css({
                    "position": "absolute",
                    "top": "0px",
                    "right": "0px"
                });
                $(".flask_cultureBTN_l, .flask_cultureBTN_r").css({
                    "cursor": "pointer",
                    "width": "25px",
                    "height": "25px",
                    "float": "right",
                    "position": "relative",
                    "margin-left": "3px",
                    "border": "2px groove gray",
                    "background": "url(https://gpfr.innogamescdn.com/images/game/overviews/celebration_bg_new.png)"
                });
                $(".flask_cultureBTN_cityfestival").css({
                    "background-position": "0 -109px"
                });
                $(".flask_cultureBTN_olympicgames").css({
                    "background-position": "0 -140px"
                });
                $(".flask_cultureBTN_triumph").css({
                    "background-position": "0 -110px"
                });
                $(".flask_cultureBTN_theather").css({
                    "background-position": "0 -170px"
                });
                var flask_cultureBTN_r_clicked_last = "";
                function hideTownElements(JQelement) {
                    var flask_cultureBTN_mode = "";
                    switch (JQelement.id) {
                        case "flask_cultureBTN_cityfestival_r":
                            flask_cultureBTN_mode = "ul li:eq(0)";
                            break;
                        case "flask_cultureBTN_olympicgames_r":
                            flask_cultureBTN_mode = "ul li:eq(1)";
                            break;
                        case "flask_cultureBTN_triumph_r":
                            flask_cultureBTN_mode = "ul li:eq(2)";
                            break;
                        case "flask_cultureBTN_theather_r":
                            flask_cultureBTN_mode = "ul li:eq(3)";
                            break;
                        default:
                            setTimeout(function () { uw.HumanMessage.error("Error"); }, 0);
                            break;
                    }
                    if (flask_cultureBTN_r_clicked_last === JQelement.id) {
                        $("ul#culture_overview_towns li").filter(function () {
                            return !!$(flask_cultureBTN_mode, this).find('.eta').length;
                        }).toggle();
                        $(JQelement).toggleClass("culture_red");
                    } else {
                        $("ul#culture_overview_towns li").show().filter(function () {
                            return !!$(flask_cultureBTN_mode, this).find('.eta').length;
                        }).hide();
                        $(".flaskcultureBTN_r").removeClass("culture_red");
                        $(JQelement).addClass("culture_red");
                    }
                    flask_cultureBTN_r_clicked_last = JQelement.id;
                    $(".flask_cultureBTN_r").css({
                        border: "2px groove #808080"
                    });
                    $(".culture_red").css({
                        border: "2px groove #CC0000"
                    });
                }
                $(".flask_cultureBTN_r").click(function () {
                    hideTownElements(this);
                });
                /*
                function hideCelebrationElements (JQelement) {
                $(".flaskcultureBTN_r").css({border: "2px groove #808080"});
                $(".culture_red").css({border: "2px groove #CC0000"});
                $("ul#culture_overview_towns li ul.celebration_wrapper li:nth-child(2)").hide();
                $("ul#culture_overview_towns li ul.celebration_wrapper li:nth-child(4)").hide();
                }
                $(".flaskcultureBTN_l").click(function () {
                hideCelebrationElements(this);
                });*/
            }

            var flask_cultureCounter = {
                cityfestivals: 0,
                olympicgames: 0,
                triumph: 0,
                theather: 0
            };

            var flask_bashpoints = $("#culture_points_overview_bottom .points_count").text().split("/");
            var flask_goldforgames = Math.floor($("#ui_box .gold_amount").text() / 50);
            flask_cultureCounter.triumph = Math.floor((parseInt(flask_bashpoints[0]) - parseInt(flask_bashpoints[1])) / 300) + 1;
            if (flask_cultureCounter.triumph < 0) {
                flask_cultureCounter.triumph = 0;
            }
            flask_cultureCounter.cityfestivals = $('a[class~="confirm"][class~="type_party"]:not(.disabled)').length;
            flask_cultureCounter.olympicgames = $('a[class~="confirm"][class~="type_games"]:not(.disabled)').length;
            if (flask_goldforgames < flask_cultureCounter.olympicgames) {
                flask_cultureCounter.olympicgames = flask_goldforgames;
            }
            flask_cultureCounter.theather = $('a[class~="confirm"][class~="type_theater"]:not(.disabled)').length;

            $("#flask_cultureBTN_cityfestival_r").text(flask_cultureCounter.cityfestivals);
            $("#flask_cultureBTN_olympicgames_r").text(flask_cultureCounter.olympicgames);
            $("#flask_cultureBTN_triumph_r").text(flask_cultureCounter.triumph);
            $("#flask_cultureBTN_theather_r").text(flask_cultureCounter.theather);
            $(".flask_cultureBTN_cityfestival").mousePopup(new MousePopup(getText("culture", "cityfestivals")));
            $(".flask_cultureBTN_olympicgames").mousePopup(new MousePopup(getText("culture", "olympicgames")));
            $(".flask_cultureBTN_triumph").mousePopup(new MousePopup(getText("culture", "triumph")));
            $(".flask_cultureBTN_theather").mousePopup(new MousePopup(getText("culture", "theater")));
            //$("ul#culture_overview_towns li ul.celebration_wrapper li:nth-child(2)").hide();

        },
        deactivate: function () {
            $('#flask_cultureBTN_cityfestival').remove();
            $('#flask_cultureBTN_olympicgames').remove();
            $('#flask_cultureBTN_triumph').remove();
            $('#flask_cultureBTN_theather').remove();
            $("#flask_cultureBTN_wrapper").remove();
        },
    };

    /*******************************************************************************************************************************
    * Select unit helper
    * ----------------------------------------------------------------------------------------------------------------------------
    * | ●  Improved the select unit helper from quacktools
    * ----------------------------------------------------------------------------------------------------------------------------
    *******************************************************************************************************************************/

    var selectunitshelper = {

        activate: function () {
            { setTimeout(function () { selectunitshelper.activate(); }, 0); }
            var wnds = GPWindowMgr.getOpen(Layout.wnd.TYPE_TOWN);
            for (var e in wnds) {
                if (wnds.hasOwnProperty(e)) {
                    var wndid = wnds[e].getID();

                    var testel = $('DIV#gpwnd_' + wndid + ' A.flask_balanced');
                    if (testel.length > 0) continue;

                    var handler = wnds[e].getHandler();

                    $('DIV#gpwnd_' + wndid + ' A.select_all_units').after(' | <a class="flask_balanced" style="position:relative; top:3px" href="#">' + getText("town_info", "no_overload") + '</a> | <a class=flask_delete" style="position:relative; top:3px" href="#">' + getText("town_info", "delete") + '</a>');

                    var gt_bl_groundUnits = new Array('sword', 'slinger', 'archer', 'hoplite', 'rider', 'chariot', 'catapult', 'minotaur', 'zyklop', 'medusa', 'cerberus', 'fury', 'centaur', 'calydonian_boar', 'godsent');

                    $('DIV#gpwnd_' + wndid + ' A.flask_balanced').click(function () {
                        var units = new Array();
                        var item;

                        for (var i = 0; i < gt_bl_groundUnits.length; i++) {
                            if (handler.data.units[gt_bl_groundUnits[i]]) {
                                item = { name: gt_bl_groundUnits[i], count: handler.data.units[gt_bl_groundUnits[i]].count, population: handler.data.units[gt_bl_groundUnits[i]].population };
                                units.push(item);
                            }
                        }

                        if (handler.data.researches && handler.data.researches.berth) {
                            var berth = handler.data.researches.berth;
                        } else {
                            var berth = 0;
                        }

                        var totalCap = handler.data.units.big_transporter.count * (handler.data.units.big_transporter.capacity + berth) + handler.data.units.small_transporter.count * (handler.data.units.small_transporter.capacity + berth);
                        units.sort(function (a, b) {
                            return b.population - a.population;
                        });

                        for (i = 0; i < units.length; i++) {
                            if (units[i].count == 0) {
                                units.splice(i, 1);
                                i = i - 1;
                            };
                        }

                        var restCap = totalCap;
                        var sendUnits = new Array();
                        for (i = 0; i < units.length; i++) {
                            item = { name: units[i].name, count: 0 };
                            sendUnits[units[i].name] = item;
                        };

                        var hasSent;
                        k = 0;
                        while (units.length > 0) {
                            hasSent = false;
                            k = k + 1;
                            for (i = 0; i < units.length; i++) {
                                if (units[i].population <= restCap) {
                                    hasSent = true;
                                    units[i].count = units[i].count - 1;
                                    sendUnits[units[i].name].count = sendUnits[units[i].name].count + 1;
                                    restCap = restCap - units[i].population;
                                }
                            }
                            for (i = 0; i < units.length; i++)
                                if (units[i].count == 0) {
                                    units.splice(i, 1);
                                    i = i - 1;
                                };
                            if (!hasSent) {
                                break;
                            }
                        }

                        handler.getUnitInputs().each(function () {
                            if (!sendUnits[this.name]) {
                                if (handler.data.units[this.name].count > 0)
                                    this.value = handler.data.units[this.name].count;
                                else
                                    this.value = '';
                            }
                        });

                        for (i = 0; i < gt_bl_groundUnits.length; i++) {
                            if (sendUnits[gt_bl_groundUnits[i]]) {
                                if (sendUnits[gt_bl_groundUnits[i]].count > 0)
                                    $('DIV#gpwnd_' + wndid + ' INPUT.unit_type_' + gt_bl_groundUnits[i]).val(sendUnits[gt_bl_groundUnits[i]].count);
                                else
                                    $('DIV#gpwnd_' + wndid + ' INPUT.unit_type_' + gt_bl_groundUnits[i]).val('');
                            }
                        }

                        $('DIV#gpwnd_' + wndid + ' INPUT.unit_type_sword').trigger('change');
                    });

                    $('DIV#gpwnd_' + wndid + ' A.flask_delete').click(function () {
                        handler.getUnitInputs().each(function () {
                            this.value = '';
                        });
                        $('DIV#gpwnd_' + wndid + ' INPUT.unit_type_sword').trigger('change');
                    });

                }
            }
        },
        deactivate: function () {
            $('#flask_delete').remove();
            $('#flask_balanced').remove();
        },
    };

    /*******************************************************************************************************************************
    * Units beyond view
    * ----------------------------------------------------------------------------------------------------------------------------
    * | ●  Improved the units beyond view from quacktools
    * ----------------------------------------------------------------------------------------------------------------------------
    *******************************************************************************************************************************/

    var UnitsBeyondView = {

        activate: function () {
            { setTimeout(function () { UnitsBeyondView.activate(); }, 0); }
            var selected_town = ITowns.getTown(Game.townId);
            var GD_units = GameData.units;
            var GD_heroes = GameData.heroes;
            var Transporter_Offset = selected_town.researches().hasBerth() ? GameDataResearches.getBonusBerth() : 0;
            var tr_small_cap = GameData.units.small_transporter.capacity + Transporter_Offset;
            var tr_big_cap = GameData.units.big_transporter.capacity + Transporter_Offset;

            function calculate(tr_type_cap, Transport_Capacity, Ground_Units_BHP) {
                var diff = Transport_Capacity - Ground_Units_BHP;
                var tr_empty = Math.floor(diff / tr_type_cap);
                var rest = tr_type_cap - (diff - (tr_empty * tr_type_cap));
                if (rest != tr_type_cap) {
                    tr_empty++;
                } else {
                    rest = 0;
                }
                return [tr_empty, rest];
            }

            $("#units_beyond_list > LI, .support_row").each(function (i, e) {
                var Ground_Units_BHP = 0;
                var Transport_Capacity = 0;
                var a = $(this).children(".unit_icon40x40");
                a.each(function (index) {
                    var className = this.className.split(' ');
                    var unit = className[className.length - 34];
                    var number = $(this).text().trim();
                    if (!(unit in GD_heroes) && !GD_units[unit].flying && GD_units[unit].capacity == undefined) {
                        Ground_Units_BHP += number * GD_units[unit].population;
                    } else if (!(unit in GD_heroes) && !GD_units[unit].flying && GD_units[unit].capacity != 0) {
                        Transport_Capacity += number * (GD_units[unit].capacity + Transporter_Offset);
                    }
                });

                $(this).find(".place_sendback_container").css({
                    "margin-top": "4px"
                });

                if (Transport_Capacity >= 0) {
                    var tr_small = calculate(tr_small_cap, Transport_Capacity, Ground_Units_BHP);
                    var tr_big = calculate(tr_big_cap, Transport_Capacity, Ground_Units_BHP);
                    var tooltip =
                        '<div flask_sendback style="position: absolute; margin-left: 40px; margin-top: 5px">' +
                        '<div class="flask_sendback_big">' +
                        '<div class="flask_sendback_img" style="background-position: -405px -150px; "><span class="flask_sendback_img_span big_naval">' + tr_big[0] + '</span></div>' +
                        '<div class="flask_sendback_img_helmet" style="background-position: -290px -365px; margin-left: 35px"><span class="flask_sendback_img_span big_land">' + tr_big[1] + '</span></div>' +
                        '</div>' +
                        '<div class="flask_sendback_small">' +
                        '<div class="flask_sendback_img" style="background-position: -405px -175px;"><span class="flask_sendback_img_span small_naval">' + tr_small[0] + '</span></div>' +
                        '<div class="flask_sendback_img_helmet" style="background-position: -290px -365px; margin-left: 35px"><span class="flask_sendback_img_span small_land">' + tr_small[1] + '</span></div>' +
                        '</div></div>';

                    if ($(this).find(".flask_sendback_header_span").length == 0) {
                        $(this).children("h4").append('<span class="flask_sendback_header_span"> (' + Ground_Units_BHP + '/' + Transport_Capacity + ')</span>')
                        $(this).find(".place_sendback_container").append(tooltip);
                    } else {
                        $(this).find(".flask_sendback_header_span").text(' (' + Ground_Units_BHP + '/' + Transport_Capacity + ')');
                        $(this).find(".flask_sendback_big .big_naval").text(tr_big[0]);
                        $(this).find(".flask_sendback_big .big_land").text(tr_big[1]);
                        $(this).find(".flask_sendback_small .small_naval").text(tr_small[0]);
                        $(this).find(".flask_sendback_small .small_land").text(tr_small[1]);
                    }
                }
            });
            $(".flask_sendback_img").css({
                "width": "19px",
                "height": "19px",
                "background-image": "url(https://gpit.innogamescdn.com/images/game/layout/alpha_sprite_2.69.png)",
                "background-repeat": "no-repeat",
                "display": "block",
                "float": "left"
            });
            $(".flask_sendback_img_helmet").css({
                "width": "18px",
                "height": "16px",
                "background-image": "url(https://gpit.innogamescdn.com/images/game/layout/alpha_sprite_2.69.png)",
                "background-repeat": "no-repeat",
                "display": "block",
                "float": "left"
            });
            $(".flask_sendback_img_span").css({
                "margin-left": "25px"
            });
            $(".flask_sendback_small").css({
                "float": "left",
                "margin-top": "1px"
            });
        },
        deactivate: function () {
            $('#flask_sendback_big').remove();
            $('#flask_sendback_small').remove();
        },
    };

    /******************************************************************************************************************************
    * Scrollbar
    * ----------------------------------------------------------------------------------------------------------------------------
    * | ●  Improved a new style for scrollbar
    * ----------------------------------------------------------------------------------------------------------------------------
    *******************************************************************************************************************************/

    var Scrollbar = {
        activate: function () {
            $('<style id="flask_scrollbar">' +

                // Scrollbar Style (not Firefox)
                '::-webkit-scrollbar { width: 13px; } ' +
                '::-webkit-scrollbar-track { background-color: rgba(145, 165, 193, 0.5); border-top-right-radius: 4px; border-bottom-right-radius: 4px; } ' +
                '::-webkit-scrollbar-thumb { background-color: rgba(37, 82, 188, 0.5); border-radius: 3px; } ' +
                '::-webkit-scrollbar-thumb:hover { background-color: rgba(37, 82, 188, 0.8); } ' +

                '</style>').appendTo('head');
        },
        deactivate: function () {
            $('#flask_scrollbar').remove();

        }
    };

    /*******************************************************************************************************************************
     * Town Trade Improvement
     * ----------------------------------------------------------------------------------------------------------------------------
     * | ●  Improved a new button to trade the resources from quacktools
     * ----------------------------------------------------------------------------------------------------------------------------
     *******************************************************************************************************************************/

    var TownTradeImprovement = {
        activate: function () {
        },
        add: function () {
            try {

                if (flask.wnd.find(".flask_needed").length > 0 || flask.wnd.find(".town-capacity-indicator").length == 0)
                    return;

                function getRes(res_type, wnd_id, mode) {
                    var res = {};
                    res.wnd = $("DIV#gpwnd_" + wnd_id);
                    res.selector = res.wnd.find("#town_capacity_" + res_type);
                    res.caption = {
                        curr: parseInt(res.wnd.find("#big_progressbar .caption .curr").html()),
                        max: parseInt(res.wnd.find("#big_progressbar .caption .max").html()),
                        now: parseInt(res.wnd.find("#trade_type_" + res_type + " input").val())
                    }
                    res.amounts = {
                        curr: parseInt(res.selector.find(".curr").html()) || 0,
                        curr2: parseInt(res.selector.find(".curr2").html().substring(3)) || 0,
                        curr3: parseInt(res.selector.find(".curr3").html().substring(3)) || 0,
                        max: parseInt(res.selector.find(".max").html()) || 0
                    }
                    if (mode === "cult" || mode === "cultreverse") {
                        res.amounts.max = (res_type === "stone") ? 18000 : 15000;
                    }
                    if (mode === "cultreverse") {
                        var townrescurrent = $("div#ui_box div.ui_resources_bar div.indicator[data-type='" + res_type + "'] div.amount").text();
                        res.needed = townrescurrent - res.amounts.max;
                    } else {
                        res.needed = res.amounts.max - res.amounts.curr - res.amounts.curr2;
                    }
                    if (mode === "thea" || mode === "theareverse") {
                        res.amounts.max = (res_type === "stone") ? 12000 : 10000;
                    }
                    if (mode === "theareverse") {
                        res.needed = townrescurrent - res.amounts.max;
                    } else {
                        res.needed = res.amounts.max - res.amounts.curr - res.amounts.curr2;
                    }
                    return res;
                }

                flask.wnd.find(".tripple-progress-progressbar").each(function () {
                    var res_type = this.id.split("_")[2];
                    var res = getRes(res_type, flask.wndId);
                    $(this).find(".amounts").append('<span class="flask_needed_' + res_type + '_' + flask.wndId + '"> &#9658; ' + res.needed + '</span>');
                });

                flask.wnd.find("#trade_tab").append(
                    '<div id="flask_improvement_trade">' +
                    '<a id="flask_wood_' + flask.wndId + '_max" class="flask_trade flask_max" style="top:200px"></a>' +
                    '<a id="flask_stone_' + flask.wndId + '_max" class="flask_trade flask_max" style="top:234px"></a>' +
                    '<a id="flask_iron_' + flask.wndId + '_max" class="flask_trade flask_max" style="top:268px"></a>' +
                    '<a id="flask_wood_' + flask.wndId + '_cult" class="flask_trade flask_send_cult" style="top:200px"></a>' +
                    '<a id="flask_stone_' + flask.wndId + '_cult" class="flask_trade flask_send_cult" style="top:234px"></a>' +
                    '<a id="flask_iron_' + flask.wndId + '_cult" class="flask_trade flask_send_cult" style="top:268px"></a>' +
                    '<a id="flask_wood_' + flask.wndId + '_thea" class="flask_trade flask_send_thea" style="top:200px"></a>' +
                    '<a id="flask_stone_' + flask.wndId + '_thea" class="flask_trade flask_send_thea" style="top:234px"></a>' +
                    '<a id="flask_iron_' + flask.wndId + '_thea" class="flask_trade flask_send_thea" style="top:268px"></a>' +
                    '</div>'
                );

                flask.wnd.find(".flask_send_cult").css({
                    "right": "84px",
                    "position": "absolute",
                    "height": "16px",
                    "width": "22px",
                    "background-image": "url(https://flasktools.altervista.org/images/game/trade_cult.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "0px -1px"
                });
                flask.wnd.find(".flask_send_thea").css({
                    "right": "63px",
                    "position": "absolute",
                    "height": "16px",
                    "width": "22px",
                    "background-image": "url(http://flasktools.altervista.org/images/game/trade_thea.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "0px -1px"
                });
                flask.wnd.find(".flask_max").css({
                    "right": "105px",
                    "position": "absolute",
                    "height": "16px",
                    "width": "22px",
                    "background-image": "url(https://flasktools.altervista.org/images/game/trade_arrow.png)",
                    "background-repeat": "no-repeat",
                    "background-position": "0px -1px"
                });

                flask.wnd.find(".flask_trade").hover(
                    function () {
                        $(this).css({
                            "background-position": "0px -17px"
                        });
                    },
                    function () {
                        $(this).css({
                            "background-position": "0px -1px"
                        });
                    });

                flask.wnd.find(".flask_trade").click(function () {
                    var id = this.id.split("_");
                    var res = getRes(id[1], id[2], id[3]);
                    if (res.needed - res.amounts.curr3 <= 0 || res.caption.curr <= 0 || res.amounts.curr3 > 0) {
                        res.send = 0;
                    } else if (res.needed - res.amounts.curr3 > res.caption.curr) {
                        res.send = res.caption.curr + res.amounts.curr3
                    } else {
                        res.send = res.needed;
                    }
                    res.wnd.find("#trade_type_" + id[1] + " input").val(res.send).select().blur();
                });

                // Tooltip
                $('.flask_max').tooltip(getText("market", "maxresources"));
                $('.flask_send_cult').tooltip(getText("market", "cityfestivals"));
                $('.flask_send_thea').tooltip(getText("market", "theater"));

            } catch (error) {
                errorHandling(error, "TownTradeImprovement");
            }
        },
        deactivate: function () {
            $('#flask_improvement_trade').remove();
        },
    };

    /*******************************************************************************************************************************
     * Hotkeys
     *******************************************************************************************************************************/

    var Hotkeys = {
        ImagesHotkeys: {
            key: 'https://flasktools.altervista.org/images/dj4uootz.jpg',
            city_select: 'https://flasktools.altervista.org/images/nzhgrbzm.png',
            administrator: 'https://flasktools.altervista.org/images/j4kvrnok.png',
            captain: 'https://flasktools.altervista.org/images/8r8ty3md.png',
            menu: 'https://flasktools.altervista.org/images/giiagnrp.png'
        },
        activate: () => {
            $('.toolbar_activities .right').before('<a id="BTN_HK" style="z-index: 6; top: -27px; left: 24px; float: right; position: relative;"><img src="https://flasktools.altervista.org/images/hotkeys.png" style="float:left; border-width: 0px"></a></a>');

            $('<style id="flask_hotkeys_style">.town_name_area {z-index: 6}</style>').appendTo('head');
            if ($('#gsa_shortcutOverview').is(':visible')) {
                if ($('.temple_commands').is(':visible')) { $('<style id="MH_attsup_style">#MH_attsup {left:422px !important;}</style>').appendTo('head'); }
                else { $('<style id="MH_attsup_style">#MH_attsup {left:422px !important;}</style>').appendTo('head'); }
            }
            else {
                if ($('.temple_commands').is(':visible')) { $('<style id="MH_attsup_style">#MH_attsup {left:413px !important;}</style>').appendTo('head'); }
                else { $('<style id="MH_attsup_style">#MH_attsup {left:384px !important;}</style>').appendTo('head'); }
            }
            var mousePopupHTML = '<div id="flasktest" style="max-width: 205px; margin: 0 3px -10px 3px; border-right: 1px solid #B48F45; float: left; display:inline-block"><span style="margin-bottom:3px; display:inline-block"><img id="flask_icon" src="https://flasktools.altervista.org/images/166d6p2.png"></img><b>' + getText("hotkeys", "hotkeys") + ':</b></span>';
            var mousePopupHTMLTEST = '</div><div style="max-width: 164px; margin:3px; float: left; display:inline-block"><span style="margin:8px; display:inline-block"></span>';

            var mousePopupArray = {};
            var mousePopupArrayTEST = {};

            var Text_premium = uw.DM.getl10n("layout").premium_button.premium_menu;
            var Text_layout = uw.DM.getl10n("layout").main_menu.items;

            mousePopupArray[getText("hotkeys", "menu")] = [
                [Hotkeys.ImagesHotkeys.menu],
                ["⇧", getText("hotkeys", "reservations")],
            ];
            mousePopupArrayTEST[uw.DM.getl10n("advisor").curator] = [
                [Hotkeys.ImagesHotkeys.administrator],
                ["Q", Text_premium.trade_overview],
                ["W", Text_premium.command_overview],
                ["E", Text_premium.recruit_overview],
                ["R", Text_premium.unit_overview],
                ["T", Text_premium.outer_units],
                ["Y", Text_premium.building_overview],
                ["U", Text_premium.culture_overview],
                ["I", Text_premium.gods_overview],
                ["O", Text_premium.hides_overview],
                ["P", Text_premium.town_group_overview],
                [(MID == 'de' || MID == 'it') ? "'" : "-", Text_premium.towns_overview]
            ];
            mousePopupArray[getText("hotkeys", "captain")] = [
                [Hotkeys.ImagesHotkeys.captain],
                [(MID == 'de') ? "´" : "Z", Text_premium.attack_planer],
                ["X", Text_premium.farm_town_overview]
            ];
            mousePopupArray.Agora = [
                [Hotkeys.ImagesHotkeys.city_select],
                ["G", uw.DM.getl10n("place").tabs[0]],
                ["H", Text_premium.outer_units],
                ["J", getText("options", "sim")[0]],
                ["K", Text_premium.culture_overview]
            ];
            $.each(mousePopupArray, function (a, b) {
                mousePopupHTML += '<p/><span style="margin-bottom:-11px;margin-top:-8px;border-bottom:1px solid #B48F45; width:100%;display:block"><span style="display:inline-block;height:17px;width:17px;vertical-align:middle;margin-right:5px;background-image:url(' + b[0] + ')"></span><span style="display:inline-block;height:17px;vertical-align:middle;margin-right:5px;">' + a + ':</span></span><br/>';
                $.each(b, function (c, d) {
                    if (c != 0) mousePopupHTML += '<span style="display:inline-block;height:17px;width:17px;text-align:center;vertical-align:middle;margin-right:5px;background-image:url(' + Hotkeys.ImagesHotkeys.key + ')"><span style="display:block;margin-top:-1px">' + d[0] + '</span></span><span style="display:inline-block;margin-bottom:1px;height:17px;vertical-align:middle;margin-right:5px;">' + d[1] + '</span><br/>';
                });
            });
            $.each(mousePopupArrayTEST, function (a, b) {
                mousePopupHTMLTEST += '<p/><span style="margin-bottom:-11px;margin-top:-8px;border-bottom:1px solid #B48F45; width:100%;display:block"><span style="display:inline-block;height:17px;width:17px;vertical-align:middle;margin-right:5px;background-image:url(' + b[0] + ')"></span><span style="display:inline-block;height:17px;vertical-align:middle">' + a + ':</span></span><br/>';
                $.each(b, function (c, d) {
                    if (c != 0) mousePopupHTMLTEST += '<span style="display:inline-block;height:17px;width:17px;text-align:center;vertical-align:middle;margin-right:5px;background-image:url(' + Hotkeys.ImagesHotkeys.key + ')"><span style="display:block;margin-top:-1px">' + d[0] + '</span></span><span style="display:inline-block;margin-bottom:1px;height:17px;vertical-align:middle">' + d[1] + '</span><br/>';
                });
            });
            $('#BTN_HK').mousePopup(new uw.MousePopup(mousePopupHTML + mousePopupHTMLTEST));


            $("#BTN_HK").click(() => Hotkeys.add());
            Hotkeys.add();
        },
        add: () => {
            try {
                document.onkeydown = function (e) {
                    e = e || window.event;
                    var target = e.target.tagName.toLowerCase();
                    function letter(letter) { return e.key == letter.toLowerCase() || e.key == letter.toUpperCase() }

                    // Si pas dans une case texte + détection du CTRL pressé ou non
                    if (!$(e.target).is('textarea') && !$(e.target).is('input') && !e.ctrlKey && !e.metaKey && !e.altKey && DATA.options.htk) {
                        // Flèches directionnelles
                        // Agora !!!
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
                        if (letter("x")) uw.FarmTownOverviewWindowFactory.openFarmTownOverview();
                        // Plannificateur
                        if (e.key == "`" || e.code == "Equal" || (MID == 'de' ? letter("r") : letter("z"))) uw.AttackPlannerWindowFactory.openAttackPlannerWindow();
                        // Outil de réservation
                        if (e.code == "ShiftRight") uw.hOpenWindow.openReservationList(); void (0);
                        // Council of heroes
                        if (letter("h") && $('.ui_heroes_overview_container').is(':visible')) uw.HeroesWindowFactory.openHeroesWindow();
                        // FLASK-Tools settings
                        if (letter("d")) openSettings();
                    }
                }
            } catch (error) { errorHandling(error, "hotkeys"); }
        },
        deactivate: () => {
            $('#BTN_HK').remove();
            $('#MH_attsup_style').remove();
        },
    };

    /******************************************************************************************************************************
     * Mod
     * ----------------------------------------------------------------------------------------------------------------------------
     * | ●  Improved a new mod for god
     * ----------------------------------------------------------------------------------------------------------------------------
     *******************************************************************************************************************************/

    var Mod = {
        activate: function () {
            $('<style id="flask_mod">' +

                // God Icon
                '.gods_area .gods_container.god.zeus { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/gods/gods_layout_eb0a200.png) no-repeat -78px -156px; } ' +
                '.gods_area .gods_container.god.athena { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/gods/gods_layout_eb0a200.png) no-repeat -78px -78px; } ' +
                '.gods_area .gods_container.god.poseidon { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/gods/gods_layout_eb0a200.png) no-repeat 0px -156px; } ' +
                '.gods_area .gods_container.god.hera { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/gods/gods_layout_eb0a200.png) no-repeat -156px -78px; } ' +
                '.gods_area .gods_container.god.hades { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/gods/gods_layout_eb0a200.png) no-repeat -156px 0px; } ' +
                '.gods_area .gods_container.god.artemis { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/gods/gods_layout_eb0a200.png) no-repeat 0px -78px; } ' +
                '.gods_area .gods_container.god.aphrodite { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/gods/gods_layout_eb0a200.png) no-repeat 0px 0px; } ' +
                '.gods_area .gods_container.god.ares { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/gods/gods_layout_eb0a200.png) no-repeat -78px -0px; } ' +

                '#temple_god_static.zeus { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/gods/gods_temple_13fb61e.png) no-repeat -0px -525px; } ' +
                '#temple_god_static.poseidon { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/gods/gods_temple_13fb61e.png) no-repeat -760px -236px; } ' +
                '#temple_god_static.hera { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/gods/gods_temple_13fb61e.png) no-repeat -760px -0px; } ' +
                '#temple_god_static.hades { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/gods/gods_temple_13fb61e.png) no-repeat -525px -236px; } ' +
                '#temple_god_static.athena { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/gods/gods_temple_13fb61e.png) no-repeat -525px -0px; } ' +
                '#temple_god_static.artemis { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/gods/gods_temple_13fb61e.png) no-repeat -235px -289px; } ' +
                '#temple_god_static.aphrodite { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/gods/gods_temple_13fb61e.png) no-repeat -290px -0px; } ' +
                '#temple_god_static.ares { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/gods/gods_temple_13fb61e.png) no-repeat -0px -289px; } ' +

                '.god_selection .js-list .zeus_small { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/gods/gods_temple_13fb61e.png) no-repeat -810px -472px; } ' +
                '.god_selection .js-list .poseidon_small { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/gods/gods_temple_13fb61e.png) no-repeat -760px -472px; } ' +
                '.god_selection .js-list .hera_small { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/gods/gods_temple_13fb61e.png) no-repeat -995px -687px; } ' +
                '.god_selection .js-list .hades_small { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/gods/gods_temple_13fb61e.png) no-repeat -995px -637px; } ' +
                '.god_selection .js-list .athena_small { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/gods/gods_temple_13fb61e.png) no-repeat -995px -587px; } ' +
                '.god_selection .js-list .artemis_small { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/gods/gods_temple_13fb61e.png) no-repeat -995px -537px; } ' +
                '.god_selection .js-list .aphrodite_small { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/gods/gods_temple_13fb61e.png) no-repeat -995px -437px; } ' +
                '.god_selection .js-list .ares_small { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/gods/gods_temple_13fb61e.png) no-repeat -995px -487px; } ' +

                // Unit Icon
                '.unit_icon50x50.minotaur { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_50x50_654368f.png) -300px -300px no-repeat; } ' +
                '.unit_icon50x50.manticore { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_50x50_654368f.png) 0px -300px no-repeat; } ' +
                '.unit_icon50x50.zyklop { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_50x50_654368f.png) -300px -400px no-repeat; } ' +
                '.unit_icon50x50.harpy { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_50x50_654368f.png) -150px -250px no-repeat; } ' +
                '.unit_icon50x50.medusa { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_50x50_654368f.png) -100px -300px no-repeat; } ' +
                '.unit_icon50x50.cerberus { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_50x50_654368f.png) -200px -50px no-repeat; } ' +
                '.unit_icon50x50.fury { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_50x50_654368f.png) -0px -250px no-repeat; } ' +
                '.unit_icon50x50.centaur { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_50x50_654368f.png) -200px -0px no-repeat; } ' +
                '.unit_icon50x50.pegasus { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_50x50_654368f.png) -350px -150px no-repeat; } ' +
                '.unit_icon50x50.griffin { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_50x50_654368f.png) -100px -250px no-repeat; } ' +
                '.unit_icon50x50.calydonian_boar { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_50x50_654368f.png) -100px -150px no-repeat; } ' +
                '.unit_icon50x50.satyr { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_50x50_654368f.png) -100px -350px no-repeat; } ' +
                '.unit_icon50x50.spartoi { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_50x50_654368f.png) -350px -350px no-repeat; } ' +
                '.unit_icon50x50.ladon { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_50x50_654368f.png) -300px -150px no-repeat; } ' +
                '.unit_icon50x50.sea_monster { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_50x50_654368f.png) -150px -350px no-repeat; } ' +
                '.unit_icon50x50.siren { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_50x50_654368f.png) -200px -350px no-repeat; } ' +
                '.unit_icon50x50.godsent {background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_50x50_654368f.png) -50px -250px no-repeat; }' +

                '.unit_icon40x40.minotaur { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_40x40_66aaef2.png) -240px -240px no-repeat; } ' +
                '.unit_icon40x40.manticore { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_40x40_66aaef2.png) 0px -240px no-repeat; } ' +
                '.unit_icon40x40.zyklop { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_40x40_66aaef2.png) -240px -320px no-repeat; } ' +
                '.unit_icon40x40.harpy { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_40x40_66aaef2.png) -120px -200px no-repeat; } ' +
                '.unit_icon40x40.medusa { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_40x40_66aaef2.png) -80px -240px no-repeat; } ' +
                '.unit_icon40x40.cerberus { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_40x40_66aaef2.png) -160px -40px no-repeat; } ' +
                '.unit_icon40x40.fury { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_40x40_66aaef2.png) -0px -200px no-repeat; } ' +
                '.unit_icon40x40.centaur { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_40x40_66aaef2.png) -160px -0px no-repeat; } ' +
                '.unit_icon40x40.pegasus { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_40x40_66aaef2.png) -280px -120px no-repeat; } ' +
                '.unit_icon40x40.griffin { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_40x40_66aaef2.png) -80px -200px no-repeat; } ' +
                '.unit_icon40x40.calydonian_boar { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_40x40_66aaef2.png) -80px -120px no-repeat; } ' +
                '.unit_icon40x40.satyr { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_40x40_66aaef2.png) -80px -280px no-repeat; } ' +
                '.unit_icon40x40.spartoi { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_40x40_66aaef2.png) -280px -280px no-repeat; } ' +
                '.unit_icon40x40.ladon { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_40x40_66aaef2.png) -240px -120px no-repeat; } ' +
                '.unit_icon40x40.sea_monster { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_40x40_66aaef2.png) -120px -280px no-repeat; } ' +
                '.unit_icon40x40.siren { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_40x40_66aaef2.png) -160px -280px no-repeat; } ' +
                '.unit_icon40x40.godsent {background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_40x40_66aaef2.png) -40px -200px no-repeat; }' +

                '.unit_icon70x70.minotaur { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_70x70_467fcae.png) -420px -420px no-repeat; } ' +
                '.unit_icon70x70.manticore { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_70x70_467fcae.png) 0px -420px no-repeat; } ' +
                '.unit_icon70x70.zyklop { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_70x70_467fcae.png) -420px -560px no-repeat; } ' +
                '.unit_icon70x70.harpy { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_70x70_467fcae.png) -210px -350px no-repeat; } ' +
                '.unit_icon70x70.medusa { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_70x70_467fcae.png) -140px -420px no-repeat; } ' +
                '.unit_icon70x70.cerberus { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_70x70_467fcae.png) -280px -70px no-repeat; } ' +
                '.unit_icon70x70.fury { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_70x70_467fcae.png) -0px -350px no-repeat; } ' +
                '.unit_icon70x70.centaur { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_70x70_467fcae.png) -280px -0px no-repeat; } ' +
                '.unit_icon70x70.pegasus { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_70x70_467fcae.png) -420px -210px no-repeat; } ' +
                '.unit_icon70x70.griffin { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_70x70_467fcae.png) -140px -350px no-repeat; } ' +
                '.unit_icon70x70.calydonian_boar { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_70x70_467fcae.png) -140px -210px no-repeat; } ' +
                '.unit_icon70x70.satyr { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_70x70_467fcae.png) -140px -490px no-repeat; } ' +
                '.unit_icon70x70.spartoi { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_70x70_467fcae.png) -490px -490px no-repeat; } ' +
                '.unit_icon70x70.ladon { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_70x70_467fcae.png) -420px -210px no-repeat; } ' +
                '.unit_icon70x70.sea_monster { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_70x70_467fcae.png) -210px -490px no-repeat; } ' +
                '.unit_icon70x70.siren { background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_70x70_467fcae.png) -280px -490px no-repeat; } ' +
                '.unit_icon70x70.godsent {background: url(https://gp' + MID + '.innogamescdn.com/images/game/autogenerated/units/unit_icons_70x70_467fcae.png) -70px -350px no-repeat; }' +

                '</style>').appendTo('head');
        },
        deactivate: function () {
            $('#flask_mod').remove();

        }
    };
}
