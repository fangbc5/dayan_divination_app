# 大衍筮法占卜应用

一个基于传统大衍筮法（Dayan Divination Method）的交互式占卜应用，提供详细的推演过程动画和完整的 64 卦解读。

## 项目简介

大衍筮法是《周易》中最古老、最正统的占卜方法。本应用通过现代 Web 技术，完整实现了大衍筮法的推演过程，包括：

- **完整的推演动画**：可视化展示蓍草的分堆、计数等每一步操作
- **详细的推演步骤**：实时显示每一步的计算过程和结果
- **64 卦完整数据**：包含所有卦象的名称、含义、卦辞和爻辞
- **变爻识别**：自动识别变爻并生成之卦
- **AI 智能解读**：使用 AI 对占卜结果进行智能解读
- **响应式设计**：适配不同屏幕尺寸

## 项目结构

```
dayan_divination_app/
├── backend/                 # 后端代码
│   ├── __init__.py
│   ├── app.py              # Flask应用主文件
│   ├── config.py           # 配置文件（从.env读取）
│   ├── dayan_algorithm.py  # 大衍筮法算法
│   ├── ai_service.py       # AI服务模块
│   ├── question_validator.py  # 提问验证模块
│   ├── hexagrams_data.py   # 64卦数据
│   └── test_ai.py          # AI功能测试脚本
├── frontend/               # 前端代码
│   ├── index.html          # 前端页面
│   ├── style.css           # 样式文件
│   ├── script.js           # 前端JavaScript
│   ├── hexagrams_data.js   # 64卦数据（JS版本）
│   └── divination.js      # 大衍筮法算法（JS版本）
├── venv/                   # Python虚拟环境
├── .env                    # 环境变量配置（需要创建）
├── .env.example           # 环境变量配置示例
├── requirements.txt        # Python依赖
├── run.sh                  # 运行脚本
└── README.md              # 项目说明
```

## 功能特性

### 核心功能

- ✅ **大衍筮法推演**：完整实现"三变成一爻"的推演过程
- ✅ **动画演示**：Canvas 绘制的可视化推演过程
- ✅ **步骤历史**：实时显示每一步推演步骤和计算结果
- ✅ **64 卦解读**：完整的卦辞和爻辞内容
- ✅ **变爻处理**：自动识别变爻并生成本卦和之卦
- ✅ **AI 智能解读**：使用 AI 对占卜结果进行智能解读
- ✅ **提问验证**：使用 AI 验证用户提问是否符合算卦要求

### 交互功能

- 🎨 **动画速度控制**：支持 1x、2x、4x 倍速和立即生成
- 📜 **推演步骤历史**：可滚动查看完整的推演过程
- 📖 **规则说明**：左侧边栏显示大衍筮法规则
- 🔄 **响应式布局**：三栏布局，适配不同屏幕

## 技术栈

### 后端

- **Python 3.x**
- **Flask**：轻量级 Web 框架
- **Flask-CORS**：处理跨域请求
- **python-dotenv**：环境变量管理
- **OpenAI SDK**：AI 服务集成

### 前端

- **HTML5**：页面结构
- **CSS3**：样式和响应式布局
- **JavaScript (ES6+)**：交互逻辑和动画
- **Canvas API**：绘制推演动画

### 运行模式

本应用支持两种运行模式：

1. **Python 后端模式**（推荐）：使用 Flask 后端提供 API 服务
2. **纯 JavaScript 模式**：完全在浏览器中运行，无需后端服务

应用会自动检测后端是否可用，如果后端不可用（未启动或连接失败），会自动切换到纯 JS 模式。

## 安装和运行

### 方式一：纯 JavaScript 模式（无需后端）

**最简单的方式**：直接在浏览器中打开 `frontend/index.html` 文件即可使用。

1. 下载或克隆项目
2. 用浏览器打开 `frontend/index.html` 文件
3. 点击"开始占卜"即可使用

**注意**：纯 JS 模式不需要任何服务器或后端，可以直接在本地文件系统中运行。

### 方式二：Python 后端模式（推荐）

如果需要使用 Python 后端模式（包括 AI 功能），需要安装 Python 环境。

#### 环境要求

- Python 3.7 或更高版本
- pip（Python 包管理器）

#### 安装步骤

1. **克隆或下载项目**

   ```bash
   cd dayan_divination_app
   ```

2. **创建虚拟环境（推荐）**

   ```bash
   python3 -m venv venv
   ```

3. **激活虚拟环境**

   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - Windows:
     ```bash
     venv\Scripts\activate
     ```

4. **安装依赖**

   ```bash
   pip install -r requirements.txt
   ```

5. **配置环境变量**

   ```bash
   # 复制示例文件
   cp .env.example .env

   # 编辑.env文件，设置你的API KEY
   # ARK_API_KEY=your_api_key_here
   ```

#### 运行应用

**方法一：使用运行脚本（推荐）**

```bash
# macOS/Linux
chmod +x run.sh
./run.sh

# 或直接运行
bash run.sh
```

**方法二：手动运行**

```bash
# 激活虚拟环境（如果使用）
source venv/bin/activate

# 进入backend目录
cd backend

# 运行Flask应用
python app.py
```

应用将在 `http://127.0.0.1:5000` 启动。

**前端访问**：

- 如果使用后端模式，前端需要访问 `http://127.0.0.1:5000`（需要配置 Flask 提供静态文件服务，或使用其他 Web 服务器）
- 或者直接打开 `frontend/index.html`，应用会自动检测后端并切换模式

**自动切换**：如果 Python 后端未启动或连接失败，应用会自动切换到纯 JS 模式，无需手动配置。

## 环境变量配置

在项目根目录创建 `.env` 文件（参考 `.env.example`）：

```env
# Flask配置
FLASK_DEBUG=True
FLASK_HOST=127.0.0.1
FLASK_PORT=5000

# AI服务配置（火山引擎豆包模型）
ARK_API_KEY=your_api_key_here
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
ARK_MODEL=doubao-seed-1-8-251228

# CORS配置（允许的前端域名，用逗号分隔）
CORS_ORIGINS=*

# 功能开关配置
ENABLE_QUESTION_VALIDATION=True
```

### 配置说明

- **FLASK_DEBUG**：是否开启调试模式（True/False）
- **FLASK_HOST**：Flask 服务监听地址
- **FLASK_PORT**：Flask 服务端口
- **ARK_API_KEY**：火山引擎豆包模型 API KEY（必需，用于 AI 功能）
- **ARK_BASE_URL**：AI 服务 API 地址
- **ARK_MODEL**：使用的 AI 模型名称
- **CORS_ORIGINS**：允许跨域的前端域名（\*表示允许所有）
- **ENABLE_QUESTION_VALIDATION**：是否启用问题验证功能（True/False），默认为 True。设置为 False 时，用户可以直接占卜，无需验证问题

## AI 功能（可选）

本应用集成了火山引擎豆包模型的 AI 解读功能，可以为占卜结果提供智能解读。

### 配置 AI 服务

1. **获取 API KEY**

   - 访问 [火山引擎文档](https://www.volcengine.com/docs/82379/1399008) 了解如何获取 API KEY

2. **设置环境变量**

   - 在 `.env` 文件中设置 `ARK_API_KEY=your_api_key_here`

3. **检查 AI 服务状态**
   ```bash
   curl http://127.0.0.1:5000/ai/status
   ```

### AI API 接口

#### 1. 卦象解读接口

```bash
POST /ai/interpret
Content-Type: application/json

{
  "hexagram_name": "乾",
  "hexagram_meaning": "创造，天",
  "guaci": "元亨利贞。",
  "yaoci": ["初九：潜龙勿用。", "九二：见龙在田，利见大人。", ...],
  "changing_lines": [0, 2],  # 变爻索引（可选）
  "question": "我想知道工作方面的情况"  # 用户问题（可选）
}
```

#### 2. 提问验证接口

```bash
POST /question/validate
Content-Type: application/json

{
  "question": "我想知道本周工作方面的情况"
}
```

#### 3. 检查 AI 服务状态

```bash
GET /ai/status
```

## 使用说明

### 基本使用流程

1. **输入问题**

   - 在提问区域输入您的问题
   - 问题必须包含时间范围（如：本周、下个月）和具体事项（如：工作、感情、学业）

2. **验证问题**

   - 点击"验证提问"按钮
   - AI 会分析您的问题是否符合算卦要求
   - 如果不符合，AI 会给出改进建议

3. **开始占卜**

   - 验证通过后，"开始占卜"按钮会启用
   - 点击按钮开始占卜
   - 可以选择动画速度（1x、2x、4x 或立即生成）

4. **查看结果**
   - 占卜完成后显示本卦和之卦
   - 显示卦名、含义、卦辞和爻辞
   - 变爻会高亮显示
   - 自动使用已验证的问题进行 AI 解读

### 推演步骤说明

大衍筮法的推演过程：

1. **初始**：50 根蓍草，取出一根（象征太极），剩余 49 根
2. **第一变**：
   - 将 49 根分为两堆
   - 从右堆取出一根
   - 左右两堆分别以四计数，得到余数
   - 将余数相加，从总数中减去
3. **第二变**：用剩余蓍草重复第一变的过程
4. **第三变**：再次重复
5. **确定爻**：根据三次余数的总和（12/16/20/24）确定爻的类型
   - 12：老阳（变爻）
   - 16：少阴（不变）
   - 20：少阳（不变）
   - 24：老阴（变爻）

重复以上过程 6 次，得到六爻，组成一个完整的卦象。

## 文件说明

### 后端文件

- **app.py**：Flask 应用主文件，包含 API 端点
- **config.py**：配置文件，从.env 文件读取环境变量
- **dayan_algorithm.py**：大衍筮法算法实现
- **ai_service.py**：AI 服务模块，集成火山引擎豆包模型
- **question_validator.py**：提问验证模块
- **hexagrams_data.py**：存储 64 卦的完整数据（Python 版本）

### 前端文件

- **index.html**：前端页面结构
- **style.css**：页面样式，包括响应式布局和动画效果
- **script.js**：前端交互逻辑，包括 Canvas 动画和步骤历史管理，支持自动切换 Python 后端和纯 JS 模式

### 纯 JS 版本文件

- **hexagrams_data.js**：64 卦数据（JavaScript 版本）
- **divination.js**：大衍筮法算法实现（纯 JavaScript 版本），包含 `performDivination()` 函数

## 开发说明

### 大衍筮法算法

核心算法在 `backend/dayan_algorithm.py` 中实现：

- `perform_one_change()`：执行一变的过程
- `get_line_value_detailed()`：生成一爻的详细推演过程
- `perform_divination()`：执行完整的占卜（六爻）

### 前端动画

Canvas 动画在 `frontend/script.js` 中实现：

- `drawInitialStalks()`：绘制初始蓍草
- `drawDivide()`：绘制分堆过程
- `drawCountFours()`：绘制以四计数过程
- `drawSumRemainders()`：绘制余数相加过程

### 配置管理

所有配置通过 `backend/config.py` 从 `.env` 文件读取：

- 使用 `python-dotenv` 库加载环境变量
- 提供 `Config` 类统一管理配置
- 支持默认值和类型转换

## 注意事项

1. **虚拟环境**：建议使用虚拟环境来隔离项目依赖
2. **环境变量**：确保在项目根目录创建 `.env` 文件并配置必要的环境变量
3. **端口占用**：如果 5000 端口被占用，可以在 `.env` 文件中修改 `FLASK_PORT`
4. **浏览器兼容性**：建议使用现代浏览器（Chrome、Firefox、Safari、Edge）
5. **API KEY 安全**：不要将 `.env` 文件提交到版本控制系统

## 许可证

本项目仅供学习和研究使用。

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 更新日志

### v1.3.0

- 🏗️ **代码重构**：分离前后端代码到独立目录
- ⚙️ **配置管理**：添加 config.py 从.env 文件读取环境变量
- 📦 **依赖更新**：添加 python-dotenv 支持
- 📁 **项目结构**：优化项目目录结构

### v1.2.0

- 🤖 **新增 AI 解读功能**：集成火山引擎豆包模型
- 📝 **AI 卦象解读**：支持使用 AI 对占卜结果进行智能解读
- 💬 **AI 对话功能**：支持与 AI 进行对话交流
- 🔧 **API 接口**：提供 RESTful API 接口供前端调用
- ✅ **提问验证**：使用 AI 验证用户提问是否符合算卦要求

### v1.1.0

- ✨ **新增纯 JavaScript 模式**：无需后端即可运行
- 🔄 **自动模式切换**：自动检测后端可用性，失败时自动切换到纯 JS 模式
- 📦 **模块化设计**：算法和数据分离为独立 JS 文件

### v1.0.0

- 完整实现大衍筮法推演算法
- 添加 Canvas 动画演示
- 实现 64 卦完整数据
- 添加响应式布局
- 支持动画速度控制
- 实现推演步骤历史记录
