'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    const currentUser = await api('/user');
    if ($.isErrorResponse(activity, currentUser)) return;

    var dateRange = $.dateRange(activity, "today");
    let start = new Date(dateRange.startDate);
    let end = new Date(dateRange.endDate);

    let requestUrl = `/search/issues?q=assignee:${currentUser.body.login}+state:open+` +
      `created:${start.getFullYear()}-${("0" + (start.getMonth() + 1)).slice(-2)}-${("0" + start.getDate()).slice(-2)}..` +
      `${end.getFullYear()}-${("0" + (end.getMonth() + 1)).slice(-2)}-${("0" + end.getDate()).slice(-2)}`;

    const response = await api(requestUrl);

    if ($.isErrorResponse(activity, response)) return;

    activity.Response.Data.items = api.convertIssues(response.body.items);
    let value = activity.Response.Data.items.items.length;
    activity.Response.Data.title = T(activity, 'Recent Open Issues');
    activity.Response.Data.link = 'https://github.com/issues/assigned';
    activity.Response.Data.linkLabel = T(activity, 'All Issues');
    activity.Response.Data.actionable = value > 0;

    if (value > 0) {
      activity.Response.Data.value = value;
      activity.Response.Data.color = 'blue';
      activity.Response.Data.description = value > 1 ? T(activity, "You have {0} recent assigned issues.", value)
        : T(activity, "You have 1 recent assigned issue.");
    } else {
      activity.Response.Data.description = T(activity, `You have no recent issues assigned.`);
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};
