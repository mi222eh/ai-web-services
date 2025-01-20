import os
import shutil
from pathlib import Path
import subprocess

def run_command(command, cwd=None):
    """Run a command and print its output"""
    print(f"Running: {command}")
    result = subprocess.run(command, shell=True, cwd=cwd, text=True, capture_output=True)
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(result.stderr)
    if result.returncode != 0:
        raise Exception(f"Command failed with exit code {result.returncode}")

def main():
    # Get the root directory (where this script is)
    root_dir = Path(__file__).parent
    frontend_dir = root_dir / "frontend"
    backend_dir = root_dir / "backend"
    static_dir = backend_dir / "static"

    # Ensure we're in the right directory
    os.chdir(root_dir)

    # Clean the static directory
    print("Cleaning static directory...")
    if static_dir.exists():
        shutil.rmtree(static_dir)
    static_dir.mkdir(exist_ok=True)

    # Build the frontend
    print("\nBuilding frontend...")
    run_command("pnpm install", cwd=frontend_dir)
    run_command("pnpm build", cwd=frontend_dir)

    # Copy the built files to the static directory
    print("\nCopying built files to static directory...")
    dist_dir = frontend_dir / "dist"
    if not dist_dir.exists():
        raise Exception("Frontend build failed - dist directory not found")
    
    # Copy all files from dist to static
    for item in dist_dir.glob("*"):
        if item.is_dir():
            shutil.copytree(item, static_dir / item.name)
        else:
            shutil.copy2(item, static_dir / item.name)

    print("\nBuild complete! You can now run the backend server.")

if __name__ == "__main__":
    main() 