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
         var list=base.list(req,res,1);
         console.log(list);
         res.render(config.__admin_v__+'/',{list:list}); 

};

exports.news=function (req, res, next) {
      console.log('index-news-------------'+req.originalUrl); 
      res.render(config.__admin_v__+'/index');
};

exports.product=function(req, res, next) {
      var urlArr=req.originalUrl.split('/');
      var originalUrl=req.originalUrl.split('/')[1]+'-'+req.originalUrl.split('/')[2];
      console.log('product_1-'+req.params.product_1+'---'+'product_2-'+req.params.product_2+'---'+'product_3-'+req.params.product_3);
      console.log('index-product-req.originalUrl-urlArr-------------'+urlArr); 
      console.log('index-product-req.originalUrl-------------'+originalUrl); 
      console.log('index-product-req.url-------------'+req.url); 
      res.render(config.__admin_v__+'/index');

};


// module.exports = index;