var express = require('express');
var formidable = require('formidable');
var crypto = require('crypto');
var ejs = require('ejs');
var sql = require(__ROOTDIR__+'/config/mysql');
var config = require(__ROOTDIR__+'/config/config');
var com = require(__ROOTDIR__+'/config/common');


exports.msg=function (req, res, next) {
     var msg = req.params.msg;
     res.render(config.__web_v__+'/errorMsg',{msg:msg,urlBool:false});
};

exports.msgUrl=function (req, res, next) {
     var msg = req.params.msg;
     res.render(config.__web_v__+'/errorMsg',{msg:msg,urlBool:true});
};

exports.lowVersion=function (req, res, next) {
	console.log(req.headers['user-agent'])
     var msg = req.params.msg;
     res.render(config.__web_v__+'/lowVersion');
};


