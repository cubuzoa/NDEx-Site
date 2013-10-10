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
	should = require('should'),
    ndex = require('../ndex_modules/ndex-request.js');

describe('NDEx Group Profile: ', function () {
	var group1, groupOwner;
	before( function (done) {
		console.log('setup: user profile test');
        group1 = {jid : '', profile : {}, groupName : "Group1"};
        group1.profile.organizationName = 'Anonymous';
        group1.profile.website = 'http://www.op99.org';
        group1.profile.foregroundImg = 'none';
        group1.profile.backgroundImg = 'none';
        group1.profile.description = 'no one knows';
        groupOwner = {username : "groupOwner", password : "password"};
		ndex.post(
			'/users',
			{username : groupOwner.username, password : groupOwner.password},
			ndex.guest,
			function(err,res,body){
				if(err) { done(err) }
				else { 
					res.should.have.status(200);
					groupOwner.jid = res.body.jid;
					console.log('...user created...creating group');
					ndex.post(
						'/groups/',
						{userid : groupOwner.jid, groupName : group1.groupName},
						groupOwner,
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
	
	describe("group-profile", function(){

		it("should get 404 getting profile for non-existent Group Id", function(done){
			ndex.get(
				'/groups/C22R444444',
                {},
				groupOwner,
				function(err,res,body){
					if(err) { done(err) }
					else {
						res.should.not.have.status(200);
						done();
					}
				}
			);
		});

		it("should get 200 and '' getting profile of Group1", function(done){
			ndex.get(
				'/groups/' + group1.jid,
                {},
				groupOwner,
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
			ndex.post(
				'/groups/' + group1.jid + '/profile',
				{groupid: group1.jid, profile: group1.profile},
				groupOwner,
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
			ndex.get(
				'/groups/' + group1.jid,
                {},
				groupOwner,
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
			
			ndex.post(
				'/groups/' + group1.jid + '/profile',
				{groupid: group1.jid, profile: group1.profile},
				groupOwner,
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
			ndex.get(
				'/groups/' + group1.jid,
                {},
				groupOwner,
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
		console.log('teardown: group profile test')
		ndex.delete(
			'/groups/' + group1.jid,
			groupOwner,
	  		function(err, res, body){
	  			if(err) { done(err) }
	  			else { 
	  				res.should.have.status(200);
	  				console.log('...group deleted...deleting user...');
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
				  	);
	  			} 
	  		}
	  	);
	});
	
});	
