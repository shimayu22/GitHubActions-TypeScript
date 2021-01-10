import * as core from '@actions/core'
import * as github from '@actions/github'
import * as Webhooks from '@octokit/webhooks'

export async function run(): Promise<void> {
  try {
    // The pull_request exists on payload when a pull_request event is triggered.
    // Sets action status to failed when pull_request does not exist on payload.
    const pr = github.context.payload
      .pull_request as Webhooks.EventPayloads.WebhookPayloadPullRequest
    if (!pr) {
      core.setFailed('github.context.payload.pull_request not exist')
      return
    }

    // Get input parameters.
    const token = core.getInput('repo-token')
    const message = core.getInput('message')
    core.debug(`message: ${message}`)

    // Create a GitHub client.
    const client = github.getOctokit(token)

    // Get owner and repo from context
    const owner = github.context.repo.owner
    const repo = github.context.repo.repo

    // create a comment on PR
    // https://octokit.github.io/rest.js/#octokit-routes-issues-create-comment
    const response = await client.issues.createComment({
      owner,
      repo,
      issue_number: pr.number,
      body: message
    })
    core.debug(`create comment URL: ${response.data.html_url}`)
    core.setOutput('comment-url', response.data.html_url)
  } catch (error) {
    core.setFailed(error.message)
  }
}
