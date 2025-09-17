# GitHub Actions

Custom GitHub Actions for tb-changelog project.

---

## Available Actions

### [tb-changelog-update-release](./tb-changelog-update-release/)
Automatically generates and updates release notes with changelogs combining git history and TrackerBoot story details.

- **Recommended Trigger:** `release` (type: `prereleased`)
- See [examples/workflows/01-basic.yml](../examples/workflows/01-basic.yml) for a complete workflow example.

**Usage:**
```yaml
uses: Bekind-Labs/tb-changelog/action/tb-changelog-update-release@action-v1
with:
  tb-api-key: ${{ secrets.TB_API_KEY }}
  tb-project-id: ${{ secrets.TB_PROJECT_ID }}
  # Optional parameters
  format: 'github'  # Default
  no-signature: 'false'  # Default
  slack-bot-token: ${{ secrets.SLACK_BOT_TOKEN }}
  slack-channel: "#your-team-channel"
  slack-color: '#10b981'  # Default (hex color code)
```

**Slack Integration:**
When both `slack-bot-token` and `slack-channel` are provided, the action will automatically post release notifications to your Slack channel:

**Setup:**
1. Create a Slack App and obtain a Bot Token with `chat:write` scope
2. Invite the bot to your desired channel
3. Add the bot token to GitHub Secrets as `SLACK_BOT_TOKEN`
4. Specify the channel (e.g., `#releases`, `@username`) in the workflow

### [tb-changelog-sync-draft](./tb-changelog-sync-draft/)
Automatically creates or updates draft releases with changelogs from latest release to HEAD.

- **Recommended Trigger:** `push` to main branch
- See [examples/workflows/02-sync-draft.yml](../examples/workflows/02-sync-draft.yml) for a complete workflow example.

**Usage:**
```yaml
uses: Bekind-Labs/tb-changelog/action/tb-changelog-sync-draft@action-v1
with:
  tb-api-key: ${{ secrets.TB_API_KEY }}
  tb-project-id: ${{ secrets.TB_PROJECT_ID }}
  # Optional parameters
  format: 'github'  # Default
  draft-title: '📛 Next Release Candidate'  # Default
  timezone: 'Etc/UTC'  # Default (e.g., Asia/Tokyo, America/New_York)
  no-signature: 'false'  # Default
```

## License

Part of the tb-changelog project.