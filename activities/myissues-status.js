'use strict';

const cfActivity = require('@adenin/cf-activity');
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);

    const response = await api(`/issues?q=filter:assigned+state:open`);

    if (!cfActivity.isResponseOk(activity, response)) {
      return;
    }

    let issuesStatus = {
      title: 'Open Issues',
      url: 'https://github.com/issues/assigned',
      urlLabel: 'All Issues',
    };

    let issueCount = response.body.length;

    if (issueCount != 0) {
      issuesStatus = {
        ...issuesStatus,
        description: `You have ${issueCount > 1 ? issueCount + " issues" : issueCount + " issue"} assigned`,
        color: 'blue',
        value: response.body.length,
        actionable: true
      };
    } else {
      issuesStatus = {
        ...issuesStatus,
        description: `You have no issues assigned`,
        actionable: false
      };
    }

    activity.Response.Data = issuesStatus;
  } catch (error) {
    cfActivity.handleError(activity, error);
  }
};
