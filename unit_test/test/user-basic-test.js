var request = require('request'),
    assert = require('assert'),
    should = require('should'),
    ndex = require('../ndex_modules/ndex-request.js');

describe('user-basic-test', function () {

    var henry, bob;

    before(function (done) {
        console.log("starting user-basic-test");
        henry = {
            username: "Henry",
            password: "password",
            emailAddress: "henry@example.com"
        };
        bob = {
            username: "Bob",
            password: "password",
            emailAddress: "bob@example.com"
        };
        done();
    });


    describe('user-basic user by malformed id', function () {

        it("should get 204 no content for malformed user id adsf", function (done) {

            ndex.get(
                '/users/adsf',
                {},
                ndex.guest,
                function (err, res, body) {
                    if (!err) {
                        res.should.have.status(204);
                        //console.log('Non existent user ID gets 204 - No content : ' + JSON.stringify(res.body));
                        done();
                    } else {
                        done(err)
                    }
                });
        });
    });

    describe('user-basic createUserWithNovelName', function () {

        it("should get 200 for attempting to create new user Henry", function (done) {
            ndex.put(
                '/users',
                {
                    username: henry.username,
                    password: henry.password,
                    emailAddress: henry.emailAddress
                },
                ndex.guest,
                function (err, res, body) {
                    if (err) {
                        done(err)
                    }
                    else {
                        //console.log("new user response: " + JSON.stringify(res.body));
                        res.should.have.status(200);
                        henry.id = res.body.id;
                        done();
                    }
                });
        });
    });


    describe('user-basic failToCreateUserWithUsernameAlreadyInUse', function () {

        it("should get 500 for attempting to create user with username already taken", function (done) {
            ndex.put(
                '/users',
                {
                    username: henry.username,
                    password: henry.password,
                    emailAddress: henry.emailAddress
                },
                ndex.guest,
                function (err, res, body) {
                    if (err) {
                        done(err)
                    }
                    else {
                        res.should.have.status(500);
                        done();
                    }
                });
        });
    });

    describe('user-basic getUserByExistingUserId', function () {

        it("should get 200 for getting existing user Henry", function (done) {
            ndex.get(
                '/users/' + henry.id,
                {},
                ndex.guest,
                function (err, res, body) {
                    if (!henry.id) {
                        console.log('getUserByExistingUserId failed because createUserHenryFailed')
                        done();
                    }
                    if (err) {
                        done(err);
                    }
                    else {
                        res.should.have.status(200)
                        console.log('got user Henry with JID ' + henry.id);
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
                        res.should.not.have.status(200);
                        console.log("Status on attempt to delete non-existent user: " + res.statusCode)

                        done();
                    }
                },
                false // set to true to print more request information
            );
        });
    });

    describe('user-basic deleteUserById', function () {

        it("should get 204 for successful deletion of user", function (done) {
            ndex.delete(
                '/users/' + henry.id,
                ndex.guest,
                function (err, res, body) {
                    if (!henry.id) {
                        console.log('deleteUserById failed because createUserHenryFailed')
                        done();
                    }
                    if (err) {
                        done(err)
                    }
                    else {
                        res.should.have.status(204)
                        console.log('deleted user henry with id ' + henry.id)
                        done();
                    }
                });
        });
    });

    describe('user-basic getDeletedUserByUserId', function () {

        it("should not get 200 when attempting to get deleted user Henry", function (done) {
            ndex.get(
                '/users/' + henry.id,
                {},
                ndex.guest,
                function (err, res, body) {
                    if (!henry.id) {
                        console.log('failed because createUserHenryFailed')
                        done();
                    }
                    if (err) {
                        done(err)
                    }
                    else {
                        res.should.not.have.status(200)
                        //console.log("could not get " + henry.id)
                        done();
                    }
                });
        });
    });


    describe('user-basic createUser2WithNovelName', function () {

        it("should get 200 for attempting to create new user Bob", function (done) {
            ndex.put(
                '/users',
                {
                    username: bob.username,
                    password: bob.password,
                    emailAddress: bob.emailAddress
                },
                ndex.guest,
                function (err, res, body) {
                    if (err) {
                        done(err)
                    }
                    else {
                        res.should.have.status(200)
                        console.log('Bob has JID ' + res.body.id)
                        bob.id = res.body.id
                        done();
                    }
                });
        });
    });

    describe('user-basic deleteUser2ById', function () {
        it("should get 204 for successful deletion of user Bob", function (done) {
            ndex.delete(
                '/users/' + bob.id,
                ndex.guest,
                function (err, res, body) {
                    if (!bob.id) {
                        console.log('failed because createUser Bob Failed')
                        done();
                    }
                    if (err) {
                        done(err)
                    }
                    else {
                        res.should.have.status(204)
                        console.log('deleted user bob with id ' + bob.id)
                        done();
                    }
                });
        });
    });

    describe('user-basic getUserByMalformedUserId', function () {

        it("should not get 200 when getting user by malformed JID, WC21R3", function (done) {
            ndex.get(
                '/users/WC21R3', //get 404 if W21R3
                {},
                ndex.guest,
                function (err, res, body) {
                    if (err) {
                        done(err)
                    }
                    else {
                        res.should.not.have.status(200)
                        done();
                    }
                });
        });
    });

});   // end of tests in this file

