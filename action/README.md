# GitHub Actions

Custom GitHub Actions for tb-changelog project.

## Available Actions

### [tb-changelog-update-release](./tb-changelog-update-release/)
Automatically generates and updates release notes with changelogs combining git history and TrackerBoot story details.

**Recommended trigger:** `release` (type: `prereleased`)

**Usage:**
```yaml
uses: Bekind-Labs/tb-changelog/action/tb-changelog-update-release@action-v1
with:
  tb-api-key: ${{ secrets.TB_API_KEY }}
  tb-project-id: ${{ secrets.TB_PROJECT_ID }}
```

See [examples/workflows/01-basic.yml](../examples/workflows/01-basic.yml) for a complete workflow example.

### [tb-changelog-sync-draft](./tb-changelog-sync-draft/)
Automatically creates or updates draft releases with changelogs from latest release to HEAD.

**Recommended trigger:** `push` to the main branch

**Usage:**
```yaml
uses: Bekind-Labs/tb-changelog/action/tb-changelog-sync-draft@action-v1
with:
  tb-api-key: ${{ secrets.TB_API_KEY }}
  tb-project-id: ${{ secrets.TB_PROJECT_ID }}
  # Optional parameters
  draft-title: '📛 Next Release Candidate'  # Default
  timezone: 'Etc/UTC'  # Default (e.g., Asia/Tokyo, America/New_York)
```

See [examples/workflows/02-sync-draft.yml](../examples/workflows/02-sync-draft.yml) for a complete workflow example.

## License

Part of the tb-changelog project.