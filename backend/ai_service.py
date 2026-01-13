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
        prompt = f"""请评估以下用户提问是否符合《周易》算卦的要求。

算卦提问的要求：
1. 必须包含明确的时间范围（如：本周、下个月、三个月内、近期等），不能过于宽泛（避免"永远"、"一直"、"未来"等）
2. 必须包含具体的所求之事（如：工作、感情、学业、健康、财运等），不能过于宽泛（避免"一切"、"所有"、"人生"等）
3. 问题应该具体明确，便于通过卦象给出针对性建议

用户提问：{question}

请按照以下格式回答：
1. 是否符合要求：是/否
2. 如果不符合，请指出具体问题：
   - 时间范围问题（如有）
   - 所求之事问题（如有）
   - 其他问题（如有）
3. 改进建议：如果不符合，请给出具体的改进建议和示例

请用中文回答，格式清晰。"""
        
        # 使用标准OpenAI ChatCompletion格式
        # 优化参数以提升响应速度
        response = client.chat.completions.create(
            model=Config.ARK_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,  # 较低温度，更快速、更确定性的响应
            max_tokens=500  # 验证不需要太长回复
        )
        
        # 按照OpenAI标准格式提取响应
        ai_response = response.choices[0].message.content
        
        # 简单判断是否符合要求（从AI回复中提取）
        is_valid = "符合" in ai_response or "是" in ai_response[:50] or "符合要求：是" in ai_response
        
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
