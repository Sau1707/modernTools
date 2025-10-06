// Each tool shall extend the base Tool class
// It includes basic methods like destroy as well some utilities

class ExampleTool extends window.Tool {
    constructor() {
        super();
        console.log('Example tool initialized');
    }

    enable() {
        console.log('Example tool enabled');
    }

    destroy() {
        console.log('Example tool destroyed');
    }

    settings() {
        return '<div class="section">' +
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
            '</div>';
    }
}

// The each tool must be exposed to the window context to be instantiable from other scripts
window.modernExample = new ExampleTool();
