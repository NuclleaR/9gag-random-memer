import { createServer, IncomingMessage, ServerResponse } from 'http';
import { buildUrl, getRandomInt } from './utils';

const host = "https://9gag.com/v1/tag-posts/tag/:tag/type/:type"

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  console.log(req.url);

  if (!req.url?.startsWith('/tag/')) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  const parts = req.url.split('/');

  const reqData = {
    tag: parts[2],
    type: parts[3] || 'fresh',
  }

  res.setHeader('Content-Type', 'application/json');

  try {
    const response = await fetch(buildUrl(host, reqData))
    const r = await response.json() as NineGagReqponse;

    console.log(r.data.posts);

    const post = r.data.posts[getRandomInt(0, r.data.posts.length - 1)];

    if (req.url.endsWith('json')) {
      res.writeHead(200);
      res.end(JSON.stringify(post));
      return;
    }

    let url: string;

    if (post.type == 'Photo') {
      url = post.images.image700.webpUrl
    } else {
      url = post.images.image460sv?.url || post.images.image700.url;
    }

    const imgRes = await fetch(url);

    console.log(imgRes.headers);

    const img = await imgRes.arrayBuffer();

    ['content-type', 'content-length', 'connection', 'cache-control', 'expires', 'etag', 'x-cache', 'accept-ranges', 'vary'].forEach(key => {
      const reader = imgRes.headers.get(key);
      if (reader) {
        res.setHeader(key, reader);
      }
    })

    res.writeHead(200);
    res.end(Buffer.from(img));

  } catch (err) {
    console.error(err);
    res.writeHead(400);
    res.end(JSON.stringify(err));
  }
});

server.listen(process.env.PORT || 3000);

// ===============================================================================

type NineGagReqponse = {
  meta: {
    status: string | "Success";
  };
  data: {
    posts: Post[];
  }
}

type Tag = {
  key: string;
  url: string;
}

type Photo = {
  url: string;
  width: number;
  height: number;
  webpUrl: string;
}

type Anmated = {
    width: number;
    height: number;
    url: string;
    hasAudio: 0 | 1;
    duration: number;
    vp8Url: string;
}

type Post = {
  id: string;
  url: string;
  title: string;
  type: "Animated" | "Photo";
  images: {
    image700: Photo;
    image460: Photo;
    imageFbThumbnail: Exclude<Photo, 'webpUrl'>;
    image460sv?: Anmated;
  }
  tags: Tag[];
}