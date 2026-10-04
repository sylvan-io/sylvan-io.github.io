---
title: AI Agent 落地的最小闭环：规划、工具与记忆
description: 把 AI Agent 从 demo 变成产品的关键，是把"规划-工具-记忆"这三件事的最小闭环跑通
pubDate: 2026-09-30
tags: ["ai", "architecture"]
lang: zh-CN
---

2024 年起，AI Agent 成了最热的词。但凡有个 LLM 应用，都想往"Agent"上靠。可真正的 Agent 落地，远比 demo 复杂。

这篇文章抛开 hype，聚焦一个最小可用的 Agent 闭环：**规划（Plan）、工具（Tool）、记忆（Memory）**。

## Agent 和普通 LLM 应用的区别

普通 LLM 应用：用户输入 → Prompt → LLM → 输出。
Agent 应用：用户输入 → **循环**（思考 → 行动 → 观察）→ 输出。

区别就在那个**循环**。Agent 不是一次性回答，而是多轮调用工具、观察结果、调整计划，直到满足停止条件。

## 三件套：规划、工具、记忆

### 1. 规划 (Plan)

规划模块决定"下一步做什么"。最朴素的实现就是一个 prompt：

```
你是一个 Agent。
- 当前目标：{goal}
- 已完成的步骤：{history}
- 可用工具：{tools}
请输出下一步的 JSON：{"thought": "...", "action": "tool_name", "args": {...}}。
如果已经达成目标，输出 {"done": true, "answer": "..."}。
```

把 LLM 的输出严格约束成 JSON，让代码能解析、能分支。这就是 ReAct / MRKL 这类框架的核心思路。

### 2. 工具 (Tool)

工具是 Agent 与外部世界交互的接口。本质上是一个有名字、有描述、有参数 schema 的函数：

```python
{
    "name": "search_docs",
    "description": "在内部文档库中搜索关键词",
    "parameters": {
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "搜索关键词"},
            "top_k": {"type": "integer", "default": 5}
        },
        "required": ["query"]
    }
}
```

工具设计有几个经验法则：

- **粒度要小**：一个工具做一件事；太多参数的"瑞士军刀"工具会让 LLM 选择困难
- **描述要清晰**：LLM 看不到实现，只能凭 description 决定用不用；描述就是 API 文档
- **错误信息要可恢复**：返回结构化错误，让 Agent 能重试或换工具

### 3. 记忆 (Memory)

记忆分两层：

- **短期记忆**：当前任务的上下文（history、tool 结果）。用 prompt 直接喂给 LLM
- **长期记忆**：跨任务持久化的信息（用户偏好、历史决策）。通常用向量数据库存

最简实现可以只有短期记忆——把所有 tool 调用和结果塞进 prompt，等上下文快满了就 summarize。生产环境才需要向量库 + 检索。

## 一个最小闭环的伪代码

```python
def run_agent(goal: str, tools: dict, llm, max_steps: int = 10) -> str:
    history = []
    for step in range(max_steps):
        decision = llm.json_complete(
            prompt=build_plan_prompt(goal, history, tools)
        )
        if decision.get("done"):
            return decision["answer"]

        tool = tools[decision["action"]]
        try:
            observation = tool(**decision["args"])
        except Exception as e:
            observation = {"error": str(e)}

        history.append({
            "thought": decision.get("thought"),
            "action": decision["action"],
            "observation": observation,
        })

    return "未能完成目标，已达到最大步数。"
```

10 行不到，但已经是 Agent 的骨架。

## 从 demo 到产品的工程化要点

把上面的伪代码搬到生产，至少还要做这些：

| 关注点 | demo 状态 | 生产要求 |
|---|---|---|
| 工具调用 | 直接同步执行 | 限流、超时、熔断 |
| 记忆 | 全塞 prompt | 摘要 + 向量检索 |
| 失败处理 | 让异常抛出 | 重试、回退、转人工 |
| 可观测 | print | trace、日志、token 消耗统计 |
| 安全 | 无 | 工具白名单 + 参数校验 |
| 评估 | 人工 | 自动化的 case 集 |

## 一个真实场景的拆解

假设要做"内部文档问答 Agent"。它的工作流大致是：

1. 用户问："上周那个支付超时事故，最后怎么定位的？"
2. Agent 拆解：先搜"支付超时"、"事故"、"上周"，再阅读命中的文档
3. 调用 `search_docs(query="支付超时 上周")`，拿到 5 篇候选
4. 调用 `read_doc(doc_id=2)`，读取最相关的一篇
5. 观察发现需要更多上下文，再调用 `search_docs(query="事故定位")`
6. 综合所有 observation，输出最终答案

整个流程是**多步推理 + 多次工具调用**，单次 LLM 调用搞不定。

## 落地建议

如果你正在评估是否要上 Agent：

- **先用单工具闭环**：哪怕只有一个 `search_docs` 工具，能跑通完整链路就有价值
- **强约束工具 schema**：LLM 不可靠，schema 校验是安全网
- **trace 全留**：任何一次失败，都要能回放 Agent 当时想了什么、调了什么、为什么
- **人机协作优先**：Agent 出错时让用户改写、补全，而不是从零开始

Agent 的真正门槛不在 prompt，而在**把 LLM 的不确定性嵌入到一个工程系统里**。它和传统软件一样，需要监控、容灾、可观测。只是"正确"的定义从确定性的输出变成了"看起来合理的输出"。

## 一句话总结

> Agent 不是更聪明的 ChatGPT，而是**带工具的 LLM + 调度循环 + 持久化记忆**的工程系统。

下次再看到"我们做了个 Agent"，可以先问一句：你的规划、工具、记忆是怎么落地的？答得清楚的，至少过了及格线。
