const User = require("../models/user.model");
const ForgotPassword = require("../models/forgot-password.model");
const md5 = require("md5");

const generateHelper = require("../../../helpers/generate")
const sendMailHelper = require("../../../helpers/sendMail")


// [POST] /api/v1/users/register
module.exports.register = async (req, res) => {
    req.body.password = md5(req.body.password);

    const existsEmail = await User.findOne({
        email: req.body.email,
        deleted: false
    });

    if (existsEmail) {
        res.json({
            code: 400,
            message: "Email already exists"
        });
        return;
    } else {
        const user = new User({
            fullName: req.body.fullName,
            email: req.body.email,
            password: req.body.password,
            token: generateHelper.generateRandomString(32),
        });
        await user.save();

        const token = user.token;

        res.cookie("token", token, {
            expires: new Date(Date.now() + 3600000)
        })

        res.json({
            code: 200,
            message: "User created successfully",
            token: token
        });
        return;
    }

};


// [POST] /api/v1/users/login
module.exports.login = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const existsUser = await User.findOne({
        email: email,
        deleted: false
    })

    if (existsUser) {
        if (md5(password) === existsUser.password) {
            const token = existsUser.token;

            res.cookie("token", token, {
                expires: new Date(Date.now() + 3600000)
            })

            res.json({
                code: 200,
                message: "User logged in successfully",
                token: token
            });
            return;
        } else {
            res.json({
                code: 400,
                message: "Password is not correct"
            });
            return;
        }
    } else {
        res.json({
            code: 400,
            message: "Email is not exists"
        });
        return;
    }

};


// [POST] /api/v1/users/password/forgot
module.exports.forgotPassword = async (req, res) => {
    const email = req.body.email;

    const user = await User.findOne({
        email: email,
        deleted: false,
    });

    if (!user) {
        res.json({
            code: 400,
            message: "Email không tồn tại!"
        });
        return;
    }

    const otp = generateHelper.generateRandomNumber(8);



    const objectForgotPassword = {
        email: email,
        otp: otp,
        expireAt: Date.now(),
    };

    const forgotPassword = new ForgotPassword(objectForgotPassword);
    await forgotPassword.save();

    //Gui OTP qua email cua khach hang
    // Gửi OTP qua email user
    const subject = "Mã OTP xác minh lấy lại mật khẩu";
    const html = `
        Mã OTP để lấy lại mật khẩu của bạn là <b>${otp}</b> (Sử dụng trong ${timeExpire} phút).
        Vui lòng không chia sẻ mã OTP này với bất kỳ ai.
    `;

    sendMailHelper.sendMail(email, subject, html);

    res.json({
        code: 200,
        message: "Mã OTP đã được gửi đến email của bạn!",
    });
};



// [POST] /api/v1/users/password/otp
module.exports.otpPassword = async (req, res) => {
    const email = req.body.email;
    const otp = req.body.otp;

    const result = await ForgotPassword.findOne({
        email: email,
        otp: otp,
    });

    if (!result) {
        res.json({
            code: 400,
            message: "OTP không hợp lệ!"
        });
        return;
    }

    if (result.expireAt < Date.now()) {
        res.json({
            code: 400,
            message: "OTP đã hết hạn!"
        });
        return;
    }

    const user = await User.findOne({
        email: email,
        deleted: false,
    });

    const token = user.token;

    res.cookie("token", token, {
        expires: new Date(Date.now() + 3600000)
    })

    res.json({
        code: 200,
        message: "Verified successfully",
        token: token
    });
};  


// [POST] /api/v1/users/password/reset
module.exports.resetPassword = async (req, res) => {
  const token = req.body.token;
  const password = req.body.password;

  const user = await User.findOne({
    token: token,
    deleted: false,
  });

  if (!user) {
    res.json({
      code: 400,
      message: "User không tồn tại!"
    });
    return;
  }

  if(user.password = md5(password)){
    res.json({
        code: 400,
        message: "Vui long nhap mat khau khac mat khau cu!"
    })
    return;
  }
  
  await User.updateOne(
    { token: token },
    { password: md5(password) }
  );

  res.json({
    code: 200,
    message: "Password reset successfully"
  });
};


// [GET] /api/v1/users/detail
module.exports.detail = async (req, res) => {


  res.json({
    code: 200,
    message: "User found successfully",
    info: req.user
  });
  
};

