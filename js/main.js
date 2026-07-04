/**
 * Processes incoming data stream variants to sync views cleanly
 */
function updatePreview() {
    const editorBox = document.getElementById('editor-box');
    const textValue = editorBox.value;
    
    document.getElementById('char-counter').innerText = `Characters: ${textValue.length}`;

    const parsedHTML = parseMinecraft(textValue, currentTheme);
    document.getElementById('preview-tooltip').innerHTML = parsedHTML || `<span class="text-slate-500 italic">No content. Start editing...</span>`;
    document.getElementById('preview-chat').innerHTML = parsedHTML || `<span class="text-slate-500 italic">No chat stream lines...</span>`;
    document.getElementById('preview-parchment').innerHTML = parsedHTML || `<span class="text-slate-700/50 italic">Empty page...</span>`;

    document.getElementById('export-code-kubejs').textContent = generateKubeJSExport(textValue);
    document.getElementById('export-code-json').textContent = generateJSONExport(textValue);
}

// Obfuscated ticker routine loop
setInterval(() => {
    document.querySelectorAll('.mc-obfuscated').forEach(el => {
        let originalText = el.getAttribute('data-text') || el.innerText;
        let randomized = '';
        const pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+=-{}[]:;<>?,./';
        for(let i = 0; i < originalText.length; i++) {
            if (originalText[i] === ' ') {
                randomized += ' ';
            } else if (originalText[i] === '\n') {
                randomized += '\n';
            } else {
                randomized += pool[Math.floor(Math.random() * pool.length)];
            }
        }
        el.innerHTML = randomized;
    });
}, 80);

// Initialize interaction hooks
window.onload = function() {
    const resizer = document.getElementById('drag-resizer');
    const editorBox = document.getElementById('editor-box');

    editorBox.addEventListener('input', updatePreview);
    resizer.addEventListener('mousedown', startResize);
    resizer.addEventListener('touchstart', startResize, { passive: true });

    window.addEventListener('mousemove', resize);
    window.addEventListener('touchmove', resize, { passive: false });
    window.addEventListener('mouseup', stopResize);
    window.addEventListener('touchend', stopResize);
    window.addEventListener('resize', handleWindowResize);

    loadTemplate('feral');
    handleWindowResize();
};