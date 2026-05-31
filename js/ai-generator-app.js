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
  const usageLimit = root.querySelector("#aiUsageLimit");
  const providerValue = root.querySelector("#aiProviderValue");
  const modeValue = root.querySelector("#aiModeValue");
  const apiStatusValue = root.querySelector("#aiApiStatusValue");
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
  const resetDemoDataBtn = root.querySelector("#resetDemoDataBtn");
  const copyButtons = root.querySelectorAll(".ai-copy-btn");
  const toast = document.querySelector("[data-ai-toast]") || document.getElementById("toast");

  let toastTimeoutId = null;

  function getModeNoticeText(status) {
    if (!status) {
      return "Running in Demo Mode";
    }

    if (status.mode === "Live" && status.apiStatus === "Ready") {
      return "Gemini Live Mode";
    }

    if (status.apiStatus === "Missing Key") {
      return "Running in Demo Mode";
    }

    if (status.apiStatus === "Connection Error" || status.apiStatus === "API Unavailable") {
      return "Demo Fallback Active";
    }

    return "Running in Demo Mode";
  }

  function updateUsageCounter() {
    usageCount.textContent = String(service.getTodayUsage());
    if (usageLimit) {
      usageLimit.textContent = String(service.getDailyLimit());
    }
  }

  async function updateStatus(partial = null) {
    const status = partial || await service.getStatus();
    providerValue.textContent = status.providerLabel || "Gemini";
    modeValue.textContent = status.mode || "Demo";
    apiStatusValue.textContent = status.apiStatus || "Missing Key";
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
      INVALID_RESPONSE: "Invalid Response",
      API_UNAVAILABLE: "API Unavailable",
      RATE_LIMIT: "Daily AI limit reached."
    };

    const fallbackText = detail ? `API Error: ${detail}` : "API Error";
    const text = code === "RATE_LIMIT"
      ? labels.RATE_LIMIT
      : detail
        ? `${labels[code] || "API Error"}: ${detail}`
        : (labels[code] || fallbackText);

    errorState.hidden = false;
    errorState.textContent = text;
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
    if (resetDemoDataBtn) {
      resetDemoDataBtn.disabled = isLoading;
    }
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
      showModeNotice(result.message || getModeNoticeText(result));
      updateUsageCounter();
      await updateStatus({
        providerLabel: result.providerLabel,
        mode: result.mode,
        apiStatus: result.apiStatus
      });
      window.__trend2shortAiTestState = {
        ...(window.__trend2shortAiTestState || {}),
        lastMode: result.mode,
        lastProvider: result.provider,
        lastUsageCount: result.usageCount
      };
    } catch (error) {
      const code = error?.code || "API_ERROR";
      showError(code, error?.message || "");
      await updateStatus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResetDemoData() {
    service.resetDemoData();
    updateUsageCounter();
    clearError();
    topicInput.value = "AI tools for teachers";
    platformSelect.value = "TikTok";
    languageSelect.value = "English";
    styleSelect.value = "Educational";
    renderContent(service.createPreviewContent(getInput()));
    const status = await service.getStatus();
    await updateStatus(status);
    showModeNotice(status.mode === "Live" ? "Gemini Live Mode" : "Running in Demo Mode");
    showToast("Demo data reset.");
  }

  async function initialize() {
    updateUsageCounter();
    const status = await service.getStatus();
    await updateStatus(status);

    const pendingTrend = window.localStorage.getItem(pendingTrendKey);
    if (pendingTrend) {
      topicInput.value = pendingTrend;
      window.localStorage.removeItem(pendingTrendKey);
    }

    renderContent(service.createPreviewContent(getInput()));
    showModeNotice(getModeNoticeText(status));
  }

  form.addEventListener("submit", handleSubmit);

  if (resetDemoDataBtn) {
    resetDemoDataBtn.addEventListener("click", () => {
      handleResetDemoData().catch((error) => {
        showError("API_ERROR", error?.message || "Unable to reset demo data.");
      });
    });
  }

  copyButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      await handleCopy(button.dataset.copyTarget);
    });
  });

  initialize().catch((error) => {
    showError("API_ERROR", error?.message || "Unable to initialize AI generator.");
  });
})();
