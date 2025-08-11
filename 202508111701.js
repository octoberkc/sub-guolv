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
 * [nx]    过滤掉高倍率节点（保留1倍率与不显示倍率的）。
 * [blnx]  只保留高倍率节点。
 */

const inArg = $arguments;

// --- 参数解析 ---
const clear = inArg.clear || false;
const nx = inArg.nx || false;
const blnx = inArg.blnx || false;


// --- 常量及正则表达式定义 (只保留必要的) ---

// 清理乱名的正则表达式
const nameclear =
  /(套餐|到期|有效|剩余|版本|已用|过期|失联|测试|官方|网址|备用|群|TEST|客服|网站|获取|订阅|流量|机场|下次|官址|联系|邮箱|工单|学术|USE|USED|TOTAL|EXPIRE|EMAIL)/i;
// 只保留高倍率的正则表达式
const nameblnx = /(高倍|(?!1)2+(x|倍)|ˣ²|ˣ³|ˣ⁴|ˣ⁵|ˣ¹⁰)/i;
// 过滤高倍率的正则表达式 (保留1倍率与不显示倍率的)
const namenx = /(高倍|(?!1)(0\.|\d)+(x|倍)|ˣ²|ˣ³|ˣ⁴|ˣ⁵|ˣ¹⁰)/i;


// --- 过滤核心逻辑 ---
function operator(proxies) {
  // 如果没有指定任何过滤参数，则直接返回原始列表
  if (!clear && !nx && !blnx) {
    return proxies;
  }

  // 根据传入的参数进行过滤
  proxies = proxies.filter((res) => {
    const resname = res.name;
    const shouldKeep =
      !(clear && nameclear.test(resname)) &&    // 如果 clear 为 true 且名称匹配 nameclear，则不保留
      !(nx && namenx.test(resname)) &&          // 如果 nx 为 true 且名称匹配 namenx (高倍率)，则不保留 (即保留非高倍率)
      !(blnx && !nameblnx.test(resname));       // 如果 blnx 为 true 且名称不匹配 nameblnx (高倍率)，则不保留 (即只保留高倍率)
    return shouldKeep;
  });

  return proxies;
}
