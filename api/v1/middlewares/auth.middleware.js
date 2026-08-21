const User = require("../models/user.model");

module.exports.requireAuth = async (req, res, next) => {
    // Tra ra 1 mang voi phan tu dau tien la "Bearer" va token la phan thu 2
    if(!req.headers.authorization){
        res.json({
            code: 400,
            message: "Authorization not found!"
        });
        return;
    }

    const token = req.headers.authorization.split(" ")[1];
    const user = await User.findOne({
        token: token,
        deleted: false,
    }).select("-password -token");

    if(!user) {
        res.json({
            code: 400,
            message: "Token not valid!"
        });
        return;
    }

    req.user = user;

    next();
}