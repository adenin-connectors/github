'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    const response = await api(`/issues?q=filter:assigned+state:open`);

    if (Activity.isErrorResponse(response)) return;

    let issuesStatus = {
      title: T('Open Issues'),
      url: 'https://github.com/issues/assigned',
      urlLabel: T('All Issues'),
    };

    let issueCount = response.body.length;
issueCount=1;
    if (issueCount != 0) {
      issuesStatus = {
        ...issuesStatus,
        description: issueCount > 1 ? T("You have {0} issues.", issueCount) : T("You have 1 issue."),
        color: 'blue',
        value: response.body.length,
        actionable: true
      };
    } else {
      issuesStatus = {
        ...issuesStatus,
        description: T(`You have no issues assigned.`),
        actionable: false
      };
    }

    activity.Response.Data = issuesStatus;
  } catch (error) {
    Activity.handleError(error);
  }
};
