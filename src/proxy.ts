import { proxy as proxyHandler } from "./middleware-logic";

export const proxy = proxyHandler;

export const config = {
  matcher: "/((?!_next/static|_next/image|tengra_without_text.png).*)",
};
