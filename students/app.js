const firebaseConfig = {
    apiKey: "AIzaSyCUqUemJeGBRtoWolTg5seTj1XcdD1Pn4c",
    authDomain: "makeflow-academy.firebaseapp.com",
    projectId: "makeflow-academy",
    storageBucket: "makeflow-academy.firebasestorage.app",
    messagingSenderId: "803745815822",
    appId: "1:803745815822:web:9dbadc0ac7a12e7cefcb5f"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const EMAIL_DOMAIN = "@makeflow.tech";
const CERT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR6UMO5mlvoBktXYol-nKPFS5pvMK9kiTo3kihLJU2kJK8BodOEDta4aKmdYp0DRinqdpZOVvBMYCLn/pub?gid=0&single=true&output=csv';

let currentLang = 'ar';
let studentData = null;
let dashboardLoaded = false;
let COURSES = [];
let VIDEOS = [];
let STUDENT_CERTS = [];
let STUDENT_FILES = [];
let currentView = 'overview';
let currentFilter = 'all';

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatFileSize(bytes) {
    const size = Number(bytes);
    if (!size || size <= 0) return null;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

// ===== Language Toggle =====
function toggleLanguage() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    const btn = document.getElementById('langBtn');
    const mobileBtn = document.getElementById('mobileLangBtn');
    if (btn) btn.textContent = currentLang === 'ar' ? (isDashboard ? 'English' : 'EN') : 'العربية';
    if (mobileBtn) mobileBtn.textContent = currentLang === 'ar' ? 'EN' : 'ع';

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

    document.querySelectorAll('[data-placeholder-ar]').forEach(input => {
        input.placeholder = input.getAttribute(`data-placeholder-${currentLang}`);
    });

    if (studentData) {
        updateStudentName();
        if (currentView === 'overview') renderOverview();
        else if (currentView === 'courses') renderCoursesGrid();
        else if (currentView === 'lectures') renderLecturesView();
        else if (currentView === 'certificates') renderCertificatesView();
        else if (currentView === 'files') renderFilesView();
        else renderCourseDetail(currentView);
    }
}

// ===== Login =====
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim().toLowerCase().replace(/\s/g, '');
    const password = document.getElementById('password').value.trim();
    const btn = document.getElementById('loginBtn');
    const errorEl = document.getElementById('errorMsg');

    errorEl.classList.add('hidden');
    btn.disabled = true;
    btn.querySelector('span').textContent = currentLang === 'ar' ? 'جاري الدخول...' : 'Signing in...';

    try {
        const email = username + EMAIL_DOMAIN;
        await auth.signInWithEmailAndPassword(email, password);
        window.location.href = 'dashboard.html';
    } catch (error) {
        let msg;
        if (error.code === 'auth/user-not-found') {
            msg = currentLang === 'ar' ? 'المستخدم غير موجود' : 'User not found';
        } else if (error.code === 'auth/wrong-password') {
            msg = currentLang === 'ar' ? 'كلمة المرور غير صحيحة' : 'Wrong password';
        } else if (error.code === 'auth/invalid-credential') {
            msg = currentLang === 'ar' ? 'بيانات الدخول غير صحيحة (تحقق من اليوزر والباسورد)' : 'Invalid credentials';
        } else if (error.code === 'auth/invalid-email') {
            msg = currentLang === 'ar' ? 'اسم المستخدم غير صالح' : 'Invalid username';
        } else if (error.code === 'auth/too-many-requests') {
            msg = currentLang === 'ar' ? 'محاولات كثيرة. حاول لاحقاً' : 'Too many attempts. Try later';
        } else {
            msg = error.code + ': ' + error.message;
        }
        errorEl.textContent = msg;
        errorEl.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        btn.querySelector('span').textContent = currentLang === 'ar' ? 'تسجيل الدخول' : 'Sign In';
    }
}

// ===== Toggle Password Visibility =====
function togglePassword() {
    const input = document.getElementById('password');
    const icon = document.getElementById('eyeIcon');
    if (input.type === 'password') {
        input.type = 'text';
        icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
    } else {
        input.type = 'password';
        icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
    }
}

// ===== Logout =====
function handleLogout() {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    });
}

// ===== Auth State Observer =====
const isLoginPage = window.location.pathname.includes('login');
const isDashboard = window.location.pathname.includes('dashboard');

auth.onAuthStateChanged(user => {
    if (isLoginPage && user) {
        window.location.href = 'dashboard.html';
        return;
    }
    if (isDashboard && user && !dashboardLoaded) {
        dashboardLoaded = true;
        loadStudentData(user);
    }
});

if (isDashboard) {
    setTimeout(() => {
        if (!dashboardLoaded && !auth.currentUser) {
            window.location.href = 'login.html';
        }
    }, 3000);
}

// ===== Load Student Data =====
async function loadStudentData(user) {
    const username = user.email.replace(EMAIL_DOMAIN, '').trim().toLowerCase();
    studentData = { username, name_ar: username, name_en: username, allowed_courses: "all", certificates: [] };

    showDashboard();

    let loadError = null;

    try {
        const doc = await db.collection('students').doc(username).get();
        if (doc.exists) {
            studentData = { username, certificates: [], ...doc.data() };
            studentData.username = username;
            if (!studentData.allowed_courses) studentData.allowed_courses = "all";
            if (!Array.isArray(studentData.certificates)) studentData.certificates = [];
            updateStudentName();
        }
    } catch (e) {
        console.error('Student load error:', e);
    }

    try {
        const snap = await db.collection('courses').orderBy('order').get();
        COURSES = [];
        snap.forEach(doc => COURSES.push({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error('Courses load error:', e);
        loadError = e.message || e;
    }

    try {
        const snap = await db.collection('videos').orderBy('order').get();
        VIDEOS = [];
        snap.forEach(doc => VIDEOS.push({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error('Videos load error:', e);
        loadError = e.message || e;
    }

    if (loadError && COURSES.length === 0) {
        const container = document.getElementById('mainContent');
        if (container) container.innerHTML = `<div style="text-align:center; padding:40px; color:#dc2626; background:#fee2e2; border-radius:12px;">
            <p style="font-size:16px; font-weight:700; margin-bottom:8px;">خطأ في تحميل البيانات</p>
            <p style="font-size:13px;">${loadError}</p>
        </div>`;
        return;
    }

    await loadStudentCertificates();
    await loadSharedFiles();
    updatePortalStats();
    renderOverview();
}

// ===== Show Dashboard =====
function showDashboard() {
    const loading = document.getElementById('authLoading');
    const dashboard = document.getElementById('dashboard');
    updateStudentName();
    if (loading) loading.classList.add('hidden');
    if (dashboard) dashboard.classList.remove('hidden');
}

// ===== Update Student Name =====
function updateStudentName() {
    const userBadge = document.getElementById('userBadge');
    const sidebarUserName = document.getElementById('sidebarUserName');
    const studentAvatar = document.getElementById('studentAvatar');
    const welcomeTitle = document.getElementById('welcomeTitle');
    const name = currentLang === 'ar' ? studentData.name_ar : studentData.name_en;
    if (userBadge) userBadge.textContent = name;
    if (sidebarUserName) sidebarUserName.textContent = name;
    if (studentAvatar) {
        const initials = String(name || 'MF').trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('');
        studentAvatar.textContent = initials.toUpperCase() || 'MF';
    }
    if (welcomeTitle) {
        welcomeTitle.textContent = currentLang === 'ar' ? `مرحباً ${name} 👋` : `Welcome ${name} 👋`;
    }
}

function updatePortalStats() {
    const allowed = getAllowedCourses();
    const allowedIds = allowed.map(course => course.id);
    const lecturesCount = VIDEOS.filter(video => allowedIds.includes(video.course_id)).length;
    const coursesEl = document.getElementById('portalCoursesCount');
    const lecturesEl = document.getElementById('portalLecturesCount');
    const certificatesEl = document.getElementById('portalCertificatesCount');
    const filesEl = document.getElementById('portalFilesCount');
    if (coursesEl) coursesEl.textContent = allowed.length;
    if (lecturesEl) lecturesEl.textContent = lecturesCount;
    if (certificatesEl) certificatesEl.textContent = STUDENT_CERTS.length;
    if (filesEl) filesEl.textContent = STUDENT_FILES.length;
}

// ===== Get Allowed Courses =====
function getStudentUsername() {
    const user = auth.currentUser;
    if (user && user.email) {
        return user.email.replace(EMAIL_DOMAIN, '').trim().toLowerCase();
    }
    return String(studentData?.username || '').trim().toLowerCase();
}

function mergeCertificateLists(...lists) {
    const map = new Map();
    lists.flat().forEach(cert => {
        if (!cert) return;
        if (!cert.certificate_url && !cert.code) return;
        const key = cert.id || `${cert.certificate_url || ''}-${cert.code || ''}-${cert.course_id || ''}`;
        map.set(key, cert);
    });
    return Array.from(map.values());
}

function normalizeStudentData(username) {
    if (!studentData) studentData = {};
    studentData.username = String(username || getStudentUsername()).trim().toLowerCase();
    if (!Array.isArray(studentData.certificates)) studentData.certificates = [];
}

function getAllowedCourses() {
    if (studentData.allowed_courses === "all") return COURSES;
    if (Array.isArray(studentData.allowed_courses)) {
        return COURSES.filter(c => studentData.allowed_courses.includes(c.id));
    }
    return COURSES;
}

function renderOverview() {
    currentView = 'overview';
    const container = document.getElementById('mainContent');
    if (!container) return;

    const allowed = getAllowedCourses();
    const allowedIds = allowed.map(course => course.id);
    const lectureCount = VIDEOS.filter(video => allowedIds.includes(video.course_id)).length;

    container.innerHTML = `
        <div class="view-heading">
            <div>
                <h2>${currentLang === 'ar' ? 'ابدأ من هنا' : 'Start here'}</h2>
                <p>${currentLang === 'ar' ? 'وصول سريع إلى كل محتوى حسابك' : 'Quick access to everything in your account'}</p>
            </div>
        </div>
        <div class="overview-actions">
            <button class="overview-action" onclick="switchTab('courses')">
                <span class="action-icon"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></span>
                <span><strong>${currentLang === 'ar' ? 'تصفح دوراتي' : 'Browse my courses'}</strong><span>${allowed.length} ${currentLang === 'ar' ? 'دورة متاحة' : 'available courses'}</span></span>
            </button>
            <button class="overview-action" onclick="switchTab('lectures')">
                <span class="action-icon"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="5 3 19 12 5 21 5 3"/></svg></span>
                <span><strong>${currentLang === 'ar' ? 'مشاهدة المحاضرات' : 'Watch lectures'}</strong><span>${lectureCount} ${currentLang === 'ar' ? 'محاضرة في حسابك' : 'lectures in your account'}</span></span>
            </button>
            <button class="overview-action" onclick="switchTab('certificates')">
                <span class="action-icon"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="6"/><path d="M8.2 13.9 7 23l5-3 5 3-1.2-9.1"/></svg></span>
                <span><strong>${currentLang === 'ar' ? 'عرض شهاداتي' : 'View certificates'}</strong><span>${STUDENT_CERTS.length} ${currentLang === 'ar' ? 'شهادة مرفوعة' : 'uploaded certificates'}</span></span>
            </button>
            <button class="overview-action" onclick="switchTab('files')">
                <span class="action-icon"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span>
                <span><strong>${currentLang === 'ar' ? 'ملفاتي المشتركة' : 'My shared files'}</strong><span>${STUDENT_FILES.length} ${currentLang === 'ar' ? 'ملف تم إرساله إليك' : 'files shared with you'}</span></span>
            </button>
        </div>`;
}

// ===== Render Courses Grid =====
function renderCoursesGrid() {
    currentView = 'courses';
    const container = document.getElementById('mainContent');
    if (!container) return;

    const allowed = getAllowedCourses();

    if (allowed.length === 0 && COURSES.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:60px 20px; color:#64748b; font-size:16px;">
            ${currentLang === 'ar' ? 'لا توجد دورات متاحة حالياً' : 'No courses available yet'}
            <br><small style="font-size:13px; color:#94a3b8;">courses: ${COURSES.length} | videos: ${VIDEOS.length} | allowed: ${JSON.stringify(studentData.allowed_courses)}</small>
        </div>`;
        return;
    }

    if (allowed.length === 0 && COURSES.length > 0) {
        container.innerHTML = `<div style="text-align:center; padding:60px 20px; color:#64748b; font-size:16px;">
            ${currentLang === 'ar' ? 'لا توجد دورات مسموحة لك حالياً' : 'No courses assigned to you yet'}
        </div>`;
        return;
    }

    const heading = `<div class="view-heading"><div><h2>${currentLang === 'ar' ? 'دوراتي' : 'My Courses'}</h2><p>${currentLang === 'ar' ? 'اختر دورة للوصول إلى محاضراتها وملفاتها' : 'Choose a course to access its lectures and files'}</p></div></div>`;
    container.innerHTML = heading + `<div class="courses-grid">${allowed.map(course => {
        const name = currentLang === 'ar' ? course.name_ar : (course.name_en || course.name_ar);
        const desc = currentLang === 'ar' ? (course.description_ar || '') : (course.description_en || course.description_ar || '');
        const videoCount = VIDEOS.filter(v => v.course_id === course.id).length;
        const fileCount = (course.files && course.files.length) || 0;

        return `
        <div class="course-card" onclick="openCourse('${course.id}')">
            <div class="course-card-cover">
                ${course.cover_image ? `<img src="${course.cover_image}" alt="">` : ''}
                <div class="course-card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                </div>
            </div>
            <div class="course-card-body">
                <div class="course-card-title">${name}</div>
                ${desc ? `<div class="course-card-desc">${desc}</div>` : ''}
                <div class="course-card-meta">
                    <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg> ${videoCount} ${currentLang === 'ar' ? 'محاضرة' : 'lectures'}</span>
                    ${fileCount > 0 ? `<span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> ${fileCount} ${currentLang === 'ar' ? 'ملف' : 'files'}</span>` : ''}
                </div>
            </div>
        </div>`;
    }).join('')}</div>`;
}

// ===== Open Course Detail =====
function openCourse(courseId) {
    currentView = courseId;
    renderCourseDetail(courseId);
}

function renderCourseDetail(courseId) {
    const container = document.getElementById('mainContent');
    const course = COURSES.find(c => c.id === courseId);
    if (!course || !container) return;

    const subtitle = document.getElementById('welcomeSubtitle');
    if (subtitle) subtitle.textContent = '';

    const name = currentLang === 'ar' ? course.name_ar : (course.name_en || course.name_ar);
    const desc = currentLang === 'ar' ? (course.description_ar || '') : (course.description_en || course.description_ar || '');
    const courseVideos = VIDEOS.filter(v => v.course_id === courseId);
    const files = course.files || [];

    let html = `<div class="course-detail">`;

    html += `<button class="course-back-btn" onclick="switchTab('courses')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        ${currentLang === 'ar' ? 'العودة للدورات' : 'Back to Courses'}
    </button>`;

    html += `<div class="course-detail-header">
        <h2 class="course-detail-title">${name}</h2>
        ${desc ? `<p class="course-detail-desc">${desc}</p>` : ''}
    </div>`;

    if (files.length > 0) {
        html += `<div class="course-detail-section">
            <h3>${currentLang === 'ar' ? 'الملفات المرفقة' : 'Attached Files'}</h3>
            <div class="files-list">${files.map(f => `
                <a href="${f.url}" target="_blank" class="file-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    ${f.name}
                </a>
            `).join('')}</div>
        </div>`;
    }

    if (courseVideos.length > 0) {
        html += `<div class="course-detail-section">
            <h3>${currentLang === 'ar' ? 'المحاضرات' : 'Lectures'}</h3>
            <div class="videos-grid">${courseVideos.map((video, i) => `
                <div class="video-card" onclick="openVideo('${video.id}')">
                    <div class="video-thumb">
                        ${video.thumbnail ? `<img class="video-thumb-img" src="${video.thumbnail}" alt="">` : ''}
                        <div class="video-play-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        </div>
                    </div>
                    <div class="video-info">
                        <div class="video-title">${currentLang === 'ar' ? video.title_ar : (video.title_en || video.title_ar)}</div>
                        <div class="video-meta"><span>${currentLang === 'ar' ? 'محاضرة ' + (i + 1) : 'Lecture ' + (i + 1)}</span></div>
                    </div>
                </div>
            `).join('')}</div>
        </div>`;
    } else {
        html += `<div style="text-align:center; padding:40px; color:#64748b;">
            ${currentLang === 'ar' ? 'لا توجد محاضرات لهذه الدورة بعد' : 'No lectures for this course yet'}
        </div>`;
    }

    html += `</div>`;
    container.innerHTML = html;
}

// ===== Video Player =====
function openVideo(videoId) {
    const video = VIDEOS.find(v => v.id === videoId);
    if (!video) return;

    if (studentData.allowed_courses !== "all" && video.course_id) {
        if (!studentData.allowed_courses.includes(video.course_id)) return;
    }

    const modal = document.getElementById('videoModal');
    const title = document.getElementById('modalTitle');
    const wrapper = document.getElementById('videoWrapper');

    title.textContent = currentLang === 'ar' ? video.title_ar : (video.title_en || video.title_ar);
    wrapper.innerHTML = `<iframe src="${video.embed_url}" allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;fullscreen" allowfullscreen="true" loading="lazy"></iframe>`;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeVideo() {
    const modal = document.getElementById('videoModal');
    const wrapper = document.getElementById('videoWrapper');
    wrapper.innerHTML = '';
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeVideo();
});

// ===== Navigation Tabs =====
async function switchTab(tab) {
    currentView = tab;
    const subtitle = document.getElementById('welcomeSubtitle');

    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    const activeTab = document.querySelector(`.nav-tab[data-tab="${tab}"]`);
    if (activeTab) activeTab.classList.add('active');

    if (tab === 'overview') {
        if (subtitle) subtitle.textContent = currentLang === 'ar' ? 'تابع دوراتك ومحاضراتك وشهاداتك من مكان واحد' : 'Access your courses, lectures and certificates in one place';
        renderOverview();
    } else if (tab === 'courses') {
        if (subtitle) subtitle.textContent = currentLang === 'ar' ? 'إليك دوراتك المتاحة' : 'Here are your available courses';
        renderCoursesGrid();
    } else if (tab === 'lectures') {
        if (subtitle) subtitle.textContent = currentLang === 'ar' ? 'جميع المحاضرات' : 'All Lectures';
        renderLecturesView();
    } else if (tab === 'certificates') {
        if (subtitle) subtitle.textContent = currentLang === 'ar' ? 'شهاداتك المعتمدة' : 'Your Certificates';
        await loadStudentCertificates();
        updatePortalStats();
        renderCertificatesView();
    } else if (tab === 'files') {
        if (subtitle) subtitle.textContent = currentLang === 'ar' ? 'الملفات المشتركة معك' : 'Files shared with you';
        await loadSharedFiles();
        updatePortalStats();
        renderFilesView();
    }
}

// ===== Lectures View with Filtering =====
function renderLecturesView() {
    currentView = 'lectures';
    const container = document.getElementById('mainContent');
    if (!container) return;

    const allowed = getAllowedCourses();
    const allowedIds = allowed.map(c => c.id);
    const allVideos = VIDEOS.filter(v => allowedIds.includes(v.course_id));

    let filteredVideos = allVideos;
    if (currentFilter !== 'all') {
        filteredVideos = allVideos.filter(v => v.course_id === currentFilter);
    }

    let html = `<div class="lectures-view">
        <div class="view-heading"><div><h2>${currentLang === 'ar' ? 'المحاضرات' : 'Lectures'}</h2><p>${currentLang === 'ar' ? 'استخدم الفلاتر للوصول إلى محاضرات الدورة المطلوبة' : 'Use filters to find lectures by course'}</p></div></div>`;

    html += `<div class="filter-bar">`;
    html += `<button class="filter-btn ${currentFilter === 'all' ? 'active' : ''}" onclick="setFilter('all')">
        ${currentLang === 'ar' ? 'الكل' : 'All'} <span class="filter-count">${allVideos.length}</span>
    </button>`;

    allowed.forEach(course => {
        const count = allVideos.filter(v => v.course_id === course.id).length;
        if (count === 0) return;
        const name = currentLang === 'ar' ? course.name_ar : (course.name_en || course.name_ar);
        html += `<button class="filter-btn ${currentFilter === course.id ? 'active' : ''}" onclick="setFilter('${course.id}')">
            ${name} <span class="filter-count">${count}</span>
        </button>`;
    });
    html += `</div>`;

    if (filteredVideos.length === 0) {
        html += `<div style="text-align:center; padding:60px 20px; color:#64748b; font-size:16px;">
            ${currentLang === 'ar' ? 'لا توجد محاضرات' : 'No lectures found'}
        </div>`;
    } else {
        html += `<div class="videos-grid">`;
        filteredVideos.forEach((video, i) => {
            const course = COURSES.find(c => c.id === video.course_id);
            const courseName = course ? (currentLang === 'ar' ? course.name_ar : (course.name_en || course.name_ar)) : '';
            html += `
            <div class="video-card" onclick="openVideo('${video.id}')">
                <div class="video-thumb">
                    ${video.thumbnail ? `<img class="video-thumb-img" src="${video.thumbnail}" alt="">` : ''}
                    <div class="video-play-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                </div>
                <div class="video-info">
                    <div class="video-title">${currentLang === 'ar' ? video.title_ar : (video.title_en || video.title_ar)}</div>
                    <div class="video-meta">
                        <span class="video-course-tag">${courseName}</span>
                    </div>
                </div>
            </div>`;
        });
        html += `</div>`;
    }

    html += `</div>`;
    container.innerHTML = html;
}

function setFilter(filter) {
    currentFilter = filter;
    renderLecturesView();
}

// ===== Certificates =====
async function loadStudentCertificates() {
    const username = getStudentUsername();
    normalizeStudentData(username);
    let certificates = [];

    if (Array.isArray(studentData.certificates)) {
        certificates = studentData.certificates.map(cert => ({ source: 'profile', ...cert }));
    }

    try {
        const studentDoc = await db.collection('students').doc(username).get();
        if (studentDoc.exists) {
            const profileCerts = studentDoc.data().certificates;
            if (Array.isArray(profileCerts)) {
                studentData.certificates = profileCerts;
                profileCerts.forEach(cert => certificates.push({ source: 'profile', ...cert }));
            }
        }
    } catch (e) {
        console.error('Failed to refresh student profile certificates:', e);
    }

    try {
        const snapshot = await db.collection('student_certificates').where('username', '==', username).get();
        snapshot.forEach(doc => certificates.push({
            id: doc.id,
            source: 'uploaded',
            ...doc.data()
        }));
    } catch (e) {
        console.error('Failed to load uploaded certificates:', e);
    }

    certificates = mergeCertificateLists(certificates);

    try {
        const response = await fetch(CERT_SHEET_URL);
        if (!response.ok) {
            STUDENT_CERTS = certificates;
            return;
        }
        const csvText = await response.text();
        const allCerts = parseCertCSV(csvText);

        const studentName = studentData.name_ar || '';
        const studentNameEn = studentData.name_en || '';

        const sheetCertificates = allCerts.filter(cert => {
            const certNameAr = (cert.student_name_ar || '').trim();
            const certNameEn = (cert.student_name_en || '').trim();
            return (studentName && certNameAr === studentName) ||
                   (studentNameEn && certNameEn.toLowerCase() === studentNameEn.toLowerCase());
        });
        STUDENT_CERTS = mergeCertificateLists(certificates, sheetCertificates);
    } catch (e) {
        console.error('Failed to load certificates:', e);
        STUDENT_CERTS = certificates;
    }
}

function parseCertCSV(csv) {
    csv = csv.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const records = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < csv.length; i++) {
        const char = csv[i];
        if (char === '"') {
            if (inQuotes && csv[i + 1] === '"') { current += '"'; i++; }
            else inQuotes = !inQuotes;
        } else if (char === '\n' && !inQuotes) {
            records.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    if (current.trim()) records.push(current);
    if (records.length < 2) return [];

    const headers = splitCertRow(records[0]).map(h => h.trim());
    const results = [];

    for (let i = 1; i < records.length; i++) {
        const values = splitCertRow(records[i]);
        if (values.length < 2) continue;
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] ? values[index].trim() : '';
        });
        if (obj.code && obj.code.length > 0) {
            obj.code = obj.code.replace(/[\n\r\s]+/g, '').trim();
            obj.duration_hours = parseInt(obj.duration_hours) || 0;
            results.push(obj);
        }
    }
    return results;
}

function splitCertRow(row) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
            if (inQuotes && row[i + 1] === '"') { current += '"'; i++; }
            else inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current); current = '';
        } else { current += char; }
    }
    result.push(current);
    return result;
}

function renderCertificatesView() {
    currentView = 'certificates';
    const container = document.getElementById('mainContent');
    if (!container) return;

    let html = `<div class="certificates-view">
        <div class="view-heading"><div><h2>${currentLang === 'ar' ? 'شهاداتي' : 'My Certificates'}</h2><p>${currentLang === 'ar' ? 'جميع الشهادات المعتمدة والمرفوعة إلى حسابك' : 'All verified certificates uploaded to your account'}</p></div></div>`;

    if (STUDENT_CERTS.length === 0) {
        html += `<div class="certs-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5">
                <path d="M12 15l-2 5 2-1 2 1-2-5z"/>
                <circle cx="12" cy="9" r="6"/>
            </svg>
            <p>${currentLang === 'ar' ? 'لا توجد شهادات حالياً' : 'No certificates yet'}</p>
            <small>${currentLang === 'ar' ? 'ستظهر شهاداتك هنا بعد إتمام الدورات' : 'Your certificates will appear here after completing courses'}</small>
        </div>`;
    } else {
        html += `<div class="certs-grid">`;
        STUDENT_CERTS.forEach(cert => {
            const courseName = currentLang === 'ar' ? cert.course_name_ar : (cert.course_name_en || cert.course_name_ar);
            const studentName = currentLang === 'ar' ? cert.student_name_ar : (cert.student_name_en || cert.student_name_ar);
            html += `
            <div class="cert-card">
                <div class="cert-card-header">
                    <div class="cert-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M12 15l-2 5 2-1 2 1-2-5z"/>
                            <circle cx="12" cy="9" r="6"/>
                        </svg>
                    </div>
                    <div class="cert-badge-active">${currentLang === 'ar' ? 'سارية' : 'Active'}</div>
                </div>
                <div class="cert-card-body">
                    <h4 class="cert-course-name">${courseName}</h4>
                    <p class="cert-student-name">${studentName}</p>
                    <div class="cert-details">
                        <div class="cert-detail-item">
                            <span class="cert-detail-label">${currentLang === 'ar' ? 'رقم الشهادة' : 'Code'}</span>
                            <span class="cert-detail-value">${cert.code || '—'}</span>
                        </div>
                        <div class="cert-detail-item">
                            <span class="cert-detail-label">${currentLang === 'ar' ? 'تاريخ الإصدار' : 'Issue Date'}</span>
                            <span class="cert-detail-value">${cert.issue_date || '—'}</span>
                        </div>
                        ${cert.duration_hours ? `<div class="cert-detail-item">
                            <span class="cert-detail-label">${currentLang === 'ar' ? 'المدة' : 'Duration'}</span>
                            <span class="cert-detail-value">${cert.duration_hours} ${currentLang === 'ar' ? 'ساعة' : 'hrs'}</span>
                        </div>` : ''}
                    </div>
                </div>
                <div class="cert-card-footer">
                    <a href="${cert.certificate_url || `../verify/?code=${cert.code}`}" target="_blank" class="cert-verify-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        ${cert.certificate_url
                            ? (currentLang === 'ar' ? 'عرض الشهادة' : 'View Certificate')
                            : (currentLang === 'ar' ? 'تحقق من الشهادة' : 'Verify Certificate')}
                    </a>
                </div>
            </div>`;
        });
        html += `</div>`;
    }

    html += `</div>`;
    container.innerHTML = html;
}

// ===== Shared Files (ملفاتي) =====
function isSharedFileForStudent(file, username, allowedIds) {
    if (!file) return false;
    if (file.target_mode === 'all' || !file.target_mode) return true;
    if (file.target_mode === 'course') return allowedIds.includes(file.target_course_id);
    if (file.target_mode === 'students') return Array.isArray(file.target_students) && file.target_students.includes(username);
    return false;
}

async function loadSharedFiles() {
    const username = getStudentUsername();
    try {
        const snap = await db.collection('shared_files').orderBy('created_at', 'desc').get();
        const allowedIds = getAllowedCourses().map(course => course.id);
        STUDENT_FILES = snap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(file => file.file_url && isSharedFileForStudent(file, username, allowedIds));
    } catch (error) {
        console.error('loadSharedFiles:', error);
        STUDENT_FILES = [];
    }
}

function renderFilesView() {
    currentView = 'files';
    const container = document.getElementById('mainContent');
    if (!container) return;

    let html = `<div class="files-view">
        <div class="view-heading"><div><h2>${currentLang === 'ar' ? 'ملفاتي' : 'My Files'}</h2><p>${currentLang === 'ar' ? 'كل الملفات والمرفقات التي تم إرسالها إليك من الإدارة' : 'All files and attachments shared with you by the academy'}</p></div></div>`;

    if (STUDENT_FILES.length === 0) {
        html += `<div class="files-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <p>${currentLang === 'ar' ? 'لا توجد ملفات حالياً' : 'No files yet'}</p>
            <small>${currentLang === 'ar' ? 'ستظهر هنا الملفات التي ترسلها لك الإدارة' : 'Files shared by the academy will appear here'}</small>
        </div>`;
    } else {
        html += `<div class="files-grid">`;
        STUDENT_FILES.forEach(file => {
            const course = COURSES.find(c => c.id === file.course_id);
            const courseName = course ? (currentLang === 'ar' ? course.name_ar : (course.name_en || course.name_ar)) : (file.course_name || '');
            const sizeText = formatFileSize(file.size);
            const createdAt = file.created_at && file.created_at.toDate ? file.created_at.toDate() : null;
            const dateText = createdAt ? createdAt.toLocaleDateString(currentLang === 'ar' ? 'ar' : 'en-GB') : '';
            html += `
            <div class="file-card">
                <div class="file-card-top">
                    <div class="file-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <h4 class="file-card-title">${escapeHtml(file.title || 'ملف')}</h4>
                </div>
                ${file.description ? `<p class="file-card-desc">${escapeHtml(file.description)}</p>` : ''}
                <div class="file-card-meta">
                    ${courseName
                        ? `<span class="file-meta-badge">${escapeHtml(courseName)}</span>`
                        : `<span class="file-meta-badge">${currentLang === 'ar' ? 'عام' : 'General'}</span>`}
                    ${sizeText ? `<span class="file-meta-badge">${sizeText}</span>` : ''}
                    ${dateText ? `<span class="file-meta-badge">${dateText}</span>` : ''}
                </div>
                <div class="file-card-footer">
                    <a class="file-open-link" href="${escapeHtml(file.file_url)}" target="_blank" rel="noopener">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        ${currentLang === 'ar' ? 'فتح الملف' : 'Open File'}
                    </a>
                </div>
            </div>`;
        });
        html += `</div>`;
    }

    html += `</div>`;
    container.innerHTML = html;
}
