import { createServer, IncomingMessage, ServerResponse } from 'http';
import { parse as parseUrl } from 'url';
import { parseData, saveData } from './utils';

const port = parseInt(process.env.PORT || '8080', 10);
const host = process.env.HOST || '0.0.0.0';

const requestListener = (req: IncomingMessage, res: ServerResponse) => {
  try {
    if (req.method !== 'POST') {
      throw new Error('Only POST is allowed');
    }

    if (req.url === undefined) {
      throw new Error('URL undefined');
    }

    const url = parseUrl(req.url, true);

    if (url.pathname !== '/uplink' && url.pathname !== '/test') {
      throw new Error('Unsupported path');
    }

    if (Object.keys(url.query).length > 0) {
      throw new Error('No query parameters are allowed');
    }

    if (req.headers['content-type'] !== 'application/json') {
      throw new Error('Only JSON content-type is allowed');
    }

    let data = '';

    req.on('data', async (chunk) => {
      data += chunk.toString();

      // flood attack or faulty client
      if (data.length > 1e6) {
        req.connection.destroy();
      }
    });

    req.on('end', async () => {
      let json = undefined;

      try {
        // parse request to JSON
        json = JSON.parse(data);
      } catch (parseError) {
        res.writeHead(405);
        res.end();
        console.error('Body data are not JSON', parseError);
        return;
      }

      // parse
      let ret = parseData(json);

      switch (url.pathname) {
        case '/uplink':
          // save
          if (typeof ret !== 'number') {
            ret = await saveData(ret);
          }

          // return success/error code
          res.writeHead(ret);
          break;

        case '/test':
          if (typeof ret !== 'number') {
            res.setHeader('Content-Type', 'application/json');
            res.write(JSON.stringify(ret));
          } else {
            res.writeHead(ret);
          }
          break;
        default:
          ret = 404;
          break;
      }

      res.end();
    });
  } catch (err) {
    res.writeHead(400);
    res.end();
    console.error(err.toString());
  }
};

const server = createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
