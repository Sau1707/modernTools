// ==UserScript==
// @name         Modern Plan
// @author       Sau1707
// @description  Simplify planning attacks with Captain Advisor
// @version      1.0.0
// @match        http://*.grepolis.com/game/*
// @match        https://*.grepolis.com/game/*
// @icon         
// ==/UserScript==


(function () {
    let dateObj;
    const uw = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

    uw.$.Observer(uw.GameEvents.window.open).subscribe("modern_plan", (event, window, ...others) => {
        if (window.context !== "town") return;

        const { wnd } = window;
        const id = wnd.getID();
        const $view = $(`#gpwnd_${id}`);

        const observer = new MutationObserver(() => {
            const $btn = $view.find('#btn_plan_attack_town');
            if (!$btn.length) return;

            // Already customized for this instance
            if ($btn.data('qr_init')) return;
            $btn.data('qr_init', true);

            // Remove default Grepolis handler from:
            // i.find("#btn_plan_attack_town").button({}).on("btn:click", ...)
            $btn.off('btn:click');

            // Attach your own handler on the Grepolis button event
            $btn.on('btn:click.quick_rurals', function () {

                const $el = $('.attack_support_window[class*="attack_support_tab_target_"]');

                if ($el.length) {
                    const classes = $el.attr('class').split(/\s+/);

                    for (const c of classes) {
                        if (c.startsWith('attack_support_tab_target_')) {
                            let target_id = parseInt(c.replace('attack_support_tab_target_', ''), 10);

                            // Gather units to send
                            const units = {};
                            $view.find(".unit_wrapper .unit_container").each(function () {
                                const unitEl = $(this).find("a.unit");
                                const unitName = unitEl.data("unit_id");

                                const input = $(this).find("input");
                                if (input.length === 0) return;

                                const rawVal = input.val();
                                if (rawVal == null) return;

                                const inputVal = rawVal.trim();
                                if (inputVal === "") return;

                                units[unitName] = inputVal;
                            });

                            // Get the type of the attack
                            const attack = $view.find(".attack_type.attack.checked").length
                            const revolt = $view.find(".attack_type.revolt.checked").length
                            const attack_type = attack ? "attack" : revolt ? "revolt" : "support";

                            // Check if to include the hero
                            const include_hero = $view.find(".cbx_include_hero.checkbox_new.large").hasClass("checked");

                            myAttackFunction(target_id, units, attack_type, include_hero);
                            break;
                        }
                    }
                }
            });
        });

        if ($view.length) {
            observer.observe($view[0], {
                childList: true,
                subtree: true
            });
        }
    });

    // Your custom function
    function myAttackFunction(target_id, units, attack_type, include_hero) {

        if (GameDataPremium.isAdvisorActivated("captain")) {
            const wnd = AttackPlannerWindowFactory.openAttackPlannerForTarget(target_id);

            const id = wnd.getID();

            const $view = $(`#gpwnd_${id}`);

            const observer = new MutationObserver(() => {
                const $input = $view.find('.txt_search_in_towns input[type="text"]');

                if ($input.length) {
                    observer.disconnect();

                    // Get the textbox widget registered under this window
                    let txt_search_in_towns = CM.get(wnd.getContext(), "txt_search_in_towns");
                    txt_search_in_towns.setValue(ITowns.getTown(Game.townId).name);

                    // Hide all the non available units by default
                    const show_all_units = CM.get(wnd.getContext(), "show_all_units");
                    show_all_units.click();

                    // Expand the units
                    $(".click_detection").click();

                    // Insert the unites in the plan
                    let { main } = wnd.getContext();
                    let ctx = { main: main, sub: 'selected_row' };

                    for (const unit in units) {
                        const value = units[unit];
                        const textboxId = "textbox_unit_" + unit;

                        CM.get(ctx, textboxId).setValue(value);
                    }

                    // If there is only one plan, select it
                    const options = CM.get(ctx, "dd_select_plan").getOptions();
                    const valid = options.filter(o => Number(o.value) > 0);
                    if (valid.length === 1) {
                        CM.get(ctx, "dd_select_plan").setValue(valid[0].value);
                    }

                    // Datepicker - set to today
                    if (dateObj) {
                        CM.get(ctx, "dp_attack_day").datepicker({ "timestamp": Math.floor(dateObj.getTime() / 1000) })
                    }

                    // Attack type
                    CM.get(ctx, "rb_attack_type").setValue(attack_type)

                    // Enable the saving of the time by default
                    CM.get(wnd.getContext(), "check_use_same_time").check(true);

                    // Include hero
                    if (include_hero) {
                        CM.get(wnd.getContext(), "cbx_include_hero").check(true);
                    }

                    // Add options to save the date when clicking the button
                    const $btn_add_plan = $view.find('.btn_add_plan');
                    $btn_add_plan.on('click', function () {
                        const dp = CM.get(ctx, "dp_attack_day");
                        const t = dp.getTime();
                        const day = dp.getDay();
                        const month = dp.getMonth();
                        const year = dp.getYear();

                        // Save the dateObj for later use
                        dateObj = new Date(year, month - 1, day, t.hours, t.minutes, t.seconds);
                    });
                }
            });

            observer.observe($view[0], { childList: true, subtree: true });

        } else hOpenWindow.openActivateAdvisorWindow("captain")
    }
})();