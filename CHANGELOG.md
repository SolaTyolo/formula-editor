# Changelog

All notable changes to `formula-edit-lark` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-06-11

### Added

- Lark/Feishu-style formula editor with field pills and smart hint panel
- Syntax presets: `at-hash`, `dot` (Feishu `#field` + bare functions), `mustache`
- Multi-table field refs (`table.column` pills)
- `FormulaCellHoverPreview` for read-only formula preview on table cells
- `FormulaReadonlyPreview` component
- Field/table atomic delete; functions delete character-by-character
- i18n: `zh-CN` / `en-US`
- Unit tests (Vitest) and GitHub Actions CI
- npm publish workflow with provenance

[0.1.0]: https://github.com/formula-edit-lark/formula-edit-lark/releases/tag/v0.1.0
