// Load modules

var Boom = require('boom');
var Stormpath = require('stormpath');


// Declare internals

var internals = {};


internals.getStormpathApplication = function (apiKey, appHref, next) {

    internals.stormpathClient = new Stormpath.Client({
        apiKey: apiKey
    });

    internals.stormpathClient.getApplication(appHref, function (err, app) {

        if (err) {
            return next(err);
        }
        internals.stormpathApp = app;
        next();
    });
};


exports.register = function (server, options, next) {

    server.auth.scheme('stormpath', internals.stormpath);

    if (options.apiKey) {
        var apiKey = new Stormpath.ApiKey(options.apiKey.id, options.apiKey.secret);
        return internals.getStormpathApplication(apiKey, options.appHref, next);
    }

    try {
        Stormpath.loadApiKey(options.apiKeyPath, function (err, loadedApiKey) {

            if (err) {
                return next(err);
            }
            internals.getStormpathApplication(loadedApiKey, options.appHref, next);
        });

    } catch (ex) {
        return next(ex);
    }
};

exports.register.attributes = {
    pkg: require('../package.json')
};

internals.stormpath = function (server, options) {

    var scheme = {
        authenticate: function (request, reply) {

            internals.stormpathApp.authenticateApiRequest({
                request: request.raw.req
            }, function (err, authenticationResult) {

                if (err) {
                    err = Boom.wrap(err, err.statusCode, err.userMessage);
                    return reply(err, null, authenticationResult);
                }

                authenticationResult.getAccount({
                    expand: 'groups'
                }, function (err, credentials) {

                    if (process.env.TEST_GROUP_FAIL) {
                        err = Boom.forbidden('scope error.');
                    }

                    if (err) {
                        err = Boom.wrap(err, err.statusCode, err.userMessage);
                        return reply(err, null, credentials);
                    }

                    credentials.scope = [];
                    credentials.groups.items.forEach(function (item) {

                        credentials.scope.push(item.name.toLowerCase());
                    });

                    var result = { credentials: credentials };
                    return reply.continue(result);
                });
            });
        }
    };
    return scheme;
};
