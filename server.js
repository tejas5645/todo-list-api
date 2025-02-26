const express = require('express')
const db = require('./routes/db')
const user = require('./routes/users')
const tasks = require('./routes/tasks')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const admin = require('./routes/admin')
const cors = require('cors')
require('dotenv').config();

const app = express()

//Middlewares
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization']  // Allowed headers
}));


app.use(express.json())
app.use('/user', user)
app.use('/tasks', tasks)
app.use('/admin', admin)


console.log("connected")

app.get('/', (req, res) => {
    try {
        res.status(200).json({
            message: "Welcome to the To-Do List API",
            description: "This API allows you to manage tasks with features such as adding, updating, and deleting tasks.",
            authentication: {
                message: "You must first log in or register to access the API.",
                endpoints: [
                    { method: "POST", path: "/register", description: "Register a new user" },
                    { method: "POST", path: "/login", description: "Login to get access token" }
                ]
            },
            availableEndpoints: [
                {
                    category: "User Endpoints",
                    endpoints: [
                        { method: "GET", path: "/user", description: "Get information of logged-in user" },
                        { method: "PUT", path: "/user", description: "Update user information" },
                        { method: "PUT", path: "/user/password", description: "Update user's password" },
                        { method: "DELETE", path: "/user", description: "Delete user account" }
                    ]
                },
                {
                    category: "Task Endpoints",
                    endpoints: [
                        { method: "GET", path: "/tasks", description: "Get all tasks of logged-in user" },
                        { method: "POST", path: "/tasks", description: "Add new task" },
                        { method: "PUT", path: "/tasks/:tid", description: "Update a specific task" },
                        { method: "PUT", path: "/tasks/status/:tid", description: "Update a task's status" },
                        { method: "DELETE", path: "/tasks/:tid", description: "Delete a task" }
                    ]
                },
                {
                    category: "Admin Endpoints",
                    endpoints: [
                        { method: "GET", path: "/admin", description: "Admin welcome page" },
                        { method: "GET", path: "/admin/me", description: "Get admin's information" },
                        { method: "GET", path: "/admin/users", description: "Get all users" },
                        { method: "GET", path: "/admin/users/:uid", description: "Get a specific user by ID" },
                        { method: "DELETE", path: "/admin/users/:uid", description: "Delete a specific user" },
                        { method: "PUT", path: "/admin", description: "Update admin information" },
                        { method: "DELETE", path: "/admin", description: "Delete admin account" }
                    ]
                }
            ]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


app.post('/register', async (req, res) => {

    try {
        const { uname, email, age, password } = req.body;

        if (!uname || !email || !age || !password) {

            return res.status(400).json({ message: "All fields are required" }); 
        }

        const checkPassword = /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;

        if (!checkPassword.test(password)) {  
            return res.status(400).json({ message: "Password must be at least 8 characters long and contain at least one special character." });
        }
        
        const checkUsername = await db.query('select * from users where uname=$1', [uname]);
        if (checkUsername.rows.length > 0) {
            return res.status(404).json({ message: "Username already exists" });
        }

        const checkEmail = await db.query('select * from users where email=$1', [email]);
        if (checkEmail.rows.length > 0) {
            return res.status(404).json({ message: "Email already in use" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await db.query(
            'INSERT INTO users (uname, email, age, passwords) VALUES ($1, $2, $3, $4) RETURNING *',
            [uname, email, age, hashedPassword]
        );

        const newUser = result.rows[0];

        const token = jwt.sign(
            { userId: newUser.uid, role: newUser.role },
            process.env.JWT_SECRETKEY,
            { expiresIn: "15m" }
        );

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                uid: newUser.uid,
                uname: newUser.uname,
                email: newUser.email,
                age: newUser.age,
                role: newUser.role
            }
        });


    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


app.post('/login', async (req, res) => {

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const Checkuser = await db.query('select * from users where email=$1', [email])
        if (Checkuser.rows.length === 0) {
            return res.status(404).json({ message: "User Not Found!" });
        }

        console.log(Checkuser.rows.length)

        const validatePassword = await bcrypt.compare(password, Checkuser.rows[0].passwords)
        if (!validatePassword) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }

        const token = jwt.sign(
            { userId: user.uid, role: user.role },
            process.env.JWT_SECRETKEY,
            { expiresIn: "15m" }
        );


        res.status(200).json({ message: "Login successful!", token });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



app.listen(3000, '127.0.0.1', () => {
    console.log('listning on 127.0.0.1:3000')
})