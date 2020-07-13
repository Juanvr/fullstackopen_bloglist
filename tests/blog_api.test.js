const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');

const api = supertest(app);
const Blog = require('../models/blog');

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

beforeEach(async () => {
    await Blog.deleteMany({});

    let blogObject = new Blog(initialBlogs[0]);
    await blogObject.save();

    blogObject = new Blog(initialBlogs[1]);
    await blogObject.save();
});

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

test('blogs have id property defined', async () => {
    const response = await api.get('/api/blogs');

    expect(response.body[0]['id']).toBeDefined();
});


test('create a blog works', async () => {
    const newBlog =
        {
            title : 'Summer',
            author : 'Cat',
            url : 'http://estrella.com',
            likes: 1
        };


    await api.post('/api/blogs').send(newBlog).expect(201);

    const response = await api.get('/api/blogs');
    expect(response.body).toHaveLength(3);

    const dbResponse = await Blog.find( { 'title':'Summer' } );
    expect(dbResponse).toBeDefined();
});

test('create a blog without likes info defaults to likes = 0', async () => {
    const newBlog =
        {
            title : 'Opera',
            author : 'Figaro',
            url : 'http://teatro.com'
        };


    await api.post('/api/blogs', newBlog).send(newBlog).expect(201);

    await api.get('/api/blogs').expect(200);

    const dbResponse = await Blog.findOne( { 'title':'Opera' } );
    expect(dbResponse['likes']).toBe(0);
});

test('trying to create a blog without title or url results in a 400 Bad Request error', async () => {
    const newBlog =
        {
            author : 'Puma'
        };


    await api.post('/api/blogs', newBlog).send(newBlog).expect(400);

});



afterAll(() => {
    mongoose.connection.close();
});