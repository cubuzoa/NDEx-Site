var request = require('request'),
	assert = require('assert');

var hostAddress =  'http://localhost:3333';

describe('API CALL UNIT TESTING', function () {
 
  // GET /status
  describe('GET /status', function () {
    it("should respond with status 200", function (done) {
      request(hostAddress + '/status', function (err, resp) {
        assert.equal(resp.statusCode, 200);
        done();
      });
    });
  });
  
  
  
});

/*


  var APIeasy = require('api-easy'),
      assert = require('assert');

  var basics = APIeasy.describe('module: basics');

  basics.discuss('The basics module')
       .discuss('Implements status requests to the NDEx server:')
       .use('localhost', 3333)
       .setHeader('Content-Type', 'application/json')
       .get('/')
       .expect(200)
       .get('/status')
       .expect(200)
       .export(module);
       
  var users = APIeasy.describe('module: users');
  
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