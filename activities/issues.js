'use strict';
const api = require('./common/api');

module.exports = async function (activity) {
  try {
    api.initialize(activity);
    let pagination = $.pagination(activity);
    const response = await api(`/issues?filter=all&state=open`);

    if ($.isErrorResponse(activity, response)) return;

    activity.Response.Data.items = api.convertIssues(response.body);
    let value = activity.Response.Data.items.items.length;
    activity.Response.Data.title = T(activity, 'Open Issues');
    activity.Response.Data.link = 'https://github.com/issues/assigned';
    activity.Response.Data.linkLabel = T(activity, 'All Issues');
    activity.Response.Data.actionable = value > 0;

    if (value > 0) {
      activity.Response.Data.value = value;
      activity.Response.Data.color = 'blue';
      activity.Response.Data.description = value > 1 ? T(activity, "You have {0} open issues.", value)
        : T(activity, "You have 1 open issue.");
    } else {
      activity.Response.Data.description = T(activity, `You have no open issues.`);
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};