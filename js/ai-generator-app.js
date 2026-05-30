(function () {
  const service = window.Trend2ShortAIService;
  const pendingTrendKey = "trend2short-pending-trend";

  if (!service) {
    return;
  }

  const root = document.querySelector("[data-ai-generator-root]");

  if (!root) {
    return;
  }

  const form = root.querySelector("#aiTrendForm");
  const topicInput = root.querySelector("#aiTrendTopic");
  const platformSelect = root.querySelector("#aiPlatform");
  const languageSelect = root.querySelector("#aiLanguage");
  const styleSelect = root.querySelector("#aiStyle");
  const usageCount = root.querySelector("#aiUsageCount");
  const resultTitle = root.querySelector("#aiResultTitle");
  const resultMeta = root.querySelector("#aiResultMeta");
  const hook = root.querySelector("#aiHook");
  const videoIdea = root.querySelector("#aiVideoIdea");
  const shortScript = root.querySelector("#aiShortScript");
  const caption = root.querySelector("#aiCaption");
  const hashtags = root.querySelector("#aiHashtags");
  const cta = root.querySelector("#aiCta");
  const modeNotice = root.querySelector("#aiModeNotice");
  const loadingState = root.querySelector("#aiLoadingState");
  const errorState = root.querySelector("#aiErrorState");
  const generateButton = root.querySelector("#aiGenerateBtn");
  const copyButtons = root.querySelectorAll(".ai-copy-btn");
  const toast = document.querySelector("[data-ai-toast]") || document.getElementById("toast");

  let toastTimeoutId = null;

  function updateUsageCounter() {
    usageCount.textContent = String(service.getTodayUsage());
  }

  function showToast(message) {
    if (!toast) {
      return;
    }

    toast.textContent = message;
    toast.classList.add("is-visible");

    if (toastTimeoutId) {
      window.clearTimeout(toastTimeoutId);
    }

    toastTimeoutId = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 1700);
  }

  function showModeNotice(message) {
    if (!message) {
      modeNotice.hidden = true;
      modeNotice.textContent = "";
      return;
    }

    modeNotice.hidden = false;
    modeNotice.textContent = message;
  }

  function showError(code, detail) {
    const labels = {
      EMPTY_INPUT: "Empty Input",
      NETWORK_ERROR: "Network Error",
      API_ERROR: "API Error",
      INVALID_RESPONSE: "Invalid Response"
    };

    const title = labels[code] || "API Error";
    errorState.hidden = false;
    errorState.textContent = detail ? `${title}: ${detail}` : title;
    window.__trend2shortAiTestState = {
      ...(window.__trend2shortAiTestState || {}),
      lastErrorCode: code,
      lastErrorText: errorState.textContent
    };
  }

  function clearError() {
    errorState.hidden = true;
    errorState.textContent = "";
  }

  function setLoading(isLoading) {
    loadingState.hidden = !isLoading;
    generateButton.disabled = isLoading;
  }

  function renderContent(content) {
    resultTitle.textContent = content.title;
    resultMeta.textContent = content.meta;
    hook.textContent = content.hook;
    videoIdea.textContent = content.videoIdea;
    shortScript.textContent = content.shortScript;
    caption.textContent = content.caption;
    hashtags.textContent = content.hashtags;
    cta.textContent = content.cta;

    window.__trend2shortAiTestState = {
      ...(window.__trend2shortAiTestState || {}),
      lastErrorCode: null,
      lastResult: content
    };
  }

  function getInput() {
    return {
      topic: topicInput.value,
      platform: platformSelect.value,
      language: languageSelect.value,
      style: styleSelect.value
    };
  }

  async function copyText(text) {
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
    const target = root.querySelector(`#${targetId}`);
    const value = target?.textContent?.trim() || "";

    if (!value) {
      showToast("Nothing to copy yet.");
      return;
    }

    try {
      await copyText(value);
      showToast("Copied!");
      window.__trend2shortAiLastCopied = value;
    } catch (error) {
      showToast("Copy failed.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    clearError();
    setLoading(true);

    try {
      const result = await service.generate(getInput());
      renderContent(result.content);
      showModeNotice(result.message);
      updateUsageCounter();
      window.__trend2shortAiTestState = {
        ...(window.__trend2shortAiTestState || {}),
        lastMode: result.mode,
        lastProvider: result.provider,
        lastUsageCount: result.usageCount
      };
    } catch (error) {
      const code = error?.code || "API_ERROR";
      showError(code, error?.message || "");
    } finally {
      setLoading(false);
    }
  }

  async function initialize() {
    updateUsageCounter();
    await service.ensureReady();

    const pendingTrend = window.localStorage.getItem(pendingTrendKey);
    if (pendingTrend) {
      topicInput.value = pendingTrend;
      window.localStorage.removeItem(pendingTrendKey);
    }

    const previewContent = service.createPreviewContent(getInput());
    renderContent(previewContent);

    const settings = await service.getSettings();
    if (!settings.API_KEY) {
      showModeNotice("Running in Demo Mode");
    }
  }

  form.addEventListener("submit", handleSubmit);

  copyButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      await handleCopy(button.dataset.copyTarget);
    });
  });

  initialize().catch((error) => {
    showError("API_ERROR", error?.message || "Unable to initialize AI generator.");
  });
})();
