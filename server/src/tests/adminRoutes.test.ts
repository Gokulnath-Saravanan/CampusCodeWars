import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import { connect, disconnect } from '../config/database';
import { User } from '../models/User';
import { generateToken } from '../utils/auth';

describe('Admin Routes', () => {
  let adminToken: string;
  let userToken: string;

  beforeEach(async () => {
    await connect();
    
    // Create admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
    });
    adminToken = generateToken(admin._id);

    // Create regular user
    const user = await User.create({
      username: 'user',
      email: 'user@test.com',
      password: 'password123',
      role: 'user',
    });
    userToken = generateToken(user._id);
  });

  afterEach(async () => {
    await User.deleteMany({});
    await disconnect();
  });

  describe('GET /api/admin/users', () => {
    it('should allow admin to get all users', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);
    });

    it('should not allow regular user to get all users', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/admin/users/:id', () => {
    it('should allow admin to update user', async () => {
      const user = await User.findOne({ role: 'user' });
      const res = await request(app)
        .put(`/api/admin/users/${user?._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'admin',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe('admin');
    });

    it('should not allow regular user to update users', async () => {
      const user = await User.findOne({ role: 'user' });
      const res = await request(app)
        .put(`/api/admin/users/${user?._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          role: 'admin',
        });

      expect(res.status).toBe(403);
    });
  });
}); 