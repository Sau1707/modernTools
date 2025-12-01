// ==UserScript==
// @name         UIExperience
// @author       Sau1707 - Taken from Flasktool
// @description  Auto-minimize Daily Reward
// @version      1.0.0
// @include      http://*.grepolis.*/game/*
// @icon         https://raw.githubusercontent.com/Sau1707/modernTools/refs/heads/main/public/logo.png
// @updateURL    https://github.com/Sau1707/modernTools/raw/refs/heads/main/src/content/UIExperience.user.js
// @downloadURL  https://github.com/Sau1707/modernTools/raw/refs/heads/main/src/content/UIExperience.user.js
// @grant        unsafeWindow
// ==/UserScript==



(function () {
    'use strict';
    const uw = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

    function withGameReady(fn) {
        var check = setInterval(function () {
            if (uw.jQuery && uw.GameEvents && uw.jQuery.Observer) {
                clearInterval(check);
                fn(uw.jQuery);
            }
        }, 250);
    }

    withGameReady(function ($) {
        (function activateContextMenuSwap() {
            // Subscribe to context menu click (same event used in original script)
            $.Observer(uw.GameEvents.map.context_menu.click).subscribe('TM_CONTEXT_SWAP', function () {
                // Original condition: only when context menu has 4 children
                if ($('#context_menu').children().length === 4) {
                    // Clear animation on subsequent opens (same as original)
                    $('#context_menu div#goToTown').css({
                        left: '0px',
                        top: '0px',
                        WebkitAnimation: 'none',
                        animation: 'none'
                    });
                }

                // Original behaviour: replace German label for "select town" button
                if (uw.Game && uw.Game.market_id === 'de' && $('#select_town').get(0)) {
                    $("#select_town .caption").get(0).innerHTML = "Selektieren";
                }
            });

            // CSS from original ContextMenu feature (simplified, always active)
            $('<style id="tm_context_menu_swap" type="text/css">' +
                // Fix position of "select town" button
                '#select_town { left: 0px !important; top: 0px !important; z-index: 6; } ' +
                // Animate and move "goToTown" (Panoramica città) to the other slot
                '#context_menu div#goToTown { ' +
                'left: 30px; top: -51px; ' +
                '-webkit-animation: TM_CM_SWAP 0.115s linear; ' +
                'animation: TM_CM_SWAP 0.2s; ' +
                '} ' +
                '@-webkit-keyframes TM_CM_SWAP { ' +
                'from { left: 0px; top: 0px; } ' +
                'to { left: 30px; top: -51px; } ' +
                '} ' +
                '@keyframes TM_CM_SWAP { ' +
                'from { left: 0px; top: 0px; } ' +
                'to { left: 30px; top: -51px; } ' +
                '} ' +
                '</style>').appendTo('head');
        })();

        (function activateScrollbarStyle() {
            if (document.getElementById('flask_scrollbar')) {
                return;
            }

            // Extracted from Scrollbar feature in the original script
            $('<style id="flask_scrollbar" type="text/css">' +
                '::-webkit-scrollbar { width: 13px; } ' +
                '::-webkit-scrollbar-track { ' +
                'background-color: rgba(145, 165, 193, 0.5); ' +
                'border-top-right-radius: 4px; ' +
                'border-bottom-right-radius: 4px; ' +
                '} ' +
                '::-webkit-scrollbar-thumb { ' +
                'background-color: rgba(37, 82, 188, 0.5); ' +
                'border-radius: 3px; ' +
                '} ' +
                '::-webkit-scrollbar-thumb:hover { ' +
                'background-color: rgba(37, 82, 188, 0.8); ' +
                '} ' +
                '</style>').appendTo('head');
        })();

    });
})();


// This is the part that adds the Short Duration and Hades visibility to the Attack/Support window
(function () {
    'use strict';

    var uw = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    var arrival_interval = {};
    var hades_interval = {};

    function whenReady(fn) {
        function check() {
            try {
                if (
                    uw.Game &&
                    uw.Layout &&
                    uw.GPWindowMgr &&
                    uw.jQuery &&
                    uw.Timestamp &&
                    uw.ITowns &&
                    uw.GameData &&
                    uw.MM
                ) {
                    fn();
                } else {
                    setTimeout(check, 500);
                }
            } catch (e) {
                setTimeout(check, 500);
            }
        }
        check();
    }

    whenReady(init);

    function init() {
        if (!/\/game\//.test(uw.location.pathname)) return;

        Duration.activate();

        // periodic scan of town windows for both features
        setInterval(function () {
            try {
                enhanceAttackSupportWindows();
                selectunitshelper.activate();
            } catch (e) {
                // silent
            }
        }, 1000);
    }

    function enhanceAttackSupportWindows() {
        var wndArray = uw.Layout.wnd.getOpen(uw.Layout.wnd.TYPE_TOWN) || [];
        var $ = uw.jQuery;

        for (var i in wndArray) {
            if (!wndArray.hasOwnProperty(i)) continue;
            var wnd = wndArray[i];

            if (!wnd || typeof wnd.getAction !== 'function') continue;
            var action = wnd.getAction();
            if (action !== 'attack' && action !== 'support') continue;

            var wndID = "#gpwnd_" + wnd.getID() + " ";
            if (!$(wndID).get(0)) {
                wndID = "#gpwnd_" + (wnd.getID() + 1) + " ";
            }
            if (!$(wndID).get(0)) continue;

            // add Movimento accelerato rows if not present
            if (!$(wndID + '.short_duration').get(0)) {
                Duration.add(wndID);
            }
        }
    }

    /******************************************************************
     * Movimento accelerato (Short Duration)
     ******************************************************************/
    var Duration = {
        activate: function () {
            var MID = uw.Game.market_id;
            var $ = uw.jQuery;

            if ($('#flask_short_duration_style').length) {
                return;
            }

            $('<style id="flask_short_duration_style">' +
                '.attack_support_window .tab_type_support .duration_container { top:0px !important; } ' +
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
            uw.jQuery("#flask_short_duration_style").remove();
            uw.jQuery(".short_duration_row").remove();
            uw.jQuery(".hades_duration_row").remove();
        },

        add: function (wndID) {
            var $ = uw.jQuery;
            try {
                var tooltip = "Movimento accelerato (+30% velocità)";
                var tooltip2 = "Durata visibilità Ade (stima)";

                if ($('.portal_duration').css('display') === 'none') {
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
                } else {
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

                    $('<style id="flask_short_duration_style_extra">' +
                        '.attack_support_window .flask_duration { border-spacing:0px; margin-bottom:2px; text-align:right; position: absolute; width:max-content;} ' +
                        '</style>').appendTo('head');

                    $(wndID + ".portal_duration").appendTo(wndID + ".flask_portal");
                    $(wndID + ".nightbonus").appendTo(wndID + ".flask_night");
                    $(wndID + '.way_duration').appendTo(wndID + ".flask_way");
                    $(wndID + ".arrival_time").appendTo(wndID + ".flask_arrival");
                }

                // Tooltip
                $(wndID + '.short_duration_row').tooltip(tooltip);
                $(wndID + '.hades_duration_row').tooltip(tooltip2);

                // React on changes of base duration
                Duration.change(wndID);

            } catch (error) {
                // silent
            }
        },

        change: function (wndID) {
            var $ = uw.jQuery;
            var target = $(wndID + '.way_duration').get(0);
            if (!target) return;

            var observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation && mutation.addedNodes && mutation.addedNodes[0]) {
                        Duration.calculate(wndID);
                    }
                });
            });

            observer.observe(target, {
                attributes: false,
                childList: true,
                characterData: false
            });
        },

        calculate: function (wndID) {
            var $ = uw.jQuery;
            try {
                var baseEl = $(wndID + '.duration_container .way_duration').get(0);
                if (!baseEl) return;

                var setup_time = 900 / uw.Game.game_speed;
                var duration_time = baseEl.innerHTML.replace("~", "").split(":");
                var duration_time_2, duration_time_3;
                var arrival_time, visibility_time;
                var h, m, s;
                var atalanta_factor = 0;

                // Atalanta hero (optional, if included)
                if ($(wndID + '.unit_container.heroes_pickup .atalanta').get(0) &&
                    $(wndID + '.cbx_include_hero').hasClass("checked")) {
                    try {
                        var coll = uw.MM.getCollections().PlayerHero[0];
                        var atalanta_level = coll.getHero("atalanta").get("level");
                        atalanta_factor = (atalanta_level + 10) / 100; // Level 1 = 11%, Level 20 = 30%
                    } catch (e) {
                        atalanta_factor = 0;
                    }
                }

                // convert h:m:s to seconds
                duration_time = ((parseInt(duration_time[0], 10) * 60 + parseInt(duration_time[1], 10)) * 60 +
                    parseInt(duration_time[2], 10));

                // 30% speed buff (short duration) + Atalanta, preserving setup time
                duration_time_2 = ((duration_time - setup_time) * (1 + atalanta_factor)) /
                    (1 + 0.3 + atalanta_factor) + setup_time;

                // Hades visibility estimate (~10% of travel time after setup)
                duration_time_3 = (duration_time - setup_time) / 10;

                function fmt(t) {
                    var hh = Math.floor(t / 3600);
                    var mm = Math.floor((t - hh * 3600) / 60);
                    var ss = Math.floor(t - hh * 3600 - mm * 60);

                    if (mm < 10) mm = "0" + mm;
                    if (ss < 10) ss = "0" + ss;
                    return { h: hh, m: mm, s: ss };
                }

                // short duration
                var f = fmt(duration_time_2);
                if ($(wndID + '.short_duration').get(0)) {
                    $(wndID + '.short_duration').get(0).innerHTML = "~" + f.h + ":" + f.m + ":" + f.s;
                }

                // hades duration
                f = fmt(duration_time_3);
                if ($(wndID + '.hades_duration').get(0)) {
                    $(wndID + '.hades_duration').get(0).innerHTML = "~" + f.h + ":" + f.m + ":" + f.s;
                }

                // absolute arrival and visibility times
                arrival_time = Math.round((uw.Timestamp.server() + uw.Game.server_gmt_offset)) + duration_time_2;
                visibility_time = Math.round((uw.Timestamp.server() + uw.Game.server_gmt_offset)) + duration_time_3;

                function fmtClock(t) {
                    // total hours since epoch
                    var totalHours = Math.floor(t / 3600);

                    // show only 0–23 as clock hours
                    var hh = totalHours % 24;

                    // use totalHours (not hh) for minutes and seconds
                    var mm = Math.floor((t - totalHours * 3600) / 60);
                    var ss = Math.floor(t - totalHours * 3600 - mm * 60);

                    if (mm < 10) mm = "0" + mm;
                    if (ss < 10) ss = "0" + ss;
                    return { h: hh, m: mm, s: ss };
                }

                // initial arrival display
                f = fmtClock(arrival_time);
                if ($(wndID + '.short_arrival').get(0)) {
                    $(wndID + '.short_arrival').get(0).innerHTML = "~" + f.h + ":" + f.m + ":" + f.s;
                }

                clearInterval(arrival_interval[wndID]);
                arrival_interval[wndID] = setInterval(function () {
                    arrival_time += 1;
                    var f2 = fmtClock(arrival_time);
                    if ($(wndID + '.short_arrival').get(0)) {
                        $(wndID + '.short_arrival').get(0).innerHTML = "~" + f2.h + ":" + f2.m + ":" + f2.s;
                    } else {
                        clearInterval(arrival_interval[wndID]);
                    }
                }, 1000);

                // initial Hades visibility display
                f = fmtClock(visibility_time);
                if ($(wndID + '.hades_visibility').get(0)) {
                    $(wndID + '.hades_visibility').get(0).innerHTML = "~" + f.h + ":" + f.m + ":" + f.s;
                }

                clearInterval(hades_interval[wndID]);
                hades_interval[wndID] = setInterval(function () {
                    visibility_time += 1;
                    var f2 = fmtClock(visibility_time);
                    if ($(wndID + '.hades_visibility').get(0)) {
                        $(wndID + '.hades_visibility').get(0).innerHTML = "~" + f2.h + ":" + f2.m + ":" + f2.s;
                    } else {
                        clearInterval(hades_interval[wndID]);
                    }
                }, 1000);

            } catch (e) {
                // silent
            }
        }
    };

    /******************************************************************
     * Aiuto selezione truppe (Select unit helper, from Quacktools)
     ******************************************************************/
    var selectunitshelper = {

        // called periodically, idempotent
        activate: function () {
            var $ = uw.jQuery;
            var wnds = uw.GPWindowMgr.getOpen(uw.Layout.wnd.TYPE_TOWN) || [];

            for (var e in wnds) {
                if (!wnds.hasOwnProperty(e)) continue;

                var wndid = wnds[e].getID();
                var wndSelector = 'DIV#gpwnd_' + wndid;
                var testel = $(wndSelector + ' A.flask_balanced');

                // already injected into this window
                if (testel.length > 0) continue;

                var handler = wnds[e].getHandler();
                if (!handler || !handler.data || !handler.data.units) continue;

                var selectAll = $(wndSelector + ' A.select_all_units');
                if (!selectAll.length) continue;

                // Add links after "select all units"
                selectAll.after(
                    ' | <a class="flask_balanced" style="position:relative; top:3px" href="#">no overload</a>' +
                    ' | <a class="flask_delete" style="position:relative; top:3px" href="#">delete</a>'
                );

                var gt_bl_groundUnits = [
                    'sword', 'slinger', 'archer', 'hoplite', 'rider', 'chariot', 'catapult',
                    'minotaur', 'zyklop', 'medusa', 'cerberus', 'fury', 'centaur',
                    'calydonian_boar', 'godsent'
                ];

                // "no overload" click
                $(wndSelector + ' A.flask_balanced').click((function (wndid, handler) {
                    return function (ev) {
                        ev.preventDefault();

                        var units = [];
                        var item;
                        var i;

                        for (i = 0; i < gt_bl_groundUnits.length; i++) {
                            var u = gt_bl_groundUnits[i];
                            if (handler.data.units[u]) {
                                item = {
                                    name: u,
                                    count: handler.data.units[u].count,
                                    population: handler.data.units[u].population
                                };
                                units.push(item);
                            }
                        }

                        var berth = 0;
                        if (handler.data.researches && handler.data.researches.berth) {
                            berth = handler.data.researches.berth;
                        }

                        var totalCap =
                            handler.data.units.big_transporter.count *
                            (handler.data.units.big_transporter.capacity + berth) +
                            handler.data.units.small_transporter.count *
                            (handler.data.units.small_transporter.capacity + berth);

                        // larger population units first
                        units.sort(function (a, b) {
                            return b.population - a.population;
                        });

                        // remove units with 0 available
                        for (i = 0; i < units.length; i++) {
                            if (units[i].count === 0) {
                                units.splice(i, 1);
                                i = i - 1;
                            }
                        }

                        var restCap = totalCap;
                        var sendUnits = {};
                        for (i = 0; i < units.length; i++) {
                            item = { name: units[i].name, count: 0 };
                            sendUnits[units[i].name] = item;
                        }

                        var hasSent;
                        var k = 0;
                        while (units.length > 0) {
                            hasSent = false;
                            k = k + 1;
                            for (i = 0; i < units.length; i++) {
                                if (units[i].population <= restCap) {
                                    hasSent = true;
                                    units[i].count = units[i].count - 1;
                                    sendUnits[units[i].name].count =
                                        sendUnits[units[i].name].count + 1;
                                    restCap = restCap - units[i].population;
                                }
                            }
                            for (i = 0; i < units.length; i++) {
                                if (units[i].count === 0) {
                                    units.splice(i, 1);
                                    i = i - 1;
                                }
                            }
                            if (!hasSent) {
                                break;
                            }
                        }

                        handler.getUnitInputs().each(function () {
                            if (!sendUnits[this.name]) {
                                if (handler.data.units[this.name].count > 0) {
                                    this.value = handler.data.units[this.name].count;
                                } else {
                                    this.value = '';
                                }
                            }
                        });

                        for (i = 0; i < gt_bl_groundUnits.length; i++) {
                            var name = gt_bl_groundUnits[i];
                            if (sendUnits[name]) {
                                if (sendUnits[name].count > 0) {
                                    $('DIV#gpwnd_' + wndid + ' INPUT.unit_type_' + name)
                                        .val(sendUnits[name].count);
                                } else {
                                    $('DIV#gpwnd_' + wndid + ' INPUT.unit_type_' + name).val('');
                                }
                            }
                        }

                        $('DIV#gpwnd_' + wndid + ' INPUT.unit_type_sword').trigger('change');
                    };
                })(wndid, handler));

                // "delete" click
                $(wndSelector + ' A.flask_delete').click((function (wndid, handler) {
                    return function (ev) {
                        ev.preventDefault();
                        handler.getUnitInputs().each(function () {
                            this.value = '';
                        });
                        $('DIV#gpwnd_' + wndid + ' INPUT.unit_type_sword').trigger('change');
                    };
                })(wndid, handler));
            }
        },

        deactivate: function () {
            var $ = uw.jQuery;
            $('.flask_delete').remove();
            $('.flask_balanced').remove();
        }
    };

})();
