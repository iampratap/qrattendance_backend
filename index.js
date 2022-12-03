const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const {
    checkAdmin,
    adminpass
} = require('./middleware/admin');

const mysql = require('mysql2'); //
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'phpmyadmin',
    password: 'amitlakeri',
    database: 'attend',
    insecureAuth : true
});

connection.connect(err => {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to database');
    }
});


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
                const jwtdata = {
                    id: result[0].id,
                    username: username,
                    role: result[0].role,
                };
                const token = jwt.sign(jwtdata, adminpass, {
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

app.get('/admin/getalladmins', checkAdmin, (req, res) => {
    const query = `SELECT * FROM admin WHERE is_active = 1`;
    connection.query(query, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({
                success: false,
                message: 'Internal server error',
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'All admins',
                data: result
            });
        }
    });
});

app.post('/admin/addadmin', checkAdmin, (req, res) => {
    const role = "subadmin";
    const username = req.body.username;
    const password = req.body.password;
    const fullname = req.body.fullname;
    const mobile = req.body.mobile;
    const email = req.body.email;
    const address = req.body.address;
    const img = req.body.img;
    const query = `INSERT INTO admin (role, username, password, fullname, mobile, email, address, img) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    connection.query(query, [role, username, password, fullname, mobile, email, address, img], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({
                success: false,
                message: 'Internal server error',
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Admin added',
                data: []
            });
        }
    });
});

app.put('/admin/updateadmin/:id', checkAdmin, (req, res) => {
    const id = req.params.id;
    const fullname = req.body.fullname;
    const mobile = req.body.mobile;
    const email = req.body.email;
    const address = req.body.address;
    const img = req.body.img;
    const query = `UPDATE admin SET fullname = ?, mobile = ?, email = ?, address = ?, img = ? WHERE id = ?`;
    if (id == req.decoded.id || req.decoded.role == "admin") {
        connection.query(query, [fullname, mobile, email, address, img, id], (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send({
                    success: false,
                    message: 'Internal server error',
                    data: []
                });
            } else {
                res.status(200).send({
                    success: true,
                    message: 'Admin updated',
                    data: []
                });
            }
        });
    } else {
        res.status(401).send({
            success: false,
            message: 'Unauthorized',
            data: []
        });
    }
});

app.delete('/admin/deleteadmin/:id', checkAdmin, (req, res) => {
    const id = req.params.id;
    const query = `update admin set is_active = 0 where id = ?`;
    if (req.decoded.role == "admin") {
        connection.query(query, [id], (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send({
                    success: false,
                    message: 'Internal server error',
                    data: []
                });
            } else {
                res.status(200).send({
                    success: true,
                    message: 'Admin deleted',
                    data: []
                });
            }
        });
    } else {
        res.status(401).send({
            success: false,
            message: 'Unauthorized',
            data: []
        });
    }
});

app.put('/admin/updatepassword/:id', checkAdmin, (req, res) => {
    const id = req.params.id;
    const old_password = req.body.old_password;
    const new_password = req.body.new_password;
    let query = "";
    if (id == req.decoded.id) {
        query = `update admin set password = ? where id = ? and password = ?`;
    } else if (req.decoded.role == "admin") {
        query = `update admin set password = ? where id = ?`;
    }
    connection.query(query, [new_password, id, old_password], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({
                success: false,
                message: 'Internal server error',
                data: []
            });
        } else {
            if (result.affectedRows > 0) {
                res.status(200).send({
                    success: true,
                    message: 'Password updated',
                    data: []
                });
            } else {
                res.status(401).send({
                    success: false,
                    message: 'Unauthorized',
                    data: []
                });
            }
        }
    });
});
//------------------ admin end -----------------

//------------------ batch start -----------------

app.get('/batch/getallbatches', checkAdmin, (req, res) => {
    const query = `SELECT * FROM batch WHERE is_active = 1`;
    connection.query(query, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({
                success: false,
                message: 'Internal server error',
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'All Batches',
                data: result
            });
        }
    });
});

app.get('/batch/getstudents/:batch_id', checkAdmin, (req, res) => {
    const batch_id = req.params.batch_id;
    const query = `SELECT * FROM student WHERE batch_id = ? AND is_active = 1`;
    connection.query(query, [batch_id], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({
                success: false,
                message: 'Internal server error',
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'All Batch students',
                data: result
            });
        }
    });
});

app.post('/batch/addbatch', checkAdmin, (req, res) => {
    const batch_name = req.body.batch_name;
    const batch_time = req.body.batch_time;
    const query = `INSERT INTO batch (batch_name, batch_time) VALUES (?, ?)`;
    connection.query(query, [batch_name, batch_time], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({
                success: false,
                message: 'Internal server error',
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Batch added',
                data: []
            });
        }
    });
});

app.put('/batch/updatebatch/:id', checkAdmin, (req, res) => {
    const id = req.params.id;
    const batch_name = req.body.batch_name;
    const batch_time = req.body.batch_time;
    const query = `UPDATE batch SET batch_name = ?, batch_time = ? WHERE id = ?`;
    connection.query(query, [batch_name, batch_time, id], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({
                success: false,
                message: 'Internal server error',
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Batch updated',
                data: []
            });
        }
    });
});

app.delete('/batch/deletebatch/:id', checkAdmin, (req, res) => {
    const id = req.params.id;
    const query = `update batch set is_active = 0 where id = ?`;
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({
                success: false,
                message: 'Internal server error',
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Batch deleted',
                data: []
            });
        }
    });
});

//------------------ batch end -----------------

//------------------ Student start -----------------
app.get('/student/getallstudents', checkAdmin, (req, res) => {
    const query = `SELECT * FROM student WHERE is_active = 1`;
    connection.query(query, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({
                success: false,
                message: 'Internal server error',
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'All students',
                data: result
            });
        }
    });
});

app.get('/student/getstudent/:id', checkAdmin, (req, res) => {
    const id = req.params.id;
    const query = `SELECT * FROM student WHERE id = ?`;
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({
                success: false,
                message: 'Internal server error',
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Student',
                data: result
            });
        }
    });
});

app.post('/student/addstudent', checkAdmin, (req, res) => {
    const batch_id = req.body.batch_id;
    const name = req.body.name;
    const email = req.body.email;
    const mobile = req.body.mobile;
    const parent_mobile = req.body.parent_mobile;
    const gender = req.body.gender;
    const address = req.body.address;
    const dob = req.body.dob;
    const blood_group = req.body.blood_group;
    const img = req.body.img;
    const query = `INSERT INTO student (batch_id, name, email, mobile, parent_mobile,gender, address, dob, blood_group, img) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    connection.query(query, [batch_id, name, email, mobile, parent_mobile, gender, address, dob, blood_group, img], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({
                success: false,
                message: 'Internal server error',
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Student added',
                data: []
            });
        }
    });
});

app.put('/student/updatestudent/:id', checkAdmin, (req, res) => {
    const id = req.params.id;
    const batch_id = req.body.batch_id;
    const name = req.body.name;
    const email = req.body.email;
    const mobile = req.body.mobile;
    const parent_mobile = req.body.parent_mobile;
    const gender = req.body.gender;
    const address = req.body.address;
    const dob = req.body.dob;
    const blood_group = req.body.blood_group;
    const img = req.body.img;
    const query = `UPDATE student SET batch_id = ?, name = ?, email = ?, mobile = ?, parent_mobile = ?, gender= ?, address= ?, dob= ?, blood_group= ?, img = ? WHERE id = ?`;
    connection.query(query, [batch_id, name, email, mobile, parent_mobile, gender, address, dob, blood_group, img, id], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({
                success: false,
                message: 'Internal server error',
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Student updated',
                data: []
            });
        }
    });
});

app.delete('/student/deletestudent/:id', checkAdmin, (req, res) => {
    const id = req.params.id;
    const query = `update student set is_active = 0 where id = ?`;
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({
                success: false,
                message: 'Internal server error',
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Student deleted',
                data: []
            });
        }
    });
});
//------------------ Student end -----------------
//------------------ attendance start -----------------

app.post('/attendance/addattendance', checkAdmin, (req, res) => {
    const student_id = req.body.student_id;
    const date = req.body.date;
    const status = req.body.status;
    const get_old_status_query = `SELECT * FROM attendance WHERE student_id = ? AND date = ?`;
    connection.query(get_old_status_query, [student_id, date], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({
                success: false,
                message: 'Internal server error',
                data: []
            });
        } else {
            if (result.length == 0) {
                const query = `INSERT INTO attendance ( student_id, date, status) VALUES ( ?, ?, ?)`;
                connection.query(query, [student_id, date, status], (err, result) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({
                            success: false,
                            message: 'Internal server error',
                            data: []
                        });
                    } else {
                        res.status(200).send({
                            success: true,
                            message: 'Attendance added',
                            data: []
                        });
                    }
                });
            } else {
                res.status(200).send({
                    success: true,
                    message: 'Attendance already added',
                    data: []
                });
            }
        }
    });
});

app.put('/attendance/updateattendance', checkAdmin, (req, res) => {
    const student_id = req.body.student_id;
    const date = req.body.date;
    const status = req.body.status;
    const query = `UPDATE attendance SET status = ? WHERE student_id = ? AND date = ?`;
    connection.query(query, [status, student_id, date], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({
                success: false,
                message: 'Internal server error',
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Attendance updated',
                data: []
            });
        }
    });
});



app.post('/attendance/getstudentattendance/:student_id', checkAdmin, (req, res) => {
    const student_id = req.params.student_id;
    const from_date = req.body.from_date;
    const to_date = req.body.to_date;
    const query = `
    SELECT attendance.*, student.name
    FROM attendance, student 
    WHERE attendance.student_id = student.id
        AND student.id = ?
        AND attendance.date BETWEEN ? AND ?`;
    connection.query(query, [student_id, from_date, to_date], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({
                success: false,
                message: 'Internal server error',
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Attendance fetched',
                data: result
            });
        }
    });
});

app.post('/attendance/getbatchattendance/:batch_id', checkAdmin, (req, res) => {
    const batch_id = req.params.batch_id;
    const from_date = req.body.from_date;
    const to_date = req.body.to_date;
    const query = `
    SELECT attendance.*, student.name, batch.batch_name
    FROM attendance, batch, student 
    WHERE student.batch_id = batch.id 
        AND attendance.student_id = student.id 
        AND batch.id = ? 
        AND attendance.date BETWEEN ? AND ?`;
    connection.query(query, [batch_id, from_date, to_date], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({
                success: false,
                message: 'Internal server error',
                data: []
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Attendance fetched',
                data: result
            });
        }
    });
});
//------------------ attendance end -----------------


app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});