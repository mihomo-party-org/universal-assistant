import { JSONSchema } from "openai/lib/jsonschema";
import { RunnableToolFunctionWithParse } from "openai/lib/RunnableFunction";
import { z, ZodSchema } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import * as github from "@actions/github";
import { github_token } from ".";

// close issue
const CloseParams = z.object({
  reason: z.enum(["not_planned", "completed", "reopened"]),
});
type CloseParams = z.infer<typeof CloseParams>;
export const closeIssue = zodFunction({
  name: "closeIssue",
  description: "Close Issue",
  function: async ({ reason }: CloseParams) => {
    const octokit = github.getOctokit(github_token);
    octokit.rest.issues.update({
      owner: github.context.issue.owner,
      repo: github.context.issue.repo,
      issue_number: github.context.issue.number,
      state: "closed",
      state_reason: reason,
    });
    console.log(`#${github.context.issue.number} closed as ${reason}`);
  },
  schema: CloseParams,
});

// lock issue
const LockParams = z.object({
  reason: z.enum(["off-topic", "spam", "too heated", "resolved"]),
});
type LockParams = z.infer<typeof LockParams>;
export const lockIssue = zodFunction({
  name: "lockIssue",
  description: "Lock Issue",
  function: async ({ reason }: LockParams) => {
    const octokit = github.getOctokit(github_token);
    octokit.rest.issues.lock({
      owner: github.context.issue.owner,
      repo: github.context.issue.repo,
      issue_number: github.context.issue.number,
      lock_reason: reason,
    });
    console.log(`#${github.context.issue.number} locked as ${reason}`);
  },
  schema: LockParams,
});

// comment issue
const CommentParams = z.object({
  content: z.string(),
});
type CommentParams = z.infer<typeof CommentParams>;
export const commentIssue = zodFunction({
  name: "commentIssue",
  description: "Comment Issue",
  function: async ({ content }: CommentParams) => {
    const octokit = github.getOctokit(github_token);
    octokit.rest.issues.createComment({
      owner: github.context.issue.owner,
      repo: github.context.issue.repo,
      issue_number: github.context.issue.number,
      body: content,
    });
    console.log(`#${github.context.issue.number} commented: ${content}`);
  },
  schema: CommentParams,
});

// utils function
function zodFunction<T extends object>({
  function: fn,
  schema,
  description = "",
  name,
}: {
  function: (args: T) => Promise<void>;
  schema: ZodSchema<T>;
  description?: string;
  name?: string;
}): RunnableToolFunctionWithParse<T> {
  return {
    type: "function",
    function: {
      function: fn,
      name: name ?? fn.name,
      description: description,
      parameters: zodToJsonSchema(schema) as JSONSchema,
      parse(input: string): T {
        const obj = JSON.parse(input);
        return schema.parse(obj);
      },
    },
  };
}
