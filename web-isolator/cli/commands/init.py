"""
프로젝트 초기화 명령어
"""

import typer
from pathlib import Path
from rich.console import Console
from rich.prompt import Prompt, Confirm
from typing import Optional

from ..utils.template_manager import TemplateManager
from ..utils.validators import validate_project_name
from ..utils.exceptions import IsolatorError

app = typer.Typer()
console = Console()

@app.command()
def create(
    project_name: str = typer.Argument(..., help="프로젝트 이름"),
    template: str = typer.Option("fullstack", help="템플릿 타입 (react, fastapi, fullstack)"),
    directory: Optional[Path] = typer.Option(None, help="생성할 디렉터리"),
    force: bool = typer.Option(False, "--force", "-f", help="기존 디렉터리 덮어쓰기"),
):
    """
    새 프로젝트를 생성합니다.
    
    지원하는 템플릿:
    - react: Next.js 14 App Router 프로젝트
    - fastapi: FastAPI 백엔드 프로젝트  
    - fullstack: React + FastAPI 풀스택 프로젝트
    """
    try:
        # 프로젝트 이름 검증
        validate_project_name(project_name)
        
        # 템플릿 관리자 초기화
        template_manager = TemplateManager()
        
        # 프로젝트 디렉터리 결정
        if directory is None:
            directory = Path.cwd() / project_name
        
        # 기존 디렉터리 확인
        if directory.exists() and not force:
            if not Confirm.ask(f"디렉터리 '{directory}'가 이미 존재합니다. 계속하시겠습니까?"):
                raise typer.Abort()
        
        # 프로젝트 생성
        console.print(f"[bold blue]🚀 프로젝트 '{project_name}' 생성 중...[/bold blue]")
        
        created_files = template_manager.create_project(
            project_name=project_name,
            template_type=template,
            target_directory=directory,
            overwrite=force
        )
        
        # 성공 메시지
        console.print(f"[bold green]✅ 프로젝트가 성공적으로 생성되었습니다![/bold green]")
        console.print(f"[dim]📁 위치: {directory}[/dim]")
        console.print(f"[dim]📄 생성된 파일: {len(created_files)}개[/dim]")
        
        # 다음 단계 안내
        console.print("\n[bold]다음 단계:[/bold]")
        console.print(f"1. cd {directory}")
        console.print("2. isolator up")
        console.print(f"3. 브라우저에서 http://{project_name}.local 접속")
        
    except IsolatorError as e:
        console.print(f"[bold red]❌ 오류: {e}[/bold red]")
        raise typer.Exit(1)
    except Exception as e:
        console.print(f"[bold red]❌ 예상하지 못한 오류: {e}[/bold red]")
        raise typer.Exit(1)

@app.command()
def list_templates():
    """사용 가능한 템플릿 목록을 표시합니다."""
    template_manager = TemplateManager()
    templates = template_manager.list_templates()
    
    console.print("[bold]사용 가능한 템플릿:[/bold]")
    for template in templates:
        console.print(f"  • {template['name']}: {template['description']}")

if __name__ == "__main__":
    app()