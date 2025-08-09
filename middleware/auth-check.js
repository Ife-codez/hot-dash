export default defineNuxtRouteMiddleware((to) => {
  if (process.server) {
    const user = useRequestEvent()?.context.user;
    if (!user && to.path.startsWith('/user')) {
      return navigateTo('/login');
    }
  }
});
