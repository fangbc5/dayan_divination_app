from flask import Flask, jsonify, request, Response, stream_with_context, send_from_directory, send_file
from flask_cors import CORS
from config import Config
from dayan_algorithm import perform_divination
from ai_service import interpret_hexagram, simple_chat, is_ai_available, validate_question_with_ai
from question_validator import get_question_examples, get_question_guidelines
import json
import time
import sys
import os

# 获取项目根目录
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='/static')
# 配置CORS，允许前端访问
CORS(app, origins=Config.CORS_ORIGINS)

@app.route('/divine', methods=['GET'])
def divine():
    """执行占卜"""
    result = perform_divination()
    return jsonify(result)

@app.route('/ai/interpret', methods=['POST'])
def ai_interpret():
    """使用AI解读卦象（流式响应）"""
    try:
        data = request.get_json()
        
        hexagram_name = data.get('hexagram_name', '')
        changing_lines = data.get('changing_lines', [])
        question = data.get('question', None)
        resulting_hexagram_name = data.get('resulting_hexagram_name', None)
        
        # 注意：问题在占卜前已经通过 /question/validate 接口验证过了
        # 这里不再重复验证，直接进行AI解读，减少延迟
        
        result = interpret_hexagram(
            hexagram_name=hexagram_name,
            changing_lines=changing_lines,
            question=question,
            resulting_hexagram_name=resulting_hexagram_name
        )
        
        # 如果是流式响应
        if result.get("stream", False):
            def generate():
                # 发送初始信息
                yield f"data: {json.dumps({'type': 'start', 'hexagram_name': result.get('hexagram_name', '')}, ensure_ascii=False)}\n\n"
                sys.stdout.flush()  # 确保立即输出
                
                # 流式发送内容
                stream_response = result.get("response")
                if stream_response:
                    chunk_count = 0
                    start_time = time.time()
                    for chunk in stream_response:
                        chunk_count += 1
                        if chunk.choices and len(chunk.choices) > 0:
                            delta = chunk.choices[0].delta
                            if hasattr(delta, 'content') and delta.content:
                                # 立即发送每个chunk，不缓冲
                                chunk_data = json.dumps({'type': 'chunk', 'content': delta.content}, ensure_ascii=False)
                                yield f"data: {chunk_data}\n\n"
                                sys.stdout.flush()  # 强制刷新，确保立即发送
                                
                                # 调试信息（仅在开发环境）
                                if Config.FLASK_DEBUG:
                                    elapsed = time.time() - start_time
                                    print(f"[Stream] Chunk #{chunk_count} received at {elapsed:.2f}s: {len(delta.content)} chars", flush=True)
                
                # 发送结束标记
                yield f"data: {json.dumps({'type': 'end'}, ensure_ascii=False)}\n\n"
                sys.stdout.flush()
            
            return Response(
                stream_with_context(generate()),
                mimetype='text/event-stream',
                headers={
                    'Cache-Control': 'no-cache',
                    'X-Accel-Buffering': 'no',
                    'Connection': 'keep-alive',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            )
        else:
            # 非流式响应（兼容旧代码）
            return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"请求处理失败：{str(e)}"
        }), 500

@app.route('/ai/chat', methods=['POST'])
def ai_chat():
    """AI对话接口"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        
        if not message:
            return jsonify({
                "success": False,
                "error": "消息内容不能为空"
            }), 400
        
        result = simple_chat(message)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"请求处理失败：{str(e)}"
        }), 500

@app.route('/ai/status', methods=['GET'])
def ai_status():
    """检查AI服务状态"""
    return jsonify({
        "available": is_ai_available(),
        "message": "AI服务已配置" if is_ai_available() else "AI服务未配置，请设置ARK_API_KEY环境变量"
    })

@app.route('/config', methods=['GET'])
def get_config():
    """获取应用配置信息（前端使用）"""
    return jsonify({
        "enable_question_validation": Config.ENABLE_QUESTION_VALIDATION
    })

@app.route('/question/validate', methods=['POST'])
def validate_question_endpoint():
    """使用AI验证用户提问词"""
    try:
        # 如果验证功能被禁用，直接返回成功
        if not Config.ENABLE_QUESTION_VALIDATION:
            data = request.get_json()
            question = data.get('question', '')
            if not question:
                return jsonify({
                    "is_valid": False,
                    "error_message": "提问内容不能为空",
                    "ai_analysis": "",
                    "use_ai": False
                }), 400
            return jsonify({
                "is_valid": True,
                "error_message": "",
                "ai_analysis": "",
                "use_ai": False
            })
        
        data = request.get_json()
        question = data.get('question', '')
        
        if not question:
            return jsonify({
                "is_valid": False,
                "error_message": "提问内容不能为空",
                "ai_analysis": "",
                "use_ai": False
            }), 400
        
        # 使用AI验证
        ai_validation = validate_question_with_ai(question)
        
        if not ai_validation.get("success", False):
            return jsonify({
                "is_valid": False,
                "error_message": ai_validation.get("error", "AI验证服务不可用"),
                "ai_analysis": "",
                "use_ai": True
            }), 500
        
        return jsonify({
            "is_valid": ai_validation.get("is_valid", False),
            "error_message": "" if ai_validation.get("is_valid", False) else "提问不符合算卦要求，请查看AI分析",
            "ai_analysis": ai_validation.get("ai_analysis", ""),
            "use_ai": True
        })
        
    except Exception as e:
        return jsonify({
            "is_valid": False,
            "error_message": f"验证失败：{str(e)}",
            "ai_analysis": "",
            "use_ai": False
        }), 500

@app.route('/question/examples', methods=['GET'])
def get_examples():
    """获取提问示例"""
    return jsonify({
        "examples": get_question_examples(),
        "guidelines": get_question_guidelines()
    })

# ========== 前端页面路由 ==========

def is_mobile_device(user_agent):
    """检测是否为移动设备"""
    if not user_agent:
        return False
    
    user_agent_lower = user_agent.lower()
    mobile_keywords = [
        'mobile', 'android', 'iphone', 'ipad', 'ipod', 
        'blackberry', 'windows phone', 'opera mini', 
        'tablet', 'kindle', 'silk', 'fennec'
    ]
    return any(keyword in user_agent_lower for keyword in mobile_keywords)

@app.route('/')
def index():
    """自动识别设备类型并返回对应页面"""
    user_agent = request.headers.get('User-Agent', '')
    
    # 检测是否为移动设备
    if is_mobile_device(user_agent):
        # 移动设备返回App版
        return send_file(os.path.join(FRONTEND_DIR, 'app.html'))
    else:
        # 桌面设备返回Web版
        return send_file(os.path.join(FRONTEND_DIR, 'index.html'))

@app.route('/web')
def web_page():
    """Web版首页（桌面端）"""
    return send_file(os.path.join(FRONTEND_DIR, 'index.html'))

@app.route('/app')
def app_page():
    """移动端App页面"""
    return send_file(os.path.join(FRONTEND_DIR, 'app.html'))

# ========== 静态资源路由 ==========

# 排除API路径，只匹配静态资源文件
API_PATHS = ['/divine', '/ai/interpret', '/ai/chat', '/ai/status', '/config', 
              '/question/validate', '/question/examples', '/static']

@app.route('/<path:filename>')
def serve_static(filename):
    """提供静态文件服务（CSS、JS等）"""
    # 排除API路径
    request_path = f'/{filename}'
    if any(request_path.startswith(api_path) for api_path in API_PATHS):
        return jsonify({"error": "Not found"}), 404
    
    # 检查文件是否存在
    file_path = os.path.join(FRONTEND_DIR, filename)
    if os.path.isfile(file_path):
        return send_from_directory(FRONTEND_DIR, filename)
    # 如果文件不存在，返回404
    return jsonify({"error": "File not found"}), 404

if __name__ == '__main__':
    app.run(
        debug=Config.FLASK_DEBUG,
        host=Config.FLASK_HOST,
        port=Config.FLASK_PORT
    )