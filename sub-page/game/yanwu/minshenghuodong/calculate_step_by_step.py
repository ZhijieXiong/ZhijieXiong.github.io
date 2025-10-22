from pathlib import Path

from utils import *


# 超参数：score_th控制建筑交互变量的数量（即只有交互分数超过score_th的才会在交互约束中被考虑），solve_time控制单块地的搜索时间
score_th = 2
solve_time = 60 * 150
# 搜索空间太大，添加一些先验知识
# target_buildings: 只使用哪些建筑
all_knowledge = {
    "一块封地": [{
        "target_buildings": ["田庄", "粮仓", "米铺", "家具铺", "华表", "井栏"]
    }],
    "两块封地": [{
        "target_buildings": ["田庄", "粮仓", "米铺", "家具铺", "华表", "井栏"]
    }, {
        "target_buildings": ["田庄", "粮仓", "米铺", "井栏", "华表", "凿石所", "石雕铺"]
    }],
    "两块半封地": [{
        "target_buildings": ["田庄", "粮仓", "米铺", "家具铺", "华表", "井栏"]
    }, {
        "target_buildings": ["田庄", "粮仓", "米铺", "井栏", "华表", "凿石所", "石雕铺"]
    }, {
        "target_buildings": ["伐木场", "木仓", "食肆", "家具铺", "凿石所", "石雕铺"]
    }],
    "三块封地": [{
        "target_buildings": ["田庄", "粮仓", "米铺", "家具铺", "华表", "井栏"]
    }, {
        "target_buildings": ["田庄", "粮仓", "米铺", "井栏", "华表", "凿石所", "石雕铺"]
    }, {
        "target_buildings": ["伐木场", "木仓", "食肆", "家具铺", "凿石所", "石雕铺"]
    }],
    "三块半封地": [{
        "target_buildings": ["田庄", "粮仓", "米铺", "家具铺", "华表", "井栏"]
    }, {
        "target_buildings": ["田庄", "粮仓", "米铺", "井栏", "华表", "凿石所", "石雕铺"]
    }, {
        "target_buildings": ["伐木场", "木仓", "食肆", "家具铺", "凿石所", "石雕铺", "华表"]
    }, {
       "target_buildings": ["伐木场", "木仓", "粮仓", "华表"]
    }],
    "四块封地": [{
        "target_buildings": ["田庄", "粮仓", "米铺", "家具铺", "华表", "井栏"]
    }, {
        "target_buildings": ["田庄", "粮仓", "米铺", "井栏", "华表", "凿石所", "石雕铺"]
    }, {
        "target_buildings": ["伐木场", "木仓", "食肆", "家具铺", "凿石所", "石雕铺", "华表"]
    }, {
       "target_buildings": ["田庄", "粮仓", "米铺", "伐木场", "木仓", "粮仓", "凿石所", "石雕铺", "华表"]
    }],
}


if __name__ == "__main__":
    current_dir = Path(__file__).parent
    all_lands_info = load_all_lands_info(current_dir / "A.json")
    all_buildings_info = load_all_buildings_info(current_dir / "B.json")
    player_data = load_input_info(current_dir / "userSelection.json")
    knowledge = all_knowledge[player_data["selectedLevel"]]
    solution = solve_game_step_by_step(all_lands_info, all_buildings_info, player_data, knowledge, score_th, solve_time)
    if solution is not None:
        solution["knowledge"] = knowledge
        write_json(solution, current_dir / f"{player_data['selectedLevel']}_step_solution_{score_th}_{solve_time}.json", 3)
