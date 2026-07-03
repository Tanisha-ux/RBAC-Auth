const pool = require("../models/db");
const bcrypt=require("bcrypt");
const {v4:uuidv4}= require("uuid");
const {setUser}=require("../service/auth.js");
const { body, validationResult } = require("express-validator");
const crypto = require("crypto");
const { sendVerificationEmail, sendResetEmail } = require("../service/email.js");




async function userSignup(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ msg: errors.array()[0].msg });
        }

        const body = req.body;
        

        if (!body || !body.name || !body.email || !body.password) {
            return res.status(400).json({ msg: "Please fill the required fields" });
        }

        if (body.password.length < 6) {
            return res.status(400).json({ msg: "Password must be at least 6 characters" });
        }

        // Check if email already exists
        const existing = await pool.query(
            `SELECT id FROM users WHERE email = $1`, [body.email]
        );
        if (existing.rows.length > 0) {
            return res.status(400).json({ msg: "An account with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(body.password, 10);

        // Generate a secure random verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");

        const newUser = await pool.query(
            `INSERT INTO users(name, email, password, verification_token, is_verified)
             VALUES ($1, $2, $3, $4, FALSE)
             RETURNING id, name, email`,
            [body.name, body.email, hashedPassword, verificationToken]
        );

        // Send verification email
        await sendVerificationEmail(body.email, verificationToken);


        res.status(201).json({
            newUser: newUser.rows[0],
            msg: "Account created. Please check your email to verify your account."
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Internal Server error" });
    }
}

async function userLogin(req,res){
    try{

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ msg: errors.array()[0].msg });
        }

        const {email,password}= req.body;
        

        const originalPass=await pool.query(
            `SELECT * FROM users WHERE email = $1`,[email]
        )


        if(originalPass.rows.length===0){
            return res.status(404).json({ msg: "User not found" });
            
        }

        const user=originalPass.rows[0];

        
        if (!user.is_verified) {
           return res.status(403).json({ 
                msg: "Please verify your email before logging in. Check your inbox." 
            });
        }

        console.log("LOGIN USER:", user);
        

        const isMatch=await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(400).json({msg:"Invalid username or password"});
        }

       
        const token=setUser(user);


        res.cookie("uid",token,{
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.status(200).json({ 
            msg: "Login successful",
            user:{
                name: user.name,
                email: user.email,
                role: user.role
            }
         });
       

    }
    catch(err){
        console.log(err);
        res.status(500).json({msg:"Internal Server Error"})
    }
}


async function handleUpdateUsers(req,res){
    try{
        const { id } = req.params;       // user id from the URL
        const { role } = req.body;       // new role from the request body
 
        // Only allow "admin" or "user" — reject anything else
        if (role !== "admin" && role !== "user") {
            return res.status(400).json({ msg: "Role must be 'admin' or 'user'" });
        }
 
        // Update the role in the database
        const result = await pool.query(
            `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role`,
            [role, id]
        );
 
        // If no rows came back, that user id doesn't exist
        if (result.rows.length === 0) {
            return res.status(404).json({ msg: "User not found" });
        }
 
        res.status(200).json({
            msg: "Role updated successfully",
            user: result.rows[0]
        });
    
    }
    catch(err){
        console.log(err);
        res.status(500).json({msg:"Internal server error"})
    }
}



async function handleDeleteUsers(req,res){
    try{
        const { id } = req.params;       // user id from the URL
 
        // Delete the user from the database
        const result = await pool.query(
            `DELETE FROM users WHERE id = $1 RETURNING id, name, email`,
            [id]
        );
 
        // If no rows came back, that user id doesn't exist
        if (result.rows.length === 0) {
            return res.status(404).json({ msg: "User not found" });
        }
 
        res.status(200).json({
            msg: "User deleted successfully",
            user: result.rows[0]
        });
    }
    catch(err){
        console.log(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}


async function handleLogout(req, res) {
    
    res.clearCookie("uid");
    return res.redirect("/");
}





// Verify email token
async function verifyEmail(req, res) {
    try {
        const { token } = req.params;

        const result = await pool.query(
            `UPDATE users SET is_verified = TRUE, verification_token = NULL
             WHERE verification_token = $1
             RETURNING id, name, email`,
            [token]
        );

        if (result.rows.length === 0) {
            return res.render("verify-email", {
                success: false,
                msg: "Invalid or expired verification link."
            });
        }

        return res.render("verify-email", {
            success: true,
            msg: "Email verified successfully. You can now log in."
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}

// Show forgot password form + handle submission
async function forgotPassword(req, res) {
    try {
        const { email } = req.body;

        const result = await pool.query(
            `SELECT * FROM users WHERE email = $1`, [email]
        );

        
        if (result.rows.length === 0) {
            return res.status(200).json({ 
                msg: "If that email exists, a reset link has been sent." 
            });
        }

        
        const resetToken  = crypto.randomBytes(32).toString("hex");
        const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        await pool.query(
            `UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3`,
            [resetToken, resetExpiry, email]
        );

        await sendResetEmail(email, resetToken);

        res.status(200).json({ 
            msg: "If that email exists, a reset link has been sent." 
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}

// Reset password with token
async function resetPassword(req, res) {
    try {
        const { token }    = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ msg: "Password must be at least 6 characters" });
        }

        // Find user with this token and check it has not expired
        const result = await pool.query(
            `SELECT * FROM users 
             WHERE reset_token = $1 AND reset_token_expiry > NOW()`,
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ 
                msg: "Reset link is invalid or has expired. Please request a new one." 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password and clear the reset token
        await pool.query(
            `UPDATE users 
             SET password = $1, reset_token = NULL, reset_token_expiry = NULL
             WHERE reset_token = $2`,
            [hashedPassword, token]
        );

        res.status(200).json({ msg: "Password updated successfully. You can now log in." });

    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Internal Server Error" });
    }
}


module.exports={
    userSignup,
    userLogin,
    handleUpdateUsers,
    handleDeleteUsers,
    handleLogout,
    verifyEmail,
    forgotPassword,
    resetPassword,
}