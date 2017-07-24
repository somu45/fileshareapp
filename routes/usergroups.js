var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST

router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
      }
}))

router.route('/')
    //GET all usergroups
    .get(function(req, res, next) {
        //retrieve all usergroups from Monogo
        mongoose.model('Usergroup').find({}, function (err, usergroups) {
              if (err) {
                  return console.error(err);
              } else {
                  //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                  res.format({
                      //HTML response will render the index.jade file in the views/usergroups folder. We are also setting "usergroups" to be an accessible variable in our jade view
                    html: function(){
                        res.render('usergroups/index', {
                              title: 'All my User Groups',
                              "usergroups" : usergroups
                          });
                    },
                    //JSON response will show all usergroups in JSON format
                    json: function(){
                        res.json(infophotos);
                    }
                });
              }     
        });
    })
    //POST a new usergroup
    .post(function(req, res) {
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
        var name = req.body.name;
        //call the create function for our database
        mongoose.model('Usergroup').create({
            name : name
        }, function (err, usergroup) {
              if (err) {
                  res.send("There was a problem adding the information to the database.");
              } else {
                  //Usergroup has been created
                  console.log('POST creating new usergroup: ' + usergroup);
                  res.format({
                      //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function(){
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("usergroups");
                        // And forward to success page
                        res.redirect("/usergroups");
                    },
                    //JSON response will show the newly created usergroup
                    json: function(){
                        res.json(usergroup);
                    }
                });
              }
        })
    });


/* GET New Usergroup page. */
router.get('/new', function(req, res) {
    res.render('usergroups/new', { title: 'Add New Usergroup' });
});


// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    //console.log('validating ' + id + ' exists');
    //find the ID in the Database
    mongoose.model('Usergroup').findById(id, function (err, usergroup) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            console.log(id + ' was not found');
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function(){
                    next(err);
                 },
                json: function(){
                       res.json({message : err.status  + ' ' + err});
                 }
            });
        //if it is found we continue on
        } else {
            //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
            //console.log(usergroup);
            // once validation is done save the new item in the req
            req.id = id;
            // go to the next thing
            next(); 
        } 
    });
});


router.route('/:id')
  .get(function(req, res) {
    mongoose.model('Usergroup').findById(req.id, function (err, usergroup) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        console.log('GET Retrieving ID: ' + usergroup._id);
        res.format({
          html: function(){
              res.render('usergroups/show', {
                "usergroup" : usergroup
              });
          },
          json: function(){
              res.json(usergroup);
          }
        });
      }
    });
  });


  //GET the individual usergroup by Mongo ID
router.get('/:id/edit', function(req, res) {
    //search for the usergroup within Mongo
    mongoose.model('Usergroup').findById(req.id, function (err, usergroup) {
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
            //Return the usergroup
            console.log('GET Retrieving ID: ' + usergroup._id);
            //format the date properly for the value to show correctly in our edit form
            res.format({
                //HTML response will render the 'edit.jade' template
                html: function(){
                       res.render('usergroups/edit', {
                          title: 'Usergroup' + usergroup._id,
                          "usergroup" : usergroup
                      });
                 },
                 //JSON response will return the JSON output
                json: function(){
                       res.json(usergroup);
                 }
            });
        }
    });
});


//PUT to update a usergroup by ID
router.put('/:id/edit', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    var name = req.body.name;

   //find the document by ID
        mongoose.model('Usergroup').findById(req.id, function (err, usergroup) {
            //update it
            usergroup.update({
                name : name
            }, function (err, usergroupID) {
              if (err) {
                  res.send("There was a problem updating the information to the database: " + err);
              } 
              else {
                      //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                      res.format({
                          html: function(){
                               res.redirect("/usergroups/" + usergroup._id);
                         },
                         //JSON responds showing the updated values
                        json: function(){
                               res.json(usergroup);
                         }
                      });
               }
            })
        });
});

//DELETE a Usergroup by ID
router.delete('/:id/edit', function (req, res){
    //find Usergroup by ID
    mongoose.model('Usergroup').findById(req.id, function (err, usergroup) {
        if (err) {
            return console.error(err);
        } else {
            //remove it from Mongo
            usergroup.remove(function (err, usergroup) {
                if (err) {
                    return console.error(err);
                } else {
                    //Returning success messages saying it was deleted
                    console.log('DELETE removing ID: ' + usergroup._id);
                    res.format({
                        //HTML returns us back to the main page, or you can create a success page
                          html: function(){
                               res.redirect("/usergroups");
                         },
                         //JSON returns the item with the message that is has been deleted
                        json: function(){
                               res.json({message : 'deleted',
                                   item : usergroup
                               });
                         }
                      });
                }
            });
        }
    });
});


module.exports = router;

