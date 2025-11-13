import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  // Work around obnoxious huge header added by SvelteKit that breaks NGINX proxy server
  response.headers.delete('Link');
  return response;
};
