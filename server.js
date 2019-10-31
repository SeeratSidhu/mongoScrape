var express = require("express");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false  }).then(function () {
    console.log("DB connected");
}).catch(function (err) {
    console.log(err)
});

app.get("/", function(req, res) {
  res.send(index.html);
});

//route to clear articles
app.delete("/clear", function(req, res){
    db.Article.deleteMany({}, function(data){
        res.json(data);
    });
})
app.get("/scrape", function(req, res){
    axios.get("https://www.washingtonpost.com").then(function(response){
        var $ = cheerio.load(response.data);

        $("div.no-skin").each(function(i, element){
            var result = {};
            result.title = $(this).children("h2.headline").find("a").text();
            result.link = $(this).children("h2.headline").find("a").attr("href");
            result.body = $(this).children("div.blurb").text();
            if(result.title && result.link && result.body){
                db.Article.create({title: result.title, link: result.link, body: result.body}).then(function(dbArticle){
                    console.log(dbArticle);
                })
                .catch(function(err){
                    console.log(err);
                });
            }
            
        });
        res.send("Scrape Complete");
    });
});
//route to get all articles from db
app.get("/articles", function(req, res){
    db.Article.find({}).then(function(dbArticle){
        res.json(dbArticle);
    })
    .catch(function(err){
        res.json(err);
    })
});

//route to get articles based on id and populate with its note
app.get("/articles/:id", function(req, res){
    db.Article.findOne({_id: req.params.id})
    .populate("note")
    .then(function(dbArticle){
        res.json(dbArticle);
    })
    .catch(function(err){
        res.json(err);
    });
});

// Route to save/update note
app.post("/articles/:id", function(req, res){
    console.log(req.body);
    db.Note.create(req.body).then(function(dbNote) {
        console.log(dbNote);
        return db.Article.findOneAndUpdate({_id:req.params.id}, {$push: {note: dbNote._id }}, {new: true});
    })
    .then(function(dbArticle){
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});
// Route to delete comment
app.delete("/remove/:id", function(req, res) {
    db.Note.findByIdAndRemove(req.params.id, function(err, dbNote) {
        if (err) {
            return res.status(500).send(err);
        }
        else {
            return res.status(200).send("Successfully deleted " + dbNote._id);
        }
    })
});

app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});