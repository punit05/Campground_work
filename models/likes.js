var mongoose=require("mongoose");
 var likeSchema=mongoose.Schema(
     {
         
         author:
         {
        //   id:
        //   {
        //    type:mongoose.Schema.Types.ObjectId,
        //    ref:"User"
        //   },
          username:String
         },
         campgroundliked:{
        name:String
         },
        likedOn: {
            type: Date,
            default: Date.now
        },

          
         
     });
     module.exports=mongoose.model("Like",likeSchema);