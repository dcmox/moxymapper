"use strict";
exports.__esModule = true;
var fs = require('fs');
var levenshtein = require('string-dist').levenshtein;
var MoxyAddress = require('moxy-address').MoxyAddress;
var MoxyMapper = /** @class */ (function () {
    function MoxyMapper(srcSample, destSample) {
        var _this = this;
        this._srcSample = {};
        this._destSample = {};
        this.save = function (dest) {
            fs.writeFileSync(dest, _this._mappedData);
            return true;
        };
        this.buildMap = function (srcSample, destSample) {
            var srcKeys = Object.keys(srcSample);
            srcKeys.forEach(function (key) {
                if (typeof srcSample[key] === 'object') {
                    var tmpKeys = _this._getKeys(srcSample[key], key);
                    srcKeys = srcKeys.concat(tmpKeys);
                }
            });
            var output = "let dest = {}\n";
            var destKeys = Object.keys(destSample);
            destKeys.forEach(function (key) {
                if (typeof destSample[key] === 'object') {
                    output += "dest." + key + " = {}\n";
                    var out = _this._getSubsetOutput(destSample[key], key, srcSample, srcKeys);
                    output += out;
                }
                else {
                    var idx = srcKeys.indexOf(key) > -1;
                    if (idx && srcSample[key] === destSample[key]) {
                        output += "dest." + key + " = src." + key + "\n";
                    }
                    else {
                        // Name split
                        if (key.toLowerCase().indexOf('name') > -1
                            && srcKeys.indexOf('name') > -1) {
                            if (srcSample.name.indexOf(' ') > -1) {
                                var _a = srcSample.name.split(' '), firstName = _a[0], lastName = _a[1];
                                if (destSample[key] === firstName) {
                                    output += "dest." + key + " = src.name.split(' ')[0]\n";
                                }
                                if (destSample[key] === lastName) {
                                    output += "dest." + key + " = src.name.split(' ')[1]\n";
                                }
                            }
                        }
                    }
                }
            });
            return output + '\ndest';
        };
        this._getKeys = function (o, key) { return Object.keys(o).map(function (k) { return key + '.' + k; }); };
        this._getSubsetOutput = function (dest, path, src, srcKeys) {
            var destKeys = Object.keys(dest);
            var output = '';
            var oo = {};
            destKeys.forEach(function (key) {
                if (typeof dest[key] === 'object') {
                    output += "dest." + path + "." + key + " = {}\n";
                    var out = _this._getSubsetOutput(dest[key], path + "." + key, src, srcKeys);
                    if (out) {
                        output += out;
                    }
                }
                else {
                    var idx = srcKeys.indexOf(key) > -1;
                    if (idx && src[key] === dest[key]) {
                        output += "dest." + path + "." + key + " = src." + key + "\n";
                    }
                    else {
                        var keyPossibilities = srcKeys.filter(function (k) {
                            if (k.indexOf('.') === -1
                                && src[k] === dest[key]
                                && levenshtein(k.toLowerCase(), key.toLowerCase()) <= 1) {
                                return true;
                            }
                            else {
                                var nodes = k.split('.');
                                var node_1 = src;
                                nodes.forEach(function (n) {
                                    node_1 = node_1[n];
                                    k = n;
                                });
                                if (node_1 === dest[key] && levenshtein(k.toLowerCase(), key.toLowerCase()) <= 1) {
                                    return true;
                                }
                            }
                            return false;
                        });
                        if (keyPossibilities.length === 1) {
                            output += "dest." + path + "." + key + " = src." + keyPossibilities[0] + "\n";
                        }
                        else {
                            // Custom logic for addresses and other data types
                            var kp = srcKeys.filter(function (k) {
                                if (k.indexOf('.') === -1 && levenshtein(k.toLowerCase(), key.toLowerCase()) <= 1) {
                                    return true;
                                }
                            });
                            if (kp.length === 1) {
                                if (key.replace(/[0-9]/g, '') === kp[0]) {
                                    if (['street', 'street1', 'address', 'zip'].indexOf(kp[0]) > -1) {
                                        var address = MoxyAddress.parse(src[kp[0]]);
                                        if (address[key] === dest[key].replace(/\./g, '')) {
                                            if (!oo[path + "." + kp[0]]) {
                                                oo[path + "." + kp[0]] = "const address = MoxyAddress.parse(src." + kp[0] + ")\n";
                                            }
                                            output += "dest." + path + "." + key + " = address." + key + "\n";
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            var headers = '';
            Object.keys(oo).forEach(function (k) { return headers += oo[k] + '\n'; });
            return headers + output;
        };
        if (srcSample) {
            this._srcSample = srcSample;
        }
        if (destSample) {
            this._destSample = destSample;
        }
        if (srcSample && destSample) {
            this._mappedData = this.buildMap(srcSample, destSample);
        }
        else {
            this._mappedData = '';
        }
    }
    MoxyMapper.prototype.map = function (src, mapFile) {
        if (mapFile) {
            this._mappedData = fs.readFileSync(mapFile).toString();
            return eval(this._mappedData);
        }
        else if (this._mappedData) {
            // tslint:disable-next-line: no-eval
            return eval(this._mappedData);
        }
        return {};
    };
    return MoxyMapper;
}());
exports.MoxyMapper = MoxyMapper;
exports["default"] = MoxyMapper;
