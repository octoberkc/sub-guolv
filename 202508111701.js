/*
 * 节点过滤脚本
 * 更新日期：2024-04-05 15:30:15
 *
 * 目的：从代理节点列表中筛选出符合特定条件的节点，移除不符合条件的节点。
 * 用法：Sub-Store 脚本操作添加
 * 参数：以下是此脚本支持的参数，必须以 # 为开头多个参数使用"&"连接。
 *
 *** 过滤参数
 * [clear] 清理乱名（根据 `nameclear` 正则表达式过滤）。
 * [nx]    过滤掉3倍以及以上的高倍率节点（例如：会移除3x, 4x, 5x, 10x等节点，保留1x, 2x等节点）。
 * [blnx]  只保留高倍率节点（不区分倍率大小，只要是2倍及以上就被视为高倍率，例如2x, 3x, 4x等）。
 */

const inArg = $arguments;

// --- 参数解析 ---
const clear = inArg.clear || false;
const nx = inArg.nx || false;
const blnx = inArg.blnx || false;


// --- 常量及正则表达式定义 ---

// 清理乱名的正则表达式
const nameclear =
  /(套餐|到期|有效|剩余|版本|已用|过期|失联|测试|官方|网址|备用|群|TEST|客服|网站|获取|订阅|流量|机场|下次|官址|联系|邮箱|工单|学术|官网|USE|USED|TOTAL|EXPIRE|EMAIL)/i;

// 用于 [nx] 参数：匹配 "3倍以及以上" 的高倍率节点
// 匹配数字倍率 (3x, 3.5x, 4x, 10x 等) 或字符倍率 (ˣ³, ˣ¹⁰ 等) 或 "高倍" 关键词
const namenx = /(?:[3-9]|[1-9]\d+)(?:\.\d+)?[x倍]|ˣ(?:[3-9]|10)|高倍/i;

// 用于 [blnx] 参数：匹配所有 (2倍以及以上) 高倍率节点。
// (?!1): 确保不是1倍率
const nameblnx = /(高倍|(?!1)(0\.|\d)+(x|倍)|ˣ²|ˣ³|ˣ⁴|ˣ⁵|ˣ¹⁰)/i;


// --- 过滤核心逻辑 ---
function operator(proxies) {
  // 如果没有指定任何过滤参数，则直接返回原始列表
  if (!clear && !nx && !blnx) {
    return proxies;
  }

  // 根据传入的参数进行过滤
  proxies = proxies.filter((res) => {
    const resname = res.name;
    let shouldKeep = true; // 默认保留

    if (clear && nameclear.test(resname)) {
      shouldKeep = false; // 如果 clear 为 true 且名称匹配 nameclear (乱名)，则不保留
    }

    // 注意：nx 和 blnx 可能会有冲突，一般建议只使用其中一个。
    // 如果同时使用，会按照代码逻辑顺序执行过滤，即先考虑 nx，再考虑 blnx。
    if (nx && namenx.test(resname)) {
      shouldKeep = false; // 如果 nx 为 true 且名称匹配 namenx (3倍及以上高倍率)，则不保留
    }

    if (blnx && !nameblnx.test(resname)) {
      shouldKeep = false; // 如果 blnx 为 true 且名称不匹配 nameblnx (任何高倍率)，则不保留 (即只保留高倍率)
    }

    return shouldKeep;
  });

  return proxies;
}
