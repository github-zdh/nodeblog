var express = require('express');
var crypto = require('crypto');
var ejs = require('ejs');
var path = require('path');
var url = require('url');
var sql = require(__ROOTDIR__+'/config/mysql');
var config = require(__ROOTDIR__+'/config/config');
var com = require(__ROOTDIR__+'/config/common');
var base = require(__ROOTDIR__+'/config/base');



exports.index=function (req, res, next) {

	     // console.log(req.session[__adminUserInfo__]);
         res.render(config.__admin_v__+'/',{__adminUserInfo__:req.session[__adminUserInfo__]}); 
};

exports.news=function (req, res, next) {
      res.render(config.__admin_v__+'/index');
};

exports.product=function(req, res, next) {
      var urlArr=req.originalUrl.split('/');
      var originalUrl=req.originalUrl.split('/')[1]+'-'+req.originalUrl.split('/')[2];
      res.render(config.__admin_v__+'/index');

};
exports.welcome=function (req, res, next) {
         var list=base.list(req,res,1);
         res.render(config.__admin_v__+'/welcome',{list:list}); 
};



// module.exports = index;