// ==UserScript==
// @name         Grepolis — BBcode città (Town BBCode button)
// @namespace    https://your.namespace.here
// @version      1.0.0
// @description  Aggiunge un pulsante per copiare il BBCode della città nella barra del titolo della città.
// @match        https://*.grepolis.com/game/*
// @icon         https://flasktools.altervista.org/images/166d6p2.png
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js
// @grant        unsafeWindow
// ==/UserScript==

(function () {
    'use strict';
    const uw = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    const $ = uw.jQuery || jQuery;

    // CSS lifted from the original feature
    // ref: TownBbc.addButton() styling in FLASK-Tools (flash.js) :contentReference[oaicite:1]{index=1}
    const STYLE = `
    #flask_townbb { top:23px; left:184px; z-index:5000; position:absolute; margin:5px 0 0 4px; width:22px; height:23px;
      background:url(https://flasktools.altervista.org/images/bbcodes.png) no-repeat -273px -5px; }
    #input_townbb { display:none; position:absolute; left:21px; top:29px; width:160px; text-align:center; z-index:5;
      background:transparent; font-weight:bold; border:0; }
  `;

    function ensureStyle() {
        if (!document.getElementById('flask_townbb_style')) {
            const s = document.createElement('style');
            s.id = 'flask_townbb_style';
            s.textContent = STYLE;
            document.head.appendChild(s);
        }
    }

    function addButton() {
        if ($('#flask_townbb').length || !$('.town_name_area').length) return;

        // Insert button + input
        $('<a id="flask_townbb" href="#"></a><input id="input_townbb" type="text" onfocus="this.select();" onclick="this.select();">')
            .appendTo('.town_name_area');

        // Tooltip text equivalent to labels.tbc (“BBCode città”) in the original translations :contentReference[oaicite:2]{index=2}
        $('#flask_townbb').attr('title', 'BBCode città');

        // Click handler — sets [town]{id}[/town] taken from Game.townId (as in original) :contentReference[oaicite:3]{index=3}
        $('#flask_townbb').on('click', function (e) {
            e.preventDefault();
            const tid = uw.Game && uw.Game.townId ? uw.Game.townId : null;
            if (!tid) return;

            const $inp = $('#input_townbb');
            $inp.val('[town]' + tid + '[/town]').toggle().focus().select();

            // Original also toggled power icons; keep it but guard if not present :contentReference[oaicite:4]{index=4}
            $('.casted_powers_area .casted_power.power_icon16x16').toggle();
        });
    }

    // Hide the input when switching town (mirrors original Observer hook) :contentReference[oaicite:5]{index=5}
    function subscribeTownSwitch() {
        try {
            if (uw.GameEvents && uw.GameEvents.town && $.Observer) {
                $.Observer(uw.GameEvents.town.town_switch).subscribe('bb_town_switch_hide', () => {
                    $('#input_townbb').hide();
                });
            }
        } catch (_) { /* non-fatal */ }
    }

    // Init when the town header exists
    function initWhenReady(tries = 0) {
        if (document.querySelector('.town_name_area') && uw.Game && uw.Game.townId) {
            ensureStyle();
            addButton();
            subscribeTownSwitch();
            return;
        }
        if (tries < 60) {
            setTimeout(() => initWhenReady(tries + 1), 500);
        }
    }

    initWhenReady();
})();