const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { msg: "Too many login attempts. Try again after 15 minutes." }
});


const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { msg: "Too many accounts created. Try again after an hour." }
});

module.exports={
    loginLimiter,
    signupLimiter,
}