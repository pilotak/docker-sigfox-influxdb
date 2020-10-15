import * as request from 'supertest';
import app from '../server';
import * as crypto from 'crypto';

describe('Invalid requests', () => {
  it('GET', async () => {
    const result = await request(app).get('/');
    expect(result.status).toBe(400);
  });

  it('POST no path', async () => {
    const result = await request(app).post('/');
    expect(result.status).toBe(400);
  });

  it('POST not supported path', async () => {
    const result = await request(app).post('/asdf');
    expect(result.status).toBe(400);
  });

  it('POST with query params', async () => {
    const result = await request(app).post('/uplink').query({ name: 'test param' });
    expect(result.status).toBe(400);
  });

  it('POST with different Content-Type', async () => {
    const result = await request(app).post('/uplink').set('Content-Type', ' application/x-www-form-urlencoded');
    expect(result.status).toBe(400);
  });
});

describe('Invalid requests', () => {
  it('Invalid JSON', async () => {
    const result = await request(app).post('/uplink').set('Content-Type', ' application/json').send('"key": "value');
    expect(result.status).toBe(405);
  });

  it('Too much data', async () => {
    let errorCode: string;
    const data = crypto.randomBytes(1e6).toString('base64').slice(0, 1e6);

    await request(app)
      .post('/uplink')
      .set('Content-Type', 'application/json')
      .send(data)
      .catch((res) => {
        errorCode = res.code;
      })
      .then(() => {
        expect(errorCode).toBe('ECONNRESET');
      });
  });
});
