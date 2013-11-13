
//TODO for should get 200 getting network by edges, parameters not yet tested, preliminary implementation in Network.js
var request = require('request'),
	assert = require('assert'),
	should = require('should'),
	fs = require('fs'),
    ndex = require('../ndex_modules/ndex-request.js');
 
describe('network-basic', function (done) {

    this.timeout(10000);
	var networkOwner, network1, data;
	before( function(done){
		console.log('setup: network test');
        network1 = {title : '', jid : ''};
        networkOwner = {username: 'NetworkOwner', password: 'password'};
        console.log('loading testNetwork data to memory');
        data = fs.readFileSync('../test_db/test_networks/pc_sif/testNetwork.jdex', 'utf8');
        data = JSON.parse(data);
        console.log('creating NetworkOwner User');
        ndex.post(
			'/users',
            {username: networkOwner.username, password: networkOwner.password},
			ndex.guest,
			function(err, res, body){
				if(err){
                        console.log("Error while setting up networkOwner User: " + err);
                        done(err);
                }
				else{
					res.should.have.status(200);
					networkOwner.jid = res.body.jid;
					console.log('...complete');
					done();
				}
			}
		);	
	});
	
	describe('network-basic', function(done) {
		it("should get 404 getting non-existent Network Id", function(done){
			ndex.get(
				'/networks/C11R44444',
                {},
				networkOwner,
				function(err,res,body){
					if(err) { done(err) }
					else {
						res.should.not.have.status(200);
						done();
					}
				}
			);
				
		});

		it("should get 404 attempting to create Network1 with non-existant User Id ", function(done){
			ndex.post(
				'/networks',
				{network : data, accountid : 'C21R44444'},
				networkOwner,
				function(err, res, body){
					if(err) { done(err) }
					else {
						res.should.not.have.status(200);
						done();
					}
				}
			);
		});

		it("should get 200 creating Network1 owned by NetworkOwner", function(done){
            ndex.post(
                '/networks',
				{network : data, accountid : networkOwner.jid},
				networkOwner,
				function(err, res, body){
					if(err) {
                        console.log("Error creating network = " + err);
                        done(err);
                    }
					else {
						res.should.have.status(200);
						network1.jid = res.body.jid;
						network1.title = data.properties.title;
						done();
					}
				}
			);
		});

		it("should get 200 getting Network1 and verifying title and description", function(done){
			ndex.get(
				'/networks/' + network1.jid,
                {},
				networkOwner,
				function(err,res,body){
					if(err) { done(err) }
					else {
						res.should.have.status(200);
						network1.title.should.equal(res.body.network.title);
						done();
					}
				}
			);
				
		});

		it("should get 200 getting NetworkOwner and verify that Network1 is on ownedNetworks", function (done){
  			ndex.get(
  				'/users/' + networkOwner.jid,
                {},
  				networkOwner,
  				function(err, res, body){
  					if(err) { done(err) }  
  					else {
	  					res.should.have.status(200);
	  					network1.title.should.equal(res.body.user.ownedNetworks[0].title);
	  					done();
  					}
  				}
  			);	
  		});

  		it("should get 200 on getting network by edges", function (done){
  			ndex.get(
  				'/networks/' + network1.jid + '/edge',
  				{typeFilter: '', propertyFilter: '', subjectNodeFilter: '', objectNodeFilter: '', limit: 10, offset : 0},
  				networkOwner,
  				function(err, res, body){
  					if(err) { done(err) }  
  					else {
	  					res.should.have.status(200);
	  					//console.log(res.body.network.edges);
	  					done();
  					}
  				}
  			);	
  		});

  		it("should get 200 on getting network by nodes", function (done){
  			ndex.get(
  				'/networks/' + network1.jid + '/node',
  				{typeFilter: '', propertyFilter: '', limit: 10, offset : 0},
  				networkOwner,
  				function(err, res, body){
  					if(err) { done(err) }  
  					else {
	  					res.should.have.status(200);
	  					console.log(res.body.network.nodes);
	  					done();
  					}
  				}
  			);	
  		});

		it("should get 200 deleting network", function(done){
			ndex.delete(
				'/networks/' + network1.jid,
				networkOwner,
				function(err, res, body){
					if(err) { done(err) }
					else {
						res.should.have.status(200);
						done();
					}
				}
			);		
		});

		it("should get 404 deleting already deleted network", function(done){
			ndex.delete(
				'/networks/' + network1.jid,
				networkOwner,
				function(err, res, body){
					if(err) { done(err) }
					else {
						res.should.have.status(404);
						done();
					}
				}
			);		
		});

		it("should get 200 getting NetworkOwner and verify that Network1 is not in ownedNetworks", function (done){
  			ndex.get(
  				'/users/' + networkOwner.jid,
                {},
  				networkOwner,
  				function(err, res, body){
  					if(err) { done(err) }  
  					else {
	  					res.should.have.status(200);
	  					res.body.user.ownedNetworks.should.be.empty;
	  					done();
  					}
  				}
  			);	
  		});

  		it("should get 404 getting Network1", function(done){
			ndex.get(
				'/networks/' + network1.jid,
                {},
				networkOwner,
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
	
	after( function(done){
		console.log('teardown: network-basic-test');
		ndex.delete(
			'/users/' + networkOwner.jid,
			networkOwner,
			function(err, res, body){
				if(err) { done(err) }
				else{
					res.should.have.status(200);
					console.log('...complete');
					done();
				}
			}
		);
	});

});
