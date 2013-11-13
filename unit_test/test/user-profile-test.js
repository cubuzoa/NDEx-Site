
var request = require('request'),
	assert = require('assert'),
	should = require('should'),
    ndex = require('../ndex_modules/ndex-request.js')

 
describe('user-profile', function () {

    //harry is used in multiple test cases
	var harry, profileAlpha;
	before( function (done) {
		console.log('setup: user profile test');
        harry = {username : "Harry", password : "password", profile : {}};
		ndex.post(
			'/users',
			{username : harry.username, password : harry.password},
			ndex.guest,
			function(err,res,body){
				if(err) { done(err) }
				else { 
					res.should.have.status(200)
					harry.jid = res.body.jid
					console.log('...complete')
					done()
				}
			}
		);
	});

	describe(' -> user-profile access', function(){
		describe("user-profile access non-existent", function(){
			it("should get 404 for getting profile for non-existent User Id", function(done){
				ndex.get(
					'/users/C21R4444',
                    {},
					harry,
					function(err,res,body){
						if(err) { done(err) }
						else {
							res.should.not.have.status(200)
							done()
						}
					}
				);
			});
		});

		describe(" -> user-profile access ok", function(){
			it('should get 200 and "" on getting profile of harry', function(done){
				ndex.get(
					'/users/' + harry.jid,
                    {},
					harry,
					function(err,res,body){
						if(err) { done(err) }
						else {
							res.should.have.status(200);
							var profile = res.body.user.profile;
							profile = profile.toString;
							profile.should.have.length(0);
							//console.log(profile.length)
							done();
						}
					}
				);
			});
		});

		describe(" -> user-profile post", function(){
			it("should get 200 posting profile to user harry", function(done){
				
				harry.profile.firstName = 'Harry';
				harry.profile.lastName = 'Potter';
				harry.profile.website = 'www.harrypotterwizardscollection.com‎';
				harry.profile.description = 'I am a wizard';
				
				ndex.post(
					'/users/' + harry.jid + '/profile',
					{profile: harry.profile},
					harry,
					function(err,res,body){
						if(err) { done(err) }
						else {
							res.should.have.status(200);
							//console.log(res.body);
							done();
						}
					}
				);
			});
		});

		describe(" -> user-profile access ok", function(){
			it('should get 200 on getting profile of harry, should match updated profile', function(done){
				ndex.get(
					'/users/' + harry.jid,
                    {},
					harry,
					function(err,res,body){
						if(err) { done(err) }
						else {
							res.should.have.status(200)
							var profile = res.body.user.profile
							//could only compare in string format
							profile = profile.toString
							profileAlpha = harry.profile.toString
							profile.should.equal(profileAlpha)
							//console.log(res.body)
							done()
						}
					}
				);
			});
		});
		
		describe(" -> user-profile post control-char", function(){
			it("should get 200 posting different profile to harry (strings include control chars)", function(done){
				harry.profile.firstName = "Harry\n";
                harry.profile.lastName = 'Potter\n';
                harry.profile.website = 'www.harrypotterwizardscollection.com\n‎';
                harry.profile.description = 'I am a wizard\n';
				
				ndex.post(
					'/users/' + harry.jid + '/profile',
					{profile: harry.profile},
					harry,
					function(err,res,body){
						if(err) { done(err) }
						else {
							res.should.have.status(200)
							//console.log(harry.profile.firstName)
							done()
						}
					}
				);
			});
		});

		describe(" -> user-profile access ok", function(){
			it('should get 200 on getting profile of Harry, should match update profile', function(done){
				ndex.get(
					'/users/' + harry.jid,
                    {},
					harry,
					function(err,res,body){
						if(err) { done(err) }
						else {
							res.should.have.status(200)
							var profile = res.body.user.profile
							//could only compare in string format
							profile = profile.toString
							profileAlpha = harry.profile.toString
							profile.should.equal(profileAlpha)
							done()
						}
					}
				);
			});
		});
		
	});
	
	
	after( function (done) {
		console.log('teardown: user profile test')
		ndex.delete(
			'/users/' + harry.jid,
			harry,
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
