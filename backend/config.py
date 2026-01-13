"""
配置文件 - 从.env文件读取环境变量
"""
import os
from dotenv import load_dotenv
from pathlib import Path

# 加载.env文件
# 从项目根目录查找.env文件
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

class Config:
    """应用配置类"""
    
    # Flask配置
    FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    FLASK_HOST = os.getenv('FLASK_HOST', '127.0.0.1')
    FLASK_PORT = int(os.getenv('FLASK_PORT', '5000'))
    
    # AI服务配置
    ARK_API_KEY = os.getenv('ARK_API_KEY', '')
    ARK_BASE_URL = os.getenv('ARK_BASE_URL', 'https://ark.cn-beijing.volces.com/api/v3')
    ARK_MODEL = os.getenv('ARK_MODEL', 'doubao-seed-1-8-251228')
    
    # CORS配置
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')
    
    # 功能开关配置
    ENABLE_QUESTION_VALIDATION = os.getenv('ENABLE_QUESTION_VALIDATION', 'True').lower() == 'true'
    
    @classmethod
    def is_ai_configured(cls):
        """检查AI服务是否已配置"""
        return bool(cls.ARK_API_KEY)
    
    @classmethod
    def get_config_info(cls):
        """获取配置信息（用于调试，不包含敏感信息）"""
        return {
            'flask_debug': cls.FLASK_DEBUG,
            'flask_host': cls.FLASK_HOST,
            'flask_port': cls.FLASK_PORT,
            'ark_base_url': cls.ARK_BASE_URL,
            'ark_model': cls.ARK_MODEL,
            'ai_configured': cls.is_ai_configured(),
            'cors_origins': cls.CORS_ORIGINS,
            'enable_question_validation': cls.ENABLE_QUESTION_VALIDATION
        }
