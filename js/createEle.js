chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	console.log(sendResponse);
	// chrome.runtime.sendMessage({type:'success'});
	// $('body').css({'border':'dashed red 2px'})

	createEle();
});

var aimDom = null;


function createEle(){

	if($('#collect_chrome_plugin_element').length>0){
		return false;
	}

	// $("<div id='collect_chrome_plugin_element'></div>").appendTo("body");

	// var lay = document.getElementById('collect_chrome_plugin_element');
	var lay = document.createElement('div');
	lay.id = 'collect_chrome_plugin_element';

    var shadowRoot = lay.attachShadow({mode: 'open'});

    var paragraphElement = document.createElement('div');
    paragraphElement.id="app";

    var style = document.createElement('style');
    style.innerText = ('\
    	#app{\
    		color:#fff;\
    		font-size:12px;\
    		line-height:24px;\
    	}\
    	#app span{margin:5px;border:solid #333 1px;padding:2px 5px;color:#333;cursor:help}\
    	#app span.active{border:solid #fff 1px;color:#fff;cursor:pointer}\
    	');

    //分析内容块
    var span1 = document.createElement('span');
    span1.id = "span1";
    span1.className = 'active'
    span1.innerText = '开始分析主内容区';
    span1.onclick = startParseContent;
    paragraphElement.appendChild(span1);


    //分析不正确 选取下一个目标
    var span2 = document.createElement('span');
    span2.id = 'span2';
    span2.className = ''
    span2.innerText = '下一个目标';
    span2.onclick = nextAim;
    paragraphElement.appendChild(span2);

    //下载内容为图片
    var span3 = document.createElement('span');
    span3.id = 'span3';
    span3.className = '';
    span3.innerText = '下载为图片';
    span3.onclick = downAsImg;
    paragraphElement.appendChild(span3);


     //关闭
    var span4 = document.createElement('span');
    span4.id = 'span4';
    span4.className = 'active'
    span4.innerText = '关闭';
    span4.onclick = close;
    paragraphElement.appendChild(span4);

    // paragraphElement.innerText = 'Shadow DOM';
    shadowRoot.appendChild(style);
    shadowRoot.appendChild(paragraphElement);

   	$('body')[0].appendChild(lay);


}

function startParseContent(){
	a().then(res=>{
		if(res !== null){
			aimDom = res;
			var dom =document.getElementById('collect_chrome_plugin_element').shadowRoot;
			dom.getElementById('span2').className = 'active';
			dom.getElementById('span3').className = 'active';
		}
	})
}
function nextAim(){
	if(aimDom ===  null){return false}
	aimDom = b();
}
function downAsImg(){
	if(aimDom ===  null){return false}

	let w = aimDom.offsetWidth;
	let h = aimDom.offsetHeight;
	$(aimDom).css({'outline':'none'})

	var top = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop; 


	html2canvas(aimDom, {
		// backgroundColor: '#000',
		// backgroundColor: "transparent",
	    allowTaint: true,
	    useCORS: true,
	    height: h,
	    width: w,
	    scrollY:-top,
	    scale:window.devicePixelRatio
	}).then(canvas => {  

		// let fileName = new Date().getFullYear()+''+(new Date().getMonth()+1)+''+new Date().getDate()+''+parseInt(Math.random()*10000);

		var oA = document.createElement("a");
	    oA.download = '';// 设置下载的文件名，默认是'下载'
	    oA.href = canvas.toDataURL("image/png",1.0);
	    document.body.appendChild(oA);
	    oA.click();
	    oA.remove(); // 下载之后把创建的元素删除

	    var dom =document.getElementById('collect_chrome_plugin_element').shadowRoot;
			dom.getElementById('span2').className = '';
			dom.getElementById('span3').className = '';
			aimDom = null;
	})
}
function close(){
	$(aimDom).css({'outline':'none'})
	aimDom = null;
	$('#collect_chrome_plugin_element').remove();
}
 