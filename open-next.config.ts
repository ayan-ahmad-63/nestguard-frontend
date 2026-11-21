import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// buildCommand tells OpenNext how to build Next itself, so that
// `npm run build` can safely be the OpenNext build (no recursion).
export default {
  ...defineCloudflareConfig(),
  buildCommand: "npx next build",
};
