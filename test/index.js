// Load modules

var Hapi = require('hapi');
var Code = require('code');
var Lab = require('lab');


// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;


describe('Stormpath auth plugin', function () {

    it('should register the plugin succesfully', function (done) {

        var server = new Hapi.Server();
        server.connection();
        server.register({
            register: require('../'),
            options: require(__dirname + '/../config')
        }, function (err) {

            expect(err).to.not.exist();
            done();
        });
    });

    it('should fail the plugin registration process, invalid options', function (done) {

        var server = new Hapi.Server();
        server.connection();
        server.register({
            register: require('../'),
            options: {}
        }, function (err) {

            expect(err).to.exist();
            done();
        });
    });

    it('should fail the plugin registration process, invalid options', function (done) {

        var server = new Hapi.Server();
        server.connection();
        server.register({
            register: require('../'),
            options: {
                appKeyPath: __dirname + '/data/empty-key'
            }
        }, function (err) {

            expect(err).to.exist();
            done();
        });
    });

    it('should fail the plugin registration process, invalid options', function (done) {

        var server = new Hapi.Server();
        server.connection();
        server.register({
            register: require('../'),
            options: {
                apiKeyPath: 'omama/opapa'
            }
        }, function (err) {

            expect(err).to.exist();
            done();
        });
    });

    it('should fail the plugin registration process, invalid config', function (done) {

        var server = new Hapi.Server();
        server.connection();
        server.register({
            register: require('../'),
            options: require('./invalid-config')
        }, function (err) {

            expect(err).to.exist();
            done();
        });
    });

    it('should load the plugin using manual apiKey setup (not from file)', function (done) {

        var server = new Hapi.Server();
        server.connection();
        server.register({
            register: require('../'),
            options: {
                apiKey: require(__dirname + '/../config').apiKey,
                appHref: require(__dirname + '/../config').appHref
            }

        }, function (err) {

            expect(err).to.not.exist();
            done();
        });
    });

    it('should return a reply on successful auth', function (done) {

        var server = new Hapi.Server();
        server.connection();
        server.register({
            register: require('../'),
            options: require(__dirname + '/../config')
        }, function (err) {

            expect(err).to.not.exist();
            server.auth.strategy('default', 'stormpath');
            server.route({
                method: 'GET', path: '/stormpath',
                handler: function (request, reply) {

                    reply('Success');
                },
                config: {
                    auth: 'default'
                }
            });

            var testApiKey1 = require(__dirname + '/../config').testApiKey1;
            var request = {
                method: 'GET', url : 'http://example.com:8080/stormpath',
                headers: {
                    authorization: 'Basic ' + new Buffer(testApiKey1.id + ':' + testApiKey1.secret).toString('base64')
                }
            };
            server.inject(request, function (res) {

                expect(res.statusCode).to.equal(200);
                expect(res.result).to.equal('Success');
                done();
            });
        });
    });

    it('should return an error reply on invalid auth', function (done) {

        var server = new Hapi.Server();
        server.connection();
        server.register({
            register: require('../'),
            options: require(__dirname + '/../config')
        }, function (err) {

            if (err) {
                return done(err);
            }
            server.auth.strategy('default', 'stormpath');
            server.route({
                method: 'GET', path: '/stormpath',
                handler: function (request, reply) {

                    reply('success');
                },
                config: {
                    auth: 'default'
                }
            });

            var testApiKey2 = require(__dirname + '/../config').testApiKey2;
            var request = {
                method: 'GET', url : 'http://example.com:8080/stormpath',
                headers: {
                    authorization: 'Basic ' + new Buffer(testApiKey2.id + ':' + testApiKey2.secret).toString('base64')
                }
            };

            server.inject(request, function (res) {

                expect(res.statusCode).to.equal(401);
                done();
            });
        });
    });

    it('should return an error reply on invalid auth, where the account is disabled', function (done) {

        var server = new Hapi.Server();
        server.connection();
        server.register({
            register: require('../'),
            options: require(__dirname + '/../config')
        }, function (err) {

            if (err) {
                return done(err);
            }
            server.auth.strategy('default', 'stormpath');
            server.route({
                method: 'GET', path: '/stormpath',
                handler: function (request, reply) {

                    reply('success');
                },
                config: {
                    auth: 'default'
                }
            });

            var testApiKey3 = require(__dirname + '/../config').testApiKey3;
            var request = {
                method: 'GET', url : 'http://example.com:8080/stormpath',
                headers: {
                    authorization: 'Basic ' + new Buffer(testApiKey3.id + ':' + testApiKey3.secret).toString('base64')
                }
            };

            server.inject(request, function (res) {

                expect(res.statusCode).to.equal(401);
                done();
            });
        });
    });

    it('should return forbidden reply on test group fail', function (done) {

        process.env.TEST_GROUP_FAIL = '1';
        var server = new Hapi.Server();
        server.connection();
        server.register({
            register: require('../'),
            options: require(__dirname + '/../config')
        }, function (err) {

            expect(err).to.not.exist();
            server.auth.strategy('default', 'stormpath');
            server.route({
                method: 'GET', path: '/stormpath',
                handler: function (request, reply) {

                    reply('Success');
                },
                config: {
                    auth: 'default'
                }
            });

            var testApiKey1 = require(__dirname + '/../config').testApiKey1;
            var request = {
                method: 'GET', url : 'http://example.com:8080/stormpath',
                headers: {
                    authorization: 'Basic ' + new Buffer(testApiKey1.id + ':' + testApiKey1.secret).toString('base64')
                }
            };
            server.inject(request, function (res) {

                expect(res.statusCode).to.equal(403);
                done();
            });
        });
    });
});
