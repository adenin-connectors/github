'use strict';

const logger = require('@adenin/cf-logger');
const handleError = require('@adenin/cf-activity').handleError;
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);

    const response = await api('/issues?state=opened&filter=assigned');

    let assignedIssuesUrl = 'https://github.com/issues/assigned';

    let ticketStatus = {
      title: 'Open Tickets',
      url: assignedIssuesUrl,
      urlLabel: 'All tickets',
    };

    if (response.body.length != 0) {
      ticketStatus = {
        description: `You have ${response.body.length} tickets assigned`,
        color: 'blue',
        value: response.body.length,
        actionable: true
      }
    } else {
      ticketStatus = {
        actionable: false
      }
    }

    activity.Response.Data = ticketStatus;

  } catch (error) {
    handleError(error, activity);
  }
};
