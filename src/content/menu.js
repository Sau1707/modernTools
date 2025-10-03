function addModernTool($menu) {
    if ($menu.find('#modern-tool-element1').length) return;

    const modernToolHTML = [
        '<b>ModernTool</b>',
        '<ul>',
        '  <li class="">',
        '    <a class="settings-link" id="modern-tool-element1" href="#">element1</a>',
        '  </li>',
        '</ul>'
    ].join('');

    const $versionImg = $menu.find('#version');
    if ($versionImg.length) {
        // Insert ModernTool block right before the version image
        $(modernToolHTML).insertBefore($versionImg);
    } else {
        // Fallback: just append at the end
        $menu.append(modernToolHTML);
    }

    // Delegate click for the new submenu item
    $menu.off('click.modernTool')
        .on('click.modernTool', '#modern-tool-element1', function (e) {
            e.preventDefault();
            w(this).sendMessage('openPopup', 'modern_tool_element1', 800, 600);
        });
}

$.Observer(GameEvents.window.open).subscribe('modern_settings', (event, payload) => {
    if (!payload || payload.context !== 'player_settings') return;
    const { wnd } = payload;
    const $body = $(`#gpwnd_${wnd.getID()}`);

    const $existingMenu = $body.find('.settings-menu');
    if ($existingMenu.length) {
        addModernTool($existingMenu);
        return;
    }

    // Wait for the menu to appear if it loads slowly
    const obs = new MutationObserver(() => {
        const $menu = $body.find('.settings-menu');
        if ($menu.length) {
            addModernTool($menu);
            obs.disconnect();
        }
    });

    if ($body[0]) {
        obs.observe($body[0], { childList: true, subtree: true });
        setTimeout(() => obs.disconnect(), 10000); // safety timeout
    }
});

