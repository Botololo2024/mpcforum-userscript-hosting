from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


@dataclass(frozen=True)
class ModuleSpec:
    order: int
    file: str
    startLine: int
    endLine: int | None
    label: str


BANNER_LINE_COUNT = 4


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8-sig")


def read_lines(path: Path) -> list[str]:
    return read_text(path).splitlines()


def load_map(path: Path) -> list[ModuleSpec]:
    raw = json.loads(read_text(path))
    specs = [ModuleSpec(**item) for item in raw]
    return sorted(specs, key=lambda item: item.order)


def trim_trailing_blank_lines(lines: list[str]) -> list[str]:
    trimmed = list(lines)
    while len(trimmed) > 1 and not trimmed[-1].strip():
        trimmed.pop()
    return trimmed


def trim_bootstrap_wrapper_end(lines: list[str]) -> list[str]:
    trimmed = list(lines)
    while trimmed and trimmed[-1].strip() in {'})();', '});'}:
        trimmed.pop()
    return trimmed


def expected_module_lines(source_lines: list[str], spec: ModuleSpec, source_path: Path) -> list[str]:
    start_index = max(spec.startLine - 1, 0)
    end_index = len(source_lines) if spec.endLine is None else min(spec.endLine, len(source_lines))
    slice_lines = source_lines[start_index:end_index]
    slice_lines = trim_trailing_blank_lines(slice_lines)
    if spec.file == '90-bootstrap.js':
        slice_lines = trim_bootstrap_wrapper_end(slice_lines)

    banner = [
        f"// Module: {spec.file}",
        f"// Source: {source_path}:{spec.startLine}-{spec.endLine}",
        f"// Purpose: {spec.label}",
        "",
    ]
    return banner + slice_lines


def actual_module_lines(module_path: Path) -> list[str]:
    return read_lines(module_path)


def normalize_compare_line(expected: str, actual: str) -> tuple[str, str]:
    if expected.startswith('// Source: ') and actual.startswith('// Source: '):
        return expected.lower(), actual.lower()
    return expected, actual


def first_difference(expected: list[str], actual: list[str]) -> tuple[int, str, str] | None:
    max_len = max(len(expected), len(actual))
    for index in range(max_len):
        left = expected[index] if index < len(expected) else '<missing>'
        right = actual[index] if index < len(actual) else '<missing>'
        left_cmp, right_cmp = normalize_compare_line(left, right)
        if left_cmp != right_cmp:
            return index + 1, left, right
    return None


def assemble_bundle(project_root: Path, specs: Iterable[ModuleSpec]) -> list[str]:
    src_root = project_root / 'src'
    modules_root = src_root / 'modules'
    lines: list[str] = []
    lines.extend(read_lines(src_root / 'userscript-header.txt'))
    lines.append('')
    lines.extend(read_lines(src_root / 'wrapper-start.js'))
    for spec in specs:
        lines.append('')
        lines.extend(read_lines(modules_root / spec.file))
    lines.append('')
    lines.extend(read_lines(src_root / 'wrapper-end.js'))
    return lines


def strip_banner(lines: list[str]) -> list[str]:
    if len(lines) >= BANNER_LINE_COUNT and lines[0].startswith('// Module: '):
        return lines[BANNER_LINE_COUNT:]
    return lines


def assemble_runtime_from_modules(project_root: Path, specs: Iterable[ModuleSpec]) -> list[str]:
    src_root = project_root / 'src'
    modules_root = src_root / 'modules'
    runtime: list[str] = []
    runtime.extend(read_lines(src_root / 'wrapper-start.js'))
    for spec in specs:
        runtime.extend(strip_banner(read_lines(modules_root / spec.file)))
    runtime.extend(read_lines(src_root / 'wrapper-end.js'))
    return runtime


def extract_runtime_from_source(source_lines: list[str], wrapper_start_lines: list[str]) -> list[str]:
    if not wrapper_start_lines:
        raise ValueError('wrapper-start.js is empty.')
    first = wrapper_start_lines[0]
    for index, line in enumerate(source_lines):
        if line == first:
            return source_lines[index:]
    raise ValueError('Could not locate wrapper-start.js inside source file.')


def normalize_runtime_lines(lines: list[str]) -> list[str]:
    return [line for line in lines if line.strip()]


def main() -> int:
    parser = argparse.ArgumentParser(description='Verify split userscript modules against source slices.')
    default_project_root = Path(__file__).resolve().parent.parent
    parser.add_argument('--project-root', default=str(default_project_root))
    parser.add_argument('--source-file', default=str(default_project_root / 'skrypt'))
    parser.add_argument('--module-map', default=str(default_project_root / 'config' / 'module-map.json'))
    parser.add_argument('--check-bundle', action='store_true')
    args = parser.parse_args()

    project_root = Path(args.project_root)
    source_path = Path(args.source_file)
    module_map_path = Path(args.module_map)
    modules_root = project_root / 'src' / 'modules'

    source_lines = read_lines(source_path)
    specs = load_map(module_map_path)

    mismatches: list[str] = []
    for spec in specs:
        expected = expected_module_lines(source_lines, spec, source_path)
        actual = actual_module_lines(modules_root / spec.file)
        diff = first_difference(expected, actual)
        if diff is None:
            print(f"OK  {spec.file}")
            continue
        line_no, expected_line, actual_line = diff
        mismatches.append(spec.file)
        print(f"ERR {spec.file} line {line_no}")
        print(f"    expected: {expected_line}")
        print(f"    actual:   {actual_line}")

    if args.check_bundle:
        runtime_from_modules = normalize_runtime_lines(assemble_runtime_from_modules(project_root, specs))
        runtime_from_source = normalize_runtime_lines(
            extract_runtime_from_source(source_lines, read_lines(project_root / 'src' / 'wrapper-start.js'))
        )
        diff = first_difference(runtime_from_source, runtime_from_modules)
        if diff is None:
            print('OK  runtime-assembly')
        else:
            line_no, expected_line, actual_line = diff
            mismatches.append('runtime-assembly')
            print(f'ERR runtime-assembly line {line_no}')
            print(f'    expected: {expected_line}')
            print(f'    actual:   {actual_line}')

    if mismatches:
        print(f"\nFAILED: {', '.join(mismatches)}")
        return 1

    print('\nAll modules match the source map.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
