'use strict';

const cfActivity = require('@adenin/cf-activity');
const api = require('./common/api');

module.exports = async function (activity) {

  try {
    api.initialize(activity);

    var pagination = cfActivity.pagination(activity);
    const response = await api(`/issues?q=filter:assigned+state:open?page=${pagination.page}&per_page=${pagination.pageSize}`);

    if (!cfActivity.isResponseOk(activity, response)) {
      return;
    }
    // convert response to items[]
    activity.Response.Data = api.convertIssues(response);
  } catch (error) {

    cfActivity.handleError(activity, error);
  }
};