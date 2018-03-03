var express = require('express');
var formidable = require('formidable');
var crypto = require('crypto');
var ejs = require('ejs');
var sql = require(__ROOTDIR__+'/config/mysql');
var config = require(__ROOTDIR__+'/config/config');
var com = require(__ROOTDIR__+'/config/common');
var base = require(__ROOTDIR__+'/config/base');


exports.index=function (req, res, next) {
         var list=base.list(req,res,2);
         
         res.render(config.__admin_v__+'/articles',{user_id:user_id}); 
};
