// This is the last injected script, it handle the activation / deactivation of the features
class ModernTools {
    /** Enable a specific tool*/
    enable(name, kwargs = {}) {
        if (!name || typeof name !== 'string') return;
        name = name.trim().toLowerCase();

        if (name === 'example') window.modernExample.enable(kwargs);
        if (name === 'sentinelindicator') window.modernSentinelIndicator.enable(kwargs);
    }

    /** Disable a specific tool */
    disable(name) {
        if (!name || typeof name !== 'string') return;
        name = name.trim().toLowerCase();

        if (name === 'sentinelindicator') window.modernSentinelIndicator.disable();
    }

    /** Returns the settings */
    settings() {
        let obj = {};
        if (window.modernExample) obj["example"] = window.modernExample.settings();
        if (window.modernSentinelIndicator) obj["sentinelIndicator"] = window.modernSentinelIndicator.settings();

        return obj;
    }

}


// Expose to page context
window.tools = new ModernTools();

// Example usage:
tools.enable('example');
tools.enable('sentinelIndicator');


