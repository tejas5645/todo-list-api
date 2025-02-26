const express = require('express')
const db = require('./db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middleware/auth');
require('dotenv').config();

const route = express.Router()

route.get('/', verifyToken, async (req, res) => {

    const uid = req.user.userId

    try {
        const result = await db.query('select * from users where uid=$1', [uid])
        res.status(200).json({ user: result.rows[0] })

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')

    }
});

route.put('/', verifyToken, async (req, res) => {

    const uid = req.user.userId;

    try {

        const userCheck = await db.query('select * from users WHERE uid=$1', [uid]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }


        const { uname, email, age, password } = req.body;

        if (!uname || !email || !age || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const checkUsername = await db.query('select * from users where uname=$1', [uname]);
        if (checkUsername.rows.length > 0) {
            return res.status(404).json({ message: "Username already exists" });
        }

        const checkEmail = await db.query('select * from users where email=$1', [email]);
        if (checkEmail.rows.length !== 0) {
            return res.status(404).json({ message: "Email already in use" });
        }

        const checkPassword = /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
        if (!checkPassword.test(password)) {  
            return res.status(400).json({ message: "Password must be at least 8 characters long and contain at least one special character." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        const result = await db.query(
            'UPDATE users SET uname=$1, email=$2, age=$3, passwords=$4 WHERE uid=$5 RETURNING *',
            [uname, email, age, hashedPassword, uid]
        );

        res.status(200).json({ message: "Updated Successfully", user: result.rows });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

route.put('/password', verifyToken, async (req, res) => {

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

        const checkPassword = /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
        if (!checkPassword.test(password)) {  
            return res.status(400).json({ message: "Password must be at least 8 characters long and contain at least one special character." });
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



route.delete('/', verifyToken, async (req, res) => {

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