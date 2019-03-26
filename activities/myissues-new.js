'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    const currentUser = await api('/user');

    if (Activity.isErrorResponse(currentUser)) return;

    var dateRange = Activity.dateRange("today");
    let start = new Date(dateRange.startDate);
    let end = new Date(dateRange.endDate);

    let requestUrl = `/search/issues?q=assignee:${currentUser.body.login}+state:open+` +
      `created:${start.getFullYear()}-${("0" + (start.getMonth() + 1)).slice(-2)}-${("0" + start.getDate()).slice(-2)}..` +
      `${end.getFullYear()}-${("0" + (end.getMonth() + 1)).slice(-2)}-${("0" + end.getDate()).slice(-2)}`;

    const response = await api(requestUrl);

    if (Activity.isErrorResponse(response)) return;

    let issuesStatus = {
      title: T('New Open Issues'),
      url: 'https://github.com/issues/assigned',
      urlLabel: T('All Issues'),
    };

    let issueCount = response.body.items.length;
    
    if (issueCount != 0) {
      issuesStatus = {
        ...issuesStatus,
        description: issueCount > 1 ? T("You have {0} new issues.", issueCount) : T("You have 1 new issue."),
        color: 'blue',
        value: response.body.length,
        actionable: true
      };
    } else {
      issuesStatus = {
        ...issuesStatus,
        description: T(`You have no new issues assigned`),
        actionable: false
      };
    }

    activity.Response.Data = issuesStatus;
  } catch (error) {
    Activity.handleError(error);
  }
};
