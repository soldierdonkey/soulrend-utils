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