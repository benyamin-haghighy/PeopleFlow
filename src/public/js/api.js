
(function () {
  const API_BASE = '/api/v1';
  const USER_KEY = 'hr_user';

  let accessToken = null;
  let refreshPromise = null;
  let refreshTimer = null;

  function readUser() {
    try {
      return JSON.parse(sessionStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  }

  function saveUser(user) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearSession() {
    accessToken = null;

    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }

    refreshTimer = null;
    sessionStorage.removeItem(USER_KEY);
  }

  function expireSession() {
    clearSession();

    if (!['/login', '/register'].includes(location.pathname)) {
      location.replace('/login?expired=1');
    }
  }

  async function readBody(response) {
    const text = await response.text();

    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  }

  function unwrap(body) {
    if (
      body &&
      body.success === true &&
      Object.prototype.hasOwnProperty.call(body, 'data')
    ) {
      return body.data;
    }

    return body;
  }

  function errorMessage(body, fallback) {
    const result = unwrap(body);
    const message = result?.message;

    return Array.isArray(message)
      ? message.join('، ')
      : message || fallback || 'خطایی رخ داد';
  }

  function scheduleRefresh() {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }

    refreshTimer = setTimeout(() => {
      refreshAccessToken().catch(() => expireSession());
    }, 14 * 60 * 1000);
  }

  async function refreshAccessToken() {
    if (refreshPromise) {
      return refreshPromise;
    }

    const user = readUser();

    if (!user?.id) {
      throw new Error('نشست کاربری پیدا نشد');
    }

    refreshPromise = (async () => {
      const response = await fetch(
        `${API_BASE}/auth/refresh/user/${encodeURIComponent(user.id)}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        },
      );

      const body = unwrap(await readBody(response));

      if (!response.ok || !body?.accessToken) {
        throw new Error(
          errorMessage(body, 'نشست شما منقضی شده است'),
        );
      }

      accessToken = body.accessToken;
      scheduleRefresh();

      return accessToken;
    })();

    try {
      return await refreshPromise;
    } finally {
      refreshPromise = null;
    }
  }

  async function request(path, options = {}, canRetry = true) {
    const headers = new Headers(options.headers || {});

    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    headers.set('Accept', 'application/json');

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    const body = await readBody(response);

    if (
      response.status === 401 &&
      canRetry &&
      !path.startsWith('/auth/refresh')
    ) {
      try {
        await refreshAccessToken();
        return request(path, options, false);
      } catch (error) {
        expireSession();
        throw error;
      }
    }

    if (!response.ok) {
      throw new Error(
        errorMessage(body, `خطای سرور (${response.status})`),
      );
    }

    return unwrap(body);
  }

  function setAuthenticated(user, token) {
    const safeUser = {
      id: user.id,
      role: user.role,
      name: user.name,
      phone: user.phone,
      groupId: user.groupId,
    };

    saveUser(safeUser);
    accessToken = token;
    scheduleRefresh();
  }

  function getUser() {
    return readUser();
  }

  function getToken() {
    return accessToken;
  }

  window.HRApi = {
    base: API_BASE,
    request,
    get: (path) => request(path, { method: 'GET' }),
    post: (path, data) =>
      request(path, {
        method: 'POST',
        body: JSON.stringify(data ?? {}),
      }),
    patch: (path, data) =>
      request(path, {
        method: 'PATCH',
        body: JSON.stringify(data ?? {}),
      }),
    delete: (path) => request(path, { method: 'DELETE' }),
    setAuthenticated,
    refreshAccessToken,
    getUser,
    getToken,
    clearSession,
    expireSession,
  };
})();
