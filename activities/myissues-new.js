'use strict';

const cfActivity = require('@adenin/cf-activity');
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    const currentUser = await api('/user');

    if (!cfActivity.isResponseOk(activity, currentUser)) {
      return;
    }

    var dateRange = cfActivity.dateRange(activity, "today");
    let start = new Date(dateRange.startDate);
    let end = new Date(dateRange.endDate);

    let requestUrl = `/search/issues?q=assignee:${currentUser.body.login}+state:open+` +
      `created:${start.getFullYear()}-${("0" + (start.getMonth() + 1)).slice(-2)}-${("0" + start.getDate()).slice(-2)}..` +
      `${end.getFullYear()}-${("0" + (end.getMonth() + 1)).slice(-2)}-${("0" + end.getDate()).slice(-2)}`;

    const response = await api(requestUrl);

    if (!cfActivity.isResponseOk(activity, response)) {
      return;
    }

    let issuesStatus = {
      title: 'New Open Issues',
      url: 'https://github.com/issues/assigned',
      urlLabel: 'All Issues',
    };

    let issueCount = response.body.items.length;

    if (issueCount != 0) {
      issuesStatus = {
        ...issuesStatus,
        description: `You have ${issueCount > 1 ? issueCount + " new issues" : issueCount + " new issue"} assigned`,
        color: 'blue',
        value: response.body.length,
        actionable: true
      };
    } else {
      issuesStatus = {
        ...issuesStatus,
        description: `You have no new issues assigned`,
        actionable: false
      };
    }

    activity.Response.Data = issuesStatus;
  } catch (error) {
    cfActivity.handleError(activity, error);
  }
};
