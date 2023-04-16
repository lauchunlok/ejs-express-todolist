require("dotenv").config();
// console.log(process.env);

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

/**
 * Mongoose
 */
const uri = process.env.ATLAS_URI;
main().catch((err) => console.log(err));

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

const itemsSchema = new mongoose.Schema({
    name: String,
});

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema],
});

const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);

/**
 * app logic
 */

const defaultItem1 = new Item({ name: "Welcome to your todolist!" });
const defaultItem2 = new Item({ name: "Hit the + button to add a new item" });
const defaultItem3 = new Item({ name: "<--- Hit this to delete the item." });

const defaultItems = [defaultItem1, defaultItem2, defaultItem3];

app.get("/", function (req, res) {
    const day = date.getDate();

    Item.find({})
        .then(function (foundItems) {
            // if there's no item, insert some items
            // but to avoid insert items everytime restarting the server
            if (foundItems.length === 0) {
                Item.insertMany(defaultItems)
                    .then(function () {
                        console.log("Successfully saved default items to DB");
                    })
                    .catch(function (err) {
                        console.log(err);
                    });

                // redirect to home route and go to else-statement to render
                res.redirect("/");
            } else {
                res.render("list", {
                    listTitle: "Today",
                    newListItems: foundItems,
                });
            }
        })
        .catch(function () {
            console.log("Unable to saved default items to DB");
        });
});

app.post("/", function (req, res) {
    // const item = req.body.newItem;

    const item = new Item({ name: req.body.newItem });
    const listName = req.body.list;

    if (listName === "Today") {
        item.save()
            .then((item) => item + " has been added.")
            .catch((err) => handleError(err));

        res.redirect("/");
    } else {
        List.findOne({ name: listName }).then(function (foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

app.post("/delete", function (req, res) {
    // console.log(req.body.checkbox);
    const listName = req.body.listName;
    const checkedItemId = req.body.checkbox;

    if (listName === "Today") {
        Item.findByIdAndDelete(checkedItemId)
            .then(console.log("Deleted checked item"))
            .catch((err) => handleError(err));

        res.redirect("/");
    } else {
        List.findOneAndUpdate(
            { name: listName },
            { $pull: { items: { _id: checkedItemId } } }
        ).then(function (foundList) {
            res.redirect("/" + listName);
        });
    }
});

// Express Route Parameters
app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    if (customListName !== "About") {
        List.findOne({ name: customListName }).then(function (foundList) {
            //existing list
            if (foundList) {
                res.render("list", {
                    listTitle: foundList.name,
                    newListItems: foundList.items,
                });
            } else {
                // create new list
                const list = new List({
                    name: customListName,
                    items: defaultItems,
                });
                list.save();

                res.redirect("/" + customListName);
            }
        });
    } else {
        res.render("about");
    }
});

app.get("/about", function (req, res) {
    res.render("about");
});

app.get("/favicon.ico", (req, res) => res.status(204).end());

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
    });
});
