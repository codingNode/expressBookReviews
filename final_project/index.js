const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const app = express();
app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){

    if(req.session.authorization) {
        token = req.session.authorization['token'];
     // comparing the token with the one generated in the log in with the token present in the session
        jwt.verify(token, "secret_key",(err,user)=>{
            if(!err){
                req.user = user;
                next();
            }
            else{
                return res.status(403).json({message: "User not authenticated", error: err})
            }
         });
     } else {
         return res.status(403).json({message: "User not logged in"})
     }

});
 
const PORT =5000;

app.use("/customer", customer_routes); //from the auth_users.js
app.use("/", genl_routes);
app.listen(PORT,()=>console.log("Server is running on port ", PORT));