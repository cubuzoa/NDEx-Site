
var request = require('request'),
	assert = require('assert'),
	should = require('should');
	
var baseURL = 'http://localhost:3333';

console.log("starting tasks test");
 
describe('NDEx Tasks: ', function () {
	var userJID = null;
	before( function (done) {
		console.log('\nsetup: tasks test');
		request({
				method : 'POST',
				url : baseURL + '/users', 
				json : {username : "User", password : "password"}
			},
			function(err,res,body){
				if(err) { done(err) }
				else { 
					//console.log(JSON.stringify(body));
					res.should.have.status(200);
					userJID = res.body.jid;
					console.log('...complete');
					done();
				}
			}
		);
	});
	
	describe("Should : ", function(){
		var task1JID = null;
		it("should get 200 for creating task for user", function(done){
			request({
					method : 'POST',
					url : baseURL + '/tasks',
					json : {task: "modify network", userid: userJID}
				},
				function(err,res,body){
					if(err) { done(err) }
					else {
						//console.log(body);
						res.should.have.status(200);
						task1JID = res.body.jid;
						done();
					}
				}
			);
		});
		it("should get 200 for getting task1", function(done){
			request({
					method : 'GET',
					url : baseURL + '/tasks/' + task1JID,
					json : true
				},
				function(err,res,body){
					if(err) { done(err) }
					else {
						console.log(body.task);
						res.should.have.status(200);
						done();
					}
				}
			);
		});
		it("should get 200 for updating task1", function(done){
			request({
					method : 'POST',
					url : baseURL + '/tasks/' + task1JID,
					json : {status : "inactive"}
				},
				function(err,res,body){
					if(err) { done(err) }
					else {
						//console.log(body);
						res.should.have.status(200);
						done();
					}
				}
			);
		});
		it("should get 200 for getting updated task1", function(done){
			request({
					method : 'GET',
					url : baseURL + '/tasks/' + task1JID, 
					json : true
				},
				function(err,res,body){
					if(err) { done(err) }
					else {
						console.log("\n" + body.task);
						res.should.have.status(200);
						done();
					}
				}
			);
		});
		it("should get 200 for deleting task1", function(done){
			request({
					method : 'DELETE',
					url : baseURL + '/tasks/' + task1JID
				},
				function(err,res,body){
					if(err) { done(err) }
					else {
						res.should.have.status(200);
						done();
					}
				}
			);
		});
	});
	
	after( function (done) {
		console.log('\nteardown: tasks test')
		request({
				method : 'DELETE',
				url : baseURL + '/users/' + userJID	
			},
	  		function(err, res, body){
	  			if(err) { done(err) }
	  			else { 
	  				res.should.have.status(200);
	  				console.log('...complete');
	  				done();
	  			}
	  		}
	  	);
	  });
});
