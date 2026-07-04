/**
 * Real-time parser converter
 * Translates native MC strings formatted with section markers (§) into fully responsive HTML
 */
function parseMinecraft(text, activeTheme) {
    let html = '';
    let i = 0;
    
    let currentStyles = {
        color: activeTheme === 'parchment' ? '#2c1d11' : '#ffffff',
        bold: false, italic: false, underline: false, strikethrough: false, obfuscated: false
    };

    const selectedColors = activeTheme === 'parchment' ? parchmentColors : mcColors;

    while (i < text.length) {
        if (text[i] === '§' && i + 1 < text.length) {
            let code = text[i + 1].toLowerCase();
            
            if (selectedColors[code] !== undefined) {
                currentStyles.color = selectedColors[code];
                currentStyles.bold = false;
                currentStyles.italic = false;
                currentStyles.underline = false;
                currentStyles.strikethrough = false;
                currentStyles.obfuscated = false;
            } else if (code === 'k') {
                currentStyles.obfuscated = true;
            } else if (code === 'l') {
                currentStyles.bold = true;
            } else if (code === 'm') {
                currentStyles.strikethrough = true;
            } else if (code === 'n') {
                currentStyles.underline = true;
            } else if (code === 'o') {
                currentStyles.italic = true;
            } else if (code === 'r') {
                currentStyles.color = activeTheme === 'parchment' ? '#2c1d11' : '#ffffff';
                currentStyles.bold = false; currentStyles.italic = false;
                currentStyles.underline = false; currentStyles.strikethrough = false;
                currentStyles.obfuscated = false;
            }
            i += 2;
        } else {
            let start = i;
            while (i < text.length && text[i] !== '§') {
                i++;
            }
            let chunk = text.substring(start, i);
            
            let styleStr = `color: ${currentStyles.color};`;
            if (currentStyles.bold) styleStr += 'font-weight: bold;';
            if (currentStyles.italic) styleStr += 'font-style: italic;';
            
            let textDec = [];
            if (currentStyles.underline) textDec.push('underline');
            if (currentStyles.strikethrough) textDec.push('line-through');
            if (textDec.length > 0) styleStr += `text-decoration: ${textDec.join(' ')};`;

            let escapedChunk = chunk
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");

            let classes = [];
            if (currentStyles.obfuscated) classes.push('mc-obfuscated');
            
            let classStr = classes.length > 0 ? ` class="${classes.join(' ')}"` : '';
            let dataTextStr = currentStyles.obfuscated ? ` data-text="${escapedChunk}"` : '';
            
            html += `<span style="${styleStr}"${classStr}${dataTextStr}>${escapedChunk}</span>`;
        }
    }
    return html;
}

/**
 * Standardizes browser RGB colors to hexadecimal representation for reliable color checking routines
 */
function parseColorToHex(colorStr) {
    if (!colorStr) return '';
    if (colorStr.startsWith('#')) return colorStr.toLowerCase();
    if (colorStr.startsWith('rgb')) {
        const matches = colorStr.match(/\d+/g);
        if (matches && matches.length >= 3) {
            const r = parseInt(matches[0]).toString(16).padStart(2, '0');
            const g = parseInt(matches[1]).toString(16).padStart(2, '0');
            const b = parseInt(matches[2]).toString(16).padStart(2, '0');
            return `#${r}${g}${b}`.toLowerCase();
        }
    }
    return colorStr;
}

/**
 * Traverses an HTML node tree and converts components back to standard native Minecraft section string formats
 */
function convertNodeToMinecraft(node, activeTheme) {
    let result = '';
    
    function walk(currentNode, currentStyles) {
        if (currentNode.nodeType === 3) { // Text Node
            let text = currentNode.nodeValue;
            if (text.length > 0) {
                let codes = '';
                if (currentStyles.colorCode) codes += '§' + currentStyles.colorCode;
                if (currentStyles.bold) codes += '§l';
                if (currentStyles.italic) codes += '§o';
                if (currentStyles.underline) codes += '§n';
                if (currentStyles.strikethrough) codes += '§m';
                if (currentStyles.obfuscated) codes += '§k';
                result += codes + text;
            }
        } else if (currentNode.nodeType === 1) { // Element Node
            let nodeName = currentNode.nodeName.toLowerCase();
            if (nodeName === 'br') {
                result += '\n';
                return;
            }
            
            let nextStyles = { ...currentStyles };
            
            if (currentNode.getAttribute('data-mce-reset') === 'true') {
                nextStyles.colorCode = 'r';
                nextStyles.bold = false;
                nextStyles.italic = false;
                nextStyles.underline = false;
                nextStyles.strikethrough = false;
                nextStyles.obfuscated = false;
            } else {
                let colorHex = parseColorToHex(currentNode.style.color);
                if (colorHex) {
                    const colors = activeTheme === 'parchment' ? parchmentColors : mcColors;
                    let foundCode = Object.keys(colors).find(k => colors[k].toLowerCase() === colorHex);
                    if (foundCode) {
                        nextStyles.colorCode = foundCode;
                    }
                }
                
                if (currentNode.style.fontWeight === 'bold' || nodeName === 'b' || nodeName === 'strong') {
                    nextStyles.bold = true;
                }
                if (currentNode.style.fontStyle === 'italic' || nodeName === 'i' || nodeName === 'em') {
                    nextStyles.italic = true;
                }
                let textDec = currentNode.style.textDecoration || '';
                if (textDec.includes('underline') || nodeName === 'u') {
                    nextStyles.underline = true;
                }
                if (textDec.includes('line-through') || nodeName === 'strike' || nodeName === 's') {
                    nextStyles.strikethrough = true;
                }
                if (currentNode.classList.contains('mc-obfuscated')) {
                    nextStyles.obfuscated = true;
                }
            }
            
            let isBlock = ['div', 'p', 'tr', 'li'].includes(nodeName);
            if (isBlock && result.length > 0 && !result.endsWith('\n')) {
                result += '\n';
            }
            
            if (currentNode.classList.contains('mc-obfuscated') && currentNode.hasAttribute('data-text')) {
                let text = currentNode.getAttribute('data-text');
                let codes = '';
                if (nextStyles.colorCode) codes += '§' + nextStyles.colorCode;
                if (nextStyles.bold) codes += '§l';
                if (nextStyles.italic) codes += '§o';
                if (nextStyles.underline) codes += '§n';
                if (nextStyles.strikethrough) codes += '§m';
                codes += '§k';
                result += codes + text;
                return;
            }
            
            for (let child of currentNode.childNodes) {
                walk(child, nextStyles);
            }
        }
    }
    
    let initialStyles = {
        colorCode: '', bold: false, italic: false, underline: false, strikethrough: false, obfuscated: false
    };
    
    for (let child of node.childNodes) {
        walk(child, initialStyles);
    }
    
    return result;
}

/**
 * Optimizes consecutive styling declarations, purging format codes instantly overridden by subsequent codes
 */
function cleanOverwrittenCodes(text) {
    return text.replace(/(§[0-9a-fk-or])+/gi, function(match) {
        let codes = [];
        for (let i = 0; i < match.length; i += 2) {
            codes.push(match.substring(i, i + 2).toLowerCase());
        }
        
        let lastColorOrResetIdx = -1;
        for (let i = 0; i < codes.length; i++) {
            let char = codes[i][1];
            if ((char >= '0' && char <= '9') || (char >= 'a' && char <= 'f') || char === 'r') {
                lastColorOrResetIdx = i;
            }
        }
        
        let finalCodes = [];
        let startIdx = 0;
        if (lastColorOrResetIdx !== -1) {
            finalCodes.push(codes[lastColorOrResetIdx]);
            startIdx = lastColorOrResetIdx + 1;
        }
        
        let seenStyles = new Set();
        for (let i = startIdx; i < codes.length; i++) {
            let code = codes[i];
            if (!seenStyles.has(code)) {
                seenStyles.add(code);
                finalCodes.push(code);
            }
        }
        
        return finalCodes.join('');
    });
}