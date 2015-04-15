(function() {
    "use strict";

    /*
        Fora Request
        A wrapper around koa's request.
    */

    var urlModule = require('url'),
        qs = require('querystring'),
        multipart = require('co-multipart'),
        body = require('co-body');

    var simplePathRegExp = /^(\/\/?(?!\/)[^\?#\s]*)(\?[^#\s]*)?$/;


    //via https://github.com/expressjs/parseurl/blob/master/index.js
    var fastparse = function (str) {
        // Try fast path regexp
        // See: https://github.com/joyent/node/pull/7878
        var simplePath = typeof str === 'string' && simplePathRegExp.exec(str);

        // Construct simple URL
        if (simplePath) {
            var pathname = simplePath[1];
            var search = simplePath[2] || null;
            var url = urlModule.Url !== undefined ? new urlModule.Url() : {};
            url.path = str;
            url.href = str;
            url.pathname = pathname;
            url.search = search;
            url.query = search && search.substr(1);

            return url;
        }

        return urlModule.parse(str);
    };


    var RequestWrapper = function(koaRequest) {
        this.koaRequest = koaRequest;
    };


    Object.defineProperty(RequestWrapper.prototype, "url", {
        get: function() {
            return this.koaRequest.url;
        },
        set: function(val) {
            this.koaRequest.url = val;
        }
    });


    Object.defineProperty(RequestWrapper.prototype, "path", {
        get: function() {
            return this.koaRequest.path;
        }
    });



    Object.defineProperty(RequestWrapper.prototype, "querystring", {
        get: function() {
            return this.koaRequest.querystring;
        }
    });


    Object.defineProperty(RequestWrapper.prototype, "query", {
        get: function() {
            return this.koaRequest.query;
        }
    });


    //This is a TODO and an ERROR. Must not pass through koa cookies.
    Object.defineProperty(RequestWrapper.prototype, "cookies", {
        get: function() {
            return this.koaRequest.cookies;
        }
    });


    RequestWrapper.prototype.getFiles = function*() {
        if (!this.requestFiles)
            this.requestFiles = (yield multipart(this.koaRequest)).files || [];
        return this.requestFiles;
    };


    RequestWrapper.prototype.getFormFields = function*() {
        if (!this.requestBody)
            this.requestBody = (yield body(this.koaRequest)) || {};
        return this.requestBody;
    };


    RequestWrapper.prototype.getFormField = function*(name) {
        var fields = yield* this.getFormFields();
        return fields[name];
    };



    module.exports = RequestWrapper;

})();
