const { onRequest } = require('firebase-functions/v2/https');
const fetch = require('node-fetch');
const { Configuration, OpenAIApi } = require('openai');
const { Octokit } = require('@octokit/rest');
require('dotenv').config();

const openaiKey = process.env.OPENAI_KEY;
const githubKey = process.env.GITHUB_KEY;

const configuration = new Configuration({
  apiKey: openaiKey,
});
const openai = new OpenAIApi(configuration);

const octokit = new Octokit({
  auth: githubKey,
});

exports.getUser = onRequest(async (request, response) => {
  const { token } = request.query;

  try {
    const apiResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${token}`,
      },
    });

    const responseData = await apiResponse.json();

    response.json(responseData);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

exports.getRepos = onRequest(async (request, response) => {
  const { token } = request.query;

  try {
    const apiResponse = await fetch('https://api.github.com/user/repos', {
      headers: {
        Authorization: `token ${token}`,
      },
    });

    const responseData = await apiResponse.json();

    response.json(responseData);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

exports.getStarredRepos = onRequest(async (request, response) => {
  const { token } = request.query;

  try {
    const apiResponse = await fetch('https://api.github.com/user/starred', {
      headers: {
        Authorization: `token ${token}`,
      },
    });

    const responseData = await apiResponse.json();

    response.json(responseData);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

exports.githubWebhook = onRequest(async (request, response) => {
  const { body } = request;

  const isIssueEvent = body.issue !== undefined;
  const isPullRequestEvent = body.pull_request !== undefined;

  if (isIssueEvent) {
    const issueDetails = body.issue.body;
    const issueNumber = body.issue.number;

    const chat_completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: issueDetails,
    });

    const resultText = chat_completion.data.choices[0].text;

    if (body.sender.login !== 'React-Challenge-Bot1') {
      try {
        await octokit.issues.createComment({
          owner: 'MohammadRRamis',
          repo: 'ReactChallenge',
          issue_number: issueNumber,
          body: resultText,
        });
      } catch (error) {
        console.log(error);
      }
    }
  } else if (isPullRequestEvent) {
    const pullRequestDetails = body.pull_request.body;
    const pullRequestNumber = body.pull_request.number;

    const chat_completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: pullRequestDetails,
    });

    const resultText = chat_completion.data.choices[0].text;

    if (body.sender.login !== 'React-Challenge-Bot1') {
      try {
        await octokit.pulls.createReview({
          owner: 'MohammadRRamis',
          repo: 'ReactChallenge',
          pull_number: pullRequestNumber,
          body: resultText,
        });
      } catch (error) {
        console.log(error);
      }
    }
  }

  response.status(200).json({ success: true });
});
