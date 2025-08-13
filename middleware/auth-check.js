// middleware/auth.global.js (or any name, registered as a Nuxt route middleware)
export default defineNuxtRouteMiddleware((to) => {
  if (process.server) {
    const user = useRequestEvent()?.context.user;

    // If no user and trying to access protected routes
    if (!user && (to.path.startsWith('/user') || to.path.startsWith('/admin'))) {
      return navigateTo('/login');
    }

    // Role-based checks
    if (to.path.startsWith('/admin') && user?.role !== 'admin') {
      return navigateTo('/signup');
    }

    if (to.path.startsWith('/user') && user?.role !== 'diner') {
      return navigateTo('/signup');
    }
  }
});
