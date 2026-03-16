import os
import sys
from pathlib import Path

# Define the paths
base_dir = Path(r"D:\College\Project\Final Year Project\pearl\apps\api\src\modules")
dirs_to_create = [
    base_dir / "jobs",
    base_dir / "students"
]

# Create directories
for dir_path in dirs_to_create:
    dir_path.mkdir(parents=True, exist_ok=True)
    print(f"Created: {dir_path}")

# List contents of modules directory
print("\nContents of modules directory:")
if base_dir.exists():
    for item in sorted(base_dir.iterdir()):
        item_type = "[DIR]" if item.is_dir() else "[FILE]"
        print(f"{item_type}  {item.name}")
else:
    print(f"Error: {base_dir} does not exist")
