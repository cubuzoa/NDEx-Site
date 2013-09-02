/*Setup:

    create Group1

Should:

TODO: add tests to catch cases where user is not group owner, does not exist, etc.

    get 404 getting profile for non-existent Group Id
    get 200 and "" getting profile of Group1
    get 200 posting profile to Group1
    get 200 getting profile of Group1
    verify that profile retrieved is identical to what was posted
    get 200 posting different profile to Group1 - this time, strings contain control characters
    get 200 getting profile of Group1
    verify that profile retrieved is identical to what was posted

Teardown

    delete Group1
*/

var request = require('request'),
	assert = require('assert'),
	should = require('should');
	
var baseURL = 'http://localhost:3333';

describe('NDEx Group Profile: ', function () {
    console.log("starting group profile test");
	var group1 = {jid : '', profile : {}};
	var group1JID = null;
	before( function (done) {
		console.log('\nsetup: user profile test');
		request({
				method : 'POST',
				url : baseURL + '/users', 
				json : {username : "groupOwner", password : "password"}
			},
			function(err,res,body){
				if(err) { done(err) }
				else { 
					res.should.have.status(200);
					groupOwnerJID = res.body.jid;
					console.log('...user created...creating group');
					request({
						method : 'POST',
						url : baseURL + '/groups/',
						json : {userid : groupOwnerJID, groupName : "Group1"}
						},
						function(err, res, body){
							if(err) { done(err) }
							else{
								res.should.have.status(200);
								group1.jid = res.body.jid;
								console.log('...complete');
								done();
							}
						}
					);
				}
			}
		);
	});
	
	describe("Should:", function(){
		it("should get 404 getting profile for non-existent Group Id", function(done){
			request({
					method : 'GET',
					url : baseURL + '/groups/C22R444444'
				},
				function(err,res,body){
					if(err) { done(err) }
					else {
						res.should.have.status(404);
						done();
					}
				}
			);
		});
		it("should get 200 and '' getting profile of Group1", function(done){
			request({
					method : 'GET',
					url : baseURL + '/groups/' + group1.jid,
					json : true
				},
				function(err,res,body){
					if(err) { done(err) }
					else {
						res.should.have.status(200);
						res.body.group.profile.toString.should.have.length(0);
						done();
					}
				}
			);
		});
		it("get 200 posting profile to Group1", function(done){
			group1.profile.organizationName = 'Anonymous';
			group1.profile.website = 'http://www.op99.org';
			group1.profile.foregroundImg = 'none';
			group1.profile.backgroundImg = 'none';
			group1.profile.description = 'no one knows';
			
			request({
					method : 'POST',
					url : baseURL + '/groups/' + group1.jid + '/profile',
					json : {groupid: group1.jid, profile: group1.profile}
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
		it("should get 200 getting profile of Group1", function(done){
			request({
					method : 'GET',
					url : baseURL + '/groups/' + group1.jid,
					json : true
				},
				function(err,res,body){
					if(err) { done(err) }
					else {
						res.should.have.status(200);
						group1.profile.toString.should.equal(res.body.group.profile.toString);//toString allows should.equal
						done();
					}
				}
			);
		});
		it("get 200 posting different profile to Group1", function(done){
			group1.profile.organizationName = 'OpenSource';
			group1.profile.website = 'http://www.opensource.org';
			group1.profile.foregroundImg = 'none';
			group1.profile.backgroundImg = 'none';
			group1.profile.description = 'none';
			
			request({
					method : 'POST',
					url : baseURL + '/groups/' + group1.jid + '/profile',
					json : {groupid: group1.jid, profile: group1.profile}
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
		it("should get 200 getting different profile of Group1", function(done){
			request({
					method : 'GET',
					url : baseURL + '/groups/' + group1.jid,
					json : true
				},
				function(err,res,body){
					if(err) { done(err) }
					else {
						res.should.have.status(200);
						group1.profile.toString.should.equal(res.body.group.profile.toString);//toString allows should.equal
						done();
					}
				}
			);
		});
	});
	
	after( function (done) {
		console.log('\nteardown: group profile test')
		request({
				method : 'DELETE',
				url : baseURL + '/groups/' + group1.jid	
			},
	  		function(err, res, body){
	  			if(err) { done(err) }
	  			else { 
	  				res.should.have.status(200);
	  				console.log('...group deleted...deleting user...');
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
				  	);
	  			} 
	  		}
	  	);
	});
	
});	
