const express = require('express')
const db = require('./db')

const route = express.Router()



route.get('/', async (req, res) => {

    try {
        const result = await db.query('select * from tasks')
        res.status(200).json({ tasks: result.rows })
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')

    }
});

route.get('/:uid', async (req, res) => {

    const { uid } = req.params

    try {
        const checkUser = await db.query('select tid,uname,title,description,status from tasks,users where uid=$1 and tasks.username=users.uid', [uid]);
        if (checkUser.rows.length === 0) {
            return res.status(404).json({ message: "User currently don't have any tasks" });
        }

        const result = await db.query('select tid,uname,title,description,status from tasks,users where uid=$1 and tasks.username=users.uid', [uid])
        res.status(200).json({ tasks: result.rows })

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')

    }
});

route.post('/', async (req, res) => {

    try {
        const { username, title, description } = req.body

        if (!username || !title) {
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

route.put('/:tid', async (req, res) => {

    const { tid } = req.params


    try {
        const checkTask = await db.query('SELECT * FROM tasks WHERE tid = $1', [tid]);
        if (checkTask.rows.length === 0) {
            return res.status(404).json({ message: "Task not found" });
        }

        const { username, title, description } = req.body

        if (!username || !title) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const result = await db.query('UPDATE tasks SET username=$1,title=$2,description=$3 WHERE tid=$4 RETURNING *', [username, title, description, tid])
        res.status(200).json({ message: "Updated Successfully", task: result.rows });

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }

});

route.put('/status/:tid', async (req, res) => {

    const { tid } = req.params;

    try {
        const checkTask = await db.query('SELECT * FROM tasks WHERE tid = $1', [tid]);
        if (checkTask.rows.length === 0) {
            return res.status(404).json({ message: "Task not found" });
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

route.delete('/:tid', async (req, res) => {

    const { tid } = req.params

    try {
        const checkTask = await db.query('SELECT * FROM tasks WHERE tid = $1', [tid]);
        if (checkTask.rows.length === 0) {
            return res.status(404).json({ message: "Task not found" });
        }

        await db.query('delete from tasks where tid=$1', [tid])
        res.status(200).json({ message: "Deleted Successfully" })

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
});


module.exports = route