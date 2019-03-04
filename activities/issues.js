'use strict';

const cfActivity = require('@adenin/cf-activity');
const api = require('./common/api');

module.exports = async function (activity) {

  try {
    api.initialize(activity);

    const response = await api('/issues?state=opened&filter=assigned');

    if (!cfActivity.isResponseOk(activity, response)) {
      return;
    }
    // convert response to items[]
    activity.Response.Data = api.convertIssues(response);
  } catch (error) {

    cfActivity.handleError(activity, error);
  }
};