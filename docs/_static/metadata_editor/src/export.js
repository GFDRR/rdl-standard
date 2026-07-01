import { packageDataset, cleanEmptyValues, getFilteredFormData } from './utils.js';


function showFilenameModal(defaultFilename, extension, callback) {
    const modal = new bootstrap.Modal(document.getElementById('filenameModal'));
    const input = document.getElementById('exportFilename');
    const extensionLabel = document.getElementById('exportExtension');
    const confirmBtn = document.getElementById('confirmExport');

    // Set default filename and extension
    input.value = defaultFilename;
    extensionLabel.textContent = '.' + extension;

    // Remove old event listeners by cloning the button
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    // Add new event listener
    newConfirmBtn.addEventListener('click', function() {
        let filename = input.value.trim();
        if (!filename) {
            filename = defaultFilename;
        }

        // Remove extension if user included it
        if (filename.endsWith('.' + extension)) {
            filename = filename.slice(0, -(extension.length + 1));
        }

        modal.hide();
        callback(filename);
    });

    // Focus input when modal is shown
    document.getElementById('filenameModal').addEventListener('shown.bs.modal', function() {
        input.focus();
        input.select();
    });

    // Allow Enter key to confirm
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            newConfirmBtn.click();
        }
    });

    modal.show();
}

export function exportJsonData(currentFormData, activeSections) {
    const filteredData = getFilteredFormData(currentFormData, activeSections);
    const packagedData = packageDataset(filteredData, currentFormData);

    // Clean empty values before export
    const cleanedData = cleanEmptyValues(packagedData);

    // Generate default filename from dataset ID
    const defaultFilename = cleanedData.datasets?.[0]?.id ? cleanedData.datasets[0].id : 'rdls_metadata';

    // Show modal to get filename
    showFilenameModal(defaultFilename, 'json', function(filename) {
        const blob = new Blob([JSON.stringify(cleanedData, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename + '.json';
        a.click();
        URL.revokeObjectURL(url);
    });
}

export function exportXmlData(currentFormData, activeSections) {

    const filteredData = getFilteredFormData(currentFormData, activeSections);
    // Clean empty values before export
    const cleanedData = cleanEmptyValues(filteredData);

    // Generate default filename from dataset ID
    const defaultFilename = cleanedData.id ? cleanedData.id : 'rdls_metadata';

    // Show modal to get filename
    showFilenameModal(defaultFilename, 'xml', function(filename) {
        const xml = jsonToXml(cleanedData, 'rdls_dataset');
        const blob = new Blob([xml], {type: 'application/xml'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename + '.xml';
        a.click();
        URL.revokeObjectURL(url);
    });
}

function jsonToXml(obj, rootName = 'root') {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n`;

    function objectToXml(obj, indent = '  ') {
        let result = '';
        for (const [key, value] of Object.entries(obj)) {
            if (Array.isArray(value)) {
                value.forEach(item => {
                    result += `${indent}<${key}>${escapeXml(item)}</${key}>\n`;
                });
            } else if (typeof value === 'object' && value !== null) {
                result += `${indent}<${key}>\n${objectToXml(value, indent + '  ')}${indent}</${key}>\n`;
            } else {
                result += `${indent}<${key}>${escapeXml(value)}</${key}>\n`;
            }
        }
        return result;
    }

    xml += objectToXml(obj);
    xml += `</${rootName}>`;
    return xml;
}

function escapeXml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
