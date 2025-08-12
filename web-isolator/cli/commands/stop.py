"""
서비스 중지 명령어
"""

import typer
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.prompt import Confirm
from typing import Optional

from ..utils.docker_manager import DockerManager
from ..utils.network_manager import NetworkManager
from ..utils.nginx_manager import NginxManager
from ..utils.exceptions import IsolatorError

app = typer.Typer()
console = Console()

@app.command()
def all(
    cleanup: bool = typer.Option(False, "--cleanup", help="볼륨과 네트워크도 함께 정리"),
    force: bool = typer.Option(False, "--force", "-f", help="확인 없이 강제 중지"),
):
    """
    모든 서비스를 중지합니다.
    
    다음 단계로 진행됩니다:
    1. 실행 중인 프로젝트 서비스 중지
    2. Nginx 프록시 중지
    3. 선택적으로 네트워크 및 볼륨 정리
    """
    try:
        docker_manager = DockerManager()
        network_manager = NetworkManager()
        nginx_manager = NginxManager()
        
        # 실행 중인 서비스 확인
        running_services = docker_manager.get_running_services()
        
        if not running_services:
            console.print("[yellow]중지할 서비스가 없습니다.[/yellow]")
            return
        
        # 확인 프롬프트
        if not force:
            console.print(f"[bold]중지할 서비스 ({len(running_services)}개):[/bold]")
            for service in running_services:
                console.print(f"  • {service.name}")
            
            if not Confirm.ask("모든 서비스를 중지하시겠습니까?"):
                console.print("중지가 취소되었습니다.")
                return
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            
            # 1. 프로젝트 서비스 중지
            for service in running_services:
                if service.name != "nginx-proxy":
                    task = progress.add_task(f"{service.name} 중지 중...", total=None)
                    docker_manager.stop_service(service)
                    progress.update(task, description=f"✅ {service.name} 중지 완료")
            
            # 2. Nginx 프록시 중지
            task2 = progress.add_task("Nginx 프록시 중지 중...", total=None)
            nginx_manager.stop_proxy()
            progress.update(task2, description="✅ Nginx 프록시 중지 완료")
            
            # 3. 선택적 정리
            if cleanup:
                task3 = progress.add_task("리소스 정리 중...", total=None)
                docker_manager.cleanup_volumes()
                network_manager.cleanup_network()
                progress.update(task3, description="✅ 리소스 정리 완료")
        
        console.print("\n[bold green]✅ 모든 서비스가 중지되었습니다.[/bold green]")
        
        if cleanup:
            console.print("[dim]🧹 볼륨과 네트워크도 정리되었습니다.[/dim]")
        else:
            console.print("[dim]💡 볼륨과 네트워크를 정리하려면 '--cleanup' 옵션을 사용하세요.[/dim]")
        
    except IsolatorError as e:
        console.print(f"[bold red]❌ 오류: {e}[/bold red]")
        raise typer.Exit(1)
    except Exception as e:
        console.print(f"[bold red]❌ 예상하지 못한 오류: {e}[/bold red]")
        raise typer.Exit(1)

@app.command()
def project(
    project_name: str = typer.Argument(..., help="중지할 프로젝트 이름"),
    force: bool = typer.Option(False, "--force", "-f", help="확인 없이 강제 중지"),
):
    """특정 프로젝트만 중지합니다."""
    try:
        docker_manager = DockerManager()
        nginx_manager = NginxManager()
        
        project = docker_manager.get_project(project_name)
        if not project:
            console.print(f"[red]프로젝트 '{project_name}'를 찾을 수 없습니다.[/red]")
            raise typer.Exit(1)
        
        if not project.is_running:
            console.print(f"[yellow]프로젝트 '{project_name}'가 실행 중이 아닙니다.[/yellow]")
            return
        
        if not force and not Confirm.ask(f"프로젝트 '{project_name}'를 중지하시겠습니까?"):
            console.print("중지가 취소되었습니다.")
            return
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            
            task = progress.add_task(f"{project_name} 중지 중...", total=None)
            docker_manager.stop_project(project)
            nginx_manager.remove_proxy_config(project)
            progress.update(task, description=f"✅ {project_name} 중지 완료")
        
        console.print(f"[bold green]✅ 프로젝트 '{project_name}'가 중지되었습니다.[/bold green]")
        
    except IsolatorError as e:
        console.print(f"[bold red]❌ 오류: {e}[/bold red]")
        raise typer.Exit(1)
    except Exception as e:
        console.print(f"[bold red]❌ 예상하지 못한 오류: {e}[/bold red]")
        raise typer.Exit(1)

if __name__ == "__main__":
    app()