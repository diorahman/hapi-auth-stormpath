### hapi-auth-stormpath

[![Build Status](https://travis-ci.org/diorahman/hapi-auth-stormpath.svg?branch=master)](https://travis-ci.org/diorahman/hapi-auth-stormpath)

#### Stormpath API authentication

It uses `application.authenticationApiRequest` of Stormpath API. We can load the key from path or define it as an object. We can also take advantage the group names as `scope` in a route config's `auth.scope`.

#### Example

Load the key from a predefined path (the `apiKeyPath`)

```js

server.register({
  register: require('hapi-auth-stormpath'),
  options: {
    apiKeyPath: __dirname + '/data/key',
    appHref: 'https://your/stormpath/app/url'
  }
}, function(err) {}

```

Or using the API key object (the `apiKey`),

```js

server.register({
  register: require('hapi-auth-stormpath'),
  options: {
    apiKey: {
        id: process.env['STORMPATH_APIKEY_ID'],
        secret: process.env['STORMPATH_APIKEY_SECRET']
    },
    appHref: 'https://your/stormpath/app/url'
  }
}, function(err) {}

```

Before registring one or more routes you will need to tell your Hapi server to use this strategy:
```js
server.auth.strategy('default', 'stormpath');
```

Now you can add the `auth` property to the routes you want to restrict like so:
```js
{
  method: 'GET',
  path: '/my-route',
  config: {
    handler: (request, reply) => {
       reply('hello auth route');
    },
    auth: 'default',
  },
}
```
#### License

MIT
