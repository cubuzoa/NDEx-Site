/*
Setup:

    create Network: TestNetwork

Should:

    get 200 searching with a long random string but no results
    get 200 and network descriptors including expected network searching on known TestNetwork title
    get 200 and only 2 results searching on "" with limit = 2
    get 200 and 2 different results searching on "" with limit = 2, offset = 2

Teardown

    delete Network: TestNetwork
 */
var request = require('request'),
	assert = require('assert'),
	should = require('should'),
	fs = require('fs');
	
var baseURL = 'http://localhost:3333';

console.log("starting find networks test");
 
describe('NDEx Find Networks: ', function (done) {
	this.timeout(10000);
	var testNetwork = {title : '', jid : ''};
	var networkOwnerJID = null;
	before( function (done) {
		console.log('\nsetup: find networks test');
		var data = fs.readFileSync('../test_db/test_networks/pc_sif/testNetwork.jdex', 'utf8'); 
		data = JSON.parse(data);
		request({
			method : 'POST',
			url : baseURL + '/users/',
			json : {username : 'NetworkOwner', password : 'password'}
			},
			function(err, res, body){
				if(err) { done(err) }
				else {
					//console.log(res.body.error);
					res.should.have.status(200);
					networkOwnerJID = res.body.jid;
					console.log('...user created...creating network...');
					request({
							method : 'POST',
							url: baseURL + '/networks',
							json : {network : data, accountid : networkOwnerJID}
						},
						function(err, res, body){
							if(err) { done(err) }
							else {
								res.should.have.status(200);
								testNetwork.jid = res.body.jid;
								testNetwork.title = data.properties.title;
								console.log('...complete');//ensures completion
								done();
							}
						}
					);
				}
			}
		);
	});
	
	describe("Should: ", function(){
		it("should get 200 searching with a long random string but no results", function(done){
			request({
					method : 'GET',
					url: baseURL + '/networks/',
					qs: {searchExpression: 'DLKJFALDJFLADJFK', limit: 10, offset: 0},
					json:true
				},
				function(err,res,body){
					if(err) { done(err) }
					else {
						res.should.have.status(200);
						res.body.networks.should.be.empty;
						done();
					}
				}
			);	
		});
		it("should get 200 and network descriptors including expected network searching on known TestNetwork title", function(done){
			request({
					method : 'GET',
					url: baseURL + '/networks/',
					qs: {searchExpression: testNetwork.title.toUpperCase(), limit: 10, offset: 0},
					json:true
				},
				function(err,res,body){
					if(err) { done(err) }
					else {
						res.should.have.status(200);
						testNetwork.title.should.equal(res.body.networks[0].title);
						console.log(testNetwork.title); //TODO, check that this is working
						done();
					}
				}
			);	
		});
		it("should get 200 and only 2 results searching on '' with limit = 2", function(done){
			request({
					method : 'GET',
					url: baseURL + '/networks/',
					qs: {searchExpression: '', limit: 2, offset: 0},
					json:true
				},
				function(err,res,body){
					if(err) { done(err) }
					else {
						res.should.have.status(200);
						res.body.networks.length.should.equal(2);
						done();
					}
				}
			);	
		});
		it("should get 200 and 2 different results searching on '' with limit = 2, offset = 2", function(done){
			request({
					method : 'GET',
					url: baseURL + '/networks/',
					qs: {searchExpression: '', limit: 2, offset: 2},
					json:true
				},
				function(err,res,body){
					if(err) { done(err) }
					else {
						res.should.have.status(200);
						res.body.networks.length.should.equal(2);
						res.body.networks[0].should.not.equal(res.body.networks[1]);
						done();
					}
				}
			);	
		});
	});
	
	after( function (done) {
		console.log('\nteardown: find networks test');
		request({
				method : 'DELETE',
				url : baseURL + '/networks/' + testNetwork.jid
			},
			function(err, res, body){
				if(err) { done(err) }
				else {
					res.should.have.status(200);
					console.log('...network deleted...deleting user...');
					request({
						method : 'DELETE',
						url : baseURL + '/users/' + networkOwnerJID	
						},
				  		function(err, res, body){
				  			if(err) { done(err) }
				  			else { 
				  				res.should.have.status(200);
				  				console.log('...complete');//ensures completion
				  				done();
				  			} 
				  		}
				  	);
				}
			}
		);
	});
});
