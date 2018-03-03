var express = require('express');
var crypto = require('crypto');
var ejs = require('ejs');
var path = require('path');
var url = require('url');
var sql = require(__ROOTDIR__+'/config/mysql');
var config = require(__ROOTDIR__+'/config/config');
var com = require(__ROOTDIR__+'/config/common');
var base = require(__ROOTDIR__+'/config/base');
var chat = {};

chat.index = (req,res,next) => {

	  return base.returnjson(res,200,"index",__appPageInfo__);
}
chat.talk = (req,res,next) => {
	
	  return base.returnjson(res,200,"talk",__appPageInfo__);
}


module.exports = chat;
