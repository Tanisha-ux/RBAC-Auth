const express=require("express");
const pageRouter=express.Router();
const pool = require('../models/db');
const {isAdmin}=require("../middlewares/auth.js");
const {restrictToLoggedInUser} =require("../middlewares/auth.js")

pageRouter.get("/signup",(req,res)=>{
    return res.render("signup")
});

pageRouter.get("/login",(req,res)=>{
    return res.render("login")
})



// Public landing page — no auth required
pageRouter.get("/", (req, res) => {
    res.render("landing");
});

// Home dashboard — auth required
pageRouter.get("/home", restrictToLoggedInUser, async (req, res) => {
    const userId  = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const query = isAdmin
        ? `SELECT records.*, users.name as owner_name
           FROM records
           JOIN users ON records.user_id = users.id
           ORDER BY records.date DESC`
        : `SELECT * FROM records WHERE user_id = $1 ORDER BY date DESC`;

    const values = isAdmin ? [] : [userId];

    const result = await pool.query(query, values);
    
    res.render("home", {
        user: req.user,
        records: result.rows
    });
});



pageRouter.get("/logout",(req,res)=>{
  return res.render("login")
})

pageRouter.get('/admin' ,restrictToLoggedInUser, isAdmin, async (req, res) => {
  // Pass the logged-in user from session + full users list from DB
  const users = await pool.query('SELECT id, name, email, role FROM users');
  res.render('admin', {
    user: req.user,       
    users: users.rows           
  });
     
});


pageRouter.get("/forgot-password", (req, res) => {
    res.render("forgot-password");
});

pageRouter.get("/reset-password/:token", (req, res) => {
    res.render("reset-password", { token: req.params.token });
});

pageRouter.get("/verify-email/:token", (req, res) => {
    // This is handled by the API route directly
    // so just redirect there
    res.redirect(`/users/verify-email/${req.params.token}`);
});

module.exports= pageRouter;