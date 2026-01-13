#!/usr/bin/env python3
"""
AI功能测试脚本
用于测试AI服务是否正常工作
"""
import os
import sys
from ai_service import interpret_hexagram, simple_chat, is_ai_available

def test_ai_status():
    """测试AI服务状态"""
    print("=" * 50)
    print("测试AI服务状态")
    print("=" * 50)
    
    if is_ai_available():
        print("✓ AI服务已配置")
        print(f"  API KEY: {os.getenv('ARK_API_KEY', '')[:10]}...")
    else:
        print("✗ AI服务未配置")
        print("  请设置环境变量 ARK_API_KEY")
        print("  示例: export ARK_API_KEY=your_api_key_here")
        return False
    
    return True

def test_simple_chat():
    """测试简单对话功能"""
    print("\n" + "=" * 50)
    print("测试AI对话功能")
    print("=" * 50)
    
    result = simple_chat("你好，请简单介绍一下你自己")
    
    if result['success']:
        print("✓ 对话成功")
        print(f"\nAI回复：\n{result['reply']}\n")
    else:
        print(f"✗ 对话失败：{result['error']}")
    
    return result['success']

def test_hexagram_interpretation():
    """测试卦象解读功能"""
    print("\n" + "=" * 50)
    print("测试卦象解读功能")
    print("=" * 50)
    
    result = interpret_hexagram(
        hexagram_name="乾",
        hexagram_meaning="创造，天",
        guaci="元亨利贞。",
        yaoci=[
            "初九：潜龙勿用。",
            "九二：见龙在田，利见大人。",
            "九三：君子终日乾乾，夕惕若，厉无咎。",
            "九四：或跃在渊，无咎。",
            "九五：飞龙在天，利见大人。",
            "上九：亢龙有悔。"
        ],
        changing_lines=[0, 2],
        question="我想知道工作方面的情况"
    )
    
    if result['success']:
        print("✓ 解读成功")
        print(f"\n卦名：{result['hexagram_name']}")
        print(f"\nAI解读：\n{result['interpretation']}\n")
    else:
        print(f"✗ 解读失败：{result['error']}")
    
    return result['success']

def main():
    """主测试函数"""
    print("\n" + "=" * 50)
    print("AI功能测试")
    print("=" * 50)
    
    # 测试AI服务状态
    if not test_ai_status():
        print("\n请先配置AI服务后再运行测试")
        sys.exit(1)
    
    # 测试简单对话
    chat_success = test_simple_chat()
    
    # 测试卦象解读
    interpret_success = test_hexagram_interpretation()
    
    # 总结
    print("\n" + "=" * 50)
    print("测试总结")
    print("=" * 50)
    print(f"AI对话功能: {'✓ 通过' if chat_success else '✗ 失败'}")
    print(f"卦象解读功能: {'✓ 通过' if interpret_success else '✗ 失败'}")
    
    if chat_success and interpret_success:
        print("\n所有测试通过！AI功能正常工作。")
        return 0
    else:
        print("\n部分测试失败，请检查配置和网络连接。")
        return 1

if __name__ == '__main__':
    sys.exit(main())
