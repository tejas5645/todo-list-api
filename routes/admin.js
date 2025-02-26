const express = require('express')
require('dotenv').config();
const db = require('./db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const route = express.Router()



route.get('/', verifyToken, verifyAdmin, async (req, res) => {

    res.status(200).json({ message: "Welcome to the Admin Page" });

});

route.get('/me', verifyToken, verifyAdmin, async (req, res) => {

    const uid = req.user.userId

    try {
        const checkUser = await db.query('select * from users where uid=$1', [uid]);
        if (checkUser.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const result = await db.query('select * from users where uid=$1', [uid]);

        res.status(200).json({ admin: result.rows })

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
});


route.get('/users', verifyToken, verifyAdmin, async (req, res) => {

    try {
        const result = await db.query('select * from users')
        res.status(200).json({ users: result.rows })

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')

    }
})

route.get('/users/:uid', verifyToken, verifyAdmin, async (req, res) => {

    let { uid } = req.params

    try {
        const result = await db.query('select * from users where uid=$1', [uid]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user: result.rows })

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')

    }
});

route.get('/users/tasks/:uid', verifyToken, verifyAdmin, async (req, res) => {

    const { uid } = req.params

    try {
        const checkUser = await db.query('select * from users where uid=$1', [uid]);
        if (checkUser.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const result = await db.query('select tid,uname,title,description,status from tasks,users where uid=$1 and tasks.username=users.uid', [uid]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User currently don't have any tasks" });
        }

        res.status(200).json({ tasks: result.rows })

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
});

route.put('/password', verifyToken, verifyAdmin, async (req, res) => {

    const uid = req.user.userId;

    try {

        const userCheck = await db.query('select * from users WHERE uid=$1', [uid]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await db.query(
            'UPDATE users SET passwords=$1 WHERE uid=$2 RETURNING *',
            [hashedPassword, uid]
        );

        res.status(200).json({ message: "Password Updated Successfully", user: result.rows });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

route.delete('/users/:uid', verifyToken, verifyAdmin, async (req, res) => {

    const { uid } = req.params

    try {
        const userCheck = await db.query('SELECT * FROM users WHERE uid = $1', [uid]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        await db.query('DELETE FROM users WHERE uid = $1', [uid]);
        res.status(200).send({ message: "Deleted Successfully" });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

route.delete('/', verifyToken, verifyAdmin, async (req, res) => {

    const uid = req.user.userId

    try {
        const userCheck = await db.query('SELECT * FROM users WHERE uid = $1', [uid]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        await db.query('DELETE FROM users WHERE uid = $1', [uid]);
        res.status(200).send({ message: "Deleted Successfully" });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = route

