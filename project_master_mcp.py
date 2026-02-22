import os
import subprocess
import requests
import signal
from fastmcp import FastMCP
from dotenv import load_dotenv

load_dotenv()
mcp = FastMCP("ProjectMaster")
processes = {}

@mcp.tool()
def update_memory(file_name: str, content: str, mode: str = "write"):
    """Updates the LLM Memory Bank (.memory-bank/activeContext.md, etc.)"""
    base_path = "./.memory-bank/"
    if not os.path.exists(base_path): os.makedirs(base_path)
    with open(os.path.join(base_path, file_name), "w" if mode == "write" else "a") as f:
        f.write(content)
    return f"Updated {file_name}"

@mcp.tool()
def run_shell(command: str, cwd: str = ".") -> dict:
    """Runs a shell command. Use pnpm workspace flags (e.g., pnpm --filter web dev)."""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, cwd=cwd, timeout=60)
        return {"stdout": result.stdout, "stderr": result.stderr, "exit_code": result.returncode}
    except Exception as e:
        return {"error": str(e)}

@mcp.tool()
def manage_db_schema(action: str, migration_name: str = "update"):
    """Manages Prisma. action: 'migrate' (apply), 'generate' (update TS types)."""
    cmd = f"pnpm prisma migrate dev --name {migration_name}" if action == "migrate" else "pnpm prisma generate"
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd="./packages/database")
    return {"stdout": result.stdout, "stderr": result.stderr}

if __name__ == "__main__":
    mcp.run()