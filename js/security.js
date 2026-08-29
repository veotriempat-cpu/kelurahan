// Client-side convenience protections only.
// IMPORTANT: these controls are not a security boundary.
// Real protection comes from Firebase Authentication + Firestore Rules.

(() => {
    const block = (event) => {
        event.preventDefault();
        event.stopPropagation();
        return false;
    };

    // Disable browser context menu / right click.
    document.addEventListener('contextmenu', block, true);

    // Disable common developer-tools / source shortcuts.
    document.addEventListener('keydown', (event) => {
        const key = String(event.key || '').toLowerCase();

        // F12
        if (event.key === 'F12' || event.keyCode === 123) return block(event);

        // Ctrl + Shift + I / J / C
        if (event.ctrlKey && event.shiftKey && ['i', 'j', 'c'].includes(key)) {
            return block(event);
        }

        // Ctrl + U = View Source
        if (event.ctrlKey && key === 'u') return block(event);

        // Ctrl + S = Save page
        if (event.ctrlKey && key === 's') return block(event);

        // Ctrl + Shift + K (Firefox developer tools)
        if (event.ctrlKey && event.shiftKey && key === 'k') return block(event);
    }, true);

    // Disable drag/drop of page content as a small additional convenience protection.
    document.addEventListener('dragstart', block, true);
})();
