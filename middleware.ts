import { proxy } from "./src/proxy";

export const middleware = proxy;

export const config = {
  matcher: "/((?!_next/static|_next/image|tengra_without_text.png).*)",
};
