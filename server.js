var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var MONGODBURL ='mongodb://michellefurby.cloudapp.net:27017/test';
//var MONGODBURL ='mongodb://localhost/test';

var restaurantSchema = require('./models/restaurant');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


var getRequest = function(res,criteria){

	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var Restaurant = mongoose.model('Restaurant', restaurantSchema);
		Restaurant.find(criteria,function(err,results){
			if (err) {
				res.status(500).json(err);
				throw err
			}
			if (results.length > 0) {
				console.log('Found: ',results.length);
				res.status(200).json(results);
			}
			else {
				res.status(200).json({message: 'No matching document'});
			}
			db.close();
		});
	});

}

app.get('/:attrib/:attrib_value', function(req,res) {
	console.log("find with one attrib");
	var criteria = {};
	if(req.params.attrib=="street"||req.params.attrib=="zipcode"||req.params.attrib=="building"){
		criteria["address."+req.params.attrib] = req.params.attrib_value;
	}
	else if (req.params.attrib=="coord"){
	console.log("lat/lon");
		criteria["address.coord"] = req.params.attrib_value;
	}
	else if (req.params.attrib=="date"||req.params.attrib=="grade"||req.params.attrib=="score"){
		criteria["grades."+req.params.attrib] = req.params.attrib_value;
	}
	else{
		criteria[req.params.attrib] = req.params.attrib_value;
	}
	getRequest(res,criteria);	
	
});


app.get('/:attrib1/:attrib_value1/:attrib2/:attrib_value2', function(req,res) {
	console.log("find with 2 attrib");
	var criteria = {};

	//check attrib1
	if(req.params.attrib1=="street"||req.params.attrib1=="zipcode"||req.params.attrib1=="building"){
		criteria["address."+req.params.attrib1] = req.params.attrib_value1;
	}
	else if (req.params.attrib1=="coord"){
		criteria["address.coord"] = req.params.attrib_value1;
	}
	else if (req.params.attrib1=="date"||req.params.attrib1=="grade"||req.params.attrib1=="score"){
		criteria["grades."+req.params.attrib1] = req.params.attrib_value1;
	}
	else 
	{
		criteria[req.params.attrib1] = req.params.attrib_value1;
	}
	//check attrib2
	if(req.params.attrib2=="street"||req.params.attrib2=="zipcode"||req.params.attrib2=="building"){
		criteria["address."+req.params.attrib2] = req.params.attrib_value2;
	}	
	else if(req.params.attrib2=="coord"){
		criteria["address.coord"] = req.params.attrib_value2;
	}
	else if (req.params.attrib2=="date"||req.params.attrib2=="grade"||req.params.attrib2=="score"){
		criteria["grades."+req.params.attrib2] = req.params.attrib_value2;
	}
	else
	{
		criteria[req.params.attrib2] = req.params.attrib_value2;
	}
	
	getRequest(res,criteria);
});

		
/*app.get('/address/:attrib/:attrib_value', function(req,res) {
	console.log("find address")
	var criteria = {};
	criteria["address."+req.params.attrib] = req.params.attrib_value;
	getRequest(res,criteria);
});*/

app.get('/coord/:attrib_value1/:attrib_value2', function(req,res) {
	console.log("find coord with two value")
	var criteria = {};

	criteria["address.coord.0"]= req.params.attrib_value1;
	criteria["address.coord.1"] = req.params.attrib_value2;
	console.log(criteria);
	getRequest(res,criteria);
});



app.get('/score/:attrib/:attrib_value', function(req,res){
	console.log("find score");

	var value = parseInt(req.params.attrib_value);
	var criteria ={};

        var c ={};
	c["$"+req.params.attrib]=value;
	var b={};
	b["score"]=c;
	var a={};
	a["$elemMatch"]=b;
	criteria["grades"]=a;

	getRequest(res,criteria);
	
});

app.post('/',function(req,res) {

	var restaurantSchema = require('./models/restaurant');
	mongoose.connect('mongodb://localhost/test');
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var rObj = {};
		rObj.address = {};
		rObj.address.building = req.body.building;
		rObj.address.street = req.body.street;
		rObj.address.zipcode = req.body.zipcode;
		rObj.address.coord = [];
		rObj.address.coord.push(req.body.lon);
		rObj.address.coord.push(req.body.lat);
		rObj.borough = req.body.borough;
		rObj.cuisine = req.body.cuisine;
		rObj.grades=[];
		var a = {};
		if(req.body.date!=null){
  		 a.date = req.body.date;
  		}
  		if(req.body.grade!=null){
   		 a.grade = req.body.grade;
  		}
  		if(req.body.score!=null){
  		  a.score = parseInt(req.body.score);
 		 }
  		if(req.body.date!=null||req.body.grade!=null||req.body.score!=null){
  		 rObj.grades.push(a);
  		}
		
		
		rObj.name = req.body.name;
		rObj.restaurant_id = req.body.restaurant_id;

		var Restaurant = mongoose.model('Restaurant', restaurantSchema);
		var r = new Restaurant(rObj);
		
		r.save(function(err) {
       		if (err) {
				res.status(500).json(err);
				throw err
			}
       		
       		db.close();

			res.status(200).json({message: 'insert done', id: r._id});
    	});
    });
});


app.delete('/:attrib/:attrib_value',function(req,res) {
	//console.log('Incoming request: DELETE');
	var criteria = {};

	if(req.params.attrib=="street"||req.params.attrib=="zipcode"||req.params.attrib=="building"){
		criteria["address."+req.params.attrib] = req.params.attrib_value;
	}
	
	else if (req.params.attrib=="date"||req.params.attrib=="grade"||req.params.attrib=="score"){
		criteria["grades."+req.params.attrib] = req.params.attrib_value;
	}
	else{
		criteria[req.params.attrib] = req.params.attrib_value;
	}

	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
	var Restaurant = mongoose.model('Restaurant', restaurantSchema);
		Restaurant.remove(criteria,function(err,results){
       		if (err) {
				res.status(500).json(err);
				throw err
			}	
		
		res.status(200).json({message: 'delete done '+ req.params.attrib + ":"+req.params.attrib_value});
		
		//console.log('Restaurant removed!');
		db.close();	
    	});
    });
});

app.delete('/:attrib1/:attrib_value1/:attrib2/:attrib_value2',function(req,res) {
	//console.log('Incoming request: DELETE');
	var criteria = {};

	if (req.params.attrib1=="coord"&&req.params.attrib2=="coord"){
		criteria["address.coord.0"]= req.params.attrib_value1;
		criteria["address.coord.1"] = req.params.attrib_value2;
	}
	
	if (req.params.attrib1=="date"||req.params.attrib1=="grade"||req.params.attrib1=="score"){
		criteria["grades."+req.params.attrib1] = req.params.attrib_value1;
	}
	else if(req.params.attrib1=="street"||req.params.attrib1=="zipcode"||req.params.attrib1=="building"){
		criteria["address."+req.params.attrib1] = req.params.attrib_value1;
	}
	else {
		criteria[req.params.attrib1] = req.params.attrib_value1;
	}

	if (req.params.attrib2=="date"||req.params.attrib2=="grade"||req.params.attrib2=="score"){
		criteria["grades."+req.params.attrib2] = req.params.attrib_value2;
	}
	else if(req.params.attrib2=="street"||req.params.attrib2=="zipcode"||req.params.attrib2=="building"){
		criteria["address."+req.params.attrib2] = req.params.attrib_value2;
	}
	else {
		criteria[req.params.attrib2] = req.params.attrib_value2;
	}
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
	var Restaurant = mongoose.model('Restaurant', restaurantSchema);
		Restaurant.remove(criteria,function(err,results){
       		if (err) {
				res.status(500).json(err);
				throw err
			}	
		
		res.status(200).json({message: 'delete done '+ req.params.attrib1 + ":"+req.params.attrib_value1+","+ req.params.attrib2 + ":"+req.params.attrib_value2});
		//console.log('Restaurant removed!');
		db.close();	
    	});
    });
});


app.put('/updateother/:findatt/:find_value/:attrib', function(req,res) {
	var criteria = {};
	criteria[req.params.findatt]=req.params.find_value;
	var updated={};
	if(req.params.attrib=="street"||req.params.attrib=="zipcode"||req.params.attrib=="building"){
		if (req.params.attrib=="street"){
			updated["address.street"] = req.body.street;
		}
		else if (req.params.attrib=="zipcode"){
			updated["address.zipcode"] = req.body.zipcode;
		}
		else{
			updated["address.building"] = req.body.building;
		}
	}
	
	if (req.params.attrib=="name"||req.params.attrib=="cuisine"||req.params.attrib=="borough"||req.params.attrib=="restaurant_id"){
		if (req.params.attrib=="name"){
			updated["name"] = req.body.name;
		}
		else if (req.params.attrib=="cuisine"){
			updated["cuisine"] = req.body.cuisine;
		}
		else if (req.params.attrib=="borough"){
			updated["borough"] = req.body.borough;
		}
		else if (req.params.attrib=="restaurant_id"){
			updated["restaurant_id"] = req.body.restaurant_id;
		}
	}
	console.log(updated);
	//console.log(criteria);
	//console.log(updated);
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var Restaurant = mongoose.model('Restaurant', restaurantSchema);
		//Restaurant.update({id:req.params.id},{$set:criteria},function(err){
		Restaurant.update(criteria,{$set:updated},function(err){

			if (err) {
				console.log("Error: " + err.message);
				res.write(err.message);
			}
			else {
				console.log("update successful");
				res.status(200).json({message: 'updated'})
				db.close();
				res.end('Done',200);
			}
		});
	});
});

/*app.put('/:criteria/:attrib1/:attrib_value1/:attrib2/:attrib_value2', function(req,res) {
//no address
	var criteria = {};
	criteria[req.params.attrib1] = req.params.attrib_value1;
	criteria[req.params.attrib2] = req.params.attrib_value2;
	console.log(criteria);
	
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var Restaurant = mongoose.model('Restaurant', restaurantSchema);
		//Restaurant.update({id:req.params.id},{$set:criteria},function(err){
		Restaurant.update(criteria,function(err,results){

			if (err) {
				console.log("Error: " + err.message);
				res.write(err.message);
			}
			else {
				console.log("update successful");
				res.status(200).json({message: 'updated'})
				db.close();
				res.end('Done',200);
			}
		});
	});
});
*/



app.put('/:findatt/:find_value/grade', function(req,res) {

	var criteria = {};
	criteria[req.params.findatt]=req.params.find_value;
	
	var updated={};
	var a = {};

		a.date = req.body.date;
		a.grade = req.body.grade;
		a.score = parseInt(req.body.score);

	updated["grades"]=a;
	
	/*a.date = req.body.date;
	a.grade = req.body.grade;
	a.score = parseInt(req.body.score);*/
	//console.log("123",a);
	//console.log("2",updated);
	
	mongoose.connect(MONGODBURL);
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function (callback) {
		var Restaurant = mongoose.model('Restaurant', restaurantSchema);
		//Restaurant.update({id:req.params.id},{$set:criteria},function(err){
		Restaurant.update(criteria,{$push:updated},function(err){

			if (err) {
				console.log("Error: " + err.message);
				res.write(err.message);
			}
			else {
				
				console.log("update successful");
				res.status(200).json({message: 'updated'})
				db.close();
				res.end('Done',200);
			}
		});
	});
});
app.listen(process.env.PORT || 8099);
