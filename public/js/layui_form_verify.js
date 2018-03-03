layui.use(['form','element'], function(){       
         var form = layui.form
             ,element = layui.element; //Tab的切换功能，切换事件监听等，需要依赖element模块
          //自定义验证规则
          form.verify({
                  motto:function(value){
                      if(value.length == 0){
                           return '请输入内容';
                      }
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
});