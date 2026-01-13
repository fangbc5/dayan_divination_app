"""
用户提问词验证模块
对用户的提问词进行限制和验证
"""
import re
from typing import Dict, Tuple, List

# 时间相关的关键词
TIME_KEYWORDS = [
    '今天', '明天', '后天', '本周', '下周', '本月', '下月', '今年', '明年',
    '近期', '短期', '长期', '未来', '接下来', '最近', '这几天', '这周', '这个月',
    '一年内', '半年内', '三个月内', '一个月内', '一周内', '几天内',
    '工作日', '周末', '假期', '春节', '国庆', '元旦', '中秋'
]

# 过于宽泛的时间表达（需要避免）
VAGUE_TIME_PATTERNS = [
    r'永远', r'一直', r'总是', r'任何时候', r'随时', r'一辈子', r'一生',
    r'未来', r'将来', r'以后', r'以后.*都', r'永远.*都'
]

# 所求之事的关键词
PURPOSE_KEYWORDS = [
    '工作', '事业', '职业', '升职', '加薪', '跳槽', '面试', '项目', '合作',
    '感情', '恋爱', '婚姻', '分手', '复合', '相亲', '对象',
    '学业', '考试', '学习', '成绩', '升学', '毕业', '论文',
    '健康', '疾病', '治疗', '康复', '体检',
    '财运', '投资', '理财', '生意', '创业', '收入', '支出',
    '出行', '旅行', '搬家', '迁移',
    '人际关系', '朋友', '同事', '家人', '父母', '子女',
    '决策', '选择', '计划', '目标', '方向'
]

# 过于宽泛的所求之事表达（需要避免）
VAGUE_PURPOSE_PATTERNS = [
    r'一切', r'所有', r'全部', r'所有事', r'所有.*都', r'一切.*都',
    r'人生', r'命运', r'未来.*都', r'以后.*都', r'将来.*都',
    r'怎么样', r'如何', r'什么', r'哪个', r'哪些'
]

def validate_question(question: str) -> Tuple[bool, str, Dict]:
    """
    验证用户提问词
    
    Args:
        question: 用户提问内容
    
    Returns:
        (is_valid, error_message, validation_info)
        is_valid: 是否通过验证
        error_message: 错误信息（如果验证失败）
        validation_info: 验证详情字典，包含：
            - has_time_range: 是否包含时间范围
            - time_range: 提取的时间范围
            - has_purpose: 是否包含所求之事
            - purpose: 提取的所求之事
            - is_vague_time: 时间是否过于宽泛
            - is_vague_purpose: 所求之事是否过于宽泛
    """
    if not question or not question.strip():
        return False, "提问内容不能为空", {}
    
    question = question.strip()
    
    # 初始化验证信息
    validation_info = {
        'has_time_range': False,
        'time_range': None,
        'has_purpose': False,
        'purpose': None,
        'is_vague_time': False,
        'is_vague_purpose': False
    }
    
    # 检查是否包含时间范围
    found_time_keywords = []
    for keyword in TIME_KEYWORDS:
        if keyword in question:
            found_time_keywords.append(keyword)
            validation_info['has_time_range'] = True
    
    if found_time_keywords:
        validation_info['time_range'] = ', '.join(found_time_keywords)
    
    # 检查时间是否过于宽泛
    for pattern in VAGUE_TIME_PATTERNS:
        if re.search(pattern, question):
            validation_info['is_vague_time'] = True
            break
    
    # 检查是否包含所求之事
    found_purpose_keywords = []
    for keyword in PURPOSE_KEYWORDS:
        if keyword in question:
            found_purpose_keywords.append(keyword)
            validation_info['has_purpose'] = True
    
    if found_purpose_keywords:
        validation_info['purpose'] = ', '.join(found_purpose_keywords)
    
    # 检查所求之事是否过于宽泛
    for pattern in VAGUE_PURPOSE_PATTERNS:
        if re.search(pattern, question):
            validation_info['is_vague_purpose'] = True
            break
    
    # 验证逻辑
    errors = []
    
    # 1. 必须包含时间范围
    if not validation_info['has_time_range']:
        errors.append("提问中必须包含明确的时间范围（如：本周、下个月、近期等）")
    
    # 2. 必须包含所求之事
    if not validation_info['has_purpose']:
        errors.append("提问中必须包含明确的所求之事（如：工作、感情、学业、健康等）")
    
    # 3. 时间范围不能过于宽泛
    if validation_info['is_vague_time']:
        errors.append("时间范围过于宽泛，请使用更具体的时间表达（如：本周、下个月、三个月内等）")
    
    # 4. 所求之事不能过于宽泛
    if validation_info['is_vague_purpose']:
        errors.append("所求之事过于宽泛，请具体说明您想了解的事项（如：工作升职、感情发展、学业成绩等）")
    
    if errors:
        return False, "；".join(errors), validation_info
    
    return True, "", validation_info

def get_question_examples() -> List[str]:
    """获取提问示例"""
    return [
        "我想知道本周工作方面的情况",
        "下个月的感情发展如何",
        "近期学业成绩会如何",
        "未来三个月内健康方面需要注意什么",
        "接下来一个月的工作升职机会如何",
        "这周的投资理财是否合适",
        "近期出行是否顺利"
    ]

def get_question_guidelines() -> str:
    """获取提问指南"""
    return """
提问要求：
1. 必须包含明确的时间范围（如：本周、下个月、三个月内、近期等）
2. 必须包含具体的所求之事（如：工作、感情、学业、健康、财运等）
3. 时间范围不能过于宽泛（避免使用"永远"、"一直"、"未来"等）
4. 所求之事要具体明确（避免使用"一切"、"所有"、"人生"等）

示例：
✓ "我想知道本周工作方面的情况"
✓ "下个月的感情发展如何"
✓ "近期学业成绩会如何"
✗ "我想知道未来的一切"
✗ "我的命运如何"
✗ "以后会怎么样"
"""
