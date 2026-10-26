import { Layout } from "./Layout";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { Metrics } from "./Metrics";
import { Projects } from "./Projects";
import { Skills } from "./Skills";
import { Experience } from "./Experience";
import { Contact } from "./Contact";

export interface LandingPageProps {
  locale: "zh" | "en";
  t: any;
  url: string;
}

export function LandingPage({ locale, t, url }: LandingPageProps) {
  const title =
    locale === "zh"
      ? "黃冠傑 (Jay) | 資深前端工程師 • 全端架構師 Portfolio"
      : "Jay Huang | Senior Frontend Engineer • Fullstack Architect Portfolio";

  const description =
    locale === "zh"
      ? "超過 6 年前端與全端架構開發經驗，專注於 React、TypeScript、HTML5 Canvas OOP、Web Audio API、AI Agent 工作流與邊緣運算 Cloudflare Workers 架構。"
      : "Senior Frontend Engineer & Fullstack Architect with 6+ years experience specializing in React, TypeScript, Canvas OOP, Web Audio API, AI Agent workflows, and edge computing.";

  return (
    <Layout title={title} description={description} locale={locale} url={url}>
      <Navbar locale={locale} t={t} />
      <main>
        <Hero t={t} />
        <Metrics t={t} />
        <Projects t={t} />
        <Skills t={t} />
        <Experience t={t} />
      </main>
      <Contact t={t} />
    </Layout>
  );
}
