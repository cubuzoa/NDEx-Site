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
	should = require('should'),
    ndex = require('../ndex_modules/ndex-request.js');
 
describe('group-basic', function () {

	//josh is to be used in multiple test cases
	var josh, group1, group2;
	before( function (done) {
		console.log('setup: group-basic test');
        josh = {username : "Josh", password : "password"};
        group1 = {groupName : "Group1"};
        group2 = {groupName : "Group2"};
		ndex.post(
			'/users',
			{username : josh.username, password : josh.password},
			ndex.guest,
			function(err,res,body){
				if(err) { done(err) }
				else { 
					//console.log(JSON.stringify(body));
					res.should.have.status(200);
					josh.jid = res.body.jid;
					console.log('...complete');// confirmation of completion
					done();
				}
			}
		);
	});
	
	describe('group-basic', function(){
		describe(" -> group-basic non-existent", function(){
			it("should get 404 for attempting to create group with non-existent user", function(done){
				ndex.post(
					'/groups/',
					{userid : "C21R4444", groupName : "TestGroup"},
					josh,
					function(err,res,body){
						if(err) { done(err) }
						else {
							res.should.not.have.status(200);
							done();
						}
					}
				);
			});
		});

		describe(" -> group-basic invalid groupName", function(){
			it("should get 400 for attempting to create group with invalid groupname", function(done){
				ndex.post(
					'/groups/',
					{userid : josh.jid , groupName : "$!invalid!"},
					josh,
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

		describe(" -> group-basic create ok", function(){
			it("should get 200 for attempting to create group for Josh, returns JID", function(done){
				ndex.post(
					'/groups/',
					{userid : josh.jid , groupName : group1.groupName},
					josh,
					function(err,res,body){
						if(err) { done(err) }
						else {
							res.should.have.status(200);
							group1.jid = res.body.jid;
							//console.log(res.body.jid)
							done();
						}
					}
				);
			});
		});

		describe(" -> group-basic taken name", function(){
			it("should get 500 for attempting to create group with taken groupname", function(done){
				ndex.post(
					'/groups/',
					{userid : josh.jid , groupName : group1.groupName},
					josh,
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

		describe(" -> group-basic access", function(){
			it("should get 200 for attempting to get group1", function(done){
				ndex.get(
					'/groups/' + group1.jid,
                    {},
                    josh,
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

		describe(" -> group-basic user owned groups", function(){
			it("should get 200 for attempting to get user josh and find group1 in owned", function(done){
				ndex.get(
					'/users/' + josh.jid,
                    {},
					josh,
					function(err,res,body){
						if(err) { done(err) }
						else {
							res.should.have.status(200);
							var ownedGroups = res.body.user.ownedGroups;
							var firstOwnedGroup = ownedGroups[0];
							group1.jid.should.equal(firstOwnedGroup.jid);
							//console.log(firstOwnedGroup.jid)
							done();
						}
					}
				);
			});
		});

		describe(" -> group-basic delete non-existent", function(){
			it("should get 404 for attempting to delete group by non-existent jid C22R444444", function(done){
				ndex.delete(
					'/groups/C22R444444',
					josh,
					function(err,res,body){
						if(err) { done(err) }
						else {
							res.should.not.have.status(200);
							done();
						}
					}
				);
			});
		});

		describe(" -> group-basic delete ok", function(){
			it("should get 200 for attempting to delete group1", function(done){
				ndex.delete(
					'/groups/' + group1.jid,
					josh,
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

		describe(" -> group-basic delete already deleted", function(){
			it("should get 404 for attempting to get deleted group1", function(done){
				ndex.delete(
					'/groups/' + group1.jid,
					josh,
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

		describe(" -> group-basic get user and show deleted group not owned", function(){
			it("should get 200 for attempting to get user josh, should not find group1", function(done){
				ndex.get(
					'/users/' + josh.jid,
                    {},
					josh,
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

		describe(" -> group-basic create second group", function(){
			it("should get 200 for attempting to create another group for Josh, returns JID", function(done){
				ndex.post(
					'/groups/',
					{userid : josh.jid , groupName : group2.groupName},
					josh,
					function(err,res,body){
						if(err) { done(err) }
						else {
							res.should.have.status(200);
							group2.jid = res.body.jid;
							//console.log(res.body.jid)
							done();
						}
					}
				);
			});
		});

		describe(" -> group-basic delete second group", function(){
			it("should get 200 for attempting to delete group2", function(done){
				ndex.delete(
					'/groups/' + group2.jid,
					josh,
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

		describe(" -> group-basic get with malformed id", function(){
			it("should get 400 for attempting to get group with malformed JID CC21R0", function(done){
				ndex.get(
					'/groups/CC21R0',
                    {},
					josh,
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
		console.log('teardown: group-basic test')
		ndex.delete(
			'/users/' + josh.jid,
			josh,
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
