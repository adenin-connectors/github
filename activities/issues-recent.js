'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    var dateRange = $.dateRange(activity, "today");
    let pagination = $.pagination(activity);
    let requestUrl = `/issues?filter=all&state=open&since=${dateRange.startDate}&page=${pagination.page}&per_page=${pagination.pageSize}`;
    const response = await api(requestUrl);

    if ($.isErrorResponse(activity, response)) return;

    activity.Response.Data.items = api.convertIssues(response.body);
    let value = activity.Response.Data.items.items.length;
    activity.Response.Data.title = T(activity, 'Recent Open Issues');
    activity.Response.Data.link = 'https://github.com/issues/assigned';
    activity.Response.Data.linkLabel = T(activity, 'All Issues');
    activity.Response.Data.actionable = value > 0;

    if (value > 0) {
      activity.Response.Data.value = value;
      activity.Response.Data.color = 'blue';
      activity.Response.Data.description = value > 1 ? T(activity, "You have {0} recent open issues.", value)
        : T(activity, "You have 1 recent open issue.");
    } else {
      activity.Response.Data.description = T(activity, `You have no recent open issues.`);
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};
