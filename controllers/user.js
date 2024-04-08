const User = require("../models/user.js");

module.exports.renderRegisterFrom = (req,res)=>{
    res.render("users/register.ejs");
}

module.exports.registerNewUser = async(req,res)=>{
    // trying the error in case the username already exists in the databse, we send out a flash and back to register page
    try{
        const { email, username, password} = req.body;
        const user = await new User({username:username, email:email});
        // .register takes in the instance of new user and the password and it hashes the password into our user instance
        const registeredUser =  await User.register(user,password);
        console.log(registeredUser);
        // when we register, we also login the user
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
    }catch(e){
        req.flash("error", e.message);
        res.redirect("/register");
    }
    
}

module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login.ejs");
}

module.exports.loginUser = (req,res)=>{
    req.flash("success", "Welcome Back to YelpCamp");
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);

}
//By using the storeReturnTo middleware function, we can save the returnTo value to res.locals before passport.authenticate() clears the session
// and deletes req.session.returnTo. This enables us to access and 
//use the returnTo value (via res.locals.returnTo) later in the middleware chain so that we can redirect users to the appropriate page after they have logged in.
// use the storeReturnTo middleware to save the returnTo value from session to res.locals
// passport.authenticate logs the user in and clears req.session

module.exports.logoutUser = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}