function addModernTool($menu) {
    // Avoid duplicates
    if ($menu.find('#modern-settings').length) return;

    const settingsMap = {
        "QuickFarmTowns": "<h1> Example Settings </h1> <p> Example settings for QuickFarmTowns </p>",
    }
    const toolKeys = Object.keys(settingsMap);

    if (!toolKeys.length) {
        console.warn('ModernTool: no tools found in window.tools.settings()');
        return;
    }

    const toSlug = (s) => String(s).toLowerCase().replace(/[^\w\-]+/g, '-').replace(/^-+|-+$/g, '');

    // Build dynamic menu HTML
    const itemsHTML = toolKeys.map(key => {
        const slug = toSlug(key);
        return [
            '  <li>',
            `    <a class="modern-tool-item" data-tool="${encodeURIComponent(key)}" data-slug="${slug}" href="#">${key}</a>`,
            '  </li>'
        ].join('');
    }).join('');

    const modernToolHTML = [
        '<b id="modern-settings">ModernTool</b>',
        '<ul>',
        itemsHTML,
        '</ul>'
    ].join('');

    // Insert before version if exists
    const $versionImg = $menu.find('#version');
    if ($versionImg.length) {
        $(modernToolHTML).insertBefore($versionImg);
    } else {
        $menu.append(modernToolHTML);
    }

    $menu.data('modernToolsMap', settingsMap);

    const $container = $('.settings-container');
    if (!$container.length) {
        console.error('ModernTool: .settings-container not found');
        return;
    }

    // Click on modern tool item
    $menu.off('click.modernTool')
        .on('click.modernTool', 'a.modern-tool-item', function (e) {
            e.preventDefault();

            const $item = $(this);
            const key = decodeURIComponent($item.data('tool'));
            const slug = $item.data('slug');
            const map = $menu.data('modernToolsMap') || {};
            const html = map[key];

            if (!html) {
                console.warn(`ModernTool: no settings HTML for key "${key}"`);
                return;
            }

            // Hide all other sections
            $container.find('.section').hide();

            // Create or show the section
            const sectionId = `section-${slug}`;
            let $section = $container.find(`#${sectionId}`);
            if (!$section.length) {
                $section = $(`<div class="section" id="${sectionId}"></div>`);
                $section.append(html);
                $container.append($section);
            }
            $section.show();

            // Remember that ModernTool is active
            $menu.data('modernActiveSection', sectionId);
        });

    // When anything *not* from ModernTool is clicked — hide current ModernTool section
    $menu.off('click.modernToolHide')
        .on('click.modernToolHide', 'a:not(.modern-tool-item)', function () {
            const sectionId = $menu.data('modernActiveSection');
            if (!sectionId) return;
            const $section = $container.find(`#${sectionId}`);
            if ($section.length) {
                $section.hide();
            }
            $menu.removeData('modernActiveSection');
        });
}

// Hook into player settings window
$.Observer(GameEvents.window.open).subscribe('modern_settings', (event, payload) => {
    if (!payload || payload.context !== 'player_settings') return;
    const { wnd } = payload;
    const $body = $(`#gpwnd_${wnd.getID()}`);
    const $menu = $body.find('.settings-menu');

    const apply = () => {
        addModernTool($menu);
        $body.find('#version').css({ 'margin-top': '10px', 'position': 'relative', 'bottom': '0' });
    };

    if ($menu.length) {
        apply();
        return;
    }

    // Wait for lazy-loaded menu
    const obs = new MutationObserver(() => {
        const $menuNow = $body.find('.settings-menu');
        if ($menuNow.length) {
            addModernTool($menuNow);
            $body.find('#version').css({ 'margin-top': '10px', 'position': 'relative', 'bottom': '0' });
            obs.disconnect();
        }
    });

    if ($body[0]) {
        obs.observe($body[0], { childList: true, subtree: true });
        setTimeout(() => obs.disconnect(), 10000);
    }
});
