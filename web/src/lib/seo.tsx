import { SITE } from "./site";

/** Renders JSON-LD safely (escapes "<" so no script injection via data). */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

export const orgSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/icon.svg`,
  email: SITE.contactEmail,
  sameAs: [`https://t.me/${SITE.channel}`],
});

export const websiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  url: SITE.url,
});

export const faqSchema = (items: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
});

export const breadcrumbSchema = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((i, n) => ({ "@type": "ListItem", position: n + 1, name: i.name, item: `${SITE.url}${i.path}` })),
});

export const articleSchema = (a: { title: string; slug: string; summary: string; published_at: string; reviewer: string }) => ({
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  headline: a.title,
  description: a.summary,
  datePublished: a.published_at,
  dateModified: a.published_at,
  mainEntityOfPage: `${SITE.url}/blog/${a.slug}`,
  image: `${SITE.url}/blog/${a.slug}/opengraph-image`,
  author: { "@type": "Organization", name: "GeeksFinder Desk", url: `${SITE.url}/editorial-policy` },
  editor: { "@type": "Person", name: a.reviewer },
  publisher: { "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: `${SITE.url}/icon.svg` } },
});

/** Google JobPosting — only for public pages with full description + direct apply link. */
export const jobPostingSchema = (j: {
  title: string;
  company: string;
  description: string;
  posted_at: string | null;
  location: string | null;
  remote: boolean | null;
  apply_url: string | null;
}) => {
  const posted = j.posted_at ? new Date(j.posted_at) : new Date();
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: j.title,
    description: j.description,
    datePosted: posted.toISOString(),
    validThrough: new Date(posted.getTime() + 30 * 86_400_000).toISOString(),
    hiringOrganization: { "@type": "Organization", name: j.company },
    ...(j.remote
      ? { jobLocationType: "TELECOMMUTE", applicantLocationRequirements: { "@type": "Country", name: "India" } }
      : { jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: (j.location ?? "").split(",")[0], addressCountry: "IN" } } }),
    directApply: false,
    ...(j.apply_url ? { url: j.apply_url } : {}),
  };
};
