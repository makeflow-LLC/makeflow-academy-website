let currentLang = 'ar';
let lastFoundCert = null;

function toggleLanguage() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    const btn = document.getElementById('langBtn');
    btn.textContent = currentLang === 'ar' ? 'EN' : 'عربي';

    if (currentLang === 'en') {
        document.documentElement.setAttribute('lang', 'en');
        document.documentElement.setAttribute('dir', 'ltr');
        document.body.classList.add('ltr');
    } else {
        document.documentElement.setAttribute('lang', 'ar');
        document.documentElement.setAttribute('dir', 'rtl');
        document.body.classList.remove('ltr');
    }

    document.querySelectorAll('[data-ar]').forEach(el => {
        el.textContent = el.getAttribute(`data-${currentLang}`);
    });

    const input = document.getElementById('certCode');
    input.placeholder = input.getAttribute(`data-placeholder-${currentLang}`);

    if (lastFoundCert) {
        showSuccess(lastFoundCert);
    }
}

async function verifyCertificate() {
    const code = document.getElementById('certCode').value.trim().toUpperCase();
    if (!code) {
        showError(
            currentLang === 'ar' ? 'يرجى إدخال رقم الشهادة' : 'Please enter a certificate code'
        );
        return;
    }

    const loading = document.getElementById('loading');
    const result = document.getElementById('result');

    result.classList.add('hidden');
    loading.classList.remove('hidden');
    lastFoundCert = null;

    if (!dataLoaded) {
        await loadCertificates();
    }

    setTimeout(() => {
        loading.classList.add('hidden');

        if (!dataLoaded) {
            showError(
                currentLang === 'ar' ? 'خطأ في الاتصال. حاول مرة أخرى' : 'Connection error. Please try again'
            );
            return;
        }

        const found = CERTIFICATES.find(cert => cert.code.toUpperCase() === code);

        if (found) {
            lastFoundCert = found;
            showSuccess(found);
        } else {
            showError(
                currentLang === 'ar' ? 'لم يتم العثور على شهادة بهذا الرقم' : 'No certificate found with this code'
            );
        }
    }, 800);
}

function showSuccess(cert) {
    const result = document.getElementById('result');
    const statusLabel = getStatusLabel(cert.status);

    result.innerHTML = `
        <div class="result-card success">
            <div class="result-status">
                <div class="status-icon">✓</div>
                <div class="status-text">
                    <h3>${currentLang === 'ar' ? 'شهادة صالحة ومعتمدة' : 'Valid & Verified Certificate'}</h3>
                    <p>${currentLang === 'ar' ? 'هذه الشهادة صادرة رسمياً من MakeFlow Ai Academy' : 'This certificate is officially issued by MakeFlow Ai Academy'}</p>
                </div>
            </div>
            <div class="result-details">
                <div class="detail-row">
                    <span class="detail-label">${currentLang === 'ar' ? 'رقم الشهادة' : 'Certificate Code'}</span>
                    <span class="detail-value">${cert.code}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">${currentLang === 'ar' ? 'اسم الطالب' : 'Student Name'}</span>
                    <span class="detail-value">${currentLang === 'ar' ? cert.student_name_ar : cert.student_name_en}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">${currentLang === 'ar' ? 'الدورة' : 'Course'}</span>
                    <span class="detail-value">${currentLang === 'ar' ? cert.course_name_ar : cert.course_name_en}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">${currentLang === 'ar' ? 'تاريخ الإصدار' : 'Issue Date'}</span>
                    <span class="detail-value">${cert.issue_date}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">${currentLang === 'ar' ? 'مدة الدورة' : 'Duration'}</span>
                    <span class="detail-value">${cert.duration_hours} ${currentLang === 'ar' ? 'ساعة' : 'hours'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">${currentLang === 'ar' ? 'المدرب' : 'Instructor'}</span>
                    <span class="detail-value">${currentLang === 'ar' ? cert.instructor_ar : cert.instructor_en}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">${currentLang === 'ar' ? 'الحالة' : 'Status'}</span>
                    <span class="detail-value"><span class="cert-badge ${statusLabel.class}">${statusLabel.text}</span></span>
                </div>
            </div>
        </div>
    `;
    result.classList.remove('hidden');
}

function showError(message) {
    const result = document.getElementById('result');
    result.innerHTML = `
        <div class="result-card error">
            <div class="result-status">
                <div class="status-icon">✗</div>
                <div class="status-text">
                    <h3>${currentLang === 'ar' ? 'لم يتم التحقق' : 'Verification Failed'}</h3>
                    <p>${message}</p>
                </div>
            </div>
        </div>
    `;
    result.classList.remove('hidden');
}

function getStatusLabel(status) {
    const labels = {
        active: { ar: 'سارية', en: 'Active', class: 'badge-active' },
        expired: { ar: 'منتهية', en: 'Expired', class: 'badge-expired' },
        revoked: { ar: 'ملغاة', en: 'Revoked', class: 'badge-revoked' }
    };
    const label = labels[status] || labels.active;
    return { text: currentLang === 'ar' ? label.ar : label.en, class: label.class };
}

document.getElementById('certCode').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        verifyCertificate();
    }
});

const urlParams = new URLSearchParams(window.location.search);
const codeParam = urlParams.get('code');
if (codeParam) {
    document.getElementById('certCode').value = codeParam;
    verifyCertificate();
}
