/**
* @overview Yet another JSONP request manager with superagent-like API.
* @license MIT
* @version 0.3.0
* @author Vadim Chernenko
* @see {@link https://github.com/v4ernenko/JSONPony|JSONPony source code repository}
*/

var JSONPony = (function (win, doc, undefined) {
    'use strict';

    var noop = function () {},

        util = {
            isArray: Array.isArray || function (value) {
                return {}.toString.call(value) === '[object Array]';
            },

            getIndex: (function () {
                var index = 0;

                return function () {
                    return ++index;
                };
            })(),

            isObject: function (value) {
                return typeof value === 'object' && value !== null;
            },

            isString: function (value) {
                return typeof value === 'string';
            },

            isFunction: function (value) {
                return typeof value === 'function';
            }
        },

        encURI = win.encodeURIComponent;

    var Request = function (url) {
        if (!url || !util.isString(url)) {
            throw new Error('Bad url!');
        }

        this._url = url;
        this._params = [];
        this._timeout = 5000;
        this._charset = 'UTF-8';
        this._callbackParam = 'callback';
    };

    Request.prototype.use = function (field, value) {
        if (util.isObject(field)) {
            for (var key in field) {
                this.use(key, field[key]);
            }

            return this;
        }

        switch (field) {
            case 'charset':
                this._charset = value;

                break;

            case 'timeout':
                this._timeout = value;

                break;

            case 'callbackParam':
                this._callbackParam = value;

                break;
        }

        return this;
    };

    Request.prototype.set = function (param, value) {
        var i, n, key;

        if (util.isObject(param)) {
            for (key in param) {
                this.set(key, param[key]);
            }

            return this;
        }

        param = encURI(param);

        if (!util.isArray(value)) {
            value = [value];
        }

        for (i = 0, n = value.length; i < n; i++) {
            this._params.push(param + '=' + encURI(value[i]));
        }

        return this;
    };

    Request.prototype.end = function (callback, context) {
        var url = this._url,

            key = '_' + util.getIndex().toString(36),

            timer,

            parent = doc.getElementsByTagName('head')[0] ||
                     doc.documentElement,

            params = this._params,

            script = doc.createElement('script'),

            timeout = this._timeout,

            cleanup = function () {
                timer && win.clearTimeout(timer);

                script.onload = null;
                script.onerror = null;
                script.onreadystatechange = null;

                win.setTimeout(function () {
                    if (script.parentNode) {
                        script.parentNode.removeChild(script);
                    }

                    if (win[Request.STORAGE][key]) {
                        win[Request.STORAGE][key] = noop;
                    }
                }, 0);
            },

            callbackParam = encURI(this._callbackParam);

        if (!util.isFunction(callback)) {
            callback = noop;
        }

        win[Request.STORAGE][key] = function (reply) {
            delete win[Request.STORAGE][key];

            callback.call(context, null, reply);
        };

        params.push(callbackParam + '=' + Request.STORAGE + '.' + key);

        url += (url.indexOf('?') >= 0 ? '&' : '?') + params.join('&');

        script.src = url;
        script.type = 'text/javascript';
        script.charset = this._charset;

        if (script.addEventListener) {
            script.onload = script.onerror = function (event) {
                cleanup();

                if (event.type === 'error') {
                    callback.call(context, new Error('Network error!'));
                }
            };
        } else if (script.readyState) {
            script.onreadystatechange = function () {
                var state = this.readyState;

                if (state === 'loaded' || state === 'complete') {
                    cleanup();
                }
            };
        }

        if (timeout) {
            timer = win.setTimeout(function () {
                timer = 0;

                cleanup();

                callback.call(context, new Error('Timeout error!'));
            }, timeout);
        }

        parent.appendChild(script);

        return new this.constructor(this._url);
    };

    Request.STORAGE = '_JSONPONY_';

    win[Request.STORAGE] = win[Request.STORAGE] || {};

    return function (url, params, callback) {
        var request = new Request(url);

        if (util.isFunction(params)) {
            callback = params;

            params = null;
        }

        if (params) {
            request.set(params);
        }

        return callback ? request.end(callback) : request;
    };
})(window, window.document);
