/*Setup:

create User: GroupOwner
create User: GroupMember
create Group: Group1
Should:

Teardown

delete Group1
delete User: GroupMember
delete User: GroupOwner*/

var request = require('request'),
	assert = require('assert'),
	should = require('should');
	
var baseURL = 'http://localhost:3333';

console.log("starting group members test");
 
describe('NDEx Group Members: ', function () {
	var jid = {groupOwner : '', groupMember : '', group1 : ''};
	before( function (done) {
		console.log('\nsetup: group members test');
		request({
				method : 'POST',
				url : baseURL + '/users', 
				json : {username : "GroupOwner", password : "password"}
			},
			function(err,res,body){
				if(err) { done(err) }
				else { 
					//console.log(JSON.stringify(body));
					res.should.have.status(200);
					jid.groupOwner = res.body.jid;
					console.log('...1 user created...creating second user...');
					request({
							method : 'POST',
							url : baseURL + '/users', 
							json : {username : "GroupMember", password : "password"}
						},
						function(err,res,body){
							if(err) { done(err) }
							else { 
								//console.log(JSON.stringify(body));
								res.should.have.status(200);
								jid.groupMember = res.body.jid;
								console.log('...2 users created...creating group...');
								request({
										method : 'POST',
										url : baseURL + '/groups/',
										json : {userid : jid.groupOwner , groupName : "Group1"}
									},
									function(err,res,body){
										if(err) { done(err) }
										else {
											res.should.have.status(200);
											jid.group1 = res.body.jid;
											done();
										}
									}
								);//close create group
							}
						}
					);//close create group member
				}
			}
		);//close create group owner
	});
	describe("Should : ", function(){
		it("should get 200 for creating request from group owner to group member", function(done){
			request({
					method : 'POST',
					url : baseURL + '/requests',
					json : {toid : jid.groupMember, fromid : jid.groupOwner}
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
		console.log('\nteardown: group members test')
		request({
				method : 'DELETE',
				url : baseURL + '/groups/' + jid.group1	
			},
	  		function(err, res, body){
	  			if(err) { done(err) }
	  			else { 
	  				res.should.have.status(200);
	  				console.log('...group deleted...deleting group member...');
	  				request({
							method : 'DELETE',
							url : baseURL + '/users/' + jid.groupMember	
						},
				  		function(err, res, body){
				  			if(err) { done(err) }
				  			else { 
				  				res.should.have.status(200);
				  				console.log('...group member deleted...deleting group owner...');
				  				request({
										method : 'DELETE',
										url : baseURL + '/users/' + jid.groupOwner	
									},
							  		function(err, res, body){
							  			if(err) { done(err) }
							  			else { 
							  				res.should.have.status(200);
							  				console.log('...complete');
							  				done();
							  			} 
							  		}
							  	);//close delete group owner
				  			} 
				  		}
				  	);//close delete group member
	  			} 
	  		}
	  	);//close delete group
	});
});
