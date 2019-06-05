'use strict';
const api = require('./common/api');
const crypto = require('crypto');

module.exports = async (activity) => {
  try {
    var key = activity.Context.connector.custom1;
    var message = activity.Request.Data;
    delete message["ConnectorName"];

    const hmac = crypto.createHmac('sha1', key);
    const self_signature = hmac.update(JSON.stringify(message)).digest('hex');
    let signature = `sha1=${self_signature}`;

    let isAuthorized = false;
    if (activity.Request.Headers["X-Hub-Signature"]) {
      isAuthorized = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(activity.Request.Headers["X-Hub-Signature"]));
    }

    // validate X-Hub-Signature header
    if (!activity.Context.connector.custom1 || !isAuthorized) {
      activity.Response.ErrorCode = 403;
      activity.Response.Data = {
        ErrorText: "invalid X-Hub-Signature"
      };
      return;
    }

    var request = activity.Request.Data;
    var entity = {};
    var collections = [];


    if (request.issue) {

      let date = new Date(request.issue.updated_at).toISOString();
      entity = {
        _type: "issue",
        id: "" + request.issue.id,
        title: request.issue.title,
        description: request.issue.description,
        date: date,
        link: request.issue.html_url
      };

      api.initialize(activity);
      let promises = [];
      for (let i = 0; i < request.issue.assignees.length; i++) {
        promises.push(api(`/users/${request.issue.assignees[i].login}`));
      }
      // also get owner's info
      promises.push(api(`/users/${request.issue.user.login}`));

      const responses = await Promise.all(promises);
      for (let i = 0; i < responses.length; i++) {
        if ($.isErrorResponse(activity, responses[i])) return;
      }

      let userMails = [];
      for (let i = 0; i < responses.length; i++) {
        if (responses[i].body.email) {
          userMails.push(responses[i].body.email);
        }
      }
      
      let roles = [];

      // case 1: A collection "all" is returned with users and roles
      collections.push({ name: "all", users: userMails, roles: roles, date: date });

      if (request.issue.state == "open") {

        // case 2: When open == true we return collection “open”, with users and roles
        collections.push({ name: "open", users: userMails, roles: roles, date: date });

        // case 3: When AssignedTo is not empty and open we return a collection “my”, with only users: AssignedTo
        // if assignedTo is empty we use roles instead
        if (userMails.length > 0) {
          collections.push({ name: "my", users: userMails, roles: [], date: date });
        } else {
          collections.push({ name: "my", users: [], roles: roles, date: date });
        }

        // case 4: When DueDate is provided and open we return a collection “due”, with users and roles; date = DueDate
        collections.push({ name: "due", users: userMails, roles: roles, date: date });

        // case 5: When DueDate is provided and open we return a collection “my-due”, with only users: AssignedTo, date = DueDate
        // if assignedTo is empty we use roles
        if (userMails.length > 0) {
          collections.push({ name: "my-due", users: userMails, roles: [], date: date });
        } else {
          collections.push({ name: "my-due", users: [], roles: roles, date: date });
        }
      }
    }

    activity.Response.Data = { entity: entity, collections: collections };
  } catch (error) {
    $.handleError(activity, error);
  }
};
