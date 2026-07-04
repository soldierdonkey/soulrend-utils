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