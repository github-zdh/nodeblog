$.extend({
    copyText: function(text,callback){
                var TEXTAREA_id='copyText_TEXTAREA';                    
                if( $('#copyText_TEXTAREA').length != 0 ){
                     if(document.getElementById('copyText_TEXTAREA').nodeName.toUpperCase()==='TEXTAREA'){
                            var textarea = document.getElementById('copyText_TEXTAREA');
                     }else{
                            var textarea = document.createElement('textarea');
                            TEXTAREA_id = copyText_TEXTAREA+Math.random().toString().replace(/\./g,'');
                     }
                }else{
                     var textarea = document.createElement('textarea');
                }
                textarea.id=TEXTAREA_id;
                textarea.value=text;
                textarea.style.position='fixed';
                textarea.style.left='-99999px';
                textarea.style.zIndex='-1';
                $('body').append(textarea);
                textarea.select();document.execCommand('Copy');                    
                textarea.blur();
                if(callback){
                      callback();
                }
    }
});