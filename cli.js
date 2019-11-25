#!/usr/bin/env node
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
var program = require('commander');
var crypto_1 = require("crypto");
var chalk_1 = require("chalk");
var http = require("http");
var https = require("https");
var filesystem = require("fs");
var CONCURRENT_REQUESTS_DEFAULT = 5;
var REPORT_FILENAME_SUFFIX_DEFAULT = 'redirects';
var USER_AGENT_DEFAULT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36';
var URL_PROTOCOL_REGEX = /^(?:f|ht)tps?\:\/\//;
var URL_HTTPS_PROTOCOL_REGEX = /^https:\/\//;
var URL_VALIDATION_REGEX = /^((?:f|ht)tps?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
var report = [];
var didError = false;
program
    .option('-s, --sites <urls>', 'Comma-delimited list of URLs to check redirects', function (string) { return string.split(','); }, [])
    .option('-t, --targets <urls>', 'Comma-delimited list of target URLs to compare to final redirect URLs', function (string) { return string.split(','); }, [])
    .option('-c, --codes <codes>', 'Comma-delimited list of target status codes to compare to final redirect status codes', function (string) { return string.split(','); }, [])
    .option('-p, --prefix <prefix>', 'Prefix to be applied to all sites without a protocol')
    .option('-r, --protocol <protocol>', 'Protocol to be applied to all sites without a protocol')
    .option('-a, --auth <username:password>', 'Provide a username and password for authentication')
    .option('-n, --concurrent <number>', 'Number of request to make concurrently. Defaults to 5')
    .option('-j, --json', 'Generates JSON reports')
    .option('-x, --xlsx', 'Generates XLSX reports')
    .option('-f, --filename <filename>', 'Set the name of the generated report file')
    .parse(process.argv);
var log = {
    missingInputURLs: function () {
        console.error(chalk_1.red("\n    ERROR: No site URLs were given.\n    Please make sure to include URLs with -s or --sites: " + chalk_1.magenta('redirect-tester -s google.com,facebook.com') + "\n"));
    },
    inputAndTargetURLsLengthMismatched: function () {
        console.error(chalk_1.red("\n    ERROR: The number of input URLs and target URLs (sites and targets) did not match.\n    If you use targets, the list of targets must be the same length as the list of sites.\n    To skip a target for a specific site, just leave an empty spot in the target list.\n    For example, to skip providing a target for facebook.com:\n    " + chalk_1.magenta('redirect-tester -s google.com,facebook.com,intouchsol.com -t http://www.google.com,,http://www.intouchsol.com') + "\n"));
    },
    inputURLsAndTargetRedirectStatusCodesLengthMismatched: function () {
        console.error(chalk_1.red("\n    ERROR: The number of input URLs and target status codes (sites and codes) did not match.\n    If you use codes, the list of codes must be the same length as the list of sites.\n    To skip a code for a specific site, just leave an empty spot in the code list.\n    For example, to skip providing a code for facebook.com:\n    " + chalk_1.magenta('redirect-tester -s google.com,facebook.com,intouchsol.com -c 301,,301') + "\n"));
    },
    targetRedirectStatusCodesTypeInvalid: function () {
        console.error(chalk_1.red("\n    ERROR: Some target status codes were not numbers. Codes must be three-digit numbers."));
    },
    failedToParseAuth: function () {
        console.error(chalk_1.red("\n    ERROR: Could not parse auth option (username and password), please check the format:\n    " + chalk_1.magenta('redirect-tester -s example.com -a username:password') + "\n"));
    },
    noReportsBeingCreated: function () {
        console.warn(chalk_1.yellow('\n    WARNING: No reports are being created. Use the --json or --xlsx options to generate reports.'));
    },
    prefixWarning: function (missingPrefixURLs) {
        console.warn(chalk_1.yellow('\n    WARNING: Some input URLs did not have a protocol, and no prefix was provided:\n'));
        missingPrefixURLs.forEach(function (_a) {
            var inputURL = _a.inputURL, inputIndex = _a.inputIndex;
            return console.log(chalk_1.yellow("    " + (inputIndex + 1) + ". " + inputURL));
        });
    },
    invalidError: function (invalidURLs) {
        didError = true;
        console.error(chalk_1.red('\n    ERROR: Some input URLs were invalid:\n'));
        invalidURLs.forEach(function (_a) {
            var inputURL = _a.inputURL, inputIndex = _a.inputIndex;
            return console.log(chalk_1.red("    " + (inputIndex + 1) + ". " + inputURL));
        });
    },
    requestError: function (_a, inputIndex) {
        var error = _a.error, url = _a.url;
        didError = true;
        console.error(chalk_1.red('\n    ERROR: An error occurred during the URL request:'));
        console.log(chalk_1.red("    " + (inputIndex !== undefined ? inputIndex + 1 + "." : undefined), url));
        console.log(chalk_1.red("    ", error));
    },
    missingTargetResult: function (_a) {
        var guid = _a.guid, url = _a.url;
        didError = true;
        console.error(chalk_1.red('\n    ERROR: Missing targetResult when searching by GUID. This should not happen.\n    Please contact a developer and provide the following information:\n'));
        console.log(chalk_1.magenta("    targetResult guid = " + guid + "\n"));
        console.log(chalk_1.magenta("    targetResult url = " + url + "\n"));
    },
    writingToDisk: function (json, xlsx) {
        console.log(chalk_1.white("\n\n    Generating report types:\n    ---------------------------------------------------\n    " + (json ? chalk_1.green('✓') : chalk_1.red('x')) + " JSON    " + (xlsx ? chalk_1.green('✓') : chalk_1.red('x')) + " XLSX\n\n\n    Processing " + chalk_1.cyan(report.length) + " URLs: \n    ---------------------------------------------------"));
        report.forEach(function (_a, index) {
            var url = _a.url;
            return console.log("    " + chalk_1.cyan(index + 1 + ".") + " " + chalk_1.white(url));
        });
        console.log('\n');
    },
    errorWritingToDisk: function (error, json, xlsx) {
        didError = true;
        console.error(chalk_1.red("\n    ERROR: Error writing " + (json ? 'JSON' : xlsx ? 'XLSX' : '') + " report to disk:", error));
    },
    wroteToDisk: function (jsonFilenames, xlsxFilenames, json, xlsx) {
        if (json) {
            console.log(chalk_1.white("\n    Wrote JSON report(s) to disk:\n"));
            jsonFilenames.forEach(function (filename, index) { return console.log(chalk_1.white("        " + (index + 1) + ". " + chalk_1.cyan(filename))); });
            console.log('\n');
        }
        if (xlsx) {
            if (!json) {
                console.log('\n');
            }
            console.log(chalk_1.white("    Wrote XLSX report(s) to disk:\n"));
            xlsxFilenames.forEach(function (filename, index) { return console.log(chalk_1.white("        " + (index + 1) + ". " + chalk_1.cyan(filename))); });
            console.log('\n');
        }
    },
    programDidError: function () {
        console.error(chalk_1.red('\n    ERROR: At least one error occurred while the tool was running.\n    However, the report was able to be completed.\n    Please review the console for any error messages.\n'));
    }
};
var validateURLs = function (inputURLs) {
    var validURLs = [];
    var invalidURLs = [];
    inputURLs.forEach(function (inputURL, index) {
        var urlObject = { inputIndex: index, inputURL: inputURL };
        if (URL_VALIDATION_REGEX.test(inputURL)) {
            validURLs.push(urlObject);
        }
        else {
            invalidURLs.push(urlObject);
        }
    });
    if (invalidURLs.length) {
        log.invalidError(invalidURLs);
    }
    return validURLs;
};
var generateGuid = function () {
    var placeholder = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11);
    var guid = placeholder.replace(/[018]/g, function (character) {
        var randomNumber = (crypto_1.randomFillSync(new Uint8Array(1))[0] & 15) >> (character / 4);
        var randomString = (character ^ randomNumber).toString(16);
        return randomString;
    });
    return guid;
};
var creatInitialReport = function (validURLs, targetURLs, targetRedirectStatusCodes, prefix, protocol) {
    var missingPrefixURLs = [];
    var baseURLObjects = validURLs.map(function (_a) {
        var inputURL = _a.inputURL, inputIndex = _a.inputIndex;
        var url;
        if (URL_PROTOCOL_REGEX.test(inputURL)) {
            url = new URL(inputURL).href;
        }
        else {
            missingPrefixURLs.push({ inputURL: inputURL, inputIndex: inputIndex });
            url = new URL((protocol ? protocol : 'https://') + (prefix ? prefix : '') + inputURL).href;
        }
        var targetURL = targetURLs[inputIndex];
        var targetRedirectStatusCode = targetRedirectStatusCodes[inputIndex];
        return {
            guid: generateGuid(),
            url: url,
            inputURL: inputURL,
            inputIndex: inputIndex,
            targetURL: targetURL,
            targetRedirectStatusCode: targetRedirectStatusCode,
            responses: []
        };
    });
    if (missingPrefixURLs.length > 0 && !prefix) {
        log.prefixWarning(missingPrefixURLs);
    }
    report.push.apply(report, baseURLObjects);
};
var chunk = function (items, batchSize) {
    var length = items.length;
    var chunks = [];
    for (var i = 0; i < length; i += batchSize) {
        chunks.push(items.slice(i, i + batchSize));
    }
    return chunks;
};
var performBatchAsyncRequests = function (requests, auth) {
    return Promise.all(requests.map(function (_a) {
        var url = _a.url, rest = __rest(_a, ["url"]);
        return new Promise(function (resolve) {
            try {
                var protocolAdapter_1 = URL_HTTPS_PROTOCOL_REGEX.test(url) ? https : http;
                protocolAdapter_1.get(url, { headers: { 'User-Agent': USER_AGENT_DEFAULT } }, function (_a) {
                    var statusCode = _a.statusCode, headers = _a.headers;
                    if (statusCode === 401 && auth) {
                        protocolAdapter_1.get(url, {
                            headers: {
                                'User-Agent': USER_AGENT_DEFAULT,
                                'Authorization': 'Basic ' + Buffer.from(auth).toString('base64')
                            }
                        }, function (_a) {
                            var statusCode = _a.statusCode, headers = _a.headers;
                            return resolve(__assign(__assign({}, rest), { url: url, statusCode: statusCode, location: headers && headers.location }));
                        }).on('error', function (error) { return resolve(__assign(__assign({}, rest), { url: url, error: error })); });
                    }
                    else {
                        resolve(__assign(__assign({}, rest), { url: url, statusCode: statusCode, location: headers && headers.location }));
                    }
                }).on('error', function (error) { return resolve(__assign(__assign({}, rest), { url: url, error: error })); });
            }
            catch (error) {
                resolve(__assign(__assign({}, rest), { url: url, error: error }));
            }
        });
    }));
};
var batchCheckRedirects = function (requests, numberOfConcurrentRequests, auth) { return __awaiter(void 0, void 0, void 0, function () {
    var requestChunks, chunkedResults, _i, requestChunks_1, chunk_1, _a, _b, results;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                requestChunks = chunk(requests, numberOfConcurrentRequests);
                chunkedResults = [];
                _i = 0, requestChunks_1 = requestChunks;
                _c.label = 1;
            case 1:
                if (!(_i < requestChunks_1.length)) return [3 /*break*/, 4];
                chunk_1 = requestChunks_1[_i];
                _b = (_a = chunkedResults).push;
                return [4 /*yield*/, performBatchAsyncRequests(chunk_1, auth)];
            case 2:
                _b.apply(_a, [_c.sent()]);
                _c.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4:
                results = chunkedResults.reduce(function (accumulator, value) { return accumulator.concat(value); }, []);
                return [2 /*return*/, results];
        }
    });
}); };
var updateReport = function (results) {
    results.forEach(function (result) {
        var targetBaseURL = report.find(function (_a) {
            var guid = _a.guid;
            return guid === result.guid;
        });
        if (result.hasOwnProperty('error')) {
            log.requestError(result, targetBaseURL ? targetBaseURL.inputIndex : undefined);
        }
        if (targetBaseURL) {
            targetBaseURL.responses.push(result);
        }
        else {
            log.missingTargetResult(result);
        }
    });
};
var recursivelyCheckRedirectsAndUpdateReport = function (requests, numberOfConcurrentRequests, auth) { return __awaiter(void 0, void 0, void 0, function () {
    var results, redirects, nextRequests;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, batchCheckRedirects(requests, numberOfConcurrentRequests, auth)];
            case 1:
                results = _a.sent();
                updateReport(results);
                redirects = results.filter(function (_a) {
                    var statusCode = _a.statusCode, location = _a.location;
                    return statusCode && location && statusCode >= 300 && statusCode < 400;
                });
                if (!redirects.length) return [3 /*break*/, 3];
                nextRequests = redirects.map(function (_a) {
                    var guid = _a.guid, location = _a.location;
                    return ({ guid: guid, url: location });
                });
                return [4 /*yield*/, recursivelyCheckRedirectsAndUpdateReport(nextRequests, numberOfConcurrentRequests, auth)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); };
var finalizeReport = function () {
    report.forEach(function (_a, index) {
        var responses = _a.responses;
        var reportItem = report[index];
        var redirectsLength = responses.length;
        reportItem.numberOfRedirects = redirectsLength - 1;
        reportItem.finalStatusCode = responses[redirectsLength - 1].statusCode;
        reportItem.finalURL = responses[redirectsLength - 1].url;
        var redirectResponses = responses.filter(function (_a) {
            var statusCode = _a.statusCode;
            return (statusCode && statusCode >= 300 && statusCode < 400);
        });
        reportItem.finalRedirectStatusCode = redirectResponses.length ? redirectResponses[redirectResponses.length - 1].statusCode : '';
        if (reportItem.targetURL) {
            reportItem.targetURLMatched = reportItem.targetURL === reportItem.finalURL;
        }
        if (reportItem.targetRedirectStatusCode) {
            reportItem.targetStatusMatched = reportItem.targetRedirectStatusCode === reportItem.finalRedirectStatusCode;
        }
    });
};
var generateReportFilename = function (fileExtension) {
    var today = new Date();
    var timestamp = today.getFullYear() + "-" + today.getMonth() + "-" + today.getDate() + "-" + today.getHours() + today.getMinutes() + today.getSeconds();
    return timestamp + "_" + REPORT_FILENAME_SUFFIX_DEFAULT + "." + fileExtension;
};
var createExcelWorkbook = function (usedTargetURLs, usedTargetCodes, prefix, protocol, auth) {
    var xl = require('excel4node');
    var workBook = new xl.Workbook();
    var workSheet = workBook.addWorksheet('Sheet 1');
    var headerStyle = workBook.createStyle({ fill: { type: 'pattern', patternType: 'solid', fgColor: '#5595D0' }, font: { color: '#FAFAFA', size: 16, bold: true } });
    var asideStyle = workBook.createStyle({ font: { color: '#030308', size: 16, bold: true }, alignment: { horizontal: 'right' } });
    var valueStyle = workBook.createStyle({ font: { color: '#030308', size: 12 } });
    var textWrapStyle = workBook.createStyle({ alignment: { wrapText: true } });
    var headerStartRow = 6;
    var headerTitlesAndWidths = [
        ['#', 6],
        ['Checked URL', 50],
        ['Target URL', 50],
        ['URL Match', 20],
        ['Final URL', 50],
        ['Target Redirect Status', 30],
        ['Status Match', 20],
        ['Final Redirect Status', 25],
        ['Final Response Status', 25],
        ['Redirect Count', 20],
        ['Input URL', 50]
    ];
    headerTitlesAndWidths.forEach(function (_a, index) {
        var string = _a[0], width = _a[1];
        workSheet.cell(headerStartRow, index + 1).string(string).style(headerStyle);
        workSheet.column(index + 1).setWidth(width);
    });
    workSheet.cell(1, 2).string('Checked URL Count:').style(asideStyle);
    workSheet.cell(1, 3).string(String(report.length)).style(valueStyle);
    workSheet.cell(2, 2).string('Used Target URLs:').style(asideStyle);
    workSheet.cell(2, 3).string(String(usedTargetURLs)).style(valueStyle);
    workSheet.cell(3, 2).string('Used Target Codes:').style(asideStyle);
    workSheet.cell(3, 3).string(String(usedTargetCodes)).style(valueStyle);
    workSheet.cell(1, 4).string('Used Auth:').style(asideStyle);
    workSheet.cell(1, 5).string(auth ? 'true' : 'false').style(valueStyle);
    workSheet.cell(2, 4).string('Prefix:').style(asideStyle);
    workSheet.cell(2, 5).string(prefix ? prefix : '').style(valueStyle);
    workSheet.cell(3, 4).string('Protocol:').style(asideStyle);
    workSheet.cell(3, 5).string(protocol ? protocol : '').style(valueStyle);
    var headersLength = headerTitlesAndWidths.length;
    report.forEach(function (_a, index) {
        var inputIndex = _a.inputIndex, url = _a.url, targetURL = _a.targetURL, targetURLMatched = _a.targetURLMatched, finalURL = _a.finalURL, targetRedirectStatusCode = _a.targetRedirectStatusCode, targetStatusMatched = _a.targetStatusMatched, finalStatusCode = _a.finalStatusCode, finalRedirectStatusCode = _a.finalRedirectStatusCode, numberOfRedirects = _a.numberOfRedirects, inputURL = _a.inputURL, responses = _a.responses;
        var rowNumber = index + 1 + headerStartRow;
        workSheet.row(rowNumber).setHeight(60);
        workSheet.cell(rowNumber, 1).string(String(inputIndex + 1)).style(valueStyle);
        workSheet.cell(rowNumber, 2).string(url).style(valueStyle).style(textWrapStyle);
        workSheet.cell(rowNumber, 3).string(String(targetURL !== undefined ? targetURL : '')).style(valueStyle).style(textWrapStyle);
        workSheet.cell(rowNumber, 4).string(String(targetURLMatched !== undefined ? targetURLMatched : '')).style(valueStyle);
        workSheet.cell(rowNumber, 5).string(String(finalURL)).style(valueStyle).style(textWrapStyle);
        workSheet.cell(rowNumber, 6).string(String(targetRedirectStatusCode !== undefined ? targetRedirectStatusCode : '')).style(valueStyle);
        workSheet.cell(rowNumber, 7).string(String(targetStatusMatched !== undefined ? targetStatusMatched : '')).style(valueStyle);
        workSheet.cell(rowNumber, 8).string(String(finalRedirectStatusCode)).style(valueStyle);
        workSheet.cell(rowNumber, 9).string(String(finalStatusCode)).style(valueStyle);
        workSheet.cell(rowNumber, 10).string(String(numberOfRedirects)).style(valueStyle);
        workSheet.cell(rowNumber, 11).string(inputURL).style(valueStyle).style(textWrapStyle);
        responses.forEach(function (_a, index) {
            var statusCode = _a.statusCode, location = _a.location;
            var responseNumber = index + 1;
            var columnNumber = headersLength - 1 + (responseNumber * 2);
            workSheet.column(columnNumber).setWidth(25);
            workSheet.column(columnNumber + 1).setWidth(40);
            workSheet.cell(headerStartRow, columnNumber).string("Response " + responseNumber + " Status").style(headerStyle);
            workSheet.cell(rowNumber, columnNumber).string(String(statusCode ? statusCode : '')).style(valueStyle);
            workSheet.cell(headerStartRow, columnNumber + 1).string("Response " + responseNumber + " Location").style(headerStyle);
            workSheet.cell(rowNumber, columnNumber + 1).string(location ? location : '').style(valueStyle).style(textWrapStyle);
        });
    });
    return workBook;
};
var writeToDisk = function (usedTargetURLs, usedTargetCodes, json, xlsx, prefix, protocol, auth, filename) {
    log.writingToDisk(json, xlsx);
    var jsonFilenames = [];
    var xlsxFilenames = [];
    if (json) {
        try {
            var jsonReport = {
                prefix: prefix ? prefix : '',
                protocol: protocol ? protocol : '',
                auth: auth ? true : false,
                report: report
            };
            var jsonFilename = filename ? filename + ".json" : generateReportFilename('json');
            filesystem.writeFile(jsonFilename, JSON.stringify(jsonReport), 'utf8', function (error) { return error ? log.errorWritingToDisk(error, true) : undefined; });
            jsonFilenames.push(jsonFilename);
        }
        catch (error) {
            log.errorWritingToDisk(error, true);
        }
    }
    if (xlsx) {
        try {
            var workBook = createExcelWorkbook(usedTargetURLs, usedTargetCodes, prefix, protocol, auth);
            var xlsxFilename = filename ? filename + ".xlsx" : generateReportFilename('xlsx');
            workBook.write(xlsxFilename);
            xlsxFilenames.push(xlsxFilename);
        }
        catch (error) {
            log.errorWritingToDisk(error, false, true);
        }
    }
    log.wroteToDisk(jsonFilenames, xlsxFilenames, json, xlsx);
};
var init = function () { return __awaiter(void 0, void 0, void 0, function () {
    var inputURLs, inputTargetURLs, inputTargetRedirectStatusCodes, prefix, protocol, auth, concurrent, json, xlsx, filename, _a, username, password, targetRedirectStatusCodes, validURLs, initialRequests, concurrentNumber;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                inputURLs = program.sites, inputTargetURLs = program.targets, inputTargetRedirectStatusCodes = program.codes, prefix = program.prefix, protocol = program.protocol, auth = program.auth, concurrent = program.concurrent, json = program.json, xlsx = program.xlsx, filename = program.filename;
                _a = auth ? auth.split(':') : [], username = _a[0], password = _a[1];
                if (inputURLs.length === 0) {
                    log.missingInputURLs();
                    process.exit(1);
                }
                if (auth && (!username || !password)) {
                    log.failedToParseAuth();
                    process.exit(1);
                }
                if (inputTargetURLs.length > 0 && inputURLs.length !== inputTargetURLs.length) {
                    log.inputAndTargetURLsLengthMismatched();
                    process.exit(1);
                }
                if (inputTargetRedirectStatusCodes.length > 0 && inputURLs.length !== inputTargetRedirectStatusCodes.length) {
                    log.inputURLsAndTargetRedirectStatusCodesLengthMismatched();
                    process.exit(1);
                }
                targetRedirectStatusCodes = inputTargetRedirectStatusCodes.map(function (statusCodeString) { return statusCodeString !== '' ? parseInt(statusCodeString) : undefined; });
                if (inputTargetRedirectStatusCodes.length && targetRedirectStatusCodes.some(function (statusCode) { return statusCode !== undefined && isNaN(statusCode); })) {
                    log.targetRedirectStatusCodesTypeInvalid();
                    process.exit(1);
                }
                if (!json && !xlsx) {
                    log.noReportsBeingCreated();
                }
                validURLs = validateURLs(inputURLs);
                creatInitialReport(validURLs, inputTargetURLs, targetRedirectStatusCodes, prefix, protocol);
                initialRequests = report.map(function (_a) {
                    var guid = _a.guid, url = _a.url;
                    return ({ guid: guid, url: url });
                });
                concurrentNumber = concurrent ? parseInt(concurrent) : CONCURRENT_REQUESTS_DEFAULT;
                return [4 /*yield*/, recursivelyCheckRedirectsAndUpdateReport(initialRequests, concurrentNumber, auth)];
            case 1:
                _b.sent();
                finalizeReport();
                writeToDisk(Boolean(inputTargetURLs.length), Boolean(inputTargetRedirectStatusCodes.length), json, xlsx, prefix, protocol, auth, filename);
                if (didError) {
                    log.programDidError();
                }
                return [2 /*return*/];
        }
    });
}); };
init();
