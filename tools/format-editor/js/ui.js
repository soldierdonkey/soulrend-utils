let currentTheme = 'tooltip';
let currentExportTab = 'kubejs';
let isResizing = false;
let lastActiveWidthPct = 50;
let isExportMinimized = false; // Minimization tracking configuration flag

function toggleExportSystem() {
    const content = document.getElementById('export-content-area');
    const icon = document.getElementById('export-toggle-icon');
    
    isExportMinimized = !isExportMinimized;
    
    if (isExportMinimized) {
        content.classList.add('hidden');
        icon.className = "fa-solid fa-chevron-up";
    } else {
        content.classList.remove('hidden');
        icon.className = "fa-solid fa-chevron-down";
    }
}

function switchTheme(theme) {
    currentTheme = theme;
    
    document.getElementById('wrapper-tooltip').classList.add('hidden');
    document.getElementById('wrapper-chat').classList.add('hidden');
    document.getElementById('wrapper-parchment').classList.add('hidden');
    document.getElementById(`wrapper-${theme}`).classList.remove('hidden');

    ['tooltip', 'chat', 'parchment'].forEach(t => {
        const btn = document.getElementById(`btn-theme-${t}`);
        if (t === theme) {
            btn.className = "px-3 py-1 text-[11px] font-medium rounded-md transition-all duration-200 flex items-center gap-1.5 bg-rose-600 text-white";
        } else {
            btn.className = "px-3 py-1 text-[11px] font-medium rounded-md text-slate-400 hover:text-slate-200 transition-all duration-200 flex items-center gap-1.5";
        }
    });

    updatePreview();
}

function switchExportTab(tab) {
    currentExportTab = tab;
    
    document.getElementById('export-pane-kubejs').classList.add('hidden');
    document.getElementById('export-pane-json').classList.add('hidden');
    document.getElementById(`export-pane-${tab}`).classList.remove('hidden');

    ['kubejs', 'json'].forEach(t => {
        const btn = document.getElementById(`tab-btn-${t}`);
        if (t === tab) {
            btn.className = "px-4 py-3 text-xs font-semibold text-rose-500 border-b-2 border-rose-500 transition-all flex items-center gap-2";
        } else {
            btn.className = "px-4 py-3 text-xs font-semibold text-slate-500 hover:text-slate-200 border-b-2 border-transparent transition-all flex items-center gap-2";
        }
    });
}

function injectFormat(tag) {
    const textarea = document.getElementById('editor-box');
    let startPos = textarea.selectionStart;
    let endPos = textarea.selectionEnd;
    let before = textarea.value.substring(0, startPos);
    let after = textarea.value.substring(endPos, textarea.value.length);
    
    textarea.value = before + tag + after;
    textarea.focus();
    textarea.selectionStart = startPos + tag.length;
    textarea.selectionEnd = startPos + tag.length;
    
    updatePreview();
}

function clearAllFields() {
    document.getElementById('input-title').value = '';
    document.getElementById('input-subtitle').value = '';
    document.getElementById('editor-box').value = '';
    updatePreview();
}

/**
 * Calculates character offset inside a node relative to its root text content container
 */
function getTextSelectionOffset(root, targetNode, targetOffset) {
    let currentOffset = 0;
    let found = false;

    function walk(currentNode) {
        if (found) return;
        if (currentNode === targetNode) {
            currentOffset += targetOffset;
            found = true;
            return;
        }
        if (currentNode.nodeType === 3) {
            currentOffset += currentNode.nodeValue.length;
        } else {
            for (let child of currentNode.childNodes) {
                walk(child);
                if (found) return;
            }
        }
    }

    walk(root);
    return currentOffset;
}

/**
 * Applies a visual styling tag onto selected text nodes inside a contenteditable rendering wrapper
 */
function applyStyleToSelection(styleType, value) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;
    
    let node = range.commonAncestorContainer;
    let insidePreview = false;
    let targetEl = null;
    
    while (node) {
        if (node.nodeType === 1 && node.hasAttribute('contenteditable')) {
            insidePreview = true;
            targetEl = node;
            break;
        }
        node = node.parentNode;
    }
    
    if (!insidePreview || !targetEl) return;
    
    // Get the plain text boundaries of what the user highlighted
    const startTxtOffset = getTextSelectionOffset(targetEl, range.startContainer, range.startOffset);
    const endTxtOffset = getTextSelectionOffset(targetEl, range.endContainer, range.endOffset);
    
    // Convert current DOM structure back to a raw sequence with formatting tokens
    const fullRawMinecraftText = convertNodeToMinecraft(targetEl, currentTheme);
    
    // Translate the plain-text bounds into the matching index positions within the raw section-marked string
    let mcStartIdx = -1;
    let mcEndIdx = -1;
    let textCharCount = 0;
    let i = 0;
    
    while (i < fullRawMinecraftText.length) {
        if (textCharCount === startTxtOffset && mcStartIdx === -1) {
            mcStartIdx = i;
        }
        if (textCharCount === endTxtOffset && mcEndIdx === -1) {
            mcEndIdx = i;
        }
        
        if (fullRawMinecraftText[i] === '§' && i + 1 < fullRawMinecraftText.length) {
            i += 2;
        } else {
            textCharCount++;
            i++;
        }
    }
    if (mcStartIdx === -1) mcStartIdx = 0;
    if (mcEndIdx === -1) mcEndIdx = fullRawMinecraftText.length;
    
    // Format type parsing translation layer
    let generatedTag = '';
    if (styleType === 'color') {
        generatedTag = '§' + value;
    } else if (styleType === 'bold') {
        generatedTag = '§l';
    } else if (styleType === 'italic') {
        generatedTag = '§o';
    } else if (styleType === 'underline') {
        generatedTag = '§n';
    } else if (styleType === 'strikethrough') {
        generatedTag = '§m';
    } else if (styleType === 'obfuscated') {
        generatedTag = '§k';
    } else if (styleType === 'reset') {
        generatedTag = '§r';
    }
    
    // Reconstruct the master format string using the updated parser engine routine rules
    const localizedUpdatedMcText = modifyMinecraftStringSelection(fullRawMinecraftText, mcStartIdx, mcEndIdx, generatedTag);
    
    // Update the master input form references
    const id = targetEl.id;
    let inputEl = null;
    if (id === 'preview-tooltip-title' || id === 'preview-parchment-title') {
        inputEl = document.getElementById('input-title');
    } else if (id === 'preview-tooltip-subtitle' || id === 'preview-chat-status' || id === 'preview-parchment-subtitle') {
        inputEl = document.getElementById('input-subtitle');
    } else if (id === 'preview-tooltip' || id === 'preview-chat' || id === 'preview-parchment') {
        inputEl = document.getElementById('editor-box');
    }
    
    if (inputEl) {
        inputEl.value = localizedUpdatedMcText;
    }
    
    selection.removeAllRanges();
    updatePreview();
}

/**
 * Converts rich text content nodes back into native Minecraft structures and syncs left-hand form inputs
 */
function triggerPreviewSync(targetEl) {
    const id = targetEl.id;
    let mcText = convertNodeToMinecraft(targetEl, currentTheme);
    mcText = cleanOverwrittenCodes(mcText);
    
    let inputEl = null;
    if (id === 'preview-tooltip-title' || id === 'preview-parchment-title') {
        inputEl = document.getElementById('input-title');
    } else if (id === 'preview-tooltip-subtitle' || id === 'preview-chat-status' || id === 'preview-parchment-subtitle') {
        inputEl = document.getElementById('input-subtitle');
    } else if (id === 'preview-tooltip' || id === 'preview-chat' || id === 'preview-parchment') {
        inputEl = document.getElementById('editor-box');
    }
    
    if (inputEl) {
        inputEl.value = mcText;
    }
    
    updatePreview(id);
}

function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').innerText = message;
    
    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    
    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

function startResize(e) {
    if (window.innerWidth < 768) return;
    isResizing = true;
    document.body.style.cursor = 'col-resize';
    const resizer = document.getElementById('drag-resizer');
    resizer.classList.add('bg-rose-600', 'w-2');
    resizer.classList.remove('bg-slate-900', 'w-1.5');
}

function stopResize() {
    if (!isResizing) return;
    isResizing = false;
    document.body.style.cursor = 'default';
    const resizer = document.getElementById('drag-resizer');
    resizer.classList.add('bg-slate-900', 'w-1.5');
    resizer.classList.remove('bg-rose-600', 'w-2');
}

function resize(e) {
    if (!isResizing) return;
    let clientX = (e.touches && e.touches.length > 0) ? e.touches[0].clientX : e.clientX;

    const workspace = document.getElementById('workspace');
    const rect = workspace.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;

    const snapThreshold = 12;
    if (pct < snapThreshold) {
        minimizeLeft();
    } else if (pct > (100 - snapThreshold)) {
        minimizeRight();
    } else {
        expandBoth();
        document.getElementById('left-pane').style.width = `${pct}%`;
        document.getElementById('right-pane').style.width = `${100 - pct}%`;
        lastActiveWidthPct = pct;
    }
}

function minimizeLeft() {
    document.getElementById('left-pane').style.width = '0%';
    document.getElementById('left-pane').classList.add('hidden');
    document.getElementById('drag-resizer').classList.add('hidden');
    document.getElementById('right-pane').style.width = '100%';
    document.getElementById('collapsed-left-tab').classList.remove('hidden');
    document.getElementById('collapsed-right-tab').classList.add('hidden');
}

function minimizeRight() {
    document.getElementById('right-pane').style.width = '0%';
    document.getElementById('right-pane').classList.add('hidden');
    document.getElementById('drag-resizer').classList.add('hidden');
    document.getElementById('left-pane').style.width = '100%';
    document.getElementById('collapsed-right-tab').classList.remove('hidden');
    document.getElementById('collapsed-left-tab').classList.add('hidden');
}

function expandBoth() {
    document.getElementById('left-pane').classList.remove('hidden');
    document.getElementById('right-pane').classList.remove('hidden');
    document.getElementById('drag-resizer').classList.remove('hidden');
    document.getElementById('collapsed-left-tab').classList.add('hidden');
    document.getElementById('collapsed-right-tab').classList.add('hidden');
}

function restoreLeft() {
    expandBoth();
    if (lastActiveWidthPct < 15) lastActiveWidthPct = 30; 
    document.getElementById('left-pane').style.width = `${lastActiveWidthPct}%`;
    document.getElementById('right-pane').style.width = `${100 - lastActiveWidthPct}%`;
    updatePreview();
}

function restoreRight() {
    expandBoth();
    if (lastActiveWidthPct > 85) lastActiveWidthPct = 70;
    document.getElementById('left-pane').style.width = `${lastActiveWidthPct}%`;
    document.getElementById('right-pane').style.width = `${100 - lastActiveWidthPct}%`;
    updatePreview();
}

function handleWindowResize() {
    const leftPane = document.getElementById('left-pane');
    const rightPane = document.getElementById('right-pane');
    const resizer = document.getElementById('drag-resizer');
    
    if (window.innerWidth < 768) {
        leftPane.style.width = '';
        rightPane.style.width = '';
        resizer.classList.add('hidden');
        document.getElementById('collapsed-left-tab').classList.add('hidden');
        document.getElementById('collapsed-right-tab').classList.add('hidden');
        leftPane.classList.remove('hidden');
        rightPane.classList.remove('hidden');
    } else {
        resizer.classList.remove('hidden');
        if (leftPane.classList.contains('hidden')) {
            minimizeLeft();
        } else if (rightPane.classList.contains('hidden')) {
            minimizeRight();
        } else {
            expandBoth();
            leftPane.style.width = `${lastActiveWidthPct}%`;
            rightPane.style.width = `${100 - lastActiveWidthPct}%`;
        }
    }
}