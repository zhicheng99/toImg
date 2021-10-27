var win = chrome.extension.getBackgroundPage();

var iframe = document.getElementById('iframe');
iframe.src = 'http://localhost:7777/md?t='+Math.random();

function sendMessageToContentScript(message, callback)
		{
		    chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
		    {
		    	console.log(tabs);
		        chrome.tabs.sendMessage(tabs[0].id, message, function(response)
		        {
		            if(callback) callback(response);
		        });
		    });
		}	
window.addEventListener("message", function(e)
{
    console.log(e.data);
    var res = e.data;
    if(res.type=='ok'){
    	$('.op').hide();
    	$('.btn4').prop('disabled',false);

    }

    if(res.type == 'close'){
    	console.log('可以关闭了');
    	$('.btn2').prop('disabled',true);
    	$('.btn3').prop('disabled',true);
    	$('.btn4').prop('disabled',true);


    	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
		    {

				chrome.tabs.executeScript(tabs[0].id, {code: 'clear()'});

		    })
    }


}, false);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
    console.log('收到来自content-script的消息：');

    // console.log(request, sender, sendResponse);
    console.log(request);

    if(request.type == 'success'){
		var iframe = document.getElementById('iframe');

	    iframe.contentWindow.postMessage({type:'toMd',html:request.html,protocol:request.protocol,origin:request.origin, downImg:$('#downImg').attr('checked')},'*');

    }

    if(request.type == 'init'){
    	$('.btn2').prop('disabled',false);
    	$('.btn3').prop('disabled',false);
    }

   
 

    // sendResponse('我是后台，我已收到你的消息：' + JSON.stringify(request));
});

 

$('.btn1').click(function(){
	// win.a();


	// window.postMessage({"test": '你好！'}, '*');

	// sendMessageToContentScript({cmd:'test', value:'你好，我是popup！'}, function(response)
	// {
	//     console.log('来自content的回复：'+response);
	// });


	// 动态执行JS文件
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
		    {

				chrome.tabs.executeScript(tabs[0].id, {code: 'a()'});

		    })

})


//选择不准确，舍弃该节点选择下一个
$('.btn2').click(function(){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
		    {

				chrome.tabs.executeScript(tabs[0].id, {code: 'b()'});

		    })
})


$('.btn3').click(function(){


	$('.op').show();

	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
		    {

				chrome.tabs.executeScript(tabs[0].id, {code: 'c()'});

		    })
})

$('.btn4').click(function(){
		var iframe = document.getElementById('iframe');

		if($('#key').val().replace(/ /g,'') == ''){
			alert('请输入授权码');
			return false;
		}

	    iframe.contentWindow.postMessage({type:'save',key:$('#key').val()},'*');
})


chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
		    {

				chrome.tabs.executeScript(tabs[0].id, {code: 'initEvent()'});

		    })



