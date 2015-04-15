var express = require('express');
var sqlite3 = require('sqlite3')
var fs = require('fs');
var Mustache = require('mustache');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var db = new sqlite3.Database('./puppies.db');
var app = express();

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false}));
app.use(methodOverride('_method'));

app.get('/', function(req, res){
  res.send(fs.readFileSync('./views/index.html', 'utf8'));
});

app.post('/puppies/create', function(req, res){
  console.log(req.body);
  db.run("INSERT INTO puppies (breed, color) VALUES ('" + req.body.breed + "','" + req.body.color + "')");
  res.send('puppy created');
});

app.get('/puppies', function(req, res) {
  var template = fs.readFileSync('./views/puppies.html', 'utf8');

  db.all('SELECT * FROM puppies;', function(err, puppies) {
    var html = Mustache.render(template, {allDemPuppies: puppies});
    res.send(html);
  })
});

app.get('/puppies/:id', function(req, res){
  var id = req.params.id;
  db.all("SELECT * FROM puppies WHERE id = " + id + ";", {}, function(err, puppy){
    fs.readFile('./views/show.html', 'utf8', function(err, html){
      console.log(puppy);
      // Sending just the single puppy object. No need to iterate this way. Sweet.
      var renderedHTML = Mustache.render(html, puppy[0]);
      res.send(renderedHTML);
    });
  });
});

app.delete('/puppies/:id', function(req, res){
  var id = req.params.id;
  db.run("DELETE FROM puppies WHERE id = " + id + ";");
  res.redirect("/puppies");
});

app.put('/puppies/:id', function(req, res){
  var id = req.params.id;
  var puppyInfo = req.body;
  db.run("UPDATE puppies SET breed =  '" + puppyInfo.breed + "', color = '" + puppyInfo.color + "' WHERE id = " + id + ";");
  res.redirect('/puppies');
});

app.listen(3000, function() {
  console.log("LISTENING!");
});