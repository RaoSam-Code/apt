const request = require('supertest');
const app = require('./index');

describe('Backend API', () => {
  describe('GET /', () => {
    it('should return a status message', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBe('Aptos Visual Builder Backend Running');
    });
  });

  describe('POST /deploy-graph', () => {
    it('should return 400 when request body is missing', async () => {
      const res = await request(app).post('/deploy-graph').send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 when graph nodes are missing', async () => {
      const res = await request(app)
        .post('/deploy-graph')
        .send({ ownerAddress: '0x1', graph: {} });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 when ownerAddress is missing', async () => {
      const res = await request(app)
        .post('/deploy-graph')
        .send({ graph: { nodes: [] } });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});
