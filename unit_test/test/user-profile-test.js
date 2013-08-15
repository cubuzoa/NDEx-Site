/*
    get 404 getting profile for non-existent User Id
    get 200 and "" getting profile of User1
    get 200 posting profile to User1
    get 200 getting profile of User1
    verify that profile retrieved is identical to what was posted
    get 200 posting different profile to User1 - this time, strings contain control characters
    get 200 getting profile of User1
    verify that profile retrieved is identical to what was posted
*/

var request = require('request'),
	assert = require('assert'),
	should = require('should');
	
var baseURL = 'http://localhost:3333';

console.log("starting user profile test");
 
describe('NDEx User Profile: ', function () {
	//harryJID is to be used in multiple test cases
	var harryJID = null;
	before( function (done) {
		console.log('\nsetup: user profile test');
		request({
				method : 'POST',
				url : baseURL + '/users', 
				json : {username : "Harry", password : "password"}
			},
			function(err,res,body){
				if(err) { done(err) }
				else { 
					res.should.have.status(200)
					harryJID = res.body.jid
					console.log('...complete')
					done()
				}
			}
		);
	});
	describe('Access User Profile', function(){
		describe("getProfileOfNonExistentUser", function(){
			it("should get 404 for getting profile for non-existent User Id", function(done){
				request({
						method : 'GET',
						url : baseURL + '/users/C21R4444'
						//get profile?
					},
					function(err,res,body){
						if(err) { done(err) }
						else {
							res.should.have.status(404)
							done()
						}
					}
				);
			});
		});
		describe("getProfileFromUser", function(){
			it('should get 200 and "" on getting profile of Harry', function(done){
				request({
						method : 'GET',
						url : baseURL + '/users/' + harryJID,
						json : true
					},
					function(err,res,body){
						if(err) { done(err) }
						else {
							res.should.have.status(200)
							var profile = res.body.user.profile
							profile = profile.toString
							profile.should.have.length(0)
							//console.log(profile.length)
							done()
						}
					}
				);
			});
		});
		var harryProfile = {}; //to be used in other test
		describe("postProfileToUser", function(){
			it("should get 200 posting profile to User1", function(done){
				
				harryProfile.firstName = 'Harry';
				harryProfile.lastName = 'Potter';
				harryProfile.website = 'www.harrypotterwizardscollection.com‎';
				harryProfile.foregroundImg = 'harry.jpg';
				harryProfile.backgroundImg = 'wizard.jpg';
				harryProfile.description = 'I am a wizard';
				
				request({
						method : 'POST',
						url : baseURL + '/users/' + harryJID + '/profile',
						json : {userid: harryJID, profile: harryProfile}
					},
					function(err,res,body){
						if(err) { done(err) }
						else {
							res.should.have.status(200)
							//console.log(typeof(harryProfile))
							done()
						}
					}
				);
			});
		});
		describe("getProfileFromUser", function(){
			it('should get 200 on getting profile of Harry, should match updated profile', function(done){
				request({
						method : 'GET',
						url : baseURL + '/users/' + harryJID,
						json : true
					},
					function(err,res,body){
						if(err) { done(err) }
						else {
							res.should.have.status(200)
							var profile = res.body.user.profile
							//could only compare in string format
							profile = profile.toString
							profileAlpha = harryProfile.toString
							profile.should.equal(profileAlpha)
							//console.log(harryProfile)
							done()
						}
					}
				);
			});
		});
		
		describe("postProfileToUser", function(){
			it("should get 200 posting different profile to User1, strings include control char", function(done){
				//var harryProfile = {};
				harryProfile.firstName = "Harry\n";
				harryProfile.lastName = 'Potter\n';
				harryProfile.website = 'www.harrypotterwizardscollection.com\n‎';
				harryProfile.foregroundImg = 'harry.jpg\n';
				harryProfile.backgroundImg = 'wizard.jpg\n';
				harryProfile.description = 'I am a wizard\n';
				
				request({
						method : 'POST',
						url : baseURL + '/users/' + harryJID + '/profile',
						json : {userid: harryJID, profile: harryProfile}
					},
					function(err,res,body){
						if(err) { done(err) }
						else {
							res.should.have.status(200)
							//console.log(harryProfile.firstName)
							done()
						}
					}
				);
			});
		});
		describe("getProfileFromUser", function(){
			it('should get 200 on getting profile of Harry, should match update profile', function(done){
				request({
						method : 'GET',
						url : baseURL + '/users/' + harryJID,
						json : true
					},
					function(err,res,body){
						if(err) { done(err) }
						else {
							res.should.have.status(200)
							var profile = res.body.user.profile
							//could only compare in string format
							profile = profile.toString
							profileAlpha = harryProfile.toString
							profile.should.equal(profileAlpha)
							done()
						}
					}
				);
			});
		});
		
	});
	
	
	after( function (done) {
		console.log('\nteardown: user profile test')
		request({
				method : 'DELETE',
				url : baseURL + '/users/' + harryJID	
			},
	  		function(err, res, body){
	  			if(err) { done(err) }
	  			else { 
	  				res.should.have.status(200)
	  				console.log('...complete')
	  				done()
	  			} 
	  		}
	  	);
	});
});