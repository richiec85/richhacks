import rss from "@astrojs/rss";
import { getCollection, render } from "astro:content";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import mdxServerRenderer from "@astrojs/mdx/server.js";

export async function GET(context) {
  const posts = (await getCollection("posts", ({ data }) => !data.draft)).sort(
    (a, b) => +b.data.pubDate - +a.data.pubDate,
  );

  // MDX renders to a JSX component, not a plain HTML string, so full-content
  // RSS needs the container API (with the MDX renderer registered) to render
  // each post to a string outside of the normal Astro page pipeline.
  const container = await AstroContainer.create();
  container.addServerRenderer({ name: "astro:jsx", renderer: mdxServerRenderer });
  const items = await Promise.all(
    posts.map(async (post) => {
      const { Content } = await render(post);
      const content = await container.renderToString(Content);
      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link: `/posts/${post.id}/`,
        content,
        categories: [post.data.pillar, ...post.data.tags],
      };
    }),
  );

  return rss({
    title: "RichHacks",
    description: "Field notes on homelab, security and AI from a practitioner's rack.",
    site: context.site,
    items,
  });
}
