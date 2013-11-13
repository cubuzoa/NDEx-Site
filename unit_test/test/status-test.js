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
                '/status',
                {},
                ndex.guest,
                function (err, res) {
                    //console.log("result = " + res);
                    res.should.have.status(200);
                    done();
                });
        });

    });

});
