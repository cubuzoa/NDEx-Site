var request = require('request'),
	assert = require('assert')
	should = require('should');
	
var baseURL = 'http://localhost:9999';

console.log("starting default tests");
 
describe('Server Status:', function () {
 
  describe('GET /status', function () {
  
    it("should respond with status 200", function (done) {
      request( baseURL + '/status', function (err, res) {
      	console.log("result = " + res);
        res.should.have.status(200);
        done();
      });
    });
    
  });
   
});
