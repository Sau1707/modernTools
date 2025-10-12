// ==UserScript==
// @name         Grepolis – Commercio percentuale + uguale (resilient to town change)
// @namespace    https://your-namespace.example
// @description  Aggiunge 2 pulsanti: “commercio percentuale” e “commercio uguale”, che si re-installano quando la finestra si aggiorna (es. cambio città).
// @version      1.3.0
// @match        https://*.grepolis.com/game/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    const uw = window;
    const $ = uw.$ || uw.jQuery;
    if (!$ || !uw.GameEvents || !$.Observer) return;

    /* ---------- Style ---------- */
    (function injectStyle() {
        if (document.getElementById('pct-trade-style')) return;
        const css = `
            .pct_trade_btn.btn, .eq_trade_btn.btn { 
                position:absolute; 
            }

            .pct_trade_btn .mid, .eq_trade_btn .mid { 
                min-width:26px !important;
            }

            .pct_trade_btn .img_trade, .eq_trade_btn .img_trade { 
                width:27px; 
                height:27px; 
                top:-3px; 
                float:left; 
                position:relative;
                background:url("https://flasktools.altervista.org/images/cjq6d72qk521ig1zz.png") no-repeat; 
            }

            #trade_tab .content { 
                min-height: 320px; 
            }

            #trade .game_border {
                width: 540px; 
            }
        `;
        $('<style id="pct-trade-style">').text(css).appendTo('head');
    })();

    /* ---------- Small helpers ---------- */
    $.fn.toggleClick = function (f1, f2) { let i = 0; return this.on('click', e => { e.preventDefault(); (i++ % 2 ? f2 : f1).call(this, e); }); };

    let res = {}, rest_count = 0;

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
        // Capacity to fill (what the big progressbar shows as "curr")
        const $cap = $root.find((isWonder ? '#ww_big_progressbar' : '#big_progressbar') + ' .caption .curr').first();
        const cap = parseInt($cap.text().replace(/[^\d]/g, ''), 10) || 0;
        res.sum.cur = cap;

        // Per-resource remaining capacity (town) or default for WW
        ['wood', 'stone', 'iron'].forEach(k => {
            if (!isWonder && $root.find('#town_capacity_' + k).length) {
                const cur1 = parseInt($root.find(`#town_capacity_${k} .amounts .curr`).first().text().replace(/[^\d+-]/g, '').replace('+', '').trim(), 10) || 0;
                const cur2 = parseInt($root.find(`#town_capacity_${k} .amounts .curr2`).first().text().replace(/[^\d+-]/g, '').replace('+', '').trim(), 10) || 0;
                const max = parseInt($root.find(`#town_capacity_${k} .amounts .max`).first().text().replace(/[^\d]/g, ''), 10) || 0;
                res[k].max = Math.max(0, max - (cur1 + cur2));
            } else {
                // Safe upper bound for wonder trade inputs
                res[k].max = 30000;
            }
        });
        return { prefix, cap };
    }

    function computeAndFill($root, isWonder) {
        const { prefix } = readStateStart($root);
        setAmount(true, $root, prefix);

        // Top bar resources
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
        res.stone.part += diff; // put rounding remainder to stone

        res.sum.rest = 0; rest_count = 0;
        calcRestAmount();
        setAmount(false, $root, p2);
    }

    // NEW: equal split of available trade capacity (1/3 each, with rounding & max handling)
    function computeAndFillEqual($root, isWonder) {
        const { prefix } = readStateStart($root);
        setAmount(true, $root, prefix);

        const { prefix: p2, cap } = readCapacityAndMax($root, isWonder);

        // Base equal split
        const base = Math.floor(cap / 3);
        const diff = cap - base * 3;

        res.wood.part = base;
        res.stone.part = base + (diff > 0 ? 1 : 0);   // distribute rounding remainder
        res.iron.part = base + (diff > 1 ? 1 : 0);

        ['wood', 'stone', 'iron'].forEach(k => res[k].rest = false);

        // Respect per-resource max by rebalancing surplus (same routine as % button)
        res.sum.rest = 0; rest_count = 0;
        calcRestAmount();

        setAmount(false, $root, p2);
    }

    function readStateStart($root) {
        const isWonder = hasWWTrade($root) && !hasTownTrade($root);
        const prefix = isWonder ? 'ww_' : '';
        res = { wood: {}, stone: {}, iron: {}, sum: {} };
        res.sum.amount = 0;
        return { isWonder, prefix };
    }

    function addButtons($root, isWonder) {
        if ($root.find('.pct_trade_btn').length && $root.find('.eq_trade_btn').length) return;

        const $container = isWonder
            ? $root.find('.trade .send_res').first()
            : $root.find('#trade_tab .content').first();

        if (!$container.length) return;

        const $btnPct = $(`
          <div class="btn pct_trade_btn" title="Commercio percentuale">
            <a class="button" href="#">
              <span class="left"><span class="right">
                <span class="middle mid"><span class="img_trade"></span></span>
              </span></span>
              <span style="clear:both;"></span>
            </a>
          </div>
        `);

        const $btnEq = $(`
          <div class="btn eq_trade_btn" title="Commercio uguale (1/3 - 1/3 - 1/3)">
            <a class="button" href="#">
              <span class="left"><span class="right">
                <span class="middle mid"><span class="img_trade"></span></span>
              </span></span>
              <span style="clear:both;"></span>
            </a>
          </div>
        `);

        // Place side-by-side
        if (isWonder) {
            $btnPct.css({ left: '678px', top: '154px' });
            $btnEq.css({ left: '714px', top: '154px' });
        } else {
            $btnPct.css({ left: '357px', top: '127px' });
            $btnEq.css({ left: '406px', top: '127px' });
        }

        // Toggle: first click = apply, second = clear
        $btnPct.find('a.button').toggleClick(
            () => computeAndFill($root, isWonder),
            () => setAmount(true, $root, isWonder ? 'ww_' : '')
        );

        $btnEq.find('a.button').toggleClick(
            () => computeAndFillEqual($root, isWonder),
            () => setAmount(true, $root, isWonder ? 'ww_' : '')
        );

        $container.prepend($btnEq).prepend($btnPct);
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

    function ensureButtons($root) {
        if (hasTownTrade($root)) addButtons($root, false);
        else if (hasWWTrade($root)) addButtons($root, true);
    }

    function watchTradeWindow($root) {
        let t = null;
        const trigger = () => { if (t) clearTimeout(t); t = setTimeout(() => ensureButtons($root), 50); };
        const obs = new MutationObserver(() => trigger());
        obs.observe($root[0], { childList: true, subtree: true });
        ensureButtons($root);
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
})();
