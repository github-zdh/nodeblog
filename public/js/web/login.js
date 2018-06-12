document.addEventListener('DOMContentLoaded',function(){

layui.use(['jquery','form','element','laypage','table','layer','util'], function(){       
        var $ = layui.jquery
          ,form = layui.form
          ,layer = layui.layer
          ,laypage = layui.laypage
          ,table = layui.table  
          ,util = layui.util
          ,element = layui.element; //Tab的切换功能，切换事件监听等，需要依赖element模块
          //自定义验证规则
          form.verify({
                motto:function(value){
                    if(value.length > 100){
                         return '标题最多得100个字符啊';
                    }
                }
                ,email:[/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,'请输入邮箱']
                ,codeStringNumber:[/[0-9a-zA-Z]/, '字符串数字']
                ,code: function(value){
                    if(value.length != 6){
                         return '验证码为6位';
                    }
                }
                ,pass: [/(.+){6,12}$/, '密码必须6到12位']
                ,content: function(value){
                      layedit.sync(editIndex);
                }
          });
          //Hash地址的定位
          var layid = z.getHashPar('loginRegister');
          element.tabChange('loginRegister', layid);
          element.on('tab(loginRegister)', function(elem){
                if($(this).attr('lay-id')==null){
                     location.hash = 'loginRegister='+ z.getHashPar('loginRegister');
                }else{
                     location.hash = 'loginRegister='+ $(this).attr('lay-id');
                }
          });          
          z.popstate(function(){
                  var layid = z.getHashPar('loginRegister');
                  element.tabChange('loginRegister', layid);
          })
      

      //监听提交/登录
      form.on('submit(login)', function(data){
            $.ajax({
                 url:'/login/login',
                 data:data.field,
                 success:function(res){
                        var res = JSON.parse(res);
                        console.log(res);
                        if(res.code==200){
                              window.location.replace(res.result.url);
                        }else{
                               layer.alert(res.msg);
                        }                        
                 },
                 error:function(){
                  
                 }
            })
            return false;
      });
      //监听提交/注册
      form.on('submit(register)', function(data){
             console.log(data.field);
             $.ajax({
                   url:'/login/register',
                   data:data.field,
                   success:function(res){
                          var res = JSON.parse(res);
                          if(res.code==200){
                                ayer.alert('注册成功');
                                setTimeout(function(){
                                      window.location.replace(res.result.url);
                                },2000)
                          }else{
                                 layer.alert(res.msg);
                          }                        
                   },
                   error:function(){
                    
                   }
            })
            return false;
      });
      //监听提交/邮箱登录
      form.on('submit(emailLogin)', function(data){
            $.ajax({
                 url:'/login/emailLogin',
                 data:data.field,
                 success:function(res){
                        var res = JSON.parse(res);
                        if(res.code==200){
                              window.location.replace(res.result.url);
                        }else{
                               layer.alert(res.msg);
                        }                        
                 },
                 error:function(){
                  
                 }
            })            
            return false;
      });
      //监听提交/找回密码
      form.on('submit(findpaypswd)', function(data){
            $.ajax({
                 url:'/login/findpaypswd',
                 data:data.field,
                 success:function(res){
                        var res = JSON.parse(res);
                        if(res.code==200){
                              window.location.replace(res.result.url);
                        }else{
                               layer.alert(res.msg);
                        }                        
                 },
                 error:function(){
                  
                 }
            })            
            return false;
      });



      //获取验证码
      function getCode(email){
            console.log(email);
            var reg = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
            if(!reg.test(email)){
                  layer.msg('请输入正确的邮箱!');
                  return false;
            }
            $.ajax({
                   url:'/login/sendEmail',
                   data:{
                        email:email
                   },
                   success:function(res){
                          var res = JSON.parse(res);
                          layer.alert(res.msg);
                   },
                   error:function(){
                    
                   }
            })
      }
    
      z.getId('registerCode').onclick=function(){
            getCode($('.register_email_input')[0].value);
            return false;
      }
      z.getId('findPasswordCode').onclick=function(){
            getCode($('.fp_email_input')[0].value);
            return false;
      }
      z.getId('findPasswordCode').onclick=function(){
            getCode($('.fp_email_input')[0].value);
            return false;
      }
      z.getId('findPasswordCode').onclick=function(){
            getCode($('.fp_email_input')[0].value);
            return false;
      }
      z.getId('copyUserLoginCode').onclick=function(){
              var userLoginCode = z.getId('userLoginCode');
              z.copyText(userLoginCode,function(){
                    layer.msg('已复制');
              })
      }
      z.getId('getUserLoginCode').onclick=function(){
             z.ajax({
                  url:'/login/getCode',
                  sCallback:function(data){
                       z.getId('userLoginCode').innerHTML = data.result.code;
                  },
                  eCallback:function(){
                       layer.msg('获取失败')
                  }
             })
      }
});

},false)