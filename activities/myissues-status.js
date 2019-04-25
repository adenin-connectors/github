'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    const response = await api(`/issues?q=filter:assigned+state:open`);

    if ($.isErrorResponse(activity, response)) return;

    let issuesStatus = {
      title: T(activity, 'Open Issues'),
      link: 'https://github.com/issues/assigned',
      linkLabel: T(activity, 'All Issues'),
    };

    let issueCount = response.body.length;
    issueCount = 1;
    if (issueCount != 0) {
      issuesStatus = {
        ...issuesStatus,
        description: issueCount > 1 ? T(activity, "You have {0} issues.", issueCount) : T(activity, "You have 1 issue."),
        color: 'blue',
        value: response.body.length,
        actionable: true
      };
    } else {
      issuesStatus = {
        ...issuesStatus,
        description: T(activity, `You have no issues assigned.`),
        actionable: false
      };
    }

    activity.Response.Data = issuesStatus;
  } catch (error) {
    $.handleError(activity, error);
  }
};
