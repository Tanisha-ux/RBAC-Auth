const express=require("express");
const app=express();
const PORT=3001;

const cookieParser=require("cookie-parser");
const { restrictToLoggedInUser } = require("./middlewares/auth.js"); 
const {loginLimiter, signupLimiter}=require("./controllers/limiters.js");
const userRouter = require("./routes/user.js");
const pageRouter = require("./routes/page.js");
const recordRouter = require("./routes/record.js"); 
const helmet = require("helmet");

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(helmet(
    {
    contentSecurityPolicy: false
}
)); 

app.use("/api/users/login",  loginLimiter);
app.use("/api/users/signup", signupLimiter);

app.use("/api/users",userRouter);
app.use("/api/records",restrictToLoggedInUser, recordRouter); 
app.use("/", pageRouter);

app.listen(PORT,()=>{
    console.log("Server started on PORT:"+ PORT);
})