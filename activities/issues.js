'use strict';
const api = require('./common/api');

module.exports = async function (activity) {
  try {
    var pagination = $.pagination(activity);
    api.initialize(activity);
    const response = await api(`/issues?q=filter:assigned+state:open&page=${pagination.page}&per_page=${pagination.pageSize}`);

    if ($.isErrorResponse(activity, response)) return;

    // convert response to items[]
    activity.Response.Data = api.convertIssues(response);
  } catch (error) {
    $.handleError(activity, error);
  }
};