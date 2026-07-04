/**
 * Processes incoming data stream configurations to sync views cleanly
 * Takes an optional skipElementId parameter to protect the cursor focus state of an active editor layer
 */
function updatePreview(skipElementId) {
    const titleText = document.getElementById('input-title').value;
    const subtitleText = document.getElementById('input-subtitle').value;
    const bodyText = document.getElementById('editor-box').value;
    
    // Updates character counter logic globally across inputs
    const aggregateLength = titleText.length + subtitleText.length + bodyText.length;
    document.getElementById('char-counter').innerText = `Characters: ${aggregateLength}`;

    // 1. Tooltip Context Generation
    if (skipElementId !== 'preview-tooltip-title') {
        document.getElementById('preview-tooltip-title').innerHTML = parseMinecraft(titleText, 'tooltip') || 'Unnamed Component';
    }
    if (skipElementId !== 'preview-tooltip-subtitle') {
        document.getElementById('preview-tooltip-subtitle').innerHTML = parseMinecraft(subtitleText, 'tooltip') || 'No Metadata';
    }
    if (skipElementId !== 'preview-tooltip') {
        document.getElementById('preview-tooltip').innerHTML = parseMinecraft(bodyText, 'tooltip') || `<span class="text-slate-500 italic">No description provided...</span>`;
    }

    // 2. Chat Window Sync Mechanics
    if (skipElementId !== 'preview-chat-status') {
        document.getElementById('preview-chat-status').innerHTML = parseMinecraft(subtitleText, 'chat') || '<span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span> Live Server Stream';
    }
    if (skipElementId !== 'preview-chat') {
        document.getElementById('preview-chat').innerHTML = parseMinecraft(bodyText, 'chat') || `<span class="text-slate-500 italic">No console text buffers...</span>`;
    }

    // 3. Chronicle Parchment Configuration
    if (skipElementId !== 'preview-parchment-title') {
        document.getElementById('preview-parchment-title').innerHTML = parseMinecraft(titleText, 'parchment') || 'Chapter Genesis';
    }
    if (skipElementId !== 'preview-parchment-subtitle') {
        document.getElementById('preview-parchment-subtitle').innerHTML = parseMinecraft(subtitleText, 'parchment') || 'Page I';
    }
    if (skipElementId !== 'preview-parchment') {
        document.getElementById('preview-parchment').innerHTML = parseMinecraft(bodyText, 'parchment') || `<span class="text-slate-700/50 italic">Empty page layout lines...</span>`;
    }

    // 4. Combined Exporter Pipeline Configuration
    let combinedExportSource = "";
    if(titleText) combinedExportSource += titleText + "\n";
    if(subtitleText) combinedExportSource += subtitleText + "\n";
    combinedExportSource += bodyText;

    document.getElementById('export-code-kubejs').textContent = generateKubeJSExport(combinedExportSource);
    document.getElementById('export-code-json').textContent = generateJSONExport(combinedExportSource);
}

// Obfuscated ticker routine loop
setInterval(() => {
    document.querySelectorAll('.mc-obfuscated').forEach(el => {
        if (!el._originalText) {
            el._originalText = el.getAttribute('data-obfuscate-template') || el.getAttribute('data-text') || el.innerText || "obf";
        }
        let originalText = el._originalText;
        let randomized = '';
        const pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+=-{}[]:;<>?,./';
        
        for(let i = 0; i < originalText.length; i++) {
            if (originalText[i] === '§' || (i > 0 && originalText[i-1] === '§')) {
                continue;
            } else if (originalText[i] === ' ') {
                randomized += ' ';
            } else {
                randomized += pool[Math.floor(Math.random() * pool.length)];
            }
        }
        
        if (randomized.length === 0 && originalText.length > 0) {
            randomized = pool[Math.floor(Math.random() * pool.length)];
        }
        
        el.innerText = randomized;
    });
}, 80);

// Initialize application initialization steps
window.onload = function() {
    const resizer = document.getElementById('drag-resizer');
    
    // Add event bindings manually across configured targets
    document.getElementById('input-title').addEventListener('input', () => updatePreview());
    document.getElementById('input-subtitle').addEventListener('input', () => updatePreview());
    document.getElementById('editor-box').addEventListener('input', () => updatePreview());

    // Connect contenteditable interactive hooks to enable comprehensive two-way sync
    const editablePreviewIds = [
        'preview-tooltip-title', 'preview-tooltip-subtitle', 'preview-tooltip',
        'preview-chat-status', 'preview-chat',
        'preview-parchment-title', 'preview-parchment-subtitle', 'preview-parchment'
    ];
    editablePreviewIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', function() {
                triggerPreviewSync(el);
            });
        }
    });

    resizer.addEventListener('mousedown', startResize);
    resizer.addEventListener('touchstart', startResize, { passive: true });

    window.addEventListener('mousemove', resize);
    window.addEventListener('touchmove', resize, { passive: false });
    window.addEventListener('mouseup', stopResize);
    window.addEventListener('touchend', stopResize);
    window.addEventListener('resize', handleWindowResize);

    // Initial default layout deployment entries
    document.getElementById('input-title').value = defaultConfiguration.title;
    document.getElementById('input-subtitle').value = defaultConfiguration.subtitle;
    document.getElementById('editor-box').value = defaultConfiguration.body;
    
    updatePreview();
    handleWindowResize();
};