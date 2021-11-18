function a(){
	// return $('body').html();

	sendMessageToContentScript({cmd:'test', value:'你好，我是popup！'}, function(response)
		{
		    alert('来自content的回复：'+response);
		});
}

function sendMessageToContentScript(message, callback)
{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
    {
        chrome.tabs.sendMessage(tabs[0].id, message, function(response)
        {
            if(callback) callback(response);
        });
    });
}


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
    console.log(sender.tab ?"from a content script:" + sender.tab.url :"from the extension");
    if(request.cmd == 'test') alert(request.value);
    // sendResponse('我收到了你的消息！');

    // return '12321312';

});
 

chrome.browserAction.onClicked.addListener(function (tab) {
// alert(tab.url);
        chrome.tabs.sendMessage(tab.id, {type: 'createEle'});

});

chrome.contextMenus.create({
    title: "页面内容采集器",
    // contexts: ['selection'], // 只有当选中文字时才会出现此右键菜单
    onclick: function(info, tab){
        chrome.tabs.sendMessage(tab.id, {type: 'createEle'});


        // 动态执行JS文件
    // chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
    //         {

    //             chrome.tabs.executeScript(tabs[0].id, {code: 'aa()'});

    //         })

       // sendMessageToContentScript({cmd:'test', value:'你好，我是popup！'}, function(response)
       //  {
       //      // alert(response);
       //      // console.log('来自content的回复：'+$('body').html());
       //  });

        // chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
        //     {

        //         chrome.tabs.executeScript(tabs[0].id, {code: 'test()'});

        //     })


    }
});
