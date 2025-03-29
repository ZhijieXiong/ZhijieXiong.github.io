// 初始化全局状态
let currentState = {
  task: null,
  scene: null,
  setting: null,
  metric: null,
  data: null,
};

// 任务列表（固定）
const TASKS = ["KT", "CD", "ER"];
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
  // "junyi2015",
  // "edi2020-task1"
];
const CD_TARGET_DATASETS = [
  "assist2009",
  "assist2017",
  "statics2011",
  "edi2020-task34",
  "slepemapy-anatomy",
  "SLP-mat",
  "SLP-phy"
];
const ER_TARGET_DATASETS = [
  "assist2009",
  "assist2017",
  "statics2011",
  "edi2020-task34",
  "slepemapy-anatomy",
];
const MODEL_TYPE = {
  KT: {
    "Concept Level": ["DKT", "DKVMN", "DKTForget", "ATKT"],
    "Question Level": ["qDKT", "AKT", "SimpleKT", "SparseKT", "DIMKT", "LPKT", "LBKT", "MIKT", "QIKT", "QDCKT", "DyGKT", "GRKT"],
    // 添加更多类型...
  },
  CD: {

  },
  ER: {

  },
};

// 初始化页面
$(document).ready(function () {
  // 默认加载 KT > overall > AUC
  const defaultTask = "KT";
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
  });
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
}

function onTaskSelect(e) {
  const task = $(e.target).data("task");
  currentState.task = task;
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
  renderTable();
}
// ----------------------------------------------------------------

function renderTable() {
  const { task, scene, setting, metric, data, modelType } = currentState;
  const sceneKey = setting ? `${scene}-${setting}` : scene;
  const sceneData = data.scenes[sceneKey];
  const datasets = sceneData.datasets;

  // 提取所有模型和数据集
  const models = new Set();
  let datasetNames;
  if (task == "CD") {
    datasetNames = CD_TARGET_DATASETS;
  } else if (task == "ER") {
    datasetNames = ER_TARGET_DATASETS;
  } else {
    datasetNames = KT_TARGET_DATASETS;
  }

  // 遍历数据集收集模型
  datasetNames.forEach((dataset) => {
    Object.keys(datasets[dataset].metrics[metric]).forEach((model) => {
      models.add(model);
    });
  });

  // 根据模型类型过滤模型
  const modelTypes = MODEL_TYPE[task];
  let filteredModels;
  if (modelType === "All") {
    filteredModels = Array.from(models);
  } else {
    filteredModels = modelTypes[modelType] || [];
  }

  // 获取当前要比较的模型列表
  const modelsToCompare = modelType === "All" 
    ? Array.from(models) 
    : modelTypes[modelType] || [];

  // 构建表头
  let thead = `<tr><th>Model</th>`;
  datasetNames.forEach((dataset) => {
    thead += `<th colspan="1">${dataset}</th>`;
  });
  thead += `<th class="sota-column">win</th></tr>`;

  // 构建数据行
  const tbody = Array.from(filteredModels)
    .map((model) => {
      let row = `<td>${model}</td>`;
      datasetNames.forEach((dataset) => {
        const value = datasets[dataset].metrics[metric][model];
        let displayValue;
        if (typeof value === "number") {
          displayValue = value;
        } else if (value === "OOM") {
          displayValue = '<span class="oom">OOM</span>';
        } else if (value === "todo") {
          displayValue = '<span class="todo">todo</span>';
        } else if (value === "-") {
          displayValue = '<span class="na">-</span>';
        } else if (value === "" || value === undefined) {
          displayValue = '<span class="na">-</span>';
        } else {
          displayValue = value;
        }

        // 性能值比较 - 只比较当前模型类型中的模型
        const isMinBetter = ["RMSE", "MAE"].includes(metric);
        const values = modelsToCompare
          .map(m => ({ model: m, value: datasets[dataset].metrics[metric][m] }))
          .filter(entry => typeof entry.value === "number");

        if (values.length > 0) {
          const sorted = values.sort((a, b) =>
            isMinBetter ? a.value - b.value : b.value - a.value
          );

          // 找到当前模型的值
          const currentModelValue = datasets[dataset].metrics[metric][model];
          if (typeof currentModelValue === "number") {
            const rank = sorted.findIndex((item) => item.model === model);
            if (rank === 0) {
              // 最好的值，加粗
              displayValue = `<strong>${displayValue}</strong>`;
            } else if (rank === 1) {
              // 第二好的值，加下划线
              displayValue = `<u>${displayValue}</u>`;
            }
          }
        }

        row += `<td>${displayValue}</td>`;
      });

      // 计算 SOTA
      const sota = calculateSOTA(model, datasets, metric, task);
      row += `<td class="sota-column">${sota.win}</td>`;
      return `<tr>${row}</tr>`;
    })
    .join("");

  // 插入表格
  const table = `
      <table>
          <thead>${thead}</thead>
          <tbody>${tbody}</tbody>
      </table>
  `;
  $("#table-container").html(table);
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
function calculateSOTA(model, datasets, metric, task) {
  let win = 0;
  const isMinBetter = ["RMSE", "MAE"].includes(metric);
  let targetDataset;
  if (task == "CD") {
    targetDataset = CD_TARGET_DATASETS;
  } else if (task == "ER") {
    targetDataset = ER_TARGET_DATASETS;
  } else {
    targetDataset = KT_TARGET_DATASETS;
  }

  Object.entries(datasets).forEach(([datasetName, dataset]) => {
    // 跳过非目标数据集
    if (!targetDataset.includes(datasetName)) return;

    const values = dataset.metrics[metric];
    if (!values) return;

    // 获取当前任务的所有模型
    const allModels = Object.keys(values);
    
    // 获取当前选择的模型类型对应的模型列表
    const modelTypes = MODEL_TYPE[task] || {};
    let modelsToCompare = allModels; // 默认比较所有模型
    
    if (currentState.modelType && currentState.modelType !== "All") {
      modelsToCompare = modelTypes[currentState.modelType] || [];
    }

    // 过滤有效数值，并且只比较当前模型类型中的模型
    const validEntries = allModels
      .filter(m => modelsToCompare.includes(m)) // 只比较当前类型的模型
      .map(m => ({ model: m, value: values[m] }))
      .filter(entry => typeof entry.value === "number");

    if (validEntries.length === 0) return;

    // 找出最优值
    const sorted = validEntries.sort((a, b) =>
      isMinBetter ? a.value - b.value : b.value - a.value
    );
    const bestValue = sorted[0].value;

    // 统计当前模型的胜负
    const modelValue = values[model];
    if (typeof modelValue !== "number") return;

    if (modelValue === bestValue) {
      // 检查是否有并列第一
      const isTie = sorted.filter(item => item.value === bestValue).length > 1;
      if (!isTie) win++;
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
