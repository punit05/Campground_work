var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");
var UserSchema=new mongoose.Schema(
    {
     // _id: mongoose.Schema.Types.ObjectId,
        username:String,
        password:String
    });
    UserSchema.plugin(passportLocalMongoose);//this will run some method
    module.exports = mongoose.model("User",UserSchema);