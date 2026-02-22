# Agent Directives
1. ALWAYS use `pnpm`. Never use `npm` or `yarn`.
2. Use the `project_master_mcp.py` tools to orchestrate terminal commands.
3. Update `.memory-bank/progress.md` after completing major steps.

## The "Always-Update" Rule
After EVERY successful execution, feature addition, or bug fix, you MUST autonomously document your work. 
1. Use your `update_memory` MCP tool to update `.memory-bank/activeContext.md` with what you just did.
2. Use your `update_memory` MCP tool to update `.memory-bank/progress.md` with the current completion status.
*Do not wait for the user to tell you to do this. It must be the final step of your loop.*