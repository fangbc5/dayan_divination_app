document.addEventListener('DOMContentLoaded', () => {
    // ========== 移动浏览器视口高度修复 ==========
    // 解决移动浏览器地址栏/工具栏动态显示/隐藏导致的视口高度问题
    function setViewportHeight() {
        // 获取实际视口高度（不包括地址栏和工具栏）
        const vh = window.innerHeight / 100;
        // 设置CSS变量，供CSS使用
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        console.log('Viewport height:', window.innerHeight, 'vh:', vh);
    }
    
    // 初始设置
    setViewportHeight();
    
    // 监听窗口大小变化（包括地址栏显示/隐藏）
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', () => {
        // 方向改变时延迟一下，等待浏览器完成布局
        setTimeout(setViewportHeight, 100);
    });
    
    // 监听滚动事件，因为移动浏览器滚动时地址栏会隐藏
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                setViewportHeight();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
    
    // ========== API基础URL配置 ==========
    // 自动检测当前页面的主机和端口，如果是从文件系统打开则使用默认值
    const getApiBaseUrl = () => {
        if (window.location.protocol === 'file:') {
            // 从文件系统打开，使用默认的本地服务器地址
            return 'http://127.0.0.1:5000';
        }
        // 从服务器访问，使用当前页面的主机和端口
        return window.location.origin;
    };
    
    const API_BASE_URL = getApiBaseUrl();
    console.log('API Base URL:', API_BASE_URL);
    
    // ========== SPA页面切换功能 ==========
    const pageViews = {
        divine: document.getElementById('divinePage'),
        history: document.getElementById('historyPage'),
        rules: document.getElementById('rulesPage')
    };
    
    const pageTitles = {
        divine: '占卜',
        history: '推演步骤历史',
        rules: '大衍筮法规则'
    };
    
    const navItems = document.querySelectorAll('.nav-item');
    const pageTitle = document.getElementById('pageTitle');
    
    // 页面切换函数
    function switchPage(pageName) {
        // 隐藏所有页面
        Object.values(pageViews).forEach(page => {
            if (page) page.classList.remove('active');
        });
        
        // 显示目标页面
        if (pageViews[pageName]) {
            pageViews[pageName].classList.add('active');
        }
        
        // 更新标题
        if (pageTitle && pageTitles[pageName]) {
            pageTitle.textContent = pageTitles[pageName];
        }
        
        // 更新导航高亮
        navItems.forEach(item => {
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // 如果切换到历史页面，滚动到底部
        if (pageName === 'history') {
            setTimeout(() => {
                const historyDiv = document.getElementById('stepHistory');
                if (historyDiv && historyDiv.scrollHeight > 0) {
                    historyDiv.scrollTop = historyDiv.scrollHeight;
                }
            }, 100);
        }
    }
    
    // 底部导航点击事件
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = item.dataset.page;
            if (pageName) {
                switchPage(pageName);
            }
        });
    });
    
    // ========== 原有功能 ==========
    const divineButton = document.getElementById('divineButton');
    const speedButtons = document.querySelectorAll('.speed-btn');
    const divinationProcessDiv = document.getElementById('divinationProcess');
    const currentLineStatus = document.getElementById('currentLineStatus');
    const resultsDiv = document.getElementById('results');
    const stepHistoryDiv = document.getElementById('stepHistory'); // 历史页面的历史记录容器
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    
    // 历史记录容器引用（用于实时更新）
    let historyPageStepHistoryDiv = stepHistoryDiv;
    
    // 当前速度倍数（0表示立即生成）
    let currentSpeed = 1;
    
    // 速度按钮点击事件
    speedButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            speedButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSpeed = parseInt(btn.dataset.speed);
        });
    });
    
    // 动画速度控制函数
    const getAnimationDelay = () => {
        if (currentSpeed === 0) return 0; // 立即生成
        return Math.max(50, 1200 / currentSpeed); // 基础延迟除以速度倍数
    };
    
    const getStepDelay = () => {
        if (currentSpeed === 0) return 0;
        return Math.max(50, 300 / currentSpeed);
    };
    
    // 根据速度计算动画延迟（用于蓍草绘制等）
    const getStalkDelay = (baseDelay) => {
        if (currentSpeed === 0) return 0;
        return Math.max(0, baseDelay / currentSpeed);
    };
    
    // 根据速度计算固定延迟
    const getFixedDelay = (baseDelay) => {
        if (currentSpeed === 0) return 0;
        return Math.max(10, baseDelay / currentSpeed);
    };

    const initialHexagramDiv = document.getElementById('initialHexagram');
    const initialHexagramName = document.getElementById('initialHexagramName');
    const initialHexagramMeaning = document.getElementById('initialHexagramMeaning');
    const initialGuaci = document.getElementById('initialGuaci');
    const initialYaoci = document.getElementById('initialYaoci');

    const changingLinesSection = document.getElementById('changingLinesSection');
    const changingLinesText = document.getElementById('changingLinesText');

    const resultingHexagramDiv = document.getElementById('resultingHexagram');
    const resultingHexagramName = document.getElementById('resultingHexagramName');
    const resultingHexagramMeaning = document.getElementById('resultingHexagramMeaning');
    const resultingGuaci = document.getElementById('resultingGuaci');
    const resultingYaoci = document.getElementById('resultingYaoci');

    // 提问相关元素
    const questionSection = document.getElementById('questionSection');
    const questionInput = document.getElementById('questionInput');
    const questionError = document.getElementById('questionError');
    const validateQuestionBtn = document.getElementById('validateQuestionBtn');
    const showExamplesBtn = document.getElementById('showExamplesBtn');
    const aiInterpretationSection = document.getElementById('aiInterpretationSection');
    const aiInterpretationContent = document.getElementById('aiInterpretationContent');
    
    // 存储当前占卜数据和已验证的问题
    let currentDivinationData = null;
    let validatedQuestion = null;
    
    // 验证功能开关（默认开启）
    let enableQuestionValidation = true;
    
    // 加载配置
    async function loadConfig() {
        try {
            const response = await fetch(`${API_BASE_URL}/config`);
            if (response.ok) {
                const config = await response.json();
                enableQuestionValidation = config.enable_question_validation !== false;
            }
        } catch (error) {
            console.log('无法连接到后端，使用默认配置（验证功能开启）');
            enableQuestionValidation = true;
        }
        
        // 根据配置显示/隐藏验证相关UI
        if (!enableQuestionValidation) {
            // 隐藏验证按钮和提示
            validateQuestionBtn.style.display = 'none';
            showExamplesBtn.style.display = 'none';
            const questionHint = document.querySelector('.question-hint');
            if (questionHint) {
                questionHint.style.display = 'none';
            }
            // 直接启用占卜按钮
            divineButton.disabled = false;
            divineButton.textContent = '开始占卜';
        } else {
            // 显示验证相关UI
            validateQuestionBtn.style.display = 'inline-block';
            showExamplesBtn.style.display = 'inline-block';
            const questionHint = document.querySelector('.question-hint');
            if (questionHint) {
                questionHint.style.display = 'block';
            }
            // 初始状态禁用占卜按钮
            divineButton.disabled = true;
            divineButton.textContent = '开始占卜（请先验证问题）';
        }
    }
    
    // 页面加载时获取配置
    loadConfig();

    divineButton.addEventListener('click', async () => {
        // 如果验证功能开启，检查是否已验证问题
        if (enableQuestionValidation && !validatedQuestion) {
            showQuestionError('请先验证您的问题');
            return;
        }
        
        divineButton.disabled = true;
        divineButton.textContent = '占卜中...';
        resultsDiv.classList.add('hidden');
        divinationProcessDiv.classList.remove('hidden');
        currentLineStatus.textContent = '';
        
        // 清空步骤历史（SPA模式，直接清空DOM）
        if (stepHistoryDiv) {
            stepHistoryDiv.innerHTML = '<p class="empty-message">正在生成推演步骤...</p>';
            if (clearHistoryBtn) {
                clearHistoryBtn.style.display = 'none';
            }
        }

        try {
            let data;
            
            // 尝试使用Python后端，如果失败则使用纯JS版本
            try {
                // 创建一个带超时的fetch请求
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000); // 3秒超时
                
                const response = await fetch(`${API_BASE_URL}/divine`, {
                    method: 'GET',
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error('Backend not available');
                }
                
                data = await response.json();
                console.log('使用Python后端服务');
            } catch (backendError) {
                // 后端不可用，使用纯JS版本
                console.log('Python后端不可用，使用纯JavaScript版本');
                if (typeof performDivination === 'undefined') {
                    throw new Error('纯JS版本未加载，请确保 hexagrams_data.js 和 divination.js 已正确加载');
                }
                data = performDivination();
            }

            // 如果选择立即生成，跳过所有动画
            if (currentSpeed === 0) {
                // 隐藏动画过程
                divinationProcessDiv.classList.add('hidden');
                
                // 直接显示所有步骤历史（不带动画）
                if (stepHistoryDiv) {
                    stepHistoryDiv.innerHTML = '';
                    if (clearHistoryBtn) {
                        clearHistoryBtn.style.display = 'block';
                    }
                }
                const lineNames = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
                for (let i = 0; i < data.divination_steps.length; i++) {
                    const lineSteps = data.divination_steps[i];
                    addStepToHistory(`━━━ 第 ${i + 1} 爻 (${lineNames[i]}) 演算开始 ━━━`, true);
                    for (let j = 0; j < lineSteps.length; j++) {
                        const step = lineSteps[j];
                        const stepData = data.divination_step_data[i][j];
                        const isResult = stepData && stepData.type === 'result';
                        const isChangingStep = data.changing_lines.includes(i) && isResult;
                        addStepToHistory(step, false, isResult, isChangingStep);
                    }
                    if (i < data.divination_steps.length - 1) {
                        addSeparator();
                    }
                }
            } else {
                // Simulate divination process step by step with animation
                // 步骤历史会在动画过程中逐步生成
                await animateDivinationProcess(data.divination_steps, data.divination_step_data, data.changing_lines);
            }

            // 确保动画区域已隐藏
            divinationProcessDiv.classList.add('hidden');
            
            // Display final results after animation
            displayHexagram(data.initial_hexagram.binary, initialHexagramDiv, data.changing_lines);
            initialHexagramName.textContent = data.initial_hexagram.name;
            initialHexagramMeaning.textContent = data.initial_hexagram.meaning;
            initialGuaci.textContent = data.initial_hexagram.guaci;
            displayYaoci(data.initial_hexagram.yaoci, initialYaoci, data.changing_lines);

            if (data.changing_lines && data.changing_lines.length > 0) {
                changingLinesSection.classList.remove('hidden');
                const lineNumbers = data.changing_lines.map(index => index + 1).join(', ');
                changingLinesText.textContent = `第 ${lineNumbers} 爻变`;
            } else {
                changingLinesSection.classList.add('hidden');
                changingLinesText.textContent = '无变爻';
            }

            displayHexagram(data.resulting_hexagram.binary, resultingHexagramDiv);
            resultingHexagramName.textContent = data.resulting_hexagram.name;
            resultingHexagramMeaning.textContent = data.resulting_hexagram.meaning;
            resultingGuaci.textContent = data.resulting_hexagram.guaci;
            displayYaoci(data.resulting_hexagram.yaoci, resultingYaoci);

            // 保存占卜数据供AI解读使用
            currentDivinationData = data;
            
            // 显示提问区域（显示已验证的问题，但允许查看和修改）
            questionSection.classList.remove('hidden');
            // 显示已验证的问题（显示当前使用的问题，但允许修改）
            if (validatedQuestion) {
                questionInput.value = validatedQuestion;
            }
            questionInput.disabled = false;  // 允许修改
            questionInput.classList.add('valid');
            questionInput.classList.remove('error');
            questionError.classList.add('hidden');
            validateQuestionBtn.disabled = false;
            validateQuestionBtn.textContent = '验证提问';
            resetQuestionBtn.style.display = 'inline-block';
            
            aiInterpretationSection.classList.add('hidden');

            resultsDiv.classList.remove('hidden');
            
            // 占卜完成后，自动使用已验证的问题进行AI解读
            if (validatedQuestion) {
                await performAIInterpretation(validatedQuestion);
            }
        } catch (error) {
            console.error('Error fetching divination results:', error);
            if (error.message.includes('纯JS版本未加载')) {
                alert('占卜失败：纯JS版本未加载。请确保 hexagrams_data.js 和 divination.js 文件存在。');
            } else {
                alert('占卜失败：' + error.message);
            }
        } finally {
            // 占卜完成后，根据配置决定按钮状态
            if (enableQuestionValidation) {
                divineButton.disabled = true;
                divineButton.textContent = '开始占卜（请重新验证问题）';
            } else {
                divineButton.disabled = false;
                divineButton.textContent = '开始占卜';
            }
        }
    });

    // 验证提问词（使用AI）
    validateQuestionBtn.addEventListener('click', async () => {
        const question = questionInput.value.trim();
        
        if (!question) {
            showQuestionError('请输入您的问题');
            return;
        }
        
        validateQuestionBtn.disabled = true;
        validateQuestionBtn.textContent = '验证中...';
        questionError.classList.add('hidden');
        questionInput.classList.remove('error', 'valid');
        
        try {
            const response = await fetch(`${API_BASE_URL}/question/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question: question })
            });
            
            const result = await response.json();
            
            if (result.is_valid) {
                questionError.classList.add('hidden');
                questionInput.classList.remove('error');
                questionInput.classList.add('valid');
                
                // 保存已验证的问题
                validatedQuestion = question;
                
                // 启用占卜按钮
                divineButton.disabled = false;
                divineButton.textContent = '开始占卜';
                
                // 显示"重新输入"按钮
                resetQuestionBtn.style.display = 'inline-block';
                
                // 显示成功提示
                const successMsg = document.createElement('div');
                successMsg.className = 'success-message';
                successMsg.textContent = '✓ 问题验证通过！现在可以开始占卜了。';
                questionError.classList.remove('hidden');
                questionError.innerHTML = '';
                questionError.appendChild(successMsg);
                questionError.style.backgroundColor = '#efe';
                questionError.style.borderColor = '#27ae60';
                questionError.style.color = '#27ae60';
                
                // 3秒后隐藏成功提示
                setTimeout(() => {
                    questionError.classList.add('hidden');
                }, 3000);
            } else {
                // 显示AI的分析和建议
                validatedQuestion = null;
                divineButton.disabled = true;
                resetQuestionBtn.style.display = 'none';
                showQuestionErrorWithAI(result.error_message, result.ai_analysis || '');
            }
        } catch (error) {
            console.error('验证提问失败:', error);
            showQuestionError('验证失败，请检查后端服务是否运行');
        } finally {
            validateQuestionBtn.disabled = false;
            validateQuestionBtn.textContent = '验证提问';
        }
    });

    // 显示提问错误（带AI分析）
    function showQuestionErrorWithAI(errorMessage, aiAnalysis) {
        questionError.classList.remove('hidden');
        questionInput.classList.add('error');
        questionInput.classList.remove('valid');
        questionError.style.backgroundColor = '#fee';
        questionError.style.borderColor = '#e74c3c';
        questionError.style.color = '#c0392b';
        
        let errorHtml = `<div class="error-message">${errorMessage}</div>`;
        
        if (aiAnalysis) {
            errorHtml += `
                <div class="ai-analysis">
                    <h4>🤖 AI分析建议：</h4>
                    <div class="ai-analysis-content">${aiAnalysis.replace(/\n/g, '<br>')}</div>
                </div>
            `;
        }
        
        questionError.innerHTML = errorHtml;
        questionError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // 显示提问错误（简单版本）
    function showQuestionError(message) {
        questionError.textContent = message;
        questionError.classList.remove('hidden');
        questionInput.classList.add('error');
        questionInput.classList.remove('valid');
        questionError.style.backgroundColor = '#fee';
        questionError.style.borderColor = '#e74c3c';
        questionError.style.color = '#c0392b';
        validatedQuestion = null;
        divineButton.disabled = true;
    }

    // 重置问题输入
    resetQuestionBtn.addEventListener('click', () => {
        questionInput.value = '';
        questionInput.disabled = false;
        questionInput.classList.remove('valid', 'error');
        questionError.classList.add('hidden');
        validateQuestionBtn.disabled = false;
        validateQuestionBtn.textContent = '验证提问';
        resetQuestionBtn.style.display = 'none';
        validatedQuestion = null;
        divineButton.disabled = true;
        divineButton.textContent = '开始占卜（请先验证问题）';
    });

    // 显示提问示例
    // 查看示例按钮事件
    if (showExamplesBtn) {
        showExamplesBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            try {
                console.log('点击查看示例按钮');
                const response = await fetch(`${API_BASE_URL}/question/examples`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('获取示例数据:', data);
                
                let examplesHtml = '<div class="examples-modal"><h3>提问示例</h3><ul>';
                if (data.examples && Array.isArray(data.examples)) {
                    data.examples.forEach(example => {
                        examplesHtml += `<li>${example}</li>`;
                    });
                }
                examplesHtml += '</ul>';
                
                if (data.guidelines) {
                    examplesHtml += '<div class="guidelines">' + data.guidelines.replace(/\n/g, '<br>') + '</div>';
                }
                examplesHtml += '</div>';
                
                // 创建模态框显示示例
                const modal = document.createElement('div');
                modal.className = 'modal-overlay';
                modal.innerHTML = `
                    <div class="modal-content">
                        <span class="modal-close">&times;</span>
                        ${examplesHtml}
                    </div>
                `;
                
                document.body.appendChild(modal);
                
                // 关闭按钮事件
                const closeBtn = modal.querySelector('.modal-close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        if (modal.parentNode) {
                            document.body.removeChild(modal);
                        }
                    });
                }
                
                // 点击遮罩层关闭
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        if (modal.parentNode) {
                            document.body.removeChild(modal);
                        }
                    }
                });
                
                // 阻止模态框内容区域的点击事件冒泡
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.addEventListener('click', (e) => {
                        e.stopPropagation();
                    });
                }
            } catch (error) {
                console.error('获取示例失败:', error);
                alert('获取示例失败，请检查后端服务是否运行');
            }
        });
    } else {
        console.error('showExamplesBtn 元素未找到');
    }

    // 执行AI解读（流式）
    async function performAIInterpretation(question) {
        if (!currentDivinationData) {
            alert('请先完成占卜');
            return;
        }
        
        // 显示AI解读区域
        aiInterpretationSection.classList.remove('hidden');
        aiInterpretationContent.innerHTML = `
            <div class="ai-interpretation-text">
                <p class="user-question">您的问题：${question}</p>
                <div class="interpretation-content" id="streamingContent">
                    <span class="typing-cursor">▋</span>
                </div>
            </div>
        `;
        
        // 滚动到AI解读区域
        aiInterpretationSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        const streamingContent = document.getElementById('streamingContent');
        let fullText = '';
        
        try {
            const response = await fetch(`${API_BASE_URL}/ai/interpret`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    hexagram_name: currentDivinationData.initial_hexagram.name,
                    changing_lines: currentDivinationData.changing_lines,
                    question: question,
                    resulting_hexagram_name: currentDivinationData.resulting_hexagram.name
                })
            });
            
            // 检查是否是流式响应
            const contentType = response.headers.get('content-type');
            console.log('[Stream] Content-Type:', contentType);
            
            if (contentType && contentType.includes('text/event-stream')) {
                // 流式响应处理
                console.log('[Stream] 开始接收流式响应');
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';
                let chunkCount = 0;
                const startTime = Date.now();
                let firstChunkTime = null;
                
                // 使用 requestAnimationFrame 来批量更新DOM，提高性能
                let pendingUpdate = false;
                let lastUpdateTime = 0;
                const UPDATE_INTERVAL = 16; // 约60fps
                
                const updateDisplay = () => {
                    if (fullText) {
                        streamingContent.innerHTML = fullText.replace(/\n/g, '<br>') + '<span class="typing-cursor">▋</span>';
                        // 自动滚动到底部（使用更平滑的方式）
                        const container = streamingContent.parentElement;
                        if (container) {
                            container.scrollTop = container.scrollHeight;
                        }
                    }
                    pendingUpdate = false;
                };
                
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        console.log(`[Stream] 流式响应完成，共接收 ${chunkCount} 个chunk`);
                        break;
                    }
                    
                    const chunkData = decoder.decode(value, { stream: true });
                    buffer += chunkData;
                    const lines = buffer.split('\n\n');
                    buffer = lines.pop() || ''; // 保留最后一个不完整的行
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                
                                if (data.type === 'start') {
                                    // 开始接收
                                    console.log('[Stream] 收到开始信号');
                                    streamingContent.innerHTML = '<span class="typing-cursor">▋</span>';
                                    fullText = '';
                                    firstChunkTime = Date.now();
                                } else if (data.type === 'chunk') {
                                    // 接收内容块
                                    chunkCount++;
                                    if (!firstChunkTime) {
                                        firstChunkTime = Date.now();
                                        const delay = firstChunkTime - startTime;
                                        console.log(`[Stream] 第一个chunk在 ${delay}ms 后到达`);
                                    }
                                    
                                    fullText += data.content;
                                    
                                    // 使用节流更新DOM，避免过于频繁的更新
                                    const now = Date.now();
                                    if (!pendingUpdate && (now - lastUpdateTime >= UPDATE_INTERVAL)) {
                                        updateDisplay();
                                        lastUpdateTime = now;
                                    } else if (!pendingUpdate) {
                                        pendingUpdate = true;
                                        requestAnimationFrame(() => {
                                            updateDisplay();
                                            lastUpdateTime = Date.now();
                                        });
                                    }
                                    
                                    // 每100个chunk输出一次调试信息
                                    if (chunkCount % 100 === 0) {
                                        console.log(`[Stream] 已接收 ${chunkCount} 个chunk，当前文本长度: ${fullText.length}`);
                                    }
                                } else if (data.type === 'end') {
                                    // 结束，移除光标
                                    console.log(`[Stream] 收到结束信号，总chunk数: ${chunkCount}，总耗时: ${Date.now() - startTime}ms`);
                                    updateDisplay(); // 确保最后一次更新
                                    streamingContent.innerHTML = fullText.replace(/\n/g, '<br>');
                                }
                            } catch (e) {
                                console.error('解析SSE数据失败:', e, 'Line:', line);
                            }
                        }
                    }
                }
                
                // 确保所有待处理的更新都完成
                if (pendingUpdate) {
                    updateDisplay();
                }
            } else {
                // 非流式响应（兼容旧代码）
                const result = await response.json();
                
                if (result.success) {
                    streamingContent.innerHTML = result.interpretation.replace(/\n/g, '<br>');
                } else {
                    aiInterpretationContent.innerHTML = `
                        <div class="ai-error">
                            <p>AI解读失败：${result.error}</p>
                            ${result.ai_analysis ? `<div class="ai-analysis-content">${result.ai_analysis.replace(/\n/g, '<br>')}</div>` : ''}
                        </div>
                    `;
                }
            }
        } catch (error) {
            console.error('AI解读失败:', error);
            aiInterpretationContent.innerHTML = `
                <div class="ai-error">
                    <p>AI解读失败：${error.message}</p>
                    <p>请检查AI服务是否配置正确</p>
                </div>
            `;
        }
    }

    // Canvas animation for divination process
    const canvas = document.getElementById('divinationCanvas');
    const ctx = canvas.getContext('2d');

    function addStepToHistory(stepText, isTitle = false, isResult = false, isChanging = false) {
        // 直接更新历史页面的DOM（SPA模式，页面不会重新加载）
        if (historyPageStepHistoryDiv) {
            // 如果是空消息，先清空
            const emptyMsg = historyPageStepHistoryDiv.querySelector('.empty-message');
            if (emptyMsg) {
                historyPageStepHistoryDiv.innerHTML = '';
                if (clearHistoryBtn) {
                    clearHistoryBtn.style.display = 'block';
                }
            }
            
            const stepItem = document.createElement('div');
            stepItem.className = 'step-item';
            
            if (isTitle) {
                stepItem.style.fontWeight = 'bold';
                stepItem.style.color = '#2c3e50';
                stepItem.style.borderLeftColor = '#34495e';
                stepItem.style.marginBottom = '15px';
            }
            
            if (isResult) {
                stepItem.classList.add('result');
            }
            
            if (isChanging) {
                stepItem.classList.add('changing-line');
            }
            
            stepItem.textContent = stepText;
            historyPageStepHistoryDiv.appendChild(stepItem);
            
            // 如果历史页面当前可见，自动滚动到底部
            if (pageViews.history && pageViews.history.classList.contains('active')) {
                setTimeout(() => {
                    historyPageStepHistoryDiv.scrollTop = historyPageStepHistoryDiv.scrollHeight;
                }, 50);
            }
        }
    }

    function addSeparator() {
        if (historyPageStepHistoryDiv) {
            const separator = document.createElement('div');
            separator.style.height = '10px';
            historyPageStepHistoryDiv.appendChild(separator);
        }
    }

    async function animateDivinationProcess(allLineSteps, allLineStepData, changingLines) {
        const lineNames = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
        
        // 清空步骤历史
        if (stepHistoryDiv) {
            stepHistoryDiv.innerHTML = '';
            if (clearHistoryBtn) {
                clearHistoryBtn.style.display = 'block';
            }
        }
        
        for (let i = 0; i < allLineSteps.length; i++) {
            // 添加爻标题
            addStepToHistory(`━━━ ${lineNames[i]} (第${i + 1}爻) ━━━`, true);
            
            currentLineStatus.textContent = `正在生成第 ${i + 1} 爻 (${lineNames[i]})...`;
            
            // 逐步显示该爻的步骤并播放动画
            await animateLineWithSteps(allLineSteps[i], allLineStepData[i], i + 1, lineNames[i], changingLines && changingLines.includes(i));
            
            // 添加分隔（除了最后一个爻）
            if (i < allLineSteps.length - 1) {
                addSeparator();
            }
        }
        
        currentLineStatus.textContent = '所有爻已生成！';
        await new Promise(resolve => setTimeout(resolve, getAnimationDelay()));
        // 隐藏动画区域
        divinationProcessDiv.classList.add('hidden');
        currentLineStatus.textContent = '';
    }

    async function animateLineWithSteps(lineSteps, stepData, lineNumber, lineName, isChanging) {
        // 清空canvas并绘制标题
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`第 ${lineNumber} 爻 (${lineName}) 演算过程`, canvas.width / 2, 25);
        
        // 遍历该爻的所有步骤
        for (let stepIndex = 0; stepIndex < stepData.length; stepIndex++) {
            const step = stepData[stepIndex];
            const stepText = lineSteps[stepIndex];
            
            // 判断步骤类型
            const isResult = step.type === 'result';
            const isChangingStep = isChanging && isResult;
            
            // 先添加步骤到历史
            addStepToHistory(stepText, false, isResult, isChangingStep);
            
            // 然后播放对应的canvas动画（动画内部已包含延迟）
            await animateStep(step, stepIndex);
            
            // 步骤之间的延迟（根据速度模式调整）
            await new Promise(resolve => setTimeout(resolve, getStepDelay()));
        }
    }

    async function animateStep(step, stepIndex) {
        const delay = getAnimationDelay();
        if (step.type === 'initial') {
            await drawInitialStalks(step.total_stalks);
            await new Promise(resolve => setTimeout(resolve, delay));
        } else if (step.type === 'remove_one') {
            await drawRemoveOne(step.total_stalks, step.removed);
            await new Promise(resolve => setTimeout(resolve, delay));
        } else if (step.type === 'divide') {
            await drawDivide(step.pile1, step.pile2);
            await new Promise(resolve => setTimeout(resolve, delay));
        } else if (step.type === 'remove_from_right') {
            await drawRemoveFromRight(step.pile1, step.pile2, step.removed);
            await new Promise(resolve => setTimeout(resolve, delay));
        } else if (step.type === 'count_fours') {
            await drawCountFours(step.pile, step.count, step.remainder);
            await new Promise(resolve => setTimeout(resolve, delay));
        } else if (step.type === 'sum_remainders') {
            await drawSumRemainders(step.remainder1, step.remainder2, step.total);
            await new Promise(resolve => setTimeout(resolve, delay));
        } else if (step.type === 'result') {
            await drawResult(step.total_remainder, step.line_type, step.line_value, step.is_changing);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    async function drawInitialStalks(total) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('初始蓍草：50 根', canvas.width / 2, 25);
        
        const startX = 80;
        const startY = 80;
        const stalkWidth = 4;
        const stalkHeight = 10;
        const spacing = 5;
        const stalksPerRow = 12;
        
        // Draw all stalks with animation
        const stalkDelay = getStalkDelay(3);
        for (let i = 0; i < total; i++) {
            const x = startX + (i % stalksPerRow) * (stalkWidth + spacing);
            const y = startY + Math.floor(i / stalksPerRow) * (stalkHeight + 3);
            
            // Animate appearance with fade-in effect
            await new Promise(resolve => {
                setTimeout(() => {
                    // Draw stalk body
                    ctx.fillStyle = '#3498db';
                    ctx.fillRect(x, y, stalkWidth, stalkHeight);
                    // Draw stalk tip
                    ctx.fillStyle = '#2980b9';
                    ctx.fillRect(x, y, stalkWidth, stalkHeight * 0.3);
                    // Add highlight
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.fillRect(x, y, stalkWidth, 2);
                    resolve();
                }, i * stalkDelay);
            });
        }
        
        // Draw count with animation
        await new Promise(resolve => setTimeout(resolve, getFixedDelay(200)));
        ctx.fillStyle = '#e67e22';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(`总计：${total} 根`, canvas.width / 2, 280);
    }

    async function drawRemoveOne(remaining, removed) {
        // First show all stalks
        await drawInitialStalks(remaining + removed);
        await new Promise(resolve => setTimeout(resolve, getFixedDelay(300)));
        
        // Clear and redraw with removal
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('取出一根（象征太极）', canvas.width / 2, 30);
        
        // Draw removed stalk separately with animation
        const removedX = canvas.width - 100;
        const removedY = 60;
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(removedX, removedY, 4, 10);
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(removedX, removedY, 4, 3);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(removedX, removedY, 4, 2);
        
        // Draw arrow pointing to removed stalk
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(removedX - 20, removedY + 5);
        ctx.lineTo(removedX, removedY + 5);
        ctx.stroke();
        
        // Draw remaining stalks
        const startX = 80;
        const startY = 80;
        const stalkWidth = 4;
        const stalkHeight = 10;
        const spacing = 5;
        const stalksPerRow = 12;
        
        for (let i = 0; i < remaining; i++) {
            const x = startX + (i % stalksPerRow) * (stalkWidth + spacing);
            const y = startY + Math.floor(i / stalksPerRow) * (stalkHeight + 3);
            ctx.fillStyle = '#3498db';
            ctx.fillRect(x, y, stalkWidth, stalkHeight);
            ctx.fillStyle = '#2980b9';
            ctx.fillRect(x, y, stalkWidth, stalkHeight * 0.3);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(x, y, stalkWidth, 2);
        }
        
        ctx.fillStyle = '#27ae60';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(`剩余：${remaining} 根`, canvas.width / 2, 280);
    }

    async function drawDivide(pile1, pile2) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('分为两堆', canvas.width / 2, 30);
        
        // Draw left pile
        const leftX = 100;
        const leftY = 70;
        const stalkWidth = 4;
        const stalkHeight = 10;
        const spacing = 4;
        const stalksPerRow = 10;
        
        ctx.fillStyle = '#34495e';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('左堆', leftX, leftY - 15);
        
        // Animate left pile appearance
        const pileDelay = getStalkDelay(2);
        for (let i = 0; i < pile1; i++) {
            const x = leftX + (i % stalksPerRow) * (stalkWidth + spacing);
            const y = leftY + Math.floor(i / stalksPerRow) * (stalkHeight + 3);
            await new Promise(resolve => {
                setTimeout(() => {
                    ctx.fillStyle = '#3498db';
                    ctx.fillRect(x, y, stalkWidth, stalkHeight);
                    ctx.fillStyle = '#2980b9';
                    ctx.fillRect(x, y, stalkWidth, stalkHeight * 0.3);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.fillRect(x, y, stalkWidth, 2);
                    resolve();
                }, i * pileDelay);
            });
        }
        
        // Draw right pile
        const rightX = 400;
        const rightY = 70;
        
        ctx.fillStyle = '#34495e';
        ctx.textAlign = 'left';
        ctx.fillText('右堆', rightX, rightY - 15);
        
        // Animate right pile appearance
        for (let i = 0; i < pile2; i++) {
            const x = rightX + (i % stalksPerRow) * (stalkWidth + spacing);
            const y = rightY + Math.floor(i / stalksPerRow) * (stalkHeight + 3);
            await new Promise(resolve => {
                setTimeout(() => {
                    ctx.fillStyle = '#e67e22';
                    ctx.fillRect(x, y, stalkWidth, stalkHeight);
                    ctx.fillStyle = '#d35400';
                    ctx.fillRect(x, y, stalkWidth, stalkHeight * 0.3);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.fillRect(x, y, stalkWidth, 2);
                    resolve();
                }, i * pileDelay);
            });
        }
        
        // Draw counts
        await new Promise(resolve => setTimeout(resolve, getFixedDelay(200)));
        ctx.fillStyle = '#27ae60';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`左堆：${pile1} 根`, leftX + 80, 280);
        ctx.fillText(`右堆：${pile2} 根`, rightX + 80, 280);
    }

    async function drawRemoveFromRight(pile1, pile2, removed) {
        // Redraw divide first
        await drawDivide(pile1 + removed, pile2 + removed);
        
        // Highlight removal
        ctx.fillStyle = '#e74c3c';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('从右堆取出一根（象征三才）', canvas.width / 2, 240);
        
        // Draw removed stalk
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(450, 60, 3, 8);
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(450, 60, 3, 3);
        
        // Update right pile count
        ctx.fillStyle = '#27ae60';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`右堆剩余：${pile2} 根`, 410, 200);
    }

    async function drawCountFours(pile, count, remainder) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${pile === 'left' ? '左' : '右'}堆：以四根为一组计数`, canvas.width / 2, 30);
        
        const startX = pile === 'left' ? 120 : 420;
        const startY = 80;
        const stalkWidth = 4;
        const stalkHeight = 10;
        const spacing = 4;
        const groupSpacing = 20;
        
        // Draw groups of 4 with animation
        const groups = Math.floor(count / 4);
        const remainderCount = remainder;
        
        for (let g = 0; g < groups; g++) {
            for (let i = 0; i < 4; i++) {
                const x = startX + g * (4 * (stalkWidth + spacing) + groupSpacing) + i * (stalkWidth + spacing);
                const y = startY;
                await new Promise(resolve => {
                    setTimeout(() => {
                        ctx.fillStyle = pile === 'left' ? '#3498db' : '#e67e22';
                        ctx.fillRect(x, y, stalkWidth, stalkHeight);
                        ctx.fillStyle = pile === 'left' ? '#2980b9' : '#d35400';
                        ctx.fillRect(x, y, stalkWidth, stalkHeight * 0.3);
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                        ctx.fillRect(x, y, stalkWidth, 2);
                        resolve();
                    }, getStalkDelay((g * 4 + i) * 10));
                });
            }
            // Draw group border
            await new Promise(resolve => setTimeout(resolve, getFixedDelay(100)));
            ctx.strokeStyle = '#7f8c8d';
            ctx.lineWidth = 2;
            ctx.strokeRect(startX + g * (4 * (stalkWidth + spacing) + groupSpacing) - 3, startY - 3, 
                          4 * (stalkWidth + spacing) + 6, stalkHeight + 6);
            
            // Draw group number
            ctx.fillStyle = '#34495e';
            ctx.font = '12px Arial';
            ctx.fillText(`${g + 1}组`, startX + g * (4 * (stalkWidth + spacing) + groupSpacing) + 8, startY + 25);
        }
        
        // Draw remainder with animation
        if (remainderCount > 0) {
            await new Promise(resolve => setTimeout(resolve, getFixedDelay(200)));
            const remX = startX + groups * (4 * (stalkWidth + spacing) + groupSpacing);
            for (let i = 0; i < remainderCount; i++) {
                const x = remX + i * (stalkWidth + spacing);
                await new Promise(resolve => {
                    setTimeout(() => {
                        ctx.fillStyle = '#e74c3c';
                        ctx.fillRect(x, startY + 40, stalkWidth, stalkHeight);
                        ctx.fillStyle = '#c0392b';
                        ctx.fillRect(x, startY + 40, stalkWidth, stalkHeight * 0.3);
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                        ctx.fillRect(x, startY + 40, stalkWidth, 2);
                        resolve();
                    }, getStalkDelay(i * 50));
                });
            }
            
            // Highlight remainder
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 2;
            ctx.strokeRect(remX - 3, startY + 37, remainderCount * (stalkWidth + spacing) + 6, stalkHeight + 6);
            
            ctx.fillStyle = '#e74c3c';
            ctx.font = 'bold 16px Arial';
            ctx.fillText(`余数：${remainderCount}`, startX + 50, startY + 70);
        }
        
        // Draw summary
        await new Promise(resolve => setTimeout(resolve, getFixedDelay(200)));
        ctx.fillStyle = '#34495e';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`共 ${count} 根，${groups} 组，余 ${remainderCount}`, canvas.width / 2, 280);
    }

    async function drawSumRemainders(rem1, rem2, total) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('将左右两堆的余数相加', canvas.width / 2, 30);
        
        // Draw left remainder with visual representation
        const leftX = 150;
        const leftY = 100;
        const stalkWidth = 4;
        const stalkHeight = 10;
        const spacing = 5;
        
        // Draw left remainder stalks
        for (let i = 0; i < rem1; i++) {
            const x = leftX + i * (stalkWidth + spacing);
                await new Promise(resolve => {
                    setTimeout(() => {
                        ctx.fillStyle = '#3498db';
                        ctx.fillRect(x, leftY, stalkWidth, stalkHeight);
                        ctx.fillStyle = '#2980b9';
                        ctx.fillRect(x, leftY, stalkWidth, stalkHeight * 0.3);
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                        ctx.fillRect(x, leftY, stalkWidth, 2);
                        resolve();
                    }, getStalkDelay(i * 30));
                });
        }
        
        ctx.fillStyle = '#3498db';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(`${rem1}`, leftX + rem1 * (stalkWidth + spacing) / 2, leftY - 20);
        
        // Draw plus sign with animation
        await new Promise(resolve => setTimeout(resolve, getFixedDelay(200)));
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 32px Arial';
        ctx.fillText('+', canvas.width / 2, leftY + 5);
        
        // Draw right remainder stalks
        const rightX = 450;
        for (let i = 0; i < rem2; i++) {
            const x = rightX + i * (stalkWidth + spacing);
                await new Promise(resolve => {
                    setTimeout(() => {
                        ctx.fillStyle = '#e67e22';
                        ctx.fillRect(x, leftY, stalkWidth, stalkHeight);
                        ctx.fillStyle = '#d35400';
                        ctx.fillRect(x, leftY, stalkWidth, stalkHeight * 0.3);
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                        ctx.fillRect(x, leftY, stalkWidth, 2);
                        resolve();
                    }, getStalkDelay(i * 30));
                });
        }
        
        ctx.fillStyle = '#e67e22';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(`${rem2}`, rightX + rem2 * (stalkWidth + spacing) / 2, leftY - 20);
        
        // Draw equals sign
        await new Promise(resolve => setTimeout(resolve, getFixedDelay(200)));
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 28px Arial';
        ctx.fillText('=', canvas.width / 2, leftY + 60);
        
        // Draw result with animation
        await new Promise(resolve => setTimeout(resolve, getFixedDelay(300)));
        ctx.fillStyle = '#27ae60';
        ctx.font = 'bold 36px Arial';
        ctx.fillText(`${total}`, canvas.width / 2, leftY + 100);
        
        // Draw total stalks visualization
        const totalX = canvas.width / 2 - (total * (stalkWidth + spacing)) / 2;
        for (let i = 0; i < total; i++) {
            const x = totalX + i * (stalkWidth + spacing);
            await new Promise(resolve => {
                setTimeout(() => {
                    ctx.fillStyle = '#27ae60';
                    ctx.fillRect(x, leftY + 120, stalkWidth, stalkHeight);
                    ctx.fillStyle = '#229954';
                    ctx.fillRect(x, leftY + 120, stalkWidth, stalkHeight * 0.3);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.fillRect(x, leftY + 120, stalkWidth, 2);
                    resolve();
                    }, getStalkDelay(i * 20));
            });
        }
        
        ctx.fillStyle = '#34495e';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`总余数：${total} 根`, canvas.width / 2, 280);
    }

    async function drawResult(total, lineType, lineValue, isChanging) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('最终结果', canvas.width / 2, 30);
        
        // Draw the line with animation
        const centerX = canvas.width / 2;
        const centerY = 120;
        const lineWidth = 200;
        const lineHeight = 12;
        
        // Animate line appearance
        await new Promise(resolve => setTimeout(resolve, getFixedDelay(200)));
        
        if (lineValue === '1') {
            // Yang line (solid)
            ctx.fillStyle = isChanging ? '#f39c12' : '#2c3e50';
            ctx.fillRect(centerX - lineWidth / 2, centerY, lineWidth, lineHeight);
            // Add gradient
            const gradient = ctx.createLinearGradient(centerX - lineWidth / 2, centerY, centerX + lineWidth / 2, centerY);
            gradient.addColorStop(0, isChanging ? '#f39c12' : '#34495e');
            gradient.addColorStop(1, isChanging ? '#e67e22' : '#2c3e50');
            ctx.fillStyle = gradient;
            ctx.fillRect(centerX - lineWidth / 2, centerY, lineWidth, lineHeight);
            
            if (isChanging) {
                // Add pulsing glow effect
                for (let i = 0; i < 3; i++) {
                    ctx.shadowBlur = 20 - i * 5;
                    ctx.shadowColor = 'rgba(243, 156, 18, ' + (0.8 - i * 0.2) + ')';
                    ctx.fillRect(centerX - lineWidth / 2, centerY, lineWidth, lineHeight);
                }
                ctx.shadowBlur = 0;
            }
        } else {
            // Yin line (broken)
            const segmentWidth = lineWidth / 2 - 8;
            ctx.fillStyle = isChanging ? '#f39c12' : '#2c3e50';
            ctx.fillRect(centerX - lineWidth / 2, centerY, segmentWidth, lineHeight);
            ctx.fillRect(centerX + 8, centerY, segmentWidth, lineHeight);
            
            // Add gradient
            const gradient1 = ctx.createLinearGradient(centerX - lineWidth / 2, centerY, centerX - lineWidth / 2 + segmentWidth, centerY);
            gradient1.addColorStop(0, isChanging ? '#f39c12' : '#34495e');
            gradient1.addColorStop(1, isChanging ? '#e67e22' : '#2c3e50');
            ctx.fillStyle = gradient1;
            ctx.fillRect(centerX - lineWidth / 2, centerY, segmentWidth, lineHeight);
            
            const gradient2 = ctx.createLinearGradient(centerX + 8, centerY, centerX + 8 + segmentWidth, centerY);
            gradient2.addColorStop(0, isChanging ? '#f39c12' : '#34495e');
            gradient2.addColorStop(1, isChanging ? '#e67e22' : '#2c3e50');
            ctx.fillStyle = gradient2;
            ctx.fillRect(centerX + 8, centerY, segmentWidth, lineHeight);
            
            if (isChanging) {
                for (let i = 0; i < 3; i++) {
                    ctx.shadowBlur = 20 - i * 5;
                    ctx.shadowColor = 'rgba(243, 156, 18, ' + (0.8 - i * 0.2) + ')';
                    ctx.fillRect(centerX - lineWidth / 2, centerY, segmentWidth, lineHeight);
                    ctx.fillRect(centerX + 8, centerY, segmentWidth, lineHeight);
                }
                ctx.shadowBlur = 0;
            }
        }
        
        // Draw result text with animation
        await new Promise(resolve => setTimeout(resolve, getFixedDelay(300)));
        ctx.fillStyle = '#e67e22';
        ctx.font = 'bold 22px Arial';
        ctx.fillText(`总余数：${total}`, centerX, centerY + 50);
        
        await new Promise(resolve => setTimeout(resolve, 200));
        ctx.fillStyle = '#8e44ad';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(`类型：${lineType}`, centerX, centerY + 85);
        
        await new Promise(resolve => setTimeout(resolve, 200));
        ctx.fillStyle = isChanging ? '#e74c3c' : '#27ae60';
        ctx.font = 'bold 22px Arial';
        ctx.fillText(`${lineValue === '1' ? '阳' : '阴'}爻${isChanging ? '（变爻）' : '（不变）'}`, centerX, centerY + 120);
        
        // Draw decorative border
        ctx.strokeStyle = isChanging ? '#f39c12' : '#95a5a6';
        ctx.lineWidth = 2;
        ctx.strokeRect(centerX - lineWidth / 2 - 10, centerY - 5, lineWidth + 20, lineHeight + 10);
    }

    function displayHexagram(binaryString, targetDiv, changingLines = []) {
        targetDiv.innerHTML = ''; // Clear previous hexagram
        for (let i = 0; i < binaryString.length; i++) {
            const line = document.createElement('div');
            line.classList.add('line'); // 使用与web版一致的类名
            if (binaryString[i] === '0') {
                line.classList.add('yin');
            } else {
                line.classList.add('yang');
            }
            // Check if this line is a changing line (only for initial hexagram display)
            // Note: changingLines are 0-indexed, hexagram lines are displayed from bottom (0) to top (5)
            if (changingLines.includes(i)) {
                line.classList.add('changing');
            }
            targetDiv.appendChild(line);
        }
    }

    function displayYaoci(yaociArray, targetUl, changingLines = []) {
        targetUl.innerHTML = '';
        const yaociNames = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];
        yaociArray.forEach((yc, index) => {
            const li = document.createElement('li');
            li.textContent = `${yaociNames[index]}：${yc}`;
            if (changingLines.includes(index)) {
                li.style.fontWeight = 'bold';
                li.style.color = '#e67e22'; // Highlight changing yao ci
            }
            targetUl.appendChild(li);
        });
    }
    
    // 清空历史按钮事件
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            if (confirm('确定要清空所有历史记录吗？')) {
                if (stepHistoryDiv) {
                    stepHistoryDiv.innerHTML = '<p class="empty-message">暂无推演步骤历史，请先进行占卜</p>';
                    clearHistoryBtn.style.display = 'none';
                }
            }
        });
    }
});