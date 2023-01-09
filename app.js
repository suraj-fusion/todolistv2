const express=require("express");

const https=require("https");

const bodyParser=require("body-parser");

const date=require(__dirname+"/date.js");

const _=require("lodash");

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/public"));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');





const mongoose = require("mongoose");  //require mongoose

mongoose.set('strictQuery', true); //related to mongoose idk






// creating a new database in mongodb using mongoose

mongoose.connect('mongodb+srv://suraj-fusion:surajraj@cluster0.z5cqkyz.mongodb.net/todoListDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

//creating a schema for itemms
const itemsSchema={
  name:String
};



//creating a model or a collection based on this schema

const items=mongoose.model("item",itemsSchema); // the passed argument string gets automatically converted to items

//creating an instance(object) of the model or a collection
const item1=new items({
  name:"Welcome to your todolist"
});

const item2=new items({
  name:"Hit the + button to add a new item"
});

const item3=new items({
  name:"<---Hit this to delete an item"
});

//saving all the added items


const defaultitems=[item1,item2,item3];


//creating a schema for custom list

const listSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);


// ------------------------------------------------------PATHS(Routes)---------------------------------------------------------------------------------------------------------------------



app.get("/",function(req,res){

    items.find(function(err,founditems){

      if(founditems.length === 0)
      {
        items.insertMany(defaultitems,function(err){
          if(err)
          {
            console.log(err);
          }
          else{
            console.log("successfully inserted default items to database");
          }
        });
        res.redirect("/");
      }
      else
      {
        res.render("list",{listTitle:"Today",list:founditems});
      }
    
   
 });
  

});

app.post("/",function(req,res){

  const itemname= req.body.newitem;
  const listName= req.body.listTitle;
  const newitem=new items({
    name:itemname
  });

  if(listName==="Today")
  {
    newitem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
          foundList.items.push(newitem);
          foundList.save();
          res.redirect("/"+listName);
    });
  }

  console.log("Successfully added one item");

})

app.post("/delete",function(req,res)
{
    const checkeditemid=req.body.checkbox;
    const listName = req.body.listTitleh;
    console.log(req.body);
    if(listName==="Today")
    {
      
      items.findByIdAndRemove(checkeditemid,function(err){
        if(err)
        {
          console.log("error in deleting");
        }
        else
        {
          console.log("deleted successfully");
        }
      });
  
      res.redirect("/");
    }
    else
    {
      List.findOneAndRemove({name:listName},{$pull:{items:{id:checkeditemid}}},function(err,foundList){
        if(!err){
          res.redirect("/"+listName);
        }
      });

     

     

    }


    
});



//express route parameters
app.get("/:customListName",function(req,res){
        const customListName= _.capitalize(req.params.customListName);
        List.findOne({name:customListName},function(err,foundList){
            if(!err)
            {
              if(!foundList) // Create  a new list
              {
                 const list =new List({
                  name:customListName,
                  items:defaultitems
                });
                list.save();
                res.redirect("/"+customListName);
              }
              else //show an existing list
              {
                  res.render("list",{listTitle:foundList.name,list:foundList.items});
              }
              
            }
        });
        

});





app.get("/about",function(req,res){
    res.render("about");
})

app.listen(process.env.PORT || 3000,function(){
    console.log("Server started on port 3000");
});