var express = require('express');
var formidable = require('formidable');
var crypto = require('crypto');
var ejs = require('ejs');
var sql = require(__ROOTDIR__+'/config/mysql');
var config = require(__ROOTDIR__+'/config/config');
var com = require(__ROOTDIR__+'/config/common');
var base = require(__ROOTDIR__+'/config/base');


exports.login=function (req, res, next) {
		  if(req.session.adminUserInfo){
                return res.redirect("/admin/index");
		  }
		  res.render(config.__admin_v__+'/login'); 
};

exports.postLogin=function (req, res, next) {
	console.log('postLogin');
      base.login(req, res, next,__adminUserInfo__);
};

exports.logout=function (req, res, next) {
	    delete req.session.adminUserInfo;
	    res.redirect('/admin/index'); 
};


exports.register=function (req, res, next) {
      console.log('register')
      res.render(config.__admin_v__+'/register'); 
};

exports.brower=function (req, res, next) {
      console.log('register')
      res.render(config.__admin_v__+'/brower'); 
};

exports.userInfo=function(req,res,next){
	  res.render(config.__admin_v__+'/userInfo'); 
}

