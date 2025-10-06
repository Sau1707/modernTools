const $container = $(".settings-container");

// Hide all other sections
$container.find(".section").hide();


// Add the modern section
$container.append(
    '<div class="section" id="s_email_notifications">' +
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
