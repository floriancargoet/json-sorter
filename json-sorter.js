/*jshint node:true */

/* TODO:
 *   - tests
 *   - options
 */
(function (exports) {
    'use strict';

    var options = {};
    var defaultOptions = {
        // sort options
        primitivesFirst  : false,
        sortFunction     : null,
        // formatting options
        compactArrays    : false,
        // colons options
        alignColons      : false,
        spaceBeforeColon : '',
        spaceAfterColon  : ' '
    };

    function setOptions (o) {
        var prop;
        // copy default options
        for (prop in defaultOptions) {
            if (defaultOptions.hasOwnProperty(prop)) {
                options[prop] = defaultOptions[prop];
            }
        }

        // overwrite with new options
        for (prop in o) {
            if (o.hasOwnProperty(prop)) {
                options[prop] = o[prop];
            }
        }
    }

    function typeOf(obj){
        return Object.prototype.toString.call(obj);
    }

    function sortedKeys(obj) {
        var keys = Object.keys(obj);
        if (options.primitivesFirst) {
            var scalars = [], composed = [];
            keys.sort(options.sort).forEach(function (key) {
                var type = typeOf(obj[key]);
                if (type === '[object Array]' || type === '[object Object]') {
                    composed.push(key);
                } else {
                    scalars.push(key);
                }
            });
            return scalars.concat(composed);
        } else {
            return keys.sort(options.sort);
        }
    }

    function stringify(value, replacer, space) {
        if (value === undefined){
            return;
        }
        // clean value with native JSON, apply replacer
        value = JSON.parse(JSON.stringify(value, replacer));

        if (space) {
            if (typeof space === 'number') {
                var nbSpace = space;
                space = '';
                for (var i = 0; i < nbSpace; i++) {
                    space += ' ';
                }
            }
            space = space.substr(0, 10);
        } else {
            space = '';
        }

        return stringifySorted(value, space, 0);
    }

    function stringifySorted(value, space, indentLevel) {
        if (value && typeof value === 'object') {
            // array
            if (typeOf(value) === '[object Array]') {
                return stringifyArray(value, space, indentLevel);
            }
            // object
            return stringifyObject(value, space, indentLevel);
        }
        return JSON.stringify(value, null, space);
    }

    function stringifyObject(obj, space, indentLevel) {
        var keys = sortedKeys(obj);
        if (keys.length === 0) {
            return '{}';
        }

        var partial = [];
        var colonPosition;
        if (space && options.alignColons) {
            colonPosition = 0;
            keys.forEach(function (key) {
                var type = typeOf(obj[key]);
                if (type === '[object Array]' || type === '[object Object]') {
                    return;
                }

                key = quote(key);
                if (key.length > colonPosition) {
                    colonPosition = key.length;
                }
            });
            colonPosition++;
        } else {
            colonPosition = 0; // disabled
        }
        keys.forEach(function (key) {
            var value = obj[key];
            key = quote(key);
            var type = typeOf(value);
            if (type === '[object Array]' || type === '[object Object]') {
                colonPosition = 0;
            }
            var colon = space ? makeColon(key.length, colonPosition) : ':';
            partial.push(key + colon + stringifySorted(value, space, indentLevel + 1));
        });
        return format('{', partial, '}', space, indentLevel);
    }

    function makeColon(l, colonPosition) {
        var before = options.spaceBeforeColon;
        for (var i = l; i < colonPosition; i++) {
            before += ' ';
        }
        return before + ':' + options.spaceAfterColon;
    }

    function stringifyArray(arr, space, indentLevel) {
        if (arr.length === 0) {
            return '[]';
        }

        var partial = [];
        for (var i = 0, l = arr.length; i < l; i++) {
            partial.push(stringifySorted(arr[i], space, indentLevel + (options.compactArrays ? 0 : 1)));
        }

        if (options.compactArrays) {
            return  '[' + partial.join(', ') + ']';
        } else {
            return format('[', partial, ']', space, indentLevel);
        }
    }

    function format(open, partial, close, space, indentLevel) {
        var outerIndent = makeIndent(space, indentLevel);
        var innerIndent = makeIndent(space, indentLevel + 1);
        var nl = space ? '\n' : '';
        return  open + nl +
                    innerIndent + partial.join(',' + nl + innerIndent) + nl +
                outerIndent + close;
    }

    // reformated from https://github.com/douglascrockford/JSON-js/blob/master/json2.js
    var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var meta = { // table of character substitutions
        '\b' : '\\b',
        '\t' : '\\t',
        '\n' : '\\n',
        '\f' : '\\f',
        '\r' : '\\r',
        '"'  : '\\"',
        '\\' : '\\\\'
    };
    function quote(string) {
        // If the string contains no control characters, no quote characters, and no
        // backslash characters, then we can safely slap some quotes around it.
        // Otherwise we must also replace the offending characters with safe escape
        // sequences.

        escapable.lastIndex = 0;
        if  (escapable.test(string)) {
            return '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                if (typeof c !== 'string') {
                    return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                }
                return c;
            }) + '"';
        } else {
            return '"' + string + '"';
        }
    }

    function makeIndent(space, indentLevel) {
        var indent = '';
        for (var i = 0; i < indentLevel; i++) {
            indent += space;
        }
        return indent;
    }

    exports.stringify = stringify;
    exports.parse = JSON.parse;
    exports.setOptions = setOptions;

}(typeof exports === 'undefined' ? this.JSONSorter = {} : exports));
