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
	should = require('should'),
    ndex = require('../ndex_modules/ndex-request.js');
 
describe('group-members', function () {

    //var jid = {groupOwner : '', groupMember : '', group1 : ''};
	var groupOwner, groupMember, group1, request1;

	before( function (done) {
		console.log('setup: group-members');
        groupOwner = {username : "GroupOwner", password : "password"};
        groupMember = {username : "GroupMember", password : "password"};
        group1 = {groupname : "Group1"};
        request1 = {};
		ndex.post(
			'/users',
			{username : groupOwner.username, password : groupOwner.password},
            ndex.guest,
			function(err,res,body){
				if(err) { done(err) }
				else { 
					//console.log(JSON.stringify(body));
					res.should.have.status(200);
					groupOwner.jid = res.body.jid;

					console.log("...groupOwner created with id = " + groupOwner.jid + "...creating second user...");
					ndex.post(
						'/users',
						{username : groupMember.username, password : groupMember.password},
						ndex.guest,
						function(err,res,body){
							if(err) { done(err) }
							else { 
								//console.log(JSON.stringify(body));
								res.should.have.status(200);
								groupMember.jid = res.body.jid;
								console.log("...groupMember created with id = " + groupMember.jid + "...creating group...");
								ndex.post(
									'/groups/',
									{userid : groupOwner.jid , groupName : group1.groupname},
									groupOwner,
									function(err,res,body){
										if(err) { done(err) }
										else {
											res.should.have.status(200);
											group1.jid = res.body.jid;
                                            console.log("...group created with id = " + group1.jid + "...creating group...");
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

	describe("group-members", function(){

		it("should get 200 for creating request from group owner to group member", function(done){
			ndex.post(
				'/requests',
				{toid : groupMember.jid, fromid : groupOwner.jid, requestType: 'groupInvitation', message: 'this is a test', aboutid: group1.jid},
				groupOwner,
				function(err,res,body){
					if(err) { done(err) }
					else {
						//console.log(body.error);
						res.should.have.status(200);
                        console.log("request from group owner to group member created with id = " + res.body.jid);
						request1.jid = res.body.jid;
						done();
					}
				}
			);
		});

		it("should get 200 for deleting request1", function(done){
			ndex.post(
				'/requests/' + request1.jid,
				{approval : "approve"},
                groupMember,
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
		console.log('teardown: group-members');
		ndex.delete(
			'/groups/' + group1.jid,
            groupOwner,
	  		function(err, res, body){
	  			if(err) { done(err) }
	  			else { 
	  				res.should.have.status(200);
	  				console.log('...group deleted...deleting group member...');
	  				ndex.delete(
						'/users/' + groupMember.jid,
						groupMember,
				  		function(err, res, body){
				  			if(err) { done(err) }
				  			else { 
				  				res.should.have.status(200);
				  				console.log('...group member deleted...deleting group owner...');
				  				ndex.delete(
									'/users/' + groupOwner.jid,
									groupOwner,
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
