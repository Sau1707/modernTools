// This is the last injected script, it handle the activation / deactivation of the features
class ModernTools {
    /** Enable a specific tool*/
    enable(name, kwargs = {}) {
        switch (name) {
            case 'example':
                window.modernExample.enable(kwargs);
                console.info(`Tool ${name} enabled.`);
                break;
            // Add more tools here as needed
            default:
                console.warn(`Tool ${name} not recognized.`);
        }
    }

    /** Disable a specific tool */
    disable(name) {
        switch (name) {
            case 'example':
                window.modernExample.disable();
                console.info(`Tool ${name} disabled.`);
                break;
            // Add more tools here as needed
            default:
                console.warn(`Tool ${name} not recognized.`);
        }
    }

    /** Returns the settings */
    settings() {
        let obj = {};
        if (window.modernExample && typeof window.modernExample.settings === 'function') obj["example"] = window.modernExample.settings();

        return obj;
    }

}


console.log(window.modernExample)
// Expose to page context
window.tools = new ModernTools();
console.log(window.tools.settings());
// Example usage:
tools.enable('example');

