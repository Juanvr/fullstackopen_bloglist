const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');

const api = supertest(app);
const User = require('../models/user');

// const initialUsers = [
//     {
//         username : 'Christmas',
//         password : 'Santa',
//         name : 'http://awesome.com'
//     },
//     {
//         username : 'Puma',
//         password : 'Santa',
//         name : 'http://awesome.com'
//     }
// ];

beforeEach(async () => {
    await User.deleteMany({});

    const rootUser = {
        username : 'root',
        password : 'RootPassword',
        name : 'Admin'
    };

    let userObject = new User( rootUser );
    await userObject.save();
});

describe('create new user works', () => {
    test('a new user is created', async () => {
        const newUser = {
            username : 'Puma',
            password : 'PasswordDePuma',
            name : 'El señor puma'
        };

        const response = await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/);

        console.log(response.body);

        const userMongo = await User.findById(response.body.id);
        console.log('response mongo', userMongo);
        expect(userMongo).toHaveProperty('username');
    });

    test('creation without username returns 400', async () => {
        const newUser = {
            password : 'PasswordDePuma',
            name : 'El señor puma'
        };

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400);
    });

    test('creation without password returns 400', async () => {
        const newUser = {
            username : 'PasswordDePuma',
            name : 'El señor puma'
        };

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400);
    });

    test('creation of same user fails', async () => {
        const newUser = {
            username : 'root',
            password : 'PasswordDePuma',
            name : 'El señor puma'
        };

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400);

        expect(result.text).toContain('User already exists');
    });

});

afterAll(() => {
    mongoose.connection.close();
});