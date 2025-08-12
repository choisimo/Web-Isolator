"""
네트워크 관리 명령어
"""

import typer
from rich.console import Console
from rich.table import Table
from typing import Optional

from ..utils.network_manager import NetworkManager
from ..utils.exceptions import IsolatorError

app = typer.Typer()
console = Console()

@app.command()
def create(
    name: str = typer.Option("local_dev_network", help="네트워크 이름"),
    driver: str = typer.Option("bridge", help="네트워크 드라이버"),
):
    """개발용 Docker 네트워크를 생성합니다."""
    try:
        network_manager = NetworkManager()
        
        if network_manager.network_exists(name):
            console.print(f"[yellow]네트워크 '{name}'가 이미 존재합니다.[/yellow]")
            return
        
        console.print(f"[blue]네트워크 '{name}' 생성 중...[/blue]")
        network_id = network_manager.create_network(name, driver)
        console.print(f"[green]✅ 네트워크가 생성되었습니다. ID: {network_id[:12]}[/green]")
        
    except IsolatorError as e:
        console.print(f"[bold red]❌ 오류: {e}[/bold red]")
        raise typer.Exit(1)

@app.command()
def remove(
    name: str = typer.Option("local_dev_network", help="네트워크 이름"),
    force: bool = typer.Option(False, "--force", "-f", help="강제 삭제"),
):
    """개발용 Docker 네트워크를 삭제합니다."""
    try:
        network_manager = NetworkManager()
        
        if not network_manager.network_exists(name):
            console.print(f"[yellow]네트워크 '{name}'가 존재하지 않습니다.[/yellow]")
            return
        
        # 네트워크 사용 중인 컨테이너 확인
        containers = network_manager.get_network_containers(name)
        if containers and not force:
            console.print(f"[red]네트워크를 사용 중인 컨테이너가 있습니다:[/red]")
            for container in containers:
                console.print(f"  • {container}")
            console.print("[dim]'--force' 옵션으로 강제 삭제할 수 있습니다.[/dim]")
            raise typer.Exit(1)
        
        console.print(f"[blue]네트워크 '{name}' 삭제 중...[/blue]")
        network_manager.remove_network(name, force)
        console.print(f"[green]✅ 네트워크가 삭제되었습니다.[/green]")
        
    except IsolatorError as e:
        console.print(f"[bold red]❌ 오류: {e}[/bold red]")
        raise typer.Exit(1)

@app.command()
def list():
    """Docker 네트워크 목록을 표시합니다."""
    try:
        network_manager = NetworkManager()
        networks = network_manager.list_networks()
        
        if not networks:
            console.print("[yellow]생성된 네트워크가 없습니다.[/yellow]")
            return
        
        table = Table(title="Docker Networks")
        table.add_column("이름", style="cyan")
        table.add_column("드라이버", style="magenta")
        table.add_column("범위", style="green")
        table.add_column("컨테이너 수", style="yellow")
        
        for network in networks:
            container_count = len(network_manager.get_network_containers(network['Name']))
            table.add_row(
                network['Name'],
                network['Driver'],
                network['Scope'],
                str(container_count)
            )
        
        console.print(table)
        
    except Exception as e:
        console.print(f"[bold red]❌ 네트워크 목록 조회 실패: {e}[/bold red]")
        raise typer.Exit(1)

@app.command()
def status(
    name: str = typer.Option("local_dev_network", help="네트워크 이름"),
):
    """특정 네트워크의 상태를 확인합니다."""
    try:
        network_manager = NetworkManager()
        
        if not network_manager.network_exists(name):
            console.print(f"[red]네트워크 '{name}'가 존재하지 않습니다.[/red]")
            raise typer.Exit(1)
        
        network_info = network_manager.get_network_info(name)
        containers = network_manager.get_network_containers(name)
        
        console.print(f"[bold]네트워크 정보: {name}[/bold]")
        console.print(f"  ID: {network_info['Id'][:16]}")
        console.print(f"  드라이버: {network_info['Driver']}")
        console.print(f"  범위: {network_info['Scope']}")
        console.print(f"  생성일: {network_info['Created']}")
        
        if containers:
            console.print(f"\n[bold]연결된 컨테이너 ({len(containers)}개):[/bold]")
            for container in containers:
                console.print(f"  • {container}")
        else:
            console.print("\n[dim]연결된 컨테이너가 없습니다.[/dim]")
        
    except IsolatorError as e:
        console.print(f"[bold red]❌ 오류: {e}[/bold red]")
        raise typer.Exit(1)

if __name__ == "__main__":
    app()