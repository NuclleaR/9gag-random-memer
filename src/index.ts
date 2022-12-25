import { serve } from "https://deno.land/std@0.167.0/http/server.ts";
import { buildUrl, getRandomInt } from "./utils.ts";

const envPort = Deno.env.get("PORT");

const port = envPort != undefined ? parseInt(envPort, 10) : 8080;

const host = "https://9gag.com/v1/tag-posts/tag/:tag/type/:type";

async function handleRequest(request: Request): Promise<Response> {
  if (!request.url.includes("/tag/")) {
    return new Response("Not Allowed", { status: 405 });
  }

  const parts = request.url.split("/");

  const reqData = {
    tag: parts[4],
    type: parts[5] || "fresh",
  };

  try {
    const response = await fetch(buildUrl(host, reqData));
    const r = await response.json() as NineGagReqponse;

    const post = r.data.posts[getRandomInt(0, r.data.posts.length - 1)];

    if (request.url.endsWith("json")) {
      return new Response(
        JSON.stringify(JSON.stringify(post)),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    let url: string;

    if (post.type == "Photo") {
      url = post.images.image700.webpUrl;
    } else {
      url = post.images.image460sv?.url || post.images.image700.url;
    }

    const imgRes = await fetch(url);

    const img = await imgRes.arrayBuffer();

    const headers = new Headers();

    [
      "content-type",
      "content-length",
      "connection",
      "cache-control",
      "expires",
      "etag",
      "x-cache",
      "accept-ranges",
      "vary",
    ].forEach((key) => {
      const header = imgRes.headers.get(key);
      if (header) {
        headers.append(key, header);
      }
    });

    return new Response(img, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify(err), { status: 400 });
  }
}

console.log(`HTTP webserver running`);
await serve(handleRequest, { port });

// ===============================================================================

type NineGagReqponse = {
  meta: {
    status: string | "Success";
  };
  data: {
    posts: Post[];
  };
};

type Tag = {
  key: string;
  url: string;
};

type Photo = {
  url: string;
  width: number;
  height: number;
  webpUrl: string;
};

type Anmated = {
  width: number;
  height: number;
  url: string;
  hasAudio: 0 | 1;
  duration: number;
  vp8Url: string;
};

type Post = {
  id: string;
  url: string;
  title: string;
  type: "Animated" | "Photo";
  images: {
    image700: Photo;
    image460: Photo;
    imageFbThumbnail: Exclude<Photo, "webpUrl">;
    image460sv?: Anmated;
  };
  tags: Tag[];
};
