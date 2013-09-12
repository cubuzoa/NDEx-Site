
//TODO for should get 200 getting network by edges, parameters not yet tested, preliminary implementation in Network.js
var request = require('request'),
	assert = require('assert'),
	should = require('should'),
	fs = require('fs'),
    ndex = require('../ndex_modules/ndex-request.js');
 
describe('network-bel', function (done) {

    this.timeout(300000);
	var networkOwner, network1, data;
	before( function(done){
		console.log('setup: network test');
        network1 = {title : '', jid : ''};
        networkOwner = {username: 'NetworkOwner', password: 'password'};
        data = fs.readFileSync('../test_db/test_networks/bel/small_corpus.jdex', 'utf8');
        data = JSON.parse(data);
        data.properties.title = "Test Small Corpus";

        ndex.post(
			'/users',
            {username: networkOwner.username, password: networkOwner.password},
			ndex.guest,
			function(err, res, body){
				if(err) { done(err) }
				else{
					res.should.have.status(200);
					networkOwner.jid = res.body.jid;
					console.log('...complete');
					done();
				}
			}
		);	
	});
	
	describe('network-bel', function(done) {

		it("should get 200 creating Network1 owned by NetworkOwner", function(done){
            ndex.post(
                '/networks',
				{network : data, accountid : networkOwner.jid},
				networkOwner,
				function(err, res, body){
					if(err) { done(err) }
					else {
						res.should.have.status(200);
						network1.jid = res.body.jid;
						network1.title = data.properties.title;
						done();
					}
				}
			);
		});
/*
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
*/
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

    });

	after( function(done){
		console.log('teardown: network-bel-test');
		ndex.delete(
			'/users/' + networkOwner.jid,
			networkOwner,
			function(err, res, body){
				if(err) {
                    done(err);
                }else{
					res.should.have.status(200);
					console.log('...complete');
					done();
				}
			}
		);
	});

});
