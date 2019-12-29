const express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    expressSanitizer = require('express-sanitizer'),
    dotEnv = require('dotenv').config()
host = process.env.HOST,
    port = process.env.PORT,
    app = express();



mongoose.connect('mongodb://localhost:27017/restful_blog_app', { useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true });

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
// parse query strings to PUT and DELETE requests... 
app.use(methodOverride("_method"));

var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: { type: Date, default: Date.now() }
});

var Blog = mongoose.model("Blog", blogSchema);

// Restful routes

app.get('/', (req, res) => {
    res.redirect('/blogs');
});


app.get('/blogs', (req, res) => {
    Blog.find({}, (err, blogs) => {
        if(err) { console.log(err); } else {
            res.render('index', { blogs: blogs });
        }
    });
});

app.get('/blogs/new', (req, res) => {
    res.render('new');
});


app.post('/blogs', (req, res) => {
    // create blog
    // sanitize blog post so no script tags can be passed through
    req.body.blog.body = req.sanitize(req.body.blog.body);

    Blog.create(req.body.blog, (err, newBlog) => {
        if(err) { res.render('new') } else { res.redirect('/blogs'); }
    });
});

app.get('/blogs/:id', (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err) { res.redirect('/blogs') } else {
            res.render('show', { blog: foundBlog });
        }
    });
});

app.get('/blogs/:id/edit', (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err) { console.log(err) } else {
            res.render('edit', { blog: foundBlog });
        }
    })



});

app.put('/blogs/:id', (req, res) => {
    // sanitize
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
        if(err) { res.redirect('/blogs') } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

app.delete('/blogs/:id', (req, res) => {
    Blog.findByIdAndRemove(req.params.id, function(err) {
        if(err) { res.redirect('/blogs'); } else { res.redirect('/blogs'); }
    });
});


app.listen(port, host, () => {
    console.log(`running blog server at http://${host}:${port}`);
});