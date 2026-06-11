# Publishing `formula-edit-lark` to npm

## Prerequisites

1. An [npm](https://www.npmjs.com/) account with publish access to the `formula-edit-lark` package name.
2. A GitHub repository with Actions enabled.
3. An npm access token stored as the GitHub secret `NPM_TOKEN`.

Create the token at [npmjs.com → Access Tokens](https://www.npmjs.com/settings/~your-user~/tokens) with **Automation** or **Publish** scope, then add it in GitHub:

`Settings → Secrets and variables → Actions → New repository secret → NPM_TOKEN`

Update `repository`, `bugs`, and `homepage` in `packages/formula-edit-lark/package.json` if your GitHub org/repo name differs.

## Release flow (recommended)

The repo uses three workflows:

| Workflow | Trigger | Action |
|----------|---------|--------|
| `ci.yml` | push / PR to `main` | test + build |
| `release.yml` | `package.json` version bump on `main` | auto tag `vX.Y.Z` + GitHub Release |
| `publish.yml` | GitHub Release **published** | test + build + `npm publish` |

### 1. Bump version locally

```bash
# patch: 0.1.0 → 0.1.1
npm run version:patch

# or minor / major
npm run version:minor
npm run version:major
```

This updates `packages/formula-edit-lark/package.json` only (no local git tag). Commit and push:

```bash
git add packages/formula-edit-lark/package.json package-lock.json
git commit -m "chore: release formula-edit-lark v0.1.1"
git push origin main
```

### 2. Push to main → auto tag + GitHub Release

When the version field in `packages/formula-edit-lark/package.json` changes on `main`, **`release.yml`** will:

1. Create git tag `v{version}` (e.g. `v0.1.0`)
2. Create a GitHub Release with auto-generated notes

No manual tagging required.

### 3. npm publish (automatic)

When the GitHub Release is **published**, `publish.yml` runs:

1. Verifies tag matches `package.json` version
2. Runs tests
3. Builds the library
4. Publishes to npm with provenance

## Manual triggers

### Dry-run release check

Actions → **Release** → Run workflow → enable **Dry run**

### Manual npm publish

Actions → **Publish to npm** → Run workflow → enter tag (e.g. `v0.1.0`)

## Local publish (maintainers)

```bash
npm ci
npm test
npm run build -w formula-edit-lark
npm publish -w formula-edit-lark --access public
```

You must be logged in locally (`npm login`) and have publish rights on npm.

## First release checklist (`v0.1.0`)

1. Ensure `NPM_TOKEN` secret is set on GitHub
2. Confirm npm package name `formula-edit-lark` is available / you own it
3. Run `npm run ci` locally
4. Bump version (already `0.1.0` for first release) or run `npm run version:patch` after future changes
5. Push to `main`
6. Confirm **Release** workflow created `v0.1.0` and GitHub Release
7. Confirm **Publish to npm** workflow succeeded
