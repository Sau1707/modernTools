// WindowBordLess - Kajenje
// https://it.forum.grepolis.com/index.php?threads/script-finestre-senza-vincolo-bordo.25468/
// Removes the border around the game window

window.initWindowBorderLess = () => {
    const removeContainment = (el) => {
        const $el = $(el);
        if ($el.hasClass('ui-dialog') && $el.data('ui-draggable')) {
            $el.draggable('option', 'containment', false);
        }
    };

    document.querySelectorAll('.ui-dialog').forEach(removeContainment);

    const observer = new MutationObserver(mutations => {
        mutations.forEach(m => {
            m.addedNodes.forEach(n => {
                if (n.nodeType === 1 && n.classList.contains('ui-dialog')) {
                    setTimeout(() => removeContainment(n), 100);
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

};

window.initWindowBorderLess();
