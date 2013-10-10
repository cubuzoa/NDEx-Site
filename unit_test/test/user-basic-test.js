var request = require('request'),
    assert = require('assert'),
    should = require('should'),
    ndex = require('../ndex_modules/ndex-request.js');

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

        it("should get 500 or 404 for attempting to delete non-existent user C21R4444", function (done) {
            ndex.delete(
                '/users/C21R4444',
                ndex.guest,
                function (err, res, body) {
                    if (err) {
                        done(err)
                    }
                    else {
                        res.should.not.have.status(200)
                        done();
                    }
                },
            true);
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
