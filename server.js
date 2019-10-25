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

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(function () {
    console.log("DB connected");
}).catch(function (err) {
    console.log(err)
});

app.get("/", function(req, res) {
    db.Article.find({}, function(err, data) {
        if(data.length === 0){
            res.redirect("/scrape");
        }
        else {
            res.redirect("/articles");
        }
    });
});

app.get("/scrape", function (req, res) {
    axios.get("https://www.nytimes.com/section/world").then(function (response) {
        var $ = cheerio.load(response.data);
        $("div.css-10wtrbd").each(function (i, element) {
            var result = {};
            result.title = $(this).children("h2").find("a").text();
            result.link = "https://www.nytimes.com" + $(this).children("h2").find("a").attr("href");
            result.body = $(this).children("p.css-1gh531.e4e4i5l4").text();
          
            db.Article.create({title: result.title, link: result.link, body: result.body}).then(function (dbArticle) {
                console.log(dbArticle);
            })
            .catch(function (err) {
                    console.log(err);
            });
        });
        res.send("scrape complete");
    });
});

app.get("/articles", function (req, res) {
    db.Article.find({}).then(function (dbArticle) {
        res.json(dbArticle);
    })
    .catch(function (err) {
        res.json(err);
    });
});

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

app.post("/articles/:id", function(req, res){
    db.Note.create(req.body).then(function(dbNote) {
        return db.Article.findOneAndUpdate({_id:req.params.id}, {$push: {note: dbNote._id }}, {new: true});
    })
    .then(function(dbArticle){
        res.json(dbArticle);
    })
    .catch(function(err) {
        res.json(err);
    });
});

app.post("/articles/:id", function(req, res) {
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