#!/usr/bin/env node

const GitHubApi = require('github');
const github = new GitHubApi();


github.search.issues({
  per_page: 100,
  q: 'repo:angular/material2 is:pr is:merged merged:>2018-05-06 -label:"release: minor" -label:"release: major"',
}, (error, response) => {
  if (response) {

    const prs = response.data.items;
    for (const pr of prs) {
      console.log(`${pr.number}`);
    }
  } else {
    console.error('Fetching merged PRs failed.');
    console.error(error);
  }
});
