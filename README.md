# Universal Assistant

> A universal assistant to help handle GitHub matters

## Features

- [x] Close issues
- [x] Lock issues
- [x] Comment issues

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
        uses: mihomo-party-org/universal-assistant@v1
        with:
          openai_base_url: ${{ secrets.OPENAI_BASE_URL }}
          openai_api_key: ${{ secrets.OPENAI_API_KEY }}
          openai_model: ${{ vars.OPENAI_MODEL }}
          system_prompt: ${{ vars.SYSTEM_PROMPT }}
          user_input: |
            Please review this issue:
            Title: "${{ github.event.issue.title }}"
            Content: "${{ github.event.issue.body }}"
          github_token: ${{ secrets.TOKEN }}
```
