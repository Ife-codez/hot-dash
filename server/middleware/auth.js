import jwt from 'jsonwebtoken';

export default defineEventHandler((event) => {
  const token = getCookie(event, 'auth_token');
  const config = useRuntimeConfig();

  if (token) {
    try {
      const decoded = jwt.verify(token, config.authSecret);
      event.context.user = decoded; // Store on server context
    } catch {
      event.context.user = null;
    }
  } else {
    event.context.user = null;
  }
});
