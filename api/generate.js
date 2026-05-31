const GEMINI_MODEL = "gemini-2.5-flash";

class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

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

function buildMeta(platform, language, style) {
  return `${platform} | ${language} | ${style}`;
}

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

  const unique = [...new Set(tags.filter(Boolean))];
  return unique.slice(0, 8).join(" ");
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
  const topic = input.trend;
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
      hashtags: buildFallbackHashtags(topic, input.platform, input.style, input.language, ["#Tendance", "#IdéeVidéo"]),
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
      videoIdea: `فيديو قصير بأسلوب ${input.style === "Educational" ? "تعليمي" : input.style === "Professional" ? "مهني" : input.style === "Storytelling" ? "قصصي" : "سريع"} يشرح ${topic} من زاوية واضحة وأمثلة قريبة من الواقع.`,
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

function createDemoContent(input) {
  const topic = getCleanTopic(input.trend);
  const preset = getTopicPreset(topic);

  if (preset === "teachers") {
    if (input.language === "French") {
      return {
        title: topic,
        meta: buildMeta(input.platform, input.language, input.style),
        hook: "Trois outils d’IA peuvent aider les enseignants à préparer leurs cours en deux fois moins de temps.",
        videoIdea: "Une courte vidéo qui montre comment MagicSchool, Canva et Quizizz AI peuvent alléger la préparation des cours.",
        shortScript: "Aujourd’hui, voici trois outils d’IA que les enseignants peuvent utiliser pour gagner du temps. MagicSchool aide à structurer un plan de cours en quelques minutes. Canva peut transformer une idée en support visuel clair pour la classe. Quizizz AI permet de créer rapidement des questions et des révisions. Le but n’est pas de remplacer l’enseignant, mais de réduire les tâches répétitives pour consacrer plus de temps aux élèves et à l’accompagnement pédagogique.",
        caption: "Ces outils d’IA peuvent vraiment alléger la préparation des cours sans compliquer le travail des enseignants.",
        hashtags: "#OutilsIA #Enseignants #EdTech #PreparationDeCours #Professeurs #TikTokEducatif",
        cta: "Sauvegarde cette vidéo pour tester ces outils plus tard.",
        audience: "Enseignants et créateurs de contenu éducatif"
      };
    }

    if (input.language === "Arabic") {
      return {
        title: topic,
        meta: buildMeta(input.platform, input.language, input.style),
        hook: "ثلاث أدوات ذكاء اصطناعي يمكن أن تساعد المعلمين على تحضير الدروس في وقت أقل بكثير.",
        videoIdea: "فيديو قصير يوضح كيف يمكن للمعلمين استخدام MagicSchool وCanva وQuizizz AI لتخفيف وقت التحضير.",
        shortScript: "اليوم لدينا ثلاث أدوات ذكاء اصطناعي يمكن أن تساعد المعلمين بشكل عملي. أداة MagicSchool تساعد في بناء خطة درس أو نشاط صفّي بسرعة. Canva تجعل تحويل الفكرة إلى عرض بصري أو ورقة عمل أسهل بكثير. أما Quizizz AI فيمكنه تسريع إعداد الأسئلة والمراجعات للطلاب. الفكرة ليست استبدال المعلم، بل تقليل الوقت الضائع في المهام المتكررة حتى يبقى وقت أكبر للشرح والمتابعة ودعم الطلاب داخل الفصل.",
        caption: "إذا كان تحضير الدروس يستهلك وقتك كل أسبوع، فهذه الأدوات قد تجعل العملية أخف وأكثر سرعة.",
        hashtags: "#أدوات_الذكاء_الاصطناعي #المعلمون #تقنية_التعليم #تحضير_الدروس #أدوات_الفصل #تيك_توك",
        cta: "احفظ هذا الفيديو وجرّب أداة واحدة قبل حصتك القادمة.",
        audience: "المعلمون وصناع المحتوى التعليمي"
      };
    }

    return {
      title: topic,
      meta: buildMeta(input.platform, input.language, input.style),
      hook: "Three AI tools can help teachers plan lessons and classroom content in half the time.",
      videoIdea: "A short video showing how teachers can use MagicSchool, Canva, and Quizizz AI to prepare faster.",
      shortScript: "Today, here are three AI tools that can genuinely help teachers save time. MagicSchool can draft lesson outlines and classroom prompts in minutes. Canva helps turn a rough idea into clear slides or worksheets without starting from scratch. Quizizz AI can quickly build quizzes and revision questions for the class. The goal is not to replace the teacher. It is to cut repetitive prep work so more time goes into teaching, feedback, and supporting students.",
      caption: "If lesson prep is eating up your week, these tools can make the workload much lighter without overcomplicating your workflow.",
      hashtags: "#AIToolsForTeachers #EdTech #TeacherTips #LessonPlanning #ClassroomTools #TikTokEducation",
      cta: "Save this video and test one of these tools before your next class.",
      audience: "Teachers and educational content creators"
    };
  }

  if (preset === "starlink-morocco") {
    if (input.language === "French") {
      return {
        title: topic,
        meta: buildMeta(input.platform, input.language, input.style),
        hook: "Starlink pourrait améliorer l’accès à Internet au Maroc, mais le prix et le cadre réglementaire restent décisifs.",
        videoIdea: "Une courte vidéo qui explique ce que Starlink pourrait changer au Maroc en matière de couverture, de coût et d’usage.",
        shortScript: "Aujourd’hui, parler de Starlink au Maroc ne consiste pas seulement à parler de vitesse. La vraie question est de savoir qui pourrait en profiter et à quel prix. Dans les zones éloignées où la connexion reste limitée, une offre satellite peut représenter une solution concrète. Mais il faut aussi regarder le coût de l’équipement, l’abonnement mensuel et le cadre réglementaire. Si ces éléments deviennent accessibles, Starlink peut ouvrir une nouvelle option pour les foyers, les entrepreneurs et les créateurs hors des grands centres urbains.",
        caption: "Starlink peut être une vraie opportunité pour certaines zones du Maroc, mais tout dépendra du coût final et de la mise en place locale.",
        hashtags: "#Starlink #Maroc #InternetSatellite #TechMaroc #ActualiteTech #YouTubeShorts",
        cta: "Abonne-toi pour suivre les prochaines mises à jour sur ce sujet.",
        audience: "Personnes intéressées par la technologie et la connectivité au Maroc"
      };
    }

    if (input.language === "Arabic") {
      return {
        title: topic,
        meta: buildMeta(input.platform, input.language, input.style),
        hook: "ستارلينك قد تغيّر شكل الإنترنت في المناطق البعيدة بالمغرب، لكن السعر والتنظيم هما العامل الحاسم.",
        videoIdea: "فيديو قصير يشرح ما الذي قد تضيفه ستارلينك للمغرب من حيث التغطية والتكلفة وفرص الاستخدام.",
        shortScript: "اليوم، الحديث عن ستارلينك في المغرب لا يتعلق فقط بسرعة الإنترنت، بل بمن يمكنه الاستفادة منها فعلًا. الميزة الكبرى هي إمكانية تحسين الاتصال في المناطق البعيدة التي تعاني من ضعف الشبكة الأرضية. لكن في المقابل، يبقى السؤال حول تكلفة الاشتراك والمعدات، إضافة إلى الجانب التنظيمي والترخيص. إذا دخلت الخدمة بشكل واضح وبسعر معقول، فقد تصبح خيارًا مهمًا للأسر، ورواد الأعمال، وصناع المحتوى خارج المدن الكبرى.",
        caption: "ستارلينك قد تكون فرصة مهمة لتحسين الاتصال في بعض مناطق المغرب، لكن القرار الحقيقي سيعتمد على السعر والتنظيم.",
        hashtags: "#ستارلينك #المغرب #الإنترنت_الفضائي #أخبار_التقنية #يوتيوب_شورتس #اتصال_رقمي",
        cta: "احفظ هذا الفيديو إذا كنت تريد متابعة جديد ستارلينك في المغرب.",
        audience: "المهتمون بالتقنية والاتصال الرقمي في المغرب"
      };
    }

    return {
      title: topic,
      meta: buildMeta(input.platform, input.language, input.style),
      hook: "Starlink could expand internet access in Morocco, but pricing and regulation will decide its real impact.",
      videoIdea: "A short video explaining how Starlink could affect coverage, cost, and digital access in Morocco.",
      shortScript: "Today, the real conversation around Starlink in Morocco is not just about faster internet. It is about who could benefit and whether the service becomes affordable enough to matter. In remote areas where traditional coverage is still weak, satellite internet could be a practical option. But the important questions are still the equipment cost, monthly pricing, and local regulation. If those pieces align, Starlink could become a meaningful choice for households, entrepreneurs, and creators outside major cities.",
      caption: "Starlink could be a real connectivity upgrade for parts of Morocco, but the final impact depends on cost and rollout conditions.",
      hashtags: "#Starlink #Morocco #SatelliteInternet #TechNews #DigitalAccess #YouTubeShorts",
      cta: "Subscribe if you want more short tech explainers like this.",
      audience: "Tech audiences and digital access watchers in Morocco"
    };
  }

  if (preset === "student-money") {
    if (input.language === "French") {
      return {
        title: topic,
        meta: buildMeta(input.platform, input.language, input.style),
        hook: "Un étudiant peut économiser chaque mois en corrigeant seulement trois habitudes simples.",
        videoIdea: "Un Reel narratif qui montre comment de petits choix quotidiens peuvent aider les étudiants à garder plus d’argent.",
        shortScript: "Quand on est étudiant, l’argent ne disparaît pas toujours dans une grosse dépense. Il part souvent dans les cafés, les livraisons et les abonnements oubliés. Ce qui change vraiment la situation, c’est de suivre ses dépenses pendant une semaine, de fixer un budget repas avant le début du mois et de supprimer ce qui n’est pas essentiel. Ces gestes paraissent petits, mais ils libèrent rapidement une vraie marge. Économiser quand on est étudiant, c’est souvent repérer les petites fuites avant qu’elles ne deviennent une habitude.",
        caption: "Le budget étudiant se casse rarement sur une grosse dépense. Ce sont souvent les petites habitudes qui coûtent le plus à la fin du mois.",
        hashtags: "#BudgetEtudiant #Economiser #VieEtudiante #Argent #HabitudesFinancieres #InstagramReels",
        cta: "Enregistre ce Reel si tu veux plus d’idées simples pour mieux gérer ton budget.",
        audience: "Étudiants et créateurs de contenu lifestyle étudiant"
      };
    }

    if (input.language === "Arabic") {
      return {
        title: topic,
        meta: buildMeta(input.platform, input.language, input.style),
        hook: "الطالب يستطيع توفير مبلغ حقيقي كل شهر إذا أصلح ثلاث عادات مالية صغيرة.",
        videoIdea: "فيديو قصير بأسلوب قصصي يوضح كيف تساعد تغييرات بسيطة الطلاب على الاحتفاظ بمال أكثر.",
        shortScript: "عندما يكون الطالب تحت ضغط المصاريف، لا يضيع المال غالبًا في عملية شراء كبيرة واحدة، بل في قهوة يومية، وتوصيل متكرر، واشتراكات لا تُستخدم. الفرق يبدأ عندما تتابع مصروفك لأسبوع واحد، وتحدد ميزانية واضحة للأكل، وتلغي أي خدمة لا تحتاجها فعلًا. هذه خطوات بسيطة، لكنها تصنع فارقًا حقيقيًا مع نهاية الشهر. التوفير للطالب ليس حرمانًا دائمًا، بل وعيًا بالمصاريف الصغيرة التي تتكرر من دون أن ننتبه لها.",
        caption: "معظم الميزانيات الطلابية لا تنهار بسبب مصروف كبير واحد، بل بسبب عادات صغيرة تتكرر كل يوم.",
        hashtags: "#توفير_للطلبة #ميزانية_طالب #نصائح_مالية #حياة_الطالب #مصروف_شخصي #ريلز",
        cta: "تابعني للمزيد من أفكار المحتوى القصير المفيدة للطلاب.",
        audience: "الطلاب وصناع محتوى الحياة الجامعية"
      };
    }

    return {
      title: topic,
      meta: buildMeta(input.platform, input.language, input.style),
      hook: "A student can save real money every month by fixing just three spending habits.",
      videoIdea: "A story-driven Reel about how small daily choices can help students keep more money without feeling restricted.",
      shortScript: "When I was a student, the money never disappeared in one big purchase. It went on coffee, delivery, and subscriptions I barely used. What changed everything was tracking my spending for one week, setting a food budget before the month started, and cancelling anything that was not essential. None of those changes felt dramatic, but together they freed up real money. Saving as a student is usually less about earning more and more about noticing where small leaks happen every day.",
      caption: "Most student budgets do not break because of one big expense. They break because of small habits that add up quietly.",
      hashtags: "#StudentMoneyTips #BudgetingForStudents #SaveMoney #StudentLife #MoneyHabits #InstagramReels",
      cta: "Follow for more short-form content ideas you can actually use.",
      audience: "Students and student lifestyle creators"
    };
  }

  return buildGeneralContent(input);
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

  return {
    hook: String(parsed.hook || "").trim(),
    videoIdea: String(parsed.videoIdea || "").trim(),
    shortScript: String(parsed.shortScript || "").trim(),
    caption: String(parsed.caption || "").trim(),
    hashtags: String(parsed.hashtags || "").trim(),
    cta: String(parsed.cta || "").trim(),
    audience: String(parsed.audience || "").trim()
  };
}

function mergeContentWithFallback(parsedContent, fallbackContent) {
  return {
    hook: isWeakField("hook", parsedContent.hook) ? fallbackContent.hook : parsedContent.hook,
    videoIdea: isWeakField("videoIdea", parsedContent.videoIdea) ? fallbackContent.videoIdea : parsedContent.videoIdea,
    shortScript: isWeakField("shortScript", parsedContent.shortScript) ? fallbackContent.shortScript : parsedContent.shortScript,
    caption: isWeakField("caption", parsedContent.caption) ? fallbackContent.caption : parsedContent.caption,
    hashtags: normalizeHashtagString(parsedContent.hashtags, fallbackContent.hashtags),
    cta: isWeakField("cta", parsedContent.cta) ? fallbackContent.cta : parsedContent.cta,
    audience: isWeakField("audience", parsedContent.audience) ? fallbackContent.audience : parsedContent.audience
  };
}

function buildGeminiPrompt(input) {
  return [
    "You are generating final publish-ready short-form video content for Trend2Short AI.",
    `Trend Topic: ${input.trend}`,
    `Platform: ${input.platform}`,
    `Language: ${input.language}`,
    `Style: ${input.style}`,
    "Return JSON only with these keys exactly:",
    "{\"hook\":\"\",\"videoIdea\":\"\",\"shortScript\":\"\",\"caption\":\"\",\"hashtags\":\"\",\"cta\":\"\",\"audience\":\"\"}",
    "Strict rules:",
    "- Write the final content itself, not instructions about how to write it.",
    "- Do not write phrases like Start with, Begin by, Then explain, Commence par, Puis, Termine, or instructional equivalents.",
    "- Every field must be ready to copy and publish.",
    "- The hook must be specific, direct, and tied to the trend.",
    "- The videoIdea must be one concrete sentence, not a generic description.",
    "- The shortScript must be a real script between 60 and 120 words, written as natural spoken language.",
    "- The caption must feel natural for a short video post, not like an AI summary.",
    "- The hashtags must contain 5 to 8 full hashtags, relevant to the topic and the selected platform.",
    "- Avoid broken hashtags such as #aitoolsfor or overly generic hashtags only.",
    "- The CTA must fit the selected platform and language.",
    "- The audience field must be a short phrase describing who this content is for.",
    "- If the topic is broad, choose one concrete angle and include specific examples.",
    "- Do not use markdown, bullets, labels, code fences, or explanations outside the JSON.",
    input.language === "French"
      ? "- Write natural French with correct accents such as créateurs, idée, vidéo, éducatif, aujourd’hui, élèves, enseignants."
      : "-",
    input.language === "Arabic"
      ? "- Write clear Modern Standard Arabic. Do not mix Arabic with English except for platform or tool names."
      : "-",
    input.language === "English"
      ? "- Write natural English that sounds ready to narrate in a short video."
      : "-"
  ].filter((line) => line !== "-").join("\n");
}

function buildGeminiBody(input) {
  return {
    system_instruction: {
      parts: [
        {
          text: "You are Trend2Short AI. Produce valid JSON only. Every field must be publish-ready final copy, not writing instructions."
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
      temperature: 0.8,
      topP: 0.95,
      maxOutputTokens: 700,
      responseSchema: {
        type: "OBJECT",
        properties: {
          hook: { type: "STRING" },
          videoIdea: { type: "STRING" },
          shortScript: { type: "STRING" },
          caption: { type: "STRING" },
          hashtags: { type: "STRING" },
          cta: { type: "STRING" },
          audience: { type: "STRING" }
        },
        required: ["hook", "videoIdea", "shortScript", "caption", "hashtags", "cta", "audience"]
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
  const fallbackContent = createDemoContent(input);
  const parsed = parseStrictJsonPayload(extractGeminiText(payload));
  const merged = mergeContentWithFallback(parsed, fallbackContent);

  return {
    title: input.trend,
    meta: buildMeta(input.platform, input.language, input.style),
    ...merged
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
  buildGeminiBody,
  mergeContentWithFallback,
  buildFallbackHashtags,
  hasInstructionalLanguage
};
