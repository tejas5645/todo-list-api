const jwt = require("jsonwebtoken");


const verifyToken = async (req, res, next) => {

    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "Access Denied! No token provided. Please LOGIN or REGISTER to get token" });
    }

    try {
        const verified = jwt.verify(token.split(" ")[1], process.env.JWT_SECRETKEY);
        console.log(verified)
        req.user = verified;
        next();

        // const userCheck = await db.query('SELECT * FROM users WHERE uid=$1', [req.user.userId]);
        // if (userCheck.rows.length === 0) {
        //     return res.status(403).json({ message: "User does not exist or was deleted." });
        // }

    } catch (error) {
        res.status(400).json({ message: "Invalid Token" });
    }
};


const verifyAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") { 
        console.log("Decoded Token Data:", req.user);
        return res.status(403).json({ message: "Access Denied! Admins only." });
    }
    next();
};

module.exports = { verifyToken, verifyAdmin };


