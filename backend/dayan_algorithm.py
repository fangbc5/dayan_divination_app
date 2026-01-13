"""
大衍筮法算法模块
包含大衍筮法的核心推演逻辑
"""
import random
from typing import Tuple, List, Dict

def perform_one_change(stalks: int, change_number: int) -> Tuple[int, int, List[str], List[Dict]]:
    """
    执行一变的过程
    
    Args:
        stalks: 当前蓍草数量
        change_number: 变数（1、2或3）
    
    Returns:
        (change_remainder, remaining_stalks, steps, step_data)
        change_remainder: 此变的余数（4或8）
        remaining_stalks: 剩余蓍草数量
        steps: 步骤文本列表
        step_data: 结构化步骤数据列表
    """
    steps = []
    step_data = []
    
    # Step 1: Remove one stalk (for Tai Chi)
    stalks -= 1
    steps.append(f"第{change_number}变第一步：取出一根蓍草，置于一边（象征太极）。剩余蓍草：{stalks} 根。")
    step_data.append({"step": 1, "type": "remove_one", "total_stalks": stalks, "removed": 1, "description": f"取出一根蓍草（太极），剩余：{stalks} 根"})

    # Step 2: Divide into two piles
    pile1 = random.randint(1, stalks - 1)
    pile2 = stalks - pile1
    steps.append(f"第{change_number}变第二步：将 {stalks} 根蓍草随意分为两堆。左堆：{pile1} 根，右堆：{pile2} 根。")
    step_data.append({"step": 2, "type": "divide", "total_stalks": stalks, "pile1": pile1, "pile2": pile2, "description": f"分为两堆：左堆 {pile1} 根，右堆 {pile2} 根"})

    # Step 3: Remove one from the right pile
    pile2_original = pile2
    pile2 -= 1
    steps.append(f"第{change_number}变第三步：从右堆中取出一根蓍草，置于一边（象征天地人三才）。右堆剩余：{pile2_original} - 1 = {pile2} 根。")
    step_data.append({"step": 3, "type": "remove_from_right", "pile1": pile1, "pile2": pile2, "removed": 1, "description": f"从右堆取出一根，右堆剩余：{pile2} 根"})

    # Step 4: Count by fours for pile 1
    remainder1 = pile1 % 4
    if remainder1 == 0:
        remainder1 = 4
    steps.append(f"第{change_number}变第四步：左堆 {pile1} 根，以四根为一组数，余数：{remainder1} 根。")
    step_data.append({"step": 4, "type": "count_fours", "pile": "left", "count": pile1, "remainder": remainder1, "description": f"左堆 {pile1} 根，以四计数，余数：{remainder1}"})

    # Step 5: Count by fours for pile 2
    remainder2 = pile2 % 4
    if remainder2 == 0:
        remainder2 = 4
    steps.append(f"第{change_number}变第五步：右堆 {pile2} 根，以四根为一组数，余数：{remainder2} 根。")
    step_data.append({"step": 5, "type": "count_fours", "pile": "right", "count": pile2, "remainder": remainder2, "description": f"右堆 {pile2} 根，以四计数，余数：{remainder2}"})

    # Step 6: Sum the remainders (this will be 4 or 8, not including the one removed from right pile)
    # The actual remainder for this change is remainder1 + remainder2 (which is 4 or 8)
    change_remainder = remainder1 + remainder2  # This will be 4 or 8
    steps.append(f"第{change_number}变第六步：将左右两堆的余数相加：{remainder1} + {remainder2} = {change_remainder} 根（此变的余数）。")
    step_data.append({"step": 6, "type": "sum_remainders", "remainder1": remainder1, "remainder2": remainder2, "total": change_remainder, "description": f"余数相加：{remainder1} + {remainder2} = {change_remainder}"})

    # Calculate remaining stalks: 
    # We started with stalks (after removing Tai Chi, so original was stalks+1)
    # We removed: 1 (from right pile, for 三才) + change_remainder (the two remainders: remainder1 + remainder2)
    # So remaining = stalks - 1 - change_remainder
    remaining_stalks = stalks - 1 - change_remainder
    steps.append(f"第{change_number}变完成：取出1根（三才）+ 余数{change_remainder}根 = {1 + change_remainder}根，剩余 {remaining_stalks} 根用于下一变。")
    
    return change_remainder, remaining_stalks, steps, step_data

def get_line_value_detailed() -> Tuple[str, bool, List[str], List[Dict]]:
    """
    生成一爻的详细推演过程（三变）
    
    Returns:
        (line_value, is_changing, all_steps, all_step_data)
        line_value: 爻值（"1"表示阳爻，"0"表示阴爻）
        is_changing: 是否为变爻
        all_steps: 所有步骤文本列表
        all_step_data: 所有结构化步骤数据列表
    """
    all_steps = []
    all_step_data = []
    
    stalks = 50
    all_steps.append(f"初始蓍草：{stalks} 根。")
    all_step_data.append({"step": 0, "type": "initial", "total_stalks": stalks, "description": f"初始蓍草：{stalks} 根"})

    # Perform three changes (三变)
    remainders = []
    for change_num in range(1, 4):
        remainder, stalks, change_steps, change_step_data = perform_one_change(stalks, change_num)
        remainders.append(remainder)
        all_steps.extend(change_steps)
        all_step_data.extend(change_step_data)
    
    # Calculate the line value based on three remainders (each is 4 or 8)
    # According to Dayan method:
    # Three 4s (4+4+4=12): 老阳 -> 阳爻变
    # Two 4s and one 8 (4+4+8=16, 4+8+4=16, 8+4+4=16): 少阴 -> 阴爻不变
    # One 4 and two 8s (4+8+8=20, 8+4+8=20, 8+8+4=20): 少阳 -> 阳爻不变
    # Three 8s (8+8+8=24): 老阴 -> 阴爻变
    
    total_sum = sum(remainders)
    all_steps.append(f"三变完成：第一变余数 {remainders[0]}，第二变余数 {remainders[1]}，第三变余数 {remainders[2]}，总和：{total_sum}。")
    
    line_value = ""
    is_changing = False
    line_type = ""
    
    if total_sum == 12:  # 4+4+4
        line_value = "1"
        is_changing = True
        line_type = "老阳"
        all_steps.append(f"最终结果：总和 {total_sum}（三变皆为4），为九（老阳），此爻为阳爻，且为变爻。")
    elif total_sum == 16:  # 4+4+8, 4+8+4, 8+4+4
        line_value = "0"
        is_changing = False
        line_type = "少阴"
        all_steps.append(f"最终结果：总和 {total_sum}（两4一8），为八（少阴），此爻为阴爻，不变。")
    elif total_sum == 20:  # 4+8+8, 8+4+8, 8+8+4
        line_value = "1"
        is_changing = False
        line_type = "少阳"
        all_steps.append(f"最终结果：总和 {total_sum}（一4两8），为七（少阳），此爻为阳爻，不变。")
    elif total_sum == 24:  # 8+8+8
        line_value = "0"
        is_changing = True
        line_type = "老阴"
        all_steps.append(f"最终结果：总和 {total_sum}（三变皆为8），为六（老阴），此爻为阴爻，且为变爻。")
    else:
        # Fallback - this should not happen with correct algorithm
        line_value = "0"
        is_changing = False
        line_type = "异常"
        all_steps.append(f"最终结果：总和 {total_sum}，结果异常，默认为阴爻，不变。")

    all_step_data.append({"step": 7, "type": "result", "total_remainder": total_sum, "remainders": remainders, "line_type": line_type, "line_value": line_value, "is_changing": is_changing, "description": f"三变总和 {total_sum}，为{line_type}，此爻为{'阳' if line_value == '1' else '阴'}爻{'，变爻' if is_changing else '，不变'}"})

    return line_value, is_changing, all_steps, all_step_data

def perform_divination() -> Dict:
    """
    执行完整的占卜（六爻）
    
    Returns:
        包含本卦、之卦、变爻、推演步骤等完整数据的字典
    """
    from hexagrams_data import HEXAGRAMS_DATA
    
    # 确保所有64种二进制组合都有对应的卦象
    HEXAGRAMS = HEXAGRAMS_DATA.copy()
    for i in range(64):
        binary = format(i, '06b')
        if binary not in HEXAGRAMS:
            HEXAGRAMS[binary] = {
                "name": f"卦{i+1}",
                "meaning": "待补充",
                "guaci": "此卦辞待补充。",
                "yaoci": ["此爻辞待补充。"] * 6
            }
    
    all_line_steps = []
    all_line_step_data = []  # Structured data for animation
    lines = []
    changing_lines_indices = []

    for i in range(6):
        line_value, is_changing, steps, step_data = get_line_value_detailed()
        lines.append(line_value)
        if is_changing:
            changing_lines_indices.append(i)
        all_line_steps.append(steps)
        all_line_step_data.append(step_data)
    
    initial_hexagram_binary = "".join(lines)
    
    # Determine the resulting hexagram if there are changing lines
    resulting_hexagram_binary_list = list(lines)
    if changing_lines_indices:
        for i in changing_lines_indices:
            resulting_hexagram_binary_list[i] = "0" if lines[i] == "1" else "1"
        resulting_hexagram_binary = "".join(resulting_hexagram_binary_list)
    else:
        resulting_hexagram_binary = initial_hexagram_binary # No change

    initial_hexagram_info = HEXAGRAMS.get(initial_hexagram_binary, {"name": "未知卦", "meaning": "未知卦", "guaci": "无此卦辞。", "yaoci": ["无此爻辞。"]*6})
    resulting_hexagram_info = HEXAGRAMS.get(resulting_hexagram_binary, {"name": "未知卦", "meaning": "未知卦", "guaci": "无此卦辞。", "yaoci": ["无此爻辞。"]*6})

    return {
        "initial_hexagram": {
            "binary": initial_hexagram_binary,
            "name": initial_hexagram_info["name"],
            "meaning": initial_hexagram_info["meaning"],
            "guaci": initial_hexagram_info["guaci"],
            "yaoci": initial_hexagram_info["yaoci"]
        },
        "changing_lines": changing_lines_indices,
        "resulting_hexagram": {
            "binary": resulting_hexagram_binary,
            "name": resulting_hexagram_info["name"],
            "meaning": resulting_hexagram_info["meaning"],
            "guaci": resulting_hexagram_info["guaci"],
            "yaoci": resulting_hexagram_info["yaoci"]
        },
        "divination_steps": all_line_steps, # Text steps for each line
        "divination_step_data": all_line_step_data  # Structured data for animation
    }
