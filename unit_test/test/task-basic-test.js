
var request = require('request'),
	assert = require('assert'),
	should = require('should'),
    ndex = require('../ndex_modules/ndex-request.js');

 
describe('task-basic', function () {

    var user1, task1;
	before( function (done) {
		console.log('setup: tasks test');
        user1 = {username : "User1xe45e", password : "password"};
        task1 = {description: "modify network"};
		ndex.post(
			'/users',
			{username : user1.username, password : user1.password},
			ndex.guest,
			function(err,res,body){
				if(err) { done(err) }
				else { 
					//console.log(JSON.stringify(body));
					res.should.have.status(200);
					user1.jid = res.body.jid;
					console.log('...complete');
					done();
				}
			}
		);
	});
	
	describe(" -> task-basic", function(){
		it("should get 200 for creating task for user", function(done){
			ndex.post(
				'/tasks',
				{task: task1.description, userid: user1.jid},
				user1,
				function(err,res,body){
					if(err) { done(err) }
					else {
						//console.log(body);
						res.should.have.status(200);
						task1.jid = res.body.jid;
						done();
					}
				}
			);
		});

		it("should get 200 for getting task1", function(done){
			ndex.get(
				'/tasks/' + task1.jid,
                {},
				user1,
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
			ndex.post(
				'/tasks/' + task1.jid,
				{status : "inactive"},
				user1,
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
			ndex.get(
				'/tasks/' + task1.jid,
                {},
				user1,
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
			ndex.delete(
				'/tasks/' + task1.jid,
				user1,
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
		console.log('teardown: tasks test')
		ndex.delete(
			'/users/' + user1.jid,
			user1,
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
