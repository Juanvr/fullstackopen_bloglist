const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');


blogsRouter.get('/', async (request, response) => {

    const blogs = await Blog.find({}).populate('user');

    response.json(blogs);

});

blogsRouter.post('/', async (request, response) => {

    const token = request.token;

    if (!token || !token.id){
        response.status(401).json({ error: 'token missing or invalid' });
    }

    const user = await User.findById(token.id);

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
    const token = request.token;

    if (!token || !token.id){
        return response.status(401).json({ error: 'token missing or invalid' });
    }

    const user = await User.findById(token.id);

    const id = request.params.id;

    const blogToDelete = await Blog.findOne({ '_id' : id });

    if (!blogToDelete){
        return response.status(404).json({ error: 'blog specified not found' });
    }
    if (blogToDelete.user.toString() !== user._id.toString()){
        return response.status(401).json({ error: 'blog does not belong to user' });
    }


    const  result = await Blog.deleteOne( { '_id' : id } );

    response.status(200).json(result);
});

blogsRouter.put('/:id', async (request, response) => {

    const token = request.token;

    if (!token || !token.id){
        return response.status(401).json({ error: 'token missing or invalid' });
    }

    const user = await User.findById(token.id);

    const id = request.params.id;

    const blogToUpdate = await Blog.findOne({ '_id' : id });

    if (!blogToUpdate){
        return response.status(404).json({ error: 'blog specified not found' });
    }
    if (blogToUpdate.user.toString() !== user._id.toString()){
        return response.status(401).json({ error: 'blog does not belong to user' });
    }

    const blog = { ...request.body, user : request.body.user.id };

    const updatedBlog = await  Blog.findByIdAndUpdate(request.params.id, blog, { new: true });

    response.json(updatedBlog);
});


module.exports = blogsRouter;