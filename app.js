//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost/wikiDB', {
	useNewUrlParser: true,
	useUnifiedTopology: true
}, function (err) {
	if (!err) {
		console.log("Mongo Server successfully connected!");
	}
});

const wikiSchema = new mongoose.Schema({
	title: {
		type: String,
		required: (true, "Please enter a title. Title not found")
	},
	content: {
		type: String,
		required: (true, "Please enter some content about the program. No content found.")
	}
});

const Article = mongoose.model('article', wikiSchema);



/////////////////////////////////////////////////All Articles/////////////////////////////////////




app.route("/articles").get(function (req, res) {
	Article.find({}, function (err, foundArticles) {
		if (!err) {
			res.send(foundArticles);
		} else {
			res.send(err);
		}
	});

}).post(function (req, res) {
	const ntitle = req.body.title;
	const ncontent = req.body.content;

	const newArticle = new Article({
		title: ntitle,
		content: ncontent
	});

	newArticle.save(function (err) {
		if (!err) {
			res.send(`There were no errors in adding the article ${ntitle}`);
		} else {
			res.send(err);
		}
	});
}).delete(function (req, res) {

	Article.deleteMany(function (err) {
		if (!err) {
			res.send("Successfully deleted all articles.")
		} else {
			res.send(err);
		}
	})
});


///////////////////////////////////// Specific Article///////////////////////////////////////////////////////




app.route("/articles/:topic").get(function (req, res) {
	Article.findOne({
			title: req.params.topic
		},
		function (err, foundArticle) {
			if (!err) {
				if (foundArticle) {
					res.write("Here is the documentation you are looking for.\n");
					res.write("----------------------------------------------\n");
					res.write("\n");
					res.write(`Title: ${foundArticle.title}\n`);
					res.write(`Description: ${foundArticle.content}\n`);
					res.send();
				} else {
					res.send("There are no articles with that name.")
				}
			} else {
				res.send(err)
			}
		});
}).put(function (req, res) {
	const ntitle = req.body.title;
	const ncontent = req.body.content;

	Article.update({
		title: req.params.topic
	}, {
		title: ntitle,
		content: ncontent
	}, {
		overwrite: true
	}, function (err) {
		if (!err) {
			res.write("There were no errors when changing the documents\n");
			res.write(`The title has been change to ${ntitle}\n`);
			res.write(`The description has been changed to ${ncontent}`);
			res.send()
		} else {
			res.send(err);
		}
	})
}).patch(function (req, res) {
	Article.update({
			title: req.params.topic
		},
		//it will look inside and find whats needs to be changed
		{
			$set: req.body
		},
		function (err) {
			if (!err) {
				res.send("Successfully Updated the Document.");
			} else {
				res.send(err);
			}
		}
	)
}).delete(function (req, res) {
	Article.deleteOne(
		{title: req.params.topic},
		function(err) {
			if(!err) {
				res.send("Item successfully deleted.");
			} else {
				res.send(err);
			}
		}
	)
});









app.listen(3000, function () {
	console.log("Server started on port 3000");
});