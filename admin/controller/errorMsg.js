var express = require('express');
var formidable = require('formidable');
var crypto = require('crypto');
var ejs = require('ejs');
var sql = require(__ROOTDIR__+'/config/mysql');
var config = require(__ROOTDIR__+'/config/config');
var com = require(__ROOTDIR__+'/config/common');


exports.msg=function (req, res, next) {
     var msg = req.params.msg;
     res.render(config.__web_v__+'/errorMsg',{msg:msg});
};


