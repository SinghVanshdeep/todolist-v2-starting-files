import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import lodash from "lodash";
import "dotenv/config";


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect(`mongodb+srv://admin-vansh:${process.env.PASSWORD}@cluster0.qbxixox.mongodb.net/todolistDB`);

const itemsSchema = mongoose.Schema({
  name: String
});

const Items = mongoose.model("Item", itemsSchema);

const item1 = new Items({
  name: "This is your To Do List"
});

const item2 = new Items({
  name: "Click + to add items to the list"
});

const item3 = new Items({
  name: "<-- To delete item from the list"
});

const defaultItems = [item1, item2, item3];

const listSchema = mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);


app.get("/", async function(req, res) {

  const items = await Items.find({});

  if (items.length === 0){
    Items.insertMany(defaultItems);
    res.redirect("/");
  }
  else{
    res.render("list", {listTitle: "Today", newListItems: items});
  }
});

app.post("/", async function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Items({
    name: itemName
  });

  if (listName === "Today"){
    newItem.save();
    res.redirect("/");
  }else{
    const foundList = await List.findOne({name: listName});
    foundList.items.push(newItem);
    foundList.save();
    res.redirect("/"+listName);
  }
});

app.post("/delete", async function(req, res){
  const checkedItemdId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    await Items.findByIdAndRemove(checkedItemdId);
    res.redirect("/");
  }else{
    const query = await List.findOneAndUpdate({
      name: listName,
      $pull: {items: {_id: checkedItemdId}}
    });
    res.redirect("/"+listName);
  }

});

app.get("/:customListName", async function(req, res){
  const customListName = lodash.capitalize(req.params.customListName);

  const query = await List.findOne({name: customListName});

  if (query){
    res.render("list.ejs", {listTitle: customListName, newListItems: query.items});
  }else{
    const list = new List({
      name: customListName,
      items: defaultItems
    });
  
    list.save();
    res.redirect("/"+customListName);
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
