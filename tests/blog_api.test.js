const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');

const api = supertest(app);
const Blog = require('../models/blog');
const User = require('../models/user');

const initialBlogs = [
    {
        title : 'Christmas',
        author : 'Santa',
        url : 'http://awesome.com',
        likes: 1
    },
    {
        title : 'Naturaleza',
        author : 'Felix',
        url : 'http://felixnat.com',
        likes: 10
    },
];

let token = '';

beforeAll( async () => {

    const user = {
        'username' : 'test',
        'password' : 'PasswordDePuma',
        'name' : 'El señor puma',
        'blogs' : []
    };

    const userResults = await User.find( { 'username' : user.username } );
    if (userResults.length > 0 ){
        const userDb = userResults[0];
        console.log(userDb);
        console.log('url::', '/api/users/' + userDb._id);
        await api.delete('/api/users/' + userDb._id).expect(200);
    }

    await api.post('/api/users', user).send(user).expect(201);

    const loginResponse = await api.post('/api/login', user).send(user).expect(200);

    token = loginResponse.body.token;

});

beforeEach(async () => {
    await Blog.deleteMany({});

    let blogObject = new Blog(initialBlogs[0]);
    await blogObject.save();

    blogObject = new Blog(initialBlogs[1]);
    await blogObject.save();
});

describe('get requests', () => {

    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/);
    });


    test('there are two blogs', async () => {
        const response = await api.get('/api/blogs');

        expect(response.body).toHaveLength(2);
    });

    test('a specific blog is within the returned blogs', async () => {
        const response = await api.get('/api/blogs');

        const contents = response.body.map(r => r.author);

        expect(contents).toContain(
            'Felix'
        );
    });
});

describe('blogs structure', () => {
    test('blogs have id property defined', async () => {
        const response = await api.get('/api/blogs');

        expect(response.body[0]['id']).toBeDefined();
    });
});

describe('create requests', () => {

    test('create a blog works', async () => {

        const newBlog =
            {
                title : 'Summer',
                author : 'Cat',
                url : 'http://estrella.com',
                likes: 1
            };


        await api.post('/api/blogs')
            .set('Authorization', 'bearer ' + token)
            .send(newBlog)
            .expect(201);

        const dbResponse = await Blog.find( { 'title':'Summer' } );

        expect(dbResponse[0]).toBeDefined();
    });

    test('create a blog without likes info defaults to likes = 0', async () => {
        const newBlog =
            {
                title : 'Opera',
                author : 'Figaro',
                url : 'http://teatro.com'
            };


        await api
            .post('/api/blogs', newBlog)
            .set('Authorization', 'bearer ' + token)
            .send(newBlog)
            .expect(201);

        await api.get('/api/blogs').expect(200);

        const dbResponse = await Blog.findOne( { 'title':'Opera' } );
        expect(dbResponse['likes']).toBe(0);
    });

    test('trying to create a blog without title or url results in a 400 Bad Request error', async () => {
        const newBlog =
            {
                author : 'Puma'
            };


        await api
            .post('/api/blogs', newBlog)
            .set('Authorization', 'bearer ' + token)
            .send(newBlog)
            .expect(400);

    });
});

describe('delete requests', () => {

    test('delete a blog works', async () => {

        let response = await api.get('/api/blogs').expect(200);

        const initialLength = response.body.length;

        await api.delete('/api/blogs/' + response.body[0]['id']).expect(200);

        response = await api.get('/api/blogs').expect(200);

        expect(response.body).toHaveLength(initialLength - 1);
    });
});

describe('put requests', () => {

    test('update a blog works', async () => {

        const newBlogInfo =
        {
            title : 'Christmas',
            author : 'Santa',
            url : 'http://awesome.com',
            likes: 20
        };

        let response = await api.get('/api/blogs').expect(200);

        await api.put('/api/blogs/' + response.body[0]['id']).send(newBlogInfo).expect(200);

        response = await api.get('/api/blogs').expect(200);

        expect(response.body[0]['likes']).toBe(20);
    });
});


afterAll(() => {
    mongoose.connection.close();
});