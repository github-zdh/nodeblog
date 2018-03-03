var express = require('express');
var fs = require('fs');
var fse = require('fs-extra');
var crypto = require('crypto');
var ejs = require('ejs');
var path = require('path');
var url = require('url');
var ueditor = require("ueditor")
var multiparty = require('multiparty');
var util = require('util');

var sql = require(__ROOTDIR__+'/config/mysql');
var config = require(__ROOTDIR__+'/config/config');
var com = require(__ROOTDIR__+'/config/common');
var base = require(__ROOTDIR__+'/config/base');

exports.ue =  ueditor(path.join(__ROOTDIR__, 'public'), function (req, res, next) {
    //客户端上传文件设置
    var imgDir = '/upload/images/';
     var ActionType = req.query.action;
    if (ActionType === 'uploadimage' || ActionType === 'uploadfile' || ActionType === 'uploadvideo') {
        var file_url = imgDir;//默认图片上传地址
        /*其他上传格式的地址*/
        if (ActionType === 'uploadfile') {
            file_url = '/upload/file/'; //附件
        }
        if (ActionType === 'uploadvideo') {
            file_url = '/upload/video/'; //视频
        }
        res.ue_up(file_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
        res.setHeader('Content-Type', 'text/html');
    }
    //  客户端发起图片列表请求
    else if (req.query.action === 'listimage') {
        // var dir_url = imgDir;
        var dir_url = imgDir;        
        res.ue_list(dir_url); // 客户端会列出 dir_url 目录下的所有图片
    }
    // 客户端发起其它请求
    else {
        // console.log('config.json')
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/ueditor/nodejs/config.json');
    }
})



exports.ueditorDemo = (req,res)=>{
       res.render(config.__web_v__+'/ueditor');
}


// module.exports = index;