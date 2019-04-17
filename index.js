var express=require("express");
var app=express();
var bodyparser=require("body-parser");
var mongoose=require("mongoose");
var Campground=require("./models/campground");
var Comment=require("./models/comment");
var methodOverride=require("method-override");
var passport=require("passport");
var LocalStrategy=require("passport-local");
var User=require("./models/user");

app.use(require("express-session")(
    {
        secret:"IT IS HARD",
        resave:false,
        saveuninitialized:false
    }));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect('mongodb://localhost:27017/Yelp_Camp', {useNewUrlParser: true});
mongoose.Promise = global.Promise;




app.set("view engine" ,"ejs"); 
app.use(express.static(__dirname + "/public"));

app.use(function(req,res,next)
{
    // console.log(req.locals.currentUser);
    res.locals.currentUser=req.user;
    // res.locals.error=req.flash("error");
    //  res.locals.success=req.flash("success");
    
    next();
});

app.use(bodyparser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.get("/campgrounds",function(req,res)
{
    console.log(req.user);
   //get all campgrounds from db
   Campground.find({},function(err,allCampgrounds)
   {
       if(err)
       {
           console.log(err);
       }
       {
        return res.status(400).send({
            success: 'true',
            message: 'All the campgrounds',
            Campground: allCampgrounds
        })
    
       }
   })
   
});
 app.post("/campgrounds",function(req,res)
{
    var name=req.query.name;
    var price=req.query.price;
    var image=req.query.image;
    var desc=req.query.description;
    var author={
       // id:req.user._id,
        username:req.user.username
    }
    var newcampground={name:name,price:price,image:image,description:desc,author:author};
    Campground.create(newcampground,function(err,newlycreated)
    {
       if(err)
       {
           console.log(err);
       }
       else 
       {
          res.json({
            message: "Data received successfully",
            data:newlycreated
          })
       }
    });
});

 app.get("/campgrounds/:id",function(req,res)
{
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground)
    {
        if(err)
        {
            console.log(err);
        }
        else 
        {
        
            return res.status(400).send({
                success: 'true',
                message: 'Mission Successful',
              
                campground:foundCampground
            })
        }
        
    });
    
    
});




// app.get("/campgrounds/:id/edit",checkCampgroundOwnership,function(req, res) {
//     Campground.findById(req.params.id,function(err, foundCampground)
//     {


//        // res.render("edit",{campground:foundCampground});
//     });

//   check first if user logged in if logged in thendoes user own the campground if both the case then hold good otherise rdiect somewhere
//if user loged in



//});  
//update campground
app.put("/campgrounds/:id",function(req,res)
{
//we have group image name descr in one campground in edit form so that we can use them all together

console.log("body",req.query.campground);
Campground.findByIdAndUpdate(req.params.id,req.query.campground,function(err,updatedCampground)
{
   if(err)
   {
       console.log(err);
       res.redirect("/campgrounds");
   }
   else 
   {
       console.log(updatedCampground);
       res.redirect("/campgrounds/" + req.params.id);
   }
});
});

//Destroy campground route
app.delete("/campgrounds/:id",function(req,res)
{
Campground.findByIdAndRemove(req.params.id,function(err)
{
   
   if(err)
   {
   console.log(err)
}
else 
{
  console.log("DOne deleting");
  res.redirect("/campgrounds")
}
});
});
// =======comments routes======
app.get("/campgrounds/:id/comments",function(req,res)
{
    Campground.findById(req.params.id,function(err,campground)
    {
        if(err)
        {
            console.log(err);
        }
        else 
        {
            return res.status(400).send({
                success: 'true',
                message: 'Mission Successful',
              
                data:campground
            })
        }
    });
});
app.post("/campgrounds/:id/comments"  ,isLoggedIn ,function(req,res)//here we are putting isloggedin to prevent everyone from writing a comment if we send a post request in postman it will let us type the comment
{
    Campground.findById(req.params.id,function(err,campground)
    {
        if(err)
        {
            console.log(err);          
        }
        else 
        {
            var text=req.query.text;
            var newComment={text:text};
            console.log(req.query.text);
            Comment.create(newComment,function(err,comment)
            {
                if(err)
                {
                    console.log("Comm not created");
                    console.log(err);
                }
                else {

                    console.log(req.user);
                   // comment.author.id=req.user._id;
                    comment.author.username=req.user.username;
                    comment.save();
                   // console.log(req.user.username);
                    
                    
                    //console.log(comment);

                   console.log("Comment created")
                    campground.comments.push(comment);
                    campground.save();
                   
                   return res.status(400).send({
                    success: 'true',
                    message: 'Mission Successful',
                  
                   data:campground
                }) 
                }
            })    ;
        }
    });
}); 
app.post("/register",function(req, res) {
    var newUser=new User({username:req.query.username,_id:mongoose.Types.ObjectId()});
   User.register(newUser,req.query.password,function(err,user)
   {
       if(err)
       {
           console.log(err);    
         // return res.render("register");
       }
       else{
        passport.authenticate("local")(req,res,function()
           {
            return res.status(400).send({
                success: 'true',
                message: 'Mission Successful',
              
               data:user    
            })   
           })
           console.log(user)   
       }
    
   }) ;  
});
app.post("/login", passport.authenticate("local",
{
    successRedirect:"/campgrounds",
    failureRedirect:"/campgrounds"
}),
    function(req, res) {
   
});
app.get("/logout",function(req, res) {
    req.logout();
    
    res.json("Logged out");
});
function isLoggedIn(req,res,next)
{
    if(req.isAuthenticated())
    {
        return next();
    } 
}
function checkCampgroundOwnership(req,res,next)
{
    if(req.isAuthenticated())
  {
      //another if statement for 
        Campground.findById(req.params.id,function(err, foundCampground)
            {               
            if(err)
            {
                console.log(err)
            }
            else
        {       
           if(foundCampground.author.id.equals(req.user._id))
           {
          next();
           }
           else 
           {
              res.json("error");
           }
           
       }
   });  
  }
  else 
  {
    res.json("error");
  } 
}
const PORT = process.env.port || 5000;

app.listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log(`WOOHOO Server is running on port ${PORT}`)
});