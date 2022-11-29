const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'attend'
});

connection.connect(err => {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to database');
    }
});

const adminpass = 'lsakdfjlksdf jkladshf dshjkjhkdhfjsdka fklugsdah fjasdhoiufhilsda jfmn';

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

//----------------- admin -----------------

app.post('/admin/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const query = `SELECT * FROM admin WHERE username = ? AND password = ?`;
    connection.query(query, [username, password], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({
                success: false,
                message: 'Internal server error',
                data: []
            });
        } else {
            if (result.length > 0) {
                const token = jwt.sign({
                    id: result[0].id,    
                    username: username
                }, adminpass, {
                    expiresIn: '30d'
                });
                res.status(200).send({
                    success: true,
                    message: 'Login success',
                    data: token
                });
            } else {
                res.status(401).send({
                    success: false,
                    message: 'Login failed',
                    data: []
                });
            }
        }
    });

});

//------------------ admin end -----------------


app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});