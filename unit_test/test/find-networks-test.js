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
    ndex = require('../ndex_modules/ndex-request.js');
	fs = require('fs');

describe('find-networks', function (done) {

	this.timeout(10000);
	var networkOwner, testNetwork;
	before( function (done) {
		console.log('setup: find-networks');
		var data = fs.readFileSync('../test_db/test_networks/pc_sif/testNetwork.jdex', 'utf8'); 
		data = JSON.parse(data);
        testNetwork = {title : '', jid : ''};
        networkOwner = {username : 'NetworkOwner', password : 'password'};
		ndex.post(
			'/users/',
			{username : networkOwner.username, password : networkOwner.password},
            ndex.guest,
			function(err, res, body){
				if(err) { done(err) }
				else {
					console.log(res.body.error);
					res.should.have.status(200);
					networkOwner.jid = res.body.jid;
					console.log('...user created...creating network...');
					ndex.post(
						'/networks',
						{network : data, accountid : networkOwner.jid},
                        networkOwner,
						function(err, res, body){
							if(err) { done(err) }
							else {
								res.should.have.status(200);
								testNetwork.jid = res.body.jid;
								testNetwork.title = data.properties.title;
								console.log('...complete');//ensures completion
								done();
							}
						});
				}
			});
	});
	
	describe("find-networks", function(){
		it("should get 200 searching with a long random string but no results", function(done){
			ndex.get(
				'/networks/',
				{searchExpression: 'DLKJFALDJFLADJFK', limit: 10, offset: 0},
                networkOwner,
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
			ndex.get(
				'/networks/',
				{searchExpression: testNetwork.title.toUpperCase(), limit: 10, offset: 0},
				networkOwner,
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
			ndex.get(
				'/networks/',
				{searchExpression: '', limit: 2, offset: 0},
				networkOwner,
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
			ndex.get(
				'/networks/',
				{searchExpression: '', limit: 2, offset: 2},
				networkOwner,
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
		console.log('teardown: find-networks');
		ndex.delete(
			'/networks/' + testNetwork.jid,
            networkOwner,
			function(err, res, body){
				if(err) { done(err) }
				else {
					res.should.have.status(200);
					console.log('...network deleted...deleting user...');
					ndex.delete(
						'/users/' + networkOwner.jid,
						networkOwner,
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
