const { onRequest } = require('firebase-functions/v2/https');
const fetch = require('node-fetch');

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
