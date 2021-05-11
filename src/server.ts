import { createServer } from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import { parseData, saveData } from './utils';

const port = parseInt(process.env.PORT || '8080', 10);
const host = process.env.HOST || '0.0.0.0';

const app = createServer((req: IncomingMessage, res: ServerResponse) => {
  try {
    if (req.method !== 'POST') {
      throw new Error('Only POST is allowed');
    }

    if (req.url === undefined) {
      res.writeHead(404);
      res.end();
      throw new Error('URL undefined');
    }
    console.log(req.url, req.headers.host);
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname !== '/uplink' && url.pathname !== '/test') {
      throw new Error('Unsupported path');
    }

    if (url.searchParams.toString().length > 0) {
      throw new Error('No query parameters are allowed');
    }

    if (req.headers['content-type'] !== 'application/json') {
      throw new Error('Only JSON content-type is allowed');
    }

    let data = '';

    req.on('data', async (chunk) => {
      data += chunk.toString();

      // flood attack or faulty client
      if (data.length >= 1e6) {
        req.destroy();
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

      // catch error code
      if (typeof ret !== 'number') {
        ret = await saveData(ret);
      }

      // return success/error code
      res.writeHead(ret);
      res.end();
    });
  } catch (err) {
    res.writeHead(400);
    res.end();
    console.error(err.toString());
  }
});

app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

export default app;
