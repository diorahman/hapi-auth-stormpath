### hapi-auth-stormpath

#### Stormpath API authentication

It uses `application.authenticationApiRequest` of Stormpath API.


#### Example

```js

server.register({
  register: require('../'),
  options: {
    appKeyPath: __dirname + '/data/key',
    appHref: 'https://your/stormpath/app/url'
  }
}, function(err) {}

```

#### License

MIT

