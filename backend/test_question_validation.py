#!/usr/bin/env python3
"""
测试问题验证功能
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ai_service import validate_question_with_ai

def test_validation():
    """测试AI验证功能"""
    
    # 测试用例：应该通过验证的问题
    valid_questions = [
        "我想知道本周工作方面的情况",
        "下个月的感情发展如何",
        "近期学业成绩会如何",
        "未来三个月内健康方面需要注意什么",
        "接下来一个月的工作升职机会如何",
        "这周的投资理财是否合适",
        "近期出行是否顺利",
        "本周面试能否成功",
        "下个月能否找到合适的对象"
    ]
    
    # 测试用例：应该被拒绝的问题
    invalid_questions = [
        "",  # 空问题
        "我想知道一切",  # 过于宽泛
        "我的命运如何",  # 过于宽泛
        "以后会怎么样",  # 时间过于宽泛
        "永远会好吗",  # 时间过于宽泛
        "工作",  # 缺少时间范围
        "本周",  # 缺少所求之事
        "我想知道所有事情",  # 过于宽泛
        "人生会如何",  # 过于宽泛
        "未来的一切",  # 过于宽泛
        "以后的所有事情",  # 过于宽泛
    ]
    
    print("=" * 80)
    print("测试AI验证（ai_service.py）")
    print("=" * 80)
    
    # 测试AI验证
    print("\n【应该通过验证的问题】")
    for question in valid_questions:
        result = validate_question_with_ai(question)
        if result.get("success"):
            is_valid = result.get("is_valid", False)
            status = "✓ 通过" if is_valid else "✗ 失败"
            print(f"{status}: {question}")
            if not is_valid:
                print(f"  AI分析: {result.get('ai_analysis', '')[:100]}...")
        else:
            print(f"✗ 验证失败: {question}")
            print(f"  错误: {result.get('error', 'Unknown error')}")
    
    print("\n【应该被拒绝的问题】")
    for question in invalid_questions:
        if not question:  # 跳过空问题，AI验证会返回错误
            continue
        result = validate_question_with_ai(question)
        if result.get("success"):
            is_valid = result.get("is_valid", False)
            status = "✓ 正确拒绝" if not is_valid else "✗ 错误通过"
            print(f"{status}: {question}")
            if is_valid:
                print(f"  应该被拒绝但通过了")
                print(f"  AI分析: {result.get('ai_analysis', '')[:200]}...")
            else:
                print(f"  AI分析: {result.get('ai_analysis', '')[:100]}...")
        else:
            print(f"✗ 验证失败: {question}")
            print(f"  错误: {result.get('error', 'Unknown error')}")
    
    print("\n" + "=" * 80)
    print("测试完成")
    print("=" * 80)

if __name__ == '__main__':
    test_validation()
