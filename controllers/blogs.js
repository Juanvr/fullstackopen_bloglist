const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (request, response) => {

    const blogs = await Blog.find({});

    response.json(blogs);

});

blogsRouter.post('/', async (request, response) => {

    if (!request.body.likes){
        request.body.likes = 0;
    }
    if (!request.body.title){
        response.status(400);
        response.send('None shall pass');

    }else {
        const blog = new Blog(request.body);

        const result = await blog.save();

        response.status(201).json(result);
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