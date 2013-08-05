var request = require('request'),
	assert = require('assert')
	should = require('should');
	
var baseURL = 'http://localhost:3333';

console.log("starting status test");
 
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
