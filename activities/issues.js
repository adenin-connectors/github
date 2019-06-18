'use strict';
const api = require('./common/api');

module.exports = async function (activity) {
  try {
    api.initialize(activity);
    let allIssues = [];
    var dateRange = $.dateRange(activity, "today");
    let page = 1;
    let maxResults = 100;
    let response = await api(`/issues?filter=all&state=all&since=${dateRange.startDate}&page=${page}&per_page=${maxResults}` +
      '&sort:author-date-desc');
    if ($.isErrorResponse(activity, response)) return;
    allIssues.push(...response.body);

    let hasMore = false;
    if (response.body.length == maxResults) {
      hasMore = true;
    }

    while (hasMore) {
      page++;
      response = await api(`/issues?filter=all&state=open&since=${dateRange.startDate}&page=${page}&per_page=${maxResults}` +
        '&sort:author-date-desc');
      if ($.isErrorResponse(activity, response)) return;
      allIssues.push(...response.body);
      if (response.body.length != maxResults) {
        hasMore = false;
      }
    }

    let value = allIssues.length;
    let pagination = $.pagination(activity);
    let pagiantedItems = paginateItems(allIssues, pagination);

    activity.Response.Data.items = api.convertIssues(pagiantedItems);
    activity.Response.Data.title = T(activity, 'All Issues');
    activity.Response.Data.link = 'https://github.com/issues/assigned';
    activity.Response.Data.linkLabel = T(activity, 'All Issues');
    activity.Response.Data.actionable = value > 0;

    if (value > 0) {
      activity.Response.Data.value = value;
      activity.Response.Data.date = activity.Response.Data.items[0].date;
      activity.Response.Data.color = 'blue';
      activity.Response.Data.description = value > 1 ? T(activity, "You have {0} issues.", value)
        : T(activity, "You have 1 issue.");
    } else {
      activity.Response.Data.description = T(activity, `You have no issues.`);
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};

//** paginate items[] based on provided pagination */
function paginateItems(items, pagination) {
  let pagiantedItems = [];
  const pageSize = parseInt(pagination.pageSize);
  const offset = (parseInt(pagination.page) - 1) * pageSize;

  if (offset > items.length) return pagiantedItems;

  for (let i = offset; i < offset + pageSize; i++) {
    if (i >= items.length) {
      break;
    }
    pagiantedItems.push(items[i]);
  }
  return pagiantedItems;
}