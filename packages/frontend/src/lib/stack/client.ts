import { StackClientApp } from "@stackframe/stack";

// The client app typically inherits configuration from the server app
// and uses environment variables automatically
export const stackClientApp = new StackClientApp({
  tokenStore: "nextjs-cookie",
});
