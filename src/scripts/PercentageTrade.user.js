// ==UserScript==
// @name         PercentageTrade
// @author       Sau1707 - Taken from FLASK-Tools
// @description  Modern Trade
// @version      1.0.0
// @match        http://*.grepolis.com/game/*
// @match        https://*.grepolis.com/game/*
// @icon         https://raw.githubusercontent.com/Sau1707/modernTools/refs/heads/main/public/logo.png
// @updateURL    https://github.com/Sau1707/modernTools/raw/refs/heads/main/src/content/PercentageTrade.user.js
// @downloadURL  https://github.com/Sau1707/modernTools/raw/refs/heads/main/src/content/PercentageTrade.user.js
// @grant        unsafeWindow
// ==/UserScript==


(function () {
    'use strict';
    const uw = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    const $ = uw.$ || uw.jQuery;

    /* ---------- Config: unit profiles (weights) ---------- */
    // amounts computed as scale * weights, where scale = min( cap/(w+s+i), wood/w, stone/s, iron/i )
    const PROFILES = {
        attack_ship: { w: 1, s: 0.2308, i: 0.6154 },
        bireme: { w: 1, s: 0.875, i: 0.225 },
        trireme: { w: 1, s: 0.65, i: 0.65 },
        slinger: { w: 0.55, s: 1, i: 0.4 },
        rider: { w: 0.6666, s: 0.3333, i: 1 },
        sword: { w: 1, s: 0, i: 0.8947 },
        hoplite: { w: 0, s: 0.5, i: 1 },
        archer: { w: 1, s: 0, i: 0.625 },
        chariot: { w: 0.4545, s: 1, i: 0.7273 },
        wall_level: { w: 0, s: 1, i: 0.7 }
    };

    /* ---------- Style ---------- */
    (function injectStyle() {
        if (document.getElementById('pct-trade-style')) return;
        const css = `
            .pct_trade_btn.btn, .eq_trade_btn.btn { position:absolute; }
            .pct_trade_btn .mid, .eq_trade_btn .mid { min-width:26px !important; }
            .pct_trade_btn .img_trade, .eq_trade_btn .img_trade {
                width:27px; height:27px; top:-3px; float:left; position:relative;
                background:url("https://flasktools.altervista.org/images/cjq6d72qk521ig1zz.png") no-repeat;
            }
            .pct_trade_btn .img_trade { background-position: 0 0; }
            .eq_trade_btn  .img_trade { background-position: -27px 0; }

            /* Unit profile grid */
            #app_trade { 
                width:96%; margin:20px auto; display:grid; grid-template-columns: repeat(10, 10%);
            }
            #app_trade .option_s { cursor:pointer; }
            #app_trade .selected { box-shadow: 0 0 10px 5px rgb(34 255 0) !important; }
        `;
        $('<style id="pct-trade-style">').text(css).appendTo('head');
    })();

    /* ---------- Small helpers ---------- */
    function bindToggle($el, onFn, offFn) {
        let active = false;
        $el.off('click.pcteq').on('click.pcteq', function (e) {
            e.preventDefault();
            e.stopPropagation();
            active = !active;
            (active ? onFn : offFn)();
        });
    }

    let res = {}, rest_count = 0;
    let selectedProfile = null; // key of PROFILES or null

    function setAmount(clear, $root, prefix) {
        ['wood', 'stone', 'iron'].forEach(t => {
            if (clear) res[t]?.part && (res[t].part = 0);
            const $inp = $root.find(`#${prefix}trade_type_${t} input[type="text"]`);
            if ($inp.length) $inp.val(Math.floor(res[t].part || 0)).blur();
        });
    }

    function calcRestAmount() {
        if (res.sum.rest > 0) {
            ['wood', 'stone', 'iron'].forEach(k => { if (!res[k].rest) res[k].part += res.sum.rest / (3 - rest_count); });
            res.sum.rest = 0;
        }
        ['wood', 'stone', 'iron'].forEach(k => {
            if (!res[k].rest && res[k].max <= res[k].part) {
                res[k].rest = true; res.sum.rest += res[k].part - res[k].max; rest_count += 1; res[k].part = res[k].max;
            }
        });
        if (res.sum.rest > 0 && rest_count < 3) calcRestAmount();
    }

    function readCapacityAndMax($root, isWonder) {
        const prefix = isWonder ? 'ww_' : '';
        const $cap = $root.find((isWonder ? '#ww_big_progressbar' : '#big_progressbar') + ' .caption .curr').first();
        const cap = parseInt($cap.text().replace(/[^\d]/g, ''), 10) || 0;
        res.sum.cur = cap;

        ['wood', 'stone', 'iron'].forEach(k => {
            if (!isWonder && $root.find('#town_capacity_' + k).length) {
                const cur1 = parseInt($root.find(`#town_capacity_${k} .amounts .curr`).first().text().replace(/[^\d+-]/g, '').replace('+', '').trim(), 10) || 0;
                const cur2 = parseInt($root.find(`#town_capacity_${k} .amounts .curr2`).first().text().replace(/[^\d+-]/g, '').replace('+', '').trim(), 10) || 0;
                const max = parseInt($root.find(`#town_capacity_${k} .amounts .max`).first().text().replace(/[^\d]/g, ''), 10) || 0;
                res[k].max = Math.max(0, max - (cur1 + cur2));
            } else {
                res[k].max = 30000; // safe upper bound for WW inputs
            }
        });
        return { prefix, cap };
    }

    function readStateStart($root) {
        const isWonder = hasWWTrade($root) && !hasTownTrade($root);
        const prefix = isWonder ? 'ww_' : '';
        res = { wood: {}, stone: {}, iron: {}, sum: {} };
        res.sum.amount = 0;
        return { isWonder, prefix };
    }

    /* ---------- Percent split ---------- */
    function computeAndFill($root, isWonder) {
        const { prefix } = readStateStart($root);
        setAmount(true, $root, prefix);

        ['wood', 'stone', 'iron'].forEach(k => {
            res[k].rest = false;
            const n = parseInt($('.ui_resources_bar .' + k + ' .amount').first().text().replace(/[^\d]/g, ''), 10) || 0;
            res[k].amount = n; res.sum.amount += n;
        });
        if (res.sum.amount <= 0) return;

        res.wood.percent = 100 * res.wood.amount / res.sum.amount;
        res.stone.percent = 100 * res.stone.amount / res.sum.amount;
        res.iron.percent = 100 * res.iron.amount / res.sum.amount;

        const { prefix: p2 } = readCapacityAndMax($root, isWonder);

        res.wood.part = Math.floor(res.sum.cur * res.wood.percent / 100);
        res.stone.part = Math.floor(res.sum.cur * res.stone.percent / 100);
        res.iron.part = Math.floor(res.sum.cur * res.iron.percent / 100);

        const diff = res.sum.cur - (res.wood.part + res.stone.part + res.iron.part);
        res.stone.part += diff; // rounding remainder

        res.sum.rest = 0; rest_count = 0;
        calcRestAmount();
        setAmount(false, $root, p2);
    }

    /* ---------- Equal split (by capacity; rebalances to per-resource max) ---------- */
    function computeAndFillEqual($root, isWonder) {
        const { prefix } = readStateStart($root);
        setAmount(true, $root, prefix);
        const { prefix: p2, cap } = readCapacityAndMax($root, isWonder);

        const base = Math.floor(cap / 3);
        const diff = cap - base * 3;

        res.wood.part = base;
        res.stone.part = base + (diff > 0 ? 1 : 0);
        res.iron.part = base + (diff > 1 ? 1 : 0);

        ['wood', 'stone', 'iron'].forEach(k => res[k].rest = false);

        res.sum.rest = 0; rest_count = 0;
        calcRestAmount();
        setAmount(false, $root, p2);
    }

    /* ---------- NEW: Unit profile split (weights + available resources + capacity) ---------- */
    function computeAndFillProfile($root, profileKey) {
        if (!profileKey || !PROFILES[profileKey]) return;
        const { prefix } = readStateStart($root);
        setAmount(true, $root, prefix);

        const town = uw.ITowns && uw.ITowns.getCurrentTown && uw.ITowns.getCurrentTown();
        if (!town) return;

        const cap = town.getAvailableTradeCapacity ? town.getAvailableTradeCapacity() : 0;
        const d = town.resources ? town.resources() : (town.getCurrentResources ? town.getCurrentResources() : { wood: 0, stone: 0, iron: 0 });
        const wts = PROFILES[profileKey];

        const sumW = (wts.w + wts.s + wts.i) || 0;
        if (sumW <= 0 || cap <= 0) return;

        // max scale allowed by capacity and by available stock per resource
        const sCap = cap / sumW;
        const sWood = wts.w > 0 ? (d.wood / wts.w) : Infinity;
        const sStone = wts.s > 0 ? (d.stone / wts.s) : Infinity;
        const sIron = wts.i > 0 ? (d.iron / wts.i) : Infinity;

        const scale = Math.max(0, Math.min(sCap, sWood, sStone, sIron));

        res.wood.part = Math.floor(wts.w * scale);
        res.stone.part = Math.floor(wts.s * scale);
        res.iron.part = Math.floor(wts.i * scale);

        // Small rounding adjustment to hit capacity if possible
        const used = res.wood.part + res.stone.part + res.iron.part;
        let rem = Math.max(0, Math.min(cap - used, d.wood - res.wood.part + d.stone - res.stone.part + d.iron - res.iron.part));
        const order = ['wood', 'stone', 'iron'];
        let idx = 0;
        while (rem > 0 && idx < 3) { res[order[idx]].part += 1; rem -= 1; idx += 1; }

        setAmount(false, $root, '');
    }

    /* ---------- UI: buttons ---------- */
    function addButtons($root, isWonder) {
        if ($root.find('.pct_trade_btn').length && $root.find('.eq_trade_btn').length) return;

        const $container = isWonder
            ? $root.find('.trade .send_res').first()
            : $root.find('#trade_tab .content').first();

        if (!$container.length) return;

        const $btnPct = $(`
          <div class="btn pct_trade_btn" title="Commercio percentuale">
            <a class="button" href="#"><span class="left"><span class="right">
              <span class="middle mid"><span class="img_trade"></span></span>
            </span></span><span style="clear:both;"></span></a>
          </div>`);

        const $btnEq = $(`
          <div class="btn eq_trade_btn" title="Commercio uguale (1/3 - 1/3 - 1/3)">
            <a class="button" href="#"><span class="left"><span class="right">
              <span class="middle mid"><span class="img_trade"></span></span>
            </span></span><span style="clear:both;"></span></a>
          </div>`);

        if (isWonder) {
            $btnPct.css({ left: '678px', top: '154px' });
            $btnEq.css({ left: '714px', top: '154px' });
        } else {
            $btnPct.css({ left: '357px', top: '127px' });
            $btnEq.css({ left: '406px', top: '127px' });
        }

        bindToggle($btnPct,
            () => computeAndFill($root, isWonder),
            () => setAmount(true, $root, isWonder ? 'ww_' : '')
        );
        bindToggle($btnEq,
            () => computeAndFillEqual($root, isWonder),
            () => setAmount(true, $root, isWonder ? 'ww_' : '')
        );
        $container.prepend($btnEq).prepend($btnPct);
    }

    /* ---------- NEW UI: unit profile grid (town only) ---------- */
    function addProfileGrid($root) {
        if (!hasTownTrade($root)) return;
        const $content = $root.find('#trade_tab .content').first();
        if (!$content.length || $content.find('#app_trade').length) return;

        const $grid = $('<div id="app_trade"></div>');
        const order = ['attack_ship', 'bireme', 'trireme', 'sword', 'slinger', 'archer', 'hoplite', 'rider', 'chariot', 'wall_level'];

        order.forEach(k => {
            const $cell = $('<div>', {
                class: 'option_s unit index_unit unit_icon40x40 ' + k + (selectedProfile === k ? ' selected' : '')
            }).on('click', () => {
                if (selectedProfile === k) {
                    selectedProfile = null;
                    $grid.find('.selected').removeClass('selected');
                    // clear inputs
                    setAmount(true, $root, '');
                } else {
                    selectedProfile = k;
                    $grid.find('.selected').removeClass('selected');
                    $cell.addClass('selected');
                    computeAndFillProfile($root, selectedProfile);
                }
            });
            $grid.append($cell);
        });

        $content.append($grid);
    }

    /* ---------- Detect trade UIs ---------- */
    function hasTownTrade($root) {
        return $root.find('#trade_tab').length &&
            $root.find('#trade_type_wood input[type="text"]').length &&
            $root.find('#trade_type_stone input[type="text"]').length &&
            $root.find('#trade_type_iron input[type="text"]').length &&
            $root.find('#big_progressbar .caption .curr').length;
    }
    function hasWWTrade($root) {
        return $root.find('.wonder_res_container').length &&
            $root.find('#ww_trade_type_wood input[type="text"]').length &&
            $root.find('#ww_trade_type_stone input[type="text"]').length &&
            $root.find('#ww_trade_type_iron input[type="text"]').length &&
            ($root.find('#ww_big_progressbar .caption .curr').length ||
                $root.find('#big_progressbar .caption .curr').length);
    }

    function ensureUI($root) {
        if (hasTownTrade($root)) {
            addButtons($root, false);
            addProfileGrid($root);
            // If a profile is active, re-apply after DOM updates
            if (selectedProfile) computeAndFillProfile($root, selectedProfile);
        } else if (hasWWTrade($root)) {
            addButtons($root, true);
        }
    }

    function watchTradeWindow($root) {
        let t = null;
        const trigger = () => { if (t) clearTimeout(t); t = setTimeout(() => ensureUI($root), 50); };
        const obs = new MutationObserver(() => trigger());
        obs.observe($root[0], { childList: true, subtree: true });
        ensureUI($root);
    }

    /* ---------- Hook into window lifecycle ---------- */
    $.Observer(uw.GameEvents.window.open).subscribe('pct_trade_attach', (event, payload) => {
        const wnd = payload && payload.wnd;
        if (!wnd || typeof wnd.getID !== 'function') return;

        const rootSel = `#gpwnd_${wnd.getID()}`;
        let tries = 0;
        const intv = setInterval(() => {
            tries++;
            const $root = $(rootSel);
            if (!$root.length) { if (tries > 200) clearInterval(intv); return; }
            watchTradeWindow($root);
            clearInterval(intv);
        }, 50);
    });

    // Also scan already-open windows on reload
    setTimeout(() => $('[id^="gpwnd_"]').each((_, el) => watchTradeWindow($(el))), 600);

    /* ---------- OPTIONAL: refresh after AJAX that changes town info ---------- */
    $(document).ajaxComplete((_e, _jq, req) => {
        try {
            const parts = (req && req.url || '').split('?');
            const base = parts[0] ? parts[0].slice(5) : '';
            if (base === '/town_info/' || base === '/town/') {
                // re-apply active profile in all town windows
                $('[id^="gpwnd_"]').each((_, el) => {
                    const $root = $(el);
                    if (selectedProfile && hasTownTrade($root)) computeAndFillProfile($root, selectedProfile);
                });
            }
        } catch { }
    });
})();


// Add the Town Trade Improvement (show needed amounts to max capacity)
(function () {
    'use strict';
    const uw = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

    function waitForGame() {
        if (!uw.jQuery || !uw.Layout || !uw.Layout.wnd || !uw.GPWindowMgr) {
            setTimeout(waitForGame, 1000);
            return;
        }
        init();
    }

    function init() {
        setInterval(checkTradeWindows, 1000);
    }

    function checkTradeWindows() {
        try {
            const wndArray = uw.Layout.wnd.getOpen(uw.Layout.wnd.TYPE_TOWN);
            for (const k in wndArray) {
                if (!wndArray.hasOwnProperty(k)) continue;
                const wnd = wndArray[k];
                if (!wnd || typeof wnd.getAction !== 'function') continue;

                if (wnd.getAction() === 'trading') {
                    const $content = wnd.getJQElement().find('.gpwindow_content');
                    if ($content.length && !$content.data('tti_initialized')) {
                        const wndId = wnd.getID();
                        addTownTradeImprovement($content, wndId);
                        $content.data('tti_initialized', true);
                    }
                }
            }
        } catch (e) {
            // Silent fail – game internals may change
        }
    }

    function addTownTradeImprovement($wnd, wndId) {
        try {
            const $ = uw.jQuery;

            // Already added or not a normal town trade window
            if ($wnd.find(".tti_needed").length > 0 || $wnd.find(".town-capacity-indicator").length === 0) {
                return;
            }

            function getRes(res_type, wnd_id, mode) {
                const res = {};
                res.wnd = $("DIV#gpwnd_" + wnd_id);
                res.selector = res.wnd.find("#town_capacity_" + res_type);
                res.caption = {
                    curr: parseInt(res.wnd.find("#big_progressbar .caption .curr").html(), 10) || 0,
                    max: parseInt(res.wnd.find("#big_progressbar .caption .max").html(), 10) || 0,
                    now: parseInt(res.wnd.find("#trade_type_" + res_type + " input").val(), 10) || 0
                };
                res.amounts = {
                    curr: parseInt(res.selector.find(".curr").html(), 10) || 0,
                    curr2: parseInt((res.selector.find(".curr2").html() || "").substring(3), 10) || 0,
                    curr3: parseInt((res.selector.find(".curr3").html() || "").substring(3), 10) || 0,
                    max: parseInt(res.selector.find(".max").html(), 10) || 0
                };

                // City festival caps (wood/iron 15000, stone 18000)
                if (mode === "cult" || mode === "cultreverse") {
                    res.amounts.max = (res_type === "stone") ? 18000 : 15000;
                }
                if (mode === "cultreverse") {
                    const townrescurrent = $("div#ui_box div.ui_resources_bar div.indicator[data-type='" + res_type + "'] div.amount").text().replace(/\./g, '');
                    res.needed = parseInt(townrescurrent, 10) - res.amounts.max;
                } else {
                    res.needed = res.amounts.max - res.amounts.curr - res.amounts.curr2;
                }

                // Theater caps (wood/iron 10000, stone 12000)
                if (mode === "thea" || mode === "theareverse") {
                    res.amounts.max = (res_type === "stone") ? 12000 : 10000;
                }
                if (mode === "theareverse") {
                    const townrescurrent = $("div#ui_box div.ui_resources_bar div.indicator[data-type='" + res_type + "'] div.amount").text().replace(/\./g, '');
                    res.needed = parseInt(townrescurrent, 10) - res.amounts.max;
                } else {
                    res.needed = res.amounts.max - res.amounts.curr - res.amounts.curr2;
                }

                return res;
            }

            // Show how much is needed to reach max for the selected mode (base = storage max)
            $wnd.find(".tripple-progress-progressbar").each(function () {
                const res_type = this.id.split("_")[2]; // town_capacity_wood_progressbar => "wood"
                const res = getRes(res_type, wndId);    // mode undefined: uses storage max
                $(this).find(".amounts").append(
                    '<span class="tti_needed tti_needed_' + res_type + '_' + wndId + '"> &#9658; ' + res.needed + '</span>'
                );
            });

            // Buttons container
            $wnd.find("#trade_tab").append(
                '<div id="tti_improvement_trade">' +
                '<a id="tti_wood_' + wndId + '_max"  class="tti_trade tti_max"        style="top:200px"></a>' +
                '<a id="tti_stone_' + wndId + '_max" class="tti_trade tti_max"        style="top:234px"></a>' +
                '<a id="tti_iron_' + wndId + '_max"  class="tti_trade tti_max"        style="top:268px"></a>' +
                '<a id="tti_wood_' + wndId + '_cult" class="tti_trade tti_send_cult"  style="top:200px"></a>' +
                '<a id="tti_stone_' + wndId + '_cult"class="tti_trade tti_send_cult"  style="top:234px"></a>' +
                '<a id="tti_iron_' + wndId + '_cult" class="tti_trade tti_send_cult"  style="top:268px"></a>' +
                '<a id="tti_wood_' + wndId + '_thea" class="tti_trade tti_send_thea"  style="top:200px"></a>' +
                '<a id="tti_stone_' + wndId + '_thea"class="tti_trade tti_send_thea"  style="top:234px"></a>' +
                '<a id="tti_iron_' + wndId + '_thea" class="tti_trade tti_send_thea"  style="top:268px"></a>' +
                '</div>'
            );

            // Styles (same icons as original FLASK-TOOLS feature)
            $wnd.find(".tti_send_cult").css({
                right: "84px",
                position: "absolute",
                height: "16px",
                width: "22px",
                "background-image": "url(https://flasktools.altervista.org/images/game/trade_cult.png)",
                "background-repeat": "no-repeat",
                "background-position": "0px -1px"
            });
            $wnd.find(".tti_send_thea").css({
                right: "63px",
                position: "absolute",
                height: "16px",
                width: "22px",
                "background-image": "url(https://flasktools.altervista.org/images/game/trade_thea.png)",
                "background-repeat": "no-repeat",
                "background-position": "0px -1px"
            });
            $wnd.find(".tti_max").css({
                right: "105px",
                position: "absolute",
                height: "16px",
                width: "22px",
                "background-image": "url(https://flasktools.altervista.org/images/game/trade_arrow.png)",
                "background-repeat": "no-repeat",
                "background-position": "0px -1px"
            });

            $wnd.find(".tti_trade").hover(
                function () {
                    $(this).css({ "background-position": "0px -17px" });
                },
                function () {
                    $(this).css({ "background-position": "0px -1px" });
                }
            );

            $wnd.find(".tti_trade").on("click", function () {
                const id = this.id.split("_"); // [ 'tti', res_type, wndId, mode ]
                const res_type = id[1];
                const wnd_id = id[2];
                const mode = id[3] === 'max' ? undefined : id[3]; // "max" uses storage max

                const res = getRes(res_type, wnd_id, mode);

                let send;
                if (res.needed - res.amounts.curr3 <= 0 || res.caption.curr <= 0 || res.amounts.curr3 > 0) {
                    send = 0;
                } else if (res.needed - res.amounts.curr3 > res.caption.curr) {
                    send = res.caption.curr + res.amounts.curr3;
                } else {
                    send = res.needed;
                }

                res.wnd.find("#trade_type_" + res_type + " input")
                    .val(send)
                    .select()
                    .blur();
            });

            // Simple native tooltips
            $wnd.find('.tti_max').attr('title', 'Riempie fino alla capacità di magazzino');
            $wnd.find('.tti_send_cult').attr('title', 'Risorse per feste cittadine');
            $wnd.find('.tti_send_thea').attr('title', 'Risorse per teatro');

        } catch (err) {
            // In caso di problemi, non bloccare il gioco
            console.error('TTI extract error:', err);
        }
    }

    waitForGame();
})();
