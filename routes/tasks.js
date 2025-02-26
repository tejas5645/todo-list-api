const express = require('express')
const db = require('./db');
const { verifyToken } = require('../middleware/auth');

const route = express.Router()

route.get('/', verifyToken, async (req, res) => {

    const uid = req.user.userId

    try {
        const checkUser = await db.query('select * from users where uid=$1', [uid]);
        if (checkUser.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const result = await db.query('select tid,uname,title,description,status from tasks,users where uid=$1 and tasks.username=users.uid', [uid]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "You currently don't have any tasks" });
        }

        res.status(200).json({ tasks: result.rows })

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
});

route.post('/', verifyToken, async (req, res) => {

    const username = req.user.userId
    console.log(req.userId)
    console.log(username)

    try {
        const { title, description } = req.body

        if (!title || !description) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const checkUsersTasks = await db.query('select * from tasks where username=$1 and title=$2', [username, title])
        if (checkUsersTasks.rows.length !== 0) {
            return res.status(404).json({ message: "This particular task is already exists for the user" })
        }

        const result = await db.query('INSERT INTO tasks(username, title, description) VALUES ($1,$2,$3) RETURNING *', [username, title, description])
        res.status(201).json({ message: "Added Successfully", task: result.rows[0] });

    } catch (err) {

        console.error(err.message)
        res.status(500).send('Server Error')
    }

});

route.put('/:tid', verifyToken, async (req, res) => {

    const { tid } = req.params
    const uid = req.user.userId


    try {
        const checkTask = await db.query('SELECT * FROM tasks WHERE tid = $1', [tid]);
        if (checkTask.rows.length === 0) {
            return res.status(404).json({ message: "Task not found" });
        }
        if (checkTask.rows[0].username !== uid) {
            return res.status(403).json({ message: "You are not authorized to update this task" });
        }

        const { title, description } = req.body

        if (!description || !title) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const result = await db.query('UPDATE tasks SET username=$1,title=$2,description=$3 WHERE tid=$4 RETURNING *', [uid, title, description, tid])
        res.status(200).json({ message: "Updated Successfully", task: result.rows });

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }

});

route.put('/status/:tid', verifyToken, async (req, res) => {

    const { tid } = req.params;
    const uid = req.user.userId

    try {
        const checkTask = await db.query('SELECT * FROM tasks WHERE tid = $1', [tid]);
        if (checkTask.rows.length === 0) {
            return res.status(404).json({ message: "Task not found" });
        }
        if (checkTask.rows[0].username !== uid) {
            return res.status(403).json({ message: "You are not authorized to update this task" });
        }

        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: "Status required" });
        }

        const result = await db.query('UPDATE tasks SET status=$1 WHERE tid=$2 RETURNING *', [status, tid])
        res.status(200).json({ message: "Updated Successfully", task: result.rows });

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }

});

route.delete('/:tid', verifyToken, async (req, res) => {

    const { tid } = req.params
    const uid = req.user.userId

    try {
        const checkTask = await db.query('SELECT * FROM tasks WHERE tid = $1', [tid]);
        if (checkTask.rows.length === 0) {
            return res.status(404).json({ message: "Task not found" });
        }
        if (checkTask.rows[0].username !== uid) {
            return res.status(403).json({ message: "You are not authorized to delete this task" });
        }

        await db.query('delete from tasks where tid=$1', [tid])
        res.status(200).json({ message: "Deleted Successfully" })

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
});


module.exports = route