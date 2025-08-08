function splitCamelCaseToNewline(str) {
  // 利用正则，匹配大写字母开头的单词
  const words = str.match(/[A-Z][a-z]*/g);
  // 用换行符连接
  return words.join('\n');
}

$(document).ready(function () {
  const TASKS = ["KnowledgeTracing", "CognitiveDiagnosis", "LearningPathRecommendation", "ExerciseRecommendation", "ResourceRecommendation", "ConceptRelation", "ExerciseModeling", "Other"];
  let currentData = null;
  let currentSort = { field: "year", order: "asc" };
  let selectedSources = new Set();
  let filterBy = "Implemented";

  // 初始化任务过滤器
  function initTaskFilters() {
    const $taskFilter = $("#taskFilter");
    TASKS.forEach((task) => {
      $taskFilter.append(`
              <button class="btn btn-outline-primary" data-task="${task}">
                  ${splitCamelCaseToNewline(task)}
              </button>
          `);
    });
    $("#taskFilter button").first().addClass("active");
  }

  // 加载任务数据
  function loadTaskData(taskName) {
    $.getJSON(`paperDataSimple/${taskName}.json`)
      .done((data) => {
        currentData = data;
        initSourceFilters();
        updateTable();
      })
      .fail(() => console.error("Error loading task data"));
  }

  // 初始化来源过滤器
  function initSourceFilters() {
    const $sourceFilter = $("#sourceFilter").empty();
    const allSources = [...new Set(currentData.papers.map((p) => p.source))];
    allSources.forEach((source) => {
      $sourceFilter.append(`
            <button class="btn btn-outline-info" data-source="${source}">
                ${source}
            </button>
        `);
    });
    selectedSources.clear();
  }

  function updateTable() {
    if (!currentData) return;

    let filtered = currentData.papers.filter(
      (p) => selectedSources.size === 0 || selectedSources.has(p.source)
    );

    filtered.sort((a, b) =>
      currentSort.order === "asc" ? a.year - b.year : b.year - a.year
    );

    const $taskFilter = $("#taskFilter");
    $("#taskFilter #numPaper").remove();
    $taskFilter.append(`
      <button class="btn btn-outline-primary" id="numPaper">Number of papers: ${filtered.length}</button>
  `);
    renderTable(groupByYearSource(filtered));
  }

  // 分组逻辑
  function groupByYearSource(papers) {
    const groups = {};
    papers.forEach((p) => {
      const key = `${p.year}-${p.source}`;
      groups[key] = groups[key] || {
        year: p.year,
        source: p.source,
        papers: [],
      };
      groups[key].papers.push(p);
    });
    return Object.values(groups);
  }

  function renderTable(groups) {
    const $tbody = $("#tableBody").empty();
    groups.forEach((group) => {
      group.papers.forEach((p) => {
        $tbody.append(`
        <tr>
          <td>${p.model_name}</td>
          <td>${p.paper_title}</td>
          <td>
            <details>
              <summary>
                ${p.abstract.length > 100 ? p.abstract.slice(0, 100) + '…' : p.abstract}
              </summary>
              <div>${p.abstract}</div>
            </details>
          </td>
          <td>${p.source}</td>
          <td>${p.year}</td>
        </tr>
      `);
      });
    });
  }

  // 事件处理
  $("#taskFilter").on("click", "button", function () {
    const task = $(this).data("task");
    $("#taskFilter button").removeClass("active");
    $(this).addClass("active");
    loadTaskData(task);
  });

  $("#sourceFilter").on("click", "button", function () {
    const source = $(this).data("source");
    $(this).toggleClass("active");
    $(this).hasClass("active")
      ? selectedSources.add(source)
      : selectedSources.delete(source);
    updateTable();
  });

  $("#btn-year").click(function () {
    currentSort.order = currentSort.order === "asc" ? "desc" : "asc";
    $(this)
      .find("span")
      .html(currentSort.order === "asc" ? "▲" : "▼");
    updateTable();
  });

  $("#btn-in-pyedmine").click(function () {
    filterBy = filterBy === "Implemented" ? "PyEdmine" : "Implemented";
    $(this)
      .find("span")
      .html(filterBy === "Implemented" ? "Implemented" : "PyEdmine");
    updateTable();
  });

  // 初始化
  initTaskFilters();
  loadTaskData(TASKS[0]); // 默认加载第一个任务
});
