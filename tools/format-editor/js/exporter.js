/**
 * Translates line text strings to formatted KubeJS configuration arrays
 */
function generateKubeJSExport(text) {
    const lines = text.split('\n');
    let arrayCode = '[\n';
    lines.forEach((line, index) => {
        if (line.trim().length === 0) {
            arrayCode += '  "",\n';
        } else {
            const sanitizedLine = line.replace(/"/g, '\\"');
            arrayCode += `  "${sanitizedLine}"${index < lines.length - 1 ? ',' : ''}\n`;
        }
    });
    arrayCode += ']';
    return arrayCode;
}

/**
 * Translates lines directly to standard Minecraft JSON Text Array layout
 */
function generateJSONExport(text) {
    const lines = text.split('\n');
    let jsonOutput = '[\n';
    lines.forEach((line, index) => {
        let textObject = { text: line + (index < lines.length - 1 ? '\n' : '') };
        jsonOutput += `  ${JSON.stringify(textObject)}${index < lines.length - 1 ? ',' : ''}\n`;
    });
    jsonOutput += ']';
    return jsonOutput;
}

/**
 * Copy generated arrays directly to computer clipboard safely
 */
function copyExportedText(elementId) {
    const codeEl = document.getElementById(elementId);
    const textToCopy = codeEl.textContent;

    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = textToCopy;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    
    try {
        document.execCommand('copy');
        showToast("Array structure successfully copied to clipboard!");
    } catch (err) {
        showToast("Failed to copy automatically. Please select text manually.");
    }
    
    document.body.removeChild(tempTextArea);
}