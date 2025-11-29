// ==UserScript==
// @name         TownIcons
// @author       Sau1707
// @description  Adds town icons to the town list and strategic map based on unit composition.
// @version      1.0.0
// @match        http://*.grepolis.com/game/*
// @match        https://*.grepolis.com/game/*
// @icon         https://raw.githubusercontent.com/Sau1707/modernTools/refs/heads/main/public/logo.png
// @updateURL    https://github.com/Sau1707/modernTools/raw/refs/heads/main/src/content/QuickPlan.user.js
// @downloadURL  https://github.com/Sau1707/modernTools/raw/refs/heads/main/src/content/QuickPlan.user.js
// @grant        unsafeWindow
// ==/UserScript==


(function () {
    'use strict';
    const uw = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    const $ = uw.jQuery || jQuery;

    const WID = uw.Game.world_id;
    const PID = uw.Game.player_id;
    const MID = uw.Game.market_id;

    // Configuration
    const FLASK_SPRITE = "https://flasktools.altervista.org/images/vxk8zp.png";

    // State
    let autoTownTypes = {};
    let manuTownTypes = loadValue(WID + "_townTypes", {});
    let population = {};

    // Helper functions
    function loadValue(name, default_val) {
        let value = localStorage.getItem(name);
        if (value) {
            try {
                return JSON.parse(value);
            } catch (e) {
                return value;
            }
        }
        return default_val;
    }

    function saveValue(name, val) {
        localStorage.setItem(name, JSON.stringify(val));
    }

    const TownIcons = {
        types: {
            // Land Off
            lo: 1, ld: 2, sh: 3, di: 4, un: 5,
            // Sea Off
            so: 6, sd: 7, ko: 8, ti: 9, gr: 10,
            // Fly Off
            fo: 11, fd: 12, dp: 13, no: 14, po: 15,
            // Other
            re: 16, wd: 17, st: 18, si: 19, bu: 20,
            he: 21, ch: 22, bo: 23, fa: 24, wo: 25
        },

        init: function () {
            this.addStyles();
            this.calculateAutoTownTypes();
            this.setupTownListHook();
            this.setupMapHook();
            this.setupTownIconSelector();

            // Re-calculate on unit changes (if possible, or periodically)
            // For now, run once on load and maybe on town switch
            $.Observer(uw.GameEvents.town.town_switch).subscribe("town_switch_icon", () => {
                this.updateCurrentTownIcon();
            });
        },

        addStyles: function () {
            const style = `
                .icon_small { width: 25px; height: 25px; background-image: url(${FLASK_SPRITE}); display: inline-block; vertical-align: middle; }
                .icon_big { width: 25px; height: 25px; background-image: url(${FLASK_SPRITE}); display: inline-block; vertical-align: middle; }
                
                /* Define classes for each type */
                ${Object.keys(this.types).map(type => `
                    .townicon_${type} { background-position: ${this.types[type] * -25}px -27px; }
                    .townicon_${type}.auto { background-position: ${this.types[type] * -25}px 0px; }
                `).join('')}
                
                #town_icon { position:absolute; top:36px; left:130px; z-index:10; cursor:pointer; }
                #town_icon .select_town_icon { position: absolute; top: 25px; left: 0; width: 145px; display: none; padding: 2px; border: 3px inset rgb(7, 99, 12); background: url(https://gp${MID}.innogamescdn.com/images/game/popup/middle_middle.png); z-index: 20; }
                #town_icon .item-list { max-height: 400px; overflow-y: auto; }
                #town_icon .option_s { cursor: pointer; width: 20px; height: 20px; margin: 2px; float: left; border: 2px solid transparent; }
                #town_icon .option_s:hover { border-color: rgb(59, 121, 81); }
                #town_icon .sel { border-color: rgb(202, 176, 109); }
                
                /* Town List Styles */
                #town_groups_list .icon_small { position: absolute; left: 0; top: 0; transform: scale(0.7); }
                #town_groups_list .town_group_town { position: relative; }
            `;
            $('<style>').text(style).appendTo('head');
        },

        calculateAutoTownTypes: function () {
            try {
                const townArray = uw.ITowns.getTowns();
                const unitArrayTemplate = {
                    "sword": 0, "archer": 0, "hoplite": 0, "chariot": 0, "godsent": 0, "rider": 0, "slinger": 0, "catapult": 0,
                    "small_transporter": 0, "big_transporter": 0, "manticore": 0, "harpy": 0, "pegasus": 0, "cerberus": 0,
                    "minotaur": 0, "medusa": 0, "zyklop": 0, "centaur": 0, "fury": 0, "sea_monster": 0,
                    "bireme": 0, "trireme": 0, "attack_ship": 0, "demolition_ship": 0, "colonize_ship": 0
                };

                // Add god specific units
                if (uw.Game.hasArtemis) Object.assign(unitArrayTemplate, { "griffin": 0, "calydonian_boar": 0 });
                if (uw.GameData.gods.aphrodite) Object.assign(unitArrayTemplate, { "siren": 0, "satyr": 0 });
                if (uw.GameData.gods.ares) Object.assign(unitArrayTemplate, { "spartoi": 0, "ladon": 0 });

                for (const townId in townArray) {
                    if (townArray.hasOwnProperty(townId)) {
                        const town = townArray[townId];
                        const units = town.units();
                        let type = { lo: 0, ld: 0, so: 0, sd: 0, fo: 0, fd: 0 };
                        let totalUnits = 0;

                        for (const unit in unitArrayTemplate) {
                            const count = parseInt(units[unit], 10) || 0;
                            totalUnits += count;

                            if (!uw.GameData.units[unit]) continue;

                            if (!uw.GameData.units[unit].is_naval) {
                                if (uw.GameData.units[unit].flying) {
                                    type.fd += ((uw.GameData.units[unit].def_hack + uw.GameData.units[unit].def_pierce + uw.GameData.units[unit].def_distance) / 3 * count);
                                    type.fo += (uw.GameData.units[unit].attack * count);
                                } else {
                                    type.ld += ((uw.GameData.units[unit].def_hack + uw.GameData.units[unit].def_pierce + uw.GameData.units[unit].def_distance) / 3 * count);
                                    type.lo += (uw.GameData.units[unit].attack * count);
                                }
                            } else {
                                type.sd += (uw.GameData.units[unit].defense * count);
                                type.so += (uw.GameData.units[unit].attack * count);
                            }
                        }

                        // Determine type
                        let z = ((type.sd + type.ld + type.fd) <= (type.so + type.lo + type.fo)) ? "o" : "d";
                        let temp = 0;

                        // Default
                        autoTownTypes[town.id] = "no";

                        for (let t in type) {
                            if (temp < type[t]) {
                                autoTownTypes[town.id] = t[0] + z;
                                temp = type[t];
                            }
                        }
                        // Population check for "Empty" (po)
                        if (uw.GameData.buildings && uw.GameData.buildings.farm) {
                            const popByFarmLevel = [114, 121, 134, 152, 175, 206, 245, 291, 343, 399, 458, 520, 584, 651, 720, 790, 863, 938, 1015, 1094, 1174, 1257, 1341, 1426, 1514, 1602, 1693, 1785, 1878, 1973, 2070, 2168, 2267, 2368, 2470, 2573, 2678, 2784, 2891, 3000, 3109, 3220, 3332, 3446, 3560];
                            const buildVal = uw.GameData.buildings;
                            const buildings = town.buildings();
                            const farmLevel = buildings.getBuildingLevel("farm");

                            let popMax;
                            if (buildVal.farm.farm_factor != undefined) {
                                popMax = Math.floor(buildVal.farm.farm_factor * Math.pow(farmLevel, buildVal.farm.farm_pow));
                            } else {
                                popMax = popByFarmLevel[farmLevel - 1] || 0;
                            }

                            let popBuilding = 0;
                            const levelArray = buildings.getLevels();
                            for (const b in levelArray) {
                                if (buildVal[b]) {
                                    popBuilding += Math.round(buildVal[b].pop * Math.pow(levelArray[b], buildVal[b].pop_factor));
                                }
                            }

                            let popExtra = 0;
                            if (town.getResearches && town.getResearches().attributes.plow) popExtra += 200;
                            if (buildings.getBuildingLevel("thermal")) popMax *= 1.1;

                            const availablePop = town.getAvailablePopulation();
                            const unitsPop = Math.floor((popMax + popExtra) - (popBuilding + availablePop));

                            if (unitsPop < 300) {
                                autoTownTypes[town.id] = "po";
                            }
                        } else {
                            if (town.getAvailablePopulation() > 2500) {
                                autoTownTypes[town.id] = "po";
                            }
                        }
                    }
                }
            } catch (e) {
                console.error("Error calculating auto town types", e);
            }
        },

        setupTownListHook: function () {
            // Hook into the town list rendering
            // This is tricky as it depends on Grepolis internals. 
            // We'll use a MutationObserver on the town list container if possible, or hook the render function as in flash.js

            // flash.js approach: hook uw.layout_main_controller.sub_controllers...
            // We will try a safer approach first: MutationObserver on #town_groups_list

            const observer = new MutationObserver((mutations) => {
                this.renderTownListIcons();
            });

            const target = document.getElementById('town_groups_list');
            if (target) {
                observer.observe(target, { childList: true, subtree: true });
                this.renderTownListIcons(); // Initial render
            } else {
                // Wait for it?
                const check = setInterval(() => {
                    const t = document.getElementById('town_groups_list');
                    if (t) {
                        clearInterval(check);
                        observer.observe(t, { childList: true, subtree: true });
                        this.renderTownListIcons();
                    }
                }, 1000);
            }
        },

        renderTownListIcons: function () {
            $("#town_groups_list .town_group_town").each(function () {
                const townId = $(this).attr('name');
                if (!townId) return;

                if ($(this).find('.icon_small').length === 0) {
                    const type = manuTownTypes[townId] || autoTownTypes[townId] || "no";
                    const icon = $('<div class="icon_small townicon_' + type + '"></div>');
                    $(this).prepend(icon);
                }
            });
        },

        setupMapHook: function () {
            // Add icons to the strategic map
            // flash.js uses CSS injection for map icons.

            this.updateMapStyles();

            // Re-inject styles when map moves/updates? 
            // The CSS uses IDs like #mini_t{townId}, so as long as those IDs exist, the CSS applies.
            // We just need to ensure the CSS is up to date with autoTownTypes/manuTownTypes.
        },

        updateMapStyles: function () {
            $('#flask_townicons_map').remove();

            let styleStr = "<style id='flask_townicons_map' type='text/css'>";
            const towns = uw.ITowns.getTowns();

            for (const townId in towns) {
                if (towns.hasOwnProperty(townId)) {
                    const type = manuTownTypes[townId] || autoTownTypes[townId] || "no";
                    if (this.types[type]) {
                        styleStr += `#mini_t${townId}, #town_flag_${townId} .flagpole {
                             background: rgb(255, 187, 0) url(${FLASK_SPRITE}) ${this.types[type] * -25}px -27px repeat !important;
                         } `;
                    }
                }
            }
            styleStr += "</style>";
            $(styleStr).appendTo('head');
        },

        setupTownIconSelector: function () {
            // Add the selector to the UI (near town name)
            if ($('#town_icon').length) return;

            const container = $('<div id="town_icon"><div class="icon_big"></div></div>');
            $('.town_name_area').append(container);

            this.updateCurrentTownIcon();

            // Build dropdown
            const dropdown = $('<div class="select_town_icon dropdown-list default active"><div class="item-list"></div></div>');
            const icoArray = ['ld', 'lo', 'sh', 'di', 'un', 'sd', 'so', 'ko', 'ti', 'gr', 'fd', 'fo', 'dp', 'no', 'po', 're', 'wd', 'st', 'si', 'bu', 'he', 'ch', 'bo', 'fa', 'wo'];

            icoArray.forEach(code => {
                dropdown.find('.item-list').append(`<div class="option_s icon_small townicon_${code}" name="${code}"></div>`);
            });
            dropdown.find('.item-list').append('<hr><div class="option_s auto_s" name="auto" style="width:100%; text-align:center;"><b>Auto</b></div>');

            container.append(dropdown);

            // Events
            container.find('.icon_big').click((e) => {
                e.stopPropagation();
                dropdown.toggle();
            });

            dropdown.find('.option_s').click(function (e) {
                e.stopPropagation();
                const name = $(this).attr('name');
                const townId = uw.Game.townId;

                if (name === 'auto') {
                    delete manuTownTypes[townId];
                } else {
                    manuTownTypes[townId] = name;
                }

                saveValue(WID + "_townTypes", manuTownTypes);
                TownIcons.updateCurrentTownIcon();
                TownIcons.updateMapStyles();
                TownIcons.renderTownListIcons(); // Update list too
                dropdown.hide();
            });

            $(document).click(() => dropdown.hide());
        },

        updateCurrentTownIcon: function () {
            const townId = uw.Game.townId;
            const type = manuTownTypes[townId] || autoTownTypes[townId] || "no";
            $('#town_icon .icon_big')
                .removeClass()
                .addClass('icon_big townicon_' + type + ' auto')
                .css('background-position', (this.types[type] * -25) + 'px 0px');
        }
    };

    // Initialize
    function init() {
        if (uw.Game && uw.ITowns) {
            TownIcons.init();
        } else {
            setTimeout(init, 500);
        }
    }

    init();
})();
