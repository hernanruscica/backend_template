import request from 'supertest';
import app from '../src/app.js';
import { BusinessModel } from '../src/models/businessModel.js';
import { UserModel } from '../src/models/userModel.js';
import { RoleModel } from '../src/models/roleModel.js';
import jwt from 'jsonwebtoken';
import pool from '../src/config/database.js';

describe.skip('Permissions and Ownership', () => {
  let ownerToken;
  let adminToken;
  let userToken;
  let businessUuid;
  let userUuid;
  let ownerUser; // Renamed to avoid conflict with the 'owner' role string
  let tempUser;
  let counter = 1;

  beforeAll(async () => {
    // Create roles if they don't exist
    const ownerRole = await RoleModel.findByName('owner');
    if (!ownerRole) {
      await RoleModel.create({ name: 'owner', hierarchy_level: 0 });
    }
    const adminRole = await RoleModel.findByName('admin');
    if (!adminRole) {
      await RoleModel.create({ name: 'admin', hierarchy_level: 1 });
    }
    const userRole = await RoleModel.findByName('Read-only User');
    if (!userRole) {
      await RoleModel.create({ name: 'Read-only User', hierarchy_level: 2 });
    }
  });

  beforeEach(async () => {
    // Create a temporary user to be the creator of the owner user
    tempUser = await UserModel.create({
        firstName: 'Temp',
        lastName: 'User',
        email: `temp_user_${counter}@test.com`,
        password: 'password',
        phone: '1234567890',
        dni: `temp_dni_${counter++}`, // Ensure DNI is unique
        address: {
            street: '123 Temp St',
            city: 'Tempville',
            state: 'TS',
            country: 'Templand',
            zip_code: '12345',
        },
        createdBy: null,
    });

    // Create users
    ownerUser = await UserModel.create({
      firstName: 'Owner',
      lastName: 'User',
      email: `owner${counter}@test.com`,
      password: 'password',
      phone: '1234567890',
      dni: `owner_dni_${counter++}`, // Ensure DNI is unique
      address: {
        street: '123 Owner St',
        city: 'Ownerville',
        state: 'OS',
        country: 'Ownerland',
        zip_code: '12345',
      },
      createdBy: tempUser.uuid,
    });

    // Create a business
    const business = await BusinessModel.create({
      name: 'Test Business',
      description: 'A business for testing',
      phone: '1234567890',
      email: 'business@test.com',
      address: {
        street: '123 Test St',
        city: 'Testville',
        state: 'TS',
        country: 'Testland',
        zip_code: '12345',
      },
      createdBy: ownerUser.uuid,
    });
    businessUuid = business.uuid;

    await BusinessModel.addUser(businessUuid, ownerUser.uuid, (await RoleModel.findByName('owner')).uuid, ownerUser.uuid);
    ownerToken = jwt.sign({ uuid: ownerUser.uuid, roles: ['owner'] }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const admin = await UserModel.create({
      firstName: 'Admin',
      lastName: 'User',
      email: `admin${counter}@test.com`,
      password: 'password',
      phone: '1234567890',
      dni: `admin_dni_${counter++}`, // Ensure DNI is unique
      address: {
        street: '123 Admin St',
        city: 'Adminville',
        state: 'AS',
        country: 'Adminland',
        zip_code: '12345',
      },
      createdBy: ownerUser.uuid,
    });
    await BusinessModel.addUser(businessUuid, admin.uuid, (await RoleModel.findByName('admin')).uuid, ownerUser.uuid);
    adminToken = jwt.sign({ uuid: admin.uuid, roles: ['admin'] }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const user = await UserModel.create({
      firstName: 'Regular',
      lastName: 'User',
      email: `user${counter}@test.com`,
      password: 'password',
      phone: '1234567890',
      dni: `user_dni_${counter++}`, // Ensure DNI is unique
      address: {
        street: '123 User St',
        city: 'Userville',
        state: 'US',
        country: 'Userland',
        zip_code: '12345',
      },
      createdBy: ownerUser.uuid,
    });
    userUuid = user.uuid;
    await BusinessModel.addUser(businessUuid, user.uuid, (await RoleModel.findByName('Read-only User')).uuid, ownerUser.uuid);
    userToken = jwt.sign({ uuid: user.uuid, roles: ['Read-only User'] }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterEach(async () => {
    // Clean up database
    try {
        // First, remove all users from businesses
        const allUsers = await UserModel.findAll();
        for (const user of allUsers) {
            const userBusinesses = user.businesses_roles;
            for (const bu of userBusinesses) {
                await BusinessModel.removeUser(bu.business_uuid, user.uuid);
            }
        }

        // Then hard delete all users
        for (const user of allUsers) {
            await UserModel.hardDelete(user.uuid);
        }

        // Then hard delete all businesses
        const allBusinesses = await BusinessModel.findAll();
        for (const business of allBusinesses) {
            await BusinessModel.hardDelete(business.uuid);
        }
    } catch (error) {
        console.error('Error cleaning up database:', error);
    }
  });

  afterAll(async () => {
    // Truncate tables in the correct order to avoid foreign key constraints
    await BusinessModel.truncate();
    await UserModel.truncate();
    await RoleModel.truncate();
    await pool.end();
  });

  it('should not allow a user to see users from another business', async () => {
    const anotherBusiness = await BusinessModel.create({
      name: 'Another Business',
      description: 'Another business for testing',
      phone: '1234567890',
      email: 'another@test.com',
      address: {
        street: '123 Another St',
        city: 'Anotherville',
        state: 'AS',
        country: 'Anotherland',
        zip_code: '12345',
      },
      createdBy: ownerUser.uuid,
    });
    const anotherUser = await UserModel.create({
        firstName: 'Another',
        lastName: 'User',
        email: `another${counter}@test.com`,
        password: 'password',
        phone: '1234567890',
        dni: `another_dni_${counter++}`, // Ensure DNI is unique
        address: {
            street: '123 Another St',
            city: 'Anotherville',
            state: 'AS',
            country: 'Anotherland',
            zip_code: '12345',
        },
        createdBy: ownerUser.uuid,
    });
    await BusinessModel.addUser(anotherBusiness.uuid, anotherUser.uuid, (await RoleModel.findByName('user')).uuid, ownerUser.uuid);

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.users).toHaveLength(3);
    expect(res.body.users.some(u => u.email === 'another@test.com')).toBe(false);
  });

  it('should not allow a user to view a user from another business by uuid', async () => {
    const anotherBusiness = await BusinessModel.create({
      name: 'Yet Another Business',
      description: 'Yet another business for testing',
      phone: '1234567890',
      email: 'yetanother@test.com',
      address: {
        street: '456 Another St',
        city: 'Yetanotherville',
        state: 'YAS',
        country: 'Yetanotherland',
        zip_code: '67890',
      },
      createdBy: ownerUser.uuid,
    });
    const anotherUser = await UserModel.create({
        firstName: 'Yet',
        lastName: 'Another',
        email: `yetanother${counter}@test.com`,
        password: 'password',
        phone: '0987654321',
        dni: `yetanother_dni_${counter++}`, // Ensure DNI is unique
        address: {
            street: '456 Another St',
            city: 'Yetanotherville',
            state: 'YAS',
            country: 'Yetanotherland',
            zip_code: '67890',
        },
        createdBy: ownerUser.uuid,
    });
    await BusinessModel.addUser(anotherBusiness.uuid, anotherUser.uuid, (await RoleModel.findByName('user')).uuid, ownerUser.uuid);

    const res = await request(app)
      .get(`/api/users/${anotherUser.uuid}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(403);
    expect(res.body.message).toEqual('You can only view users within your own business.');
  });

  it('should not allow a user to update a user from another business', async () => {
    const anotherBusiness = await BusinessModel.create({
      name: 'Third Business',
      description: 'Third business for testing',
      phone: '1112223333',
      email: 'third@test.com',
      address: {
        street: '789 Third St',
        city: 'Thirdville',
        state: 'TS',
        country: 'Thirdland',
        zip_code: '11223',
      },
      createdBy: ownerUser.uuid,
    });
    const anotherUser = await UserModel.create({
        firstName: 'Third',
        lastName: 'User',
        email: `third${counter}@test.com`,
        password: 'password',
        phone: '3332221111',
        dni: `third_dni_${counter++}`, // Ensure DNI is unique
        address: {
            street: '789 Third St',
            city: 'Thirdville',
            state: 'TS',
            country: 'Thirdland',
            zip_code: '11223',
        },
        createdBy: ownerUser.uuid,
    });
    await BusinessModel.addUser(anotherBusiness.uuid, anotherUser.uuid, (await RoleModel.findByName('user')).uuid, ownerUser.uuid);

    const res = await request(app)
      .put(`/api/users/${anotherUser.uuid}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ firstName: 'UpdatedThird' });

    expect(res.statusCode).toEqual(403);
    expect(res.body.message).toEqual('You can only update users within your own business.');
  });

  it('should not allow a user to soft delete a user from another business', async () => {
    const anotherBusiness = await BusinessModel.create({
      name: 'Fourth Business',
      description: 'Fourth business for testing',
      phone: '4445556666',
      email: 'fourth@test.com',
      address: {
        street: '101 Fourth St',
        city: 'Fourthville',
        state: 'FS',
        country: 'Fourthland',
        zip_code: '44556',
      },
      createdBy: ownerUser.uuid,
    });
    const anotherUser = await UserModel.create({
        firstName: 'Fourth',
        lastName: 'User',
        email: `fourth${counter}@test.com`,
        password: 'password',
        phone: '6665554444',
        dni: `fourth_dni_${counter++}`, // Ensure DNI is unique
        address: {
            street: '101 Fourth St',
            city: 'Fourthville',
            state: 'FS',
            country: 'Fourthland',
            zip_code: '44556',
        },
        createdBy: ownerUser.uuid,
    });
    await BusinessModel.addUser(anotherBusiness.uuid, anotherUser.uuid, (await RoleModel.findByName('user')).uuid, ownerUser.uuid);

    const res = await request(app)
      .delete(`/api/users/${anotherUser.uuid}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(403);
    expect(res.body.message).toEqual('You can only delete users within your own business.');
  });

  it('should allow an admin to soft delete a user', async () => {
    const res = await request(app)
      .delete(`/api/users/${userUuid}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);

    const user = await UserModel.findByUuid(userUuid);
    expect(user.is_active).toBe(false);
  });

  it('should allow an owner to hard delete a user', async () => {
    const res = await request(app)
      .delete(`/api/users/${userUuid}/hard`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.statusCode).toEqual(200);

    const user = await UserModel.findByUuid(userUuid);
    expect(user).toBeUndefined();
  });
});
