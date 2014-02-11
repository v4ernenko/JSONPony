# JSONPony

Yet another JSONP request manager with superagent-like API.

## Usage

```js
JSONPony('http://...', function (error, reply) {});

JSONPony('http://...')
    .use('timeout', 10000)
    .set('text', 'Some text')
    .set({id: [1, 2, 3], action: 'delete'})
    .end(function (error, reply) {});
```

## Options

- `timeout` (default: 5000)
- `charset` (default: 'UTF-8')
- `callbackParam` (default: 'callback')

## License

MIT
