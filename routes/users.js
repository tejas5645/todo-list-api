const express = require('express')
const db = require('./db')

const route = express.Router()

route.get('/', async (req, res) => {

    try {
        const result = await db.query('select * from users')
        res.status(200).json({ users: result.rows })

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')

    }
});

route.get('/:uid', async (req, res) => {

    const { uid } = req.params

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

route.get('/tasks/:uid', async (req, res) => {

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

route.post('/', async (req, res) => {
    try {
        const { uname, email, age, passwords } = req.body;

        if (!uname || !email || !age || !passwords) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const checkUsername = await db.query('select * from users where uname=$1', [uname]);
        if (checkUsername.rows.length > 0) {
            return res.status(404).json({ message: "Username already exists" });
        }

        const checkEmail = await db.query('select * from users where email=$1', [email]);
        if (checkEmail.rows.length > 0) {
            return res.status(404).json({ message: "Email already in use" });
        }

        const result = await db.query(
            'INSERT INTO users (uname, email, age, passwords) VALUES ($1, $2, $3, $4) RETURNING *',
            [uname, email, age, passwords]
        );

        res.status(201).json({ message: "Added Successfully", user: result.rows[0] });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});




route.put('/:uid', async (req, res) => {
    const { uid } = req.params;

    try {

        const userCheck = await db.query('select * from users WHERE uid=$1', [uid]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const { uname, email, age, passwords } = req.body;

        if (!uname || !email || !age || !passwords) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const result = await db.query(
            'UPDATE users SET uname=$1, email=$2, age=$3, passwords=$4 WHERE uid=$5 RETURNING *',
            [uname, email, age, passwords, uid]
        );

        res.status(200).json({ message: "Updated Successfully", user: result.rows });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

route.put('/password/:uid', async (req, res) => {
    const { uid } = req.params;

    try {

        const userCheck = await db.query('select * from users WHERE uid=$1', [uid]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const { passwords } = req.body;

        if (!passwords) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const result = await db.query(
            'UPDATE users SET passwords=$1 WHERE uid=$2 RETURNING *',
            [passwords, uid]
        );

        res.status(200).json({ message: "Password Updated Successfully", user: result.rows });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



route.delete('/:uid', async (req, res) => {

    const { uid } = req.params;

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