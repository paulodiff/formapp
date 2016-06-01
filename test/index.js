var supertest = require("supertest");
var assert = require('assert');
var should = require('should');
var faker = require('faker');
var token = '';
var newUserName = faker.name.findName();
var newUserEmail = faker.internet.email();
var newPassword = faker.address.longitude();

// This agent refers to PORT where program is runninng.

var server = supertest.agent("http://localhost:9988");

// UNIT test begin

describe("Test Api ....",function(){

  // #1 should return home page

  it("1.0 live? - GET /test",function(done){

    // calling home page api
    server
    .get("/test")
    .expect("Content-type",/text\/html*/)
    .expect(200) // THis is HTTP response
    .expect(/Hello.*/)
/*    .expect(function(res) {
        assert(res.body.prev, "Expected prev link");
        assert(res.body.next, "Expected next link");
    })
*/    
    .end(done);
  });
});


describe("Logon Api ....",function(){

  it("2.0 logon error bad username/password",function(done){

    server
    .post('/auth/login')
    .send({email : 'mario@comune.rimini.it', password : '12345678'})
    .expect("Content-type",/json/)
    .expect(401)
    .expect(function(res) {
      //assert(res.body.prev, "Expected prev link");
      //assert(res.body.next, "Expected next link");
      //console.log(res.body);
      //token = res.body.token;
  	})
    .end(done);
  });




  it("2.1 sign up with:" + newUserName + ':' + newUserEmail + ':' + newPassword, function(done){

    server
    .post('/auth/signup')
    .send({
    		email: newUserEmail, 
    		displayName: newUserName,
    		password: newPassword
    	})
    .expect("Content-type",/json/)
    .expect(200)
    .expect(function(err,res) {
    	if (err) {throw err;}
		res.body.should.have.property('token');
  	})
    .end(done);
  });


  it("3.0 logon test correct username password: " + newUserEmail + ':' + newPassword,function(done){

    server
    .post('/auth/login')
    .send({email : newUserEmail, password : newPassword})
    .expect("Content-type",/json/)
    .expect(200)
    .expect(function(res) {

      //assert(res.body.prev, "Expected prev link");
      //assert(res.body.next, "Expected next link");
      //console.log(res.body);
      token = res.body.token;
      //console.log('['+token+']');
  	})
    .end(done);

  });

});

describe("Profile Api ....",function(){


it("4.0 get profile page without token",function(done){

    server
    .get('/api/s/me')
    .send({token : 'fake'})
    .expect("Content-type",/json/)
    .expect(401)
    .expect(function(res) {
      //assert(res.body.prev, "Expected prev link");
      //assert(res.body.next, "Expected next link");
      //console.log(res.body);
      //token = res.body.token;
  	})
    .end(done);

  });

it("5.0 get profile page with token: " + token,function(done){

	var base = {'Authorization': 'Bearer ' +token, 'Content-Type': 'application/json'};

	//console.log('using token:' + token);

    server
    .get('/api/s/me')
    .set(base)
    .send({msg : 'test'})
    .expect("Content-type",/json/)
    .expect(200)
    .expect(function(res) {
      //assert(res.body.prev, "Expected prev link");
      //assert(res.body.next, "Expected next link");
      //console.log(res.body);
      //token = res.body.token;
  	})
    .end(done);
});

var newDESCRIPTION = faker.address.state();

it("6.0 put profile with token, description, toDelete : " + newDESCRIPTION ,function(done){


	//console.log('using token:' + token);

	var base = {'Authorization': 'Bearer ' +token, 'Content-Type': 'application/json'};

    server
    .put('/api/s/me')
    .set(base)
    .send({
    		email : newUserEmail,
    		description : newDESCRIPTION,
    		toDelete : true
	})
    .expect("Content-type",/json/)
    .expect(200)
    .expect(function(res) {
      //assert(res.body.prev, "Expected prev link");
      //assert(res.body.next, "Expected next link");
      //console.log(res.body);
      //token = res.body.token;
  	})
    .end(done);
});

it("7.0 get profile and Verify Description change: " + token,function(done){

	var base = {'Authorization': 'Bearer ' +token, 'Content-Type': 'application/json'};
	//console.log('using token:' + token);

    server
    .get('/api/s/me')
    .set(base)
    .send({msg : 'test'})
    .expect("Content-type",/json/)
    .expect(200)
  	.end(function(err, res) {
		if (err) {throw err;}
		res.body.should.have.property('description');
	    res.body.description.should.equal(newDESCRIPTION);
	    //res.body.lastName.should.equal('Berd');                    
	    //res.body.creationDate.should.not.equal(null);
		done();
    });
});

});



describe("Tdemo Api ... NO auth token",function(){

var txt2test = faker.random.words();
var lastId = 0;

it("Create put tdemo row" ,function(done){

    var base = {'Authorization': 'Bearer ' +token, 'Content-Type': 'application/json'};

    server
    .post('/api/m/tdemo')
    .set(base)
    .send({
        date : faker.date.future(),
        time : faker.date.recent(),
        datetime : faker.date.past(),
        text : txt2test,
        number : faker.random.number()
    })
    .expect("Content-type",/json/)
    .expect(200)
    .expect(function(res) {
      //assert(res.body.prev, "Expected prev link");
      //assert(res.body.next, "Expected next link");
      console.log(res.body);
      lastId = res.body.lastId;
      //token = res.body.token;
    })
    .end(done);
});

it("Get tdemo row id:" + lastId ,function(done){

    var base = {'Authorization': 'Bearer ' +token, 'Content-Type': 'application/json'};

    server
    .get('/api/m/tdemo/' + lastId)
    .set(base)
    //.send({
    //    date : faker.date.future(),
    //    time : faker.date.recent(),
    //    datetime : faker.date.past(),
    //    text : txt2test,
    //    number : faker.random.number()
    //})
    .expect("Content-type",/json/)
    .expect(200)
    .end(function(err, res) {
        console.log(res.body);
        if (err) {throw err;}
        res.body.should.have.property('message');
        res.body.message.should.have.property('text');
        res.body.message.text.should.equal(txt2test);
        //res.body.lastName.should.equal('Berd');                    
        //res.body.creationDate.should.not.equal(null);
        //user.should.be.an.instanceOf(Object).and.have.property('name', 'tj');
        //user.pets.should.be.instanceof(Array).and.have.lengthOf(4);
        done();
    });
});



});

