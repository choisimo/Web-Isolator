"""
프로젝트 초기화 명령어 - DB 기반 버전 2.0
"""

import typer
import os
import json
from pathlib import Path
from rich.console import Console
from rich.prompt import Prompt, Confirm
from typing import Optional

# Relative imports for core functionality
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.database import DatabaseManager
from core.config import ConfigManager

app = typer.Typer()
console = Console()

@app.command()
def create(
    project_name: str = typer.Argument(..., help="프로젝트 이름"),
    template: str = typer.Option("fullstack", help="템플릿 타입 (react, fastapi, fullstack)"),
    directory: Optional[Path] = typer.Option(None, help="생성할 디렉터리"),
    provider: str = typer.Option("docker", help="실행 환경 (docker, vm)"),
    force: bool = typer.Option(False, "--force", "-f", help="기존 설정 덮어쓰기"),
):
    """
    새 프로젝트를 생성하고 데이터베이스에 등록합니다.
    
    Web Isolator 2.0에서는 모든 설정이 중앙 데이터베이스에 저장됩니다.
    """
    try:
        # 설정 관리자 초기화
        config_manager = ConfigManager()
        db = config_manager.db
        
        # 프로젝트 디렉터리 결정
        if directory is None:
            directory = Path.cwd() / project_name
        directory = Path(directory).resolve()
        
        # 기존 프로젝트 확인
        existing_project = db.get_project_by_name(project_name)
        if existing_project and not force:
            console.print(f"[yellow]⚠️  프로젝트 '{project_name}'이 이미 데이터베이스에 등록되어 있습니다.[/yellow]")
            if not Confirm.ask("덮어쓰시겠습니까?"):
                raise typer.Abort()
            db.delete_project(existing_project['id'])
        
        # 기존 디렉터리 확인
        if directory.exists() and not force:
            if not Confirm.ask(f"디렉터리 '{directory}'가 이미 존재합니다. 계속하시겠습니까?"):
                raise typer.Abort()
        
        console.print(f"[bold blue]🚀 Web Isolator 2.0 프로젝트 '{project_name}' 생성 중...[/bold blue]")
        
        # 워크스페이스 생성 또는 가져오기
        workspace_id = config_manager.get_or_create_default_workspace()
        
        # 프로젝트 생성
        project_id = db.create_project(
            workspace_id=workspace_id,
            name=project_name,
            path=str(directory),
            provider=provider
        )
        
        # 디렉터리 생성
        directory.mkdir(parents=True, exist_ok=True)
        
        # 템플릿에 따른 서비스 생성
        if template in ["react", "fullstack"]:
            # Frontend 서비스 생성
            frontend_service_id = db.create_service(
                project_id=project_id,
                name="frontend",
                service_type="react",
                port=3000,
                image="node:18-alpine"
            )
            
            # Frontend 환경변수 설정
            db.set_environment_variable(frontend_service_id, "NODE_ENV", "development")
            db.set_environment_variable(frontend_service_id, "REACT_APP_API_URL", f"http://api.{project_name}.local")
        
        if template in ["fastapi", "fullstack"]:
            # Backend 서비스 생성
            backend_service_id = db.create_service(
                project_id=project_id,
                name="backend",
                service_type="fastapi",
                port=8000,
                image="python:3.11-slim"
            )
            
            # Backend 환경변수 설정 
            db.set_environment_variable(backend_service_id, "ENVIRONMENT", "development")
            db.set_environment_variable(backend_service_id, "SECRET_KEY", "dev-secret-key", is_secret=True)
        
        # 네트워크 생성
        db.create_network(project_id, f"{project_name}-network")
        
        # 프로젝트 메타데이터 생성 (workspace.json 호환)
        project_metadata = {
            "version": "2.0",
            "project": {
                "name": project_name,
                "template": template,
                "provider": provider,
                "created_with": "isolator init",
                "path": str(directory)
            }
        }
        
        # 로컬 메타데이터 파일 생성 (선택적)
        metadata_file = directory / ".isolator.json"
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(project_metadata, f, indent=2, ensure_ascii=False)
        
        # 성공 메시지
        console.print(f"[bold green]✅ 프로젝트가 성공적으로 생성되었습니다![/bold green]")
        console.print(f"[dim]📁 위치: {directory}[/dim]")
        console.print(f"[dim]🗄️  데이터베이스 ID: {project_id}[/dim]")
        console.print(f"[dim]⚙️  Provider: {provider}[/dim]")
        
        # 다음 단계 안내
        console.print("\\n[bold]다음 단계:[/bold]")
        console.print(f"1. cd {directory}")
        console.print("2. isolator up")
        if template in ["react", "fullstack"]:
            console.print(f"3. 브라우저에서 http://{project_name}.local 접속")
        if template in ["fastapi", "fullstack"]:
            console.print(f"4. API: http://api.{project_name}.local")
        
        console.print("\\n[dim]💡 Web UI에서 환경변수를 편집하려면 'isolator dashboard'를 실행하세요.[/dim]")
        
    except Exception as e:
        console.print(f"[bold red]❌ 프로젝트 생성 실패: {e}[/bold red]")
        raise typer.Exit(1)

@app.command()
def list():
    """데이터베이스에 등록된 모든 프로젝트를 나열합니다."""
    try:
        config_manager = ConfigManager()
        db = config_manager.db
        
        projects = db.list_projects()
        
        if not projects:
            console.print("[yellow]등록된 프로젝트가 없습니다.[/yellow]")
            console.print("'isolator init <project-name>'으로 새 프로젝트를 생성하세요.")
            return
        
        console.print("[bold]등록된 프로젝트:[/bold]")
        for project in projects:
            status_icon = "🟢" if project['status'] == 'running' else "⚪"
            console.print(f"  {status_icon} {project['name']} ({project['provider']}) - {project['path']}")
        
    except Exception as e:
        console.print(f"[bold red]❌ 프로젝트 목록 조회 실패: {e}[/bold red]")
        raise typer.Exit(1)

@app.command()
def info(
    project_name: str = typer.Argument(..., help="프로젝트 이름")
):
    """특정 프로젝트의 상세 정보를 표시합니다."""
    try:
        config_manager = ConfigManager()
        db = config_manager.db
        
        project = db.get_project_by_name(project_name)
        if not project:
            console.print(f"[red]프로젝트 '{project_name}'을 찾을 수 없습니다.[/red]")
            raise typer.Exit(1)
        
        # 프로젝트 전체 데이터 가져오기
        full_project = db.get_project_full_data(project['id'])
        
        console.print(f"[bold]프로젝트: {project['name']}[/bold]")
        console.print(f"ID: {project['id']}")
        console.print(f"경로: {project['path']}")
        console.print(f"Provider: {project['provider']}")
        console.print(f"상태: {project['status']}")
        
        if full_project['services']:
            console.print("\\n[bold]서비스:[/bold]")
            for service in full_project['services']:
                console.print(f"  • {service['name']} ({service['type']}) - Port: {service['port']}")
                
                if service['environment']:
                    console.print("    환경변수:")
                    for key, value in service['environment'].items():
                        display_value = "***HIDDEN***" if "SECRET" in key or "PASSWORD" in key else value
                        console.print(f"      {key}={display_value}")
        
        if full_project['networks']:
            console.print("\\n[bold]네트워크:[/bold]")
            for network in full_project['networks']:
                console.print(f"  • {network['name']} ({network['driver']})")
        
    except Exception as e:
        console.print(f"[bold red]❌ 프로젝트 정보 조회 실패: {e}[/bold red]")
        raise typer.Exit(1)

if __name__ == "__main__":
    app()