/**
 * Created by dextergraphics on 10/1/13.
 */

var request = require('request'),
    assert = require('assert'),
    should = require('should'),
    ndex = require('../../js/ndexClient.js');

describe('user-workspace', function (done) {

    var imageOwner,
        foregroundImagePath = "../testImages/foreground1.jpg",
        backgroundImagePath = "../testImages/background1.jpg";

    before( function (done) {
        console.log('setup: user image test');
        imageOwner = {username : "ImageOwner", password : "password"};
        ndexClient.createUser(imageOwner.username, imageOwner.password,
            //
            // Success
            //
            function(err,res,body){
                if(err) { console.log(err) }
                else {
                    res.should.have.status(200)
                    imageOwner.jid = res.body.jid
                    console.log('...user created to own images')
                    ndex
                    var data = fs.readFileSync('../test_db/test_networks/pc_sif/testNetwork.jdex', 'utf8');
                    data = JSON.parse(data);
                    ndexClient.uploadAccountImage(
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
            },
            //
            // Failure
            //
            function(){

            }
        );
    });

    describe('Should', function() {
        this.timeout(10000);// occasionally, requests take longer
        it("should get 404 getting workspace for non-existent User Id", function(done){
            ndex.get(
                '/users/C21R4444/workspace',
                {},
                workspaceOwner,
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
            ndex.get(
                '/users/'+ workspaceOwner.jid +'/workspace',
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
                        '/users/'+ workspaceOwner.jid +'/workspace',
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
                '/users/'+ workspaceOwner.jid +'/workspace',
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
                            '/users/'+ workspaceOwner.jid +'/workspace/' + cell_map.jid,
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
                '/users/'+ workspaceOwner.jid +'/workspace',
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
                '/users/'+ workspaceOwner.jid +'/workspace',
                {networkid: 'C11R4444444'},
                workspaceOwner,
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
            ndex.post(
                '/users/C21R4444444/workspace',
                {networkid: 'C11R3'},
                workspaceOwner,
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
            ndex.post(
                '/users/' + workspaceOwner.jid + '/workspace',
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
                '/users/'+ workspaceOwner.jid +'/workspace',
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
                '/users/'+ workspaceOwner.jid +'/workspace',
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


describe('user-basic-test', function () {

    var henry, bob;

    before( function (done) {
        console.log("starting user-basic-test");
        henry = {username: "Henry", password: "password"};
        bob = {username:"Bob", password: "password"};
        done();
    });


    describe('user-basic user by malformed id', function () {

        it("should get 400 for malformed user id adsf", function (done) {

            //console.log("running getUserByNonExistentUserId");

            ndex.get(
                '/users/adsf',
                {},
                ndex.guest,
                function (err, res, body) {
                    if (!err) {
                        res.should.have.status(400);
                        //console.log('Non existent user ID gets 400 : ' + JSON.stringify(res.body));
                        done();
                    } else {
                        done(err)
                    }
                });
        });
    });

    describe('user-basic createUserWithNovelName', function () {

        it("should get 200 for attempting to create new user Henry", function (done) {
            ndex.post(
                '/users',
                {username: henry.username, password: henry.password},
                ndex.guest,
                function (err, res, body) {
                    if (err) {
                        done(err)
                    }
                    else {
                        res.should.have.status(200)
                        //console.log(res.body.jid)
                        henry.jid = res.body.jid
                        done();
                    }
                });
        });
    });


    describe('user-basic failToCreateUserWithUsernameAlreadyInUse', function () {

        it("should get 500 for attempting to create user with username already taken", function (done) {
            ndex.post(
                '/users',
                {username: henry.username, password: henry.password},
                ndex.guest,
                function (err, res, body) {
                    if (err) {
                        done(err)
                    }
                    else {
                        res.should.have.status(500)
                        done();
                    }
                });
        });
    });

    describe('user-basic getUserByExistingUserId', function () {

        it("should get 200 for getting existing user Henry", function (done) {
            ndex.get(
                '/users/' + henry.jid,
                {},
                ndex.guest,
                function (err, res, body) {
                    if (!henry.jid) {
                        console.log('failed because createUserHenryFailed')
                        done();
                    }
                    if (err) {
                        done(err)
                    }
                    else {
                        res.should.have.status(200)
                        //console.log('got Henry with JID ' + henryJID)
                        done();
                    }
                });
        });
    });

    describe('user-basic deleteUserByNonExistentID', function () {

        it("should get 404 for attempting to delete non-existent user C21R4444", function (done) {
            ndex.delete(
                '/users/C21R4444',
                ndex.guest,
                function (err, res, body) {
                    if (err) {
                        done(err)
                    }
                    else {
                        res.should.have.status(404)
                        done();
                    }
                });
        });
    });

    describe('user-basic deleteUserById', function () {

        it("should get 200 for attempting to delete user", function (done) {
            ndex.delete(
                '/users/' + henry.jid,
                ndex.guest,
                function (err, res, body) {
                    if (!henry.jid) {
                        console.log('failed because createUserHenryFailed')
                        done();
                    }
                    if (err) {
                        done(err)
                    }
                    else {
                        res.should.have.status(200)
                        //console.log('deleted ' + henryJID)
                        done();
                    }
                });
        });
    });

    describe('user-basic getDeletedUserByUserId', function () {

        it("should get 404 for attempting to get deleted user Henry", function (done) {
            ndex.get(
                '/users/' + henry.jid,
                {},
                ndex.guest,
                function (err, res, body) {
                    if (!henry.jid) {
                        console.log('failed because createUserHenryFailed')
                        done();
                    }
                    if (err) {
                        done(err)
                    }
                    else {
                        res.should.have.status(404)
                        //console.log("could not get " + henryJID)
                        done();
                    }
                });
        });
    });


    describe('user-basic createUser2WithNovelName', function () {

        it("should get 200 for attempting to create new user Bob", function (done) {
            ndex.post(
                '/users',
                {username: bob.username, password: bob.password},
                ndex.guest,
                function (err, res, body) {
                    if (err) {
                        done(err)
                    }
                    else {
                        res.should.have.status(200)
                        //console.log('Bob has JID ' + res.body.jid)
                        bob.jid = res.body.jid
                        done();
                    }
                });
        });
    });

    describe('user-basic deleteUser2ById', function () {
        it("should get 200 for attempting to delete user Bob", function (done) {
            ndex.delete(
                '/users/' + bob.jid,
                ndex.guest,
                function (err, res, body) {
                    if (!bob.jid) {
                        console.log('failed because createUser Bob Failed')
                        done();
                    }
                    if (err) {
                        done(err)
                    }
                    else {
                        res.should.have.status(200)
                        //console.log('deleted ' + bobJID)
                        done();
                    }
                });
        });
    });

    describe('user-basic getUserByMalformedUserId', function () {

        it("should get 400 for getting user by malformed JID, WC21R3", function (done) {
            ndex.get(
                '/users/WC21R3', //get 404 if W21R3
                {},
                ndex.guest,
                function (err, res, body) {
                    if (err) {
                        done(err)
                    }
                    else {
                        res.should.have.status(400)
                        done();
                    }
                });
        });
    });

});   // end of tests in this file



/*


 var uname = null;

 users.discuss('Basic operations on NDExUser resources:')
 .use('localhost', 3333)
 .setHeader('Content-Type', 'application/json')

 .discuss('make sure that there is no user with username fred')
 .get('/users/fred')
 .expect(404)

 .discuss('create a User with username = fred and password = bird')
 .post('/users', {username : 'fred', password : 'bird'})
 .expect(200)

 .discuss('find list of users by username expression')
 .get('/users?nameExpression=fr*')
 .expect(200)
 .expect('size of user list should not be zero', function (err, res, body){
 var users = body.users;
 assert.isNotZero(users.size);
 })

 .discuss('find fred by exact username')
 .get('/users/fred')
 .expect(200)
 .expect({username : 'fred'})

 .discuss('delete fred')
 .del('/users/fred')
 .expect(200)

 .export(module);

 */

