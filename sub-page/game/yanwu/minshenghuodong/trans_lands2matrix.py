from pathlib import Path

from utils import *



if __name__ == "__main__":
    current_dir = Path(__file__).parent
    all_lands_info = load_all_lands_info(current_dir / "A.json")
    all_buildings_info = load_all_buildings_info(current_dir / "B.json")
    lands_matrix = {}
    for selectedLevel in all_lands_info["order"]:
        lands = []
        lands_info = all_lands_info[selectedLevel]["lands"]
        envs_info = all_lands_info[selectedLevel]["envs"]
        for rect_lands, rect_envs in zip(lands_info, envs_info):
            lands.append(aggregate_land(rect_lands, rect_envs)[2].tolist())
        lands_matrix[selectedLevel] = lands
    write_json(lands_matrix, current_dir / "C.json", n_levels=2)