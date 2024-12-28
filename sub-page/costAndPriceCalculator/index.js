function getNumberInput(selector) {
  // 检查元素是否存在
  if ($(selector).length === 0) {
    return null;
  }

  let value = parseFloat($(selector).val());
  return value;
}

function removeLocalStorageItemByNotes(calculatorName, notesToRemove) {
  // 从 localStorage 获取数据
  const storedData = localStorage.getItem(calculatorName);

  // 检查是否存储了数据
  if (storedData) {
    // 解析数据为数组
    let data = JSON.parse(storedData);

    // 过滤掉包含特定 note 的对象
    data = data.filter((item) => item.notes !== notesToRemove);

    // 将过滤后的数组转换回字符串并存储回 localStorage
    localStorage.setItem(calculatorName, JSON.stringify(data));
  }
}

// 成本计算的输入读取
function setCostCalculatorInput(costCalculatorData) {
  const inputData = costCalculatorData["input"];
  inputData["totalCost"] = getNumberInput("#cost-calculator-total-cost");
  inputData["totalCountUnit"] = getNumberInput(
    "#cost-calculator-total-count-unit"
  );
  inputData["targetCountUnit"] = getNumberInput(
    "#cost-calculator-target-count-unit"
  );
  inputData["notes"] = $("#cost-calculator-notes").val();
}

// 计算单个成本，并输出到页面
function setCostCalculatorOutputItem(costCalculatorData) {
  const inputData = costCalculatorData["input"];
  let totalCost = inputData["totalCost"];
  let totalCountUnit = inputData["totalCountUnit"];
  let targetCountUnit = inputData["targetCountUnit"];
  let notes = inputData["notes"];

  if (isNaN(totalCost) || isNaN(totalCountUnit) || isNaN(targetCountUnit)) {
    alert("总单位、总价格和目标单位均不能为空！");
    return null;
  }

  if (notes === "") {
    notes = "?的成本";
  }

  let costResult = parseFloat(
    ((totalCost / totalCountUnit) * targetCountUnit).toFixed(3)
  );
  costCalculatorData["output"].push({
    notes: notes,
    cost: costResult,
  });
  const costItem = $('<div class="calculator-output-item"></div>')
    .append('<button class="delete-btn">删除</button>') // 添加删除按钮
    .append(
      '<div class="item-section"><span>' +
        notes +
        "</span><span>：</span><span>" +
        costResult +
        "</span></div>"
    );

  $("#cost-calculator-output-item-list").append(costItem);
  $("#cost-calculator-output-item-list")
    .find(".calculator-output-item:last")
    .find(".delete-btn")
    .on("click", function () {
      // 从数据中删除
      costCalculatorData["output"] = costCalculatorData["output"].filter(
        (item) => item["notes"] !== notes
      );
      $(this).closest(".calculator-output-item").remove();
    });
}

function setHistoryCostOutputItem(costCalculatorData) {
  // 读取现有的 localStorage 数据
  const storedData = localStorage.getItem("cost-calculator-output");

  // 将读取的数据解析回数组，如果数据不存在则初始化为空数组
  let data = storedData ? JSON.parse(storedData) : [];

  // 遍历 newItemArray 数组，对每个元素进行去重检查
  $("#history-cost-calculator-output-item-list").empty();
  data.forEach((item) => {
    const costItem = $('<div class="calculator-output-item"></div>')
      .append('<button class="delete-btn">删除</button>') // 添加删除按钮
      .append(
        '<div class="item-section"><span>' +
          item["notes"] +
          "</span><span>：</span><span>" +
          item["cost"] +
          "</span></div>"
      )
      .append('<button class="import-btn">导入成本计算</button>'); // 添加删除按钮;

    $("#history-cost-calculator-output-item-list").append(costItem);
    $("#history-cost-calculator-output-item-list")
      .find(".calculator-output-item:last")
      .find(".delete-btn")
      .on("click", function () {
        removeLocalStorageItemByNotes("cost-calculator-output", item["notes"]);
        $(this).closest(".calculator-output-item").remove();
      });

    // 为导入成本计算按钮添加点击事件监听器
    $("#history-cost-calculator-output-item-list")
      .find(".calculator-output-item:last")
      .find(".import-btn")
      .on("click", function () {
        // 将历史数据添加到outputData中
        costCalculatorData["output"].push({
          notes: item["notes"],
          cost: item["cost"],
        });

        const costItem = $('<div class="calculator-output-item"></div>')
          .append('<button class="delete-btn">删除</button>') // 添加删除按钮
          .append(
            '<div class="item-section"><span>' +
              item["notes"] +
              "</span><span>：</span><span>" +
              item["cost"] +
              "</span></div>"
          );

        // 将新元素插入到#cost-calculator-output-item-list中
        $("#cost-calculator-output-item-list").append(costItem);
        $("#cost-calculator-output-item-list")
          .find(".calculator-output-item:last")
          .find(".delete-btn")
          .on("click", function () {
            // 从数据中删除
            costCalculatorData["output"] = costCalculatorData["output"].filter(
              (costOutputItem) => costOutputItem["notes"] !== item["notes"]
            );
            $(this).closest(".calculator-output-item").remove();
          });
      });
  });
}

// 检查价格制定的自定义的成本输入
function chkeckCustomCostInput(customCost) {
  const regex = /^\s*(\d+(\.\d+)?)(\s+\d+(\.\d+)?)*\s*$/;
  return regex.test(customCost);
}

// 获取自定义的成本输入的总和
function getCustomTotalCost(customCost) {
  const allCost = customCost
    .split(" ")
    .map((cost) => cost.trim())
    .filter((cost) => cost !== "");

  let totalCost = 0;
  for (cost of allCost) {
    totalCost += parseFloat(cost);
  }
  return totalCost;
}

// 价格计算的输入读取
function setPriceCalculatorInput(priceCalculatorData) {
  const inputData = priceCalculatorData["input"];
  inputData["costInputSet"] = $(
    'input[name="price-calculator-input-selection"]:checked'
  ).val();
  inputData["profitSet"] = $(
    'input[name="price-calculator-profit-selection"]:checked'
  ).val();
  inputData["customCost"] = $("#price-calculator-custom-input").val();
  inputData["profit"] = getNumberInput("#price-calculator-profit-input");
  inputData["notes"] = $("#price-calculator-notes").val();
}

// 计算价格制定的结果，并输出到页面
function setPriceCalculatorOutputItem(costCalculatorData, priceCalculatorData) {
  const inputData = priceCalculatorData["input"];
  let costInputSet = inputData["costInputSet"];
  let profitSet = inputData["profitSet"];
  let customCost = inputData["customCost"];
  let profit = inputData["profit"];
  let notes = inputData["notes"];

  let price;
  let cost;
  if (costInputSet === "custom") {
    if (chkeckCustomCostInput(customCost)) {
      cost = getCustomTotalCost(customCost);
    } else {
      alert("自定义成本输入格式有误！");
      return null;
    }
  } else {
    cost = 0;
    if (costCalculatorData["output"].length === 0) {
      alert("成本计算的计算结果为空！");
      return null;
    } else {
      for (costOutput of costCalculatorData["output"]) {
        cost += costOutput["cost"];
      }
    }
  }

  if (notes === "") {
    notes = "?的价格";
  }

  if (profitSet === "profitMargin") {
    if (profit < 0 || profit >= 100) {
      alert("选择基于利润率计算，则利润设置必须大于等于0，且小于100");
      return null;
    } else {
      price = cost / (1 - profit / 100);
    }
    notes += "，利润率" + profit + "%";
  } else {
    price = cost + profit;
    notes += "，利润" + profit;
  }
  price = parseFloat(price.toFixed(3));

  priceCalculatorData["output"].push({
    notes: notes,
    price: price,
  });

  const costItem = $('<div class="calculator-output-item"></div>')
    .append('<button class="delete-btn">删除</button>') // 添加删除按钮
    .append(
      '<div class="item-section"><span>' +
        notes +
        "</span><span>：</span><span>" +
        price +
        "</span></div>"
    );

  $("#price-calculator-output-item-list").append(costItem);

  // 为删除按钮添加点击事件监听器
  $("#price-calculator-output-item-list")
    .find(".calculator-output-item:last")
    .find(".delete-btn")
    .on("click", function () {
      // 从数据中删除
      priceCalculatorData["output"] = priceCalculatorData["output"].filter(
        (item) => item["notes"] !== notes
      );
      $(this).closest(".calculator-output-item").remove();
    });
}

function setHistoryPriceOutputItem() {
  // 读取现有的 localStorage 数据
  const storedData = localStorage.getItem("price-calculator-output");

  // 将读取的数据解析回数组，如果数据不存在则初始化为空数组
  let data = storedData ? JSON.parse(storedData) : [];

  // 遍历 newItemArray 数组，对每个元素进行去重检查
  $("#history-price-calculator-output-item-list").empty();
  data.forEach((item) => {
    const costItem = $('<div class="calculator-output-item"></div>')
      .append('<button class="delete-btn">删除</button>') // 添加删除按钮
      .append(
        '<div class="item-section"><span>' +
          item["notes"] +
          "</span><span>：</span><span>" +
          item["price"] +
          "</span></div>"
      );

    // 将新元素插入到#cost-calculator-output-item-list中
    $("#history-price-calculator-output-item-list").append(costItem);
    $("#history-price-calculator-output-item-list")
      .find(".calculator-output-item:last")
      .find(".delete-btn")
      .on("click", function () {
        removeLocalStorageItemByNotes("price-calculator-output", item["notes"]);
        $(this).closest(".calculator-output-item").remove();
      });
  });
}

// 存储数据
function saveCalculatorOuput(calculatorName, calculatorData) {
  // 读取现有的 localStorage 数据
  const storedData = localStorage.getItem(calculatorName);

  // 将读取的数据解析回数组，如果数据不存在则初始化为空数组
  let data = storedData ? JSON.parse(storedData) : [];

  // 遍历 newItemArray 数组，对每个元素进行去重检查
  calculatorData["output"].forEach((newItem) => {
    // 检查数组中是否已存在具有相同 "notes" 属性的对象
    const isDuplicate = data.some((item) => item.notes === newItem.notes);

    // 如果不是重复项，则添加到数组中
    if (!isDuplicate) {
      data.push(newItem);
    }
  });

  // 将更新后的数组转换回字符串并存储回 localStorage
  localStorage.setItem(calculatorName, JSON.stringify(data));
}

$(document).ready(function () {
  // 数据初始化
  data = {
    costCalculator: {
      input: {},
      output: [],
    },
    priceCalculator: {
      input: {},
      output: [],
    },
  };

  $("#cost-calculator-btn").on("click", function () {
    setCostCalculatorInput(data["costCalculator"]);
    setCostCalculatorOutputItem(data["costCalculator"]);
  });

  $("#price-calculator-btn").on("click", function () {
    setPriceCalculatorInput(data["priceCalculator"]);
    setPriceCalculatorOutputItem(
      data["costCalculator"],
      data["priceCalculator"]
    );
  });

  $("#cost-calculator-output-save-btn").on("click", function () {
    saveCalculatorOuput("cost-calculator-output", data["costCalculator"]);
  });
  $("#price-calculator-output-save-btn").on("click", function () {
    saveCalculatorOuput("price-calculator-output", data["priceCalculator"]);
  });

  $("#cost-calculator-output-read-btn").on("click", function () {
    setHistoryCostOutputItem(data["costCalculator"]);
  });
  $("#price-calculator-output-read-btn").on("click", function () {
    setHistoryPriceOutputItem();
  });
});
