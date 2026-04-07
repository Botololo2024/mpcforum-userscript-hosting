from __future__ import annotations

import argparse
import json
import os
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, cast
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

API_BASE_URL = 'https://api.github.com'
USER_AGENT = 'mpcforum-userscript-gist-publisher/1.0'
DEFAULT_TOKEN_ENV_NAMES = ('GITHUB_TOKEN', 'GH_TOKEN')


@dataclass(frozen=True)
class ModuleSpec:
    order: int
    file: str
    startLine: int
    endLine: int | None
    label: str


@dataclass(frozen=True)
class HostedTarget:
    index: int
    source_path: Path
    source_label: str
    gist_id: str
    file_name: str
    original_url: str


@dataclass
class GistUpdateResult:
    gist_id: str
    updated_urls_by_file: dict[str, str]
    html_url: str


def read_text(path: Path) -> str:
    return path.read_text(encoding='utf-8-sig')


def write_text(path: Path, content: str) -> None:
    path.write_text(content, encoding='utf-8')


def read_token_file(path: Path) -> str:
    if not path.exists() or not path.is_file():
        return ''
    return read_text(path).strip()


def load_module_map(path: Path) -> list[ModuleSpec]:
    raw = json.loads(read_text(path))
    return sorted((ModuleSpec(**item) for item in raw), key=lambda item: item.order)


def normalize_gist_raw_url(url: str) -> str:
    trimmed = str(url or '').strip()
    if trimmed.startswith('https://gist.github.com/') and '/raw/' in trimmed:
        parts = trimmed.split('/')
        if len(parts) >= 7:
            owner = parts[3]
            gist_id = parts[4]
            suffix = '/'.join(parts[6:])
            return f'https://gist.githubusercontent.com/{owner}/{gist_id}/raw/{suffix}'
    return trimmed


def parse_gist_target(url: str) -> tuple[str, str]:
    normalized = normalize_gist_raw_url(url)
    parsed = urlparse(normalized)
    if parsed.netloc != 'gist.githubusercontent.com':
        raise ValueError(f'Unsupported host for gist publishing: {url}')

    segments = [segment for segment in parsed.path.split('/') if segment]
    if len(segments) < 4 or segments[2] != 'raw':
        raise ValueError(f'Unsupported gist raw URL format: {url}')

    gist_id = segments[1]
    if len(segments) >= 5:
        file_name = segments[-1]
    else:
        file_name = segments[3]
    return gist_id, file_name


def build_source_file_list(project_root: Path, module_specs: list[ModuleSpec], hosted_count: int) -> list[tuple[Path, str]]:
    src_root = project_root / 'src'
    files: list[tuple[Path, str]] = [
        (src_root / 'wrapper-start.js', 'wrapper-start.js'),
    ]
    for spec in module_specs:
        files.append((src_root / 'modules' / spec.file, spec.file))

    expected_without_wrapper_end = len(module_specs) + 1
    expected_with_wrapper_end = len(module_specs) + 2
    if hosted_count == expected_with_wrapper_end:
        files.append((src_root / 'wrapper-end.js', 'wrapper-end.js'))
    elif hosted_count != expected_without_wrapper_end:
        raise ValueError(
            f'`hosted-modules.json` must contain {expected_without_wrapper_end} or {expected_with_wrapper_end} URLs, found {hosted_count}.'
        )

    return files


def load_hosted_targets(project_root: Path, config_path: Path, module_map_path: Path) -> list[HostedTarget]:
    raw_hosted_urls = json.loads(read_text(config_path))
    if not isinstance(raw_hosted_urls, list) or not raw_hosted_urls:
        raise ValueError(f'Invalid or empty config: {config_path}')
    hosted_url_items = cast(list[Any], raw_hosted_urls)
    hosted_urls = [str(item) for item in hosted_url_items]

    module_specs = load_module_map(module_map_path)
    source_files = build_source_file_list(project_root, module_specs, len(hosted_urls))
    targets: list[HostedTarget] = []
    for index, (source_info, url) in enumerate(zip(source_files, hosted_urls), start=1):
        source_path, source_label = source_info
        gist_id, file_name = parse_gist_target(str(url))
        targets.append(
            HostedTarget(
                index=index,
                source_path=source_path,
                source_label=source_label,
                gist_id=gist_id,
                file_name=file_name,
                original_url=str(url),
            )
        )
    return targets


def load_token(token_env_names: tuple[str, ...], explicit_token: str | None, token_file: Path, required: bool) -> str:
    if explicit_token:
        return explicit_token.strip()
    for name in token_env_names:
        value = os.environ.get(name, '').strip()
        if value:
            return value
    file_token = read_token_file(token_file)
    if file_token:
        return file_token
    if required:
        raise RuntimeError(
            'Missing GitHub token. Set one of these environment variables: '
            + ', '.join(token_env_names)
            + f' or put the token into {token_file}'
        )
    return ''


def github_api_request(method: str, url: str, token: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    data = None
    headers = {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': USER_AGENT,
    }
    if token:
        headers['Authorization'] = f'Bearer {token}'
    if payload is not None:
        data = json.dumps(payload).encode('utf-8')
        headers['Content-Type'] = 'application/json; charset=utf-8'

    request = Request(url=url, data=data, headers=headers, method=method)
    try:
        with urlopen(request, timeout=60) as response:
            body = response.read().decode('utf-8')
            return json.loads(body) if body else {}
    except HTTPError as exc:
        details = exc.read().decode('utf-8', errors='replace')
        raise RuntimeError(f'GitHub API error {exc.code} for {url}: {details}') from exc
    except URLError as exc:
        raise RuntimeError(f'Network error for {url}: {exc.reason}') from exc


def fetch_gist(token: str, gist_id: str) -> dict[str, Any]:
    return github_api_request('GET', f'{API_BASE_URL}/gists/{gist_id}', token)


def patch_gist(token: str, gist_id: str, files_payload: dict[str, dict[str, str]]) -> dict[str, Any]:
    return github_api_request('PATCH', f'{API_BASE_URL}/gists/{gist_id}', token, payload={'files': files_payload})


def update_gists(targets: list[HostedTarget], token: str, dry_run: bool = False) -> dict[str, GistUpdateResult]:
    grouped: dict[str, list[HostedTarget]] = {}
    for target in targets:
        grouped.setdefault(target.gist_id, []).append(target)

    results: dict[str, GistUpdateResult] = {}
    for gist_id, gist_targets in grouped.items():
        print(f'\n=== Gist {gist_id} ===')
        files_payload: dict[str, dict[str, str]] = {}
        for target in gist_targets:
            content = read_text(target.source_path)
            files_payload[target.file_name] = {'content': content}
            print(f'[{target.index}] {target.source_label} -> {target.file_name}')

        if dry_run:
            response = fetch_gist(token, gist_id)
        else:
            response = patch_gist(token, gist_id, files_payload)

        response_files = cast(dict[str, Any], response.get('files') or {})
        updated_urls_by_file: dict[str, str] = {}
        for target in gist_targets:
            file_info = cast(dict[str, Any] | None, response_files.get(target.file_name))
            raw_url = str(file_info.get('raw_url', '')) if isinstance(file_info, dict) else ''
            if not raw_url:
                raise RuntimeError(
                    f'GitHub API response for gist {gist_id} does not contain `raw_url` for file `{target.file_name}`.'
                )
            updated_urls_by_file[target.file_name] = raw_url

        action = 'checked' if dry_run else 'updated'
        print(f'{action.upper()}: {response.get("html_url", f"https://gist.github.com/{gist_id}")}')
        results[gist_id] = GistUpdateResult(
            gist_id=gist_id,
            updated_urls_by_file=updated_urls_by_file,
            html_url=str(response.get('html_url', f'https://gist.github.com/{gist_id}')),
        )

    return results


def rewrite_hosted_config(config_path: Path, targets: list[HostedTarget], results: dict[str, GistUpdateResult], dry_run: bool) -> None:
    updated_urls: list[str] = []
    for target in targets:
        result = results[target.gist_id]
        updated_urls.append(result.updated_urls_by_file[target.file_name])

    content = json.dumps(updated_urls, ensure_ascii=False, indent=2) + '\n'
    if dry_run:
        print('\nDry-run: `config/hosted-modules.json` not changed.')
        return

    write_text(config_path, content)
    print(f'\nUpdated config: {config_path}')


def build_parser() -> argparse.ArgumentParser:
    default_project_root = Path(__file__).resolve().parent.parent
    parser = argparse.ArgumentParser(description='Publish local userscript modules to GitHub Gists defined in hosted-modules.json.')
    parser.add_argument('--project-root', default=str(default_project_root))
    parser.add_argument('--config', default=str(default_project_root / 'config' / 'hosted-modules.json'))
    parser.add_argument('--module-map', default=str(default_project_root / 'config' / 'module-map.json'))
    parser.add_argument('--token-file', default=str(default_project_root / 'token.txt'))
    parser.add_argument('--token', default='')
    parser.add_argument('--token-env', action='append', dest='token_envs', default=[])
    parser.add_argument('--dry-run', action='store_true', help='Validate mapping and fetch gist metadata without uploading content.')
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    project_root = Path(args.project_root)
    config_path = Path(args.config)
    module_map_path = Path(args.module_map)
    token_file = Path(args.token_file)

    token_env_names = tuple(args.token_envs) if args.token_envs else DEFAULT_TOKEN_ENV_NAMES

    try:
        targets = load_hosted_targets(project_root, config_path, module_map_path)
        token = load_token(token_env_names, args.token, token_file, required=not args.dry_run)
        print(f'Loaded {len(targets)} hosted targets from {config_path}')
        results = update_gists(targets, token, dry_run=args.dry_run)
        rewrite_hosted_config(config_path, targets, results, dry_run=args.dry_run)
    except Exception as exc:
        print(f'ERROR: {exc}', file=sys.stderr)
        return 1

    print('\nDone.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
