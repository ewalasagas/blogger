var express = require("express");
var methodOverride = require("method-override");	//need for updte post - prevents put
var expressSanitizer = require("express-sanitizer");
var app 	= express();
var axios 	= require("axios");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

//APP CONFIG
mongoose.set("useFindAndModify", false);
mongoose.connect("mongodb://localhost/blog", {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});

//CREATING A NEW MODEL
var Blog = mongoose.model("Blog", blogSchema);

//CREATING EXAMPLE DATA
// Blog.create({
// 	title: "Test Blog",
// 	image: "https://s3-us-west-2.amazonaws.com/robogarden-new/Articles/upload/blogs/lg-leverage-of-coding.jpg",
// 	body: "Blog post number 1. I'm trying to finish what I can this month. Let's see if it's possible..."
// });

//INDEX ROUTE
app.get("/", function(req, res) {
	res.redirect("/blogs");
});


app.get("/blogs", function(req, res) {
	Blog.find({}, function(err, blogs) {
		if(err) {
			console.log("Error");
		} else {
			res.render("index", {blogs: blogs});
		}
	})
});

//NEW ROUTE
app.get("/blogs/new", function(req, res){
	res.render("new");
});

//CREATE ROUTE
app.post("/blogs", function(req, res) {
	//create blog
	console.log(req.body);
	req.body.blog.body = req.sanitize(req.body.blog.body);
	console.log("==============================");
	console.log(req.body);
	Blog.create(req.body.blog, function(err, newBlog) {
		if(err) {
			res.render("new");
		} else {
			res.redirect("/blogs");
		}
	});
});

//SHOW ROUTE
app.get("/blogs/:id", function(req, res) {
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err) {
			res.redirect("/blogs");
		} else {
			res.render("show", {blog: foundBlog});			
		}
	})
});

//EDIT
app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog) {
		if(err) {
			res.redirect("/blogs");
		} else {
			res.render("edit", {blog: foundBlog});
		}
	});
})

//UPDATE
app.put("/blogs/:id", function(req, res) {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
		if(err) {
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

//DESTROY ROUTE
app.delete("/blogs/:id", function(req, res) {
	//destroy blogs
	Blog.findByIdAndRemove(req.params.id, function(err) {
		if(err) {
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs");
		}
	});
});

//CONNECT TO THE SERVER
app.listen(3000, function() {
	console.log("Blog Server is running!");
});