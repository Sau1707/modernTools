// ==UserScript==
// @name         BetterActivity
// @author       Sau1707 - Taken from GRCRT
// @description  Auto-minimize Daily Reward
// @version      1.0.0
// @match        http://*.grepolis.com/game/*
// @match        https://*.grepolis.com/game/*
// @icon         https://raw.githubusercontent.com/Sau1707/modernTools/refs/heads/main/public/logo.png
// @updateURL    https://github.com/Sau1707/modernTools/raw/refs/heads/main/src/content/BetterActivity.user.js
// @downloadURL  https://github.com/Sau1707/modernTools/raw/refs/heads/main/src/content/BetterActivity.user.js
// @grant        unsafeWindow
// ==/UserScript==


(function () {
    'use strict';

    // Wait until jQuery and the target element are available
    function waitForBox() {
        if (typeof window.$ === 'undefined' ||
            !document.querySelector('#toolbar_activity_commands_list')) {
            setTimeout(waitForBox, 500);
            return;
        }
        makeBoxDraggable();
    }

    function makeBoxDraggable() {
        var $ = window.$;

        var $box = $('#toolbar_activity_commands_list');
        if ($box.length === 0) return;

        // Wrap the box if not already wrapped
        if ($('#grcrt_taclWrap').length === 0) {
            $box.wrap(
                $('<div/>', {
                    'class': 'grcrt_taclWrap',
                    id: 'grcrt_taclWrap'
                })
            );
        }

        var $wrap = $('#grcrt_taclWrap');

        // Add main class for styling (as in original)
        $box.addClass('grcrt_tacl');

        // Initialize draggable if jQuery UI is available
        if (typeof $wrap.draggable === 'function') {
            $wrap.draggable().draggable('enable');
        } else {
            console.warn('grcrt_taclWrap: jQuery UI draggable() not found on this page.');
        }

        // Add the close/reset button inside the dropdown
        addCloseButton($box, $wrap);

        // Set up behavior: if wrapper has style (was moved), keep popup visible
        setupStayOpenWhenMoved($box, $wrap);

        // If on init it is already moved (style present), force it to show once
        if ($box.hasClass('grcrt_tacl') && $wrap.attr('style')) {
            $('.activity.commands').trigger('mouseenter');
        }
    }

    function addCloseButton($box, $wrap) {
        var $ = window.$;

        // Assuming dropdown list is a direct child with class .js-dropdown-list
        var $dropdown = $box.children('.js-dropdown-list');
        if ($dropdown.length === 0) return;

        // Only add if not already present
        if ($dropdown.children('a.cancel').length === 0) {
            var $cancel = $('<a/>', {
                href: '#n',
                'class': 'cancel',
                text: '×', // can be changed if needed
                style: 'display:none;'
            }).on('click', function (e) {
                e.preventDefault();
                // Reset the position of the wrapper (remove inline style)
                $wrap.removeAttr('style');
            });

            $dropdown.append($cancel);
        }
    }

    function setupStayOpenWhenMoved($box, $wrap) {
        var $ = window.$;

        // MutationObserver similar to the original:
        // if box has class, wrapper has style (i.e. it was moved),
        // and the box is being hidden (display:none), then re-trigger the hover
        var targetNode = $box[0];
        if (!targetNode) return;

        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function () {
                if ($box.hasClass('grcrt_tacl') &&
                    $wrap.attr('style') &&
                    $box.css('display') === 'none') {

                    // This emulates the original:
                    // $(".activity.commands").trigger("mouseenter");
                    $('.activity.commands').trigger('mouseenter');
                }
            });
        });

        observer.observe(targetNode, {
            attributes: true,
            childList: false,
            characterData: false
        });
    }

    // Inject CSS including the cancel button behavior
    (function injectCss() {
        var css = `
            #grcrt_taclWrap {
                left: 312px;
                position: absolute;
                top: 29px;
            }
            #grcrt_taclWrap > #toolbar_activity_commands_list {
                left: 0 !important;
                top: 0 !important;
            }
            .grcrt_tacl {
                z-index: 5000 !important;
            }
            .grcrt_tacl > .js-dropdown-list > a.cancel {
                position: relative;
                float: right;
                margin-bottom: 11px;
                display: none;
                opacity: 0;
                visibility: hidden;
                transition: visibility 0s, opacity 0.5s linear;
            }
            .grcrt_tacl > .js-dropdown-list:hover > a.cancel {
                display: block !important;
                visibility: visible;
                opacity: 0.5;
            }
            .grcrt_tacl > .js-dropdown-list > a.cancel:hover {
                opacity: 1;
            }
        `;
        var style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    })();

    waitForBox();
})();