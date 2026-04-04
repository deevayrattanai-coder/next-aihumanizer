"use client";
import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  publishedAt?: string;
  jsonLd?: Record<string, string | number | boolean | Record<string, unknown>>;
}

const SEOHead = ({
  title,
  description,
  canonical,
  ogImage = "https://devaihumanizer.com/og-default.jpg",
  ogType = "website",
  jsonLd,
}: SEOHeadProps) => {
  useEffect(() => {
    document.title = title;

    const setMeta = (property: string, content: string, isName = false) => {
      const attr = isName ? "name" : "property";
      let el = document.querySelector(`meta[${attr}="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description, true);
    setMeta("og:title", title);
    setMeta("og:description", description);
    setMeta("og:type", ogType);
    setMeta("og:image", ogImage);
    setMeta("twitter:card", "summary_large_image", true);
    setMeta("twitter:title", title, true);
    setMeta("twitter:description", description, true);
    setMeta("twitter:image", ogImage, true);

    if (canonical) {
      let link = document.querySelector(
        'link[rel="canonical"]',
      ) as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonical);
    }

    // JSON-LD
    const existingScript = document.querySelector("script[data-seo-jsonld]");
    if (existingScript) existingScript.remove();

    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo-jsonld", "true");
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      const s = document.querySelector("script[data-seo-jsonld]");
      if (s) s.remove();
    };
  }, [title, description, canonical, ogImage, ogType, jsonLd]);

  return null;
};

export default SEOHead;
