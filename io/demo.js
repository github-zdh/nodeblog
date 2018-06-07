function asyncAwait(fun){
     return new Promise(function(resolve,reject){
         if(fun){
             fun(resolve,reject)
         }else{
             resolve();
         }
     })
}
var obj = {};
obj.abc=async function(){
     var getAsyncAwait = await (function(resolve,reject){
                      setTimeout(function(){
                         return resolve('123456')
                      },3000)
              })();
     console.log(getAsyncAwait)
     console.log(123)
}
obj.abc()
