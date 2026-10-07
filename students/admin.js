const firebaseConfig = {
    apiKey: "AIzaSyCUqUemJeGBRtoWolTg5seTj1XcdD1Pn4c",
    authDomain: "makeflow-academy.firebaseapp.com",
    projectId: "makeflow-academy",
    storageBucket: "makeflow-academy.firebasestorage.app",
    messagingSenderId: "803745815822",
    appId: "1:803745815822:web:9dbadc0ac7a12e7cefcb5f"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();
const secondaryApp = firebase.initializeApp(firebaseConfig, "secondary");
const secondaryAuth = secondaryApp.auth();
const secondaryStorage = secondaryApp.storage();

const EMAIL_DOMAIN = "@makeflow.tech";
const ADMIN_EMAIL = "admin@makeflow.tech";

let coursesCache = [];
let videosCache = [];
let studentsCache = [];
let certificatesCache = [];
let sharedFilesCache = [];

const adminViews = {
    overview: {
        title: 'نظرة عامة',
        subtitle: 'ملخص الأكاديمية وإجراءات الوصول السريع'
    },
    courses: {
        title: 'الدورات والملفات',
        subtitle: 'إدارة الدورات والمواد المرفقة للطلاب'
    },
    lectures: {
        title: 'المحاضرات',
        subtitle: 'إضافة المحاضرات وتنظيمها حسب الدورة'
    },
    students: {
        title: 'حسابات الطلاب',
        subtitle: 'إدارة الحسابات وصلاحيات الوصول'
    },
    bulk: {
        title: 'الإضافة الجماعية',
        subtitle: 'إنشاء عدة حسابات طلاب في خطوة واحدة'
    },
    certificates: {
        title: 'أدوات الشهادات',
        subtitle: 'الوصول إلى أدوات الإصدار والتحقق'
    },
    files: {
        title: 'ملفات الطلاب',
        subtitle: 'إرفاق ملفات تظهر مباشرة في بوابة الطالب'
    }
};

function switchAdminView(view, trigger) {
    if (!adminViews[view]) return;

    document.querySelectorAll('.admin-view').forEach(section => section.classList.remove('active'));
    document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));

    const section = document.getElementById(`view-${view}`);
    const navLink = trigger || document.querySelector(`.sidebar-link[data-view="${view}"]`);
    if (section) section.classList.add('active');
    if (navLink) navLink.classList.add('active');

    document.getElementById('adminPageTitle').textContent = adminViews[view].title;
    document.getElementById('adminPageSubtitle').textContent = adminViews[view].subtitle;
    toggleSidebar(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleSidebar(forceOpen) {
    const sidebar = document.getElementById('adminSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (!sidebar || !overlay) return;

    const shouldOpen = typeof forceOpen === 'boolean'
        ? forceOpen
        : !sidebar.classList.contains('open');
    sidebar.classList.toggle('open', shouldOpen);
    overlay.classList.toggle('open', shouldOpen);
}

const todayDate = document.getElementById('todayDate');
if (todayDate) {
    todayDate.textContent = new Intl.DateTimeFormat('ar', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date());
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ===== File Rows Management =====
function addFileRow(name = '', url = '') {
    const container = document.getElementById('courseFilesContainer');
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; gap:8px; margin-bottom:8px; align-items:center;';
    row.innerHTML = `
        <input type="text" placeholder="اسم الملف" value="${name}" class="file-name-input" style="flex:1; padding:8px 12px; border:2px solid #e2e8f0; border-radius:8px; font-family:'Cairo',sans-serif; font-size:13px;">
        <input type="text" placeholder="رابط الملف" value="${url}" class="file-url-input" dir="ltr" style="flex:2; padding:8px 12px; border:2px solid #e2e8f0; border-radius:8px; font-family:'Cairo',sans-serif; font-size:13px;">
        <button type="button" onclick="this.parentElement.remove()" style="background:#fee2e2; border:none; border-radius:6px; padding:8px 10px; cursor:pointer; color:#dc2626; font-weight:700;">✕</button>
    `;
    container.appendChild(row);
}

function getFilesFromForm() {
    const names = document.querySelectorAll('.file-name-input');
    const urls = document.querySelectorAll('.file-url-input');
    const files = [];
    names.forEach((nameInput, i) => {
        const n = nameInput.value.trim();
        const u = urls[i].value.trim();
        if (n && u) files.push({ name: n, url: u });
    });
    return files;
}

// ===== Admin Auth =====
// The password is verified by Firebase Auth (never stored in this file), and
// Firestore rules (see firestore.rules) only allow ADMIN_EMAIL to write.
const mainAuth = firebase.auth();
let panelLoaded = false;

async function adminLogin() {
    const pass = document.getElementById('adminPass').value;
    const msg = document.getElementById('authMsg');
    try {
        await mainAuth.signInWithEmailAndPassword(ADMIN_EMAIL, pass);
    } catch (e) {
        msg.className = 'msg msg-error';
        msg.textContent = 'كلمة المرور خاطئة!';
    }
}

async function adminLogout() {
    await mainAuth.signOut();
    window.location.reload();
}

mainAuth.onAuthStateChanged(user => {
    if (user && user.email === ADMIN_EMAIL) {
        document.getElementById('authGate').classList.add('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
        if (!panelLoaded) {
            panelLoaded = true;
            loadAll();
        }
    } else if (user) {
        // a student session is not an admin session
        mainAuth.signOut();
    }
});

async function loadAll() {
    await loadCourses();
    await Promise.all([loadVideos(), loadCertificates(), loadSharedFiles()]);
    await loadStudents();
    await syncAllCertificatesToStudentProfiles();
}

// ===== COURSES =====
async function saveCourse() {
    const nameAr = document.getElementById('courseNameAr').value.trim();
    const nameEn = document.getElementById('courseNameEn').value.trim();
    const order = parseInt(document.getElementById('courseOrder').value) || 999;
    const descAr = document.getElementById('courseDescAr').value.trim();
    const descEn = document.getElementById('courseDescEn').value.trim();
    const cover = document.getElementById('courseCover').value.trim();
    const files = getFilesFromForm();
    const editId = document.getElementById('editCourseId').value;
    const msg = document.getElementById('courseMsg');

    if (!nameAr) {
        msg.className = 'msg msg-error';
        msg.textContent = 'اسم الدورة بالعربي مطلوب';
        return;
    }

    const data = {
        name_ar: nameAr,
        name_en: nameEn || nameAr,
        order: order,
        description_ar: descAr,
        description_en: descEn || descAr,
        cover_image: cover,
        files: files
    };

    try {
        if (editId) {
            await db.collection('courses').doc(editId).update(data);
            msg.className = 'msg msg-success';
            msg.textContent = '✓ تم تحديث الدورة';
        } else {
            await db.collection('courses').add(data);
            msg.className = 'msg msg-success';
            msg.textContent = '✓ تم إضافة الدورة';
        }
        clearCourseForm();
        loadCourses();
        loadVideos();
    } catch (e) {
        msg.className = 'msg msg-error';
        msg.textContent = 'خطأ: ' + e.message;
    }
}

function clearCourseForm() {
    document.getElementById('courseNameAr').value = '';
    document.getElementById('courseNameEn').value = '';
    document.getElementById('courseOrder').value = '';
    document.getElementById('courseDescAr').value = '';
    document.getElementById('courseDescEn').value = '';
    document.getElementById('courseCover').value = '';
    document.getElementById('courseFilesContainer').innerHTML = '';
    document.getElementById('editCourseId').value = '';
    document.getElementById('cancelCourseBtn').style.display = 'none';
}

function cancelCourseEdit() {
    clearCourseForm();
    document.getElementById('courseMsg').className = 'msg';
}

async function loadCourses() {
    const container = document.getElementById('coursesList');
    try {
        const snapshot = await db.collection('courses').orderBy('order').get();
        document.getElementById('totalCourses').textContent = snapshot.size;
        coursesCache = [];
        snapshot.forEach(doc => coursesCache.push({ id: doc.id, ...doc.data() }));

        updateCourseSelects();
        renderCoursesCheckboxes();
        renderBulkCoursesCheckboxes();

        if (snapshot.empty) {
            container.innerHTML = '<div class="empty-state">لا توجد دورات. أضف أول دورة!</div>';
            return;
        }

        let html = '<table class="data-table"><thead><tr><th>#</th><th>الدورة</th><th>إجراءات</th></tr></thead><tbody>';
        coursesCache.forEach(c => {
            html += `<tr><td>${c.order}</td><td><strong>${c.name_ar}</strong><br><small style="color:#64748b">${c.name_en}</small></td><td class="actions"><button class="btn btn-edit" onclick="editCourse('${c.id}')">تعديل</button><button class="btn btn-danger" onclick="deleteCourse('${c.id}','${c.name_ar}')">حذف</button></td></tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = `<div class="msg msg-error" style="display:block">خطأ: ${e.message}</div>`;
    }
}

async function editCourse(id) {
    const doc = await db.collection('courses').doc(id).get();
    if (!doc.exists) return;
    const data = doc.data();
    document.getElementById('courseNameAr').value = data.name_ar;
    document.getElementById('courseNameEn').value = data.name_en || '';
    document.getElementById('courseOrder').value = data.order;
    document.getElementById('courseDescAr').value = data.description_ar || '';
    document.getElementById('courseDescEn').value = data.description_en || '';
    document.getElementById('courseCover').value = data.cover_image || '';
    document.getElementById('editCourseId').value = id;
    document.getElementById('cancelCourseBtn').style.display = 'inline-block';

    const container = document.getElementById('courseFilesContainer');
    container.innerHTML = '';
    if (data.files && data.files.length > 0) {
        data.files.forEach(f => addFileRow(f.name, f.url));
    }

    document.getElementById('courseNameAr').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function deleteCourse(id, name) {
    if (!confirm(`حذف دورة "${name}"؟\nسيتم إزالة ارتباطها بالمحاضرات.`)) return;
    try {
        await db.collection('courses').doc(id).delete();
        loadCourses();
    } catch (e) { alert('خطأ: ' + e.message); }
}

function updateCourseSelects() {
    const select = document.getElementById('videoCourse');
    const videoFilter = document.getElementById('videoCourseFilter');
    const studentFilter = document.getElementById('studentCourseFilter');
    const certificateSelect = document.getElementById('certificateCourse');
    const shareCourse = document.getElementById('shareFileCourse');
    const shareTargetCourse = document.getElementById('shareTargetCourse');
    const current = select.value;
    const currentVideoFilter = videoFilter.value;
    const currentStudentFilter = studentFilter.value;
    select.innerHTML = '<option value="">-- اختر الدورة --</option>';
    videoFilter.innerHTML = '<option value="all">كل الدورات</option>';
    studentFilter.innerHTML = '<option value="all">كل الطلاب</option>';
    certificateSelect.innerHTML = '<option value="">-- اختر الدورة --</option>';
    if (shareCourse) shareCourse.innerHTML = '<option value="">-- بدون ارتباط بدورة --</option>';
    if (shareTargetCourse) shareTargetCourse.innerHTML = '';
    coursesCache.forEach(c => {
        select.innerHTML += `<option value="${c.id}">${c.name_ar}</option>`;
        videoFilter.innerHTML += `<option value="${c.id}">${c.name_ar}</option>`;
        studentFilter.innerHTML += `<option value="${c.id}">${c.name_ar}</option>`;
        certificateSelect.innerHTML += `<option value="${c.id}">${c.name_ar}</option>`;
        if (shareCourse) shareCourse.innerHTML += `<option value="${c.id}">${c.name_ar}</option>`;
        if (shareTargetCourse) shareTargetCourse.innerHTML += `<option value="${c.id}">${c.name_ar}</option>`;
    });
    if (current) select.value = current;
    if (currentVideoFilter) videoFilter.value = currentVideoFilter;
    if (currentStudentFilter) studentFilter.value = currentStudentFilter;
}

function renderCoursesCheckboxes() {
    const container = document.getElementById('coursesCheckboxes');
    container.innerHTML = '';
    coursesCache.forEach(c => {
        container.innerHTML += `<label><input type="checkbox" value="${c.id}" class="course-cb">${c.name_ar}</label>`;
    });
}

function toggleAllCourses() {
    const checked = document.getElementById('allowAll').checked;
    document.getElementById('coursesCheckboxes').classList.toggle('hidden', checked);
}

// ===== VIDEOS =====
function extractEmbedUrl(input) {
    input = input.trim();
    let srcMatch = input.match(/src="([^"]+)"/);
    if (srcMatch) return srcMatch[1];

    let match = input.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;

    match = input.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
    if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;

    return input;
}

async function saveVideo() {
    const courseId = document.getElementById('videoCourse').value;
    const titleAr = document.getElementById('videoTitleAr').value.trim();
    const titleEn = document.getElementById('videoTitleEn').value.trim();
    const urlInput = document.getElementById('videoUrl').value.trim();
    const thumbnail = document.getElementById('videoThumb').value.trim();
    const order = parseInt(document.getElementById('videoOrder').value) || 999;
    const editId = document.getElementById('editVideoId').value;
    const msg = document.getElementById('videoMsg');

    if (!titleAr || !urlInput) {
        msg.className = 'msg msg-error';
        msg.textContent = 'العنوان بالعربي ورابط الفيديو مطلوبين';
        return;
    }
    if (!courseId) {
        msg.className = 'msg msg-error';
        msg.textContent = 'اختر الدورة التي تنتمي لها المحاضرة';
        return;
    }

    const embedUrl = extractEmbedUrl(urlInput);
    const videoData = { title_ar: titleAr, title_en: titleEn || titleAr, embed_url: embedUrl, thumbnail: thumbnail || '', order: order, course_id: courseId };

    try {
        if (editId) {
            await db.collection('videos').doc(editId).update(videoData);
            msg.className = 'msg msg-success';
            msg.textContent = '✓ تم تحديث المحاضرة';
        } else {
            await db.collection('videos').add(videoData);
            msg.className = 'msg msg-success';
            msg.textContent = '✓ تم إضافة المحاضرة';
        }
        clearVideoForm();
        loadVideos();
    } catch (e) {
        msg.className = 'msg msg-error';
        msg.textContent = 'خطأ: ' + e.message;
    }
}

function clearVideoForm() {
    document.getElementById('videoCourse').value = '';
    document.getElementById('videoTitleAr').value = '';
    document.getElementById('videoTitleEn').value = '';
    document.getElementById('videoUrl').value = '';
    document.getElementById('videoThumb').value = '';
    document.getElementById('videoOrder').value = '';
    document.getElementById('editVideoId').value = '';
    document.getElementById('cancelVideoBtn').style.display = 'none';
}

function cancelVideoEdit() {
    clearVideoForm();
    document.getElementById('videoMsg').className = 'msg';
}

async function loadVideos() {
    const container = document.getElementById('videosList');
    try {
        const snapshot = await db.collection('videos').orderBy('order').get();
        document.getElementById('totalVideos').textContent = snapshot.size;
        videosCache = [];
        snapshot.forEach(doc => videosCache.push({ id: doc.id, ...doc.data() }));

        if (snapshot.empty) {
            container.innerHTML = '<div class="empty-state">لا توجد محاضرات. أضف أول محاضرة!</div>';
            return;
        }

        renderVideos();
    } catch (e) {
        container.innerHTML = `<div class="msg msg-error" style="display:block">خطأ: ${e.message}</div>`;
    }
}

function renderVideos() {
    const container = document.getElementById('videosList');
    const filter = document.getElementById('videoCourseFilter').value;
    const videos = filter === 'all'
        ? videosCache
        : videosCache.filter(video => video.course_id === filter);

    if (videos.length === 0) {
        container.innerHTML = '<div class="empty-state">لا توجد محاضرات ضمن هذه الدورة</div>';
        return;
    }

    let html = '<table class="data-table"><thead><tr><th>#</th><th>المحاضرة</th><th>الدورة</th><th>إجراءات</th></tr></thead><tbody>';
    videos.forEach(video => {
        const course = coursesCache.find(c => c.id === video.course_id);
        const courseName = course ? course.name_ar : '<span style="color:#dc2626">غير محدد</span>';
        html += `<tr><td>${video.order}</td><td><strong>${video.title_ar}</strong></td><td>${courseName}</td><td class="actions"><button class="btn btn-edit" onclick="editVideo('${video.id}')">تعديل</button><button class="btn btn-danger" onclick="deleteVideo('${video.id}','${video.title_ar}')">حذف</button></td></tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

async function editVideo(id) {
    const doc = await db.collection('videos').doc(id).get();
    if (!doc.exists) return;
    const data = doc.data();
    document.getElementById('videoCourse').value = data.course_id || '';
    document.getElementById('videoTitleAr').value = data.title_ar;
    document.getElementById('videoTitleEn').value = data.title_en || '';
    document.getElementById('videoUrl').value = data.embed_url || '';
    document.getElementById('videoThumb').value = data.thumbnail || '';
    document.getElementById('videoOrder').value = data.order;
    document.getElementById('editVideoId').value = id;
    document.getElementById('cancelVideoBtn').style.display = 'inline-block';
    document.getElementById('videoTitleAr').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function deleteVideo(id, title) {
    if (!confirm(`حذف محاضرة "${title}"؟`)) return;
    try {
        await db.collection('videos').doc(id).delete();
        loadVideos();
    } catch (e) { alert('خطأ: ' + e.message); }
}

// ===== STUDENTS =====
function openStudentModal(isEdit = false) {
    document.getElementById('studentModal').classList.remove('hidden');
    document.getElementById('studentModalTitle').textContent = isEdit ? 'تعديل طالب' : 'إضافة طالب';
    document.getElementById('saveMsg').className = 'msg';
    if (!isEdit) {
        document.getElementById('inputUsername').value = '';
        document.getElementById('inputPassword').value = '';
        document.getElementById('inputNameAr').value = '';
        document.getElementById('inputNameEn').value = '';
        document.getElementById('allowAll').checked = true;
        toggleAllCourses();
    }
}

function closeStudentModal() {
    document.getElementById('studentModal').classList.add('hidden');
}

async function saveStudent() {
    const username = document.getElementById('inputUsername').value.trim().toLowerCase().replace(/\s/g, '');
    const password = document.getElementById('inputPassword').value.trim();
    const nameAr = document.getElementById('inputNameAr').value.trim();
    const nameEn = document.getElementById('inputNameEn').value.trim();
    const allowAll = document.getElementById('allowAll').checked;
    const msg = document.getElementById('saveMsg');
    const isEdit = document.getElementById('studentModalTitle').textContent.includes('تعديل');

    if (!username || !nameAr) {
        msg.className = 'msg msg-error';
        msg.textContent = 'اسم المستخدم والاسم بالعربي مطلوبين';
        return;
    }

    let allowedCourses = "all";
    if (!allowAll) {
        const checked = document.querySelectorAll('#coursesCheckboxes .course-cb:checked');
        allowedCourses = [...new Set(Array.from(checked).map(cb => cb.value))];
        if (allowedCourses.length === 0) {
            msg.className = 'msg msg-error';
            msg.textContent = 'اختر دورة واحدة على الأقل';
            return;
        }
    }

    const email = username + EMAIL_DOMAIN;

    try {
        if (password) {
            if (password.length < 6) {
                msg.className = 'msg msg-error';
                msg.textContent = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
                return;
            }

            msg.className = 'msg msg-success';
            msg.textContent = 'جاري الحفظ...';

            // Check if account exists with old password stored in Firestore
            const existingDoc = await db.collection('students').doc(username).get();
            const oldPassword = existingDoc.exists ? existingDoc.data()._password : null;

            let accountReady = false;

            // Try creating new account
            try {
                await secondaryAuth.createUserWithEmailAndPassword(email, password);
                await secondaryAuth.signOut();
                accountReady = true;
            } catch (createErr) {
                if (createErr.code === 'auth/email-already-in-use') {
                    // Account exists — try to sign in with new password first
                    let signedIn = false;
                    try {
                        await secondaryAuth.signInWithEmailAndPassword(email, password);
                        signedIn = true;
                    } catch (e1) {
                        // Try with stored old password
                        if (oldPassword) {
                            try {
                                await secondaryAuth.signInWithEmailAndPassword(email, oldPassword);
                                signedIn = true;
                            } catch (e2) {}
                        }
                    }

                    if (signedIn) {
                        const user = secondaryAuth.currentUser;
                        if (user) {
                            await user.updatePassword(password);
                            await secondaryAuth.signOut();
                            accountReady = true;
                        }
                    } else {
                        // Last resort: delete and recreate
                        msg.className = 'msg msg-error';
                        msg.textContent = `الحساب "${username}" موجود بكلمة مرور مختلفة.\n\nادخل Firebase Console → Authentication → ابحث عن ${email} → احذفه → ثم أعد الإضافة.`;
                        return;
                    }
                } else {
                    throw createErr;
                }
            }

            // Verify account works
            if (accountReady) {
                try {
                    await secondaryAuth.signInWithEmailAndPassword(email, password);
                    await secondaryAuth.signOut();
                } catch (verifyErr) {
                    msg.className = 'msg msg-error';
                    msg.textContent = `خطأ: الحساب أُنشئ لكن التحقق فشل (${verifyErr.code}).`;
                    return;
                }
            }
        }

        // Save to Firestore (include password for future delete/reset)
        const studentData = {
            name_ar: nameAr,
            name_en: nameEn || nameAr,
            allowed_courses: allowedCourses
        };
        if (password) {
            studentData._password = password;
        }
        await db.collection('students').doc(username).set(studentData, { merge: true });

        msg.className = 'msg msg-success';
        if (isEdit && !password) {
            msg.textContent = `✓ تم تعديل "${nameAr}" بنجاح`;
        } else {
            msg.textContent = `✓ تم بنجاح — اليوزر: ${username} | الباسورد: ${password} (تم التحقق)`;
        }

        loadStudents();
        setTimeout(() => closeStudentModal(), 2000);
    } catch (e) {
        msg.className = 'msg msg-error';
        msg.textContent = 'خطأ: ' + e.code + ' — ' + e.message;
    }
}

async function loadStudents() {
    const container = document.getElementById('studentsList');
    try {
        const snapshot = await db.collection('students').get();
        document.getElementById('totalStudents').textContent = snapshot.size;
        studentsCache = [];
        snapshot.forEach(doc => studentsCache.push({ username: doc.id, ...doc.data() }));

        if (snapshot.empty) {
            container.innerHTML = '<div class="empty-state">لا يوجد طلاب بعد</div>';
            return;
        }

        renderStudents();
    } catch (e) {
        container.innerHTML = `<div class="msg msg-error" style="display:block">خطأ: ${e.message}</div>`;
    }
}

function getStudentCourses(student) {
    if (student.allowed_courses === 'all' || student.allowed_videos === 'all' || !student.allowed_courses) {
        return coursesCache;
    }
    if (Array.isArray(student.allowed_courses)) {
        return coursesCache.filter(course => student.allowed_courses.includes(course.id));
    }
    return coursesCache;
}

function renderStudents() {
    renderShareStudentsCheckboxes();
    const container = document.getElementById('studentsList');
    const filter = document.getElementById('studentCourseFilter').value;
    const students = filter === 'all'
        ? studentsCache
        : studentsCache.filter(student => getStudentCourses(student).some(course => course.id === filter));

    if (students.length === 0) {
        container.innerHTML = '<div class="empty-state">لا يوجد طلاب ضمن هذه الدورة</div>';
        return;
    }

    let html = '<table class="data-table"><thead><tr><th>المستخدم</th><th>الاسم</th><th>الدورات</th><th>المحاضرات المتاحة</th><th>الشهادات</th><th>إجراءات</th></tr></thead><tbody>';
    students.forEach(student => {
        const studentCourses = getStudentCourses(student);
        const courseIds = studentCourses.map(course => course.id);
        const lectureCount = videosCache.filter(video => courseIds.includes(video.course_id)).length;
        const certificateCount = certificatesCache.filter(cert => cert.username === student.username).length;
        const access = student.allowed_courses === 'all' || student.allowed_videos === 'all' || !student.allowed_courses
            ? '<span class="badge badge-all">كل الدورات</span>'
            : `<span class="badge badge-limited">${studentCourses.map(course => course.name_ar).join('، ') || 'غير محدد'}</span>`;

        html += `<tr>
            <td><strong>${student.username}</strong></td>
            <td>${student.name_ar}</td>
            <td>${access}</td>
            <td><span class="badge badge-all">${lectureCount}</span></td>
            <td><span class="badge ${certificateCount ? 'badge-all' : 'badge-limited'}">${certificateCount}</span></td>
            <td class="actions">
                <button class="btn btn-edit" onclick="openStudentDetails('${student.username}')">البيانات</button>
                <button class="btn btn-edit" onclick="openCertificateModal('${student.username}')">رفع شهادة</button>
                <button class="btn btn-edit" onclick="editStudent('${student.username}')">تعديل</button>
                <button class="btn btn-edit" onclick="resetPassword('${student.username}')" style="background:#fef3c7;color:#d97706;">كلمة مرور</button>
                <button class="btn btn-danger" onclick="deleteStudent('${student.username}','${student.name_ar}')">حذف</button>
            </td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

async function editStudent(username) {
    const doc = await db.collection('students').doc(username).get();
    if (!doc.exists) return;
    const data = doc.data();
    document.getElementById('inputUsername').value = username;
    document.getElementById('inputNameAr').value = data.name_ar;
    document.getElementById('inputNameEn').value = data.name_en || '';
    document.getElementById('inputPassword').value = '';

    if (data.allowed_courses === "all" || (!data.allowed_courses && !data.allowed_videos)) {
        document.getElementById('allowAll').checked = true;
        toggleAllCourses();
    } else {
        document.getElementById('allowAll').checked = false;
        toggleAllCourses();
        const ids = data.allowed_courses || [];
        document.querySelectorAll('#coursesCheckboxes .course-cb').forEach(cb => {
            cb.checked = ids.includes(cb.value);
        });
    }

    openStudentModal(true);
}

function buildCertificateRecord(id, student, course, code, issueDate, certificateUrl, storagePath = '') {
    return {
        id: String(id),
        course_id: course.id || '',
        course_name_ar: course.name_ar || '',
        course_name_en: course.name_en || course.name_ar || '',
        student_name_ar: student.name_ar || '',
        student_name_en: student.name_en || student.name_ar || '',
        code: code || '',
        issue_date: issueDate || '',
        certificate_url: certificateUrl || '',
        storage_path: storagePath || ''
    };
}

async function syncCertificateToStudentProfile(username, certRecord) {
    const studentRef = db.collection('students').doc(username);
    const doc = await studentRef.get();
    const existing = doc.exists && Array.isArray(doc.data().certificates) ? doc.data().certificates : [];
    const filtered = existing.filter(item => item.id !== certRecord.id);
    await studentRef.set({ certificates: [...filtered, certRecord] }, { merge: true });
}

async function removeCertificateFromStudentProfile(username, certId) {
    const studentRef = db.collection('students').doc(username);
    const doc = await studentRef.get();
    if (!doc.exists) return;
    const existing = Array.isArray(doc.data().certificates) ? doc.data().certificates : [];
    await studentRef.set({
        certificates: existing.filter(item => item.id !== certId)
    }, { merge: true });
}

async function syncAllCertificatesToStudentProfiles() {
    for (const cert of certificatesCache) {
        const username = String(cert.username || '').trim().toLowerCase();
        if (!username || !cert.certificate_url) continue;

        const student = studentsCache.find(item => item.username === username) || {
            name_ar: cert.student_name_ar || username,
            name_en: cert.student_name_en || cert.student_name_ar || username
        };
        const course = coursesCache.find(item => item.id === cert.course_id) || {
            id: cert.course_id || '',
            name_ar: cert.course_name_ar || 'شهادة',
            name_en: cert.course_name_en || cert.course_name_ar || 'Certificate'
        };

        await syncCertificateToStudentProfile(
            username,
            buildCertificateRecord(cert.id, student, course, cert.code, cert.issue_date, cert.certificate_url, cert.storage_path || '')
        );
    }
}

async function loadCertificates() {
    try {
        const snapshot = await db.collection('student_certificates').get();
        certificatesCache = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            certificatesCache.push({
                id: doc.id,
                ...data,
                username: String(data.username || '').trim().toLowerCase()
            });
        });
    } catch (e) {
        console.error('Certificates load error:', e);
        certificatesCache = [];
    }
}

function openCertificateModal(username) {
    const student = studentsCache.find(item => item.username === username);
    if (!student) return;

    document.getElementById('certificateUsername').value = username;
    document.getElementById('certificateStudentName').textContent = `${student.name_ar} — ${username}`;
    document.getElementById('certificateCode').value = '';
    document.getElementById('certificateIssueDate').value = new Date().toISOString().slice(0, 10);
    document.getElementById('certificateFile').value = '';
    document.getElementById('certificateUrl').value = '';
    document.getElementById('certificateMsg').className = 'msg';

    const select = document.getElementById('certificateCourse');
    const studentCourses = getStudentCourses(student);
    select.innerHTML = '<option value="">-- اختر الدورة --</option>';
    studentCourses.forEach(course => {
        select.innerHTML += `<option value="${course.id}">${course.name_ar}</option>`;
    });

    document.getElementById('certificateModal').classList.remove('hidden');
}

function closeCertificateModal() {
    document.getElementById('certificateModal').classList.add('hidden');
}

async function saveStudentCertificate() {
    const username = document.getElementById('certificateUsername').value.trim().toLowerCase();
    const courseId = document.getElementById('certificateCourse').value;
    const code = document.getElementById('certificateCode').value.trim();
    const issueDate = document.getElementById('certificateIssueDate').value;
    const file = document.getElementById('certificateFile').files[0];
    const providedUrl = document.getElementById('certificateUrl').value.trim();
    const msg = document.getElementById('certificateMsg');
    const button = document.getElementById('saveCertificateBtn');
    const student = studentsCache.find(item => item.username === username);
    const course = coursesCache.find(item => item.id === courseId);

    if (!student || !course) {
        msg.className = 'msg msg-error';
        msg.textContent = 'اختر دورة صحيحة';
        return;
    }
    if (!file && !providedUrl) {
        msg.className = 'msg msg-error';
        msg.textContent = 'اختر ملف الشهادة أو أدخل رابطها';
        return;
    }
    if (providedUrl) {
        try {
            const parsedUrl = new URL(providedUrl);
            if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error();
        } catch (e) {
            msg.className = 'msg msg-error';
            msg.textContent = 'رابط الشهادة غير صالح';
            return;
        }
    }
    if (file && file.size > 10 * 1024 * 1024) {
        msg.className = 'msg msg-error';
        msg.textContent = 'حجم الملف يجب ألا يتجاوز 10 ميجابايت';
        return;
    }
    if (file && file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
        msg.className = 'msg msg-error';
        msg.textContent = 'نوع الملف غير مدعوم. استخدم PDF أو صورة';
        return;
    }

    button.disabled = true;
    msg.className = 'msg msg-success';
    msg.textContent = file ? 'جاري رفع ملف الشهادة...' : 'جاري حفظ الشهادة...';

    try {
        let certificateUrl = providedUrl;
        let storagePath = '';
        let signedInForUpload = false;

        if (file) {
            if (!student._password) {
                throw new Error('لا توجد كلمة مرور محفوظة لهذا الطالب لرفع الملف. استخدم رابط الشهادة بدلاً من ذلك.');
            }
            await secondaryAuth.signInWithEmailAndPassword(username + EMAIL_DOMAIN, student._password);
            signedInForUpload = true;
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            storagePath = `student-certificates/${username}/${Date.now()}-${safeName}`;
            const snapshot = await secondaryStorage.ref(storagePath).put(file, {
                contentType: file.type || 'application/octet-stream'
            });
            certificateUrl = await snapshot.ref.getDownloadURL();
            if (signedInForUpload) await secondaryAuth.signOut();
        }

        const docRef = await db.collection('student_certificates').add({
            username,
            student_name_ar: student.name_ar,
            student_name_en: student.name_en || student.name_ar,
            course_id: course.id,
            course_name_ar: course.name_ar,
            course_name_en: course.name_en || course.name_ar,
            code,
            issue_date: issueDate,
            certificate_url: certificateUrl,
            storage_path: storagePath,
            created_at: firebase.firestore.FieldValue.serverTimestamp()
        });

        await syncCertificateToStudentProfile(
            username,
            buildCertificateRecord(docRef.id, student, course, code, issueDate, certificateUrl, storagePath)
        );

        await loadCertificates();
        renderStudents();
        msg.className = 'msg msg-success';
        msg.textContent = '✓ تم رفع الشهادة وستظهر في لوحة الطالب';
        setTimeout(() => closeCertificateModal(), 1400);
    } catch (e) {
        if (secondaryAuth.currentUser) {
            try { await secondaryAuth.signOut(); } catch (signOutError) {}
        }
        msg.className = 'msg msg-error';
        msg.textContent = e.code === 'storage/unauthorized'
            ? 'تعذر الرفع بسبب صلاحيات Firebase Storage. يمكنك استخدام رابط الشهادة مؤقتاً أو تعديل قواعد Storage.'
            : 'خطأ: ' + e.message;
    } finally {
        button.disabled = false;
    }
}

async function openStudentDetails(username) {
    const student = studentsCache.find(item => item.username === username);
    if (!student) return;

    const studentCourses = getStudentCourses(student);
    const courseIds = studentCourses.map(course => course.id);
    const studentVideos = videosCache.filter(video => courseIds.includes(video.course_id));
    const studentCertificates = certificatesCache.filter(cert => cert.username === username);

    document.getElementById('studentDetailsTitle').textContent = student.name_ar;
    document.getElementById('studentDetailsUsername').textContent = username;
    document.getElementById('studentDetailsModal').classList.remove('hidden');

    let notes = '';
    try {
        const noteDoc = await db.collection('student_admin_notes').doc(username).get();
        if (noteDoc.exists) notes = noteDoc.data().notes || '';
    } catch (e) {
        console.error('Student notes load error:', e);
    }

    const coursesHtml = studentCourses.length
        ? studentCourses.map(course => {
            const count = videosCache.filter(video => video.course_id === course.id).length;
            return `<div class="course-access-item"><strong>${course.name_ar}</strong><span>${count} محاضرة متاحة</span></div>`;
        }).join('')
        : '<div class="empty-state">لا توجد دورات متاحة</div>';

    const certificatesHtml = studentCertificates.length
        ? studentCertificates.map(cert => `<div class="certificate-admin-item">
            <div><strong>${cert.course_name_ar || 'شهادة'}</strong><br><small>${cert.issue_date || ''}${cert.code ? ` — ${cert.code}` : ''}</small></div>
            <div class="actions"><a href="${cert.certificate_url}" target="_blank">عرض</a><button class="btn btn-danger" onclick="deleteStudentCertificate('${cert.id}')">حذف</button></div>
        </div>`).join('')
        : '<div class="empty-state">لا توجد شهادات مرفوعة</div>';

    document.getElementById('studentDetailsContent').innerHTML = `
        <div class="student-summary">
            <div class="student-summary-item"><strong>${studentCourses.length}</strong><span>دورة متاحة</span></div>
            <div class="student-summary-item"><strong>${studentVideos.length}</strong><span>محاضرة متاحة</span></div>
            <div class="student-summary-item"><strong>${studentCertificates.length}</strong><span>شهادة مرفوعة</span></div>
        </div>
        <div class="details-section"><h3>الدورات والمحاضرات المتاحة</h3><div class="course-access-list">${coursesHtml}</div></div>
        <div class="details-section"><h3>الشهادات المرفوعة</h3><div class="certificate-admin-list">${certificatesHtml}</div></div>
        <div class="details-section">
            <h3>ملاحظات إدارية</h3>
            <textarea class="admin-notes" id="studentAdminNotes" placeholder="ملاحظات خاصة بالأدمن فقط...">${escapeHtml(notes)}</textarea>
            <div class="form-actions"><button class="btn btn-primary" onclick="saveStudentNotes('${username}')">حفظ الملاحظات</button></div>
            <div class="msg" id="studentNotesMsg"></div>
        </div>`;
}

function closeStudentDetails() {
    document.getElementById('studentDetailsModal').classList.add('hidden');
}

async function saveStudentNotes(username) {
    const notes = document.getElementById('studentAdminNotes').value.trim();
    const msg = document.getElementById('studentNotesMsg');
    try {
        await db.collection('student_admin_notes').doc(username).set({
            notes,
            updated_at: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        msg.className = 'msg msg-success';
        msg.textContent = '✓ تم حفظ الملاحظات';
    } catch (e) {
        msg.className = 'msg msg-error';
        msg.textContent = 'خطأ: ' + e.message;
    }
}

async function deleteStudentCertificate(id) {
    const certificate = certificatesCache.find(item => item.id === id);
    if (!certificate || !confirm('هل تريد حذف هذه الشهادة؟')) return;

    try {
        if (certificate.storage_path) {
            try {
                const student = studentsCache.find(item => item.username === certificate.username);
                if (student && student._password) {
                    await secondaryAuth.signInWithEmailAndPassword(certificate.username + EMAIL_DOMAIN, student._password);
                    await secondaryStorage.ref(certificate.storage_path).delete();
                    await secondaryAuth.signOut();
                } else {
                    await storage.ref(certificate.storage_path).delete();
                }
            } catch (storageError) {
                console.warn('Certificate file delete error:', storageError);
                if (secondaryAuth.currentUser) {
                    try { await secondaryAuth.signOut(); } catch (signOutError) {}
                }
            }
        }
        await db.collection('student_certificates').doc(id).delete();
        await removeCertificateFromStudentProfile(String(certificate.username || '').trim().toLowerCase(), id);
        await loadCertificates();
        renderStudents();
        openStudentDetails(certificate.username);
    } catch (e) {
        alert('خطأ في حذف الشهادة: ' + e.message);
    }
}

async function deleteStudent(username, name) {
    if (!confirm(`حذف "${name}" (${username})?\n\nسيتم حذف حسابه بالكامل (البيانات + حساب الدخول).`)) return;
    try {
        const email = username + EMAIL_DOMAIN;

        // Get stored password from Firestore
        const doc = await db.collection('students').doc(username).get();
        const storedPassword = doc.exists ? doc.data()._password : null;

        // Try to delete Firebase Auth account
        let authDeleted = false;
        if (storedPassword) {
            try {
                await secondaryAuth.signInWithEmailAndPassword(email, storedPassword);
                const user = secondaryAuth.currentUser;
                if (user) {
                    await user.delete();
                    authDeleted = true;
                }
            } catch (authErr) {
                // If sign-in fails, auth account may have different password
                console.log('Could not delete auth account:', authErr.code);
            }
        }

        // Delete from Firestore
        await db.collection('students').doc(username).delete();

        if (authDeleted) {
            alert(`✓ تم حذف "${name}" بالكامل (البيانات + حساب الدخول).`);
        } else {
            alert(`✓ تم حذف بيانات "${name}".\n\n⚠️ لم نتمكن من حذف حساب الدخول تلقائياً.\nاحذفه يدوياً: Firebase Console → Authentication → ${email}`);
        }

        loadStudents();
    } catch (e) {
        alert('خطأ في الحذف: ' + e.message);
    }
}

async function resetPassword(username) {
    const newPass = prompt(`إعادة تعيين كلمة مرور "${username}"\n\nأدخل كلمة المرور الجديدة (6 أحرف على الأقل):`);
    if (!newPass) return;
    if (newPass.trim().length < 6) {
        alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        return;
    }

    const password = newPass.trim();
    const email = username + EMAIL_DOMAIN;

    try {
        // Get stored password
        const doc = await db.collection('students').doc(username).get();
        const oldPassword = doc.exists ? doc.data()._password : null;

        let success = false;

        if (oldPassword) {
            // Sign in with old password, then update
            try {
                await secondaryAuth.signInWithEmailAndPassword(email, oldPassword);
                const user = secondaryAuth.currentUser;
                if (user) {
                    await user.updatePassword(password);
                    await secondaryAuth.signOut();
                    success = true;
                }
            } catch (e) {
                // Old password didn't work, try to delete and recreate
                console.log('Old password failed, trying recreate:', e.code);
            }
        }

        if (!success) {
            // Try signing in with the new password (maybe it's already set)
            try {
                await secondaryAuth.signInWithEmailAndPassword(email, password);
                await secondaryAuth.signOut();
                success = true;
            } catch (e) {
                // Last resort: delete account and recreate
                try {
                    // Try to create (will work if account doesn't exist)
                    await secondaryAuth.createUserWithEmailAndPassword(email, password);
                    await secondaryAuth.signOut();
                    success = true;
                } catch (createErr) {
                    if (createErr.code === 'auth/email-already-in-use') {
                        alert(`⚠️ لم نتمكن من تغيير كلمة المرور تلقائياً.\n\nالحل:\n1. ادخل Firebase Console → Authentication\n2. ابحث عن: ${email}\n3. احذف الحساب\n4. ثم أعد إضافة الطالب من لوحة الأدمن.`);
                        return;
                    }
                    throw createErr;
                }
            }
        }

        if (success) {
            // Update stored password in Firestore
            await db.collection('students').doc(username).update({ _password: password });
            alert(`✓ تم تغيير كلمة مرور "${username}" بنجاح.\n\nكلمة المرور الجديدة: ${password}`);
        }
    } catch (e) {
        alert('خطأ: ' + e.message);
    }
}

// ===== BULK ADD STUDENTS =====
async function bulkAddStudents() {
    const input = document.getElementById('bulkInput').value.trim();
    const msg = document.getElementById('bulkMsg');
    const results = document.getElementById('bulkResults');
    const allowAll = document.getElementById('bulkAllowAll').checked;

    if (!input) {
        msg.className = 'msg msg-error';
        msg.textContent = 'أدخل بيانات الطلاب';
        return;
    }

    let allowedCourses = "all";
    if (!allowAll) {
        const checked = document.querySelectorAll('#bulkCoursesCheckboxes .course-cb:checked');
        allowedCourses = Array.from(checked).map(cb => cb.value);
        if (allowedCourses.length === 0) {
            msg.className = 'msg msg-error';
            msg.textContent = 'اختر دورة واحدة على الأقل';
            return;
        }
    }

    const lines = input.split('\n').filter(l => l.trim());
    let successCount = 0;
    let errors = [];
    let resultHtml = '';
    let addedStudents = [];

    msg.className = 'msg msg-success';
    msg.textContent = `جاري إضافة ${lines.length} طالب...`;

    for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].split(/[,،]/).map(p => p.trim());
        if (parts.length < 4) {
            errors.push(`سطر ${i + 1}: بيانات ناقصة (وجد ${parts.length} حقول، يجب 4). المحتوى: "${lines[i].substring(0, 50)}"`);
            continue;
        }

        const nameEn = parts[0];
        const nameAr = parts[1];
        const username = parts[2].trim().toLowerCase().replace(/\s/g, '');
        const password = parts[3];

        if (!username) {
            errors.push(`سطر ${i + 1}: رقم الجوال / اسم المستخدم غير صالح`);
            continue;
        }

        if (!password || !nameAr) {
            errors.push(`سطر ${i + 1} (${username}): كلمة المرور أو الاسم فارغ`);
            continue;
        }

        if (password.length < 6) {
            errors.push(`سطر ${i + 1} (${username}): كلمة المرور أقل من 6 أحرف`);
            continue;
        }

        try {
            const email = username + EMAIL_DOMAIN;
            try {
                await secondaryAuth.createUserWithEmailAndPassword(email, password);
                await secondaryAuth.signOut();
            } catch (authErr) {
                if (authErr.code !== 'auth/email-already-in-use') throw authErr;
            }

            await db.collection('students').doc(username).set({
                name_ar: nameAr,
                name_en: nameEn,
                allowed_courses: allowedCourses,
                _password: password
            });

            addedStudents.push({ username, password, nameAr });
            successCount++;
        } catch (e) {
            errors.push(`سطر ${i + 1} (${username}): ${e.message}`);
        }
    }

    if (successCount > 0) {
        msg.className = 'msg msg-success';
        msg.textContent = `✓ تم إضافة ${successCount} طالب بنجاح`;
        resultHtml += `<div style="background:#dcfce7; border-radius:8px; padding:12px 16px; margin-top:8px; font-size:13px; color:#16a34a;">
            <strong>تم الإضافة:</strong><br>${addedStudents.map(s => `${s.nameAr} — يوزر: <strong>${s.username}</strong> | باسورد: <strong>${s.password}</strong>`).join('<br>')}
        </div>`;
    }

    if (errors.length > 0) {
        resultHtml += `<div style="background:#fee2e2; border-radius:8px; padding:12px 16px; margin-top:8px; font-size:13px; color:#dc2626;">
            <strong>أخطاء (${errors.length}):</strong><br>${errors.join('<br>')}
        </div>`;
    }

    results.innerHTML = resultHtml;

    if (successCount > 0) {
        document.getElementById('bulkInput').value = '';
        loadStudents();
    }
}

// Render bulk courses checkboxes when courses load
function renderBulkCoursesCheckboxes() {
    const container = document.getElementById('bulkCoursesCheckboxes');
    if (!container) return;
    container.innerHTML = '';
    coursesCache.forEach(c => {
        container.innerHTML += `<label><input type="checkbox" value="${c.id}" class="course-cb">${c.name_ar}</label>`;
    });
}

// ===== SHARED FILES (إرفاق ملفات للطلاب) =====
const SHARE_MAX_SIZE = 25 * 1024 * 1024;

function updateShareTargetUI() {
    const mode = (document.querySelector('input[name="shareTarget"]:checked') || {}).value || 'all';
    document.getElementById('shareTargetCourseWrap').classList.toggle('hidden', mode !== 'course');
    document.getElementById('shareTargetStudentsWrap').classList.toggle('hidden', mode !== 'students');
}

function renderShareStudentsCheckboxes() {
    const container = document.getElementById('shareStudentsCheckboxes');
    if (!container) return;
    if (!studentsCache.length) {
        container.innerHTML = '<div class="empty-state">لا يوجد طلاب بعد</div>';
        return;
    }
    container.innerHTML = '';
    studentsCache.forEach(s => {
        const id = escapeHtml(s.username || s.id);
        container.innerHTML += `<label><input type="checkbox" value="${id}" class="share-student-cb">${escapeHtml(s.name_ar || s.username || s.id)} <small style="color:#64748b">(${id})</small></label>`;
    });
}

async function loadSharedFiles() {
    try {
        const snapshot = await db.collection('shared_files').orderBy('created_at', 'desc').get();
        sharedFilesCache = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error('loadSharedFiles:', error);
        sharedFilesCache = [];
    }
    renderSharedFilesList();
}

function getShareTargetLabel(file) {
    if (file.target_mode === 'all') return 'جميع الطلاب';
    if (file.target_mode === 'course') {
        const course = coursesCache.find(c => c.id === file.target_course_id);
        return `طلاب دورة: ${course ? course.name_ar : (file.target_course_name || 'غير معروفة')}`;
    }
    if (file.target_mode === 'students') return `طلاب محددين (${(file.target_students || []).length})`;
    return file.target_mode || '-';
}

function renderSharedFilesList() {
    const container = document.getElementById('sharedFilesList');
    if (!container) return;
    if (!sharedFilesCache.length) {
        container.innerHTML = '<div class="empty-state">لم يتم إرفاق أي ملفات بعد</div>';
        return;
    }
    let html = '<table class="data-table"><thead><tr><th>الملف</th><th>الدورة</th><th>الوجهة</th><th>النوع</th><th>التاريخ</th><th>إجراءات</th></tr></thead><tbody>';
    sharedFilesCache.forEach(f => {
        const course = coursesCache.find(c => c.id === f.course_id);
        const createdAt = f.created_at && f.created_at.toDate ? f.created_at.toDate() : null;
        const dateText = createdAt ? createdAt.toLocaleDateString('en-GB') : '-';
        html += `<tr>
            <td><a href="${escapeHtml(f.file_url || '#')}" target="_blank" rel="noopener">${escapeHtml(f.title || 'ملف')}</a>${f.description ? `<br><small style="color:#64748b">${escapeHtml(f.description)}</small>` : ''}</td>
            <td>${course ? escapeHtml(course.name_ar) : (f.course_name ? escapeHtml(f.course_name) : '<span class="badge badge-general">عام</span>')}</td>
            <td>${escapeHtml(getShareTargetLabel(f))}</td>
            <td>${f.source === 'url' ? 'رابط خارجي' : 'رفع للتخزين'}</td>
            <td>${dateText}</td>
            <td class="actions"><button class="btn btn-danger" onclick="deleteSharedFile('${f.id}','${escapeHtml(f.title || 'هذا الملف')}')">حذف</button></td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

async function saveSharedFile() {
    const title = document.getElementById('shareFileTitle').value.trim();
    const description = document.getElementById('shareFileDesc').value.trim();
    const courseId = document.getElementById('shareFileCourse').value;
    const fileInput = document.getElementById('shareFileInput');
    const urlValue = document.getElementById('shareFileUrl').value.trim();
    const msg = document.getElementById('shareFileMsg');
    const btn = document.getElementById('shareFileBtn');
    const mode = (document.querySelector('input[name="shareTarget"]:checked') || {}).value || 'all';

    if (!title) {
        msg.className = 'msg msg-error';
        msg.textContent = 'عنوان الملف مطلوب';
        return;
    }
    if (!fileInput.files.length && !urlValue) {
        msg.className = 'msg msg-error';
        msg.textContent = 'اختر ملفاً للرفع أو أدخل رابطاً جاهزاً';
        return;
    }
    if (mode === 'course' && !document.getElementById('shareTargetCourse').value) {
        msg.className = 'msg msg-error';
        msg.textContent = 'اختر الدورة / الورشة المستهدفة';
        return;
    }
    let targetStudents = [];
    if (mode === 'students') {
        targetStudents = [...document.querySelectorAll('.share-student-cb:checked')].map(cb => cb.value);
        if (!targetStudents.length) {
            msg.className = 'msg msg-error';
            msg.textContent = 'اختر طالباً واحداً على الأقل';
            return;
        }
    }

    const file = fileInput.files.length ? fileInput.files[0] : null;
    if (file && file.size > SHARE_MAX_SIZE) {
        msg.className = 'msg msg-error';
        msg.textContent = 'حجم الملف أكبر من 25 ميجابايت';
        return;
    }

    btn.disabled = true;
    msg.className = 'msg';
    msg.textContent = 'جاري رفع الملف...';

    try {
        let fileUrl = urlValue;
        let source = 'url';
        let storagePath = null;
        let mime = null;
        let size = null;
        if (file) {
            storagePath = `student_files/${Date.now()}_${file.name.replace(/[^\w.\-ء-ي]/g, '_')}`;
            const snapshot = await storage.ref().child(storagePath).put(file, { contentType: file.type || 'application/octet-stream' });
            fileUrl = await snapshot.ref.getDownloadURL();
            source = 'storage';
            mime = file.type || null;
            size = file.size;
        }

        const course = coursesCache.find(c => c.id === courseId);
        const targetCourse = coursesCache.find(c => c.id === document.getElementById('shareTargetCourse').value);
        await db.collection('shared_files').add({
            title,
            description,
            course_id: courseId || null,
            course_name: course ? course.name_ar : null,
            file_url: fileUrl,
            source,
            storage_path: storagePath,
            mime,
            size,
            target_mode: mode,
            target_course_id: mode === 'course' ? targetCourse.id : null,
            target_course_name: mode === 'course' ? (targetCourse ? targetCourse.name_ar : null) : null,
            target_students: mode === 'students' ? targetStudents : null,
            created_at: firebase.firestore.FieldValue.serverTimestamp()
        });

        msg.className = 'msg msg-success';
        msg.textContent = 'تم إرفاق الملف بنجاح. سيظهر الآن في بوابة الطلاب المحددين.';
        document.getElementById('shareFileTitle').value = '';
        document.getElementById('shareFileDesc').value = '';
        document.getElementById('shareFileCourse').value = '';
        document.getElementById('shareFileUrl').value = '';
        fileInput.value = '';
        document.querySelectorAll('.share-student-cb:checked').forEach(cb => cb.checked = false);
        await loadSharedFiles();
    } catch (error) {
        console.error('saveSharedFile:', error);
        msg.className = 'msg msg-error';
        msg.textContent = 'فشل رفع الملف: ' + (error.message || 'خطأ غير معروف');
    } finally {
        btn.disabled = false;
    }
}

async function deleteSharedFile(id, title) {
    if (!confirm(`حذف "${title}"؟ سيختفي الملف من بوابة الطلاب فوراً.`)) return;
    try {
        const doc = await db.collection('shared_files').doc(id).get();
        const data = doc.exists ? doc.data() : null;
        if (data && data.storage_path) {
            try { await storage.ref().child(data.storage_path).delete(); } catch (e) { console.warn('storage delete:', e); }
        }
        await db.collection('shared_files').doc(id).delete();
        await loadSharedFiles();
    } catch (error) {
        alert('فشل حذف الملف: ' + (error.message || 'خطأ غير معروف'));
    }
}
