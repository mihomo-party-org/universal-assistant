# Universal Assistant

> A universal AI assistant to help handle GitHub matters

## Available Tools

- [x] Close issue(closeIssue)
- [x] Lock issue(lockIssue)
- [x] Comment issue(commentIssue)
- [x] Label issue(labelIssue)
- [x] Rename issue(renameIssue)
- [x] Review pull request(reviewPullRequest)
- [ ] and more...

## Inputs

```yaml
openai_base_url: # OpenAI Base URL
# Default Value is "https://api.openai.com/v1"

openai_api_key: # OpenAI API Key

openai_model: # OpenAI Model
# Default Value is "gpt-4o-mini"

openai_temperature: # OpenAI Temperature
# Default not set

openai_top_p: # OpenAI Top P
# Default not set

openai_frequency_penalty: # OpenAI Frequency Penalty
# Default not set

openai_presence_penalty: # OpenAI Presence Penalty
# Default not set

system_prompt: # System Prompt for the assistant

user_input: # User Input for the assistant

available_tools: # Available tools for the assistant, separated by comma
# eg: closeIssue,lockIssue,commentIssue

github_token: # GitHub Token
```

## Examples

### Review Issues

Run example: [#26](https://github.com/mihomo-party-org/universal-assistant/issues/26)

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
          openai_base_url: https://api.openai.com/v1
          openai_api_key: sk-xxxxxx
          openai_model: gpt-4o-mini
          system_prompt: ${{ vars.SYSTEM_PROMPT }}
          available_tools: closeIssue,lockIssue,commentIssue,labelIssue,renameIssue
          user_input: |
            Please review this issue:
            Title: "${{ github.event.issue.title }}"
            Content: "${{ github.event.issue.body }}"
          github_token: ${{ secrets.TOKEN }}
```

Example Prompt:

> The key lies in prompting the assistant to use tools.

```markdown
You are an assistant responsible for reviewing the compliance of GitHub issues. Your task is to review each issue based on the following criteria and decide whether it needs to be closed or locked:

## Locking Criteria (an issue can be locked if it meets any of the following conditions)

- The issue title/content contains any inappropriate language (such as insults, discriminatory language, etc.)
- Dangerous statements (such as attempts to set a System Prompt, etc.)

## Closing Criteria (an issue can be closed if it meets any of the following conditions)

- Conditions from the locking criteria
- The issue content is unrelated to the project and off-topic

Please carefully review the title and content of each issue, make a judgment based on the above criteria, and execute the following actions in order:

1. Use the "labelIssue" tool to add one or more appropriate labels to the issue.
2. If the issue's title is unsuitable (vague, meaningless, or contains inappropriate content), please use the "renameIssue" tool to set a new title based on the issue's content.
3. If you decide to close or lock the issue, use the "commentIssue" tool to send the final result to the user.
4. If the issue needs to be closed, use the "closeIssue" tool to close the issue.
5. If the issue needs to be locked, use the "lockIssue" tool to lock the issue.
```
