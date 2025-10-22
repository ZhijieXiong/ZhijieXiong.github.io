import json
import math
import sys
from collections import defaultdict

import numpy as np
from tqdm import tqdm
from copy import deepcopy
from ortools.sat.python import cp_model


ENV_TABLE = {
    "水": 2,
    "树": 3,
    "石": 4
}
ENV_LOOKUP = {
    2: "水",
    3: "树",
    4: "石"
}
ZH2EN = {
    "田庄": "f1",
    "粮仓": "g1",
    "井栏": "w1",
    "伐木场": "l1",
    "木仓": "l2",
    "凿石所": "q1",
    "石仓": "s1",
    "民坊": "w2",
    "家具铺": "f2",
    "米铺": "r1",
    "石雕铺": "s2",
    "食肆": "e1",
    "漆器坊": "l3",
    "会市": "m1",
    "华表": "h1"
}


def read_json(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        result = json.load(f)
    return result


def write_json(data, file_path, n_levels=2):
    """
    将数据存储为JSON文件，并且指定前n个层级有缩进。

    参数：
    - data: 要保存的Python数据（如字典、列表等）
    - file_path: 保存的JSON文件路径
    - n_levels: 前n个层级的缩进级别
    """

    def custom_indent(obj, level=0):
        """
        自定义缩进，只有在层级小于n_levels时应用缩进。
        """
        if level >= n_levels:
            return json.dumps(obj, ensure_ascii=False)

        if isinstance(obj, dict):
            obj_str = "{\n"
            for idx, (key, value) in enumerate(obj.items()):
                indent = "  " * level
                obj_str += f'{indent}"{key}": {custom_indent(value, level + 1)}'
                if idx < len(obj) - 1:
                    obj_str += ","
                obj_str += "\n"
            obj_str += "  " * (level - 1) + "}"
            return obj_str
        elif isinstance(obj, list):
            obj_str = "[\n"
            for idx, value in enumerate(obj):
                indent = "  " * level
                obj_str += f'{indent}{custom_indent(value, level + 1)}'
                if idx < len(obj) - 1:
                    obj_str += ","
                obj_str += "\n"
            obj_str += "  " * (level - 1) + "]"
            return obj_str
        else:
            return json.dumps(obj, ensure_ascii=False)

    # 调用自定义缩进函数并将JSON数据保存到文件
    json_data = custom_indent(data, 1)
    with open(file_path, 'w', encoding="utf-8") as f:
        f.write(json_data)


def load_all_lands_info(data_path):
    all_lands_info = read_json(data_path)
    order = all_lands_info["order"]
    for lands_name in order:
        lands = all_lands_info[lands_name]["lands"]
        for i, rect_lands in enumerate(lands):
            if type(rect_lands) is str:
                target_land_level, j = rect_lands.split("|")
                j = int(j)
                lands[i] = deepcopy(all_lands_info[target_land_level]["lands"][j])
        envs = all_lands_info[lands_name]["envs"]
        for i, rect_envs in enumerate(envs):
            if type(rect_envs) is str:
                target_land_level, j = rect_envs.split("|")
                j = int(j)
                envs[i] = deepcopy(all_lands_info[target_land_level]["envs"][j])

    return all_lands_info


def load_all_buildings_info(data_path):
    return read_json(data_path)


def load_input_info(data_path):
    return read_json(data_path)


def aggregate_land(rect_lands, rect_envs):
    rects = rect_lands + rect_envs
    most_left = 10000
    most_right = -10000
    most_top = 10000
    most_bottom = -10000
    for rect in rects:
        x = rect["left-top"][0]
        y = rect["left-top"][1]
        if x < most_left:
            most_left = x
        if y < most_top:
            most_top = y
        x = x + rect["width"] - 1
        y = y + rect["height"] - 1
        if x > most_right:
            most_right = x
        if y > most_bottom:
            most_bottom = y
    n_row = most_bottom - most_top + 1
    n_col = most_right - most_left + 1
    grids = np.zeros((n_row, n_col), dtype=int)
    for rect in rects:
        row_start = rect["left-top"][1] - most_top
        row_end = rect["left-top"][1] + rect["height"] - most_top
        col_start = rect["left-top"][0] - most_left
        col_end = rect["left-top"][0] + rect["width"] - most_left
        grids[row_start:row_end, col_start:col_end] = 1 if "type" not in rect else ENV_TABLE[rect["type"]]
    return most_left, most_top, grids


def solve_one_grid(grid, target_buildings_info, player_data, score_th=3, solve_time=3600):
    model = cp_model.CpModel()
    # 保存候选放置
    all_placements = []  # (grid_id, b_name, top_left, cells, center, basic_score)
    placement_vars = []  # OR-Tools BoolVar
    print("生成所有候选位置······")
    g_row, g_col = grid.shape
    for b_name, b_info in target_buildings_info.items():
        b_w = int(b_info["width"])
        b_h = int(b_info["height"])
        # 遍历左上角 (r,c)
        for r in range(0, g_row - b_h + 1):
            for c in range(0, g_col - b_w + 1):
                # 检查合法性：矩形内所有格必须为 1（可放）
                if not np.all(grid[r:r + b_h, c:c + b_w] == 1):
                    continue
                # center: 以格子中心为整数坐标，矩形中心为 (top + (b_h-1)/2)
                center_row = r + (b_h - 1) / 2.0
                center_col = c + (b_w - 1) / 2.0
                p = {
                    "type": b_name,
                    "top_left": (r, c),
                    "cells": [(r + dr, c + dc) for dr in range(b_h) for dc in range(b_w)],
                    "center": (center_row, center_col),
                    "basic": float(b_info["basic"]),
                    "radius": float(b_info["radius"])
                }
                all_placements.append(p)
                placement_vars.append(model.NewBoolVar(f"{ZH2EN[b_name]}_{r}_{c}"))

    # --- 约束1: 每格最多一个建筑 ---
    print("添加约束1：每格最多一个建筑······")
    cell_map = {}  # (r,c) -> list of idx
    for idx, p in enumerate(all_placements):
        for cell in p["cells"]:
            cell_map.setdefault(cell, []).append(idx)
    # 添加约束
    for cell, indices in cell_map.items():
        if len(indices) > 1:
            vars_ = [placement_vars[i] for i in indices]
            model.Add(sum(vars_) <= 1)

    # --- 约束2: 建筑数量 ---
    print("添加约束2：每种建筑数量不能超过拥有数量······")
    for b_name in target_buildings_info.keys():
        indices = [i for i, p in enumerate(all_placements) if p["type"] == b_name]
        num_b = int(player_data["buildingCounts"].get(b_name, 0))
        if num_b > 0 and len(indices) > 0:
            vars_ = [placement_vars[i] for i in indices]
            model.Add(sum(vars_) <= num_b)

    # --- 目标构造 ---
    objective_terms = []
    print("计算基础分数······")
    for idx, p in enumerate(all_placements):
        objective_terms.append(p["basic"] * placement_vars[idx])

    # --- 预构建空间哈希 buckets 用于快速查找近邻 ---
    max_radius = max([b_info.get("radius", 0) for b_info in target_buildings_info.values()])
    print("构建空间桶以减少 pairwise 比较······")
    buckets = {}
    for idx, p in enumerate(all_placements):
        cx, cy = p["center"]
        bi = int(math.floor(cx / max_radius))
        bj = int(math.floor(cy / max_radius))
        buckets.setdefault((bi, bj), []).append(idx)

    # --- 交互分数：建筑-建筑 (只在同一 grid 内考虑) ---
    print("计算建筑之间的交互分数······")
    created_pairs = 0
    for idx_i, p_i in enumerate(tqdm(all_placements, desc="计算建筑与环境之间的交互分数")):
        cx_i, cy_i = p_i["center"]
        r_i = p_i["radius"]
        if r_i <= 0:
            continue
        # 得到 i 所在桶 index
        bi = int(math.floor(cx_i / max_radius))
        bj = int(math.floor(cy_i / max_radius))
        # 检查周围 3x3 个桶（包含自身）中的候选
        neighbor_indices = []
        for di in (-1, 0, 1):
            for dj in (-1, 0, 1):
                key = (bi + di, bj + dj)
                if key in buckets:
                    neighbor_indices.extend(buckets[key])
        # 去重并遍历
        for idx_j in neighbor_indices:
            if idx_j <= idx_i:
                # 保证每对只处理一次（i<j），但要注意方向性：A覆盖B != B覆盖A，所以仍需二向判断
                continue
            p_j = all_placements[idx_j]
            # 快速包络判断：若 dx 或 dy 超过 r_i，则不可能
            dx = p_j["center"][0] - cx_i
            if abs(dx) > r_i:
                continue
            dy = p_j["center"][1] - cy_i
            if abs(dy) > r_i:
                continue
            dist = math.hypot(dx, dy)
            # 注意：覆盖是有向的，需检查 both directions separately
            x_i = placement_vars[idx_i]
            x_j = placement_vars[idx_j]
            # i -> j
            if dist < r_i:
                score_ij = target_buildings_info[p_i["type"]]["cover"].get(p_j["type"], 0)
                if score_ij < 0:
                    # 负分：不允许 i 和 j 同时选
                    model.Add(x_i + x_j <= 1)
                elif score_ij > score_th:
                    # 线性化 y_ij = x_i & x_j
                    y_ij = model.NewBoolVar(f"i2j_{idx_i}_{idx_j}")
                    # ChatGPT说这样写，通常比 AddMultiplicationEquality 更高效（尤其当变量很多时）
                    model.Add(y_ij <= x_i)
                    model.Add(y_ij <= x_j)
                    model.Add(y_ij >= x_i + x_j - 1)
                    objective_terms.append(score_ij * y_ij)
                    created_pairs += 1
            # j -> i (separate var)
            r_j = p_j["radius"]
            if r_j > 0 and dist < r_j:
                score_ji = target_buildings_info[p_j["type"]]["cover"].get(p_i["type"], 0)
                if score_ji < 0:
                    # 负分：不允许 i 和 j 同时选
                    model.Add(x_i + x_j <= 1)
                elif score_ji > score_th:
                    y_ji = model.NewBoolVar(f"j2i_{idx_i}_{idx_j}")
                    model.Add(y_ji <= x_i)
                    model.Add(y_ji <= x_j)
                    model.Add(y_ji >= x_i + x_j - 1)
                    objective_terms.append(score_ji * y_ji)
                    created_pairs += 1

    print(f"创建的交互线性变量数量（近似）: {created_pairs}")

    # --- 交互分数：建筑-环境 ---
    for idx, p in enumerate(all_placements):
        cx, cy = p["center"]
        r_i = p["radius"]
        if r_i <= 0:
            continue
        g_row, g_col = len(grid), len(grid[0])
        for rr in range(g_row):
            for cc in range(g_col):
                grid_value = grid[rr][cc]
                if grid_value <= 1:
                    continue
                env_name = ENV_LOOKUP[grid_value]
                # env center at (rr, cc)
                dx = rr - cx
                dy = cc - cy
                if abs(dx) > r_i or abs(dy) > r_i:
                    continue
                dist = math.hypot(dx, dy)
                if dist < r_i:
                    score = target_buildings_info[p["type"]]["cover"].get(env_name, 0)
                    if score != 0:
                        objective_terms.append(score * placement_vars[idx])

    model.Maximize(sum(objective_terms))
    # --- 求解 ---
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = solve_time
    solver.parameters.log_search_progress = True
    status = solver.Solve(model)

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        result = {
            "best score": solver.ObjectiveValue(),
            "placements": []
        }
        for idx, var in enumerate(placement_vars):
            if solver.Value(var):
                placement = all_placements[idx]
                result["placements"].append((placement["type"], placement["top_left"][0], placement["top_left"][1]))
        return result
    else:
        return None

def solve_game_step_by_step(
        all_lands_info,
        all_buildings_info,
        player_data,
        knowledge,
        score_th=3, solve_time=3600
):
    lands = []
    lands_info = all_lands_info[player_data["selectedLevel"]]["lands"]
    envs_info = all_lands_info[player_data["selectedLevel"]]["envs"]
    for rect_lands, rect_envs in zip(lands_info, envs_info):
        lands.append(aggregate_land(rect_lands, rect_envs))
    grids = [land[-1] for land in lands]

    grids_result = {
        "best score": 0,
        "placements": []
    }
    buildingCounts = player_data["buildingCounts"]
    for g_id, grid in enumerate(grids):
        print(f"============================求解第{g_id+1}块土地============================")
        # 如果某种建筑数量非常少，将其排除在knowledge之外（除了几个特殊建筑意外），减少变量
        target_buildings_info = {b_name: all_buildings_info[b_name] for b_name in knowledge[g_id]["target_buildings"]}
        for b_name in target_buildings_info.keys():
            if b_name in ["华表", "漆器坊", "食肆"]:
                if buildingCounts[b_name] == 0:
                    del target_buildings_info[b_name]
            else:
                if buildingCounts[b_name] < 3:
                    del target_buildings_info[b_name]
        grid_result = solve_one_grid(grid, target_buildings_info, player_data, score_th, solve_time)
        if grid_result is None:
            sys.exit("中间计算有误，退出")
        grids_result["placements"].append(grid_result)
        grids_result["best score"] += grid_result["best score"]
        for placement in grid_result["placements"]:
            b_name = placement[0]
            buildingCounts[b_name] -= 1
            buildingCounts[b_name] = max(0, buildingCounts[b_name])
        print(f"========================================================================")
    return grids_result

def solve_game_overall(
        all_lands_info,
        all_buildings_info,
        player_data,
        knowledge,
        max_radius=4, score_th=3, solve_time=3600
):
    lands = []
    lands_info = all_lands_info[player_data["selectedLevel"]]["lands"]
    envs_info = all_lands_info[player_data["selectedLevel"]]["envs"]
    for rect_lands, rect_envs in zip(lands_info, envs_info):
        lands.append(aggregate_land(rect_lands, rect_envs))
    grids = [land[-1] for land in lands]

    model = cp_model.CpModel()
    # 保存候选放置
    all_placements = []  # (grid_id, b_name, top_left, cells, center, basic_score)
    placement_vars = []  # OR-Tools BoolVar
    print("生成所有候选位置······")
    for g_id, grid in enumerate(grids):
        g_row, g_col = grid.shape
        for b_name, b_info in all_buildings_info.items():
            if b_name not in knowledge[g_id]["target_buildings"]:
                continue
            b_w = int(b_info["width"])
            b_h = int(b_info["height"])
            # 遍历左上角 (r,c)
            for r in range(0, g_row - b_h + 1):
                for c in range(0, g_col - b_w + 1):
                    # 检查合法性：矩形内所有格必须为 1（可放）
                    if not np.all(grid[r:r + b_h, c:c + b_w] == 1):
                        continue
                    # center: 以格子中心为整数坐标，矩形中心为 (top + (b_h-1)/2)
                    center_row = r + (b_h - 1) / 2.0
                    center_col = c + (b_w - 1) / 2.0
                    p = {
                        "grid_id": g_id,
                        "type": b_name,
                        "top_left": (r, c),
                        "cells": [(r + dr, c + dc) for dr in range(b_h) for dc in range(b_w)],
                        "center": (center_row, center_col),
                        "basic": float(b_info["basic"]),
                        "radius": float(b_info["radius"])
                    }
                    all_placements.append(p)
                    placement_vars.append(model.NewBoolVar(f"{g_id}_{ZH2EN[b_name]}_{r}_{c}"))

    # --- 约束1: 每格最多一个建筑 ---
    print("添加约束1：每格最多一个建筑······")
    for g_id, grid in enumerate(grids):
        cell_map = {}  # (r,c) -> list of idx
        for idx, p in enumerate(all_placements):
            if p["grid_id"] != g_id:
                continue
            for cell in p["cells"]:
                cell_map.setdefault(cell, []).append(idx)
        # 添加约束
        for cell, indices in cell_map.items():
            if len(indices) > 1:
                vars_ = [placement_vars[i] for i in indices]
                model.Add(sum(vars_) <= 1)

    # --- 约束2: 建筑数量 ---
    print("添加约束2：每种建筑数量不能超过拥有数量······")
    for b_name in all_buildings_info.keys():
        indices = [i for i, p in enumerate(all_placements) if p["type"] == b_name]
        num_b = int(player_data["buildingCounts"].get(b_name, 0))
        if num_b > 0 and len(indices) > 0:
            vars_ = [placement_vars[i] for i in indices]
            model.Add(sum(vars_) <= num_b)

    # --- 目标构造 ---
    objective_terms = []
    print("计算基础分数······")
    for idx, p in enumerate(all_placements):
        objective_terms.append(p["basic"] * placement_vars[idx])

    # --- 预构建空间哈希 buckets 用于快速查找近邻 ---
    print("构建空间桶以减少 pairwise 比较······")
    buckets_by_grid = {}
    for idx, p in enumerate(all_placements):
        g_id = p["grid_id"]
        cx, cy = p["center"]
        bi = int(math.floor(cx / max_radius))
        bj = int(math.floor(cy / max_radius))
        buckets_by_grid.setdefault(g_id, {}).setdefault((bi, bj), []).append(idx)

    # --- 交互分数：建筑-建筑 (只在同一 grid 内考虑) ---
    print("计算建筑之间的交互分数······")
    created_pairs = 0
    for idx_i, p_i in enumerate(tqdm(all_placements, desc="计算建筑与环境之间的交互分数")):
        g_id = p_i["grid_id"]
        cx_i, cy_i = p_i["center"]
        r_i = p_i["radius"]
        if r_i <= 0:
            continue
        # 得到 i 所在桶 index
        bi = int(math.floor(cx_i / max_radius))
        bj = int(math.floor(cy_i / max_radius))
        # 检查周围 3x3 个桶（包含自身）中的候选
        neighbor_indices = []
        grid_buckets = buckets_by_grid.get(g_id, {})
        for di in (-1, 0, 1):
            for dj in (-1, 0, 1):
                key = (bi + di, bj + dj)
                if key in grid_buckets:
                    neighbor_indices.extend(grid_buckets[key])
        # 去重并遍历
        for idx_j in neighbor_indices:
            if idx_j <= idx_i:
                # 保证每对只处理一次（i<j），但要注意方向性：A覆盖B != B覆盖A，所以仍需二向判断
                continue
            p_j = all_placements[idx_j]
            if p_j["grid_id"] != g_id:
                continue
            # 快速包络判断：若 dx 或 dy 超过 r_i，则不可能
            dx = p_j["center"][0] - cx_i
            if abs(dx) > r_i:
                continue
            dy = p_j["center"][1] - cy_i
            if abs(dy) > r_i:
                continue
            dist = math.hypot(dx, dy)
            # 注意：覆盖是有向的，需检查 both directions separately
            x_i = placement_vars[idx_i]
            x_j = placement_vars[idx_j]
            # i -> j
            if dist < r_i:
                score_ij = all_buildings_info[p_i["type"]]["cover"].get(p_j["type"], 0)
                if score_ij < 0:
                    # 不允许 i 和 j 同时选
                    model.Add(x_i + x_j <= 1)
                elif score_ij > score_th:
                    # 线性化 y_ij = x_i & x_j
                    y_ij = model.NewBoolVar(f"i2j_{idx_i}_{idx_j}")
                    # ChatGPT说这样写，通常比 AddMultiplicationEquality 更高效（尤其当变量很多时）
                    model.Add(y_ij <= x_i)
                    model.Add(y_ij <= x_j)
                    model.Add(y_ij >= x_i + x_j - 1)
                    objective_terms.append(score_ij * y_ij)
                    created_pairs += 1
            # j -> i (separate var)
            r_j = p_j["radius"]
            if r_j > 0 and dist < r_j:
                score_ji = all_buildings_info[p_j["type"]]["cover"].get(p_i["type"], 0)
                if score_ji < 0:
                    # 不允许 i 和 j 同时选
                    model.Add(x_i + x_j <= 1)
                elif score_ji > score_th:
                    y_ji = model.NewBoolVar(f"j2i_{idx_i}_{idx_j}")
                    model.Add(y_ji <= x_i)
                    model.Add(y_ji <= x_j)
                    model.Add(y_ji >= x_i + x_j - 1)
                    objective_terms.append(score_ji * y_ji)
                    created_pairs += 1

    print(f"创建的交互线性变量数量（近似）: {created_pairs}")

    # --- 交互分数：建筑-环境 ---
    for idx, p in enumerate(all_placements):
        g_id = p["grid_id"]
        cx, cy = p["center"]
        r_i = p["radius"]
        if r_i <= 0:
            continue
        grid = grids[g_id]
        g_row, g_col = len(grid), len(grid[0])
        for rr in range(g_row):
            for cc in range(g_col):
                grid_value = grid[rr][cc]
                if grid_value <= 1:
                    continue
                env_name = ENV_LOOKUP[grid_value]
                # env center at (rr, cc)
                dx = rr - cx
                dy = cc - cy
                if abs(dx) > r_i or abs(dy) > r_i:
                    continue
                dist = math.hypot(dx, dy)
                if dist < r_i:
                    score = all_buildings_info[p["type"]]["cover"].get(env_name, 0)
                    if score != 0:
                        objective_terms.append(score * placement_vars[idx])

    model.Maximize(sum(objective_terms))

    # --- 求解 ---
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = solve_time
    solver.parameters.log_search_progress = True
    status = solver.Solve(model)

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        placements = defaultdict(list)
        for idx, var in enumerate(placement_vars):
            if solver.Value(var):
                placement = all_placements[idx]
                g_id = placement["grid_id"]
                placements[g_id].append((placement["type"], placement["top_left"][0], placement["top_left"][1]))
        return {
            "best score": solver.ObjectiveValue(),
            "placements": placements,
        }
    else:
        return None
