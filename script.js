const trendForm = document.getElementById("trendForm");
const trendTopicInput = document.getElementById("trendTopic");
const platformSelect = document.getElementById("platform");
const languageSelect = document.getElementById("language");
const styleSelect = document.getElementById("style");
const historySearchInput = document.getElementById("historySearch");
const historyFilterSelect = document.getElementById("historyFilter");
const startGeneratingBtn = document.getElementById("startGeneratingBtn");
const viewExamplesBtn = document.getElementById("viewExamplesBtn");
const useTrendButtons = document.querySelectorAll(".use-trend-btn");
const comingSoonButtons = document.querySelectorAll(".coming-soon-btn");
const copyButtons = document.querySelectorAll(".copy-btn");
const exportTxtBtn = document.getElementById("exportTxtBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

const resultTitle = document.getElementById("resultTitle");
const resultMeta = document.getElementById("resultMeta");
const videoIdea = document.getElementById("videoIdea");
const strongHook = document.getElementById("strongHook");
const shortScript = document.getElementById("shortScript");
const caption = document.getElementById("caption");
const hashtags = document.getElementById("hashtags");
const callToAction = document.getElementById("callToAction");

const dashboardTotalGenerations = document.getElementById("dashboardTotalGenerations");
const dashboardSavedItems = document.getElementById("dashboardSavedItems");
const dashboardPinnedItems = document.getElementById("dashboardPinnedItems");
const dashboardLastPlatform = document.getElementById("dashboardLastPlatform");
const dashboardLastLanguage = document.getElementById("dashboardLastLanguage");
const dashboardTikTokGenerations = document.getElementById("dashboardTikTokGenerations");
const dashboardYouTubeGenerations = document.getElementById("dashboardYouTubeGenerations");
const dashboardInstagramGenerations = document.getElementById("dashboardInstagramGenerations");

const savedList = document.getElementById("savedList");
const savedEmptyState = document.getElementById("savedEmptyState");
const toast = document.getElementById("toast");

const workspaceTabsSection = document.getElementById("workspaceTabs");
const generatorSection = document.getElementById("generator");
const examplesSection = document.getElementById("examples");

const STORAGE_KEY = "trend2short-history";
const TOTAL_STORAGE_KEY = "trend2short-total-generations";
const SEEDED_KEY = "trend2short-seeded-v1";
const PENDING_TREND_KEY = "trend2short-pending-trend";
const HISTORY_LIMIT = 10;

let currentContent = null;
let toastTimeoutId = null;
let activeTab = "generator";

const styleProfiles = {
  Educational: {
    English: {
      label: "educational",
      angle: "break down the topic into a quick lesson with practical takeaways",
      tone: "clear and useful",
      promise: "teach something practical in under 30 seconds"
    },
    Arabic: {
      label: "\u062a\u0639\u0644\u064a\u0645\u064a",
      angle: "\u0642\u0633\u0645 \u0627\u0644\u0641\u0643\u0631\u0629 \u0625\u0644\u0649 \u0634\u0631\u062d \u0633\u0631\u064a\u0639 \u0645\u0639 \u0646\u0642\u0627\u0637 \u0639\u0645\u0644\u064a\u0629 \u0648\u0627\u0636\u062d\u0629",
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
    hookTemplates: [
      "Most creators are still missing this angle on {topic}.",
      "If you're posting about {topic}, start with this instead.",
      "This {topic} shortcut can change your next short video."
    ],
    scriptIntro: "Open with a bold statement about",
    scriptMiddle: "Then",
    scriptOutro: "Close with one practical insight and ask viewers to save the video for later.",
    captionStart: "Quick breakdown:",
    cta: "Follow for more creator-ready short video ideas."
  },
  Arabic: {
    hookTemplates: [
      "\u0623\u063a\u0644\u0628 \u0635\u0646\u0627\u0639 \u0627\u0644\u0645\u062d\u062a\u0648\u0649 \u0644\u0645 \u064a\u0633\u062a\u063a\u0644\u0648\u0627 \u0647\u0630\u0627 \u0627\u0644\u062c\u0627\u0646\u0628 \u0645\u0646 {topic} \u0628\u0639\u062f.",
      "\u0625\u0630\u0627 \u0643\u0646\u062a \u062a\u0646\u0634\u0631 \u0639\u0646 {topic} \u0641\u0627\u0628\u062f\u0623 \u0628\u0647\u0630\u0647 \u0627\u0644\u0632\u0627\u0648\u064a\u0629.",
      "\u0647\u0630\u0647 \u0627\u0644\u0641\u0643\u0631\u0629 \u062d\u0648\u0644 {topic} \u0642\u062f \u062a\u0635\u0646\u0639 \u0641\u0631\u0642\u0627 \u0641\u064a \u0627\u0644\u0641\u064a\u062f\u064a\u0648 \u0627\u0644\u0642\u0627\u062f\u0645."
    ],
    scriptIntro: "\u0627\u0628\u062f\u0623 \u0628\u062c\u0645\u0644\u0629 \u0642\u0648\u064a\u0629 \u0639\u0646",
    scriptMiddle: "\u062b\u0645",
    scriptOutro: "\u0627\u062e\u062a\u0645 \u0628\u0646\u0635\u064a\u062d\u0629 \u0648\u0627\u0636\u062d\u0629 \u0648\u0627\u062f\u0639 \u0627\u0644\u0645\u0634\u0627\u0647\u062f \u0644\u062d\u0641\u0638 \u0627\u0644\u0641\u064a\u062f\u064a\u0648 \u0648\u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u064a\u0647 \u0644\u0627\u062d\u0642\u0627.",
    captionStart: "\u0645\u0644\u062e\u0635 \u0633\u0631\u064a\u0639:",
    cta: "\u062a\u0627\u0628\u0639\u0646\u064a \u0644\u0644\u0645\u0632\u064a\u062f \u0645\u0646 \u0623\u0641\u0643\u0627\u0631 \u0627\u0644\u0641\u064a\u062f\u064a\u0648\u0647\u0627\u062a \u0627\u0644\u0642\u0635\u064a\u0631\u0629 \u0627\u0644\u062c\u0627\u0647\u0632\u0629."
  },
  French: {
    hookTemplates: [
      "La plupart des createurs passent encore a cote de cet angle sur {topic}.",
      "Si tu publies sur {topic}, commence plutot comme ca.",
      "Cette approche autour de {topic} peut booster ta prochaine video courte."
    ],
    scriptIntro: "Commence par une phrase forte sur",
    scriptMiddle: "Puis",
    scriptOutro: "Termine avec un conseil simple et invite les spectateurs a sauvegarder la video.",
    captionStart: "Resume rapide :",
    cta: "Abonne-toi pour plus d'idees de videos courtes pretes a publier."
  }
};

function buildMeta(platform, language, style) {
  return `${platform} | ${language} | ${style}`;
}

function getCleanTopic(rawTopic) {
  return rawTopic.trim() || "AI tools for creators";
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

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `trend-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getArticle(word) {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

function pickHook(language, topic) {
  const templates = languageProfiles[language].hookTemplates;
  const index = topic.length % templates.length;
  return templates[index].replace("{topic}", topic);
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function setSavedHistory(history) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function normalizeContent(item) {
  const platform = item.platform || "TikTok";
  const language = item.language || "English";
  const style = item.style || "Educational";

  return {
    id: item.id || createId(),
    title: getCleanTopic(item.title || ""),
    platform,
    language,
    style,
    meta: buildMeta(platform, language, style),
    idea: item.idea || "",
    hook: item.hook || "",
    script: item.script || "",
    caption: item.caption || "",
    hashtags: item.hashtags || "",
    cta: item.cta || "",
    pinned: Boolean(item.pinned),
    createdAt: item.createdAt || new Date().toISOString()
  };
}

function getSavedHistory() {
  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  const parsed = rawValue ? safeJsonParse(rawValue, []) : [];
  const history = Array.isArray(parsed) ? parsed : [];
  const normalizedHistory = history.map(normalizeContent);

  if (JSON.stringify(history) !== JSON.stringify(normalizedHistory)) {
    setSavedHistory(normalizedHistory);
  }

  return normalizedHistory;
}

function getTotalGenerations() {
  const value = Number.parseInt(window.localStorage.getItem(TOTAL_STORAGE_KEY) || "0", 10);
  return Number.isNaN(value) ? 0 : value;
}

function setTotalGenerations(value) {
  window.localStorage.setItem(TOTAL_STORAGE_KEY, String(value));
}

function formatTimestamp(isoValue) {
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) {
    return "Saved locally";
  }

  return date.toLocaleString();
}

function sortHistory(history) {
  return [...history].sort((left, right) => {
    if (left.pinned !== right.pinned) {
      return left.pinned ? -1 : 1;
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");

  if (toastTimeoutId) {
    window.clearTimeout(toastTimeoutId);
  }

  toastTimeoutId = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 1700);
}

function generateContent(topic, platform, language, style) {
  const cleanTopic = getCleanTopic(topic);
  const keyword = buildKeyword(cleanTopic) || "trend";
  const styleProfile = styleProfiles[style][language];
  const platformProfile = platformProfiles[platform][language];
  const languageProfile = languageProfiles[language];

  let ideaText = "";
  let captionText = "";

  if (language === "Arabic") {
    ideaText =
      `\u0623\u0646\u0634\u0626 \u0641\u064a\u062f\u064a\u0648 ${styleProfile.label} \u0644\u0645\u0646\u0635\u0629 ${platform} \u062d\u0648\u0644 ${cleanTopic} \u064a\u0639\u062a\u0645\u062f \u0639\u0644\u0649 ${platformProfile} \u0628\u0647\u062f\u0641 ${styleProfile.promise}.`;
    captionText =
      `${languageProfile.captionStart} ${cleanTopic} \u0628\u0635\u064a\u0627\u063a\u0629 ${styleProfile.label} \u0645\u062e\u0635\u0635\u0629 \u0644\u0640 ${platform}. \u0623\u0633\u0644\u0648\u0628 ${styleProfile.tone} \u0645\u0639 \u0642\u064a\u0645\u0629 \u0633\u0631\u064a\u0639\u0629 \u0648\u062f\u0639\u0648\u0629 \u0648\u0627\u0636\u062d\u0629 \u0644\u0644\u062a\u0641\u0627\u0639\u0644.`;
  } else if (language === "French") {
    ideaText =
      `Cree une video courte ${styleProfile.label} pour ${platform} sur ${cleanTopic}, en utilisant ${platformProfile} afin de ${styleProfile.promise}.`;
    captionText =
      `${languageProfile.captionStart} ${cleanTopic} traite dans un style ${styleProfile.label} pour ${platform}. Un rendu ${styleProfile.tone}, rapide et facile a publier.`;
  } else {
    ideaText =
      `Create ${getArticle(styleProfile.label)} ${styleProfile.label} short for ${platform} about ${cleanTopic} that uses ${platformProfile} to ${styleProfile.promise}.`;
    captionText =
      `${languageProfile.captionStart} ${cleanTopic} explained in a ${styleProfile.label} format for ${platform}. ${styleProfile.tone} delivery, fast value, and a clean CTA.`;
  }

  return {
    id: createId(),
    title: cleanTopic,
    platform,
    language,
    style,
    meta: buildMeta(platform, language, style),
    idea: ideaText,
    hook: pickHook(language, cleanTopic),
    script:
      `${languageProfile.scriptIntro} ${cleanTopic}.\n` +
      `${languageProfile.scriptMiddle} ${styleProfile.angle}.\n` +
      `${languageProfile.scriptOutro}`,
    caption: captionText,
    hashtags:
      `#${keyword} #shortvideo #contentcreator #${platform.replace(/\s+/g, "").toLowerCase()} #${style.toLowerCase()} #trend2short`,
    cta: languageProfile.cta,
    createdAt: new Date().toISOString()
  };
}

function createSeedHistory() {
  const samples = [
    ["AI tools for creators", "TikTok", "English", "Viral"],
    ["How to make money online", "YouTube Shorts", "English", "Professional"],
    ["Educational apps for kids", "Instagram Reels", "Arabic", "Educational"]
  ];

  return samples.map(([topic, platform, language, style], index) => {
    const content = generateContent(topic, platform, language, style);
    return {
      ...content,
      createdAt: new Date(Date.now() - index * 3600000).toISOString()
    };
  });
}

function ensureSeedData() {
  if (window.localStorage.getItem(SEEDED_KEY) === "1") {
    return;
  }

  const existingHistory = getSavedHistory();

  if (existingHistory.length === 0) {
    const seedHistory = createSeedHistory();
    setSavedHistory(seedHistory);

    if (getTotalGenerations() === 0) {
      setTotalGenerations(seedHistory.length);
    }
  }

  window.localStorage.setItem(SEEDED_KEY, "1");
}

function populateFormFromContent(content) {
  trendTopicInput.value = content.title;
  platformSelect.value = content.platform;
  languageSelect.value = content.language;
  styleSelect.value = content.style;
}

function renderContent(content) {
  currentContent = normalizeContent(content);
  resultTitle.textContent = currentContent.title;
  resultMeta.textContent = currentContent.meta;
  videoIdea.textContent = currentContent.idea;
  strongHook.textContent = currentContent.hook;
  shortScript.textContent = currentContent.script;
  caption.textContent = currentContent.caption;
  hashtags.textContent = currentContent.hashtags;
  callToAction.textContent = currentContent.cta;
  refreshDashboard();
}

function getFilteredHistory() {
  const history = sortHistory(getSavedHistory());
  const query = historySearchInput.value.trim().toLowerCase();
  const filter = historyFilterSelect.value;

  return history.filter((item) => {
    const matchesQuery = !query || [
      item.title,
      item.platform,
      item.language
    ].some((field) => field.toLowerCase().includes(query));

    const matchesFilter =
      filter === "all" ||
      (filter === "pinned" && item.pinned) ||
      item.platform === filter;

    return matchesQuery && matchesFilter;
  });
}

function setEmptyStateMessage(message) {
  savedEmptyState.textContent = message;
  savedEmptyState.hidden = false;
}

function renderSavedHistory() {
  const allHistory = getSavedHistory();
  const filteredHistory = getFilteredHistory();
  savedList.innerHTML = "";

  if (allHistory.length === 0) {
    setEmptyStateMessage("No saved generations yet.");
    return;
  }

  if (filteredHistory.length === 0) {
    setEmptyStateMessage("No matching saved generations found.");
    return;
  }

  savedEmptyState.hidden = true;

  filteredHistory.forEach((item) => {
    const article = document.createElement("article");
    article.className = "saved-item";
    article.classList.toggle("is-pinned", item.pinned);
    article.dataset.historyId = item.id;

    const top = document.createElement("div");
    top.className = "history-card-top";

    const titleWrap = document.createElement("div");
    titleWrap.className = "history-card-header";
    const title = document.createElement("h3");
    title.className = "history-card-title";
    title.textContent = item.title;

    if (item.pinned) {
      const pinnedBadge = document.createElement("span");
      pinnedBadge.className = "pinned-badge";
      pinnedBadge.textContent = "Pinned";
      titleWrap.appendChild(pinnedBadge);
    }

    const meta = document.createElement("span");
    meta.className = "saved-meta";
    meta.textContent = item.meta;
    titleWrap.append(title, meta);

    const timestamp = document.createElement("span");
    timestamp.className = "saved-meta";
    timestamp.textContent = formatTimestamp(item.createdAt);
    top.append(titleWrap, timestamp);

    const summary = document.createElement("div");
    summary.className = "history-card-summary saved-body";

    [
      ["Video Idea", item.idea],
      ["Hook", item.hook],
      ["CTA", item.cta]
    ].forEach(([label, value]) => {
      const paragraph = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = `${label}: `;
      paragraph.append(strong, document.createTextNode(value));
      summary.appendChild(paragraph);
    });

    const actions = document.createElement("div");
    actions.className = "history-card-actions";

    const pinButton = document.createElement("button");
    pinButton.className = "history-action-btn pin-btn";
    pinButton.classList.toggle("is-active", item.pinned);
    pinButton.type = "button";
    pinButton.dataset.action = "pin";
    pinButton.dataset.historyId = item.id;
    pinButton.textContent = item.pinned ? "Unpin" : "Pin";

    const loadButton = document.createElement("button");
    loadButton.className = "history-action-btn";
    loadButton.type = "button";
    loadButton.dataset.action = "load";
    loadButton.dataset.historyId = item.id;
    loadButton.textContent = "Load Again";

    const duplicateButton = document.createElement("button");
    duplicateButton.className = "history-action-btn";
    duplicateButton.type = "button";
    duplicateButton.dataset.action = "duplicate";
    duplicateButton.dataset.historyId = item.id;
    duplicateButton.textContent = "Duplicate";

    const deleteButton = document.createElement("button");
    deleteButton.className = "history-action-btn delete-btn";
    deleteButton.type = "button";
    deleteButton.dataset.action = "delete";
    deleteButton.dataset.historyId = item.id;
    deleteButton.textContent = "Delete";

    actions.append(pinButton, loadButton, duplicateButton, deleteButton);
    article.append(top, summary, actions);
    savedList.appendChild(article);
  });
}

function refreshDashboard() {
  const history = getSavedHistory();
  const lastContent = currentContent || history[0] || null;
  const pinnedCount = history.filter((item) => item.pinned).length;
  const tiktokCount = history.filter((item) => item.platform === "TikTok").length;
  const youtubeCount = history.filter((item) => item.platform === "YouTube Shorts").length;
  const instagramCount = history.filter((item) => item.platform === "Instagram Reels").length;

  dashboardTotalGenerations.textContent = String(getTotalGenerations());
  dashboardSavedItems.textContent = String(history.length);
  dashboardPinnedItems.textContent = String(pinnedCount);
  dashboardLastPlatform.textContent = lastContent?.platform || "No data";
  dashboardLastLanguage.textContent = lastContent?.language || "No data";
  dashboardTikTokGenerations.textContent = String(tiktokCount);
  dashboardYouTubeGenerations.textContent = String(youtubeCount);
  dashboardInstagramGenerations.textContent = String(instagramCount);
}

function saveGeneration(content) {
  const history = getSavedHistory();
  const nextHistory = [normalizeContent(content), ...history].slice(0, HISTORY_LIMIT);
  setSavedHistory(nextHistory);
  setTotalGenerations(getTotalGenerations() + 1);
  renderSavedHistory();
  refreshDashboard();
}

function activateTab(tabName, options = {}) {
  const { scrollTarget = null } = options;
  activeTab = tabName;

  tabButtons.forEach((button) => {
    const isActive = button.dataset.tabTarget === tabName;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  tabPanels.forEach((panel) => {
    const isActive = panel.dataset.tabPanel === tabName;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });

  if (scrollTarget) {
    scrollTarget.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function exportCurrentContent() {
  if (!currentContent) {
    showToast("Nothing to export yet.");
    return;
  }

  const fileName = `${currentContent.title.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").toLowerCase() || "trend2short-output"}.txt`;
  const text = [
    "Trend2Short AI",
    "",
    `Trend: ${currentContent.title}`,
    `Platform: ${currentContent.platform}`,
    `Language: ${currentContent.language}`,
    `Style: ${currentContent.style}`,
    "",
    "Video Idea:",
    currentContent.idea,
    "",
    "Hook:",
    currentContent.hook,
    "",
    "Script:",
    currentContent.script,
    "",
    "Caption:",
    currentContent.caption,
    "",
    "Hashtags:",
    currentContent.hashtags,
    "",
    "CTA:",
    currentContent.cta
  ].join("\n");

  downloadTextFile(fileName, text);
  showToast("TXT exported.");
}

function downloadTextFile(fileName, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  window.__trend2shortLastExport = { fileName, text };

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    await navigator.clipboard.writeText(text);
    return;
  }

  const tempTextArea = document.createElement("textarea");
  tempTextArea.value = text;
  tempTextArea.setAttribute("readonly", "");
  tempTextArea.style.position = "absolute";
  tempTextArea.style.left = "-9999px";
  document.body.appendChild(tempTextArea);
  tempTextArea.select();
  document.execCommand("copy");
  document.body.removeChild(tempTextArea);
}

async function handleCopy(targetId) {
  const target = document.getElementById(targetId);
  const text = target?.textContent?.trim() || "";

  if (!text) {
    showToast("Nothing to copy yet.");
    return;
  }

  try {
    await copyTextToClipboard(text);
    window.__trend2shortLastCopied = text;
    showToast("Copied!");
  } catch (error) {
    showToast("Copy failed.");
  }
}

function handleGeneration(options = {}) {
  const { persist = true } = options;
  const content = generateContent(
    trendTopicInput.value,
    platformSelect.value,
    languageSelect.value,
    styleSelect.value
  );

  renderContent(content);

  if (persist) {
    saveGeneration(content);
  }
}

function findHistoryItemById(id) {
  return getSavedHistory().find((item) => item.id === id) || null;
}

function handleLoadAgain(id) {
  const item = findHistoryItemById(id);

  if (!item) {
    showToast("Saved item not found.");
    return;
  }

  populateFormFromContent(item);
  renderContent(item);
  activateTab("generator", { scrollTarget: workspaceTabsSection });
  trendTopicInput.focus();
  showToast("Loaded in Generator.");
}

function handleDeleteHistoryItem(id) {
  const nextHistory = getSavedHistory().filter((item) => item.id !== id);
  setSavedHistory(nextHistory);
  renderSavedHistory();
  refreshDashboard();
  showToast("Saved item deleted.");
}

function handleTogglePin(id) {
  const nextHistory = getSavedHistory().map((item) => {
    if (item.id !== id) {
      return item;
    }

    return {
      ...item,
      pinned: !item.pinned
    };
  });

  setSavedHistory(nextHistory);
  renderSavedHistory();
  refreshDashboard();
  showToast("Pin status updated.");
}

function handleDuplicateHistoryItem(id) {
  const sourceItem = findHistoryItemById(id);

  if (!sourceItem) {
    showToast("Saved item not found.");
    return;
  }

  const duplicateItem = normalizeContent({
    ...sourceItem,
    id: createId(),
    pinned: false,
    createdAt: new Date().toISOString()
  });

  const nextHistory = [duplicateItem, ...getSavedHistory()].slice(0, HISTORY_LIMIT);
  setSavedHistory(nextHistory);
  renderSavedHistory();
  refreshDashboard();
  showToast("Saved item duplicated.");
}

function clearHistory() {
  window.localStorage.removeItem(STORAGE_KEY);
  renderSavedHistory();
  refreshDashboard();
  showToast("History cleared.");
}

function initializeView() {
  ensureSeedData();
  const history = getSavedHistory();

  if (history.length > 0) {
    populateFormFromContent(history[0]);
    renderContent(history[0]);
  } else {
    renderContent(generateContent(
      trendTopicInput.value,
      platformSelect.value,
      languageSelect.value,
      styleSelect.value
    ));
  }

  renderSavedHistory();
  refreshDashboard();
  activateTab("generator");

  const pendingTrend = window.localStorage.getItem(PENDING_TREND_KEY);
  if (pendingTrend) {
    trendTopicInput.value = pendingTrend;
    window.localStorage.removeItem(PENDING_TREND_KEY);
    activateTab("generator");
  }
}

trendForm.addEventListener("submit", (event) => {
  event.preventDefault();
  handleGeneration({ persist: true });
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activateTab(button.dataset.tabTarget, { scrollTarget: workspaceTabsSection });
  });
});

startGeneratingBtn.addEventListener("click", () => {
  activateTab("generator", { scrollTarget: workspaceTabsSection });
  trendTopicInput.focus();
});

viewExamplesBtn.addEventListener("click", () => {
  window.location.href = "examples.html";
});

useTrendButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activateTab("generator", { scrollTarget: generatorSection });
    trendTopicInput.value = button.dataset.trend || "";
    trendTopicInput.focus();
  });
});

copyButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    await handleCopy(button.dataset.copyTarget);
  });
});

savedList.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");

  if (!target) {
    return;
  }

  const { action, historyId } = target.dataset;

  if (action === "load") {
    handleLoadAgain(historyId);
  }

  if (action === "pin") {
    handleTogglePin(historyId);
  }

  if (action === "duplicate") {
    handleDuplicateHistoryItem(historyId);
  }

  if (action === "delete") {
    handleDeleteHistoryItem(historyId);
  }
});

historySearchInput.addEventListener("input", () => {
  renderSavedHistory();
});

historyFilterSelect.addEventListener("change", () => {
  renderSavedHistory();
});

comingSoonButtons.forEach((button) => {
  button.addEventListener("click", () => {
    window.alert("Pricing and account features are planned for a future version.");
  });
});

exportTxtBtn.addEventListener("click", exportCurrentContent);
clearHistoryBtn.addEventListener("click", clearHistory);

initializeView();
