// 导出 JSON 函数
function exportObjectToJson(obj, filename) {
  const jsonStr = JSON.stringify(obj, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "data.json"; // 文件名
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

let importedData = null;

$(document).ready(function () {
  // ====== 全局变量 ======
  let selectedLevel = null; // 当前选择的关卡(level-x)
  let buildingCounts = {}; // 建筑数量记录

  // ====== 加载数据 ======
  // 假设A.json和B.json在同目录
  let landData = {}; // A数据：土地的数据
  let buildingData = {}; // B数据：建筑的信息
  let landsMatrices = {}; // C：土地数据转换为matrix
  const landSizes = {};

  $.when(
    $.getJSON("A.json", function (data) {
      landData = data;
      delete landData.order
    }),
    $.getJSON("B.json", function (data) {
      buildingData = data;
      for (const bName in buildingData) {
        landSizes[bName] = {
          "h": buildingData[bName]["height"],
          "w": buildingData[bName]["width"]
        }
      }
    }),
    $.getJSON("C.json", function (data) {
      landsMatrices = data;
    })
  ).then(function () {
    initLandSelector();
    initBuildingSelector();
  });

  // ====== 初始化选择器 A ======
  function initLandSelector() {
    const $selector = $("#land-selector");
    $selector.empty();
    $.each(landData, function (levelName, levelArray) {
      const $btn = $("<div>")
        .addClass("land-option")
        .text(levelName)
        .click(function () {
          $(".land-option").removeClass("active");
          $(this).addClass("active");
          selectedLevel = levelName;
          renderLandResults();
          $("#calc-status").text("未计算");
        });
      $selector.append($btn);
    });
  }

  // ====== 初始化选择器 B ======
  function initBuildingSelector() {
    const $selector = $("#building-selector");
    $selector.empty();
    // 创建全局 tooltip 元素
    const $tooltip = $("<div>").addClass("tooltip").appendTo("body");
    $.each(buildingData, function (name, attr) {
      buildingCounts[name] = 0;
      const $row = $("<div>").addClass("building-item");
      $row.append(
        $("<div>")
          .addClass("building-name")
          .text(name + " >")
      );

      // 建筑名称 + Tooltip
      const $nameDiv = $("<div>").addClass("building-card").text("属性");
      // 鼠标悬浮显示属性
      $nameDiv.hover(
        function (e) {
          let infoText = `宽度: ${attr.width}\n高度: ${attr.height}\n半径: ${
            attr.radius
          }\n基础分数: ${attr.basic}\n特性: ${
            attr.feature
          }\n覆盖: ${JSON.stringify(attr.cover, null, 2)}`;
          $tooltip
            .text(infoText)
            .css({
              top: e.pageY + 10 + "px",
              left: e.pageX + 10 + "px",
            })
            .fadeIn(200);
        },
        function () {
          $tooltip.fadeOut(100);
        }
      );
      // 鼠标移动时 tooltip 跟随
      $nameDiv.mousemove(function (e) {
        $tooltip.css({
          top: e.pageY + 10 + "px",
          left: e.pageX + 10 + "px",
        });
      });
      $row.append($nameDiv);

      const $actions = $("<div>").addClass("building-actions");
      const $countInput = $("<input>")
        .attr("type", "number")
        .attr("min", 0)
        .val(0)
        .on("change", function () {
          buildingCounts[name] = parseInt($(this).val()) || 0;
        });

      $("<button>")
        .text("+1")
        .click(function () {
          buildingCounts[name]++;
          $countInput.val(buildingCounts[name]);
        })
        .appendTo($actions);

      $("<button>")
        .text("-1")
        .click(function () {
          buildingCounts[name] = Math.max(0, buildingCounts[name] - 1);
          $countInput.val(buildingCounts[name]);
        })
        .appendTo($actions);

      $actions.append($countInput);

      $("<button>")
        .text("清空")
        .click(function () {
          buildingCounts[name] = 0;
          $countInput.val(0);
        })
        .appendTo($actions);

      $row.append($actions);
      $selector.append($row);
    });

    // 全部清空
    $("#clear-all-buildings").click(function () {
      $.each(buildingCounts, function (name) {
        buildingCounts[name] = 0;
      });
      $("#building-selector input[type=number]").val(0);
    });
  }

  // ====== 渲染第三排结果容器 ======
  function renderLandResults(selectedLevel) {
    const $results = $("#land-results");
    $results.empty();
    const landMatrices = landsMatrices[selectedLevel];
    const landNum = landMatrices.length;
    for (let landIdx = 0; landIdx < landNum; landIdx++) {
      const landMatrice = landMatrices[landIdx];
      const usedBuildings = importedData["placements"][landIdx]["placements"];
      const rows = landMatrice.length, cols = landMatrice[0].length;

      // ✅ 为每个地块创建独立的 map 容器
      const map = document.createElement("div");
      map.className = "map";
      map.id = `map${landIdx}`;
      const cellSize = 20; // 每个格子的像素大小
      map.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;
      map.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;

      // 可以给每个地图外层加个容器或标题
      const container = document.createElement("div");
      container.className = "map-container";

      const title = document.createElement("h4");
      title.textContent = `封地 ${landIdx + 1}`;

      container.appendChild(title);
      container.appendChild(map);
      $results.append(container);

      // 先画出所有小格子
      for (let i = 0; i < rows * cols; i++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        map.appendChild(cell);
      }

      // 再画建筑
      usedBuildings.forEach(([name, x, y]) => {
        const {h, w} = landSizes[name];

        const div = document.createElement("div");
        div.className = "building";
        div.textContent = name;

        // 用 x 控制 grid-column，用 y 控制 grid-row
        div.style.gridColumn = `${y} / ${y + w}`;
        div.style.gridRow = `${x} / ${x + h}`;

        map.appendChild(div);
      });
    }
  }

  // ====== 点击导出结果按钮 ======
  $("#export-btn").click(function () {
    if (!selectedLevel) {
      alert("请先选择一块土地！");
      return;
    }
    const filename = $("#filename").val() || "userSelection";
    exportObjectToJson(
      {
        selectedLevel,
        buildingCounts,
      },
      filename + ".json"
    );
  });

  // ====== 导入数据按钮 ======
  $("#import-btn").click(function () {
    // 触发隐藏的文件选择框
    $("#file-input").click();
  });

  // ====== 文件选择事件 ======
  $("#file-input").change(function (event) {
    const file = event.target.files[0];
    if (!file) return; // 用户取消选择
    const reader = new FileReader();
    reader.onload = function (e) {
      importedData = JSON.parse(e.target.result); // 解析JSON
      renderLandResults(file.name.split("_")[0]);
    };
    reader.readAsText(file);
  });
});
