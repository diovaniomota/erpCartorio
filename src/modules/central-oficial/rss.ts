export type RSSItem = {
  titulo: string;
  link: string;
  descricao: string;
  publicado_em: string | null;
  orgao: string;
  fonte: string;
};

type FeedSource = { orgao: string; nome: string; url: string; revalidate?: number };

const FEEDS: FeedSource[] = [
  // Confirmados pelo research
  { orgao: "STF",  nome: "STF",  url: "http://www.stf.jus.br/portal/rss/rss.asp",            revalidate: 1800 },
  { orgao: "STJ",  nome: "STJ",  url: "https://res.stj.jus.br/hrestp-c-portalp/RSS.xml",     revalidate: 1800 },
  // Tentativas (WordPress / CMS comuns)
  { orgao: "CNJ",  nome: "CNJ",  url: "https://www.cnj.jus.br/feed/",                         revalidate: 1800 },
  { orgao: "TJSC", nome: "TJSC", url: "https://www.tjsc.jus.br/noticias/rss",                 revalidate: 1800 },
];

// ── XML helpers ───────────────────────────────────────────────────────────────

function cdata(xml: string): string {
  return xml.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

function extractTag(block: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m  = block.match(re);
  if (!m) return "";
  return cdata(m[1]).replace(/\s+/g, " ").trim();
}

function extractLink(block: string): string {
  // <link> in RSS is often between tags OR as text node after </title>
  const m1 = block.match(/<link[^>]*>([^<]+)<\/link>/i);
  if (m1) return m1[1].trim();
  // Atom style
  const m2 = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?>/i);
  if (m2) return m2[1].trim();
  // guid as fallback
  return extractTag(block, "guid");
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function normalizeDate(raw: string): string | null {
  if (!raw) return null;
  try {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d.toISOString();
  } catch {}
  return null;
}

// ── Per-feed fetcher ──────────────────────────────────────────────────────────

async function fetchFeed(source: FeedSource): Promise<RSSItem[]> {
  try {
    const res = await fetch(source.url, {
      next: { revalidate: source.revalidate ?? 1800 },
      headers: {
        "User-Agent": "Mozilla/5.0 CartórioHub/1.0 (RSS Reader)",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
    });

    if (!res.ok) return [];

    const xml = await res.text();

    // Support both RSS <item> and Atom <entry>
    const itemRe = /<(?:item|entry)[^>]*>([\s\S]*?)<\/(?:item|entry)>/gi;
    const items: RSSItem[] = [];
    let match: RegExpExecArray | null;

    while ((match = itemRe.exec(xml)) !== null) {
      const block = match[1];
      const titulo = stripHtml(extractTag(block, "title"));
      if (!titulo) continue;

      const descricao = stripHtml(
        extractTag(block, "description") ||
        extractTag(block, "summary") ||
        extractTag(block, "content:encoded"),
      ).slice(0, 300);

      const pubRaw =
        extractTag(block, "pubDate") ||
        extractTag(block, "published") ||
        extractTag(block, "dc:date") ||
        extractTag(block, "updated");

      items.push({
        titulo,
        link:        extractLink(block),
        descricao,
        publicado_em: normalizeDate(pubRaw),
        orgao:  source.orgao,
        fonte:  source.nome,
      });

      if (items.length >= 15) break;
    }

    return items;
  } catch {
    return [];
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getLiveOfficialFeed(): Promise<RSSItem[]> {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));

  return results
    .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .sort((a, b) => {
      if (!a.publicado_em && !b.publicado_em) return 0;
      if (!a.publicado_em) return 1;
      if (!b.publicado_em) return -1;
      return new Date(b.publicado_em).getTime() - new Date(a.publicado_em).getTime();
    });
}

export async function getLiveFeedByOrg(): Promise<Record<string, RSSItem[]>> {
  const all = await getLiveOfficialFeed();
  return all.reduce<Record<string, RSSItem[]>>((acc, item) => {
    acc[item.orgao] = acc[item.orgao] ?? [];
    acc[item.orgao].push(item);
    return acc;
  }, {});
}
