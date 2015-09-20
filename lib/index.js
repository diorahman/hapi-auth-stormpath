// Load modules

var Boom = require('boom');
var Stormpath = require('stormpath');

// Declare internals

var internals = {};

internals.getStormpathApplication = function (apiKey, appHref, next) {
  internals.stormpathClient = new Stormpath.Client({
    apiKey: apiKey
  });
  internals.stormpathClient.getApplication(appHref, function(err, app) {
    if (err) {
      return next(err);
    }
    internals.stormpathApp = app;
    next();
  });
}

exports.register = function (server, options, next) {
  server.auth.scheme('stormpath', internals.stormpath);
  
  if (options.apiKey) {
    var apiKey = new Stormpath.ApiKey(options.apiKey.id, options.apiKey.secret);
    return internals.getStormpathApplication(apiKey, options.appHref, next);
  }

  try {
    Stormpath.loadApiKey(options.apiKeyPath, function (err, apiKey) {
      if (err) {
        return next(err);
      }
      internals.getStormpathApplication(apiKey, options.appHref, next);
    });
  } catch (ex) {
    return next(ex);
  }
}

exports.register.attributes = {
  pkg: require('../package.json')
}

internals.stormpath = function (server, options) {
  var scheme = {
    authenticate: function (request, reply) {
      internals.stormpathApp.authenticateApiRequest({
        request: request.raw.req
      }, function (err, credentials) {
        var result = { credentials: credentials };
        if (err) {
          err = Boom.wrap(err, err.statusCode, err.userMessage);
          return reply(err, null, result);
        }

        if (credentials.status != 'ENABLED') {
          err = Boom.unauthorized('account is disabled');
          return reply(err, null, result);
        }

        return reply.continue(result);
      });      
    }
  }
  return scheme;
}
