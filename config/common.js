// 这个主要写公共方法
// 
var crypto = require('crypto');
var sql = require(__ROOTDIR__+'/config/mysql');

// md5 加密
exports.md5=function(val){
	   // md5密码加密
	    var md5 = crypto.createHash('md5');
	    md5.update(val);
	    var md5pwd = md5.digest('hex');
	    return md5pwd;
}

//当前时间戳
exports.timestamp=()=>{
      return parseInt(new Date().getTime()/1000);
}

//当前时间戳
exports.LocaleDate=()=>{
      return new Date(new Date().toLocaleDateString()).getTime()/1000;//获取当天0点时间戳  
}
// 时间戳转成时间
// num = 3
exports.getTime = (timestamp,num) => {
     const _date = new Date(timestamp*1000);
     if(num==3){
     	  return _date.getFullYear()+'/'+(_date.getMonth()+1)+'/'+_date.getDate();
     }
     return _date.getFullYear()+'/'+(_date.getMonth()+1)+'/'+_date.getDate()+' '+_date.getHours()+':'+_date.getMinutes()+':'+_date.getSeconds();
}

// 数组去重
exports.unique=function(arr){
		Array.prototype.unique = function(){
			    this.sort();    //先排序
			    var res = [this[0]];
			    for(var i = 1; i < this.length; i++){
			        if(this[i] !== res[res.length - 1]){
			            res.push(this[i]);
			        }
			    }
			    return res;
		}
		return arr.unique();
}

/*

 */ 
// 随机字符串数字（不确定个数）
exports.randomSN=function(arr){
		return Math.random().toString(36).substr(2);
}

/*
** randomFlag-是否任意长度 min-任意长度最小位[固定位数] max-任意长度最大位
*  生成3-32位随机串：randomWord(true, 3, 32)
*/
// 随机字符串数字（确定个数）
exports.randomFlag=function(randomFlag, min, max){
	    var str = "",
	        range = min,
	        arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
		    // 随机产生
		    if(randomFlag){
		        range = Math.round(Math.random() * (max-min)) + min;
		    }
		    for(var i=0; i<range; i++){
		        pos = Math.round(Math.random() * (arr.length-1));
		        str += arr[pos];
		    }
		    return str;
}

// 发帖/文章时间
exports.artTimeStamp=function(time){
      var currentTime = new Date().getTime()/1000;
      time = currentTime - time;
      switch(time){

      }
}

//判断类型
//返回的结果 object/array/string/function/boolean...
exports.objType=function(o){
	return Object.prototype.toString.call(o).split(' ')[1].split(']')[0].toLowerCase();
}