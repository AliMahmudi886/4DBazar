export const sitePath = (route: string) => import.meta.env.BASE_URL + route.replace(/^\//, "");

export const sitePathname = () => "/" + window.location.pathname.slice(import.meta.env.BASE_URL.length);
