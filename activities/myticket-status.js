'use strict';

const cfActivity = require('@adenin/cf-activity');
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);

    const response = await api('/issues?state=opened&filter=assigned');

    if (!cfActivity.isResponseOk(activity, response)) {
      return;
    }

    let ticketStatus = {
      title: 'Open Tickets',
      url: 'https://github.com/issues/assigned',
      urlLabel: 'All tickets',
    };

    let issueCount = response.body.length;
    
    if (issueCount != 0) {
      ticketStatus = {
        ...ticketStatus,
        description: `You have ${issueCount > 1 ? issueCount + " issues" : issueCount + " issue"} assigned`,
        color: 'blue',
        value: response.body.length,
        actionable: true
      }
    } else {
      ticketStatus = {
        ...ticketStatus,
        description: `You have no tickets assigned`,
        actionable: false
      }
    }

    activity.Response.Data = ticketStatus;

  } catch (error) {
    
    cfActivity.handleError(activity, error);
  }
};
