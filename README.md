### hapi-auth-stormpath

[![Build Status](https://travis-ci.org/diorahman/hapi-auth-stormpath.svg?branch=master)](https://travis-ci.org/diorahman/hapi-auth-stormpath)

#### Stormpath API authentication

It uses `application.authenticationApiRequest` of Stormpath API. We can load the key from path or defined it as an object. We can also take advantage the group names as `scope` in a route config's `auth.scope`.

#### Example

Load the key from a predefined path (the `appKeyPath`)

```js

server.register({
  register: require('../'),
  options: {
    appKeyPath: __dirname + '/data/key',
    appHref: 'https://your/stormpath/app/url'
  }
}, function(err) {}

```

Or using the API key object (the `apiKey`),

```js

server.register({
  register: require('../'),
  options: {
    apiKey: {
        id: process.env['STROMPATH_APIKEY_ID'],
        secret: process.env['STROMPATH_APIKEY_SECRET']
    },
    appHref: 'https://your/stormpath/app/url'
  }
}, function(err) {}

```

#### License

MIT

