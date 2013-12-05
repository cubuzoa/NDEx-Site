

var request = require('request'),
	assert = require('assert'),
	should = require('should'),
    ndex = require('../ndex_modules/ndex-request.js');
 
describe('group-basic', function () {

	//josh is to be used in multiple test cases
	var josh, group1, group2;
	before( function (done) {
		console.log('setup: group-basic test');
        josh = {
            username : "Josh",
            password : "password",
            emailAddress : "josh@example.com"
        };
        group1 = {
            name : "Group1",
            organizationName: "fake",
            website: "fake",
            description: "fake"
        };
        group2 = {
            name : "Group2",
            organizationName: "fake",
            website: "fake",
            description: "fake"
        };

        group3 = {
            name : "Group3",
            organizationName: "fake",
            website: "fake",
            description: "fake"
        };

        invalidGroup = {
            name : "$!invalid!",
            organizationName: "fake",
            website: "fake",
            description: "fake"
        };

		ndex.put(
			'/users',
			{
                username : josh.username,
                password : josh.password,
                emailAddress : josh.emailAddress
            },
			ndex.guest,
			function(err,res,body){
				if(err) { done(err) }
				else { 
					//console.log(JSON.stringify(body));
					res.should.have.status(200);
					josh.id = res.body.id;
					console.log('...complete');// confirmation of completion
					done();
				}
			}
		);
	});
	
	describe('group-basic', function(){
		describe(" -> group-basic non-existent", function(){
			it("should not get 200 when attempting to create group with non-existent user", function(done){
				ndex.put(
					'/groups/',
					{
                        ownerId : "C21R4444",
                        newGroup : group3
                    },
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
			it("should not get 200 for attempting to create group with invalid groupname", function(done){
				ndex.put(
					'/groups/',
					{
                        ownerId : josh.id ,
                        newGroup : invalidGroup
                    },
					josh,
					function(err,res,body){
						if(err) { done(err) }
						else {
							res.should.not.have.status(200);
							//console.log(res.body)
							done();
						}
					}
				);
			});
		});

		describe(" -> group-basic create ok", function(){
			it("should get 200 for attempting to create group1 for Josh, returns group id", function(done){
				ndex.put(
					'/groups/',
                    {
                        ownerId : josh.id ,
                        newGroup : group1
                    },
					josh,
					function(err,res,body){
						if(err) { done(err) }
						else {
                            console.log("new group response: " + JSON.stringify(res.body));
							res.should.have.status(200);
							group1.id = res.body.id;
							//console.log(res.body.jid)
							done();
						}
					}
				);
			});
		});

		describe(" -> group-basic taken name", function(){
			it("should not get 200 when attempting to create group with taken groupname", function(done){
				ndex.put(
					'/groups/',
					{
                        ownerId : josh.id ,
                        newGroup : group1
                    },
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

		describe(" -> group-basic access", function(){
			it("should get 200 for attempting to get group1", function(done){
				ndex.get(
					'/groups/' + group1.id,
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
					'/users/' + josh.id,
                    {},
					josh,
					function(err,res,body){
						if(err) { done(err) }
						else {
                            console.log(JSON.stringify(res.body));
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
			it("should not get 200 when attempting to delete group by non-existent id C22R444444", function(done){
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
					'/groups/' + group1.id,
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
			it("should not get 200 when attempting to get deleted group1", function(done){
				ndex.delete(
					'/groups/' + group1.id,
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

		describe(" -> group-basic get user and show deleted group not owned", function(){
			it("should get 200 for attempting to get user josh, should not find group1", function(done){
				ndex.get(
					'/users/' + josh.id,
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
			it("should get 200 for attempting to create another group for Josh, returns id", function(done){
				ndex.put(
					'/groups/',
					{
                        ownerId : josh.id ,
                        newGroup : group2
                    },
					josh,
					function(err,res,body){
						if(err) { done(err) }
						else {
							res.should.have.status(200);
							group2.id = res.body.id;
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
					'/groups/' + group2.id,
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
			it("should not get 200 for attempting to get group with malformed JID CC21R0", function(done){
				ndex.get(
					'/groups/CC21R0',
                    {},
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
		
	});
	
	after( function (done) {
		console.log('teardown: group-basic test')
		ndex.delete(
			'/users/' + josh.id,
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
