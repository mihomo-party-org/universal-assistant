import { init_tools } from "./github_calls";
import * as github from "@actions/github";
import * as core from "@actions/core";
import OpenAI from "openai";
import { RunnableToolFunctionWithParse } from "openai/lib/RunnableFunction";

export let openai_base_url: string;
export let openai_api_key: string;
export let openai_model: string;
export let openai_temperature: number | undefined;
export let openai_top_p: number | undefined;
export let openai_frequency_penalty: number | undefined;
export let openai_presence_penalty: number | undefined;
export let system_prompt: string;
export let user_input: string;
export let github_token: string;
export let available_tools: string;
export let action_event: string;
let tools: RunnableToolFunctionWithParse<any>[] = [];

async function checkInput() {
  if (!openai_base_url) {
    openai_base_url = "https://api.openai.com/v1";
  }
  if (!openai_api_key) {
    throw new Error("openai_api_key is required");
  }
  if (!openai_model) {
    openai_model = "gpt-4o-mini";
  }
  if (isNaN(openai_temperature || NaN)) {
    openai_temperature = undefined;
  }
  if (isNaN(openai_top_p || NaN)) {
    openai_top_p = undefined;
  }
  if (isNaN(openai_frequency_penalty || NaN)) {
    openai_frequency_penalty = undefined;
  }
  if (isNaN(openai_presence_penalty || NaN)) {
    openai_presence_penalty = undefined;
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
  if (!available_tools) {
    available_tools = "closeIssue,lockIssue,commentIssue";
  }
  const all_tools = await init_tools();
  available_tools.split(",").forEach((tool) => {
    if (!all_tools[tool]) {
      throw new Error(`Tool "${tool}" is not available`);
    }
    tools.push(all_tools[tool]);
  });
}

async function main() {
  openai_base_url = core.getInput("openai_base_url");
  openai_api_key = core.getInput("openai_api_key");
  openai_model = core.getInput("openai_model");
  openai_temperature = parseFloat(core.getInput("openai_temperature"));
  openai_top_p = parseFloat(core.getInput("openai_top_p"));
  openai_frequency_penalty = parseFloat(
    core.getInput("openai_frequency_penalty")
  );
  openai_presence_penalty = parseFloat(
    core.getInput("openai_presence_penalty")
  );
  system_prompt = core.getInput("system_prompt");
  user_input = core.getInput("user_input");
  github_token = core.getInput("github_token");
  available_tools = core.getInput("available_tools");
  action_event = github.context.eventName;
  await checkInput();
  const openai = new OpenAI({
    baseURL: openai_base_url,
    apiKey: openai_api_key,
  });
  const runner = openai.beta.chat.completions.runTools({
    model: openai_model,
    temperature: openai_temperature,
    frequency_penalty: openai_frequency_penalty,
    top_p: openai_top_p,
    presence_penalty: openai_presence_penalty,
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
