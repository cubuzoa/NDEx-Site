/*
Setup:

    create User: NetworkOwner

Should:

    get 404 getting non-existent Network Id
    get 404 attempting to create Network1 with non-existant User Id
    get 200 creating Network1 owned by NetworkOwner
    get 200 getting Network1 and verifying title and description
    get 200 getting NetworkOwner and verify that Network1 is on ownedNetworks
    get 200 deleting Network1
    get 404 deleting Network1 again
    get 200 getting NetworkOwner and verify that Network1 is not on owned networks (this probably fails right now)
    get 404 getting Network1

Teardown

    delete User: NetworkOwner
*/
var request = require('request'),
	assert = require('assert'),
	should = require('should'),
	fs = require('fs');
	
var baseURL = 'http://localhost:3333';

console.log("starting networks test");
 
describe('NDEx Networks: ', function (done) {
	var networkOwnerJID = null;
	var network1JID = null;
	before( function(done){
		console.log('\nsetup: network test');
		request({
				method : 'POST',
				url : baseURL + '/users',
				json : {username: 'NetworkOwner', password: 'password'}
			},
			function(err, res, body){
				if(err) { done(err) }
				else{
					res.should.have.status(200);
					networkOwnerJID = res.body.jid;
					console.log('...complete');
					done();
				}
			}
		);	
	});
	
	describe('Should: ', function(done) {
		this.timeout(6000);// occasionally, requests take longer
		it("should get 404 getting non-existent Network Id", function(done){
			request({
					method : 'GET',
					url: baseURL + '/networks/C11R44444',
					json: true
				},
				function(err,res,body){
					if(err) { done(err) }
					else {
						res.should.have.status(404);
						done();
					}
				}
			);
				
		});
		it("should get 404 attempting to create Network1 with non-existant User Id ", function(done){
			var data = fs.readFileSync('../test_db/test_networks/pc_sif/testNetwork.jdex', 'utf8'); 
			data = JSON.parse(data);	
			request({
				method : 'POST',
				url: baseURL + '/networks',
				json : {network : data, accountid : 'C21R44444'}
				},
				function(err, res, body){
					if(err) { done(err) }
					else {
						res.should.have.status(404);
						done();
					}
				}
			);
		});
		var network1Title = '';
		it("should get 200 creating Network1 owned by NetworkOwner", function(done){
			var data = fs.readFileSync('../test_db/test_networks/pc_sif/testNetwork.jdex', 'utf8'); 
			data = JSON.parse(data);	
			request({
				method : 'POST',
				url: baseURL + '/networks',
				json : {network : data, accountid : networkOwnerJID}
				},
				function(err, res, body){
					if(err) { done(err) }
					else {
						res.should.have.status(200);
						network1JID = res.body.jid;
						network1Title=res.body.title;
						done();
					}
				}
			);
		});
		it("should get 200 getting Network1 and verifying title and description", function(done){
			request({
					method : 'GET',
					url: baseURL + '/networks/' + network1JID,
					json: true
				},
				function(err,res,body){
					if(err) { done(err) }
					else {
						res.should.have.status(200);
						network1Title.should.equal(res.body.network.title);
						done();
					}
				}
			);
				
		});
		it("should get 200 getting NetworkOwner and verify that Network1 is on ownedNetworks", function (done){
  			request({
  					url: baseURL + '/users/' + networkOwnerJID,
  					json : true
  				},
  				function(err, res, body){
  					if(err) { done(err) }  
  					else {
	  					res.should.have.status(200);
	  					network1Title.should.equal(res.body.user.ownedNetworks[0].title);
	  					done();
  					}
  				}
  			);	
  		});
		it("should get 200 deleting network", function(done){
			request({
					method : 'DELETE',
					url : baseURL + '/networks/' + network1JID
				},
				function(err, res, body){
					if(err) { done(err) }
					else {
						res.should.have.status(200);
						done();
					}
				}
			);		
		});
		it("should get 404 deleting network", function(done){
			request({
					method : 'DELETE',
					url : baseURL + '/networks/' + network1JID
				},
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
  			request({
  					url: baseURL + '/users/' + networkOwnerJID,
  					json : true
  				},
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
			request({
					method : 'GET',
					url: baseURL + '/networks/' + network1JID,
					json: true
				},
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
		console.log('\nteardown: network test');
		request({
			method : 'DELETE',
			url : baseURL + '/users/' + networkOwnerJID
			},
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
