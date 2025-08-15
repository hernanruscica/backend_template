import request from 'supertest';
import app from '../src/app.js';

describe('GET /', () => {
  it('should respond with "API is running..."', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('API is running...');
  });
});
