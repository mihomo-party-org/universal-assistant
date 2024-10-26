import { JSONSchema } from "openai/lib/jsonschema";
import { RunnableToolFunctionWithParse } from "openai/lib/RunnableFunction";
import { z, ZodSchema } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import * as github from "@actions/github";
import { github_token } from ".";

type Tools = Record<string, RunnableToolFunctionWithParse<any>>;

export async function init_tools(): Promise<Tools> {
  const octokit = github.getOctokit(github_token);
  let repo_labels: [string, ...string[]] = [
    "bug",
    "enhancement",
    "question",
    "invalid",
    "wontfix",
    "duplicate",
  ];
  try {
    const labels = await octokit.rest.issues.listLabelsForRepo({
      owner: github.context.issue.owner,
      repo: github.context.issue.repo,
    });
    const labelNames = labels.data.map((label) => label.name);
    if (labelNames.length > 0) {
      repo_labels = [labelNames[0], ...labelNames.slice(1)];
    }
  } catch (e) {
    console.log(e);
  }

  // close issue
  const CloseParams = z.object({
    reason: z.enum(["not_planned", "completed"]),
  });
  type CloseParams = z.infer<typeof CloseParams>;
  const closeIssue = zodFunction({
    name: "closeIssue",
    description: "Close Issue",
    function: async ({ reason }: CloseParams) => {
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
  const lockIssue = zodFunction({
    name: "lockIssue",
    description: "Lock Issue",
    function: async ({ reason }: LockParams) => {
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
  const commentIssue = zodFunction({
    name: "commentIssue",
    description: "Comment Issue",
    function: async ({ content }: CommentParams) => {
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

  // label issue
  const LabelParams = z.object({
    label: z.array(z.enum(repo_labels)),
  });
  type LabelParams = z.infer<typeof LabelParams>;
  const labelIssue = zodFunction({
    name: "labelIssue",
    description: "Label Issue",
    function: async ({ label }: LabelParams) => {
      octokit.rest.issues.addLabels({
        owner: github.context.issue.owner,
        repo: github.context.issue.repo,
        issue_number: github.context.issue.number,
        labels: label,
      });
      console.log(`#${github.context.issue.number} labeled: ${label}`);
    },
    schema: LabelParams,
  });

  // rename issue
  const RenameParams = z.object({
    title: z.string(),
  });
  type RenameParams = z.infer<typeof RenameParams>;
  const renameIssue = zodFunction({
    name: "renameIssue",
    description: "Rename Issue",
    function: async ({ title }: RenameParams) => {
      octokit.rest.issues.update({
        owner: github.context.issue.owner,
        repo: github.context.issue.repo,
        issue_number: github.context.issue.number,
        title: title,
      });
      console.log(`#${github.context.issue.number} renamed: ${title}`);
    },
    schema: RenameParams,
  });

  // review pull request
  const ReviewParams = z.object({
    event: z.enum(["APPROVE", "REQUEST_CHANGES", "COMMENT"]),
    content: z.string(),
  });
  type ReviewParams = z.infer<typeof ReviewParams>;
  const reviewPullRequest = zodFunction({
    name: "reviewPullRequest",
    description: "Review Pull Request",
    function: async ({ event, content }: ReviewParams) => {
      octokit.rest.pulls.createReview({
        owner: github.context.issue.owner,
        repo: github.context.issue.repo,
        pull_number: github.context.issue.number,
        body: content,
        event,
      });
      console.log(
        `#${github.context.issue.number} Reviewd as ${event}\n${content}`
      );
    },
    schema: ReviewParams,
  });

  return {
    closeIssue,
    lockIssue,
    commentIssue,
    labelIssue,
    renameIssue,
    reviewPullRequest,
  };
}

// utils function
function zodFunction<T extends object>({
  function: fn,
  schema,
  description = "",
  name,
}: {
  function: (args: T) => Promise<any>;
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
