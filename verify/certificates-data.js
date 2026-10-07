// ═══════════════════════════════════════════════════════════════
// رابط Google Sheet المنشور (CSV format)
// ═══════════════════════════════════════════════════════════════
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR6UMO5mlvoBktXYol-nKPFS5pvMK9kiTo3kihLJU2kJK8BodOEDta4aKmdYp0DRinqdpZOVvBMYCLn/pub?gid=0&single=true&output=csv';
// ═══════════════════════════════════════════════════════════════

let CERTIFICATES = [];
let dataLoaded = false;

async function loadCertificates() {
    try {
        const response = await fetch(SHEET_CSV_URL);
        if (!response.ok) throw new Error('HTTP error');
        const csvText = await response.text();
        CERTIFICATES = parseCSV(csvText);
        dataLoaded = true;
        console.log('Certificates loaded:', CERTIFICATES.length);
    } catch (error) {
        console.error('Failed to load certificates:', error);
        dataLoaded = false;
    }
}

function parseCSV(csv) {
    csv = csv.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    const records = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < csv.length; i++) {
        const char = csv[i];
        if (char === '"') {
            if (inQuotes && csv[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === '\n' && !inQuotes) {
            records.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    if (current.trim()) {
        records.push(current);
    }

    if (records.length < 2) return [];

    const headers = splitCSVRow(records[0]).map(h => h.trim());
    const results = [];

    for (let i = 1; i < records.length; i++) {
        const values = splitCSVRow(records[i]);
        if (values.length < 2) continue;

        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] ? values[index].trim() : '';
        });

        if (obj.code && obj.code.length > 0) {
            obj.code = obj.code.replace(/[\n\r\s]+/g, '').trim();
            obj.status = obj.status || 'active';
            obj.duration_hours = parseInt(obj.duration_hours) || 0;
            results.push(obj);
        }
    }
    return results;
}

function splitCSVRow(row) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
            if (inQuotes && row[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

loadCertificates();
