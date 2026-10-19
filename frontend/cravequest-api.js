(function attachCraveQuestApi(root, factory) {
  const api = factory(root.fetch ? root.fetch.bind(root) : null, root.CRAVEQUEST_API_BASE || '');
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CraveQuestApi = api;
}(typeof window === 'undefined' ? globalThis : window, function createApi(fetchImpl, baseUrl) {
  class ApiClientError extends Error {
    constructor(message, status, code) {
      super(message);
      this.name = 'ApiClientError';
      this.status = status;
      this.code = code;
    }
  }

  async function request(path, options) {
    if (typeof fetchImpl !== 'function') throw new ApiClientError('The browser fetch API is unavailable.');
    let response;
    try {
      response = await fetchImpl(`${baseUrl}${path}`, options);
    } catch {
      throw new ApiClientError('Could not reach CraveQuest. Check that the frontend and backend are running.');
    }
    let body;
    try {
      body = await response.json();
    } catch {
      throw new ApiClientError('CraveQuest returned an unreadable response.', response.status);
    }
    if (!response.ok) {
      const message = body && body.error && typeof body.error.message === 'string'
        ? body.error.message
        : 'The request could not be completed.';
      const code = body && body.error && typeof body.error.code === 'string' ? body.error.code : undefined;
      throw new ApiClientError(message, response.status, code);
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new ApiClientError('CraveQuest returned an unexpected response.', response.status);
    }
    return body;
  }

  function queryString(values) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(values || {})) {
      if (value !== undefined && value !== null && String(value).trim() !== '') params.set(key, String(value));
    }
    const encoded = params.toString();
    return encoded ? `?${encoded}` : '';
  }

  return Object.freeze({
    ApiClientError,
    request,
    listOutlets: () => request('/api/outlets'),
    getOutlet: (outletId) => request(`/api/outlets/${encodeURIComponent(outletId)}`),
    getMenu: (outletId, filters) => request(`/api/outlets/${encodeURIComponent(outletId)}/menu${queryString(filters)}`),
    getDish: (dishId) => request(`/api/dishes/${encodeURIComponent(dishId)}`),
    recommend: (payload) => request('/api/recommendations', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    }),
    parsePreferences: (prompt) => request('/api/ai/parse-preferences', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt }),
    }),
  });
}));
