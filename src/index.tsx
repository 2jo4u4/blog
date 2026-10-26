import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { LandingPage } from "./components/LandingPage";
import translations from "./lib/i18n.json";

export interface Env {
  // D1 and other bindings will be extended in subsequent tickets
  DB?: D1Database;
}

const app = new Hono<{ Bindings: Env }>();

app.get("/health", (c) => {
  return c.json({ status: "ok", runtime: "edge-hono" });
});

app.get("/", (c) => {
  const queryLang = c.req.query("lang");
  const cookieLang = getCookie(c, "portfolio-locale");

  let locale: "zh" | "en" = "zh";
  if (queryLang === "en" || (!queryLang && cookieLang === "en")) {
    locale = "en";
  }

  const t = locale === "en" ? translations.en : translations.zh;

  return c.html(<LandingPage locale={locale} t={t} url={c.req.url} />);
});

export default app;
