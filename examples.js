const PENDING_TREND_KEY = "trend2short-pending-trend";

const EXAMPLES = [
  {
    id: "ai-tools-teachers",
    category: "AI",
    trend: "AI Tools For Teachers",
    videoIdea: "A short video showing how teachers can save time using simple AI tools.",
    hook: "Teachers are saving hours every week with these AI tools.",
    shortScript: "Many teachers spend hours preparing lessons, captions, and classroom content. With AI tools, they can generate ideas faster, organize lessons better, and create educational content in minutes.",
    caption: "Discover how AI tools can help teachers save time and create better educational content.",
    hashtags: "#AIForTeachers #EdTech #TeachingTools #Shorts #ContentCreation",
    cta: "Try Trend2Short AI and generate your first short video idea.",
    keywords: ["teachers", "edtech", "education", "lesson planning"]
  },
  {
    id: "ai-meeting-notes",
    category: "AI",
    trend: "AI Meeting Notes For Teams",
    videoIdea: "Show remote teams how AI note tools turn long meetings into clean action lists.",
    hook: "Your team meetings should not take longer to summarize than to run.",
    shortScript: "Most teams lose time after meetings because no one wants to rewrite the notes. AI note tools can summarize decisions, assign actions, and keep projects moving without manual follow-up work.",
    caption: "Use AI meeting notes to reduce admin time and keep teams aligned after every call.",
    hashtags: "#AITools #RemoteTeams #MeetingNotes #Productivity #Shorts",
    cta: "Turn this trend into your next short with Trend2Short AI.",
    keywords: ["meetings", "teams", "remote work", "notes"]
  },
  {
    id: "ai-resume-builders",
    category: "AI",
    trend: "AI Resume Builders",
    videoIdea: "Create a short explaining how job seekers can improve resumes with AI drafting tools.",
    hook: "People are fixing weak resumes in minutes with AI.",
    shortScript: "Job seekers often struggle to describe their skills clearly. AI resume builders can rewrite bullet points, improve structure, and help candidates tailor resumes to the role they want faster.",
    caption: "AI resume tools can help job seekers write stronger, clearer resumes faster.",
    hashtags: "#AIResume #CareerTools #JobSearch #AITools #YouTubeShorts",
    cta: "Generate more job-search video ideas inside Trend2Short AI.",
    keywords: ["resume", "career", "job search", "cv"]
  },
  {
    id: "ai-design-small-brands",
    category: "AI",
    trend: "AI Design Tools For Small Brands",
    videoIdea: "Show how founders can quickly create visuals and brand assets using AI design tools.",
    hook: "Small brands are launching faster because AI now handles the first design draft.",
    shortScript: "Many small businesses delay content because they do not have a designer on demand. AI design tools help founders mock visuals, ad concepts, and social assets quickly before polishing the final version.",
    caption: "AI design tools can help small brands create visual ideas faster and publish more consistently.",
    hashtags: "#AIDesign #SmallBusiness #Branding #ContentCreation #Reels",
    cta: "Use Trend2Short AI to turn this topic into your next brand-focused short.",
    keywords: ["design", "branding", "small business", "visual content"]
  },
  {
    id: "ai-study-assistants",
    category: "AI",
    trend: "AI Study Assistants For Students",
    videoIdea: "A short video explaining how students use AI study assistants for revision and summaries.",
    hook: "Students are studying smarter because AI now explains lessons in seconds.",
    shortScript: "Students often waste time searching for better explanations of the same topic. AI study assistants can summarize chapters, generate practice questions, and help students review faster with more focus.",
    caption: "See how AI study assistants help students review lessons faster and with less stress.",
    hashtags: "#AIForStudents #StudyTips #EdTech #LearningTools #Shorts",
    cta: "Generate more education-ready trend ideas with Trend2Short AI.",
    keywords: ["students", "study", "revision", "learning"]
  },
  {
    id: "online-store-branding",
    category: "Business",
    trend: "Online Store Branding Tips",
    videoIdea: "Break down three fast branding ideas that make small online stores look more premium.",
    hook: "Most online stores do not have a product problem, they have a branding problem.",
    shortScript: "A lot of online stores sell decent products but still look forgettable. Cleaner messaging, consistent visuals, and a sharper value proposition can make a store feel stronger before customers even read the details.",
    caption: "Small branding changes can make an online store look more trustworthy and easier to buy from.",
    hashtags: "#Ecommerce #BrandingTips #SmallBusiness #Marketing #TikTokBusiness",
    cta: "Turn this business trend into your next short with Trend2Short AI.",
    keywords: ["ecommerce", "branding", "store", "conversion"]
  },
  {
    id: "freelance-pricing-mistakes",
    category: "Business",
    trend: "Freelance Pricing Mistakes",
    videoIdea: "Create a short showing common pricing mistakes freelancers make when starting out.",
    hook: "Freelancers lose money because they price based on fear instead of value.",
    shortScript: "Many freelancers charge too little because they only compare themselves with beginners. Better pricing starts with results, positioning, and confidence in the transformation you deliver to the client.",
    caption: "Freelancers can improve revenue faster by fixing a few common pricing mistakes.",
    hashtags: "#FreelanceTips #PricingStrategy #BusinessGrowth #CreatorEconomy #Shorts",
    cta: "Generate more freelance content ideas in Trend2Short AI.",
    keywords: ["freelance", "pricing", "clients", "income"]
  },
  {
    id: "small-business-automation",
    category: "Business",
    trend: "Small Business Automation",
    videoIdea: "Show how small business owners automate repetitive daily tasks with simple tools.",
    hook: "Small business owners are getting hours back every week through automation.",
    shortScript: "Tasks like invoices, follow-up emails, booking reminders, and customer replies take up more time than most owners expect. Automation tools reduce manual work so founders can focus on sales, service, and growth.",
    caption: "Simple automations can save small business owners serious time every week.",
    hashtags: "#BusinessAutomation #SmallBusiness #Productivity #Operations #Reels",
    cta: "Use Trend2Short AI to create your next automation-focused short.",
    keywords: ["automation", "small business", "operations", "workflow"]
  },
  {
    id: "subscription-product-ideas",
    category: "Business",
    trend: "Subscription Product Ideas",
    videoIdea: "Explain how creators and founders can turn expertise into subscription-based digital products.",
    hook: "Recurring income starts when your idea becomes a subscription instead of a one-time sale.",
    shortScript: "A lot of creators sell once and start from zero again every month. Subscription products like templates, lessons, communities, or resources can create steadier income and deeper customer relationships.",
    caption: "Subscription products help creators and founders build more predictable income.",
    hashtags: "#Subscriptions #DigitalProducts #BusinessIdeas #RecurringRevenue #YouTubeShorts",
    cta: "Generate more recurring-income content ideas with Trend2Short AI.",
    keywords: ["subscription", "digital products", "recurring revenue", "creator business"]
  },
  {
    id: "customer-retention-strategies",
    category: "Business",
    trend: "Customer Retention Strategies",
    videoIdea: "Create a short around simple retention tactics that keep customers coming back.",
    hook: "Retention is often cheaper and smarter than chasing new customers every day.",
    shortScript: "Most businesses spend too much energy only on customer acquisition. Better onboarding, stronger follow-up, and small loyalty rewards can increase repeat purchases without rebuilding the whole funnel.",
    caption: "Customer retention strategies can improve revenue without increasing ad spend.",
    hashtags: "#CustomerRetention #BusinessGrowth #MarketingStrategy #SmallBusiness #Shorts",
    cta: "Use Trend2Short AI to turn retention topics into short-form content.",
    keywords: ["retention", "customers", "marketing", "repeat sales"]
  },
  {
    id: "math-tricks-kids",
    category: "Education",
    trend: "Math Tricks For Kids",
    videoIdea: "Share a short educational video that teaches one simple math trick kids can remember easily.",
    hook: "Kids understand math faster when the trick feels like a game.",
    shortScript: "Math becomes easier when children see patterns instead of memorizing isolated steps. A quick visual trick can make multiplication or mental math feel more fun and easier to recall.",
    caption: "Simple math tricks can make learning feel easier and more engaging for kids.",
    hashtags: "#MathForKids #Education #LearningTips #KidsContent #Shorts",
    cta: "Generate more educational short ideas with Trend2Short AI.",
    keywords: ["math", "kids", "learning", "school"]
  },
  {
    id: "science-experiments-home",
    category: "Education",
    trend: "Science Experiments At Home",
    videoIdea: "Create a family-friendly short showing a safe science experiment parents can try at home.",
    hook: "The best science lessons are the ones kids can actually see happen.",
    shortScript: "Simple home experiments make science more memorable because children watch the result in real time. Even basic reactions or visual demonstrations can turn a lesson into something exciting and easy to explain.",
    caption: "Home science experiments make learning more visual, memorable, and fun.",
    hashtags: "#ScienceForKids #HomeLearning #Education #STEM #Reels",
    cta: "Use Trend2Short AI to build more family and education video concepts.",
    keywords: ["science", "home learning", "stem", "parents"]
  },
  {
    id: "classroom-management-tips",
    category: "Education",
    trend: "Classroom Management Tips",
    videoIdea: "Share one practical classroom management technique teachers can apply immediately.",
    hook: "A calmer classroom usually starts with a better routine, not a louder voice.",
    shortScript: "Classroom management improves when expectations are clear, transitions are smooth, and students know exactly what happens next. Even one structured routine can reduce noise and increase focus.",
    caption: "Teachers can improve classroom management through clear routines and simple structure.",
    hashtags: "#ClassroomManagement #TeachingTips #Education #Teachers #Shorts",
    cta: "Create more teacher-focused short scripts with Trend2Short AI.",
    keywords: ["classroom", "teachers", "behavior", "school routines"]
  },
  {
    id: "language-learning-routine",
    category: "Education",
    trend: "Language Learning Routine",
    videoIdea: "Build a short around a daily routine for learning a new language consistently.",
    hook: "Language learning gets easier when your routine is small enough to repeat every day.",
    shortScript: "A lot of learners quit because they try to do too much at once. A short daily routine with listening, repetition, and a few useful phrases can build progress faster over time.",
    caption: "Consistency matters more than intensity when building a language learning routine.",
    hashtags: "#LanguageLearning #StudyRoutine #Education #LearningHabits #TikTokLearning",
    cta: "Generate more learning-focused content ideas with Trend2Short AI.",
    keywords: ["language", "routine", "study", "habits"]
  },
  {
    id: "educational-apps-kids",
    category: "Education",
    trend: "Educational Apps For Kids",
    videoIdea: "Review educational apps that help kids learn while keeping screen time more intentional.",
    hook: "Not all screen time is equal when the app actually teaches something useful.",
    shortScript: "Parents and teachers look for apps that support reading, math, language, or creativity without becoming empty entertainment. A few strong educational apps can make learning more interactive and easier to revisit.",
    caption: "Educational apps can help kids practice key skills in a more engaging way.",
    hashtags: "#EducationalApps #KidsLearning #EdTech #Parenting #YouTubeShorts",
    cta: "Use Trend2Short AI to turn education topics into stronger short content.",
    keywords: ["apps", "kids", "edtech", "parents"]
  },
  {
    id: "hidden-iphone-features",
    category: "Technology",
    trend: "Hidden iPhone Features",
    videoIdea: "Create a short showing little-known iPhone settings that improve daily use.",
    hook: "Most iPhone users are missing settings that make the phone much more useful.",
    shortScript: "A lot of phone users stay with default settings and never explore helpful shortcuts. Hidden iPhone features can improve screenshots, focus mode, privacy, and everyday speed with only a few taps.",
    caption: "Hidden iPhone features can save time and improve how people use their phone every day.",
    hashtags: "#iPhoneTips #TechHacks #SmartphoneTips #Technology #Shorts",
    cta: "Turn tech discoveries into short video ideas with Trend2Short AI.",
    keywords: ["iphone", "apple", "tech tips", "settings"]
  },
  {
    id: "cybersecurity-beginners",
    category: "Technology",
    trend: "Cybersecurity Tips For Beginners",
    videoIdea: "Share one quick cybersecurity habit everyone should adopt immediately.",
    hook: "Most online security problems start with one simple habit people still ignore.",
    shortScript: "Weak passwords, careless links, and reused logins are still common mistakes. Basic cybersecurity habits like password managers, two-factor authentication, and link awareness reduce risk fast.",
    caption: "Beginner cybersecurity tips can help people stay safer online with simple changes.",
    hashtags: "#Cybersecurity #OnlineSafety #TechTips #DigitalSecurity #Reels",
    cta: "Generate more tech explainers with Trend2Short AI.",
    keywords: ["security", "passwords", "online safety", "technology"]
  },
  {
    id: "smart-home-automation",
    category: "Technology",
    trend: "Smart Home Automation Ideas",
    videoIdea: "Demonstrate a smart home setup that saves time or improves daily comfort.",
    hook: "The smartest home automations are the ones you stop noticing because they just work.",
    shortScript: "Smart home routines can automate lights, temperature, reminders, and security actions without extra effort each day. The best examples are usually practical, simple, and easy to repeat.",
    caption: "Smart home automation can improve convenience without making daily life more complicated.",
    hashtags: "#SmartHome #Automation #TechIdeas #ConnectedHome #Shorts",
    cta: "Use Trend2Short AI to turn automation trends into short-form content.",
    keywords: ["smart home", "automation", "iot", "gadgets"]
  },
  {
    id: "beginner-coding-tools",
    category: "Technology",
    trend: "Beginner Coding Tools",
    videoIdea: "Highlight a few tools that make coding easier for complete beginners.",
    hook: "Beginners learn coding faster when the tools reduce friction instead of adding complexity.",
    shortScript: "A clean code editor, browser-based playgrounds, and guided learning tools can make early coding practice feel less intimidating. Good starter tools help learners focus on understanding, not setup problems.",
    caption: "Beginner coding tools can make learning more accessible and less overwhelming.",
    hashtags: "#CodingForBeginners #DevTools #Programming #TechEducation #YouTubeShorts",
    cta: "Generate more beginner tech ideas inside Trend2Short AI.",
    keywords: ["coding", "programming", "beginners", "developer tools"]
  },
  {
    id: "productivity-tech-setup",
    category: "Technology",
    trend: "Productivity Tech Setup",
    videoIdea: "Show a creator or remote work desk setup focused on speed and clarity.",
    hook: "A better tech setup does not need to be expensive, it needs to remove friction.",
    shortScript: "Many people buy gear without thinking about workflow. A smarter productivity setup focuses on the tools, screens, devices, and shortcuts that reduce switching and help work move faster.",
    caption: "A productivity tech setup is strongest when every tool supports the workflow clearly.",
    hashtags: "#DeskSetup #ProductivityTech #RemoteWork #TechSetup #Reels",
    cta: "Use Trend2Short AI to convert setup trends into short videos.",
    keywords: ["setup", "desk", "productivity", "remote work"]
  },
  {
    id: "viral-reel-hooks",
    category: "Social Media",
    trend: "Viral Reel Hooks",
    videoIdea: "Teach creators how to write stronger first lines for Instagram Reels and TikTok videos.",
    hook: "If your first line is weak, the rest of the video never gets a chance.",
    shortScript: "The beginning of a short video decides whether the viewer stays. Strong hooks use curiosity, speed, clarity, or contrast to make people stop scrolling and keep watching for the payoff.",
    caption: "Stronger hooks can lift retention and give short videos a better chance to perform.",
    hashtags: "#ReelHooks #ViralContent #InstagramReels #TikTokTips #Shorts",
    cta: "Generate stronger video hooks in seconds with Trend2Short AI.",
    keywords: ["hooks", "reels", "viral", "retention"]
  },
  {
    id: "faceless-content-ideas",
    category: "Social Media",
    trend: "Faceless Content Ideas",
    videoIdea: "Share practical formats for creators who want to grow without filming their face.",
    hook: "Faceless creators are proving you do not need to be on camera to build attention.",
    shortScript: "Screen recordings, voiceovers, slides, animated captions, and curated visuals can all become strong short-form content. The key is clarity, pacing, and a topic that solves a real problem.",
    caption: "Faceless content formats can still be engaging when the message is useful and clear.",
    hashtags: "#FacelessContent #CreatorTips #ShortFormVideo #ContentStrategy #TikTokCreator",
    cta: "Use Trend2Short AI to create your next faceless video angle.",
    keywords: ["faceless", "creator", "content formats", "social media"]
  },
  {
    id: "content-batching-workflow",
    category: "Social Media",
    trend: "Content Batching Workflow",
    videoIdea: "Break down a simple batching system for planning and recording multiple short videos at once.",
    hook: "Creators stop burning out when they stop making every video from zero.",
    shortScript: "Batching works because it reduces context switching. When creators plan hooks together, write scripts together, and record in one focused block, content production becomes more consistent and less stressful.",
    caption: "Content batching helps creators publish more consistently without daily idea pressure.",
    hashtags: "#ContentBatching #CreatorWorkflow #ShortVideoTips #ContentPlanning #Reels",
    cta: "Turn workflow ideas into publish-ready shorts with Trend2Short AI.",
    keywords: ["batching", "workflow", "planning", "consistency"]
  },
  {
    id: "instagram-growth-mistakes",
    category: "Social Media",
    trend: "Instagram Growth Mistakes",
    videoIdea: "Highlight a few mistakes that stop creators from growing on Instagram.",
    hook: "Some creators do not need more effort, they need fewer growth mistakes.",
    shortScript: "Weak hooks, unclear positioning, inconsistent formats, and content without a payoff can all slow Instagram growth. Fixing a few repeat mistakes often matters more than posting more often.",
    caption: "Instagram growth improves when creators remove friction and sharpen their content message.",
    hashtags: "#InstagramGrowth #CreatorMistakes #ReelsTips #SocialMediaStrategy #Shorts",
    cta: "Use Trend2Short AI to build stronger Instagram content angles.",
    keywords: ["instagram", "growth", "mistakes", "content strategy"]
  },
  {
    id: "short-form-storytelling",
    category: "Social Media",
    trend: "Short Form Storytelling Tips",
    videoIdea: "Show creators how to structure a mini story in less than one minute.",
    hook: "The best short videos still feel like stories, even when they move fast.",
    shortScript: "Short storytelling works when there is a clear setup, a tension point, and a payoff. Even a 30-second video feels stronger when it gives viewers a reason to stay until the final line.",
    caption: "Short-form storytelling helps creators hold attention and make simple ideas more memorable.",
    hashtags: "#Storytelling #ShortFormVideo #CreatorTips #VideoStructure #YouTubeShorts",
    cta: "Generate story-driven short ideas with Trend2Short AI.",
    keywords: ["storytelling", "video structure", "creators", "retention"]
  },
  {
    id: "morning-routine-systems",
    category: "Productivity",
    trend: "Morning Routine Systems",
    videoIdea: "Create a short about building a morning system that improves focus instead of just looking aesthetic.",
    hook: "A good morning routine should make work easier, not just look impressive online.",
    shortScript: "Morning routines work when they reduce decision fatigue and create momentum. Even a short structure with sleep, planning, and one focused task can improve the rest of the day.",
    caption: "Morning systems are more useful when they are realistic, repeatable, and tied to real work.",
    hashtags: "#MorningRoutine #Productivity #Habits #Focus #Shorts",
    cta: "Use Trend2Short AI to create more productivity-focused video ideas.",
    keywords: ["morning routine", "habits", "focus", "systems"]
  },
  {
    id: "deep-work-habits",
    category: "Productivity",
    trend: "Deep Work Habits",
    videoIdea: "Explain one habit that helps people protect real focus time during the day.",
    hook: "People do not need more motivation, they need fewer distractions during deep work.",
    shortScript: "Deep work improves when notifications are controlled, tasks are defined clearly, and one block of time is protected from interruption. Small focus habits create bigger output gains than people expect.",
    caption: "Deep work habits help people do higher-quality work in less scattered time.",
    hashtags: "#DeepWork #ProductivityTips #FocusHabits #WorkSmarter #Reels",
    cta: "Generate more focus and performance video concepts with Trend2Short AI.",
    keywords: ["deep work", "focus", "habits", "distraction"]
  },
  {
    id: "notion-dashboard-setup",
    category: "Productivity",
    trend: "Notion Dashboard Setup",
    videoIdea: "Show how a simple Notion dashboard can organize personal or creator workflows.",
    hook: "Most Notion dashboards fail because they are too complex to use every day.",
    shortScript: "A strong Notion setup should show priorities, deadlines, and active tasks at a glance. Simpler dashboards are easier to keep updated and actually support better execution.",
    caption: "A simple Notion dashboard can help creators and teams stay organized without extra clutter.",
    hashtags: "#NotionSetup #ProductivityTools #WorkflowDesign #CreatorSystems #TikTokProductivity",
    cta: "Turn productivity systems into short-form scripts with Trend2Short AI.",
    keywords: ["notion", "dashboard", "workflow", "organization"]
  },
  {
    id: "email-zero-routine",
    category: "Productivity",
    trend: "Email Zero Routine",
    videoIdea: "Share a short about reducing inbox stress with a simple email processing routine.",
    hook: "Inbox stress drops fast when email becomes a process instead of a constant interruption.",
    shortScript: "People lose focus when they check email all day without a system. Processing messages in blocks, archiving quickly, and using templates can reduce mental clutter and save time.",
    caption: "An email zero routine can reduce stress and free up attention for more important work.",
    hashtags: "#EmailManagement #Productivity #InboxZero #WorkHabits #Shorts",
    cta: "Generate more workflow ideas instantly with Trend2Short AI.",
    keywords: ["email", "inbox zero", "productivity", "workflow"]
  },
  {
    id: "weekly-planning-method",
    category: "Productivity",
    trend: "Weekly Planning Method",
    videoIdea: "Show a weekly planning method that helps creators and professionals start with clearer priorities.",
    hook: "A strong week usually starts with better planning before Monday begins.",
    shortScript: "Weekly planning works when people review what matters, remove low-value tasks, and set a realistic direction for the week. It creates clarity before work starts instead of reacting too late.",
    caption: "Weekly planning gives creators and professionals a clearer direction before the week gets busy.",
    hashtags: "#WeeklyPlanning #ProductivitySystem #TimeManagement #CreatorWorkflow #YouTubeShorts",
    cta: "Use Trend2Short AI to shape more planning and workflow content.",
    keywords: ["weekly planning", "time management", "priorities", "productivity"]
  }
];

const CATEGORY_COUNT = [...new Set(EXAMPLES.map((example) => example.category))].length;

const examplesGrid = document.getElementById("examplesGrid");
const examplesEmptyState = document.getElementById("examplesEmptyState");
const examplesSearch = document.getElementById("examplesSearch");
const filterButtons = document.querySelectorAll(".filter-pill");
const examplesTotalCount = document.getElementById("examplesTotalCount");
const examplesVisibleCount = document.getElementById("examplesVisibleCount");
const examplesCategoryCount = document.getElementById("examplesCategoryCount");
const toast = document.getElementById("examplesToast");

let activeFilter = "All";
let toastTimeoutId = null;

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

function buildSearchText(example) {
  return [
    example.trend,
    example.category,
    ...example.keywords
  ].join(" ").toLowerCase();
}

function getFilteredExamples() {
  const query = examplesSearch.value.trim().toLowerCase();

  return EXAMPLES.filter((example) => {
    const matchesFilter = activeFilter === "All" || example.category === activeFilter;
    const matchesSearch = !query || buildSearchText(example).includes(query);
    return matchesFilter && matchesSearch;
  });
}

function buildExampleText(example) {
  return [
    `Category: ${example.category}`,
    `Trend: ${example.trend}`,
    "",
    "Video Idea:",
    example.videoIdea,
    "",
    "Hook:",
    example.hook,
    "",
    "Short Script:",
    example.shortScript,
    "",
    "Caption:",
    example.caption,
    "",
    "Hashtags:",
    example.hashtags,
    "",
    "CTA:",
    example.cta
  ].join("\n");
}

async function copyExample(exampleId) {
  const example = EXAMPLES.find((item) => item.id === exampleId);
  if (!example) {
    return;
  }

  const text = buildExampleText(example);

  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    await navigator.clipboard.writeText(text);
  } else {
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

  window.__trend2shortLastCopiedExample = text;
  showToast("Example copied.");
}

function useInGenerator(exampleId) {
  const example = EXAMPLES.find((item) => item.id === exampleId);
  if (!example) {
    return;
  }

  window.localStorage.setItem(PENDING_TREND_KEY, example.trend);
  window.location.href = "index.html";
}

function renderExamples() {
  const filteredExamples = getFilteredExamples();
  examplesGrid.innerHTML = "";

  examplesTotalCount.textContent = String(EXAMPLES.length);
  examplesVisibleCount.textContent = String(filteredExamples.length);
  examplesCategoryCount.textContent = String(CATEGORY_COUNT);

  if (filteredExamples.length === 0) {
    examplesEmptyState.hidden = false;
    return;
  }

  examplesEmptyState.hidden = true;

  filteredExamples.forEach((example) => {
    const article = document.createElement("article");
    article.className = "card library-card";
    article.dataset.exampleId = example.id;

    article.innerHTML = `
      <div class="library-card-header">
        <div>
          <span class="category-badge">${example.category}</span>
          <p class="library-card-title">${example.trend}</p>
        </div>
      </div>
      <div class="example-fields">
        <div class="example-field">
          <span class="example-field-label">Trend</span>
          <p>${example.trend}</p>
        </div>
        <div class="example-field">
          <span class="example-field-label">Video Idea</span>
          <p>${example.videoIdea}</p>
        </div>
        <div class="example-field">
          <span class="example-field-label">Hook</span>
          <p>${example.hook}</p>
        </div>
        <div class="example-field">
          <span class="example-field-label">Short Script</span>
          <p>${example.shortScript}</p>
        </div>
        <div class="example-field">
          <span class="example-field-label">Caption</span>
          <p>${example.caption}</p>
        </div>
        <div class="example-field">
          <span class="example-field-label">Hashtags</span>
          <p>${example.hashtags}</p>
        </div>
        <div class="example-field">
          <span class="example-field-label">CTA</span>
          <p>${example.cta}</p>
        </div>
      </div>
      <div class="example-actions">
        <button class="btn btn-secondary btn-compact" type="button" data-action="copy" data-example-id="${example.id}">Copy Example</button>
        <button class="btn btn-primary btn-compact" type="button" data-action="use" data-example-id="${example.id}">Use In Generator</button>
      </div>
    `;

    examplesGrid.appendChild(article);
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    filterButtons.forEach((filterButton) => {
      filterButton.classList.toggle("is-active", filterButton === button);
    });

    renderExamples();
  });
});

examplesSearch.addEventListener("input", () => {
  renderExamples();
});

examplesGrid.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) {
    return;
  }

  const { action, exampleId } = button.dataset;

  if (action === "copy") {
    await copyExample(exampleId);
  }

  if (action === "use") {
    useInGenerator(exampleId);
  }
});

renderExamples();
