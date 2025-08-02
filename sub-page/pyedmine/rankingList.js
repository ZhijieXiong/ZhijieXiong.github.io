// 初始化全局状态
let currentState = {
  task: null,
  scene: null,
  setting: null,
  metric: null,
  data: null,
  modelType: "All",
  selectedModels: [], // ⬅️ 添加模型过滤状态
};

// 任务列表（固定）
const TASKS = ["KT1", "KT2", "CD", "ER"];
const KT_TARGET_DATASETS = [
  "assist2009",
  "assist2012",
  "assist2017",
  "statics2011",
  "edi2020-task34",
  "slepemapy-anatomy",
  "moocradar-C746997",
  // "moocradar-C746997-subtest-27",
  "xes3g5m",
  // "xes3g5m-subtest-100",
  "ednet-kt1",
  "junyi2015",
  "edi2020-task1",
];
const KT2_TARGET_DATASETS = [
  "assist2009",
  "assist2012",
  "assist2017",
  "statics2011",
  "edi2020-task34",
  "slepemapy-anatomy",
  "moocradar-C746997",
  // "moocradar-C746997-subtest-27",
  "xes3g5m",
  // "xes3g5m-subtest-100",
  // "ednet-kt1",
  "junyi2015",
  "edi2020-task1",
];
const CD_TARGET_DATASETS = [
  "assist2009",
  "assist2017",
  "statics2011",
  "edi2020-task34",
  "slepemapy-anatomy",
  "SLP-mat",
  "SLP-phy",
  "moocradar-C746997",
];
const ER_TARGET_DATASETS = [
  "assist2009",
  "assist2017",
  "statics2011",
  "edi2020-task34",
  "slepemapy-anatomy",
];
const MODEL_TYPE = {
  KT1: {
    "Concept Level": ["DKT", "DKVMN", "DKTForget", "ATKT"],
    "Question Level": [
      "qDKT",
      "AKT",
      "SimpleKT",
      "SparseKT",
      "DIMKT",
      "LPKT",
      "LBKT",
      "MIKT",
      "QIKT",
      "QDCKT",
      "CKT",
      "HDLPKT",
      "DTransformer",
      "ABQR",
      "ATDKT",
      "HawkesKT",
      "RouterKT",
    ],
    "No Side Info (Concept Level)": ["DKT", "DKVMN", "ATKT"],
    "No Side Info (Question Level)": [
      "qDKT",
      "AKT",
      "SimpleKT",
      "SparseKT",
      "DIMKT",
      "MIKT",
      "QIKT",
      "QDCKT",
      "CKT",
      "DTransformer",
      "ABQR",
      "ATDKT",
      "RouterKT",
      "ReKT",
    ],
    // 添加更多类型...
  },
  KT2: {},
  CD: {},
  ER: {},
};

// 初始化页面
$(document).ready(function () {
  // 默认加载 KT > overall > AUC
  const defaultTask = "KT1";
  const defaultScene = "overall";
  const defaultSetting = "default";
  const defaultMetric = "AUC";
  const defaultModelType = "All";

  initTaskSelector();

  // 模拟点击默认任务按钮
  $(`.task-btn[data-task="${defaultTask}"]`).click();

  // 加载数据后，模拟点击默认场景和指标
  loadData(defaultTask, (data) => {
    currentState.data = data;
    initSceneSelector(data);

    // 模拟点击默认场景按钮
    $(`.scene-btn[data-scene="${defaultScene}"]`).click();

    // 模拟点击默认设置按钮
    $(`.setting-btn[data-setting="${defaultSetting}"]`).click();

    // 模拟点击默认指标按钮
    $(`.metric-btn[data-metric="${defaultMetric}"]`).click();

    // 模拟点击默认全部按钮
    $(`.model-type-btn[data-type="${defaultModelType}"]`).click();

    switchNoteBox(); // ⬅️ 添加在初始化后
  });
});

function renderModelFilterButtons(models) {
  const container = $("#model-filter-container");
  const html = models
    .map((model) => {
      const isActive = currentState.selectedModels.includes(model);
      return `<button class="model-filter-btn ${
        isActive ? "active" : ""
      }" data-model="${model}">${model}</button>`;
    })
    .join("");
  container.html(html);

  $(".model-filter-btn")
    .off("click")
    .on("click", function () {
      const model = $(this).data("model");
      const idx = currentState.selectedModels.indexOf(model);
      if (idx >= 0) {
        currentState.selectedModels.splice(idx, 1);
      } else {
        currentState.selectedModels.push(model);
      }

      // 至少保留一个
      if (currentState.selectedModels.length === 0) {
        currentState.selectedModels.push(model);
      }

      renderModelFilterButtons(models); // 重新渲染按钮状态
      renderTable(); // 重新渲染表格
    });
}

$(".model-type-btn").click(function (e) {
  $(".model-type-btn").removeClass("active");
  $(this).addClass("active");

  currentState.modelType = $(this).data("type");

  // ✅ 初始化 selectedModels 为当前模型类型下的全部可用模型
  const modelType = currentState.modelType;
  const modelTypes = MODEL_TYPE[currentState.task];
  const modelsForType =
    modelType === "All"
      ? Object.keys(
          currentState.data.scenes[
            `${currentState.scene}-${currentState.setting}`
          ].datasets
        ).flatMap((d) =>
          Object.keys(
            currentState.data.scenes[
              `${currentState.scene}-${currentState.setting}`
            ].datasets[d].metrics[currentState.metric] || {}
          )
        )
      : modelTypes[modelType] || [];
  currentState.selectedModels = [...new Set(modelsForType)];

  renderTable(); // 表格刷新
});

// ----------------------------------------------------------------
function initTaskSelector() {
  const html = TASKS.map(
    (task) => `
      <button class="task-btn" data-task="${task}">${task}</button>
  `
  ).join("");
  $("#task-selector").html(html);
  $(".task-btn").click(function (e) {
    // 移除所有任务按钮的 active 类
    $(".task-btn").removeClass("active");
    // 为当前点击的按钮添加 active 类
    $(this).addClass("active");

    // 重置更低层级的状态
    currentState.scene = null;
    currentState.setting = null;
    currentState.metric = null;
    $("#scene-selector").empty();
    $("#setting-selector").empty();
    $("#metric-selector").empty();
    $("#table-container").empty(); // 隐藏表单

    onTaskSelect(e);
  });
  $(`.model-type-btn[data-type="All"]`).click();
}

function onTaskSelect(e) {
  const task = $(e.target).data("task");
  currentState.task = task;
  switchNoteBox(); // ⬅️ 添加这个，确保点击任务就切换说明框
  loadData(task, (data) => {
    currentState.data = data;
    initSceneSelector(data);
  });
}
// ----------------------------------------------------------------

// ----------------------------------------------------------------
function initSceneSelector(data) {
  const scenes = Object.keys(data.scenes);
  const uniqueScenes = [
    ...new Set(scenes.map((scene) => parseScene(scene).scene)),
  ];

  const html = uniqueScenes
    .map(
      (scene) => `
      <button class="scene-btn" data-scene="${scene}">${scene}</button>
  `
    )
    .join("");
  $("#scene-selector").html(html);
  $(".scene-btn").click(function (e) {
    $(".scene-btn").removeClass("active");
    $(this).addClass("active");
    onSceneSelect(e);
  });
  $("#setting-selector").empty();
  $("#metric-selector").empty();
}

function onSceneSelect(e) {
  const sceneName = $(e.target).data("scene");
  currentState.scene = sceneName;

  // 重置更低层级的状态
  currentState.setting = null;
  currentState.metric = null;
  $("#setting-selector").empty();
  $("#metric-selector").empty();
  $("#table-container").empty(); // 隐藏表单

  // 获取该场景下的所有 setting
  const scenes = Object.keys(currentState.data.scenes);
  const settings = scenes
    .filter((s) => parseScene(s).scene === sceneName)
    .map((s) => parseScene(s).setting);

  // 初始化设定选择器
  initSettingSelector(settings);
}
// ----------------------------------------------------------------

// ----------------------------------------------------------------
function initSettingSelector(settings) {
  const html = settings
    .map(
      (setting) => `
      <button class="setting-btn" data-setting="${setting}">${setting}</button>
  `
    )
    .join("");
  $("#setting-selector").html(html);
  $(".setting-btn").click(function (e) {
    $(".setting-btn").removeClass("active");
    $(this).addClass("active");
    onSettingSelect(e);
  });
}

function onSettingSelect(e) {
  currentState.setting = $(e.target).data("setting");

  // 重置更低层级的状态
  currentState.metric = null;
  $("#metric-selector").empty();
  $("#table-container").empty(); // 隐藏表单

  initMetricSelector(currentState.scene);
}
// ----------------------------------------------------------------

// ----------------------------------------------------------------
function initMetricSelector(sceneName) {
  const { setting } = currentState;
  const sceneKey = setting ? `${sceneName}-${setting}` : sceneName;
  const sceneData = currentState.data.scenes[sceneKey];
  const metrics = new Set();

  // 动态提取所有指标
  Object.values(sceneData.datasets).forEach((dataset) => {
    Object.keys(dataset.metrics).forEach((metric) => {
      metrics.add(metric);
    });
  });

  // 生成指标按钮
  const metricButtons = Array.from(metrics)
    .map(
      (metric) => `
      <button class="metric-btn" data-metric="${metric}">${metric}</button>
  `
    )
    .join("");

  // 生成模型类型按钮
  const modelTypes = MODEL_TYPE[currentState.task];
  const modelTypeButtons = Object.keys(modelTypes)
    .map(
      (type) => `
      <button class="model-type-btn" data-type="${type}">${type}</button>
  `
    )
    .join("");

  // 添加“全部”按钮
  const allButton = `<button class="model-type-btn" data-type="All">All</button>`;

  // 插入到页面
  $("#metric-selector").html(`
    <div>${metricButtons}</div>
    <div>${allButton} ${modelTypeButtons}</div>
  `);

  // 绑定指标按钮点击事件
  $(".metric-btn").click(function (e) {
    $(".metric-btn").removeClass("active");
    $(this).addClass("active");
    onMetricSelect(e);
  });

  // 绑定模型类型按钮点击事件
  $(".model-type-btn").click(function (e) {
    $(".model-type-btn").removeClass("active");
    $(this).addClass("active");
    currentState.modelType = $(this).data("type");
    renderTable();
  });
}

function onMetricSelect(e) {
  currentState.metric = $(e.target).data("metric");
  currentState.modelType = "All";
  $(`.model-type-btn[data-type="All"]`).click();

  // ✅ 初始化 selectedModels 为当前模型类型下的全部可用模型
  const modelType = currentState.modelType;
  const modelTypes = MODEL_TYPE[currentState.task];
  const modelsForType =
    modelType === "All"
      ? Object.keys(
          currentState.data.scenes[
            `${currentState.scene}-${currentState.setting}`
          ].datasets
        ).flatMap((d) =>
          Object.keys(
            currentState.data.scenes[
              `${currentState.scene}-${currentState.setting}`
            ].datasets[d].metrics[currentState.metric] || {}
          )
        )
      : modelTypes[modelType] || [];
  currentState.selectedModels = [...new Set(modelsForType)];
  
  renderTable();
}
// ----------------------------------------------------------------
function switchNoteBox() {
  const key = currentState.task;
  $(".note-box").hide();
  $(`.note-box[data-key="${key}"]`).show();
}

function renderTable() {
  const { task, scene, setting, metric, data, modelType } = currentState;
  const sceneKey = setting ? `${scene}-${setting}` : scene;
  const sceneData = data.scenes[sceneKey];
  const datasets = sceneData.datasets;

  // 获取当前任务的目标数据集
  let datasetNames;
  if (task === "CD") {
    datasetNames = CD_TARGET_DATASETS;
  } else if (task === "ER") {
    datasetNames = ER_TARGET_DATASETS;
  } else if (task === "KT1") {
    datasetNames = KT_TARGET_DATASETS;
  } else {
    datasetNames = KT2_TARGET_DATASETS;
  }

  // 提取所有模型名
  const models = new Set();
  datasetNames.forEach((dataset) => {
    const metricData = datasets[dataset]?.metrics?.[metric];
    if (metricData) {
      Object.keys(metricData).forEach((model) => models.add(model));
    }
  });

  const modelTypes = MODEL_TYPE[task] || {};
  const allModelsOfType =
    modelType === "All" ? Array.from(models) : modelTypes[modelType] || [];

  // 过滤掉在所有数据集上都没有有效数据的模型
  const validModels = allModelsOfType.filter((model) => {
    return datasetNames.some((dataset) => {
      const value = datasets[dataset]?.metrics?.[metric]?.[model];
      return typeof value === "number";
    });
  });

  // 初始化 selectedModels 如果尚未设置
  if (
    !Array.isArray(currentState.selectedModels) ||
    currentState.selectedModels.length === 0
  ) {
    currentState.selectedModels = [...validModels];
  }

  // 应用筛选器得到最终展示的模型
  const filteredModels = validModels.filter((model) =>
    currentState.selectedModels.includes(model)
  );

  const modelsToCompare = filteredModels;

  // 筛选需要显示的数据集（至少一个模型有值）
  const filteredDatasets = datasetNames.filter((dataset) => {
    return filteredModels.some((model) => {
      const value = datasets[dataset]?.metrics?.[metric]?.[model];
      return typeof value === "number";
    });
  });

  // 表头
  let thead = `<tr><th>Model</th>`;
  filteredDatasets.forEach((dataset) => {
    thead += `<th>${dataset}</th>`;
  });
  thead += `<th class="sota-column">win</th></tr>`;

  // SOTA 统计
  const modelsWithSOTA = filteredModels.map((model) => {
    const sota = calculateSOTA(model, datasets, metric, task, filteredModels);
    return { model, win: sota.win };
  });

  // 排序
  modelsWithSOTA.sort((a, b) => {
    if (b.win !== a.win) return b.win - a.win;
    return a.model.localeCompare(b.model);
  });

  // 表体
  const tbody = modelsWithSOTA
    .map(({ model, win }) => {
      let row = `<td>${model}</td>`;

      filteredDatasets.forEach((dataset) => {
        const value = datasets[dataset]?.metrics?.[metric]?.[model];
        let displayValue;

        if (typeof value === "number") {
          displayValue = value;
        } else if (value === "OOM") {
          displayValue = `<span class="oom">OOM</span>`;
        } else if (value === "todo") {
          displayValue = `<span class="todo">todo</span>`;
        } else {
          displayValue = `<span class="na">-</span>`;
        }

        // 比较高亮（粗体、下划线）
        const isMinBetter = ["RMSE", "MAE"].includes(metric);
        const values = modelsToCompare
          .map((m) => ({
            model: m,
            value: datasets[dataset]?.metrics?.[metric]?.[m],
          }))
          .filter((entry) => typeof entry.value === "number");

        if (typeof value === "number" && values.length > 0) {
          const sorted = values.sort((a, b) =>
            isMinBetter ? a.value - b.value : b.value - a.value
          );
          const rank = sorted.findIndex((entry) => entry.model === model);
          if (rank === 0) {
            displayValue = `<strong>${displayValue}</strong>`;
          } else if (rank === 1) {
            displayValue = `<u>${displayValue}</u>`;
          }
        }

        row += `<td>${displayValue}</td>`;
      });

      row += `<td class="sota-column">${win}</td>`;
      return `<tr>${row}</tr>`;
    })
    .join("");

  // 渲染表格
  const table = `
    <table>
      <thead>${thead}</thead>
      <tbody>${tbody}</tbody>
    </table>
  `;
  $("#table-container").html(table);

  // 渲染模型筛选按钮
  renderModelFilterButtons(validModels);
}

function parseScene(sceneName) {
  if (sceneName.includes("-")) {
    const parts = sceneName.split("-");
    return { scene: parts[0], setting: parts[1] };
  } else {
    return { scene: sceneName, setting: null };
  }
}

// 工具函数：计算 SOTA
function calculateSOTA(model, datasets, metric, task, comparedModels) {
  const isMinBetter = ["RMSE", "MAE"].includes(metric);
  let win = 0;

  Object.values(datasets).forEach((dataset) => {
    const metricData = dataset.metrics?.[metric];
    if (!metricData || typeof metricData[model] !== "number") return;

    // 筛选出所有有效比较模型的值
    const entries = comparedModels
      .map((m) => ({ model: m, value: metricData[m] }))
      .filter((entry) => typeof entry.value === "number");

    if (entries.length === 0) return;

    // 按照大小排序（min better or max better）
    entries.sort((a, b) =>
      isMinBetter ? a.value - b.value : b.value - a.value
    );

    const bestModel = entries[0].model;
    if (bestModel === model) {
      win += 1;
    }
  });

  return { win };
}

// 工具函数：加载 JSON 数据
function loadData(task, callback) {
  fetch(`data/${task}.json`)
    .then((response) => response.json())
    .then((data) => callback(data))
    .catch((error) => console.error("Error loading data:", error));
}
