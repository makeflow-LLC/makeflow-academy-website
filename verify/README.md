# صفحة التحقق من الشهادات - MakeFlow Ai Academy

## الإعداد (مرة واحدة فقط)

### 1. إنشاء Google Sheet
1. اذهب إلى https://sheets.google.com
2. أنشئ جدول جديد باسم: `MakeFlow Certificates`
3. اكتب هذه العناوين في الصف الأول:

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| code | student_name_ar | student_name_en | course_name_ar | course_name_en | issue_date | duration_hours | instructor_ar | instructor_en |

### 2. نشر الجدول
1. اذهب إلى: ملف (File) → مشاركة (Share) → نشر على الويب (Publish to web)
2. اختر: الورقة الأولى (Sheet1)
3. اختر الصيغة: CSV
4. اضغط: نشر (Publish)
5. انسخ الرابط

### 3. لصق الرابط في الكود
1. افتح ملف `certificates-data.js`
2. استبدل `PASTE_YOUR_GOOGLE_SHEET_CSV_LINK_HERE` بالرابط الذي نسخته

---

## إضافة شهادة جديدة

فقط افتح Google Sheet وأضف صف جديد:

| code | student_name_ar | student_name_en | course_name_ar | course_name_en | issue_date | duration_hours | instructor_ar | instructor_en |
|------|----------------|-----------------|----------------|----------------|------------|----------------|---------------|---------------|
| MFA-PEWA-2026-0010 | محمد علي | Mohammed Ali | هندسة الأوامر | Prompt Engineering | 2026-05-17 | 40 | م. جهاد | Eng. Jihad |

الصفحة ستقرأ البيانات الجديدة تلقائياً!

---

## رفع الملفات على هوستنجر

ارفع مجلد `verify` إلى `public_html`:

```
public_html/
└── verify/
    ├── index.html
    ├── style.css
    ├── script.js
    └── certificates-data.js
```

الصفحة ستعمل على: `https://yourdomain.com/verify/`

## رابط QR Code
```
https://yourdomain.com/verify/?code=MFA-PEWA-2026-0009
```
