const GEMINI_MODEL = "gemini-2.5-flash";

class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

function sendJson(res, status, payload) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(status).json(payload);
  }

  res.statusCode = status;
  if (typeof res.setHeader === "function") {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
  } else {
    res.headers = {
      ...(res.headers || {}),
      "Content-Type": "application/json; charset=utf-8"
    };
  }

  const body = JSON.stringify(payload);
  if (typeof res.end === "function") {
    res.end(body);
  } else {
    res.body = body;
  }

  return payload;
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
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

function pickHook(language, topic) {
  const hooks = languageProfiles[language].hooks;
  return hooks[topic.length % hooks.length].replace("{topic}", topic);
}

function createDemoContent(input) {
  const topic = getCleanTopic(input.trend);
  const platform = input.platform;
  const language = input.language;
  const style = input.style;

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
    cta: languageProfile.cta
  };
}

function extractJsonCandidate(rawText) {
  const trimmed = String(rawText || "").trim();

  if (!trimmed) {
    throw new ApiError(502, "INVALID_GEMINI_JSON_RESPONSE", "Gemini returned an empty response.");
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

function parseStrictJsonPayload(rawText) {
  const jsonText = extractJsonCandidate(rawText);
  const parsed = safeJsonParse(jsonText, null);

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new ApiError(502, "INVALID_GEMINI_JSON_RESPONSE", "Gemini returned invalid JSON.");
  }

  const requiredKeys = ["hook", "videoIdea", "shortScript", "caption", "hashtags", "cta"];
  for (const key of requiredKeys) {
    if (!String(parsed[key] || "").trim()) {
      throw new ApiError(502, "INVALID_GEMINI_JSON_RESPONSE", `Gemini JSON is missing ${key}.`);
    }
  }

  return {
    hook: String(parsed.hook).trim(),
    videoIdea: String(parsed.videoIdea).trim(),
    shortScript: String(parsed.shortScript).trim(),
    caption: String(parsed.caption).trim(),
    hashtags: String(parsed.hashtags).trim(),
    cta: String(parsed.cta).trim()
  };
}

function buildGeminiPrompt(input) {
  return [
    "Generate short-form video marketing content for Trend2Short AI.",
    `Trend Topic: ${input.trend}`,
    `Platform: ${input.platform}`,
    `Language: ${input.language}`,
    `Style: ${input.style}`,
    "Return JSON only with these keys exactly:",
    "{\"hook\":\"\",\"videoIdea\":\"\",\"shortScript\":\"\",\"caption\":\"\",\"hashtags\":\"\",\"cta\":\"\"}",
    "Requirements:",
    "- Match the requested language exactly.",
    "- Keep hook concise and strong.",
    "- Keep videoIdea to one clear sentence.",
    "- Keep shortScript compact and ready to narrate.",
    "- Keep hashtags as a single string with space-separated hashtags.",
    "- Do not include markdown, code fences, or explanations."
  ].join("\n");
}

function buildGeminiBody(input) {
  return {
    system_instruction: {
      parts: [
        {
          text: "You are Trend2Short AI. Return valid JSON only. Do not wrap the JSON in markdown."
        }
      ]
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: buildGeminiPrompt(input)
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          hook: { type: "STRING" },
          videoIdea: { type: "STRING" },
          shortScript: { type: "STRING" },
          caption: { type: "STRING" },
          hashtags: { type: "STRING" },
          cta: { type: "STRING" }
        },
        required: ["hook", "videoIdea", "shortScript", "caption", "hashtags", "cta"]
      }
    }
  };
}

async function parseGeminiHttpError(response) {
  const rawText = await response.text();
  const parsed = safeJsonParse(rawText, null);
  const apiMessage = parsed?.error?.message;
  return apiMessage || `Gemini request failed with status ${response.status}.`;
}

function extractGeminiText(payload) {
  const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();

  if (text) {
    return text;
  }

  const blockReason = payload?.promptFeedback?.blockReason;
  if (blockReason) {
    throw new ApiError(502, "GEMINI_API_ERROR", `Gemini blocked the request: ${blockReason}.`);
  }

  throw new ApiError(502, "INVALID_GEMINI_JSON_RESPONSE", "Gemini returned no usable text.");
}

function validateInput(input) {
  const trend = getCleanTopic(input?.trend);
  const platform = String(input?.platform || "").trim();
  const language = String(input?.language || "").trim();
  const style = String(input?.style || "").trim();

  if (!trend) {
    throw new ApiError(400, "INVALID_INPUT", "trend is required.");
  }

  if (!platform) {
    throw new ApiError(400, "INVALID_INPUT", "platform is required.");
  }

  if (!language) {
    throw new ApiError(400, "INVALID_INPUT", "language is required.");
  }

  if (!style) {
    throw new ApiError(400, "INVALID_INPUT", "style is required.");
  }

  return { trend, platform, language, style };
}

async function parseBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    return safeJsonParse(req.body, {});
  }

  if (typeof req.body === "undefined") {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(Buffer.from(chunk));
    }

    if (chunks.length === 0) {
      return {};
    }

    return safeJsonParse(Buffer.concat(chunks).toString("utf8"), {});
  }

  return {};
}

async function callGemini(input, apiKey, fetchImpl) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify(buildGeminiBody(input))
  });

  if (!response.ok) {
    throw new ApiError(502, "GEMINI_API_ERROR", await parseGeminiHttpError(response));
  }

  const payload = await response.json();
  const parsed = parseStrictJsonPayload(extractGeminiText(payload));

  return {
    title: input.trend,
    meta: buildMeta(input.platform, input.language, input.style),
    ...parsed
  };
}

async function handler(req, res) {
  if (req.method !== "POST") {
    if (typeof res.setHeader === "function") {
      res.setHeader("Allow", "POST");
    }
    return sendJson(res, 405, {
      ok: false,
      code: "METHOD_NOT_ALLOWED",
      message: "Method Not Allowed"
    });
  }

  try {
    const body = await parseBody(req);
    const input = validateInput(body);
    const apiKey = String(process.env.GEMINI_API_KEY || "").trim();

    if (!apiKey) {
      return sendJson(res, 200, {
        ok: true,
        provider: "Gemini",
        mode: "Demo",
        apiStatus: "Missing Key",
        demoMode: true,
        message: "Running in Demo Mode"
      });
    }

    const content = await callGemini(input, apiKey, globalThis.fetch);

    return sendJson(res, 200, {
      ok: true,
      provider: "Gemini",
      mode: "Live",
      apiStatus: "Ready",
      demoMode: false,
      message: "Gemini Live Mode",
      content
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return sendJson(res, error.status, {
        ok: false,
        code: error.code,
        message: error.message
      });
    }

    return sendJson(res, 500, {
      ok: false,
      code: "GEMINI_API_ERROR",
      message: error?.message || "Gemini API Error"
    });
  }
}

module.exports = handler;
module.exports.__internals = {
  ApiError,
  createDemoContent,
  parseStrictJsonPayload,
  validateInput,
  callGemini,
  buildGeminiBody
};
