"""
测试流式响应是否真的工作
"""
import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI

# 加载.env文件
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# 初始化客户端
api_key = os.getenv('ARK_API_KEY')
base_url = os.getenv('ARK_BASE_URL', 'https://ark.cn-beijing.volces.com/api/v3')
model = os.getenv('ARK_MODEL', 'doubao-seed-1-8-251228')

if not api_key:
    print("错误：未设置ARK_API_KEY环境变量")
    sys.exit(1)

client = OpenAI(
    base_url=base_url,
    api_key=api_key,
)

print("=" * 60)
print("测试流式响应")
print("=" * 60)
print(f"Base URL: {base_url}")
print(f"Model: {model}")
print()

# 测试问题
test_message = "请详细解释一下《周易》中的乾卦，包括卦辞、爻辞的含义，以及在实际生活中的应用。请用至少500字详细说明。"

print(f"测试消息: {test_message[:50]}...")
print()
print("开始流式请求...")
print("-" * 60)

start_time = time.time()
first_chunk_time = None
chunk_count = 0
total_chars = 0

try:
    # 创建流式请求
    stream = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "user",
                "content": test_message
            }
        ],
        stream=True
    )
    
    print("流式响应已建立，开始接收数据...")
    print()
    
    # 接收流式数据
    for chunk in stream:
        chunk_count += 1
        if first_chunk_time is None:
            first_chunk_time = time.time()
            elapsed = first_chunk_time - start_time
            print(f"✓ 第一个chunk在 {elapsed:.3f} 秒后到达")
            print()
        
        if chunk.choices and len(chunk.choices) > 0:
            delta = chunk.choices[0].delta
            if hasattr(delta, 'content') and delta.content:
                content = delta.content
                total_chars += len(content)
                elapsed = time.time() - start_time
                print(f"[{elapsed:.3f}s] Chunk #{chunk_count}: {len(content)} 字符 - {repr(content[:30])}")
                sys.stdout.flush()  # 立即输出
    
    end_time = time.time()
    total_time = end_time - start_time
    
    print()
    print("-" * 60)
    print("流式响应完成")
    print(f"总chunk数: {chunk_count}")
    print(f"总字符数: {total_chars}")
    print(f"总耗时: {total_time:.3f} 秒")
    if first_chunk_time:
        time_to_first_chunk = first_chunk_time - start_time
        print(f"首chunk延迟: {time_to_first_chunk:.3f} 秒")
        print(f"平均速度: {total_chars / total_time:.1f} 字符/秒")
        
        # 判断是否真的是流式
        if time_to_first_chunk < 2.0:
            print("✓ 看起来是真正的流式响应（首chunk延迟较短）")
        else:
            print("⚠ 首chunk延迟较长，可能是等待完整响应后才开始发送")
    
except Exception as e:
    print(f"错误: {e}")
    import traceback
    traceback.print_exc()
