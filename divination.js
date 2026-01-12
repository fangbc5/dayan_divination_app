// 大衍筮法核心算法（纯JavaScript版本）

/**
 * 执行一变的过程
 * @param {number} stalks - 当前蓍草数量
 * @param {number} changeNumber - 变数（1、2或3）
 * @returns {Object} 包含余数、剩余蓍草、步骤文本和结构化数据的对象
 */
function performOneChange(stalks, changeNumber) {
    const steps = [];
    const stepData = [];
    
    // 第一步：取出一根蓍草（象征太极）
    stalks -= 1;
    steps.push(`第${changeNumber}变第一步：取出一根蓍草，置于一边（象征太极）。剩余蓍草：${stalks} 根。`);
    stepData.push({
        step: 1,
        type: "remove_one",
        total_stalks: stalks,
        removed: 1,
        description: `取出一根蓍草（太极），剩余：${stalks} 根`
    });

    // 第二步：将蓍草分为两堆
    const pile1 = Math.floor(Math.random() * (stalks - 1)) + 1;
    const pile2 = stalks - pile1;
    steps.push(`第${changeNumber}变第二步：将 ${stalks} 根蓍草随意分为两堆。左堆：${pile1} 根，右堆：${pile2} 根。`);
    stepData.push({
        step: 2,
        type: "divide",
        total_stalks: stalks,
        pile1: pile1,
        pile2: pile2,
        description: `分为两堆：左堆 ${pile1} 根，右堆 ${pile2} 根`
    });

    // 第三步：从右堆中取出一根（象征天地人三才）
    const pile2Original = pile2;
    const pile2After = pile2 - 1;
    steps.push(`第${changeNumber}变第三步：从右堆中取出一根蓍草，置于一边（象征天地人三才）。右堆剩余：${pile2Original} - 1 = ${pile2After} 根。`);
    stepData.push({
        step: 3,
        type: "remove_from_right",
        pile1: pile1,
        pile2: pile2After,
        removed: 1,
        description: `从右堆取出一根，右堆剩余：${pile2After} 根`
    });

    // 第四步：左堆以四计数
    let remainder1 = pile1 % 4;
    if (remainder1 === 0) {
        remainder1 = 4;
    }
    steps.push(`第${changeNumber}变第四步：左堆 ${pile1} 根，以四根为一组数，余数：${remainder1} 根。`);
    stepData.push({
        step: 4,
        type: "count_fours",
        pile: "left",
        count: pile1,
        remainder: remainder1,
        description: `左堆 ${pile1} 根，以四计数，余数：${remainder1}`
    });

    // 第五步：右堆以四计数
    let remainder2 = pile2After % 4;
    if (remainder2 === 0) {
        remainder2 = 4;
    }
    steps.push(`第${changeNumber}变第五步：右堆 ${pile2After} 根，以四根为一组数，余数：${remainder2} 根。`);
    stepData.push({
        step: 5,
        type: "count_fours",
        pile: "right",
        count: pile2After,
        remainder: remainder2,
        description: `右堆 ${pile2After} 根，以四计数，余数：${remainder2}`
    });

    // 第六步：将左右两堆的余数相加
    const changeRemainder = remainder1 + remainder2; // 这将是4或8
    steps.push(`第${changeNumber}变第六步：将左右两堆的余数相加：${remainder1} + ${remainder2} = ${changeRemainder} 根（此变的余数）。`);
    stepData.push({
        step: 6,
        type: "sum_remainders",
        remainder1: remainder1,
        remainder2: remainder2,
        total: changeRemainder,
        description: `余数相加：${remainder1} + ${remainder2} = ${changeRemainder}`
    });

    // 计算剩余蓍草
    // 开始时是stalks根（已取出太极），现在取出：1根（三才）+ changeRemainder根（两个余数）
    const remainingStalks = stalks - 1 - changeRemainder;
    steps.push(`第${changeNumber}变完成：取出1根（三才）+ 余数${changeRemainder}根 = ${1 + changeRemainder}根，剩余 ${remainingStalks} 根用于下一变。`);
    
    return {
        remainder: changeRemainder,
        remainingStalks: remainingStalks,
        steps: steps,
        stepData: stepData
    };
}

/**
 * 生成一爻的详细推演过程（三变）
 * @returns {Object} 包含爻值、是否变爻、步骤文本和结构化数据的对象
 */
function getLineValueDetailed() {
    const allSteps = [];
    const allStepData = [];
    
    let stalks = 50;
    allSteps.push(`初始蓍草：${stalks} 根。`);
    allStepData.push({
        step: 0,
        type: "initial",
        total_stalks: stalks,
        description: `初始蓍草：${stalks} 根`
    });

    // 执行三变
    const remainders = [];
    for (let changeNum = 1; changeNum <= 3; changeNum++) {
        const result = performOneChange(stalks, changeNum);
        remainders.push(result.remainder);
        stalks = result.remainingStalks;
        allSteps.push(...result.steps);
        allStepData.push(...result.stepData);
    }
    
    // 根据三次余数的总和确定爻的类型
    // 三变皆为4 (4+4+4=12): 老阳 -> 阳爻变
    // 两4一8 (4+4+8=16, 4+8+4=16, 8+4+4=16): 少阴 -> 阴爻不变
    // 一4两8 (4+8+8=20, 8+4+8=20, 8+8+4=20): 少阳 -> 阳爻不变
    // 三变皆为8 (8+8+8=24): 老阴 -> 阴爻变
    
    const totalSum = remainders.reduce((a, b) => a + b, 0);
    allSteps.push(`三变完成：第一变余数 ${remainders[0]}，第二变余数 ${remainders[1]}，第三变余数 ${remainders[2]}，总和：${totalSum}。`);
    
    let lineValue = "";
    let isChanging = false;
    let lineType = "";
    
    if (totalSum === 12) {  // 4+4+4
        lineValue = "1";
        isChanging = true;
        lineType = "老阳";
        allSteps.push(`最终结果：总和 ${totalSum}（三变皆为4），为九（老阳），此爻为阳爻，且为变爻。`);
    } else if (totalSum === 16) {  // 4+4+8, 4+8+4, 8+4+4
        lineValue = "0";
        isChanging = false;
        lineType = "少阴";
        allSteps.push(`最终结果：总和 ${totalSum}（两4一8），为八（少阴），此爻为阴爻，不变。`);
    } else if (totalSum === 20) {  // 4+8+8, 8+4+8, 8+8+4
        lineValue = "1";
        isChanging = false;
        lineType = "少阳";
        allSteps.push(`最终结果：总和 ${totalSum}（一4两8），为七（少阳），此爻为阳爻，不变。`);
    } else if (totalSum === 24) {  // 8+8+8
        lineValue = "0";
        isChanging = true;
        lineType = "老阴";
        allSteps.push(`最终结果：总和 ${totalSum}（三变皆为8），为六（老阴），此爻为阴爻，且为变爻。`);
    } else {
        // 异常情况（理论上不应该发生）
        lineValue = "0";
        isChanging = false;
        lineType = "异常";
        allSteps.push(`最终结果：总和 ${totalSum}，结果异常，默认为阴爻，不变。`);
    }

    allStepData.push({
        step: 7,
        type: "result",
        total_remainder: totalSum,
        remainders: remainders,
        line_type: lineType,
        line_value: lineValue,
        is_changing: isChanging,
        description: `三变总和 ${totalSum}，为${lineType}，此爻为${lineValue === '1' ? '阳' : '阴'}爻${isChanging ? '，变爻' : '，不变'}`
    });

    return {
        lineValue: lineValue,
        isChanging: isChanging,
        steps: allSteps,
        stepData: allStepData
    };
}

/**
 * 执行完整的占卜（六爻）
 * @returns {Object} 包含本卦、之卦、变爻、推演步骤等完整数据的对象
 */
function performDivination() {
    const allLineSteps = [];
    const allLineStepData = [];
    const lines = [];
    const changingLinesIndices = [];

    // 生成六爻
    for (let i = 0; i < 6; i++) {
        const result = getLineValueDetailed();
        lines.push(result.lineValue);
        if (result.isChanging) {
            changingLinesIndices.push(i);
        }
        allLineSteps.push(result.steps);
        allLineStepData.push(result.stepData);
    }
    
    const initialHexagramBinary = lines.join("");
    
    // 确定之卦（如果有变爻）
    const resultingHexagramBinaryList = [...lines];
    if (changingLinesIndices.length > 0) {
        for (let i of changingLinesIndices) {
            resultingHexagramBinaryList[i] = lines[i] === "1" ? "0" : "1";
        }
    }
    const resultingHexagramBinary = resultingHexagramBinaryList.join("");

    // 获取卦象信息
    const initialHexagramInfo = HEXAGRAMS[initialHexagramBinary] || {
        name: "未知卦",
        meaning: "未知卦",
        guaci: "无此卦辞。",
        yaoci: Array(6).fill("无此爻辞。")
    };
    
    const resultingHexagramInfo = HEXAGRAMS[resultingHexagramBinary] || {
        name: "未知卦",
        meaning: "未知卦",
        guaci: "无此卦辞。",
        yaoci: Array(6).fill("无此爻辞。")
    };

    return {
        initial_hexagram: {
            binary: initialHexagramBinary,
            name: initialHexagramInfo.name,
            meaning: initialHexagramInfo.meaning,
            guaci: initialHexagramInfo.guaci,
            yaoci: initialHexagramInfo.yaoci
        },
        changing_lines: changingLinesIndices,
        resulting_hexagram: {
            binary: resultingHexagramBinary,
            name: resultingHexagramInfo.name,
            meaning: resultingHexagramInfo.meaning,
            guaci: resultingHexagramInfo.guaci,
            yaoci: resultingHexagramInfo.yaoci
        },
        divination_steps: allLineSteps,
        divination_step_data: allLineStepData
    };
}
