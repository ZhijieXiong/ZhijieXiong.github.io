const DATA = {
  Assist2009: {
    num_interaction: 338001,
    num_user: 4163,
    num_concept: 123,
    num_question: 17751,
    average_seq_len: 70.27,
    average_question_acc: 0.6583,
    question_sparsity: 0.9961,
    concept_sparsity: 0.9156,
    side_info: "concept_text, school_id, timestamp, num_hint, num_attempt",
    link: "https://sites.google.com/site/assistmentsdata/home/2009-2010-assistment-data/skill-builder-data-2009-2010",
  },
  "Assist2009-full": {
    num_user: 6593,
    num_interaction: 432672,
    num_concept: 151,
    num_question: 13544,
    average_seq_len: 65.63,
    average_question_acc: 0.6308,
    question_sparsity: 0.9954,
    concept_sparsity: 0.8976,
    side_info: "",
    link: "https://sites.google.com/site/assistmentsdata/home/2009-2010-assistment-data/combined-dataset-2009-10)",
  },
  Assist2012: {
    num_interaction: 2711813,
    num_user: 29018,
    num_concept: 265,
    num_question: 53091,
    average_seq_len: 96.41,
    average_question_acc: 0.6954,
    question_sparsity: 0.9983,
    concept_sparsity: 0.9493,
    side_info:
      "concept_text, school_id, timestamp, use_time, num_hint, num_attempt",
    link: "https://sites.google.com/site/assistmentsdata/home/2012-13-school-data-with",
  },
  Assist2015: {
    num_interaction: 708631,
    num_user: 19917,
    num_concept: 100,
    num_question: 100,
    average_seq_len: 36.46,
    average_question_acc: 0.7295,
    question_sparsity: 0.9359,
    concept_sparsity: 0.9359,
    side_info: "",
    link: "https://sites.google.com/site/assistmentsdata/home/2015-assistments-skill-builder-data",
  },
  Assist2017: {
    num_interaction: 864713,
    num_user: 1709,
    num_concept: 101,
    num_question: 2803,
    average_seq_len: 505.98,
    average_question_acc: 0.3674,
    question_sparsity: 0.9265,
    concept_sparsity: 0.5935,
    side_info:
      "concept_text, school_id, timestamp, use_time, num_hint, num_attempt",
    link: "https://sites.google.com/view/assistmentsdatamining/dataset?authuser=0",
  },
  "Ednet-kt1-random-seqs-5000": {
    num_user: 4821,
    num_interaction: 567127,
    num_concept: 188,
    num_question: 11858,
    average_seq_len: 117.64,
    average_question_acc: 0.6512,
    question_sparsity: 0.9916,
    concept_sparsity: 0.8132,
    side_info: "timestamp, use_time, num_hint, num_attempt",
    link: "https://github.com/riiid/ednet",
  },
  "Edi2020-task1": {
    num_interaction: 19834813,
    num_user: 118971,
    num_question: 27613,
    num_concept: 282,
    average_seq_len: 166.72,
    average_question_acc: 0.643,
    question_sparsity: 0.994,
    concept_sparsity: 0.8882,
    side_info: "concept_text, timestamp, user_age",
    link: "https://eedi.com/projects/neurips-education-challenge",
  },
  "Edi2020-task1-longest-seqs-5000": {
    num_interaction: 3568804,
    num_user: 5000,
    num_question: 27613,
    num_concept: 282,
    average_seq_len: 713.76,
    average_question_acc: 0.628,
    question_sparsity: 0.9742,
    concept_sparsity: 0.7194,
    side_info: "concept_text, timestamp, user_age",
    link: "https://eedi.com/projects/neurips-education-challenge",
  },
  "Edi2020-task34": {
    num_interaction: 1382727,
    num_user: 4918,
    num_question: 948,
    num_concept: 53,
    average_seq_len: 281.16,
    average_question_acc: 0.5373,
    question_sparsity: 0.7034,
    concept_sparsity: 0.519,
    side_info: "concept_text, question_text, timestamp, user_age",
    link: "https://eedi.com/projects/neurips-education-challenge",
  },
  Junyi2015: {
    num_interaction: 25925987,
    num_user: 247606,
    num_question: 817,
    num_concept: 40,
    average_seq_len: 124.37,
    average_question_acc: 0.8284,
    question_sparsity: 0.9868,
    concept_sparsity: 0.9181,
    side_info: "concept_text, timestamp, use_time, num_hint, num_attempt",
    link: "",
  },
  "Junyi2015-longest-seqs-5000": {
    num_interaction: 10700681,
    num_user: 5000,
    num_question: 817,
    num_concept: 40,
    average_seq_len: 2140.14,
    average_question_acc: 0.83,
    question_sparsity: 0.8665,
    concept_sparsity: 0.5778,
    side_info: "concept_text, timestamp, use_time, num_hint, num_attempt",
    link: "",
  },
  Poj: {
    num_interaction: 996240,
    num_user: 22916,
    num_concept: 2750,
    num_question: 2750,
    average_seq_len: 50.75,
    average_question_acc: 0.3552,
    question_sparsity: 0.9975,
    concept_sparsity: 0.9975,
    side_info: "timestamp, answer_error_type",
    link: "https://github.com/riiid/ednet",
  },
  "Slepemapy-anatomy": {
    num_interaction: 1173566,
    num_user: 18540,
    num_concept: 246,
    num_question: 5730,
    average_seq_len: 76.64,
    average_question_acc: 0.7491,
    question_sparsity: 0.9893,
    concept_sparsity: 0.9279,
    side_info: "concept_text, timestamp, use_time",
    link: "http://data.practiceanatomy.com/",
  },
  Statics2011: {
    num_interaction: 189297,
    num_user: 333,
    num_question: 1223,
    num_concept: 27,
    average_seq_len: 568.46,
    average_question_acc: 0.7654,
    question_sparsity: 0.5398,
    concept_sparsity: 0.3516,
    side_info: "concept_text, question_text, timestamp",
    link: "https://pslcdatashop.web.cmu.edu/DatasetInfo?datasetId=507",
  },
  Xes3g5m: {
    num_user: 18066,
    num_interaction: 5549184,
    num_concept: 865,
    num_question: 7652,
    average_seq_len: 307.16,
    average_question_acc: 0.7947,
    question_sparsity: 0.9616,
    concept_sparsity: 0.8362,
    side_info: "concept_text, question_text, timestamp",
    link: "https://github.com/ai4ed/XES3G5M",
  },
  "moocradar-C746997": {
    num_interaction: 100066,
    num_user: 1577,
    num_concept: 265,
    num_question: 550,
    average_seq_len: 63.45,
    average_question_acc: 0.6858,
    question_sparsity: 0.8846,
    concept_sparsity: 0.842,
    side_info: "concept_text, question_text, timestamp, cognitive_dimension",
    link: "https://github.com/THU-KEG/MOOC-Radar",
  },
  "SLP-phy": {
    num_interaction: 107288,
    num_user: 664,
    num_concept: 54,
    num_question: 1915,
    average_seq_len: 161.58,
    average_question_acc: 0.6122,
    question_sparsity: 0.9159,
    concept_sparsity: 0.341,
    side_info: "timestamp, school_id, gender",
    link: "https://aic-fe.bnu.edu.cn/en/data/index.html",
  },
  "SLP-mat": {
    num_interaction: 242722,
    num_user: 1499,
    num_question: 1127,
    num_concept: 44,
    average_seq_len: 161.92,
    average_question_acc: 0.6761,
    question_sparsity: 0.8565,
    concept_sparsity: 0.1896,
    side_info: "timestamp, school_id, gender",
    link: "https://aic-fe.bnu.edu.cn/en/data/index.html",
  },
  "SLP-bio": {
    "num_interaction": 291800,
    "num_user": 1941,
    "num_concept": 23,
    "num_question": 1058,
    "average_seq_len": 150.33,
    "average_question_acc": 0.6575,
    "question_sparsity": 0.858,
    "concept_sparsity": 0.1795,
    side_info: "timestamp, school_id, gender",
    link: "https://aic-fe.bnu.edu.cn/en/data/index.html",
  },
  "SLP-chi": {
    "num_interaction": 80888,
    "num_user": 623,
    "num_question": 637,
    "num_concept": 31,
    "average_seq_len": 129.84,
    "average_question_acc": 0.7494,
    "question_sparsity": 0.7973,
    "concept_sparsity": 0.4796,
    side_info: "timestamp, school_id, gender",
    link: "https://aic-fe.bnu.edu.cn/en/data/index.html",
  },
  "SLP-eng": {
    "num_interaction": 86530,
    "num_user": 366,
    "num_concept": 28,
    "num_question": 1089,
    "average_seq_len": 236.42,
    "average_question_acc": 0.784,
    "question_sparsity": 0.7832,
    "concept_sparsity": 0.1755,
    side_info: "timestamp, school_id, gender",
    link: "https://aic-fe.bnu.edu.cn/en/data/index.html",
  },
  "SLP-geo": {
    "num_interaction": 149780,
    "num_user": 1135,
    "num_concept": 47,
    "num_question": 1011,
    "average_seq_len": 132.08,
    "average_question_acc": 0.6316,
    "question_sparsity": 0.8694,
    "concept_sparsity": 0.379,
    side_info: "timestamp, school_id, gender",
    link: "https://aic-fe.bnu.edu.cn/en/data/index.html",
  },
  "SLP-his": {
    "num_interaction": 296711,
    "num_user": 1610,
    "num_concept": 22,
    "num_question": 1251,
    "average_seq_len": 184.29,
    "average_question_acc": 0.7278,
    "question_sparsity": 0.8532,
    "concept_sparsity": 0.4535,
    side_info: "timestamp, school_id, gender",
    link: "https://aic-fe.bnu.edu.cn/en/data/index.html",
  },
};

const FIELD_MEANING = {
  name: "Dataset name.",
  num_interaction: "Total number of interactions in the dataset.",
  num_user: "Total number of users in the dataset.",
  num_concept: "Total number of concepts in the dataset.",
  num_question: "Total number of questions in the dataset.",
  average_seq_len: "Average sequence length of user interactions.",
  average_question_acc: "Average accuracy of answered questions.",
  question_sparsity: "Sparsity level of questions.",
  concept_sparsity: "Sparsity level of concepts.",
  side_info: "Other side information provided by the dataset.",
  download: "Source of dataset",
};

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("table-body");
  // 将字典转换为键值对数组并排序
  const sortedEntries = Object.entries(DATA).sort(
    (a, b) => a[1].num_interaction - b[1].num_interaction
  );

  // 提取排序后的key数组
  const sortedKeys = sortedEntries.map((entry) => entry[0]);
  sortedKeys.forEach((name) => {
    const row = document.createElement("tr");

    row.innerHTML = `
          <td>${name}</td>
          <td>${DATA[name].num_interaction}</td>
          <td>${DATA[name].num_user}</td>
          <td>${DATA[name].num_concept}</td>
          <td>${DATA[name].num_question}</td>
          <td>${DATA[name].average_seq_len}</td>
          <td>${DATA[name].average_question_acc}</td>
          <td>${DATA[name].question_sparsity}</td>
          <td>${DATA[name].concept_sparsity}</td>
          <td>${DATA[name].side_info}</td>
          <td>${
            DATA[name].link
              ? `<a href="${DATA[name].link}" target="_blank">source</a>`
              : ""
          }</td>
      `;

    tableBody.appendChild(row);
  });

  const tooltip = document.getElementById("tooltip");

  document.querySelectorAll(".info-dot").forEach((dot) => {
    dot.addEventListener("mouseenter", (event) => {
      const field = event.target.getAttribute("data-field");
      tooltip.textContent = FIELD_MEANING[field];
      tooltip.style.display = "block";
      tooltip.style.left = event.pageX + "px";
      tooltip.style.top = event.pageY + "px";
    });

    dot.addEventListener("mouseleave", () => {
      tooltip.style.display = "none";
    });
  });
});
