from pathlib import Path

from utils import *


# 超参数：max_radius控制bucket的大小，score_th控制建筑交互变量的数量，solve_time控制搜索时间
max_radius = 12
score_th = 2
solve_time = 60 * 60
# 搜索空间太大，添加一些先验知识
# target_buildings: 只使用哪些建筑
all_knowledge = {
    "一块封地": [{
        "target_buildings": ["田庄", "粮仓", "米铺", "家具铺", "华表"]
    }]
}


if __name__ == "__main__":
    current_dir = Path(__file__).parent
    all_lands_info = load_all_lands_info(current_dir / "A.json")
    all_buildings_info = load_all_buildings_info(current_dir / "B.json")
    player_data = load_input_info(current_dir / "userSelection.json")
    knowledge = all_knowledge[player_data["selectedLevel"]]
    solution = solve_game_overall(all_lands_info, all_buildings_info, player_data, knowledge, max_radius, score_th, solve_time)
    if solution is not None:
        solution["knowledge"] = knowledge
        write_json(solution, current_dir / f"{player_data['selectedLevel']}_{max_radius}_{score_th}_{solve_time}.json", 3)
