const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const getTokenFrom = request => {
    const authorization = request.get('authorization');
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7);
    }
    return null;
};

blogsRouter.get('/', async (request, response) => {

    const blogs = await Blog.find({}).populate('user');

    response.json(blogs);

});

blogsRouter.post('/', async (request, response) => {

    const token = getTokenFrom(request);

    let decodedToken = '';
    try {
        decodedToken =  await jwt.verify(token, process.env.SECRET);
    } catch(err) {
        return response.status(401).json({ error: 'token missing or invalid' });
    }

    if (!token || !decodedToken.id) {
        response.status(401).json({ error: 'token missing or invalid' });
        return;
    }

    const user = await User.findById(decodedToken.id);

    if (!request.body.likes){
        request.body.likes = 0;
    }
    if (!request.body.title){
        response.status(400);
        response.send('None shall pass');

    }else {
        const blog = new Blog({
            ...request.body,
            user
        });

        const savedBlog = await blog.save();
        user.blogs = user.blogs.concat(savedBlog._id);
        await user.save();

        response.status(201).json(savedBlog);
    }
});


blogsRouter.delete('/:id', async (request, response) => {
    const id = request.params.id;

    const  result = await Blog.deleteOne( { '_id' : id } );

    response.status(200).json(result);
});

blogsRouter.put('/:id', async (request, response) => {
    const blog = request.body;

    const updatedBlog = await  Blog.findByIdAndUpdate(request.params.id, blog, { new: true });

    response.json(updatedBlog);
});


module.exports = blogsRouter;