const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('./models/user');
const user = require('./models/user');

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (request, response) => {
    response.send('Connected.');
});

app.post('/signin', async (request, response) => {
    const {email, password} = request.body;
    
    if(!email || !password) return response.status(400).json('Incorrect from submission.');

    let user;
    try {
        user = await User.findOne({ email: email });
    } catch (err) {
        console.log(err);
    }

    let isValidPassword;
    try {
        isValidPassword = await bcrypt.compare(password, user.password);
    } catch(err) {
        console.log(err);
    }

    if(!isValidPassword) {
        console.log('not valid password!');
    }

    response.json({user: user.toObject({ getters: true })});
});

app.post('/register', async (request, response) => {
    const {name, email, password} = request.body;

    if(!email || !password || !name) return response.status(400).json('Incorrect from submission.');

    let existingUser;
    try {
        existingUser = await User.findOne({email: email});
    } catch (err) {
        console.log(err);

    }
    
    if(existingUser) {
        console.log('User already exists');
    }

    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        console.log(err);
    }
    
    let user = new User();
    user.name = name;
    user.email = email;
    user.password = hashedPassword;
    user.entries = 0;
    user.joined = new Date();

    try {
        await user.save();
    } catch (err) {
        console.log(err);
    }

    // TODO, do not send the whole object.
    return response.status(201).json({user: user.toObject({ getters: true })});
});

app.get('/profile/:id', async (request, response) => {
    const { id } = request.params;

    try {
        const user = await User.findById(id);
    } catch(err) {
        console.log(err);
    }
    
    return response.json({user: user.toObject({ getters: true })});

});

app.put('/image', async (request, response) => {
    const { id } = request.body;
    
    let count = 0;
    try {
        const user = await User.findById(id);
        count = user.entries + 1;
        user.entries = count;
        await user.save();
    } catch(err) {
        console.log(err);
    }
    
    return response.json(count);
});

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_NAME}.g9zpdck.mongodb.net/?retryWrites=true&w=majority`)
        .then(app.listen(3001))
        .catch(console.log);