import { closeIssue, lockIssue, commentIssue } from "./github_calls";
import * as github from "@actions/github";
import * as core from "@actions/core";
import OpenAI from "openai";
import { RunnableToolFunctionWithParse } from "openai/lib/RunnableFunction";

export let openai_base_url: string;
export let openai_api_key: string;
export let openai_model: string;
export let system_prompt: string;
export let user_input: string;
export let github_token: string;
export let action_event: string;
let tools: RunnableToolFunctionWithParse<any>[] = [];

function checkInput() {
  if (!openai_base_url) {
    openai_base_url = "https://api.openai.com/v1";
  }
  if (!openai_api_key) {
    throw new Error("openai_api_key is required");
  }
  if (!openai_model) {
    openai_model = "gpt-4o-mini";
  }
  if (!system_prompt) {
    throw new Error("system_prompt is required");
  }
  if (!user_input) {
    throw new Error("user_input is required");
  }
  if (!github_token) {
    throw new Error("github_token is required");
  }
  if (github.context.eventName.includes("issue")) {
    tools.push(closeIssue, lockIssue, commentIssue);
  }
  // todo: add more tools for other events
}

async function main() {
  openai_base_url = core.getInput("openai_base_url");
  openai_api_key = core.getInput("openai_api_key");
  openai_model = core.getInput("openai_model");
  system_prompt = core.getInput("system_prompt");
  user_input = core.getInput("user_input");
  github_token = core.getInput("github_token");
  action_event = github.context.eventName;
  checkInput();
  const openai = new OpenAI({
    baseURL: openai_base_url,
    apiKey: openai_api_key,
  });
  const runner = openai.beta.chat.completions.runTools({
    model: openai_model,
    messages: [
      {
        role: "system",
        content: system_prompt,
      },
      {
        role: "user",
        content: user_input,
      },
    ],
    tools,
  });
  await runner.finalChatCompletion();
}

main();
