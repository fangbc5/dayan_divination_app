"""
AI服务模块 - 使用火山引擎豆包模型进行卦象解读
"""
from openai import OpenAI
from typing import Optional, Dict, Any
from config import Config

# 初始化OpenAI客户端（使用火山引擎的base_url）
client = None
if Config.is_ai_configured():
    client = OpenAI(
        base_url=Config.ARK_BASE_URL,
        api_key=Config.ARK_API_KEY,
        timeout=60.0,  # 设置60秒超时，避免长时间等待
    )

def is_ai_available() -> bool:
    """检查AI服务是否可用"""
    return client is not None and Config.is_ai_configured()

def interpret_hexagram(
    hexagram_name: str,
    changing_lines: list = None,
    question: Optional[str] = None,
    resulting_hexagram_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    使用AI解读卦象
    
    Args:
        hexagram_name: 本卦卦名
        changing_lines: 变爻索引列表（可选）
        question: 用户的问题（可选）
        resulting_hexagram_name: 之卦卦名（可选）
    
    Returns:
        包含AI解读结果的字典
    """
    if not is_ai_available():
        return {
            "success": False,
            "error": "AI服务未配置，请设置ARK_API_KEY环境变量"
        }
    
    try:
        # 构建简化的提示词
        text_content = ""
        
        # 用户问题
        if question:
            text_content += f"用户问题：{question}\n\n"
        
        # 本卦信息（只给卦名，AI应该知道卦的含义和卦辞）
        text_content += f"本卦：{hexagram_name}\n"
        
        # 变爻信息
        if changing_lines and len(changing_lines) > 0:
            changing_line_nums = [i + 1 for i in changing_lines]
            text_content += f"变爻：第{', '.join(map(str, changing_line_nums))}爻\n"
        
        # 之卦信息（如果有变爻，只给卦名，AI应该知道卦的含义和卦辞）
        if resulting_hexagram_name:
            text_content += f"之卦：{resulting_hexagram_name}\n"
        
        text_content += "\n请进行卦象解读。"
        
        # 使用标准OpenAI ChatCompletion格式（流式）
        # 优化参数以提升响应速度
        response = client.chat.completions.create(
            model=Config.ARK_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": text_content
                }
            ],
            stream=True,  # 启用流式响应
            temperature=0.7,  # 适中的创造性，平衡速度和质量
            max_tokens=2000  # 限制最大token数，避免过长响应
        )
        
        # 返回流式响应对象
        return {
            "success": True,
            "stream": True,
            "response": response,  # 返回流式响应对象，由app.py处理
            "hexagram_name": hexagram_name
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"AI解读失败：{str(e)}"
        }

def validate_question_with_ai(question: str) -> Dict[str, Any]:
    """
    使用AI验证用户提问是否符合算卦的要求
    
    Args:
        question: 用户提问内容
    
    Returns:
        包含验证结果和建议的字典
    """
    if not is_ai_available():
        return {
            "success": False,
            "error": "AI服务未配置，请设置ARK_API_KEY环境变量"
        }
    
    try:
        prompt = f"""你是一位《周易》占卜专家，负责评估用户提问是否符合算卦的要求。

## 算卦提问的要求：

1. **时间范围要求**：
   - 必须包含明确的时间范围（如：本周、下个月、三个月内、近期、接下来一个月等）
   - 避免过于宽泛的时间表达（如："永远"、"一直"、"未来"、"以后"等没有具体期限的表达）
   - 允许的时间表达示例：本周、下周、本月、下个月、近期、三个月内、接下来一个月、未来三个月等

2. **所求之事要求**：
   - 必须包含具体的所求之事（如：工作、感情、学业、健康、财运、出行等）
   - 避免过于宽泛的表达（如："一切"、"所有"、"人生"、"命运"等）
   - 允许的表达示例：工作升职、感情发展、学业成绩、健康状况、投资理财等

3. **问题明确性**：
   - 问题应该具体明确，便于通过卦象给出针对性建议
   - 避免过于抽象或哲学性的问题

## 用户提问：
{question}

## 请按照以下格式回答：

**是否符合要求：** [是/否]

**评估说明：**
[详细说明是否符合要求，如果不符合，请指出具体问题]

**改进建议：**
[如果不符合，请给出具体的改进建议和示例]

请用中文回答，判断要严格但合理。"""
        
        # 使用标准OpenAI ChatCompletion格式
        response = client.chat.completions.create(
            model=Config.ARK_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "你是一位《周易》占卜专家，负责严格但合理地评估用户提问是否符合算卦要求。"
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2,  # 较低温度，确保判断的一致性
            max_tokens=600  # 足够的token用于详细分析
        )
        
        # 按照OpenAI标准格式提取响应
        ai_response = response.choices[0].message.content
        
        # 智能判断逻辑：优先查找明确的格式标记
        is_valid = False
        ai_response_lower = ai_response.lower()
        
        # 方法1：查找"是否符合要求："格式
        if "是否符合要求：" in ai_response:
            after_keyword = ai_response.split("是否符合要求：", 1)[1].strip()
            # 检查后面10个字符内是否有"是"且没有"否"
            if "是" in after_keyword[:10] and "否" not in after_keyword[:10]:
                is_valid = True
            elif "否" in after_keyword[:10]:
                is_valid = False
        
        # 方法2：查找"是否符合要求："（中文冒号）
        elif "是否符合要求：" in ai_response:
            after_keyword = ai_response.split("是否符合要求：", 1)[1].strip()
            if "是" in after_keyword[:10] and "否" not in after_keyword[:10]:
                is_valid = True
            elif "否" in after_keyword[:10]:
                is_valid = False
        
        # 方法3：查找明确的肯定/否定表达
        elif "符合要求：是" in ai_response or "符合要求:是" in ai_response:
            is_valid = True
        elif "符合要求：否" in ai_response or "符合要求:否" in ai_response:
            is_valid = False
        
        # 方法4：语义分析（如果格式不明确）
        else:
            # 查找明确的否定表达
            negative_keywords = ["不符合要求", "不符合", "不满足要求", "不满足", "缺少时间", "缺少所求", "过于宽泛"]
            positive_keywords = ["符合要求", "符合", "满足要求", "满足", "可以", "合适"]
            
            has_negative = any(keyword in ai_response_lower[:200] for keyword in negative_keywords)
            has_positive = any(keyword in ai_response_lower[:200] for keyword in positive_keywords)
            
            if has_negative and not has_positive:
                is_valid = False
            elif has_positive and not has_negative:
                is_valid = True
            else:
                # 如果都不明确，默认判定为不符合（更严格）
                is_valid = False
        
        return {
            "success": True,
            "is_valid": is_valid,
            "ai_analysis": ai_response,
            "question": question
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"AI验证失败：{str(e)}"
        }

def simple_chat(message: str) -> Dict[str, Any]:
    """
    简单的AI对话功能
    
    Args:
        message: 用户消息
    
    Returns:
        包含AI回复的字典
    """
    if not is_ai_available():
        return {
            "success": False,
            "error": "AI服务未配置，请设置ARK_API_KEY环境变量"
        }
    
    try:
        # 使用标准OpenAI ChatCompletion格式
        response = client.chat.completions.create(
            model=Config.ARK_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": message
                }
            ]
        )
        
        # 按照OpenAI标准格式提取响应
        reply = response.choices[0].message.content
        
        return {
            "success": True,
            "reply": reply
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"AI对话失败：{str(e)}"
        }
