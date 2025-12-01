// ==UserScript==
// @name         TownIcons
// @author       Sau1707 - Taken from Flasktool
// @description  Adds town icons to the town list and strategic map based on unit composition.
// @version      1.0.0
// @match        http://*.grepolis.com/game/*
// @match        https://*.grepolis.com/game/*
// @icon         https://raw.githubusercontent.com/Sau1707/modernTools/refs/heads/main/public/logo.png
// @updateURL    https://github.com/Sau1707/modernTools/raw/refs/heads/main/src/content/TownIcons.user.js
// @downloadURL  https://github.com/Sau1707/modernTools/raw/refs/heads/main/src/content/TownIcons.user.js
// @grant        unsafeWindow
// ==/UserScript==

(function () {
    'use strict';
    const uw = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

    function withJQuery(fn) {
        var check = setInterval(function () {
            if (uw.jQuery && uw.Game && uw.ITowns && uw.GameData && uw.layout_main_controller) {
                clearInterval(check);
                fn(uw.jQuery);
            }
        }, 250);
    }

    withJQuery(function ($) {
        var WID, MID, PID;
        var flask_sprite = "https://flasktools.altervista.org/images/vxk8zp.png";

        var autoTownTypes = {};
        var manuTownTypes = {};
        var population = {};

        function loadWorldVars() {
            WID = uw.Game.world_id;
            MID = uw.Game.market_id;
            PID = uw.Game.player_id;

            try {
                var stored = localStorage.getItem(WID + "_townTypes");
                manuTownTypes = stored ? JSON.parse(stored) : {};
            } catch (e) {
                manuTownTypes = {};
            }
        }

        function saveValue(name, val) {
            localStorage.setItem(name, val);
        }

        var TownIcons = {
            types: {
                // Automatic Icons (indexes in sprite)
                lo: 10,
                so: 0,
                fo: 3,
                ld: 6,
                sd: 9,
                fd: 7,
                bu: 14,
                bi: 9,
                ao: 6,
                ad: 10,
                po: 22,
                no: 12,
                // Manual Icons
                fa: 20,
                re: 15,
                di: 2,
                sh: 1,
                lu: 13,
                dp: 11,
                ha: 15,
                si: 18,
                ra: 17,
                ch: 19,
                ti: 23,
                un: 5,
                wd: 16,
                wo: 24,
                bo: 13,
                gr: 21,
                st: 17,
                is: 26,
                he: 4,
                ko: 8
            },

            activate: function () {
                if (!$('.town_name_area').length) {
                    return;
                }

                $('#town_icon').remove();
                $('#flask_townicons_field').remove();

                var townType = manuTownTypes[uw.Game.townId] || autoTownTypes[uw.Game.townId] || "no";

                $('<div id="town_icon"><div class="town_icon_bg"><div class="icon_big townicon_' +
                    townType +
                    '"></div></div></div>').appendTo('.town_name_area');

                $('#town_icon .icon_big').css({
                    backgroundPosition: (TownIcons.types[townType] || 0) * -25 + 'px 0px'
                });

                $('<style id="flask_townicons_field" type="text/css">' +
                    '#town_icon { background:url(' + flask_sprite + ') 0 -125px no-repeat; position:absolute; width:69px; height:61px; left:-47px; top:0px; z-index: 10; } ' +
                    '#town_icon .town_icon_bg { background:url(' + flask_sprite + ') -76px -129px no-repeat; width:43px; height:43px; left:25px; top:4px; cursor:pointer; position: relative; } ' +
                    '#town_icon .town_icon_bg:hover { filter:url(#Brightness11); -webkit-filter:brightness(1.1); box-shadow: 0px 0px 15px rgb(1, 197, 33); } ' +
                    '#town_icon .icon_big { position:absolute; left:9px; top:9px; height:25px; width:25px; } ' +
                    '#town_icon .select_town_icon {position: absolute; top:47px; left:23px; width:145px; display:none; padding:2px; border:3px inset rgb(7, 99, 12); box-shadow:rgba(0, 0, 0, 0.5) 4px 4px 6px; border-radius:0px 10px 10px 10px;' +
                    'background:url(https://gp' + MID + '.innogamescdn.com/images/game/popup/middle_middle.png); } ' +
                    '#town_icon .item-list { max-height:400px; max-width:200px; align:right; overflow-x:hidden; } ' +
                    '#town_icon .option_s { cursor:pointer; width:20px; height:20px; margin:0px; padding:2px 2px 3px 3px; border:2px solid rgba(0,0,0,0); border-radius:5px; background-origin:content-box; background-clip:content-box;} ' +
                    '#town_icon .option_s:hover { border: 2px solid rgb(59, 121, 81) !important;-webkit-filter: brightness(1.3); } ' +
                    '#town_icon .sel { border: 2px solid rgb(202, 176, 109); } ' +
                    '#town_icon hr { width:145px; margin:0px 0px 7px 0px; position:relative; top:3px; border:0px; border-top:2px dotted #000; float:left} ' +
                    '#town_icon .auto_s { width:136px; height:16px; float:left} ' +
                    '.ui_quickbar .left, .ui_quickbar .right { width:46%; } ' +
                    '.town_name_area { z-index:11; left:52%; } ' +
                    '.town_name_area .left { z-index:20; left:-39px; } ' +
                    '</style>').appendTo('head');

                var icoArray = [
                    'ld', 'lo', 'sh', 'di', 'un',
                    'sd', 'so', 'ko', 'ti', 'gr',
                    'fd', 'fo', 'dp', 'no', 'po',
                    're', 'wd', 'st', 'si', 'bu',
                    'he', 'ch', 'bo', 'fa', 'wo'
                ];

                $('<div class="select_town_icon dropdown-list default active"><div class="item-list"></div></div>')
                    .appendTo("#town_icon");

                for (var i = 0; i < icoArray.length; i++) {
                    $('.select_town_icon .item-list')
                        .append('<div class="option_s icon_small townicon_' + icoArray[i] + '" name="' + icoArray[i] + '"></div>');
                }

                $('<hr><div class="option_s auto_s" name="auto"><b>Auto</b></div>')
                    .appendTo('.select_town_icon .item-list');

                $('#town_icon .option_s').click(function () {
                    $("#town_icon .sel").removeClass("sel");
                    $(this).addClass("sel");

                    var name = $(this).attr("name");
                    if (name === "auto") {
                        delete manuTownTypes[uw.Game.townId];
                    } else {
                        manuTownTypes[uw.Game.townId] = name;
                    }
                    TownIcons.changeTownIcon();
                    TownIcons.Map.activate();

                    saveValue(WID + "_townTypes", JSON.stringify(manuTownTypes));
                });

                $('#town_icon .town_icon_bg').click(function () {
                    var el = $('#town_icon .select_town_icon').get(0);
                    el.style.display = (el.style.display === "none" || el.style.display === "") ? "block" : "none";
                });

                var selected = manuTownTypes[uw.Game.townId] || (autoTownTypes[uw.Game.townId] ? "auto" : "");
                if (selected) {
                    $('#town_icon .select_town_icon [name="' + selected + '"]').addClass("sel");
                }

                $.Observer(uw.GameEvents.town.town_switch)
                    .subscribe("town_switch_icon", TownIcons.switchTown);
            },

            switchTown: function () {
                TownIcons.changeTownIcon();
            },

            changeTownIcon: function () {
                var townType = manuTownTypes[uw.Game.townId] || autoTownTypes[uw.Game.townId] || "no";

                $('#town_icon .icon_big')
                    .removeClass()
                    .addClass('icon_big townicon_' + townType + " auto")
                    .css({
                        backgroundPosition: (TownIcons.types[townType] || 0) * -25 + 'px 0px'
                    });

                $('#town_icon .sel').removeClass("sel");
                var sel = manuTownTypes[uw.Game.townId] || (autoTownTypes[uw.Game.townId] ? "auto" : "");
                if (sel) {
                    $('#town_icon .select_town_icon [name="' + sel + '"]').addClass("sel");
                }

                if ($('#town_icon .select_town_icon').length) {
                    $('#town_icon .select_town_icon').get(0).style.display = "none";
                }
            },

            Map: {
                activate: function () {
                    if (!$('#minimap_islands_layer').length) {
                        return;
                    }

                    $('#flask_townicons_map').remove();

                    var style_str = "<style id='flask_townicons_map' type='text/css'>";
                    for (var id in autoTownTypes) {
                        if (!autoTownTypes.hasOwnProperty(id)) continue;
                        var tt = manuTownTypes[id] || autoTownTypes[id];
                        style_str += "#mini_t" + id + ", #town_flag_" + id + " .flagpole {" +
                            "background: rgb(255, 187, 0) url(" + flask_sprite + ") " +
                            ((TownIcons.types[tt] || 0) * -25) +
                            "px -27px repeat !important; } ";
                    }

                    style_str += ".own_town .flagpole, #main_area .m_town.player_" + PID +
                        " { z-index: 100 !important; cursor: pointer; width:19px!important; height:19px!important;" +
                        " border-radius: 11px; border: 2px solid rgb(16, 133, 0); margin: -4px !important; font-size: 0em !important;" +
                        " box-shadow: 1px 1px 0px rgba(0, 0, 0, 0.5); } ";

                    style_str += ".own_town .flagpole:hover, .m_town:hover { z-index: 101 !important; filter: brightness(1.2);" +
                        " -webkit-filter: brightness(1.2); font-size: 2em; margin-top: -1px; } ";

                    style_str += "#minimap_islands_layer .m_town { z-index: 99; cursor: pointer; } ";

                    style_str += "</style>";
                    $(style_str).appendTo('head');

                    $('#minimap_islands_layer').off('click', '.m_town');
                    $('#minimap_islands_layer').on('click', '.m_town', function (e) {
                        var id = parseInt(this.id.substring(6), 10);

                        if (typeof (uw.ITowns.getTown(id)) !== "undefined") {
                            uw.Layout.contextMenu(e, 'determine', { id: id, name: uw.ITowns.getTown(id).name });
                        } else {
                            uw.Layout.contextMenu(e, 'determine', { id: id });
                        }
                        e.stopPropagation();
                    });

                    $('#minimap_islands_layer').off("mousedown");
                    $('#minimap_islands_layer').on("mousedown", function () {
                        if ($('#context_menu').get(0)) {
                            $('#context_menu').get(0).remove();
                        }
                    });
                }
            }
        };

        // Base CSS for small icons (town list / dropdown)
        (function addBaseTownIconCSS() {
            if ($('#flask_townicons').length) {
                return;
            }
            var style_str = '<style id="flask_townicons" type="text/css">';
            style_str += '.icon_small { position:relative; height:20px; width:25px; } ';
            for (var s in TownIcons.types) {
                if (!TownIcons.types.hasOwnProperty(s)) continue;
                style_str += '.townicon_' + s +
                    ' { background:url(' + flask_sprite + ') ' +
                    ((TownIcons.types[s] || 0) * -25) + 'px -26px repeat; float:left;} ';
            }
            style_str += '</style>';
            $(style_str).appendTo('head');
        })();

        // Town list (city list) icons + population percentage
        var TownList = {
            activate: function () {
                if ($('#flask_town_list').length) {
                    return;
                }

                $('<style id="flask_town_list" type="text/css">' +
                    '#town_groups_list .item { text-align: left; padding-left:5px; } ' +
                    '#town_groups_list .inner_column { border: 1px solid rgba(100, 100, 0, 0.3);margin: -2px 0px 0px 2px; } ' +
                    '#town_groups_list .island_quest_icon { position: absolute; right: 30px; top: 3px; } ' +
                    '#town_groups_list .island_quest_icon.hidden_icon { display:none; } ' +
                    '#town_groups_list .jump_town { right: 37px !important; } ' +
                    '#town_groups_list .pop_percent { position: absolute; right: 2px; top:0px; font-size: 0.7em; display:block !important;} ' +
                    '#town_groups_list .full { color: green; } ' +
                    '#town_groups_list .threequarter { color: darkgoldenrod; } ' +
                    '#town_groups_list .half { color: darkred; } ' +
                    '#town_groups_list .quarter { color: red; } ' +
                    '</style>').appendTo('head');

                // hook into town list render
                var idx = 0;
                while (uw.layout_main_controller.sub_controllers[idx] &&
                    uw.layout_main_controller.sub_controllers[idx].name !== 'town_name_area') {
                    idx++;
                }

                var sub = uw.layout_main_controller.sub_controllers[idx];
                if (!sub || !sub.controller || !sub.controller.town_groups_list_view) {
                    return;
                }

                var view = sub.controller.town_groups_list_view;
                if (!view.render_old) {
                    view.render_old = view.render;
                    view.render = function () {
                        view.render_old();
                        TownList.change();
                    };
                }

                if ($('#town_groups_list').length) {
                    TownList.change();
                }
            },

            change: function () {
                var $list = $('#town_groups_list');
                if (!$list.length) {
                    return;
                }

                // Clear previous icons / percentages we added
                $list.find('.flask_townicon, .pop_percent').remove();

                $list.find('.town_group_town').each(function () {
                    var $item = $(this);
                    var town_id_str = $item.attr('name') || $item.data('id') || '';
                    var town_id = parseInt(town_id_str, 10);
                    if (!town_id) {
                        return;
                    }

                    var tt = manuTownTypes[town_id] || autoTownTypes[town_id] || "no";

                    var percent = -1;
                    var popClass = "";
                    if (population[town_id] && typeof population[town_id].percent === 'number') {
                        percent = population[town_id].percent;
                        popClass = "full";
                        if (percent < 75) { popClass = "threequarter"; }
                        if (percent < 50) { popClass = "half"; }
                        if (percent < 25) { popClass = "quarter"; }
                    }

                    var iconHtml = '<div class="icon_small flask_townicon townicon_' + tt + '"></div>';
                    var percentHtml = '';
                    if (percent >= 0) {
                        percentHtml = '<div class="pop_percent ' + popClass + '">' + percent + '%</div>';
                    }

                    $item.prepend(iconHtml + percentHtml);
                });
            }
        };

        function computeAutoTownTypes() {
            autoTownTypes = {};
            population = {};

            var towns = uw.ITowns.getTowns();
            if (!towns) { return; }

            var popByFarmLevel = [
                114, 121, 134, 152, 175, 206, 245, 291, 343, 399,
                458, 520, 584, 651, 720, 790, 863, 938, 1015, 1094,
                1174, 1257, 1341, 1426, 1514, 1602, 1693, 1785, 1878,
                1973, 2070, 2168, 2267, 2368, 2470, 2573, 2678, 2784,
                2891, 3000, 3109, 3220, 3332, 3446, 3560
            ];

            for (var id in towns) {
                if (!towns.hasOwnProperty(id)) continue;
                var town = towns[id];

                // unit profile
                var typeVals = { lo: 0, ld: 0, so: 0, sd: 0, fo: 0, fd: 0 };

                for (var unit in uw.GameData.units) {
                    if (!uw.GameData.units.hasOwnProperty(unit)) continue;
                    var count = parseInt(town.units()[unit], 10) || 0;
                    if (!count) continue;

                    var data = uw.GameData.units[unit];
                    if (!data.is_naval) {
                        if (data.flying) {
                            typeVals.fd += ((data.def_hack + data.def_pierce + data.def_distance) / 3) * count;
                            typeVals.fo += data.attack * count;
                        } else {
                            typeVals.ld += ((data.def_hack + data.def_pierce + data.def_distance) / 3) * count;
                            typeVals.lo += data.attack * count;
                        }
                    } else {
                        typeVals.sd += data.defense * count;
                        typeVals.so += data.attack * count;
                    }
                }

                var mode = ((typeVals.sd + typeVals.ld + typeVals.fd) <= (typeVals.so + typeVals.lo + typeVals.fo)) ? "o" : "d";
                var maxVal = 0;
                for (var key in typeVals) {
                    if (!typeVals.hasOwnProperty(key)) continue;
                    if (typeVals[key] > maxVal) {
                        autoTownTypes[town.id] = key[0] + mode;
                        maxVal = typeVals[key];
                    }
                }
                if (maxVal < 1000) {
                    autoTownTypes[town.id] = "no";
                }

                // population / garrison percentage
                try {
                    var buildVal = uw.GameData.buildings;
                    var levelArray = town.buildings().getLevels();
                    var farmLevel = town.buildings().getBuildingLevel("farm");
                    var popMax;

                    if (buildVal.farm.farm_factor !== undefined) {
                        popMax = Math.floor(buildVal.farm.farm_factor * Math.pow(farmLevel, buildVal.farm.farm_pow));
                    } else {
                        popMax = popByFarmLevel[farmLevel - 1];
                    }

                    var popPlow = town.getResearches().attributes.plow ? 200 : 0;
                    var popFactor = town.getBuildings().getBuildingLevel("thermal") ? 1.1 : 1.0;
                    var popExtra = town.getPopulationExtra();

                    if (town.god && town.god() === 'aphrodite') {
                        popMax += farmLevel * 5;
                    }

                    var popBuilding = 0;
                    for (var b in levelArray) {
                        if (!levelArray.hasOwnProperty(b) || !buildVal[b]) continue;
                        popBuilding += Math.round(buildVal[b].pop * Math.pow(levelArray[b], buildVal[b].pop_factor));
                    }

                    var totalPopSpace = popMax * popFactor + popPlow + popExtra;
                    var maxUnitsPop = totalPopSpace - popBuilding;
                    var usedUnitsPop = parseInt(totalPopSpace - (popBuilding + town.getAvailablePopulation()), 10);

                    if (usedUnitsPop < 0 || !isFinite(usedUnitsPop)) {
                        continue;
                    }

                    if (usedUnitsPop < 300) {
                        autoTownTypes[town.id] = "po";
                    }

                    if (maxUnitsPop > 0) {
                        var percent = Math.round(100 / maxUnitsPop * usedUnitsPop);
                        if (percent < 0) { percent = 0; }
                        if (percent > 100) { percent = 100; }

                        population[town.id] = {
                            max: maxUnitsPop,
                            buildings: popBuilding,
                            units: usedUnitsPop,
                            percent: percent
                        };
                    }
                } catch (e) {
                    // ignore population calc errors, keep existing type if any
                }
            }
        }

        function initIconsOnceReady() {
            var tries = 0;
            var check = setInterval(function () {
                tries++;
                if ($('.town_name_area').length && $('#minimap_islands_layer').length) {
                    clearInterval(check);

                    loadWorldVars();
                    computeAutoTownTypes();
                    TownIcons.activate();
                    TownIcons.Map.activate();
                    TownList.activate();

                    // periodic refresh of auto types and percentages
                    setInterval(function () {
                        computeAutoTownTypes();
                        TownIcons.changeTownIcon();
                        TownIcons.Map.activate();
                        TownList.change();
                    }, 900000);
                } else if (tries > 60) {
                    clearInterval(check);
                }
            }, 500);
        }

        initIconsOnceReady();
    });
})();
