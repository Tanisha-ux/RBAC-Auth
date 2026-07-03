const express=require("express");
const userRouter=express.Router();
const { body, validationResult } = require("express-validator");

const {
    userSignup,
    userLogin,
    handleUpdateUsers,
    handleDeleteUsers,
    handleLogout,
    verifyEmail,
    forgotPassword,
    resetPassword,
}=require("../controllers/user.js")


//Validation middleware
const validateSignup = [
    body("name")
        .trim()
        .notEmpty().withMessage("Name is required")
        .isLength({ max: 50 }).withMessage("Name too long")
        .escape(),   // strips <script> and HTML tags

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email address")
        .normalizeEmail(),  // lowercases, removes dots in gmail etc

    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];


const validateLogin = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email address")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Password is required"),
];



userRouter.post("/signup", validateSignup,userSignup);
userRouter.post("/login", validateLogin, userLogin);
userRouter.get("/logout", handleLogout);
userRouter.post("/forgot-password",forgotPassword);
userRouter.post("/reset-password/:token",resetPassword);
userRouter.get("/verify-email/:token",verifyEmail);

userRouter.patch("/:id/role",handleUpdateUsers);
userRouter.delete("/:id",handleDeleteUsers);




module.exports=userRouter;