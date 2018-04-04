var express = require('express');
var crypto = require('crypto');
var ejs = require('ejs');
var path = require('path');
var sql = require(__ROOTDIR__+'/config/mysql');
var config = require(__ROOTDIR__+'/config/config');
var com = require(__ROOTDIR__+'/config/common');

exports.news=function(req,res,next){
     res.render(config.__web_v__+'/news',{title:JSON.stringify(req.session)});
}
exports.newsId=function(req,res,next){ 
     res.render(config.__web_v__+'/news',{title:req.params.id});
}

