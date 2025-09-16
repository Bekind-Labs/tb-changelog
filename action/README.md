# GitHub Actions

Custom GitHub Actions for tb-changelog project.

## Available Actions

### [tb-changelog-update-release](./tb-changelog-update-release/)
Automatically generates and updates release notes with changelogs combining git history and TrackerBoot story details.

**Usage:**
```yaml
uses: Bekind-Labs/tb-changelog/action/tb-changelog-update-release@action-v1
with:
  tb-api-key: ${{ secrets.TB_API_KEY }}
  tb-project-id: ${{ secrets.TB_PROJECT_ID }}
```

See [examples/workflows/01-basic.yml](../examples/workflows/01-basic.yml) for a complete workflow example.

## License

Part of the tb-changelog project.