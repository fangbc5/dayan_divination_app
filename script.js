document.addEventListener('DOMContentLoaded', () => {
    const divineButton = document.getElementById('divineButton');
    const speedButtons = document.querySelectorAll('.speed-btn');
    const divinationProcessDiv = document.getElementById('divinationProcess');
    const currentLineStatus = document.getElementById('currentLineStatus');
    const resultsDiv = document.getElementById('results');
    const stepHistoryDiv = document.getElementById('stepHistory');
    
    // 跟踪用户是否手动向上滚动过（离开底部）
    let userHasScrolledUp = false;
    let lastScrollTop = 0;
    let expectedScrollTop = -1; // 记录程序期望的滚动位置，用于区分程序滚动和用户滚动
    
    // 检查是否在底部附近
    const isNearBottom = () => {
        const scrollHeight = stepHistoryDiv.scrollHeight;
        const scrollTop = stepHistoryDiv.scrollTop;
        const clientHeight = stepHistoryDiv.clientHeight;
        return scrollHeight - scrollTop - clientHeight < 10;
    };
    
    // 监听用户滚动事件
    stepHistoryDiv.addEventListener('scroll', () => {
        const currentScrollTop = stepHistoryDiv.scrollTop;
        
        // 如果是程序自动滚动（滚动位置接近期望位置），不更新 userHasScrolledUp
        if (expectedScrollTop >= 0 && Math.abs(currentScrollTop - expectedScrollTop) < 5) {
            expectedScrollTop = -1; // 重置标记
            lastScrollTop = currentScrollTop;
            // 如果滚动到底部，确保 userHasScrolledUp 为 false
            if (isNearBottom()) {
                userHasScrolledUp = false;
            }
            return;
        }
        
        // 用户手动滚动
        // 如果用户滚动到底部附近，重置标记，恢复自动跟随
        if (isNearBottom()) {
            userHasScrolledUp = false;
        } else if (currentScrollTop < lastScrollTop) {
            // 如果用户向上滚动（离开底部），标记为用户手动向上滚动
            userHasScrolledUp = true;
        }
        
        lastScrollTop = currentScrollTop;
    });
    
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

    divineButton.addEventListener('click', async () => {
        divineButton.disabled = true;
        divineButton.textContent = '占卜中...';
        resultsDiv.classList.add('hidden');
        divinationProcessDiv.classList.remove('hidden');
        currentLineStatus.textContent = '';
        
        // 清空步骤历史
        stepHistoryDiv.innerHTML = '<p class="empty-message">正在生成推演步骤...</p>';
        // 重置滚动状态
        userHasScrolledUp = false;
        lastScrollTop = 0;

        try {
            let data;
            
            // 尝试使用Python后端，如果失败则使用纯JS版本
            try {
                // 创建一个带超时的fetch请求
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000); // 3秒超时
                
                const response = await fetch('http://127.0.0.1:5000/divine', {
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
                stepHistoryDiv.innerHTML = '';
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

            resultsDiv.classList.remove('hidden');
        } catch (error) {
            console.error('Error fetching divination results:', error);
            if (error.message.includes('纯JS版本未加载')) {
                alert('占卜失败：纯JS版本未加载。请确保 hexagrams_data.js 和 divination.js 文件存在。');
            } else {
                alert('占卜失败：' + error.message);
            }
        } finally {
            divineButton.disabled = false;
            divineButton.textContent = '开始占卜';
        }
    });

    // Canvas animation for divination process
    const canvas = document.getElementById('divinationCanvas');
    const ctx = canvas.getContext('2d');

    function addStepToHistory(stepText, isTitle = false, isResult = false, isChanging = false) {
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
        stepHistoryDiv.appendChild(stepItem);
        
        // 使用 requestAnimationFrame 确保 DOM 更新后再检查滚动位置
        requestAnimationFrame(() => {
            // 检查是否需要自动滚动：用户没有手动向上滚动，或者已经在底部附近
            const shouldAutoScroll = !userHasScrolledUp || isNearBottom();
            
            if (shouldAutoScroll) {
                const targetScrollTop = stepHistoryDiv.scrollHeight;
                expectedScrollTop = targetScrollTop; // 记录期望的滚动位置
                stepHistoryDiv.scrollTop = targetScrollTop;
            }
        });
    }

    function addSeparator() {
        const separator = document.createElement('div');
        separator.style.height = '10px';
        stepHistoryDiv.appendChild(separator);
    }

    async function animateDivinationProcess(allLineSteps, allLineStepData, changingLines) {
        const lineNames = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
        
        // 清空步骤历史
        stepHistoryDiv.innerHTML = '';
        
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
            line.classList.add('line');
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
});