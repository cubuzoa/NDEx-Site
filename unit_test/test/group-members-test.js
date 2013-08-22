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
	//var jid = {groupOwner : '', groupMember : '', group1 : ''};
	var groupOwnerJID = null;
	var groupMemberJID = null;
	var group1JID = null;
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
					groupOwnerJID = res.body.jid;
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
								groupMemberJID = res.body.jid;
								console.log('...2 users created...creating group...');
								request({
										method : 'POST',
										url : baseURL + '/groups/',
										json : {userid : groupOwnerJID , groupName : "Group1"}
									},
									function(err,res,body){
										if(err) { done(err) }
										else {
											res.should.have.status(200);
											group1JID = res.body.jid;
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
		var request1JID = null;
		it("should get 200 for creating request from group owner to group member", function(done){
			request({
					method : 'POST',
					url : baseURL + '/requests',
					json : {toid : groupMemberJID, fromid : groupOwnerJID, requestType: 'groupInvitation', message: 'this is a test', aboutid: group1JID}
				},
				function(err,res,body){
					if(err) { done(err) }
					else {
						//console.log(body.error);
						res.should.have.status(200);
						request1JID = res.body.jid;
						done();
					}
				}
			);
		});
		it("should get 200 for deleting request1", function(done){
			request({
					method : 'POST',
					url : baseURL + '/requests/' + request1JID,
					json : {approval : "approve"}
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
				url : baseURL + '/groups/' + group1JID	
			},
	  		function(err, res, body){
	  			if(err) { done(err) }
	  			else { 
	  				res.should.have.status(200);
	  				console.log('...group deleted...deleting group member...');
	  				request({
							method : 'DELETE',
							url : baseURL + '/users/' + groupMemberJID	
						},
				  		function(err, res, body){
				  			if(err) { done(err) }
				  			else { 
				  				res.should.have.status(200);
				  				console.log('...group member deleted...deleting group owner...');
				  				request({
										method : 'DELETE',
										url : baseURL + '/users/' + groupOwnerJID	
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
