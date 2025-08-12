"""
Web Isolator CLI Tool

로컬 개발 환경 격리를 위한 Docker 기반 개발 플랫폼
"""

import typer
from rich.console import Console
from rich.panel import Panel
from typing import Optional

from .commands import init, up, stop, network
from .utils.config import settings
from .utils.logger import setup_logger

app = typer.Typer(
    name="isolator",
    help="Web Isolator - 로컬 개발 환경 격리 도구",
    add_completion=False,
)

console = Console()
logger = setup_logger()

app.add_typer(init.app, name="init", help="새 프로젝트 생성")
app.add_typer(up.app, name="up", help="모든 서비스 시작")
app.add_typer(stop.app, name="stop", help="모든 서비스 중지")
app.add_typer(network.app, name="network", help="네트워크 관리")

@app.command()
def version():
    """버전 정보 출력"""
    console.print(Panel(
        "[bold blue]Web Isolator v1.0.0[/bold blue]\n"
        "[dim]로컬 개발 환경 격리 도구[/dim]",
        title="🚀 Web Isolator"
    ))

@app.callback()
def main(
    verbose: bool = typer.Option(
        False, "--verbose", "-v", help="상세 출력 모드"
    ),
    quiet: bool = typer.Option(
        False, "--quiet", "-q", help="조용한 모드"
    ),
):
    """
    Web Isolator - 로컬 개발 환경 격리 도구
    
    여러 React + Python 프로젝트를 포트 충돌 없이 동시에 실행할 수 있습니다.
    """
    if verbose:
        settings.log_level = "DEBUG"
    elif quiet:
        settings.log_level = "ERROR"
    
    setup_logger(settings.log_level)

if __name__ == "__main__":
    app()