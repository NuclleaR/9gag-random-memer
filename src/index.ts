import http, { IncomingMessage, ServerResponse } from 'http';
import { get } from 'https';

// /tag/programming/fresh

const host = "https://9gag.com/tag"

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  console.log(req.url);

  if (!req.url?.startsWith('/tag/')) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  const tagUrl = req.url.split('tag/')[1];

  // Send request to 9gag to get meme
  const gagReq = get(`${host}/${tagUrl}`, (response) => {
    // init res data
    let str = '';
    // Listen req data and concat
    response.on('data', (data) => {
      str += data;
    });

    // handle request end
    response.on('end', () => {
      console.log(str);
    });
  });

  gagReq.end();

  res.writeHead(200);
  res.end('Hello, World!!!');
});

server.listen(3000);