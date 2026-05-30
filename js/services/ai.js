(function () {
  const USAGE_STORAGE_KEY = "trend2short-ai-usage";
  const DEFAULT_PROVIDER = "mock";
  const DEFAULT_SETTINGS = {
    API_PROVIDER: DEFAULT_PROVIDER,
    API_KEY: ""
  };

  const debugState = {
    nextErrorCode: null,
    nextInvalidResponse: false,
    nextDelayMs: 650
  };

  let configLoadPromise = null;

  const styleProfiles = {
    Educational: {
      English: {
        label: "educational",
        angle: "break the topic into a quick lesson with practical takeaways",
        tone: "clear and useful",
        promise: "teach something practical in under 30 seconds"
      },
      Arabic: {
        label: "تعليمي",
        angle: "قسم الموضوع إلى شرح سريع مع نقاط عملية واضحة",
        tone: "واضح ومفيد",
        promise: "تقديم فائدة عملية في أقل من 30 ثانية"
      },
      French: {
        label: "educatif",
        angle: "decomposer le sujet en mini lecon avec conseils utiles",
        tone: "clair et utile",
        promise: "apporter une valeur concrete en moins de 30 secondes"
      }
    },
    Viral: {
      English: {
        label: "viral",
        angle: "frame the topic around surprise, momentum, and instant curiosity",
        tone: "high-energy and punchy",
        promise: "grab attention before the swipe"
      },
      Arabic: {
        label: "فيروسي",
        angle: "ابن الفكرة على المفاجأة والفضول والإيقاع السريع",
        tone: "سريع وجذاب",
        promise: "خطف الانتباه قبل تجاوز الفيديو"
      },
      French: {
        label: "viral",
        angle: "presenter le sujet avec surprise, rythme et curiosite immediate",
        tone: "energique et percutant",
        promise: "capturer l'attention avant le swipe"
      }
    },
    Storytelling: {
      English: {
        label: "storytelling",
        angle: "turn the topic into a short narrative with setup, shift, and payoff",
        tone: "personal and cinematic",
        promise: "make the viewer stay until the ending"
      },
      Arabic: {
        label: "قصصي",
        angle: "حول الموضوع إلى قصة قصيرة فيها بداية وتحول ونهاية",
        tone: "شخصي وسلس",
        promise: "جعل المشاهد ينتظر النهاية"
      },
      French: {
        label: "storytelling",
        angle: "transformer le sujet en mini histoire avec contexte, bascule et conclusion",
        tone: "personnel et narratif",
        promise: "garder le spectateur jusqu'a la fin"
      }
    },
    Professional: {
      English: {
        label: "professional",
        angle: "position the topic with authority, insight, and a polished structure",
        tone: "confident and sharp",
        promise: "deliver concise expert value"
      },
      Arabic: {
        label: "احترافي",
        angle: "قدم الموضوع بصياغة موثوقة ومنظمة ونبرة خبيرة",
        tone: "احترافي وواثق",
        promise: "تقديم قيمة مختصرة بلمسة خبيرة"
      },
      French: {
        label: "professionnel",
        angle: "positionner le sujet avec autorite, structure et clarte",
        tone: "precis et credible",
        promise: "offrir une valeur d'expert concise"
      }
    }
  };

  const platformProfiles = {
    TikTok: {
      English: "fast cuts, bold phrasing, and a direct opening",
      Arabic: "لقطات سريعة وبداية مباشرة وصياغة جريئة",
      French: "des coupes rapides, une accroche directe et un ton percutant"
    },
    "YouTube Shorts": {
      English: "search-friendly phrasing with clear value delivery",
      Arabic: "صياغة واضحة وسهلة الفهم مع قيمة مباشرة",
      French: "une formulation claire avec une promesse de valeur immediate"
    },
    "Instagram Reels": {
      English: "clean lifestyle framing with shareable social energy",
      Arabic: "عرض بصري أنيق وروح اجتماعية قابلة للمشاركة",
      French: "un angle visuel propre avec une energie sociale facile a partager"
    }
  };

  const languageProfiles = {
    English: {
      hooks: [
        "Most creators are still missing this angle on {topic}.",
        "If you're posting about {topic}, start with this instead.",
        "This {topic} shortcut can change your next short video."
      ],
      scriptIntro: "Open with a bold statement about",
      scriptMiddle: "Then",
      scriptOutro: "Close with one practical insight and ask viewers to save the video for later.",
      captionStart: "Quick breakdown:",
      cta: "Try Trend2Short AI and turn your next trend into a publish-ready short."
    },
    Arabic: {
      hooks: [
        "أغلب صناع المحتوى لم يستغلوا هذا الجانب من {topic} بعد.",
        "إذا كنت تنشر عن {topic} فابدأ بهذه الزاوية.",
        "هذه الفكرة حول {topic} قد تصنع فرقًا في الفيديو القادم."
      ],
      scriptIntro: "ابدأ بجملة قوية عن",
      scriptMiddle: "ثم",
      scriptOutro: "اختم بنصيحة واضحة وادع المشاهد لحفظ الفيديو والعودة إليه لاحقًا.",
      captionStart: "ملخص سريع:",
      cta: "جرّب Trend2Short AI وحوّل الترند القادم إلى فيديو قصير جاهز."
    },
    French: {
      hooks: [
        "La plupart des createurs passent encore a cote de cet angle sur {topic}.",
        "Si tu publies sur {topic}, commence plutot comme ca.",
        "Cette approche autour de {topic} peut booster ta prochaine video courte."
      ],
      scriptIntro: "Commence par une phrase forte sur",
      scriptMiddle: "Puis",
      scriptOutro: "Termine avec un conseil simple et invite les spectateurs a sauvegarder la video.",
      captionStart: "Resume rapide :",
      cta: "Essaie Trend2Short AI et genere ton prochain short plus vite."
    }
  };

  class Trend2ShortAIError extends Error {
    constructor(code, message) {
      super(message);
      this.name = "Trend2ShortAIError";
      this.code = code;
    }
  }

  function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
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

  function wait(ms) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  function loadOptionalConfig() {
    if (window.TREND2SHORT_CONFIG) {
      return Promise.resolve(window.TREND2SHORT_CONFIG);
    }

    if (configLoadPromise) {
      return configLoadPromise;
    }

    configLoadPromise = new Promise((resolve) => {
      const existingScript = document.querySelector('script[data-trend2short-config="true"]');

      if (existingScript) {
        resolve(window.TREND2SHORT_CONFIG || DEFAULT_SETTINGS);
        return;
      }

      const script = document.createElement("script");
      script.src = "config.js";
      script.defer = true;
      script.dataset.trend2shortConfig = "true";
      script.onload = () => resolve(window.TREND2SHORT_CONFIG || DEFAULT_SETTINGS);
      script.onerror = () => resolve(DEFAULT_SETTINGS);
      document.head.appendChild(script);
    });

    return configLoadPromise;
  }

  async function getSettings() {
    const loadedConfig = await loadOptionalConfig();
    return {
      API_PROVIDER: String(loadedConfig.API_PROVIDER || DEFAULT_PROVIDER).toLowerCase(),
      API_KEY: String(loadedConfig.API_KEY || "").trim()
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

  function getArticle(word) {
    return /^[aeiou]/i.test(word) ? "an" : "a";
  }

  function buildMeta(platform, language, style) {
    return `${platform} | ${language} | ${style}`;
  }

  function pickHook(language, topic) {
    const hooks = languageProfiles[language].hooks;
    return hooks[topic.length % hooks.length].replace("{topic}", topic);
  }

  function createDemoContent(input) {
    const topic = getCleanTopic(input.topic);
    const platform = input.platform || "TikTok";
    const language = input.language || "English";
    const style = input.style || "Educational";

    const styleProfile = styleProfiles[style][language];
    const platformProfile = platformProfiles[platform][language];
    const languageProfile = languageProfiles[language];
    const keyword = buildKeyword(topic) || "trend";

    let videoIdea = "";
    let caption = "";

    if (language === "Arabic") {
      videoIdea = `أنشئ فيديو ${styleProfile.label} لمنصة ${platform} حول ${topic} يعتمد على ${platformProfile} بهدف ${styleProfile.promise}.`;
      caption = `${languageProfile.captionStart} ${topic} بصياغة ${styleProfile.label} مخصصة لـ ${platform}. أسلوب ${styleProfile.tone} مع قيمة سريعة ودعوة واضحة للتفاعل.`;
    } else if (language === "French") {
      videoIdea = `Cree une video courte ${styleProfile.label} pour ${platform} sur ${topic}, en utilisant ${platformProfile} afin de ${styleProfile.promise}.`;
      caption = `${languageProfile.captionStart} ${topic} traite dans un style ${styleProfile.label} pour ${platform}. Un rendu ${styleProfile.tone}, rapide et facile a publier.`;
    } else {
      videoIdea = `Create ${getArticle(styleProfile.label)} ${styleProfile.label} short for ${platform} about ${topic} that uses ${platformProfile} to ${styleProfile.promise}.`;
      caption = `${languageProfile.captionStart} ${topic} explained in a ${styleProfile.label} format for ${platform}. ${styleProfile.tone} delivery, fast value, and a clean CTA.`;
    }

    return {
      title: topic,
      meta: buildMeta(platform, language, style),
      hook: pickHook(language, topic),
      videoIdea,
      shortScript: `${languageProfile.scriptIntro} ${topic}.\n${languageProfile.scriptMiddle} ${styleProfile.angle}.\n${languageProfile.scriptOutro}`,
      caption,
      hashtags: `#${keyword} #shortvideo #contentcreator #${platform.replace(/\s+/g, "").toLowerCase()} #${style.toLowerCase()} #trend2short`,
      cta: languageProfile.cta,
      platform,
      language,
      style
    };
  }

  function normalizeAIResponse(response, fallbackInput) {
    if (!response || typeof response !== "object") {
      throw new Trend2ShortAIError("INVALID_RESPONSE", "Invalid response payload.");
    }

    const normalized = {
      title: getCleanTopic(response.title || fallbackInput.topic),
      meta: buildMeta(fallbackInput.platform, fallbackInput.language, fallbackInput.style),
      hook: String(response.hook || "").trim(),
      videoIdea: String(response.videoIdea || "").trim(),
      shortScript: String(response.shortScript || "").trim(),
      caption: String(response.caption || "").trim(),
      hashtags: String(response.hashtags || "").trim(),
      cta: String(response.cta || "").trim(),
      platform: fallbackInput.platform,
      language: fallbackInput.language,
      style: fallbackInput.style
    };

    const requiredValues = [
      normalized.title,
      normalized.hook,
      normalized.videoIdea,
      normalized.shortScript,
      normalized.caption,
      normalized.hashtags,
      normalized.cta
    ];

    if (requiredValues.some((value) => !value)) {
      throw new Trend2ShortAIError("INVALID_RESPONSE", "Missing expected AI fields.");
    }

    return normalized;
  }

  async function generateWithFutureProvider(provider) {
    throw new Trend2ShortAIError("API_ERROR", `${provider} integration is not enabled in this MVP build yet.`);
  }

  async function callProvider(provider, input) {
    if (provider === "mock") {
      return createDemoContent(input);
    }

    if (provider === "openai" || provider === "gemini" || provider === "claude" || provider === "openrouter") {
      return generateWithFutureProvider(provider, input);
    }

    throw new Trend2ShortAIError("API_ERROR", "Unsupported API provider configuration.");
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

  async function generate(input) {
    const topic = getCleanTopic(input.topic);

    if (!topic) {
      throw new Trend2ShortAIError("EMPTY_INPUT", "Empty input.");
    }

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
    const hasApiKey = Boolean(settings.API_KEY);

    let content;
    let mode = "live";
    let message = "";

    try {
      if (!hasApiKey) {
        mode = "demo";
        message = "Running in Demo Mode";
        content = createDemoContent(normalizedInput);
      } else {
        content = await callProvider(settings.API_PROVIDER, normalizedInput);
      }
    } catch (error) {
      if (error instanceof Trend2ShortAIError) {
        throw error;
      }

      throw new Trend2ShortAIError("NETWORK_ERROR", error.message || "Unknown network failure.");
    }

    if (nextInvalidResponse) {
      content = {};
    }

    const normalizedContent = normalizeAIResponse(content, normalizedInput);
    const usageCount = incrementTodayUsage();

    return {
      mode,
      provider: hasApiKey ? settings.API_PROVIDER : "mock",
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
    generate,
    createPreviewContent: createDemoContent,
    getTodayUsage,
    __debug: {
      setNextError,
      setNextInvalidResponse,
      setDelay
    }
  };
})();
