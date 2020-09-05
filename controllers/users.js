const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.get('/', async (request, response) => {

    const users = await User.find({}).populate('blogs');

    response.json(users);

});

usersRouter.post('/', async (request, response) => {
    const body = request.body;

    if(!body.username){
        response.status(400);
        response.send('Username must be provided');
        return;
    }
    if(!body.password){
        response.status(400);
        response.send('Password must be provided');
        return;
    }
    if(!body.name){
        response.status(400);
        response.send('Name must be provided');
        return;
    }
    if(body.username.length < 3){
        response.status(400);
        response.send('Username must be at least 3 characters long');
        return;
    }
    if(body.password.length < 3){
        response.status(400);
        response.send('Password must be at least 3 characters long');
        return;
    }

    const sameUserCount = await User.count({ 'username': body.username });
    if(sameUserCount > 0 ){
        response.status(400);
        response.send('User already exists');
        return;
    }


    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(body.password, saltRounds);

    const user = new User(
        {
            username: body.username,
            name: body.name,
            password: passwordHash
        }
    );

    const result = await user.save();

    response.status(201).json(result);
});

usersRouter.delete('/:id', async (request, response) => {
    const id = request.params.id;

    const  result = await User.deleteOne( { '_id' : id } );

    response.status(200).json(result);
});

usersRouter.put('/:id', async (request, response) => {
    const blog = request.body;

    const updatedBlog = await  User.findByIdAndUpdate(request.params.id, blog, { new: true });

    response.json(updatedBlog);
});


module.exports = usersRouter;