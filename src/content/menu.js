function addModernTool($menu) {
    if ($menu.find('#modern-tool-element1').length) return;

    const modernToolHTML = [
        '<b>ModernTool</b>',
        '<ul>',
        '  <li>',
        '    <a id="modern-tool-element1" href="#">element1</a>',
        '  </li>',
        '</ul>'
    ].join('');

    const $versionImg = $menu.find('#version');
    if ($versionImg.length) {
        $(modernToolHTML).insertBefore($versionImg);
    } else {
        $menu.append(modernToolHTML);
    }

    // Our own click handler
    $menu.off('click.modernTool').on('click.modernTool', '#modern-tool-element1', function (e) {
        e.preventDefault();

        const $container = $('.settings-container');
        console.log($container);

        // Hide all other sections
        $container.find(".section").hide();

        // Add the modern section
        $container.append(
            '<div class="section">' +
            '  <div class="game_header bold">Promemoria e-mail</div>' +
            '  <div class="group">' +
            '    <p>Decidi su quali novità del gioco desideri essere informato via e-mail:</p>' +

            '    <div class="checkbox_new new_message large" style="margin-bottom:10px; width:100%;">' +
            '      <div class="cbx_icon"></div><div class="cbx_caption">E-mail per nuovo messaggio</div>' +
            '    </div>' +

            '    <div class="checkbox_new new_report large" style="margin-bottom:10px; width:100%;">' +
            '      <div class="cbx_icon"></div><div class="cbx_caption">E-mail per nuovo rapporto</div>' +
            '    </div>' +

            '    <div class="checkbox_new building_finished large" style="margin-bottom:10px; width:100%;">' +
            '      <div class="cbx_icon"></div><div class="cbx_caption">E-mail per completamento di un edificio</div>' +
            '    </div>' +

            '    <div class="button_new reports_save">' +
            '      <div class="left"></div>' +
            '      <div class="right"></div>' +
            '      <div class="caption js-caption">' +
            '        <span>Salva</span><div class="effect js-effect"></div>' +
            '      </div>' +
            '    </div>' +
            '  </div>' +
            '</div>'
        );
    });
}

// Hook into player settings window
$.Observer(GameEvents.window.open).subscribe('modern_settings', (event, payload) => {
    if (!payload || payload.context !== 'player_settings') return;
    const { wnd } = payload;
    const $body = $(`#gpwnd_${wnd.getID()}`);

    // Wait for lazy-loaded menu
    const obs = new MutationObserver(() => {
        const $menu = $body.find('.settings-menu');
        if ($menu.length) {
            addModernTool($menu);

            // Fix the version position
            $body.find("#version").css({ "margin-top": "10px", "position": "relative", "bottom": "0" });

            obs.disconnect();
        }
    });

    if ($body[0]) {
        obs.observe($body[0], { childList: true, subtree: true });
        setTimeout(() => obs.disconnect(), 10000);
    }
});
