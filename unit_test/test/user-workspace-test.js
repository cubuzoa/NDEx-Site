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
	fs = require('fs'),
    ndex = require('../ndex_modules/ndex-request.js');
 
describe('user-workspace', function (done) {

	var workspaceOwner, newNetwork, networkArray, cell_map;

	before( function (done) {
		console.log('\nsetup: user workspace test');
        workspaceOwner = {username : "WorkspaceOwner", password : "password"};
        newNetwork = {};
        networkArray = [];
        cell_map = null;
		ndex.post(
			'/users/',
			{username : workspaceOwner.username, password : workspaceOwner.password},
			ndex.guest,
			function(err,res,body){
				if(err) { console.log(err) }
				else { 
					res.should.have.status(200)
					workspaceOwner.jid = res.body.jid
					console.log('...user created...creating network...')//ensures completion
					var data = fs.readFileSync('../test_db/test_networks/pc_sif/testNetwork.jdex', 'utf8'); 
					data = JSON.parse(data);	
					ndex.post(
						'/networks',
						{network : data, accountid : workspaceOwner.jid},
                        workspaceOwner,
						function(err, res, body){
							if(err) { done(err) }
							else {
								res.should.have.status(200)
								newNetwork.jid = res.body.jid
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
			ndex.get(
				'/users/C21R4444/worksurface',
                {},
                workspaceOwner,
				function(err,res,body){
					if(err) { done(err) }
					else {
						res.should.not.have.status(200);
						done();
					}
				}
			);
				
		});

		it("should get 200 and empty workspace on getting workspace of new user WorkspaceOwner", function(done){
			ndex.get(
				'/users/'+ workspaceOwner.jid +'/worksurface',
                {},
				workspaceOwner,
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

		it("should get 200 and network descriptors finding existing networks by name that will be added to workspace.", function(done){
			ndex.get(
				'/networks/',
				{searchExpression: 'REACT', limit: 100, offset: 0},
				workspaceOwner,
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
			// code needed inside test case due to asynchronous nature
			// of this unit test, otherwise, networkArray will be null
			var isFin = function doNothing() {};

			for(var ii = 0; ii < networkArray.length ; ii ++){
				if(ii == (networkArray.length -1)) { isFin = done }
				(function(tempNet, isFinished){
					ndex.post(
						'/users/'+ workspaceOwner.jid +'/worksurface',
						{networkid: tempNet.jid},
                        workspaceOwner,
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
			ndex.get(
				'/users/'+ workspaceOwner.jid +'/worksurface',
                {},
				workspaceOwner,
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
			ndex.get(
				'/networks/',
				{searchExpression: 'CELL_MAP:TGFBR', limit: 100, offset: 0},
				workspaceOwner,
				function(err,res,body){
					if(err) { done(err) }
					else {
						res.should.have.status(200);
						cell_map = res.body.networks;
						cell_map = cell_map[0];
						ndex.delete(
							'/users/'+ workspaceOwner.jid +'/worksurface/' + cell_map.jid,
                            workspaceOwner,
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
			ndex.post(
				'/users/'+ workspaceOwner.jid +'/worksurface',
				{networkid: tempNet.jid},
				workspaceOwner,
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
			ndex.post(
				'/users/'+ workspaceOwner.jid +'/worksurface',
				{networkid: 'C11R4444444'},
				workspaceOwner,
				function(err,res,body){
					if(err) { done(err) }
					else {
						res.should.not.have.status(200);
						//console.log(res.body);
						done();
					}
				}
			);		
		});

		it("should get 404 attempting to add using non-existent User Id", function(done){
			ndex.post(
				'/users/C21R4444444/worksurface',
				{networkid: 'C11R3'},
				workspaceOwner,
				function(err,res,body){
					if(err) { done(err) }
					else {
						res.should.not.have.status(200);
						//console.log(res.body);
						done();
					}
				}
			);		
		});

		it("should get 200 adding new network to workspace", function(done){
			ndex.post(
				'/users/' + workspaceOwner.jid + '/worksurface',
				{networkid: newNetwork.jid},
				workspaceOwner,
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
			ndex.get(
				'/users/'+ workspaceOwner.jid +'/worksurface',
                {},
				workspaceOwner,
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
			ndex.delete(
				'/networks/' + newNetwork.jid,
				workspaceOwner,
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
			ndex.get(
				'/users/'+ workspaceOwner.jid +'/worksurface',
                {},
				workspaceOwner,
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
		console.log('teardown: user workspace test');
		ndex.delete(
			'/networks/' + newNetwork.jid,
            workspaceOwner,
			function(err, res, body){
				if(err) { done(err) }
				else {
					res.should.have.status(404);
					console.log('...network deletion comfirmed...deleting user...');// ensures completion
					ndex.delete(
						'/users/' + workspaceOwner.jid,
						workspaceOwner,
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
