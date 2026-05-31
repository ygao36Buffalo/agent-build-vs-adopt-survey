const config = window.SURVEY_CONFIG || {};
const STORAGE_KEY = `${config.studyId || "survey"}:draft`;

const reasonItems = [
  ["s2a", "用现成那个意味着我得去学别人是怎么搭的。"],
  ["s2b", "现成那个跟我对这个任务的思考方式不匹配。"],
  ["s2c", "我得改变自己的工作流去迁就它。"],
  ["s2d", "依赖别人的工具意味着要依赖对方去维护它。"],
  ["s2e", "我不想还得去问拥有它的人、或跟对方协调。"],
  ["s2f", "自己造避免了“没用同事的成果”带来的尴尬。"],
  ["s2g", "我想要一个属于我、且完全合身的东西。"],
  ["s2h", "自己做出来更有满足感。"],
  ["s2i", "自己造就是比找到现成的并把它配置好更快。"],
  ["s2j", "总体上更省力。"],
  ["s2k", "我不信任现成那个能足够好。"],
  ["s2l", "我造它是因为好玩、或者我想学点东西。"]
];

const s3Items = [
  ["s3_ownership", "这个工具感觉像是我的。"],
  ["s3_fit", "它比其他选项更贴合我的工作方式。"],
  ["s3_control", "我能掌控它如何运作、如何改动。"],
  ["s3_satisfaction", "我对结果感到满意。"]
];

const s43Items = [
  ["s4_learning", "学习它的约定俗成"],
  ["s4_dependency", "依赖维护者"],
  ["s4_help", "需要求助或请求改动"],
  ["s4_workflow", "让自己的工作流迁就它"]
];

const sections = [
  {
    id: "intro",
    kicker: "研究说明",
    title: "开始之前",
    render: renderIntro
  },
  {
    id: "s0",
    kicker: "S0",
    title: "筛选",
    questions: [
      {
        id: "s0_1",
        type: "single",
        required: true,
        label:
          "在典型的一周里，你用 AI agent / vibe coding 为自己构建或生成可用的工具、脚本、应用或文档工作流的频率是？",
        options: ["从不", "不到每周一次", "每周几次", "每天", "每天多次"]
      },
      {
        id: "s0_2",
        type: "single",
        required: true,
        label:
          "在你的工作里，是否存在别人做好、你可以拿来用的东西——比如同事写的脚本、共享的模板或表格、团队沉淀的文档、内部工具？",
        options: ["经常有，我也会用", "有，但我常常不用", "几乎没有这种共享", "我基本独立工作，没有团队"]
      },
      {
        id: "s0_3",
        type: "single",
        required: true,
        label: "过去两周内，你是否用 agent 为一个真实任务（不只是试玩）构建过东西？",
        options: ["是", "否"]
      }
    ]
  },
  {
    id: "s1",
    kicker: "S1",
    title: "关键事件",
    show: answers => answers.s0_3 === "是",
    questions: [
      {
        id: "s1_1",
        type: "textarea",
        required: true,
        label:
          "回想过去两周里，你最近一次为真实任务让 agent 构建工具、脚本或工作流的情形。用 1-2 句话描述它是什么。"
      },
      {
        id: "s1_2",
        type: "multi",
        required: true,
        label: "当时是否存在一个现成方案能把这件事做得还不错？",
        exclusive: ["我没去查是否存在", "没有，没有合适的现成方案"],
        options: [
          "我们团队已经在维护的工具/文件",
          "某个同事的工具/脚本",
          "一个外部产品或服务（付费或免费）",
          "一个开源项目",
          "我没去查是否存在",
          "没有，没有合适的现成方案"
        ]
      },
      {
        id: "s1_3",
        type: "single",
        required: true,
        label: "在你决定自己造的那一刻，你对现成选项的了解是？",
        options: ["我知道有合适的现成方案存在", "我怀疑可能有，但没去找", "我假定没有", "我没想过这件事"]
      },
      {
        id: "s1_4",
        type: "single",
        required: true,
        label: "你实际怎么做的？",
        options: ["用 agent 从零开始造", "采用/使用了现成方案", "从现成方案出发，但让 agent 大幅改造", "其他"]
      },
      {
        id: "s1_4_other",
        type: "text",
        label: "如果选择了“其他”，请补充说明。",
        show: answers => answers.s1_4 === "其他"
      },
      {
        id: "s1_5_build_time",
        type: "single",
        label: "如果存在等价方案而你仍自己造，大致上 agent 构建花了多久？",
        show: shouldAskBuildVsExisting,
        options: ["<15 分钟", "15-60 分钟", "1-3 小时", ">3 小时"]
      },
      {
        id: "s1_5_maturity",
        type: "single",
        label: "那个现成方案的成熟度如何？",
        show: shouldAskBuildVsExisting,
        options: ["粗糙/无人维护", "还行", "维护良好且经过验证", "不清楚"]
      }
    ]
  },
  {
    id: "s2",
    kicker: "S2",
    title: "为什么造而不采用",
    show: shouldAskBuildVsExisting,
    questions: [
      {
        id: "s2_reasons",
        type: "scale",
        required: true,
        label: "对于这次任务，我选择自己造而不是用现成方案，是因为……",
        hint: "1 = 非常不同意，7 = 非常同意。题目显示顺序会随机化。",
        scale: 7,
        items: shuffle(reasonItems)
      },
      {
        id: "s2_top2",
        type: "multi",
        required: true,
        max: 2,
        min: 2,
        label: "上面这些原因里，选出你最主要的 2 个。",
        options: reasonItems.map(item => ({ value: item[0], label: item[1] }))
      },
      {
        id: "s2_other",
        type: "textarea",
        label: "关于你为什么造而不采用，还有别的吗？"
      }
    ]
  },
  {
    id: "s3",
    kicker: "S3",
    title: "自己造的工具带来什么感受",
    show: shouldAskBuildVsExisting,
    questions: [
      {
        id: "s3_feelings",
        type: "scale",
        required: true,
        label: "请评价这次自己造出来的工具带来的感受。",
        hint: "1 = 非常不同意，7 = 非常同意。",
        scale: 7,
        items: s3Items
      },
      {
        id: "s3_1",
        type: "single",
        required: true,
        label: "你后来是否发现其实已经存在一个等价方案（你本不需要自己造）？",
        options: ["是，而且它明显更好", "是，大致等价", "是，但我的更好", "否", "没去查过"]
      },
      {
        id: "s3_2_feeling",
        type: "single",
        label: "对于自己还是造了这件事，你的感受是？",
        show: answers => String(answers.s3_1 || "").startsWith("是"),
        options: ["后悔", "复杂", "不后悔，我还会再造一次"]
      },
      {
        id: "s3_2_why",
        type: "textarea",
        label: "为什么？",
        show: answers => String(answers.s3_1 || "").startsWith("是")
      }
    ]
  },
  {
    id: "s4",
    kicker: "S4",
    title: "采用的那一面",
    show: answers => answers.s0_3 === "是",
    questions: [
      {
        id: "s4_1",
        type: "textarea",
        label: "回想你最近一次采用同事的共享工具/文件、而不是自己造的情形。是什么让它变难或变容易？"
      },
      {
        id: "s4_2",
        type: "single",
        label: "如果同样的情形发生在今天，你是否更可能改成让 agent 造一个自己的版本？",
        options: ["可能性低得多", "更低", "差不多", "更高", "可能性高得多", "不适用"]
      },
      {
        id: "s4_3",
        type: "scale",
        label: "当你采用一个共享工具时，以下各项让你困扰的程度？",
        hint: "1 = 完全不困扰，5 = 很大程度困扰。",
        scale: 5,
        items: s43Items
      }
    ]
  },
  {
    id: "s5",
    kicker: "S5",
    title: "Re-pricing 信号",
    questions: [
      {
        id: "s5_1",
        type: "single",
        label:
          "跟大约两年前（在 agent 还没这么强之前）相比，你现在是否更倾向于自己造、而不是采用现成/共享工具？",
        options: ["低得多", "更低", "差不多", "更高", "高得多"]
      },
      {
        id: "s5_2",
        type: "textarea",
        label: "如果有变化，变的是什么？"
      }
    ]
  },
  {
    id: "s6",
    kicker: "S6",
    title: "团队层面的后果",
    questions: [
      {
        id: "s6_1",
        type: "single",
        label: "在你的团队里，你多常注意到有人自己造了一个、跟别人已经做过的东西相互重叠的版本？",
        options: ["从不", "很少", "有时", "经常", "一直如此"]
      },
      {
        id: "s6_2",
        type: "textarea",
        label: "agent 辅助构建是否改变了你团队对共享工具的复用程度、或人与人之间的相互依赖？"
      }
    ]
  },
  {
    id: "s7",
    kicker: "S7",
    title: "关于你 + 后续",
    questions: [
      { id: "role", type: "text", label: "主要角色 / 领域" },
      {
        id: "team_size",
        type: "single",
        label: "团队规模",
        options: ["单人", "2-5", "6-15", "16+"]
      },
      {
        id: "experience",
        type: "single",
        label: "经验年限",
        options: ["0-1 年", "2-4 年", "5-9 年", "10 年及以上", "不便透露"]
      },
      {
        id: "tools",
        type: "textarea",
        label: "主要使用的 agent / vibe coding 工具"
      },
      {
        id: "followup",
        type: "multi",
        label: "你是否愿意参与简短的后续研究？",
        exclusive: ["暂不参与"],
        options: ["为期两周的工具决策日记", "一次 30 分钟访谈", "暂不参与"]
      },
      {
        id: "contact",
        type: "text",
        label: "如果愿意参与后续，请留下联系方式。",
        show: answers =>
          Array.isArray(answers.followup) &&
          answers.followup.some(item => item !== "暂不参与")
      }
    ]
  }
];

const state = {
  answers: loadDraft(),
  sectionIndex: 0,
  completed: false
};

const form = document.querySelector("#survey-form");
const kicker = document.querySelector("#section-kicker");
const title = document.querySelector("#section-title");
const progressBar = document.querySelector("#progress-bar");
const progressLabel = document.querySelector("#progress-label");
const backButton = document.querySelector("#back-button");
const nextButton = document.querySelector("#next-button");
const saveButton = document.querySelector("#save-button");
const statusEl = document.querySelector("#status");

backButton.addEventListener("click", goBack);
nextButton.addEventListener("click", goNext);
saveButton.addEventListener("click", () => {
  persist();
  setStatus("草稿已保存在当前浏览器。", "ok");
});

render();

function currentSections() {
  return sections.filter(section => !section.show || section.show(state.answers));
}

function render() {
  const visible = currentSections();
  if (state.sectionIndex >= visible.length) state.sectionIndex = visible.length - 1;
  const section = visible[state.sectionIndex];
  kicker.textContent = section.kicker;
  title.textContent = section.title;
  form.innerHTML = "";
  statusEl.textContent = "";
  statusEl.className = "status";

  if (section.render) {
    section.render(form);
  } else {
    renderQuestions(form, section.questions);
  }

  const progress = Math.round((state.sectionIndex / Math.max(visible.length - 1, 1)) * 100);
  progressBar.style.width = `${progress}%`;
  progressLabel.textContent = `${progress}%`;
  backButton.disabled = state.sectionIndex === 0;
  nextButton.textContent = state.sectionIndex === 0 ? "开始" : state.sectionIndex === visible.length - 1 ? "提交" : "下一步";
  saveButton.disabled = state.sectionIndex === 0;
}

function renderIntro(container) {
  container.innerHTML = `
    <section class="intro">
      <h3>请根据一次具体的近期经历作答</h3>
      <p>后续问题会围绕你最近一次为真实任务让 agent 构建工具、脚本或工作流的事件展开。问卷允许你回答“没有发生过”，也会保留采用现成方案的路径。</p>
      <p>本问卷不收集敏感个人信息。若你愿意参与后续日记或访谈，最后可以自愿留下联系方式。</p>
    </section>
  `;
}

function renderQuestions(container, questions) {
  const wrapper = document.createElement("div");
  wrapper.className = "question-list";
  questions
    .filter(question => !question.show || question.show(state.answers))
    .forEach(question => wrapper.append(renderQuestion(question)));
  container.append(wrapper);
}

function renderQuestion(question) {
  const field = document.createElement("fieldset");
  field.className = `question ${question.required ? "required" : ""}`;
  field.dataset.questionId = question.id;

  const label = document.createElement("h3");
  label.textContent = question.label;
  field.append(label);

  if (question.hint) {
    const hint = document.createElement("p");
    hint.className = "hint";
    hint.textContent = question.hint;
    field.append(hint);
  }

  if (question.type === "single") renderSingle(field, question);
  if (question.type === "multi") renderMulti(field, question);
  if (question.type === "textarea") renderTextarea(field, question);
  if (question.type === "text") renderText(field, question);
  if (question.type === "scale") renderScale(field, question);

  return field;
}

function renderSingle(field, question) {
  const options = document.createElement("div");
  options.className = "options";
  question.options.forEach(option => {
    const normalized = normalizeOption(option);
    const label = document.createElement("label");
    label.className = "option";
    label.innerHTML = `
      <input type="radio" name="${question.id}" value="${escapeAttr(normalized.value)}" ${
        state.answers[question.id] === normalized.value ? "checked" : ""
      }>
      <span>${escapeHtml(normalized.label)}</span>
    `;
    options.append(label);
  });
  options.addEventListener("change", event => {
    state.answers[question.id] = event.target.value;
    clearDependentAnswers();
    persist();
    render();
  });
  field.append(options);
}

function renderMulti(field, question) {
  const selected = Array.isArray(state.answers[question.id]) ? state.answers[question.id] : [];
  const options = document.createElement("div");
  options.className = "options";
  question.options.forEach(option => {
    const normalized = normalizeOption(option);
    const label = document.createElement("label");
    label.className = "option";
    label.innerHTML = `
      <input type="checkbox" name="${question.id}" value="${escapeAttr(normalized.value)}" ${
        selected.includes(normalized.value) ? "checked" : ""
      }>
      <span>${escapeHtml(normalized.label)}</span>
    `;
    options.append(label);
  });
  options.addEventListener("change", event => {
    const changed = event.target;
    let checked = [...options.querySelectorAll("input:checked")].map(input => input.value);
    const exclusive = question.exclusive || [];
    if (changed.checked && exclusive.includes(changed.value)) {
      [...options.querySelectorAll("input")].forEach(input => {
        input.checked = input.value === changed.value;
      });
      checked = [changed.value];
    } else if (changed.checked && checked.some(value => exclusive.includes(value))) {
      [...options.querySelectorAll("input")].forEach(input => {
        if (exclusive.includes(input.value)) input.checked = false;
      });
      checked = checked.filter(value => !exclusive.includes(value));
    }
    if (question.max && checked.length > question.max) {
      changed.checked = false;
      setStatus(`此题最多选择 ${question.max} 项。`, "error");
      return;
    }
    state.answers[question.id] = checked;
    clearDependentAnswers();
    persist();
  });
  field.append(options);
}

function renderTextarea(field, question) {
  const textarea = document.createElement("textarea");
  textarea.name = question.id;
  textarea.value = state.answers[question.id] || "";
  textarea.addEventListener("input", event => {
    state.answers[question.id] = event.target.value.trim();
    persist();
  });
  field.append(textarea);
}

function renderText(field, question) {
  const input = document.createElement("input");
  input.type = "text";
  input.name = question.id;
  input.value = state.answers[question.id] || "";
  input.addEventListener("input", event => {
    state.answers[question.id] = event.target.value.trim();
    persist();
  });
  field.append(input);
}

function renderScale(field, question) {
  const values = state.answers[question.id] || {};
  const head = document.createElement("div");
  head.className = "scale-head";
  head.innerHTML = `<span></span>${Array.from({ length: question.scale }, (_, i) => `<span>${i + 1}</span>`).join("")}`;
  field.append(head);

  question.items.forEach(([itemId, itemLabel]) => {
    const row = document.createElement("div");
    row.className = "scale-row";
    row.innerHTML = `<div class="scale-label">${escapeHtml(itemLabel)}</div>`;
    for (let value = 1; value <= question.scale; value += 1) {
      const choice = document.createElement("label");
      choice.className = "scale-choice";
      choice.title = `${value}`;
      choice.innerHTML = `
        <input type="radio" name="${question.id}:${itemId}" value="${value}" ${
          Number(values[itemId]) === value ? "checked" : ""
        }>
      `;
      row.append(choice);
    }
    field.append(row);
  });

  field.addEventListener("change", event => {
    const [, itemId] = event.target.name.split(":");
    state.answers[question.id] = {
      ...(state.answers[question.id] || {}),
      [itemId]: Number(event.target.value)
    };
    persist();
  });
}

function goBack() {
  state.sectionIndex = Math.max(0, state.sectionIndex - 1);
  render();
}

async function goNext() {
  const visible = currentSections();
  const section = visible[state.sectionIndex];
  const validation = validateSection(section);
  if (!validation.ok) {
    setStatus(validation.message, "error");
    return;
  }

  const screenedOut = getScreenOutReason();
  if (screenedOut && section.id === "s0") {
    state.answers.screenedOut = screenedOut;
    persist();
    renderCompletion("你不完全符合本轮筛选条件，但仍可下载当前回答。");
    return;
  }

  if (state.sectionIndex < visible.length - 1) {
    state.sectionIndex += 1;
    persist();
    render();
    return;
  }

  await submitSurvey();
}

function validateSection(section) {
  if (!section.questions) return { ok: true };
  const active = section.questions.filter(question => !question.show || question.show(state.answers));
  for (const question of active) {
    const value = state.answers[question.id];
    if (question.required) {
      if (question.type === "scale") {
        const answered = value || {};
        if (question.items.some(([itemId]) => !answered[itemId])) {
          return { ok: false, message: "请完成本页所有必答量表题。" };
        }
      } else if (Array.isArray(value)) {
        if (!value.length) return { ok: false, message: "请完成本页必答题。" };
      } else if (!value) {
        return { ok: false, message: "请完成本页必答题。" };
      }
    }
    if (question.type === "multi" && question.min && Array.isArray(value) && value.length < question.min) {
      return { ok: false, message: `请在“${question.label}”中选择 ${question.min} 项。` };
    }
  }
  return { ok: true };
}

async function submitSurvey() {
  const payload = buildPayload();
  persist();
  nextButton.disabled = true;
  setStatus("正在提交...", "");

  if (!config.submitEndpoint) {
    renderCompletion("当前未配置提交端点；本次回答保存在浏览器中，可下载 JSON。");
    return;
  }

  try {
    const response = await fetch(config.submitEndpoint, {
      method: config.submitMethod || "POST",
      headers: config.submitHeaders || { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    localStorage.removeItem(STORAGE_KEY);
    renderCompletion("回答已提交，感谢你的时间。");
  } catch (error) {
    nextButton.disabled = false;
    setStatus(`提交失败：${error.message}。你仍可以下载 JSON，或稍后重试。`, "error");
  }
}

function renderCompletion(message) {
  state.completed = true;
  kicker.textContent = "完成";
  title.textContent = "感谢参与";
  progressBar.style.width = "100%";
  progressLabel.textContent = "100%";
  form.innerHTML = "";
  const template = document.querySelector("#completion-template");
  const node = template.content.cloneNode(true);
  node.querySelector("p").textContent = message;
  form.append(node);
  backButton.disabled = true;
  saveButton.disabled = true;
  nextButton.disabled = true;
  statusEl.textContent = "";

  form.querySelector('[data-action="download"]').addEventListener("click", downloadAnswers);
  form.querySelector('[data-action="restart"]').addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    state.answers = {};
    state.sectionIndex = 0;
    state.completed = false;
    nextButton.disabled = false;
    saveButton.disabled = false;
    render();
  });
}

function getScreenOutReason() {
  if (["从不", "不到每周一次"].includes(state.answers.s0_1)) {
    return "agent_use_frequency_below_threshold";
  }
  return "";
}

function shouldAskBuildVsExisting(answers) {
  const built =
    answers.s1_4 === "用 agent 从零开始造" ||
    answers.s1_4 === "从现成方案出发，但让 agent 大幅改造";
  const knownExisting =
    Array.isArray(answers.s1_2) &&
    answers.s1_2.some(
      item =>
        item !== "我没去查是否存在" &&
        item !== "没有，没有合适的现成方案"
    );
  return built && knownExisting;
}

function buildPayload() {
  return {
    studyId: config.studyId || "I01-agent-build-vs-adopt",
    submittedAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
    answers: state.answers
  };
}

function downloadAnswers() {
  const blob = new Blob([JSON.stringify(buildPayload(), null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `i01-survey-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.answers));
}

function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function clearDependentAnswers() {
  sections.forEach(section => {
    (section.questions || []).forEach(question => {
      if (question.show && !question.show(state.answers)) delete state.answers[question.id];
    });
  });
}

function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = `status ${type || ""}`.trim();
}

function normalizeOption(option) {
  if (typeof option === "string") return { value: option, label: option };
  return option;
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("'", "&#039;");
}
