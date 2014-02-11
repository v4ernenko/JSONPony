# JSONPony

Yet another JSONP request manager with superagent-like API.

## Usage

```js
var url = 'http://...',

    params = {
        id: [1, 2, 3],
        action: 'delete'
    },

    callback = function (error, reply) {};

JSONPony(url)
    .set(params)
    .use('timeout', 10000)
    .end(callback);

JSONPony(url, callback);

JSONPony(url, params, callback);

JSONPony(url, params).end(callback);
```

## Options

- `timeout` (default: `5000`)
- `charset` (default: `UTF-8`)
- `callbackParam` (default: `callback`)

## License

MIT
