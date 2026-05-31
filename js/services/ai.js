(function () {
  const USAGE_STORAGE_KEY = "trend2short-ai-usage";
  const DEFAULT_PROVIDER = "gemini";
  const DAILY_LIMIT = 10;
  const STATUS_API_PATH = "/api/status";
  const DEFAULT_SETTINGS = {
    API_PROVIDER: DEFAULT_PROVIDER,
    USE_LOCAL_API: false
  };

  const debugState = {
    nextErrorCode: null,
    nextInvalidResponse: false,
    nextDelayMs: 650
  };

  let configLoadPromise = null;
  let statusLoadPromise = null;
  let cachedStatus = {
    provider: DEFAULT_PROVIDER,
    providerLabel: "Gemini",
    mode: "Demo",
    apiStatus: "Checking"
  };

  const BANNED_INSTRUCTION_PATTERNS = [
    /\bStart with\b/i,
    /\bBegin by\b/i,
    /\bThen explain\b/i,
    /(^|\n)\s*Commence par\b/i,
    /(^|\n)\s*Puis\b/i,
    /(^|\n)\s*Termine\b/i,
    /(^|\n)\s*ابدأ\b/i,
    /(^|\n)\s*ثم\b/i
  ];

  function getTopicWords(topic) {
    return topic
      .normalize("NFKD")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter(Boolean);
  }

  function toCamelTag(words, maxWords = 3) {
    return words
      .slice(0, maxWords)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
  }

  function getPlatformTag(platform) {
    const map = {
      TikTok: "#TikTok",
      "YouTube Shorts": "#YouTubeShorts",
      "Instagram Reels": "#InstagramReels"
    };

    return map[platform] || "#ShortVideo";
  }

  function getStyleTag(style) {
    const map = {
      Educational: "#EducationalContent",
      Viral: "#TrendingNow",
      Storytelling: "#Storytelling",
      Professional: "#ProfessionalInsights"
    };

    return map[style] || "#CreatorContent";
  }

  function getTopicPreset(topic) {
    const value = topic.toLowerCase();

    if (/(teacher|teachers|enseignant|enseignants|professeur|professeurs|معلم|معلمين|أستاذ|أساتذة|مدرس)/i.test(value)) {
      return "teachers";
    }

    if (/(starlink|morocco|maroc|المغرب)/i.test(value)) {
      return "starlink-morocco";
    }

    if (/(student|students|étudiant|étudiants|etudiant|etudiants|طالب|طلاب|save money)/i.test(value)) {
      return "student-money";
    }

    return "general";
  }

  function buildFallbackHashtags(topic, platform, style, language, presetTags = []) {
    const topicWords = getTopicWords(topic);
    const tags = [...presetTags];

    if (language === "Arabic") {
      if (topicWords.length > 0) {
        tags.push(`#${topicWords[0]}`);
      }
      if (topicWords.length > 1) {
        tags.push(`#${topicWords[1]}`);
      }
      tags.push(
        style === "Educational" ? "#محتوى_تعليمي" : null,
        style === "Professional" ? "#تحليل_مهني" : null,
        style === "Storytelling" ? "#قصة_قصيرة" : null,
        style === "Viral" ? "#ترند_اليوم" : null,
        platform === "TikTok" ? "#تيك_توك" : null,
        platform === "YouTube Shorts" ? "#يوتيوب_شورتس" : null,
        platform === "Instagram Reels" ? "#ريلز" : null,
        "#صناع_المحتوى"
      );
    } else {
      if (topicWords.length > 0) {
        tags.push(`#${toCamelTag(topicWords, Math.min(topicWords.length, 3))}`);
      }
      if (topicWords.length > 1) {
        tags.push(`#${toCamelTag(topicWords.slice(0, 2), 2)}`);
      }
      tags.push(getPlatformTag(platform), getStyleTag(style), "#ContentCreation");
    }

    return [...new Set(tags.filter(Boolean))].slice(0, 8).join(" ");
  }

  function countWords(text) {
    return String(text || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
  }

  function hasInstructionalLanguage(text) {
    return BANNED_INSTRUCTION_PATTERNS.some((pattern) => pattern.test(String(text || "")));
  }

  function normalizeHashtagString(value, fallback) {
    const matches = String(value || "").match(/#[^\s#]+/g) || [];
    const unique = [...new Set(matches)];
    const valid = unique.filter((tag) => tag.length > 2 && !/^#(?:ai|for|and)$/i.test(tag));

    if (valid.length < 5 || valid.length > 8) {
      return fallback;
    }

    return valid.slice(0, 8).join(" ");
  }

  function isWeakField(field, value) {
    const text = String(value || "").trim();
    if (!text) {
      return true;
    }

    if (hasInstructionalLanguage(text)) {
      return true;
    }

    if (field === "hook") {
      return countWords(text) < 6;
    }

    if (field === "videoIdea") {
      return countWords(text) < 10;
    }

    if (field === "shortScript") {
      const words = countWords(text);
      return words < 60 || words > 130;
    }

    if (field === "caption") {
      return countWords(text) < 10;
    }

    if (field === "cta") {
      return countWords(text) < 4;
    }

    if (field === "audience") {
      return countWords(text) < 2;
    }

    return false;
  }

  function buildGeneralContent(input) {
    const topic = input.topic;
    const topicWords = getTopicWords(topic);
    const primaryKeyword = topicWords[0] || topic;
    const secondaryKeyword = topicWords[1] || "the trend";

    if (input.language === "French") {
      const hookByStyle = {
        Educational: `${topic} devient plus utile quand on le relie à des exemples concrets et à un vrai résultat.`,
        Viral: `${topic} fait parler aujourd’hui, mais l’angle vraiment utile est souvent beaucoup plus précis.`,
        Storytelling: `${topic} paraît parfois abstrait, jusqu’au moment où on voit son impact dans la vie réelle.`,
        Professional: `${topic} mérite de l’attention parce qu’il influence déjà le coût, la vitesse et les décisions.`
      };

      return {
        title: topic,
        meta: buildMeta(input.platform, input.language, input.style),
        hook: hookByStyle[input.style] || hookByStyle.Educational,
        videoIdea: `Une courte vidéo ${input.style.toLowerCase()} qui explique ${topic} avec un angle clair, des exemples concrets et une conclusion facile à retenir.`,
        shortScript: `Aujourd’hui, on parle de ${topic} sans rester dans le vague. Le plus intéressant, ce n’est pas seulement la tendance elle-même, mais ce qu’elle change concrètement pour les personnes concernées. Il faut regarder l’impact réel sur le temps, le coût ou la façon de travailler, puis donner un exemple simple qui rend le sujet immédiatement compréhensible. Avec cet angle, ${primaryKeyword} devient plus clair, plus crédible et surtout plus utile pour une vidéo courte que l’on peut regarder, comprendre et partager rapidement.`,
        caption: `Si ${topic} revient souvent dans votre fil, cet angle permet d’en parler de façon claire sans tomber dans une explication trop générale.`,
        hashtags: buildFallbackHashtags(topic, input.platform, input.style, input.language, ["#Tendance", "#IdeeVideo"]),
        cta: input.platform === "TikTok"
          ? "Sauvegarde cette vidéo pour réutiliser cet angle plus tard."
          : input.platform === "Instagram Reels"
            ? "Enregistre ce Reel si tu veux plus d’idées prêtes à publier."
            : "Abonne-toi pour d’autres idées de Shorts prêtes à tourner.",
        audience: `Créateurs et professionnels qui suivent ${topic}`
      };
    }

    if (input.language === "Arabic") {
      const hookByStyle = {
        Educational: `فهم ${topic} يصبح أسهل عندما نربطه بأمثلة عملية ونتائج واضحة.`,
        Viral: `${topic} يتكرر كثيرًا الآن، لكن الزاوية المفيدة فيه أدق بكثير من مجرد تكرار اسم الترند.`,
        Storytelling: `${topic} قد يبدو موضوعًا بعيدًا، إلى أن ترى أثره الحقيقي في الحياة اليومية.`,
        Professional: `${topic} يستحق المتابعة لأنه يؤثر فعليًا في التكلفة والسرعة وطريقة اتخاذ القرار.`
      };

      return {
        title: topic,
        meta: buildMeta(input.platform, input.language, input.style),
        hook: hookByStyle[input.style] || hookByStyle.Educational,
        videoIdea: `فيديو قصير يشرح ${topic} من زاوية واضحة وأمثلة قريبة من الواقع مع خلاصة سهلة التذكر.`,
        shortScript: `اليوم نتحدث عن ${topic} بطريقة عملية ومباشرة. المهم هنا ليس تكرار اسم الترند، بل فهم ما الذي يغيّره فعلًا على أرض الواقع. عندما نربط الموضوع بالتكلفة أو الوقت أو سهولة الوصول، يصبح أوضح وأقرب للمشاهد. ثم نضيف مثالًا بسيطًا يشرح الفكرة بسرعة، ونختم بالنقطة التي يجب الانتباه لها إذا استمر هذا الاتجاه في النمو. بهذه الطريقة، يتحول ${primaryKeyword} من عنوان عام إلى محتوى قصير واضح ويمكن تذكره بسهولة بعد مشاهدة الفيديو.`,
        caption: `إذا كان ${topic} يظهر كثيرًا في المحتوى هذه الأيام، فهذه زاوية أوضح وأسهل لشرحه دون كلام عام أو مكرر.`,
        hashtags: buildFallbackHashtags(topic, input.platform, input.style, input.language, ["#ترند", "#فكرة_فيديو"]),
        cta: input.platform === "TikTok"
          ? "احفظ هذا الفيديو إذا أردت العودة إلى هذه الفكرة لاحقًا."
          : input.platform === "Instagram Reels"
            ? "احفظ هذا الريل إذا كنت تريد أفكارًا أكثر جاهزة للنشر."
            : "اشترك لمزيد من أفكار Shorts القصيرة والواضحة.",
        audience: `صناع المحتوى والمهتمون بموضوع ${topic}`
      };
    }

    const hookByStyle = {
      Educational: `${topic} makes more sense when you connect it to clear examples and real outcomes.`,
      Viral: `${topic} is trending right now, but the useful angle is more specific than most people think.`,
      Storytelling: `${topic} feels abstract until you see how it changes daily life.`,
      Professional: `${topic} matters because it already affects cost, speed, and decision-making.`
    };

    return {
      title: topic,
      meta: buildMeta(input.platform, input.language, input.style),
      hook: hookByStyle[input.style] || hookByStyle.Educational,
      videoIdea: `A short ${input.style.toLowerCase()} video that explains ${topic} through a concrete angle, clear examples, and one takeaway worth remembering.`,
      shortScript: `Today, let’s talk about ${topic} without sounding vague. What matters most is not repeating the trend name, but showing what it changes in real life. That usually means looking at time, cost, access, or the way people work and make decisions. Once you add one concrete example, the topic becomes much easier to understand. That is what makes a strong short video: not hype, but a clear angle that helps the viewer see why ${secondaryKeyword} matters right now and what they should pay attention to next.`,
      caption: `If ${topic} keeps showing up in your feed, this angle makes it easier to explain without sounding generic or repetitive.`,
      hashtags: buildFallbackHashtags(topic, input.platform, input.style, input.language, ["#TrendAlert", "#VideoIdeas"]),
      cta: input.platform === "TikTok"
        ? "Save this video if you want more trend angles like this."
        : input.platform === "Instagram Reels"
          ? "Follow for more short-form content ideas you can actually post."
          : "Subscribe for more Shorts ideas built from real trends.",
      audience: `Creators and professionals following ${topic}`
    };
  }

  class Trend2ShortAIError extends Error {
    constructor(code, message) {
      super(message);
      this.name = "Trend2ShortAIError";
      this.code = code;
    }
  }

  function getTodayKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function safeJsonParse(value, fallback) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  function readUsageState() {
    const rawValue = window.localStorage.getItem(USAGE_STORAGE_KEY);
    const parsed = rawValue ? safeJsonParse(rawValue, {}) : {};
    return typeof parsed === "object" && parsed ? parsed : {};
  }

  function writeUsageState(state) {
    window.localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(state));
  }

  function getTodayUsage() {
    const state = readUsageState();
    return Number.parseInt(state[getTodayKey()] || "0", 10) || 0;
  }

  function incrementTodayUsage() {
    const state = readUsageState();
    const todayKey = getTodayKey();
    const nextValue = getTodayUsage() + 1;
    state[todayKey] = nextValue;
    writeUsageState(state);
    return nextValue;
  }

  function resetUsageState() {
    window.localStorage.removeItem(USAGE_STORAGE_KEY);
    return 0;
  }

  function wait(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  function getGlobalConfig() {
    if (window.APP_CONFIG && typeof window.APP_CONFIG === "object") {
      return window.APP_CONFIG;
    }

    return null;
  }

  function loadOptionalConfig() {
    const existingConfig = getGlobalConfig();
    if (existingConfig) {
      return Promise.resolve(existingConfig);
    }

    if (configLoadPromise) {
      return configLoadPromise;
    }

    configLoadPromise = new Promise((resolve) => {
      const existingScript = document.querySelector('script[data-app-config="true"]');

      if (existingScript) {
        resolve(getGlobalConfig() || DEFAULT_SETTINGS);
        return;
      }

      const script = document.createElement("script");
      script.src = "config.js";
      script.defer = true;
      script.dataset.appConfig = "true";
      script.onload = () => resolve(getGlobalConfig() || DEFAULT_SETTINGS);
      script.onerror = () => resolve(DEFAULT_SETTINGS);
      document.head.appendChild(script);
    });

    return configLoadPromise;
  }

  async function getSettings() {
    const loadedConfig = await loadOptionalConfig();
    return {
      API_PROVIDER: String(loadedConfig.API_PROVIDER || DEFAULT_PROVIDER).toLowerCase(),
      USE_LOCAL_API: Boolean(loadedConfig.USE_LOCAL_API)
    };
  }

  function normalizeProviderLabel(provider) {
    return String(provider || DEFAULT_PROVIDER)
      .trim()
      .replace(/^\w/, (char) => char.toUpperCase());
  }

  function buildStatusState(provider, mode, apiStatus) {
    const resolvedProvider = String(provider || DEFAULT_PROVIDER).toLowerCase();
    return {
      provider: resolvedProvider,
      providerLabel: normalizeProviderLabel(resolvedProvider),
      mode: mode || "Demo",
      apiStatus: apiStatus || "Checking"
    };
  }

  async function requestStatusFromApi(settings) {
    if (!shouldUseApiRoute(settings)) {
      return buildStatusState(settings.API_PROVIDER, "Demo", "API Unavailable");
    }

    let response;
    try {
      response = await window.fetch(STATUS_API_PATH, {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      });
    } catch (error) {
      return buildStatusState(settings.API_PROVIDER, "Demo", "Connection Error");
    }

    if (response.status === 404) {
      return buildStatusState(settings.API_PROVIDER, "Demo", "API Unavailable");
    }

    if (!response.ok) {
      return buildStatusState(settings.API_PROVIDER, "Demo", "Connection Error");
    }

    const payload = await response.json().catch(() => null);
    if (!payload || typeof payload !== "object") {
      return buildStatusState(settings.API_PROVIDER, "Demo", "Connection Error");
    }

    return buildStatusState(payload.provider || settings.API_PROVIDER, payload.mode, payload.apiStatus);
  }

  async function getStatus(options = {}) {
    const settings = await getSettings();

    if (!options.forceRefresh && cachedStatus.apiStatus !== "Checking") {
      return { ...cachedStatus };
    }

    if (!statusLoadPromise || options.forceRefresh) {
      statusLoadPromise = requestStatusFromApi(settings)
        .then((nextStatus) => {
          setStatus(nextStatus);
          return nextStatus;
        })
        .finally(() => {
          statusLoadPromise = null;
        });
    }

    await statusLoadPromise;
    return { ...cachedStatus };
  }

  function setStatus(nextStatus = {}) {
    cachedStatus = {
      ...cachedStatus,
      ...nextStatus
    };
  }

  function getCleanTopic(rawTopic) {
    return String(rawTopic || "").trim();
  }

  function buildKeyword(topic) {
    return topic
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3)
      .join("");
  }

  function buildMeta(platform, language, style) {
    return `${platform} | ${language} | ${style}`;
  }

  function createDemoContent(input) {
    const topic = getCleanTopic(input.topic);
    const platform = input.platform || "TikTok";
    const language = input.language || "English";
    const style = input.style || "Educational";
    const preset = getTopicPreset(topic);

    if (preset === "teachers") {
      if (language === "French") {
        return {
          title: topic,
          meta: buildMeta(platform, language, style),
          hook: "Trois outils d’IA peuvent aider les enseignants à préparer leurs cours en deux fois moins de temps.",
          videoIdea: "Une courte vidéo qui montre comment MagicSchool, Canva et Quizizz AI peuvent alléger la préparation des cours.",
          shortScript: "Aujourd’hui, voici trois outils d’IA que les enseignants peuvent utiliser pour gagner du temps. MagicSchool aide à structurer un plan de cours en quelques minutes. Canva peut transformer une idée en support visuel clair pour la classe. Quizizz AI permet de créer rapidement des questions et des révisions. Le but n’est pas de remplacer l’enseignant, mais de réduire les tâches répétitives pour consacrer plus de temps aux élèves et à l’accompagnement pédagogique.",
          caption: "Ces outils d’IA peuvent vraiment alléger la préparation des cours sans compliquer le travail des enseignants.",
          hashtags: "#OutilsIA #Enseignants #EdTech #PreparationDeCours #Professeurs #TikTokEducatif",
          cta: "Sauvegarde cette vidéo pour tester ces outils plus tard.",
          audience: "Enseignants et créateurs de contenu éducatif",
          platform,
          language,
          style
        };
      }

      if (language === "Arabic") {
        return {
          title: topic,
          meta: buildMeta(platform, language, style),
          hook: "ثلاث أدوات ذكاء اصطناعي يمكن أن تساعد المعلمين على تحضير الدروس في وقت أقل بكثير.",
          videoIdea: "فيديو قصير يوضح كيف يمكن للمعلمين استخدام MagicSchool وCanva وQuizizz AI لتخفيف وقت التحضير.",
          shortScript: "اليوم لدينا ثلاث أدوات ذكاء اصطناعي يمكن أن تساعد المعلمين بشكل عملي. أداة MagicSchool تساعد في بناء خطة درس أو نشاط صفّي بسرعة. Canva تجعل تحويل الفكرة إلى عرض بصري أو ورقة عمل أسهل بكثير. أما Quizizz AI فيمكنه تسريع إعداد الأسئلة والمراجعات للطلاب. الفكرة ليست استبدال المعلم، بل تقليل الوقت الضائع في المهام المتكررة حتى يبقى وقت أكبر للشرح والمتابعة ودعم الطلاب داخل الفصل.",
          caption: "إذا كان تحضير الدروس يستهلك وقتك كل أسبوع، فهذه الأدوات قد تجعل العملية أخف وأكثر سرعة.",
          hashtags: "#أدوات_الذكاء_الاصطناعي #المعلمون #تقنية_التعليم #تحضير_الدروس #أدوات_الفصل #تيك_توك",
          cta: "احفظ هذا الفيديو وجرّب أداة واحدة قبل حصتك القادمة.",
          audience: "المعلمون وصناع المحتوى التعليمي",
          platform,
          language,
          style
        };
      }

      return {
        title: topic,
        meta: buildMeta(platform, language, style),
        hook: "Three AI tools can help teachers plan lessons and classroom content in half the time.",
        videoIdea: "A short video showing how teachers can use MagicSchool, Canva, and Quizizz AI to prepare faster.",
        shortScript: "Today, here are three AI tools that can genuinely help teachers save time. MagicSchool can draft lesson outlines and classroom prompts in minutes. Canva helps turn a rough idea into clear slides or worksheets without starting from scratch. Quizizz AI can quickly build quizzes and revision questions for the class. The goal is not to replace the teacher. It is to cut repetitive prep work so more time goes into teaching, feedback, and supporting students.",
        caption: "If lesson prep is eating up your week, these tools can make the workload much lighter without overcomplicating your workflow.",
        hashtags: "#AIToolsForTeachers #EdTech #TeacherTips #LessonPlanning #ClassroomTools #TikTokEducation",
        cta: "Save this video and test one of these tools before your next class.",
        audience: "Teachers and educational content creators",
        platform,
        language,
        style
      };
    }

    if (preset === "starlink-morocco") {
      if (language === "French") {
        return {
          title: topic,
          meta: buildMeta(platform, language, style),
          hook: "Starlink pourrait améliorer l’accès à Internet au Maroc, mais le prix et le cadre réglementaire restent décisifs.",
          videoIdea: "Une courte vidéo qui explique ce que Starlink pourrait changer au Maroc en matière de couverture, de coût et d’usage.",
          shortScript: "Aujourd’hui, parler de Starlink au Maroc ne consiste pas seulement à parler de vitesse. La vraie question est de savoir qui pourrait en profiter et à quel prix. Dans les zones éloignées où la connexion reste limitée, une offre satellite peut représenter une solution concrète. Mais il faut aussi regarder le coût de l’équipement, l’abonnement mensuel et le cadre réglementaire. Si ces éléments deviennent accessibles, Starlink peut ouvrir une nouvelle option pour les foyers, les entrepreneurs et les créateurs hors des grands centres urbains.",
          caption: "Starlink peut être une vraie opportunité pour certaines zones du Maroc, mais tout dépendra du coût final et de la mise en place locale.",
          hashtags: "#Starlink #Maroc #InternetSatellite #TechMaroc #ActualiteTech #YouTubeShorts",
          cta: "Abonne-toi pour suivre les prochaines mises à jour sur ce sujet.",
          audience: "Personnes intéressées par la technologie et la connectivité au Maroc",
          platform,
          language,
          style
        };
      }

      if (language === "Arabic") {
        return {
          title: topic,
          meta: buildMeta(platform, language, style),
          hook: "ستارلينك قد تغيّر شكل الإنترنت في المناطق البعيدة بالمغرب، لكن السعر والتنظيم هما العامل الحاسم.",
          videoIdea: "فيديو قصير يشرح ما الذي قد تضيفه ستارلينك للمغرب من حيث التغطية والتكلفة وفرص الاستخدام.",
          shortScript: "اليوم، الحديث عن ستارلينك في المغرب لا يتعلق فقط بسرعة الإنترنت، بل بمن يمكنه الاستفادة منها فعلًا. الميزة الكبرى هي إمكانية تحسين الاتصال في المناطق البعيدة التي تعاني من ضعف الشبكة الأرضية. لكن في المقابل، يبقى السؤال حول تكلفة الاشتراك والمعدات، إضافة إلى الجانب التنظيمي والترخيص. إذا دخلت الخدمة بشكل واضح وبسعر معقول، فقد تصبح خيارًا مهمًا للأسر، ورواد الأعمال، وصناع المحتوى خارج المدن الكبرى.",
          caption: "ستارلينك قد تكون فرصة مهمة لتحسين الاتصال في بعض مناطق المغرب، لكن القرار الحقيقي سيعتمد على السعر والتنظيم.",
          hashtags: "#ستارلينك #المغرب #الإنترنت_الفضائي #أخبار_التقنية #يوتيوب_شورتس #اتصال_رقمي",
          cta: "احفظ هذا الفيديو إذا كنت تريد متابعة جديد ستارلينك في المغرب.",
          audience: "المهتمون بالتقنية والاتصال الرقمي في المغرب",
          platform,
          language,
          style
        };
      }

      return {
        title: topic,
        meta: buildMeta(platform, language, style),
        hook: "Starlink could expand internet access in Morocco, but pricing and regulation will decide its real impact.",
        videoIdea: "A short video explaining how Starlink could affect coverage, cost, and digital access in Morocco.",
        shortScript: "Today, the real conversation around Starlink in Morocco is not just about faster internet. It is about who could benefit and whether the service becomes affordable enough to matter. In remote areas where traditional coverage is still weak, satellite internet could be a practical option. But the important questions are still the equipment cost, monthly pricing, and local regulation. If those pieces align, Starlink could become a meaningful choice for households, entrepreneurs, and creators outside major cities.",
        caption: "Starlink could be a real connectivity upgrade for parts of Morocco, but the final impact depends on cost and rollout conditions.",
        hashtags: "#Starlink #Morocco #SatelliteInternet #TechNews #DigitalAccess #YouTubeShorts",
        cta: "Subscribe if you want more short tech explainers like this.",
        audience: "Tech audiences and digital access watchers in Morocco",
        platform,
        language,
        style
      };
    }

    if (preset === "student-money") {
      if (language === "French") {
        return {
          title: topic,
          meta: buildMeta(platform, language, style),
          hook: "Un étudiant peut économiser chaque mois en corrigeant seulement trois habitudes simples.",
          videoIdea: "Un Reel narratif qui montre comment de petits choix quotidiens peuvent aider les étudiants à garder plus d’argent.",
          shortScript: "Quand on est étudiant, l’argent ne disparaît pas toujours dans une grosse dépense. Il part souvent dans les cafés, les livraisons et les abonnements oubliés. Ce qui change vraiment la situation, c’est de suivre ses dépenses pendant une semaine, de fixer un budget repas avant le début du mois et de supprimer ce qui n’est pas essentiel. Ces gestes paraissent petits, mais ils libèrent rapidement une vraie marge. Économiser quand on est étudiant, c’est souvent repérer les petites fuites avant qu’elles ne deviennent une habitude.",
          caption: "Le budget étudiant se casse rarement sur une grosse dépense. Ce sont souvent les petites habitudes qui coûtent le plus à la fin du mois.",
          hashtags: "#BudgetEtudiant #Economiser #VieEtudiante #Argent #HabitudesFinancieres #InstagramReels",
          cta: "Enregistre ce Reel si tu veux plus d’idées simples pour mieux gérer ton budget.",
          audience: "Étudiants et créateurs de contenu lifestyle étudiant",
          platform,
          language,
          style
        };
      }

      if (language === "Arabic") {
        return {
          title: topic,
          meta: buildMeta(platform, language, style),
          hook: "الطالب يستطيع توفير مبلغ حقيقي كل شهر إذا أصلح ثلاث عادات مالية صغيرة.",
          videoIdea: "فيديو قصير بأسلوب قصصي يوضح كيف تساعد تغييرات بسيطة الطلاب على الاحتفاظ بمال أكثر.",
          shortScript: "عندما يكون الطالب تحت ضغط المصاريف، لا يضيع المال غالبًا في عملية شراء كبيرة واحدة، بل في قهوة يومية، وتوصيل متكرر، واشتراكات لا تُستخدم. الفرق يبدأ عندما تتابع مصروفك لأسبوع واحد، وتحدد ميزانية واضحة للأكل، وتلغي أي خدمة لا تحتاجها فعلًا. هذه خطوات بسيطة، لكنها تصنع فارقًا حقيقيًا مع نهاية الشهر. التوفير للطالب ليس حرمانًا دائمًا، بل وعيًا بالمصاريف الصغيرة التي تتكرر من دون أن ننتبه لها.",
          caption: "معظم الميزانيات الطلابية لا تنهار بسبب مصروف كبير واحد، بل بسبب عادات صغيرة تتكرر كل يوم.",
          hashtags: "#توفير_للطلبة #ميزانية_طالب #نصائح_مالية #حياة_الطالب #مصروف_شخصي #ريلز",
          cta: "تابعني للمزيد من أفكار المحتوى القصير المفيدة للطلاب.",
          audience: "الطلاب وصناع محتوى الحياة الجامعية",
          platform,
          language,
          style
        };
      }

      return {
        title: topic,
        meta: buildMeta(platform, language, style),
        hook: "A student can save real money every month by fixing just three spending habits.",
        videoIdea: "A story-driven Reel about how small daily choices can help students keep more money without feeling restricted.",
        shortScript: "When I was a student, the money never disappeared in one big purchase. It went on coffee, delivery, and subscriptions I barely used. What changed everything was tracking my spending for one week, setting a food budget before the month started, and cancelling anything that was not essential. None of those changes felt dramatic, but together they freed up real money. Saving as a student is usually less about earning more and more about noticing where small leaks happen every day.",
        caption: "Most student budgets do not break because of one big expense. They break because of small habits that add up quietly.",
        hashtags: "#StudentMoneyTips #BudgetingForStudents #SaveMoney #StudentLife #MoneyHabits #InstagramReels",
        cta: "Follow for more short-form content ideas you can actually use.",
        audience: "Students and student lifestyle creators",
        platform,
        language,
        style
      };
    }

    return {
      ...buildGeneralContent({ topic, platform, language, style }),
      platform,
      language,
      style
    };
  }

  function normalizeAIResponse(response, fallbackInput) {
    if (!response || typeof response !== "object") {
      return createDemoContent(fallbackInput);
    }

    const fallbackContent = createDemoContent(fallbackInput);
    const normalized = {
      title: getCleanTopic(response.title || fallbackContent.title || fallbackInput.topic),
      meta: buildMeta(fallbackInput.platform, fallbackInput.language, fallbackInput.style),
      hook: isWeakField("hook", response.hook) ? fallbackContent.hook : String(response.hook || "").trim(),
      videoIdea: isWeakField("videoIdea", response.videoIdea) ? fallbackContent.videoIdea : String(response.videoIdea || "").trim(),
      shortScript: isWeakField("shortScript", response.shortScript) ? fallbackContent.shortScript : String(response.shortScript || "").trim(),
      caption: isWeakField("caption", response.caption) ? fallbackContent.caption : String(response.caption || "").trim(),
      hashtags: normalizeHashtagString(response.hashtags, fallbackContent.hashtags),
      cta: isWeakField("cta", response.cta) ? fallbackContent.cta : String(response.cta || "").trim(),
      audience: isWeakField("audience", response.audience) ? fallbackContent.audience : String(response.audience || "").trim(),
      platform: fallbackInput.platform,
      language: fallbackInput.language,
      style: fallbackInput.style
    };

    return normalized;
  }

  function consumeDebugState() {
    const nextErrorCode = debugState.nextErrorCode;
    const nextInvalidResponse = debugState.nextInvalidResponse;
    const nextDelayMs = debugState.nextDelayMs;

    debugState.nextErrorCode = null;
    debugState.nextInvalidResponse = false;

    return {
      nextErrorCode,
      nextInvalidResponse,
      nextDelayMs
    };
  }

  function assertWithinDailyLimit() {
    if (getTodayUsage() >= DAILY_LIMIT) {
      throw new Trend2ShortAIError("RATE_LIMIT", "Daily AI limit reached.");
    }
  }

  function shouldUseApiRoute(settings) {
    const hostname = window.location.hostname;
    const isLocalStaticHost = hostname === "127.0.0.1" || hostname === "localhost";
    return !isLocalStaticHost || settings.USE_LOCAL_API;
  }

  async function callApiRoute(input, settings) {
    if (!shouldUseApiRoute(settings)) {
      throw new Trend2ShortAIError("API_UNAVAILABLE", "Local API route disabled.");
    }

    let response;
    try {
      response = await window.fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          trend: input.topic,
          platform: input.platform,
          language: input.language,
          style: input.style
        })
      });
    } catch (error) {
      throw new Trend2ShortAIError("NETWORK_ERROR", "Network request failed.");
    }

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Trend2ShortAIError("API_UNAVAILABLE", "API route unavailable.");
      }

      const message = payload?.message || `Request failed with status ${response.status}.`;
      const codeMap = {
        INVALID_INPUT: "API_ERROR",
        MISSING_API_KEY: "API_ERROR",
        GEMINI_API_ERROR: "API_ERROR",
        INVALID_GEMINI_JSON_RESPONSE: "INVALID_RESPONSE",
        METHOD_NOT_ALLOWED: "API_ERROR"
      };
      throw new Trend2ShortAIError(codeMap[payload?.code] || "API_ERROR", message);
    }

    return payload;
  }

  async function generate(input) {
    const topic = getCleanTopic(input.topic);

    if (!topic) {
      throw new Trend2ShortAIError("EMPTY_INPUT", "Empty input.");
    }

    assertWithinDailyLimit();

    const normalizedInput = {
      topic,
      platform: input.platform || "TikTok",
      language: input.language || "English",
      style: input.style || "Educational"
    };

    const { nextErrorCode, nextInvalidResponse, nextDelayMs } = consumeDebugState();

    if (nextDelayMs > 0) {
      await wait(nextDelayMs);
    }

    if (nextErrorCode === "NETWORK_ERROR") {
      throw new Trend2ShortAIError("NETWORK_ERROR", "Network request failed.");
    }

    if (nextErrorCode === "API_ERROR") {
      throw new Trend2ShortAIError("API_ERROR", "The AI provider returned an API error.");
    }

      const settings = await getSettings();
      let content = null;
      let mode = "Demo";
      let message = "Running in Demo Mode";
      let apiStatus = "Missing Key";

      try {
        const apiPayload = await callApiRoute(normalizedInput, settings);

        if (apiPayload?.demoMode) {
          content = createDemoContent(normalizedInput);
        mode = "Demo";
        message = apiPayload.message || "Running in Demo Mode";
        apiStatus = apiPayload.apiStatus || "Missing Key";
      } else {
        content = normalizeAIResponse(apiPayload?.content, normalizedInput);
        mode = apiPayload?.mode || "Live";
        message = apiPayload?.message || "Gemini Live Mode";
        apiStatus = apiPayload?.apiStatus || "Ready";
        }
      } catch (error) {
        if (error instanceof Trend2ShortAIError && error.code === "NETWORK_ERROR") {
          content = createDemoContent(normalizedInput);
          mode = "Demo";
          message = "Demo Fallback Active";
          apiStatus = "Connection Error";
        } else if (error instanceof Trend2ShortAIError && error.code === "API_UNAVAILABLE") {
          content = createDemoContent(normalizedInput);
          mode = "Demo";
          message = "Demo Fallback Active";
          apiStatus = "API Unavailable";
        } else if (error instanceof Trend2ShortAIError && error.code === "INVALID_RESPONSE") {
          content = createDemoContent(normalizedInput);
          mode = "Demo";
          message = "Demo Fallback Active";
          apiStatus = "API Response Error";
        } else if (error instanceof Trend2ShortAIError && error.code === "API_ERROR") {
          throw error;
        } else {
          content = createDemoContent(normalizedInput);
          mode = "Demo";
          message = "Demo Fallback Active";
          apiStatus = "Connection Error";
        }
      }

    if (nextInvalidResponse) {
      content = {};
    }

    const normalizedContent = normalizeAIResponse(content, normalizedInput);
    const usageCount = incrementTodayUsage();

    setStatus({
      provider: settings.API_PROVIDER || DEFAULT_PROVIDER,
      providerLabel: "Gemini",
      mode,
      apiStatus
    });

    return {
      mode,
      provider: settings.API_PROVIDER || DEFAULT_PROVIDER,
      providerLabel: "Gemini",
      apiStatus,
      message,
      usageCount,
      content: normalizedContent
    };
  }

  function setNextError(code) {
    debugState.nextErrorCode = code;
  }

  function setNextInvalidResponse(value) {
    debugState.nextInvalidResponse = Boolean(value);
  }

  function setDelay(ms) {
    const parsed = Number.parseInt(String(ms), 10);
    debugState.nextDelayMs = Number.isNaN(parsed) ? 650 : Math.max(parsed, 0);
  }

  window.Trend2ShortAIService = {
      ensureReady: getSettings,
      getSettings,
      getStatus,
    generate,
    createPreviewContent: createDemoContent,
    getTodayUsage,
    getDailyLimit: () => DAILY_LIMIT,
    resetDemoData: resetUsageState,
    __debug: {
      setNextError,
      setNextInvalidResponse,
      setDelay
    }
  };
})();
