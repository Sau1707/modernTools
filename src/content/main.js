
// This is the last injected script, it handle the activation / deactivation of the features
class ModernTools {
    constructor() {
    }
}


// Expose to page context
const tools = new ModernTools();
window.tools = tools;
