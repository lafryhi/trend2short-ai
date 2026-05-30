(function () {
  const USAGE_STORAGE_KEY = "trend2short-ai-usage";
  const DEFAULT_PROVIDER = "gemini";
  const DAILY_LIMIT = 10;
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
  let cachedStatus = {
    provider: DEFAULT_PROVIDER,
    providerLabel: "Gemini",
    mode: "Demo",
    apiStatus: "Missing Key"
  };

  const styleProfiles = {
    Educational: {
      English: {
        label: "educational",
        angle: "break the topic into a quick lesson with practical takeaways",
        tone: "clear and useful",
        promise: "teach something practical in under 30 seconds"
      },
      Arabic: {
        label: "\u062a\u0639\u0644\u064a\u0645\u064a",
        angle: "\u0642\u0633\u0645 \u0627\u0644\u0645\u0648\u0636\u0648\u0639 \u0625\u0644\u0649 \u0634\u0631\u062d \u0633\u0631\u064a\u0639 \u0645\u0639 \u0646\u0642\u0627\u0637 \u0639\u0645\u0644\u064a\u0629 \u0648\u0627\u0636\u062d\u0629",
        tone: "\u0648\u0627\u0636\u062d \u0648\u0645\u0641\u064a\u062f",
        promise: "\u062a\u0642\u062f\u064a\u0645 \u0641\u0627\u0626\u062f\u0629 \u0639\u0645\u0644\u064a\u0629 \u0641\u064a \u0623\u0642\u0644 \u0645\u0646 30 \u062b\u0627\u0646\u064a\u0629"
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
        label: "\u0641\u064a\u0631\u0648\u0633\u064a",
        angle: "\u0627\u0628\u0646 \u0627\u0644\u0641\u0643\u0631\u0629 \u0639\u0644\u0649 \u0627\u0644\u0645\u0641\u0627\u062c\u0623\u0629 \u0648\u0627\u0644\u0641\u0636\u0648\u0644 \u0648\u0627\u0644\u0625\u064a\u0642\u0627\u0639 \u0627\u0644\u0633\u0631\u064a\u0639",
        tone: "\u0633\u0631\u064a\u0639 \u0648\u062c\u0630\u0627\u0628",
        promise: "\u062e\u0637\u0641 \u0627\u0644\u0627\u0646\u062a\u0628\u0627\u0647 \u0642\u0628\u0644 \u062a\u062c\u0627\u0648\u0632 \u0627\u0644\u0641\u064a\u062f\u064a\u0648"
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
        label: "\u0642\u0635\u0635\u064a",
        angle: "\u062d\u0648\u0644 \u0627\u0644\u0645\u0648\u0636\u0648\u0639 \u0625\u0644\u0649 \u0642\u0635\u0629 \u0642\u0635\u064a\u0631\u0629 \u0641\u064a\u0647\u0627 \u0628\u062f\u0627\u064a\u0629 \u0648\u062a\u062d\u0648\u0644 \u0648\u0646\u0647\u0627\u064a\u0629",
        tone: "\u0634\u062e\u0635\u064a \u0648\u0633\u0644\u0633",
        promise: "\u062c\u0639\u0644 \u0627\u0644\u0645\u0634\u0627\u0647\u062f \u064a\u0646\u062a\u0638\u0631 \u0627\u0644\u0646\u0647\u0627\u064a\u0629"
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
        label: "\u0627\u062d\u062a\u0631\u0627\u0641\u064a",
        angle: "\u0642\u062f\u0645 \u0627\u0644\u0645\u0648\u0636\u0648\u0639 \u0628\u0635\u064a\u0627\u063a\u0629 \u0645\u0648\u062b\u0648\u0642\u0629 \u0648\u0645\u0646\u0638\u0645\u0629 \u0648\u0646\u0628\u0631\u0629 \u062e\u0628\u064a\u0631\u0629",
        tone: "\u0627\u062d\u062a\u0631\u0627\u0641\u064a \u0648\u0648\u0627\u062b\u0642",
        promise: "\u062a\u0642\u062f\u064a\u0645 \u0642\u064a\u0645\u0629 \u0645\u062e\u062a\u0635\u0631\u0629 \u0628\u0644\u0645\u0633\u0629 \u062e\u0628\u064a\u0631\u0629"
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
      Arabic: "\u0644\u0642\u0637\u0627\u062a \u0633\u0631\u064a\u0639\u0629 \u0648\u0628\u062f\u0627\u064a\u0629 \u0645\u0628\u0627\u0634\u0631\u0629 \u0648\u0635\u064a\u0627\u063a\u0629 \u062c\u0631\u064a\u0626\u0629",
      French: "des coupes rapides, une accroche directe et un ton percutant"
    },
    "YouTube Shorts": {
      English: "search-friendly phrasing with clear value delivery",
      Arabic: "\u0635\u064a\u0627\u063a\u0629 \u0648\u0627\u0636\u062d\u0629 \u0648\u0633\u0647\u0644\u0629 \u0627\u0644\u0641\u0647\u0645 \u0645\u0639 \u0642\u064a\u0645\u0629 \u0645\u0628\u0627\u0634\u0631\u0629",
      French: "une formulation claire avec une promesse de valeur immediate"
    },
    "Instagram Reels": {
      English: "clean lifestyle framing with shareable social energy",
      Arabic: "\u0639\u0631\u0636 \u0628\u0635\u0631\u064a \u0623\u0646\u064a\u0642 \u0648\u0631\u0648\u062d \u0627\u062c\u062a\u0645\u0627\u0639\u064a\u0629 \u0642\u0627\u0628\u0644\u0629 \u0644\u0644\u0645\u0634\u0627\u0631\u0643\u0629",
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
        "\u0623\u063a\u0644\u0628 \u0635\u0646\u0627\u0639 \u0627\u0644\u0645\u062d\u062a\u0648\u0649 \u0644\u0645 \u064a\u0633\u062a\u063a\u0644\u0648\u0627 \u0647\u0630\u0627 \u0627\u0644\u062c\u0627\u0646\u0628 \u0645\u0646 {topic} \u0628\u0639\u062f.",
        "\u0625\u0630\u0627 \u0643\u0646\u062a \u062a\u0646\u0634\u0631 \u0639\u0646 {topic} \u0641\u0627\u0628\u062f\u0623 \u0628\u0647\u0630\u0647 \u0627\u0644\u0632\u0627\u0648\u064a\u0629.",
        "\u0647\u0630\u0647 \u0627\u0644\u0641\u0643\u0631\u0629 \u062d\u0648\u0644 {topic} \u0642\u062f \u062a\u0635\u0646\u0639 \u0641\u0631\u0642\u064b\u0627 \u0641\u064a \u0627\u0644\u0641\u064a\u062f\u064a\u0648 \u0627\u0644\u0642\u0627\u062f\u0645."
      ],
      scriptIntro: "\u0627\u0628\u062f\u0623 \u0628\u062c\u0645\u0644\u0629 \u0642\u0648\u064a\u0629 \u0639\u0646",
      scriptMiddle: "\u062b\u0645",
      scriptOutro: "\u0627\u062e\u062a\u0645 \u0628\u0646\u0635\u064a\u062d\u0629 \u0648\u0627\u0636\u062d\u0629 \u0648\u0627\u062f\u0639 \u0627\u0644\u0645\u0634\u0627\u0647\u062f \u0644\u062d\u0641\u0638 \u0627\u0644\u0641\u064a\u062f\u064a\u0648 \u0648\u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u064a\u0647 \u0644\u0627\u062d\u0642\u064b\u0627.",
      captionStart: "\u0645\u0644\u062e\u0635 \u0633\u0631\u064a\u0639:",
      cta: "\u062c\u0631\u0651\u0628 Trend2Short AI \u0648\u062d\u0648\u0651\u0644 \u0627\u0644\u062a\u0631\u0646\u062f \u0627\u0644\u0642\u0627\u062f\u0645 \u0625\u0644\u0649 \u0641\u064a\u062f\u064a\u0648 \u0642\u0635\u064a\u0631 \u062c\u0627\u0647\u0632."
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

  async function getStatus() {
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
      videoIdea = `\u0623\u0646\u0634\u0626 \u0641\u064a\u062f\u064a\u0648 ${styleProfile.label} \u0644\u0645\u0646\u0635\u0629 ${platform} \u062d\u0648\u0644 ${topic} \u064a\u0639\u062a\u0645\u062f \u0639\u0644\u0649 ${platformProfile} \u0628\u0647\u062f\u0641 ${styleProfile.promise}.`;
      caption = `${languageProfile.captionStart} ${topic} \u0628\u0635\u064a\u0627\u063a\u0629 ${styleProfile.label} \u0645\u062e\u0635\u0635\u0629 \u0644\u0640 ${platform}. \u0623\u0633\u0644\u0648\u0628 ${styleProfile.tone} \u0645\u0639 \u0642\u064a\u0645\u0629 \u0633\u0631\u064a\u0639\u0629 \u0648\u062f\u0639\u0648\u0629 \u0648\u0627\u0636\u062d\u0629 \u0644\u0644\u062a\u0641\u0627\u0639\u0644.`;
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
      throw new Trend2ShortAIError("NETWORK_ERROR", "Local API route disabled.");
    }

    const response = await window.fetch("/api/generate", {
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

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Trend2ShortAIError("NETWORK_ERROR", "API route unavailable.");
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
      if (error instanceof Trend2ShortAIError && error.code === "INVALID_RESPONSE") {
        throw error;
      }

      if (error instanceof Trend2ShortAIError && error.code === "API_ERROR") {
        throw error;
      }

      content = createDemoContent(normalizedInput);
      mode = "Demo";
      message = "Running in Demo Mode";
      apiStatus = "Missing Key";
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
