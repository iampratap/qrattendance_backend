
const jwt = require('jsonwebtoken');
const adminpass = 'lsakdfjlksdf jkladshf dshjkjhkdhfjsdka fklugsdah fjasdhoiufhilsda jfmn';

// check admin middleware
const checkAdmin = (req, res, next) => {
    console.log(req.headers)
    const token = req.headers['authorization'].split(' ')[1];
    if (token) {
        jwt.verify(token, adminpass, (err, decoded) => {
            if (err) {
                console.log(err);
                res.status(401).send({
                    success: false,
                    message: 'Invalid token',
                    data: []
                });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        res.status(401).send({
            success: false,
            message: 'Token not provided',
            data: []
        });
    }
};

module.exports = {checkAdmin, adminpass };