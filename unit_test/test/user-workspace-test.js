/*
Setup:

    create User: WorkspaceOwner
    create Network: NewNetwork
    requires that we have some standard networks loaded in the knowledge base that are intended for testing

Should:

    get 404 getting workspace for non-existent User Id
    get 200 and empty workspace getting workspace of new user WorkspaceOwner
    get 200 and network descriptors finding existing networks by name that will be added to workspace. 'REACT' will be keyword used to find 2 test networks
    get 200 adding a network to WorkspaceOwner's workspace; repeat to add all of the test networks.
    get 200 and network descriptors getting workspace
    get 404 attempting to remove network from workspace that is not in workspace . CELLMAP will be existing test network used, jid = C11R3
    get 400 attempting to add network already in workspace
    get 404 attempting to add non-existent Network Id
    get 404 attempting to add using non-existent User Id
    get 200 creating new test network. Done in set up
    get 200 adding new network to workspace
    get 200 and network descriptors including new network when getting workspace
    get 200 deleting new network
    get 200 and network descriptors NOT including the deleted network on getting workspace

Teardown

    delete WorkspaceOwner
    ensure that NewNetwork was deleted during testing.
*/
var request = require('request'),
	assert = require('assert'),
	should = require('should'),
	fs = require('fs');
	
var baseURL = 'http://localhost:3333';

console.log("starting user workspace test");
 
describe('NDEx Workspaces: ', function (done) {
	//to be used throughout test cases
	var workspaceOwnerJID = null;
	var newNetworkJID = null;
	//unit test setup
	before( function (done) {
		console.log('\nsetup: user workspace test');
		request({
				method : 'POST',
				url : baseURL + '/users/', 
				json : {username : "WorkspaceOwner", password : "password"}
			},
			function(err,res,body){
				if(err) { console.log(err) }
				else { 
					res.should.have.status(200)
					workspaceOwnerJID = res.body.jid
					console.log('...user created...creating network...')//ensures completion
					var data = fs.readFileSync('../test_db/test_networks/pc_sif/testNetwork.jdex', 'utf8'); 
					data = JSON.parse(data);	
					request({
							method : 'POST',
							url: baseURL + '/networks',
							json : {network : data, accountid : workspaceOwnerJID}
						},
						function(err, res, body){
							if(err) { done(err) }
							else {
								res.should.have.status(200)
								newNetworkJID = res.body.jid
								console.log('...complete')//ensures completion
								done()
							}
						}
					);
				}
			}
		);
	});
		
	describe('Should', function() {
		this.timeout(10000);// occasionally, requests take longer
		it("should get 404 getting workspace for non-existent User Id", function(done){
			request({
					method : 'GET',
					url: baseURL + '/users/C21R4444/workspace',
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
		it("should get 200 and empty workspace on getting workspace of new user WorkspaceOwner", function(done){
			request({
					method : 'GET',
					url: baseURL + '/users/'+ workspaceOwnerJID +'/workspace',
					json: true
				},
				function(err,res,body){
					if(err) { done(err) }
					else {
						res.should.have.status(200);
						var networks = res.body.networks;
						networks.should.have.length(0);
						done();
					}
				}
			);							
				
		});
		var networkArray = []; 
		it("should get 200 and network descriptors finding existing networks by name that will be added to workspace.", function(done){
			request({
					method : 'GET',
					url: baseURL + '/networks/',
					qs: {searchExpression: 'REACT', limit: 100, offset: 0},
					json:true
				},
				function(err,res,body){
					if(err) { done(err) }
					else {
						res.should.have.status(200);
						var networks = res.body.networks;
						networkArray = networks;
						//console.log(networkArray);
						done();
					}
				}
			);	
		});
		
		it("should get 200 adding a network to WorkspaceOwner's workspace; repeat to add all of the test networks.",function(done){
			//code need inside test case due to asynchrounous nature of this unit test, otherwise, networkArray will be null
			var isFin = function doNothing() {};
			for(var ii = 0; ii < networkArray.length ; ii ++){
				if(ii == (networkArray.length -1)) { isFin = done }
				(function(tempNet, isFinished){
					request({
							method : 'POST',
							url: baseURL + '/users/'+ workspaceOwnerJID +'/workspace',
							json: {networkid: tempNet.jid}
						},
						function(err,res,body){
							if(err) { done(err) }
							else {
								res.should.have.status(200);
								//console.log(res.body);
								isFinished();
							}
						}
					);
				})(networkArray[ii],isFin);//params passed at closure due to asynch function inside
			}					
		});
		it("should get 200 and workspace on getting workspace of new user WorkspaceOwner", function(done){
			request({
					method : 'GET',
					url: baseURL + '/users/'+ workspaceOwnerJID +'/workspace',
					json: true
				},
				function(err,res,body){
					if(err) { done(err) }
					else {
						res.should.have.status(200);
						var networks = res.body.networks;
						networks.should.not.be.empty;//There should be as many as the length of NetworkArray
						done();
					}
				}
			);		
		});
		it("should get 404 attempting to remove network from workspace that is not in workspace", function(done){
			var cell_map = null;
			request({
					method : 'GET',
					url: baseURL + '/networks/',
					qs: {searchExpression: 'CELL_MAP:TGFBR', limit: 100, offset: 0},
					json:true
				},
				function(err,res,body){
					if(err) { done(err) }
					else {
						res.should.have.status(200);
						cell_map = res.body.networks;
						cell_map = cell_map[0];
						request({
								method : 'DELETE',
								url: baseURL + '/users/'+ workspaceOwnerJID +'/workspace/' + cell_map.jid
							},
							function(err,res,body){
								if(err) { done(err) }
								else {
									res.should.have.status(404);
									done();
								}
							}
						);	
					}
				}
			);	
		});
		it("should get 400 attempting to add network already in workspace", function(done){
			var tempNet = networkArray[0];
			request({
					method : 'POST',
					url: baseURL + '/users/'+ workspaceOwnerJID +'/workspace',
					json: {networkid: tempNet.jid}
				},
				function(err,res,body){
					if(err) { done(err) }
					else {
						res.should.have.status(400);
						//console.log(res.body);
						done();
					}
				}
			);	
		});
		it("should get 404 attempting to add non-existent Network Id", function(done){
			request({
					method : 'POST',
					url: baseURL + '/users/'+ workspaceOwnerJID +'/workspace',
					json: {networkid: 'C11R4444444'}
				},
				function(err,res,body){
					if(err) { done(err) }
					else {
						res.should.have.status(404);
						//console.log(res.body);
						done();
					}
				}
			);		
		});
		it("should get 404 attempting to add using non-existent User Id", function(done){
			request({
					method : 'POST',
					url: baseURL + '/users/C21R4444444/workspace',
					json: {networkid: 'C11R3'}
				},
				function(err,res,body){
					if(err) { done(err) }
					else {
						res.should.have.status(404);
						//console.log(res.body);
						done();
					}
				}
			);		
		});
		it("should get 200 adding new network to workspace", function(done){
			request({
					method : 'POST',
					url: baseURL + '/users/' + workspaceOwnerJID + '/workspace',
					json: {networkid: newNetworkJID}
				},
				function(err,res,body){
					if(err) { done(err) }
					else {
						res.should.have.status(200);
						done();
					}
				}
			);		
		});
		it("should get 200 and network descriptors including new network when getting workspace", function(done){
			request({
					method : 'GET',
					url: baseURL + '/users/'+ workspaceOwnerJID +'/workspace',
					json: true
				},
				function(err,res,body){
					if(err) { done(err) }
					else {
						res.should.have.status(200);
						var networks = res.body.networks;
						networks.should.not.be.empty;
						networks.should.have.length(networkArray.length + 1); 
						//^must change if unit test changes, + 1 is for new network
						done();
					}
				}
			);		
		});
		it("should get 200 deleting new network", function(done){
			request({
					method : 'DELETE',
					url : baseURL + '/networks/' + newNetworkJID
				},
				function(err, res, body){
					if(err) { done(err) }
					else {
						res.should.have.status(200);
						//console.log(' -network deleted');// ensures completion
						done();
					}
				}
			);		
		});
		it("should get 200 and network descriptors NOT including new network when getting workspace", function(done){
			request({
					method : 'GET',
					url: baseURL + '/users/'+ workspaceOwnerJID +'/workspace',
					json: true
				},
				function(err,res,body){
					if(err) { done(err) }
					else {
						res.should.have.status(200);
						var networks = res.body.networks;
						networks.should.not.be.empty;
						networks.should.have.length(networkArray.length ); 
						//^must change if unit test changes
						done();
					}
				}
			);		
		});
		
	});
	//unit test teardown
	after( function (done) {
		console.log('\nteardown: user workspace test');
		request({
				method : 'DELETE',
				url : baseURL + '/networks/' + newNetworkJID
			},
			function(err, res, body){
				if(err) { done(err) }
				else {
					res.should.have.status(404);
					console.log('...network deletion comfirmed...deleting user...');// ensures completion
					request({
						method : 'DELETE',
						url : baseURL + '/users/' + workspaceOwnerJID	
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
