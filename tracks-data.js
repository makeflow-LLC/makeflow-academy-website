/* ============================================================
   MakeFlow AI Academy — Tracks Data (single source of truth)
   Used by index.html and track.html
   ============================================================ */

window.ACADEMY = {
  whatsapp: "970597034066",
  email: "contact@makeflow.tech",
  social: {
    facebook: "https://www.facebook.com/aiacademymakeflow",
    instagram: "https://www.instagram.com/aiacademymakeflow"
  }
};

window.TRACKS = [
  {
    id: "prompt-engineering",
    level: "beginner",
    hours: 10,
    weeks: 2,
    icon: "terminal",
    title: {
      ar: "هندسة الأوامر",
      en: "Prompt Engineering"
    },
    short: {
      ar: "أساس كل شيء في الذكاء الاصطناعي — انتزع أفضل نتيجة من أي نموذج، وابنِ مساعدك الشخصي الذي ينفّذ مهامك بأسلوبك أنت.",
      en: "The foundation of everything in AI — extract the best results from any model and build your personal assistant that works in your own style."
    },
    desc: {
      ar: "هذا المسار هو البوابة الأساسية لعالم الذكاء الاصطناعي. ستتعلم من الصفر كيف تفكّر النماذج وكيف تفهمك فعلياً، وتنتقل من الأوامر السريعة العشوائية إلى أنظمة أوامر متكاملة تعيد استخدامها يومياً — وتبني مساعدك الشخصي الخاص بأدوات مجانية بالكامل. لا حاجة لأي خلفية برمجية.",
      en: "This track is your gateway into the world of AI. From zero, you'll learn how models actually think and understand you, and move from random quick prompts to complete prompt systems you reuse daily — building your own personal assistant with completely free tools. No programming background needed."
    },
    audience: {
      ar: "أي شخص يريد دخول عالم الذكاء الاصطناعي — موظفين، مسوقين، أصحاب أعمال، وطلاب. لا يحتاج أي خبرة سابقة.",
      en: "Anyone who wants to enter the AI world — employees, marketers, business owners, and students. No prior experience required."
    },
    outcomes: {
      ar: [
        "تخرج قادرًا على انتزاع أفضل نتيجة من أي نموذج ذكاء اصطناعي بدل الإجابات العامة الضعيفة",
        "تبني أنظمة أوامر جاهزة تعيد استخدامها في عملك يوميًا",
        "تصنع مساعدك الشخصي الذي ينفّذ مهامك بأسلوبك أنت"
      ],
      en: [
        "Graduate able to extract the best result from any AI model instead of weak generic answers",
        "Build ready-made prompt systems you reuse in your work every day",
        "Create your personal assistant that executes your tasks in your own style"
      ]
    },
    modules: [
      {
        ar: { title: "كيف يفكّر النموذج وكيف يفهمك فعليًا", desc: "الدور، السياق، السؤال قبل الإجابة، النقد الذاتي، وعمل المسارات." },
        en: { title: "How the Model Actually Thinks and Understands You", desc: "Role, context, asking before answering, self-critique, and workflow thinking." }
      },
      {
        ar: { title: "من الأمر السريع إلى نظام الأوامر", desc: "الفرق بين الأمر السريع ونظام الأوامر المتكامل، واختيار النموذج المناسب لكل مهمة." },
        en: { title: "From Quick Prompts to Prompt Systems", desc: "The difference between a quick prompt and a complete prompt system, and choosing the right model for each task." }
      },
      {
        ar: { title: "قاعدة المعرفة والمساعد الشخصي", desc: "بناء قاعدة معرفة وتغذية النموذج بمعلوماتك الخاصة، وبناء مساعد شخصي كامل بأدوات مجانية لا تحتاج بطاقة دفع." },
        en: { title: "Knowledge Base & Personal Assistant", desc: "Build a knowledge base, feed the model your own information, and build a complete personal assistant with free tools — no payment card needed." }
      },
      {
        ar: { title: "تطبيقات عملية", desc: "التحليل، الكتابة، التلخيص، اتخاذ القرار، والمهام المتكررة." },
        en: { title: "Practical Applications", desc: "Analysis, writing, summarization, decision-making, and recurring tasks." }
      }
    ],
    tools: ["ChatGPT", "Claude", "Gemini", "NotebookLM", "Custom GPT / Gems"]
  },
  {
    id: "ai-agents-n8n",
    level: "advanced",
    hours: 20,
    weeks: 4,
    icon: "workflow",
    title: {
      ar: "وكلاء الذكاء الاصطناعي و n8n",
      en: "AI Agents & n8n"
    },
    short: {
      ar: "ابنِ وكيل ذكاء اصطناعي يعمل 24 ساعة نيابة عنك — يرد على العملاء، يبيع، يحجز، ويجمع البيانات — وتعلّم بيع هذه الأنظمة كخدمة.",
      en: "Build an AI agent that works 24/7 on your behalf — answering customers, selling, booking, collecting data — and learn to sell these systems as a service."
    },
    desc: {
      ar: "المسار الأقوى في الأكاديمية — هنا تنتقل من \"استخدام\" الذكاء الاصطناعي إلى \"توظيفه\". ستبني وكلاء ذكيين متكاملين على منصة n8n: وكيل واتساب يرد ويبيع ويحجز، بذاكرة وقواعد معرفة وأدوات تنفيذ حقيقية — وتتعلم نشره وتشغيله فعلياً، وبيع هذه الأنظمة للشركات كخدمة.",
      en: "The academy's most powerful track — here you move from \"using\" AI to \"employing\" it. You'll build complete intelligent agents on n8n: a WhatsApp agent that replies, sells, and books, with memory, knowledge bases, and real execution tools — and learn to deploy, run, and sell these systems to companies as a service."
    },
    audience: {
      ar: "أي شخص يريد دخول عالم الذكاء الاصطناعي — موظفين، مسوقين، أصحاب أعمال، وطلاب. لا يحتاج أي خبرة سابقة.",
      en: "Anyone who wants to enter the AI world — employees, marketers, business owners, and students. No prior experience required."
    },
    outcomes: {
      ar: [
        "تخرج ببناء وكيل ذكاء اصطناعي يعمل 24 ساعة نيابة عنك: يرد على العملاء، يبيع، يحجز، ويجمع البيانات",
        "تصبح قادرًا على بناء هذه الأنظمة وبيعها للشركات كخدمة، لا استخدامها فقط"
      ],
      en: [
        "Graduate having built an AI agent that works 24/7 on your behalf: answering customers, selling, booking, and collecting data",
        "Become able to build these systems and sell them to companies as a service — not just use them"
      ]
    },
    modules: [
      {
        ar: { title: "الأتمتة والوكيل الذكي", desc: "مفهوم الأتمتة والوكيل الذكي والفرق بينهما." },
        en: { title: "Automation vs. AI Agents", desc: "The concept of automation and intelligent agents, and the difference between them." }
      },
      {
        ar: { title: "إتقان منصة n8n من الصفر", desc: "العقد، المسارات، الشروط، معالجة الأخطاء، وربط الأنظمة عبر الـ API والـ Webhook." },
        en: { title: "Mastering n8n from Zero", desc: "Nodes, workflows, conditions, error handling, and connecting systems via APIs and webhooks." }
      },
      {
        ar: { title: "وكيل واتساب متكامل", desc: "بناء وكيل عبر WhatsApp Business API، بأدوات ينفّذ بها مهام حقيقية: حجز، تسجيل عميل، بحث." },
        en: { title: "Complete WhatsApp Agent", desc: "Build an agent on WhatsApp Business API with tools to execute real tasks: booking, client registration, search." }
      },
      {
        ar: { title: "الذاكرة والتسليم البشري", desc: "الذاكرة وقواعد المعرفة وتغذية الوكيل ببيانات شركتك، والتسليم للموظف البشري وإدارة المحادثات." },
        en: { title: "Memory & Human Handoff", desc: "Memory and knowledge bases, feeding the agent your company data, and handing off to human staff." }
      },
      {
        ar: { title: "النشر والتشغيل الفعلي", desc: "النشر والاستضافة والتشغيل الفعلي على أرض الواقع." },
        en: { title: "Deployment & Real Operation", desc: "Deployment, hosting, and running the system in the real world." }
      }
    ],
    tools: ["n8n", "WhatsApp Business API", "Supabase", "Google Sheets", "Airtable"]
  },
  {
    id: "ai-designer",
    level: "beginner",
    hours: 12,
    weeks: 2,
    icon: "palette",
    title: {
      ar: "مصمم الذكاء الاصطناعي",
      en: "AI Designer"
    },
    short: {
      ar: "أنتج تصاميم إعلانية احترافية يومياً دون فتح الفوتوشوب — من فكرة الإعلان حتى التصميم النهائي الجاهز للنشر خلال دقائق.",
      en: "Produce professional ad designs daily without opening Photoshop — from the ad idea to the final publish-ready design in minutes."
    },
    desc: {
      ar: "مسار عملي ١٠٠٪ يحوّلك إلى مصمم إعلانات بالذكاء الاصطناعي. ستتعلم التحكم الكامل بتوليد الصور، كتابة النص العربي داخل التصميم بشكل سليم، تصوير المنتجات والإعلانات التجارية، والحفاظ على هوية بصرية ثابتة — بجودة تنافس الاستوديوهات وبوقت لا يتجاوز دقائق.",
      en: "A 100% practical track that turns you into an AI ad designer. Learn full control over image generation, writing Arabic text correctly inside designs, product and commercial ad photography, and maintaining a consistent visual identity — studio-quality results in minutes."
    },
    audience: {
      ar: "أي شخص يريد دخول عالم الذكاء الاصطناعي — موظفين، مسوقين، أصحاب أعمال، وطلاب. لا يحتاج أي خبرة سابقة.",
      en: "Anyone who wants to enter the AI world — employees, marketers, business owners, and students. No prior experience required."
    },
    outcomes: {
      ar: [
        "تخرج قادرًا على إنتاج تصاميم إعلانية احترافية يوميًا دون أن تفتح الفوتوشوب",
        "من فكرة الإعلان حتى التصميم النهائي الجاهز للنشر",
        "بجودة تنافس الاستوديوهات وبوقت لا يتجاوز دقائق"
      ],
      en: [
        "Graduate able to produce professional ad designs daily without opening Photoshop",
        "From the ad idea to the final publish-ready design",
        "Studio-competitive quality in no more than minutes"
      ]
    },
    modules: [
      {
        ar: { title: "أوامر الصور الاحترافية", desc: "من الوصف العام إلى التحكم الكامل بالنتيجة، واختيار النموذج الصحيح لكل نوع تصميم." },
        en: { title: "Professional Image Prompts", desc: "From general descriptions to full control of results, and choosing the right model for each design type." }
      },
      {
        ar: { title: "النص العربي والإعلانات", desc: "كتابة النص العربي داخل التصميم بشكل سليم، وتصميم الإعلانات المفردة والكاروسيل." },
        en: { title: "Arabic Text & Ad Design", desc: "Writing Arabic text correctly inside designs, and designing single ads and carousels." }
      },
      {
        ar: { title: "تصوير المنتجات والهوية البصرية", desc: "تصوير المنتجات والموكاب والإعلانات التجارية، والهوية البصرية والثبات في الستايل عبر كل التصاميم." },
        en: { title: "Product Photography & Visual Identity", desc: "Product shots, mockups, commercial ads, and style consistency across all designs." }
      },
      {
        ar: { title: "التعديل وبناء المكتبة", desc: "تعديل الصور الجاهزة، إزالة وإضافة العناصر، تحسين الجودة، وبناء مكتبة تصاميم متكاملة لعلامتك أو لعملائك." },
        en: { title: "Editing & Building Your Library", desc: "Editing ready images, removing and adding elements, quality enhancement, and building a complete design library." }
      }
    ],
    tools: ["GPT Image 2", "Nano Banana Pro", "Nano Banana 2", "Imagen", "Canva"]
  },
  {
    id: "ai-director",
    level: "intermediate",
    hours: 20,
    weeks: 4,
    icon: "clapperboard",
    title: {
      ar: "مخرج الذكاء الاصطناعي",
      en: "AI Director"
    },
    short: {
      ar: "أنتج إعلاناً أو فيلماً قصيراً كاملاً: فكرة، سيناريو، مشاهد، أصوات، ومونتاج — دون كاميرا ولا ممثلين ولا استوديو.",
      en: "Produce a complete ad or short film: idea, script, scenes, sound, and editing — no camera, actors, or studio needed."
    },
    desc: {
      ar: "المسار الأشمل للإنتاج المرئي بالذكاء الاصطناعي. ستتعلم صناعة إعلان تجاري أو فيلم قصير من الصفر: الفكرة والسيناريو، الورقة المرجعية وثبات الشخصيات، أوامر الفيديو الاحترافية، الحوار العربي، استنساخ الصوت والأفتار، والمونتاج النهائي — كل ذلك داخل الدورة بمشروع حقيقي.",
      en: "The most comprehensive AI visual production track. Learn to craft a commercial or short film from zero: idea and script, reference sheets and character consistency, professional video prompts, Arabic dialogue, voice and avatar cloning, and final editing — all with a real project inside the course."
    },
    audience: {
      ar: "أي شخص يريد دخول عالم الذكاء الاصطناعي — موظفين، مسوقين، أصحاب أعمال، وطلاب. لا يحتاج أي خبرة سابقة.",
      en: "Anyone who wants to enter the AI world — employees, marketers, business owners, and students. No prior experience required."
    },
    outcomes: {
      ar: [
        "تخرج بإعلان أو فيلم قصير كامل من إنتاجك أنت: فكرة، سيناريو، مشاهد، أصوات، ومونتاج نهائي",
        "دون كاميرا ولا ممثلين ولا استوديو"
      ],
      en: [
        "Graduate with a complete ad or short film produced by you: idea, script, scenes, sound, and final editing",
        "Without a camera, actors, or a studio"
      ]
    },
    modules: [
      {
        ar: { title: "الفكرة والسيناريو", desc: "الفكرة والسيناريو وبناء القصة الإعلانية." },
        en: { title: "Idea & Script", desc: "The idea, script, and building the advertising story." }
      },
      {
        ar: { title: "الورقة المرجعية وثبات الشخصيات", desc: "الـ Reference Sheet وثبات الشخصيات والبيئة عبر كل المشاهد." },
        en: { title: "Reference Sheets & Consistency", desc: "The Reference Sheet and keeping characters and environments consistent across all scenes." }
      },
      {
        ar: { title: "أوامر الفيديو الاحترافية", desc: "الحركة، الكاميرا، الإضاءة، الأداء، الانفعالات — والحوار العربي داخل الفيديو واختيار النموذج الأنسب لكل مشهد." },
        en: { title: "Professional Video Prompts", desc: "Motion, camera, lighting, performance, emotions — plus Arabic dialogue in video and choosing the best model per scene." }
      },
      {
        ar: { title: "الصوت والأفتار", desc: "توليد الأصوات والتعليق الصوتي واستنساخ الصوت، وصناعة الأفتار الشخصي وتوظيفه في الفيديوهات." },
        en: { title: "Sound & Avatars", desc: "Voice generation, voiceover, voice cloning, and creating your personal avatar for videos." }
      },
      {
        ar: { title: "المونتاج وإنتاج الإعلان", desc: "المونتاج، الإيقاع، الموسيقى، والمؤثرات — وإنتاج إعلان تجاري كامل من الصفر داخل الدورة." },
        en: { title: "Editing & Ad Production", desc: "Editing, pacing, music, and effects — producing a complete commercial from scratch inside the course." }
      }
    ],
    tools: ["Seedance 2", "Kling O3", "Gemini Omni", "Grok", "ElevenLabs", "Imagen", "CapCut"]
  },
  {
    id: "vibe-coding",
    level: "intermediate",
    hours: 15,
    weeks: 3,
    icon: "code",
    title: {
      ar: "البرمجة بالإحساس — Vibe Coding",
      en: "Vibe Coding"
    },
    short: {
      ar: "ابنِ تطبيقاً أو موقعاً حقيقياً يعمل على الإنترنت دون كتابة سطر برمجة واحد — وحوّل أي فكرة إلى منتج مستخدَم خلال أيام.",
      en: "Build a real working app or website online without writing a single line of code — turn any idea into a usable product in days."
    },
    desc: {
      ar: "ثورة حقيقية في عالم البرمجة: تبني تطبيقات ومواقع كاملة بالحوار مع الذكاء الاصطناعي. ستتعلم التفكير كصانع منتج، كتابة وثيقة يفهمها الذكاء الاصطناعي، بناء الواجهات وقواعد البيانات وحسابات المستخدمين، والنشر على دومين حقيقي — كل ذلك دون أن تكتب الكود بنفسك.",
      en: "A true revolution in programming: build complete apps and websites by talking to AI. Learn to think like a product maker, write AI-readable specs, build interfaces, databases and user accounts, and deploy to a real domain — all without writing code yourself."
    },
    audience: {
      ar: "أي شخص يريد دخول عالم الذكاء الاصطناعي — موظفين، مسوقين، أصحاب أعمال، وطلاب. لا يحتاج أي خبرة سابقة.",
      en: "Anyone who wants to enter the AI world — employees, marketers, business owners, and students. No prior experience required."
    },
    outcomes: {
      ar: [
        "تخرج بتطبيق أو موقع حقيقي يعمل على الإنترنت من بنائك أنت، دون أن تكتب سطر برمجة واحدًا",
        "تصبح قادرًا على تحويل أي فكرة في رأسك إلى منتج مستخدَم خلال أيام بدل شهور"
      ],
      en: [
        "Graduate with a real app or website running online built by you — without writing a single line of code",
        "Become able to turn any idea in your head into a usable product in days instead of months"
      ]
    },
    modules: [
      {
        ar: { title: "التفكير كصانع منتج", desc: "من الفكرة إلى المواصفات، وكتابة وثيقة المنتج (PRD) التي يفهمها الذكاء الاصطناعي." },
        en: { title: "Thinking Like a Product Maker", desc: "From idea to specs, and writing the product document (PRD) that AI understands." }
      },
      {
        ar: { title: "بناء الواجهة والتطبيق", desc: "بناء الواجهة والتصميم وتجربة المستخدم، وقواعد البيانات وتسجيل الدخول وحسابات المستخدمين." },
        en: { title: "Building the Interface & App", desc: "Building UI, design and UX, plus databases, authentication, and user accounts." }
      },
      {
        ar: { title: "الربط وإصلاح الأخطاء", desc: "ربط تطبيقك بالذكاء الاصطناعي وبالخدمات الخارجية، واكتشاف الأخطاء وإصلاحها بالحوار مع النموذج." },
        en: { title: "Integration & Debugging", desc: "Connecting your app to AI and external services, and finding and fixing bugs through dialogue with the model." }
      },
      {
        ar: { title: "النشر والتطوير", desc: "النشر والاستضافة وربط الدومين، والتطوير والصيانة وإضافة مزايا جديدة لاحقًا." },
        en: { title: "Deployment & Growth", desc: "Deployment, hosting, domain connection, plus maintenance and adding new features later." }
      }
    ],
    tools: ["Claude", "Cursor", "Lovable", "Bolt", "Supabase", "Vercel", "GitHub"]
  },
  {
    id: "teacher-ai",
    level: "beginner",
    hours: 10,
    weeks: 2,
    icon: "graduation",
    title: {
      ar: "المعلم الذكي — Teacher.ai",
      en: "Teacher.ai"
    },
    short: {
      ar: "حضّر دروسك في دقائق، أنتج مواد تبهر طلابك، اصنع نسختك الرقمية التي تشرح بصوتك وصورتك، وصحّح الاختبارات آليًا.",
      en: "Prepare lessons in minutes, produce materials that amaze your students, create your digital twin that teaches in your voice and image, and auto-grade exams."
    },
    desc: {
      ar: "مسار مخصص للمعلمين والمعلمات في كل المراحل والتخصصات. ستتعلم هندسة الأوامر التعليمية، إنتاج المواد البصرية والمرئية، استنساخ أفتارك وصوتك لتقديم دروس كاملة، بناء مساعدات رقمية لك ولطلابك، والتصحيح الآلي مع تحليل أداء كل طالب — دون أي خبرة تقنية أو حتى لابتوب.",
      en: "A track built for teachers of all levels and specialties. Learn educational prompt engineering, producing visual materials, cloning your avatar and voice to deliver full lessons, building digital assistants for you and your students, and automated grading with per-student analytics — no technical experience or even a laptop needed."
    },
    audience: {
      ar: "المعلمون والمعلمات في كل المراحل والتخصصات. لا يحتاج أي خبرة تقنية ولا حتى جهاز لابتوب.",
      en: "Teachers of all levels and specialties. No technical experience needed — not even a laptop."
    },
    outcomes: {
      ar: [
        "تخرج معلمًا من جيل جديد: تحضّر دروسك في دقائق، وتنتج مواد بصرية ومرئية تبهر طلابك",
        "تصنع نسختك الرقمية التي تشرح بصوتك وصورتك",
        "تصحّح الاختبارات وتحلّل مستوى كل طالب آليًا — ولا يعود طالبك يعرف عن الذكاء الاصطناعي أكثر منك"
      ],
      en: [
        "Graduate as a new-generation teacher: prepare lessons in minutes and produce stunning visual materials",
        "Create your digital twin that teaches in your voice and image",
        "Grade exams and analyze each student's level automatically — so your students never know more about AI than you"
      ]
    },
    modules: [
      {
        ar: { title: "هندسة الأوامر للتعليم", desc: "هندسة الأوامر المتقدمة الموجّهة لقطاع التعليم." },
        en: { title: "Prompt Engineering for Education", desc: "Advanced prompt engineering tailored for the education sector." }
      },
      {
        ar: { title: "التحضير الذكي", desc: "التلخيص، طرق الشرح حسب مستوى المجموعة، أسئلة الفهم، وبنك أسئلة الطلاب." },
        en: { title: "Smart Preparation", desc: "Summarization, explanation methods per group level, comprehension questions, and a student question bank." }
      },
      {
        ar: { title: "إنتاج المواد البصرية", desc: "بطاقات، لوحات، خرائط مفاهيم، شرائح، فيديوهات تعليمية قصيرة، وقصص تعليمية." },
        en: { title: "Producing Visual Materials", desc: "Cards, posters, concept maps, slides, short educational videos, and educational stories." }
      },
      {
        ar: { title: "الأفتار والمساعدات الرقمية", desc: "استنساخ أفتار المعلم وصوته وتقديم دروس كاملة بصورته — ومساعد ينفّذ مهامك وآخر يسلّمه لطلابك للشرح والتلخيص." },
        en: { title: "Avatars & Digital Assistants", desc: "Clone the teacher's avatar and voice to deliver full lessons — plus an assistant for your tasks and another for your students." }
      },
      {
        ar: { title: "التفاعل والتصحيح الآلي", desc: "الأنشطة والتطبيقات والألعاب التفاعلية دون برمجة، وتصحيح الاختبارات وتحليل أداء الطالب والمجموعة." },
        en: { title: "Interaction & Auto-Grading", desc: "Interactive activities, apps and games without coding, plus exam grading and student/group performance analytics." }
      }
    ],
    tools: ["Imagen", "Hussa Platform", "Voice & Avatar Cloning", "AI Assistants", "Interactive Activities Tools"]
  }
];
