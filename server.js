const express = require('express')
const body_parser = require('body-parser')
const db = require('./routes/db')
const users = require('./routes/users')
const tasks = require('./routes/tasks')
const cors = require('cors')

const app = express()

//Middlewares
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization']  // Allowed headers
}));


app.use(body_parser.json())
app.use('/users', users)
app.use('/tasks', tasks)


console.log("connected")

app.get('/', (req, res) => {
    try {
        res.status(200).json({
            message: "Welcome to the To-Do List API",
            description: "This API allows you to manage tasks with features such as adding, updating, and deleting tasks.",
            availableEndpoints: [

                { method: 'GET', endpoint: '/users', description: 'Get all users' },
                { method: 'GET', endpoint: '/users/:uid', description: 'Get particular user by uid' },
                { method: 'GET', endpoint: '/users/tasks/:uid', description: 'Get particular users tasks by uid' },
                { method: 'POST', endpoint: '/users', description: 'Add an user' },
                { method: 'PUT', endpoint: '/users/:uid', description: 'Update an user' },
                { method: 'PUT', endpoint: '/users/password/:uid', description: 'Update an user\'s password' },
                { method: 'DELETE', endpoint: '/users/:uid', description: 'Delete an user by uid' },

                { method: 'GET', endpoint: '/tasks', description: 'Get all tasks' },
                { method: 'GET', endpoint: '/tasks/:uid', description: 'Get particular users tasks by uid' },
                { method: 'POST', endpoint: '/tasks', description: 'Add a task' },
                { method: 'PUT', endpoint: '/tasks/:tid', description: 'Update a task by tid' },
                { method: 'PUT', endpoint: '/tasks/status/:tid', description: 'For updating status' },
                { method: 'DELETE', endpoint: '/tasks/:tid', description: 'delete a task by tid' }
            ]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



app.listen(3000, '127.0.0.1', () => {
    console.log('listning on 127.0.0.1:3000')
})