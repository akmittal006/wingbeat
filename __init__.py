"""Hermes plugin entrypoint for Wingbeat."""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path


PLUGIN_DIR = Path(__file__).resolve().parent


def _node_executable() -> str:
    node = shutil.which("node")
    if not node:
        raise RuntimeError("Wingbeat requires Node.js 20.19+ or 22.12+ on PATH.")
    return node


def _run_wingbeat(args) -> None:
    project = Path(args.project or os.getcwd()).expanduser().resolve()
    if not project.exists() or not project.is_dir():
        print(f"Error: project path does not exist or is not a directory: {project}", file=sys.stderr)
        raise SystemExit(2)

    script = PLUGIN_DIR / "scripts" / "run-agency.mjs"
    if not script.exists():
        print(f"Error: Wingbeat runtime script is missing: {script}", file=sys.stderr)
        raise SystemExit(2)
    if not os.environ.get("CONVEX_URL"):
        print(
            "Error: CONVEX_URL is required. Start or configure Convex, export "
            "CONVEX_URL, then retry. Wingbeat does not write local JSON fallback files.",
            file=sys.stderr,
        )
        raise SystemExit(2)

    if not args.no_hermes:
        print(
            "Privacy warning: this run may send repository-derived context to the "
            "model provider configured in Hermes. Re-run with --no-hermes for the "
            "deterministic local fallback.",
            file=sys.stderr,
        )

    command = [
        _node_executable(),
        str(script),
        "--project",
        str(project),
        "--trigger",
        args.trigger,
        "--objective",
        args.objective,
    ]
    if args.no_hermes:
        command.append("--no-hermes")

    completed = subprocess.run(command, cwd=str(project))
    raise SystemExit(completed.returncode)


def _wingbeat_cli(args) -> None:
    command = getattr(args, "wingbeat_command", None)
    if command == "run":
        _run_wingbeat(args)
        return

    print("Usage: hermes wingbeat run [--project PATH] [--no-hermes]")
    raise SystemExit(2)


def _setup_cli(subparser) -> None:
    subcommands = subparser.add_subparsers(dest="wingbeat_command")
    run = subcommands.add_parser(
        "run",
        help="Create a source-backed Wingbeat agency run for a project",
    )
    run.add_argument(
        "--project",
        default=".",
        help="Project directory to inspect. Defaults to the current directory.",
    )
    run.add_argument(
        "--objective",
        default="Create one source-backed build-in-public story for this project. Do not publish.",
        help="Agency objective for this run.",
    )
    run.add_argument(
        "--trigger",
        default="hermes-plugin",
        help="Trigger label stored in the run trace.",
    )
    run.add_argument(
        "--no-hermes",
        action="store_true",
        help="Use the deterministic local fallback instead of calling Hermes/model providers.",
    )
    run.set_defaults(func=_wingbeat_cli)


def _slash_help(raw_args: str) -> str:
    project = raw_args.strip() or "."
    return (
        "Wingbeat is installed as a Hermes plugin.\n\n"
        "Verified local fallback command:\n"
        f"hermes wingbeat run --project {project} --no-hermes\n\n"
        "Provider-backed command, if you are comfortable sending repository-derived "
        "context to the provider configured in Hermes:\n"
        f"hermes wingbeat run --project {project}\n\n"
        "Set CONVEX_URL before running. Wingbeat writes the project, run, events, "
        "content package, memory records, and execution job to Convex only; it "
        "does not publish."
    )


def register(ctx) -> None:
    skill_md = PLUGIN_DIR / "skills" / "agency" / "SKILL.md"
    if skill_md.exists():
        ctx.register_skill(
            "agency",
            skill_md,
            "Run Wingbeat against the current project and keep generated marketing source-backed.",
        )

    ctx.register_command(
        "wingbeat",
        handler=_slash_help,
        description="Show Wingbeat run commands for the current project.",
        args_hint="[project-path]",
    )
    ctx.register_cli_command(
        name="wingbeat",
        help="Run Wingbeat source-backed agency jobs",
        setup_fn=_setup_cli,
        handler_fn=_wingbeat_cli,
        description="Create deterministic or Hermes-backed Wingbeat agency runs for software projects.",
    )
