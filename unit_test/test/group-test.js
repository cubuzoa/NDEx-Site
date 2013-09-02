/*
    Get 404 on creating group for non-existent user	
    Get 400 and appropriate error message on creating group with invalid groupname
    Get 200 on creating group1 owned by user1 with novel groupname, returns JID
    Get 500 and appropriate error message when attempting to create group with groupname already used
    Get 200 getting group1 by JID
    Get 200 getting user1, should find group1 (including correct JID) in ownedGroups 
    Get 404 on deleting group by non-existent JID
    Get 200 on deleting group1 by JID
    Get 404 on trying to get deleted group1 by JID
    Get 200 on getting user1, group1 should no longer be in ownedGroups for user1	
    Get 200 on creating group2 with novel name, returns JID. JID from group1 should NOT be reused.
    Get 200 on deleting group2 by JID
    Get 500 on getting group by malformed JID
*/

var request = require('request'),
	assert = require('assert'),
	should = require('should');
	
var baseURL = 'http://localhost:3333';
 
describe('NDEx Groups: ', function () {
    console.log("starting group test");
	//joshJID is to be used in multiple test cases
	var joshJID = null;
	before( function (done) {
		console.log('\nsetup: group test');
		request({
				method : 'POST',
				url : baseURL + '/users', 
				json : {username : "Josh", password : "password"}
			},
			function(err,res,body){
				if(err) { done(err) }
				else { 
					//console.log(JSON.stringify(body));
					res.should.have.status(200);
					joshJID = res.body.jid;
					console.log('...complete');// confirmation of completion
					done();
				}
			}
		);
	});
	
	describe('Testing Group Commands', function(){
		describe("createGroupForNonExistantUser", function(){
			it("should get 404 for attempting to create group with non-existent user", function(done){
				request({
						method : 'POST',
						url : baseURL + '/groups/',
						json : {userid : "C21R4444", groupName : "TestGroup"}
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
		});
		describe("createGroupWithInvalidGroupname", function(){
			it("should get 400 for attempting to create group with invalid groupname", function(done){
				request({
						method : 'POST',
						url : baseURL + '/groups/',
						json : {userid : joshJID , groupName : "$!invalid!"}
					},
					function(err,res,body){
						if(err) { done(err) }
						else {
							res.should.have.status(400);
							//console.log(res.body)
							done();
						}
					}
				);
			});
		});
		var ValidNameJID = null;
		describe("createGroupForUser", function(){
			it("should get 200 for attempting to create group for Josh, returns JID", function(done){
				request({
						method : 'POST',
						url : baseURL + '/groups/',
						json : {userid : joshJID , groupName : "ValidName"}
					},
					function(err,res,body){
						if(err) { done(err) }
						else {
							res.should.have.status(200);
							ValidNameJID = res.body.jid;
							//console.log(res.body.jid)
							done();
						}
					}
				);
			});
		});
		describe("createGroupWithTakenGroupname", function(){
			it("should get 500 for attempting to create group with taken groupname", function(done){
				request({
						method : 'POST',
						url : baseURL + '/groups/',
						json : {userid : joshJID , groupName : "ValidName"}
					},
					function(err,res,body){
						if(err) { done(err) }
						else {
							res.should.have.status(500);
							done();
						}
					}
				);
			});
		});
		describe("getGroupById", function(){
			it("should get 200 for attempting to get group ValidName", function(done){
				request({
						method : 'GET',
						url : baseURL + '/groups/' + ValidNameJID
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
		describe("getUserAndFindGroups", function(){
			it("should get 200 for attempting to get user Harry, find ValidName group", function(done){
				request({
						method : 'GET',
						url: baseURL + '/users/' + joshJID,
						json : true
					},
					function(err,res,body){
						if(err) { done(err) }
						else {
							res.should.have.status(200);
							var groupData = res.body.user.ownedGroups;
							groupData = groupData[0];
							ValidNameJID.should.equal(groupData.jid);
							//console.log(groupData.jid)
							done();
						}
					}
				);
			});
		});
		describe("deleteGroupByNonExistantId", function(){
			it("should get 404 for attempting to delete group by nonexistant jid C22R444444", function(done){
				request({
						method : 'DELETE',
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
		});
		describe("deleteGroupById", function(){
			it("should get 200 for attempting to delete group" + ValidNameJID, function(done){
				request({
						method : 'DELETE',
						url : baseURL + '/groups/' + ValidNameJID
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
		describe("getDeletedGroupById", function(){
			it("should get 404 for attempting to get deleted group ValidName", function(done){
				request({
						method : 'GET',
						url : baseURL + '/groups/' + ValidNameJID
						
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
		});
		describe("getUserAndFindGroupsNotDeleted", function(){
			it("should get 200 for attempting to get user Harry, should not find ValidName group", function(done){
				request({
						method : 'GET',
						url: baseURL + '/users/' + joshJID,
						json: true
					},
					function(err,res,body){
						if(err) { done(err) }
						else {
							res.should.have.status(200);
							var groupData = res.body.user.ownedGroups;
							groupData.should.be.empty;
							//console.log(groupData.length)//.jid)
							done();
						}
					}
				);
			});
		});
		var group2JID = null;
		describe("createGroup2ForUser", function(){
			it("should get 200 for attempting to create another group for Josh, returns JID", function(done){
				request({
						method : 'POST',
						url : baseURL + '/groups/',
						json : {userid : joshJID , groupName : "NameIsValid"}
					},
					function(err,res,body){
						if(err) { done(err) }
						else {
							res.should.have.status(200);
							group2JID = res.body.jid;
							//console.log(res.body.jid)
							done();
						}
					}
				);
			});
		});
		describe("deleteGroup2ById", function(){
			it("should get 200 for attempting to delete group2" + group2JID, function(done){
				request({
						method : 'DELETE',
						url : baseURL + '/groups/' + group2JID
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
		describe("getGroupByMalformedId", function(){
			it("should get 400 for attempting to get group with malformed JID CC21R0", function(done){
				request({
						method : 'GET',
						url : baseURL + '/groups/CC21R0'
					},
					function(err,res,body){
						if(err) { done(err) }
						else {
							res.should.have.status(400);
							done();
						}
					}
				);
			});
		});
		
	});
	
	after( function (done) {
		console.log('\nteardown: group test')
		request({
				method : 'DELETE',
				url : baseURL + '/users/' + joshJID	
			},
	  		function(err, res, body){
	  			if(err) { done(err) }
	  			else { 
	  				res.should.have.status(200);
	  				console.log('...complete');// confirmation of completion
	  				done();
	  			} 
	  		}
	  	);
	});
	
});
