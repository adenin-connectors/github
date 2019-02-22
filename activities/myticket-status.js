'use strict';

const logger = require('@adenin/cf-logger');
const handleError = require('@adenin/cf-activity').handleError;
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);

    const response = await api('/issues?state=opened&filter=assigned');

    let ticketStatus = {
      title: 'Open Tickets',
      url: 'https://github.com/issues/assigned',
      urlLabel: 'All tickets',
    };

    if (response.body.length != 0) {
      ticketStatus = {
        ...ticketStatus,
        description: `You have ${response.body.length} tickets assigned`,
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
    handleError(error, activity);
  }
};
