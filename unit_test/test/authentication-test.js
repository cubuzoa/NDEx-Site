var request = require('request'),
    assert = require('assert'),
    should = require('should'),
    ndex = require('../ndex_modules/ndex-request.js');

describe('authentication-test', function () {

    var dexter;

    before( function (done) {
        console.log("starting authentication test");
        dexter = {username: 'dexterpratt', password: 'insecure'} ;
        done();
    });



    describe('testAuthenticateExistingUser', function(){
        it("should get 200 when attempting to authenticate dexterpratt", function (done){
            ndex.get(
                '/authenticate',
                {},
                dexter,
                function(err, res, body){
                    if (!err) {
                        res.should.have.status(200);
                        console.log('Authentication of dexterpratt : ' + JSON.stringify(res.body));
                        done();
                    } else {
                        done(err)
                    }
                });
        });
    });


});


