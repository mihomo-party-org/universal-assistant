# Universal Assistant

> A universal assistant to help handle GitHub matters

## Available Tools

- [x] Close issue(closeIssue)
- [x] Lock issue(lockIssue)
- [x] Comment issues(commentIssue)
- [ ] and more...

## Usage

### Review Issues

```yaml
name: Review Issues

on:
  issues:
    types: [opened]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - name: Review Issues
        uses: mihomo-party-org/universal-assistant@v1.0.1
        with:
          # default is https://api.openai.com/v1
          openai_base_url: ${{ secrets.OPENAI_BASE_URL }}
          openai_api_key: ${{ secrets.OPENAI_API_KEY }}
          # default is gpt-4o-mini
          openai_model: ${{ vars.OPENAI_MODEL }}
          system_prompt: ${{ vars.SYSTEM_PROMPT }}
          # default is "closeIssue,lockIssue,commentIssue"
          available_tools: ${{ vars.AVAILABLE_TOOLS }}
          user_input: |
            Please review this issue:
            Title: "${{ github.event.issue.title }}"
            Content: "${{ github.event.issue.body }}"
          github_token: ${{ secrets.TOKEN }}
```
