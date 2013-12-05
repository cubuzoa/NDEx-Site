var request = require('request'),
    assert = require('assert'),
    should = require('should'),
    ndex = require('../ndex_modules/ndex-request.js');


describe('status', function () {

    describe(' -> status', function () {
        before( function (done) {
            console.log("starting status test");
            done();
        });
        it("should respond with status 200", function (done) {
            ndex.get(
                '/networks/status',
                {},
                ndex.guest,
                function (err, res) {
                    if(err) { done(err) }
                    if (!res) assert.fail("no response object : " + JSON.stringify(err));
                    res.should.have.status(200);
                    done();
                });
        });

        it("should get 200 getting Network API", function(done){
            ndex.get(
                '/networks/api',
                {},
                ndex.guest,
                function(err,res,body){
                    if(err) { done(err) }
                    else {
                        res.should.have.status(200);
                        for (i in res.body){
                            method = res.body[i];
                            for (j in method){
                                console.log(method[j]);
                            }
                        }
                        done();
                    }
                }
            );

        });

    });

});
