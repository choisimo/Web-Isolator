"""
Workspace management commands for Web Isolator 2.0
"""
import typer
import json
from pathlib import Path
from rich.console import Console
from rich.prompt import Prompt, Confirm
from rich.table import Table
from typing import Optional

# Relative imports
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.database import DatabaseManager
from core.config import ConfigManager 
from core.workspace_manager import WorkspaceManager

app = typer.Typer(help="Workspace management commands")
console = Console()

@app.command()
def export(
    output_file: str = typer.Argument(..., help="출력할 workspace.json 파일 경로"),
    workspace_id: Optional[str] = typer.Option(None, help="특정 workspace ID (기본값: 현재 workspace)"),
    include_secrets: bool = typer.Option(False, "--include-secrets", help="비밀값 포함하여 내보내기"),
):
    """
    현재 워크스페이스를 workspace.json 파일로 내보냅니다.
    
    이 파일은 다른 환경에서 동일한 개발 환경을 재구성하는 데 사용할 수 있습니다.
    """
    try:
        config_manager = ConfigManager()
        workspace_manager = WorkspaceManager(config_manager.db)
        
        console.print(f"[blue]📦 워크스페이스를 '{output_file}'로 내보내는 중...[/blue]")
        
        # 워크스페이스 내보내기
        workspace_manager.export_to_file(
            file_path=output_file,
            workspace_id=workspace_id,
            include_secrets=include_secrets
        )
        
        # 파일 정보 표시
        output_path = Path(output_file)
        file_size = output_path.stat().st_size
        
        console.print(f"[bold green]✅ 워크스페이스 내보내기 완료![/bold green]")
        console.print(f"[dim]📁 파일: {output_path.absolute()}[/dim]")
        console.print(f"[dim]📊 크기: {file_size:,} bytes[/dim]")
        
        if not include_secrets:
            console.print("[yellow]⚠️  비밀값은 플레이스홀더로 대체되었습니다.[/yellow]")
            console.print("[dim]💡 비밀값을 포함하려면 --include-secrets 옵션을 사용하세요.[/dim]")
        
    except Exception as e:
        console.print(f"[bold red]❌ 내보내기 실패: {e}[/bold red]")
        raise typer.Exit(1)

@app.command()
def import_workspace(
    input_file: str = typer.Argument(..., help="가져올 workspace.json 파일 경로"),
    overwrite: bool = typer.Option(False, "--overwrite", help="기존 워크스페이스 덮어쓰기"),
):
    """
    workspace.json 파일에서 워크스페이스를 가져옵니다.
    
    가져오기 과정에서 기존 데이터베이스의 프로젝트와 충돌이 발생할 수 있습니다.
    """
    try:
        # 파일 존재 확인
        input_path = Path(input_file)
        if not input_path.exists():
            console.print(f"[red]파일을 찾을 수 없습니다: {input_file}[/red]")
            raise typer.Exit(1)
        
        config_manager = ConfigManager()
        workspace_manager = WorkspaceManager(config_manager.db)
        
        console.print(f"[blue]📥 '{input_file}'에서 워크스페이스를 가져오는 중...[/blue]")
        
        # 파일 검증
        try:
            workspace_manager.validate_workspace_file(input_file)
            console.print("[green]✅ 파일 검증 완료[/green]")
        except Exception as e:
            console.print(f"[red]❌ 파일 검증 실패: {e}[/red]")
            raise typer.Exit(1)
        
        # 워크스페이스 가져오기
        workspace_id, project_count = workspace_manager.import_from_file(
            file_path=input_file,
            overwrite=overwrite
        )
        
        console.print(f"[bold green]✅ 워크스페이스 가져오기 완료![/bold green]")
        console.print(f"[dim]🆔 Workspace ID: {workspace_id}[/dim]")
        console.print(f"[dim]📊 가져온 프로젝트: {project_count}개[/dim]")
        
        console.print("\\n[bold]다음 단계:[/bold]")
        console.print("1. isolator init list - 가져온 프로젝트 확인")
        console.print("2. isolator up - 프로젝트 실행")
        
    except Exception as e:
        console.print(f"[bold red]❌ 가져오기 실패: {e}[/bold red]")
        raise typer.Exit(1)

@app.command()
def validate(
    input_file: str = typer.Argument(..., help="검증할 workspace.json 파일 경로")
):
    """workspace.json 파일의 유효성을 검증합니다."""
    try:
        input_path = Path(input_file)
        if not input_path.exists():
            console.print(f"[red]파일을 찾을 수 없습니다: {input_file}[/red]")
            raise typer.Exit(1)
        
        config_manager = ConfigManager()
        workspace_manager = WorkspaceManager(config_manager.db)
        
        console.print(f"[blue]🔍 '{input_file}' 파일 검증 중...[/blue]")
        
        workspace_manager.validate_workspace_file(input_file)
        
        # 파일 내용 미리보기
        with open(input_path, 'r', encoding='utf-8') as f:
            workspace_data = json.load(f)
        
        workspace_info = workspace_data['workspace']
        projects = workspace_info.get('projects', [])
        
        console.print(f"[bold green]✅ 파일이 유효합니다![/bold green]")
        console.print(f"[dim]📝 워크스페이스: {workspace_info.get('name', 'Unknown')}[/dim]")
        console.print(f"[dim]📊 프로젝트 수: {len(projects)}[/dim]")
        
        if projects:
            console.print("\\n[bold]프로젝트 목록:[/bold]")
            for project in projects:
                services_count = len(project.get('services', []))
                console.print(f"  • {project['name']} ({project.get('provider', 'docker')}) - {services_count}개 서비스")
        
    except Exception as e:
        console.print(f"[bold red]❌ 검증 실패: {e}[/bold red]")
        raise typer.Exit(1)

@app.command()
def example(
    output_file: str = typer.Argument("example-workspace.json", help="생성할 예제 파일 경로")
):
    """예제 workspace.json 파일을 생성합니다."""
    try:
        config_manager = ConfigManager()
        workspace_manager = WorkspaceManager(config_manager.db)
        
        console.print(f"[blue]📝 예제 워크스페이스를 '{output_file}'에 생성 중...[/blue]")
        
        workspace_manager.create_example_workspace_file(output_file)
        
        output_path = Path(output_file)
        console.print(f"[bold green]✅ 예제 파일이 생성되었습니다![/bold green]")
        console.print(f"[dim]📁 파일: {output_path.absolute()}[/dim]")
        
        console.print("\\n[bold]사용법:[/bold]")
        console.print(f"1. 파일을 편집: {output_file}")
        console.print(f"2. 워크스페이스 가져오기: isolator workspace import {output_file}")
        
    except Exception as e:
        console.print(f"[bold red]❌ 예제 파일 생성 실패: {e}[/bold red]")
        raise typer.Exit(1)

@app.command()
def list():
    """등록된 모든 워크스페이스를 나열합니다."""
    try:
        config_manager = ConfigManager()
        db = config_manager.db
        
        workspaces = db.list_workspaces()
        
        if not workspaces:
            console.print("[yellow]등록된 워크스페이스가 없습니다.[/yellow]")
            console.print("'isolator init create <project-name>'으로 새 프로젝트를 생성하거나")
            console.print("'isolator workspace import <file>'로 워크스페이스를 가져오세요.")
            return
        
        table = Table(title="등록된 워크스페이스")
        table.add_column("이름", style="cyan")
        table.add_column("설명", style="dim")
        table.add_column("프로젝트 수", justify="center")
        table.add_column("생성일", style="dim")
        
        for workspace in workspaces:
            projects = db.list_projects(workspace['id'])
            project_count = len(projects)
            
            table.add_row(
                workspace['name'],
                workspace.get('description', ''),
                str(project_count),
                workspace.get('created_at', 'Unknown')[:10]  # Date only
            )
        
        console.print(table)
        
    except Exception as e:
        console.print(f"[bold red]❌ 워크스페이스 목록 조회 실패: {e}[/bold red]")
        raise typer.Exit(1)

@app.command() 
def info(
    workspace_name: Optional[str] = typer.Argument(None, help="워크스페이스 이름 (기본값: 현재 워크스페이스)")
):
    """특정 워크스페이스의 상세 정보를 표시합니다."""
    try:
        config_manager = ConfigManager()
        db = config_manager.db
        
        if workspace_name:
            # 이름으로 워크스페이스 찾기
            workspaces = db.list_workspaces()
            workspace = next((w for w in workspaces if w['name'] == workspace_name), None)
            if not workspace:
                console.print(f"[red]워크스페이스 '{workspace_name}'을 찾을 수 없습니다.[/red]")
                raise typer.Exit(1)
        else:
            # 현재 워크스페이스 사용
            workspace = db.get_current_workspace()
            if not workspace:
                console.print("[red]워크스페이스가 없습니다.[/red]")
                raise typer.Exit(1)
        
        # 워크스페이스 정보 표시
        console.print(f"[bold]워크스페이스: {workspace['name']}[/bold]")
        console.print(f"ID: {workspace['id']}")
        console.print(f"설명: {workspace.get('description', '설명 없음')}")
        console.print(f"생성일: {workspace.get('created_at', 'Unknown')}")
        console.print(f"수정일: {workspace.get('updated_at', 'Unknown')}")
        
        # 프로젝트 목록
        projects = db.list_projects(workspace['id'])
        console.print(f"\\n[bold]프로젝트 ({len(projects)}개):[/bold]")
        
        if not projects:
            console.print("[dim]  등록된 프로젝트가 없습니다.[/dim]")
        else:
            for project in projects:
                status_icon = "🟢" if project['status'] == 'running' else "⚪"
                console.print(f"  {status_icon} {project['name']} ({project['provider']})")
                console.print(f"    경로: {project['path']}")
                
                # 서비스 수 표시
                services = db.list_services(project['id'])
                console.print(f"    서비스: {len(services)}개")
        
    except Exception as e:
        console.print(f"[bold red]❌ 워크스페이스 정보 조회 실패: {e}[/bold red]")
        raise typer.Exit(1)

if __name__ == "__main__":
    app()