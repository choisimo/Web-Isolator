"""
서비스 시작 명령어
"""

import typer
from pathlib import Path
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
from typing import Optional, List

from ..utils.docker_manager import DockerManager
from ..utils.network_manager import NetworkManager
from ..utils.nginx_manager import NginxManager
from ..utils.exceptions import IsolatorError

app = typer.Typer()
console = Console()

@app.command()
def start(
    project: Optional[str] = typer.Option(None, help="특정 프로젝트만 시작"),
    build: bool = typer.Option(False, "--build", help="이미지 강제 재빌드"),
    detached: bool = typer.Option(True, "--detach/--no-detach", help="백그라운드 실행"),
):
    """
    모든 서비스를 시작합니다.
    
    다음 단계로 진행됩니다:
    1. Docker 네트워크 확인/생성
    2. Nginx 프록시 시작
    3. 프로젝트 서비스 시작
    4. 도메인 설정 업데이트
    """
    try:
        docker_manager = DockerManager()
        network_manager = NetworkManager()
        nginx_manager = NginxManager()
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            
            # 1. Docker 네트워크 설정
            task1 = progress.add_task("Docker 네트워크 확인 중...", total=None)
            network_manager.ensure_network_exists()
            progress.update(task1, description="✅ Docker 네트워크 준비 완료")
            
            # 2. 프로젝트 검색
            task2 = progress.add_task("프로젝트 검색 중...", total=None)
            projects = docker_manager.discover_projects(project)
            progress.update(task2, description=f"✅ {len(projects)}개 프로젝트 발견")
            
            if not projects:
                console.print("[yellow]⚠️  실행할 프로젝트가 없습니다.[/yellow]")
                console.print("'isolator init <project-name>'으로 새 프로젝트를 생성하세요.")
                return
            
            # 3. Nginx 프록시 시작
            task3 = progress.add_task("Nginx 프록시 시작 중...", total=None)
            nginx_manager.start_proxy()
            progress.update(task3, description="✅ Nginx 프록시 시작 완료")
            
            # 4. 프로젝트별 서비스 시작
            for proj in projects:
                task = progress.add_task(f"{proj.name} 서비스 시작 중...", total=None)
                docker_manager.start_project(proj, build=build, detached=detached)
                nginx_manager.update_proxy_config(proj)
                progress.update(task, description=f"✅ {proj.name} 시작 완료")
            
            # 5. 도메인 설정
            task5 = progress.add_task("도메인 설정 업데이트 중...", total=None)
            nginx_manager.update_hosts_file(projects)
            progress.update(task5, description="✅ 도메인 설정 완료")
        
        # 성공 메시지
        console.print("\n[bold green]🎉 모든 서비스가 시작되었습니다![/bold green]")
        console.print("\n[bold]접속 주소:[/bold]")
        for proj in projects:
            if proj.has_frontend:
                console.print(f"  🌐 {proj.name}: http://{proj.name}.local")
            if proj.has_backend:
                console.print(f"  🔌 {proj.name} API: http://api.{proj.name}.local")
        
        console.print(f"\n[dim]💡 서비스를 중지하려면 'isolator stop'을 실행하세요.[/dim]")
        
    except IsolatorError as e:
        console.print(f"[bold red]❌ 오류: {e}[/bold red]")
        raise typer.Exit(1)
    except Exception as e:
        console.print(f"[bold red]❌ 예상하지 못한 오류: {e}[/bold red]")
        raise typer.Exit(1)

@app.command()
def status():
    """실행 중인 서비스 상태를 확인합니다."""
    try:
        docker_manager = DockerManager()
        running_services = docker_manager.get_running_services()
        
        if not running_services:
            console.print("[yellow]실행 중인 서비스가 없습니다.[/yellow]")
            return
        
        console.print("[bold]실행 중인 서비스:[/bold]")
        for service in running_services:
            status_icon = "🟢" if service.healthy else "🟡"
            console.print(f"  {status_icon} {service.name} ({service.status})")
        
    except Exception as e:
        console.print(f"[bold red]❌ 상태 확인 실패: {e}[/bold red]")
        raise typer.Exit(1)

if __name__ == "__main__":
    app()