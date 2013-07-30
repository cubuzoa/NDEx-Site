var request = require('request'),
	assert = require('assert')
	should = require('should');
	
var baseURL = 'http://localhost:9999';

console.log("starting user test");
 
describe('NDEx Users: ', function () {

/*  
  before(function(){
  	request(baseURL + '/users/fred', function(err, res, body){
  		if (res.statusCode == 404){
  			console.log("No user fred found, attempting to create");
			request(
						{
							method : 'GET',
							url : baseURL + '/users', 
							json : {username : "fred", password : "bird"}
						},
						function(err, res, body){
							if (err){
								console.log("error on create fred setup " + err);
								throw err;
							}
							console.log("response to create fred setup " + res);
							done();
						 }
					);
		} else if (res.statusCode == 500){
			console.log("Internal error when querying for user fred");
			done();
		} else if (res.statusCode == 200){
			console.log("Found user fred");
			done();
		} else {
			console.log("Unexpected response " + res.statusCode)
			done();
		}
	  });
  });
*/
    
  describe('getUserByNonExistantUserId', function(){
  
  	it("should get 404 for non-existant user adsf", function (done){
  		request({
  				url: baseURL + '/users/adsf'
  				},
  				function(err, res, body){
  					res.should.have.status(404)
  					done();
  				});	
  	});
  });

  describe('getUserByExistingUserId', function(){
  
  	it("should get 200 for existing user C21R0", function (done){
  		request({
  				url: baseURL + '/users/C21R0'
  				},
  				function(err, res, body){
  					res.should.have.status(200)
  					done();
  				});	
  	});
  });
    
  describe('failToCreateUserWithUsernameAlreadyInUse', function(){
  
  	it("should get 500 for attempting to create user with username already taken", function (done){
  		request({
							method : 'POST',
							url : baseURL + '/users', 
							json : {username : "fred", password : "bird"}
				},
  				function(err, res, body){
  					res.should.have.status(500)
  					done();
  				});	
  	});
  });
  
});


/*

  
  var uname = null;

  users.discuss('Basic operations on NDExUser resources:')
       .use('localhost', 3333)
       .setHeader('Content-Type', 'application/json')
       
       .discuss('make sure that there is no user with username fred')
       .get('/users/fred')
       .expect(404)
       
       .discuss('create a User with username = fred and password = bird')
       .post('/users', {username : 'fred', password : 'bird'})
    	.expect(200)
    	
       .discuss('find list of users by username expression')
       .get('/users?nameExpression=fr*')
       .expect(200)
       .expect('size of user list should not be zero', function (err, res, body){
       		var users = body.users;
       		assert.isNotZero(users.size);
       		})
       		
       	.discuss('find fred by exact username')
       	.get('/users/fred')
       	.expect(200)
       	.expect({username : 'fred'})
       	
       	.discuss('delete fred')
       .del('/users/fred')
       .expect(200)
       
       .export(module);
       
*/