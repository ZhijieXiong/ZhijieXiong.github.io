$(document).ready(function () {
  const TASKS = ["KT", "CD", "ER", "LP", "OTHER"]; // 在此处添加所有任务名称
  let currentData = null;
  let currentSort = { field: "year", order: "asc" };
  let selectedTags = new Set();
  let selectedSources = new Set();
  let filterBy = "Implemented";

  // 初始化任务过滤器
  function initTaskFilters() {
    const $taskFilter = $("#taskFilter");
    TASKS.forEach((task) => {
      $taskFilter.append(`
              <button class="btn btn-outline-primary" data-task="${task}">
                  ${task}
              </button>
          `);
    });
    $("#taskFilter button").first().addClass("active");
  }

  // 加载任务数据
  function loadTaskData(taskName) {
    $.getJSON(`paperData/${taskName}.json`)
      .done((data) => {
        currentData = data;
        initTagFilters();
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

  // 初始化标签过滤器
  function initTagFilters() {
    const $tagFilter1 = $("#tagFilter1").empty();
    const $tagFilter2 = $("#tagFilter2").empty();
    const $tagFilter3 = $("#tagFilter3").empty();
    const $tagFilter4 = $("#tagFilter4").empty();

    const allTags = [...new Set(currentData.papers.flatMap((p) => p.tags))];
    allTags.forEach((tag) => {
      if (
        tag.includes("KTM") ||
        tag.includes("CDM") ||
        tag.includes("ERM")
      ) {
        $tagFilter1.append(`
                <button class="btn btn-outline-secondary" data-tag="${tag}">
                    ${tag}
                </button>
            `);
      } else if (tag.includes("Setting")) {
        $tagFilter2.append(`
            <button class="btn btn-outline-secondary" data-tag="${tag}">
                ${tag}
            </button>
        `);
      } else if (tag.includes("Modeling")) {
        $tagFilter3.append(`
            <button class="btn btn-outline-secondary" data-tag="${tag}">
                ${tag}
            </button>
        `);
      } else {
        $tagFilter4.append(`
            <button class="btn btn-outline-secondary" data-tag="${tag}">
                ${tag}
            </button>
        `);
      }
    });
    selectedTags.clear();
  }

  // 更新表格
  function updateTable() {
    if (!currentData) return;

    let filtered = currentData.papers.filter(
      (p) => {
        if (filterBy == "PyEdmine" && !p.implemented_in_pyedmine) {
          return false;
        }
        return (selectedSources.size === 0 || selectedSources.has(p.source)) &&
        (selectedTags.size === 0 || p.tags.some((t) => selectedTags.has(t)));
      }
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

  // 渲染表格
  function renderTable(groups) {
    const $tbody = $("#tableBody").empty();
    groups.forEach((group) => {
      group.papers.forEach((p) => {
        $tbody.append(`
                  <tr>
                      <td>${p.model_name}</td>
                      <td>${p.paper_title}</td>
                      <td>${p.source}</td>
                      <td>${p.year}</td>
                      <td>${
                        p.perper_link
                          ? `<a href="${p.perper_link}"  target="_blank">paper</a>`
                          : "paper"
                      }</td>
                      <td>${
                        p.official_code_link
                          ? `<a href="${p.official_code_link}"  target="_blank">code</a>`
                          : "code"
                      }</td>
                      <td>${p.implemented_in_pyedmine ? "Yes" : "No"}</td>
                      <td>${
                        p.ref_code_link === "official_code"
                          ? "<- code"
                          : p.ref_code_link
                          ? `<a href="${p.ref_code_link}"  target="_blank">ref code</a>`
                          : ""
                      }
                      </td>
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

  $("#tagFilter1").on("click", "button", function () {
    const tag = $(this).data("tag");
    $(this).toggleClass("active");
    $(this).hasClass("active")
      ? selectedTags.add(tag)
      : selectedTags.delete(tag);
    updateTable();
  });

  $("#tagFilter2").on("click", "button", function () {
    const tag = $(this).data("tag");
    $(this).toggleClass("active");
    $(this).hasClass("active")
      ? selectedTags.add(tag)
      : selectedTags.delete(tag);
    updateTable();
  });

  $("#tagFilter3").on("click", "button", function () {
    const tag = $(this).data("tag");
    $(this).toggleClass("active");
    $(this).hasClass("active")
      ? selectedTags.add(tag)
      : selectedTags.delete(tag);
    updateTable();
  });

  $("#tagFilter4").on("click", "button", function () {
    const tag = $(this).data("tag");
    $(this).toggleClass("active");
    $(this).hasClass("active")
      ? selectedTags.add(tag)
      : selectedTags.delete(tag);
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
    filterBy = filterBy === "Implemented" ? "PyEdmine" : "Implemented"
    $(this)
      .find("span")
      .html(filterBy === "Implemented" ? "Implemented" : "PyEdmine")
    updateTable();
  });

  // 初始化
  initTaskFilters();
  loadTaskData(TASKS[0]); // 默认加载第一个任务
});
