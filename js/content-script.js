function Collect(){

/*
	1、可视面积大于300x50像素，加分（服务端分析时，无法获知页面元素尺寸，此步可省略）
	2、className或id为header|foot|sidebar…减分
	3、className或id包含content…加分
	4、子节点中纯文本节点多的，加分5、有大图片，有多个大图片，加分6、
		innerText长度大于150，内含逗号，句号多的， 加分（此步骤最有参考价值）
*/

	this.node = [];
	this.reg = new RegExp(/(\.|,|;|'|“|:|。|，|；|’|"|：)/g);

	this.notContentReg = new RegExp(/(head|foot|side|comment|recommend|tag)/ig);
	this.contentReg = new RegExp(/(content|article)/ig);

} 

Collect.prototype.sort = function(list_data,item) {
	var by = function(name,minor)
        {
            return function(o, p)
            {
            var a, b;
            if (typeof o === "object" && typeof p === "object" && o && p) 
            {
            a = o[name];
            b = p[name];
            if (a === b) {return typeof minor==='function' ?minor(o,p):0;}
            if (typeof a === typeof b) { return a < b ? 1 : -1;}
            return typeof a < typeof b ? -1 : 1;
            }
            else {throw ("error"); }
            }
        }
    list_data.sort(by(item)); 
};
Collect.prototype.isString = function(s) {
	if(Object.prototype.toString.call(s)=='[object String]'){
		return true;
	}else{
		return false;
	}
};
Collect.prototype.updateScore = function(dom) {

	 
	if((dom.offsetWidth>300) && (dom.offsetHeight>50)){
		dom.score++;
	} 
	


	if(
		(this.isString(dom.id) && (dom.id!='') &&
			(
				
				this.notContentReg.test(dom.id.toLowerCase())


			)
		) ||

		(
			this.isString(dom.className) &&  (dom.className!='') &&
			(
				
				this.notContentReg.test(dom.className.toLowerCase())

			)
		)

		){

		dom.score--;

	} 

	if(
		(this.isString(dom.id) &&  (dom.id!='') &&
			(
				this.contentReg.test(dom.id) 

			)
		) ||

		(
			this.isString(dom.className) &&  (dom.className!='') &&
			(
				this.contentReg.test(dom.className) 
			)
		)

		){

		dom.score+=5;

	} 


	//判断子项是否存在一些非内容区的className或id 进行减分
	this.judgChild(dom);
	
	
};

Collect.prototype.judgChild = function(dom) {

	var sum = 0;
	var innerFun = (dom)=>{
		var child = dom.childNodes;
		var len = dom.childNodes.length;
		for (var i = 0; i < len; i++) {

			if(
				(this.isString(child[i].id) && (child[i].id!='') &&
					( 

						this.notContentReg.test(child[i].id.toLowerCase())


					)
				) ||

				(
					this.isString(child[i].className) &&  (child[i].className!='') &&
					(
						this.notContentReg.test(child[i].className.toLowerCase())


					)
				) || (this.isString(child[i].tagName) &&  
						(

							this.notContentReg.test(child[i].tagName.toLowerCase())
							// (child[i].tagName.toLowerCase() == 'aside') ||
							// (child[i].tagName.toLowerCase() == 'header') 


						)
					)

				){

				sum++;

			}

			innerFun(child[i]);

		}


	}

	innerFun(dom);

	dom.score-=sum;

	
	
};

Collect.prototype.getAllNode = function(dom) {
	var _this = this;
	var node = dom.childNodes;
	var len = node.length;
	var textNodeNum = 0;
	var imgNodeNum = 0; 
	var pNodeNum = 0; 


	for (var i = 0; i < len; i++) {

		//空文本不计算在内
		if(node[i].nodeType == 3 && node[i].nodeValue.replace(/(\s|\S).*?/g,'') !=''){  //文本节点的数量
			textNodeNum++;
		}


		if((node[i].nodeType == 1) && (node[i].tagName.toLowerCase()=='img')){
			if(node[i].width >200){
				imgNodeNum++;
			}
		}

		if((node[i].nodeType == 1) && (node[i].tagName.toLowerCase()=='svg')){
			if(node[i].scrollWidth >200){
				imgNodeNum++;
			}
		}


		if(node[i].nodeType != 3  && node[i].innerText){
			var multiple = node[i].innerText.replace(/ /g,'')/150;
			node[i].textSectionNum = multiple;
		}




		if(
			(node[i].type == 'text/css') ||  //link或script
			(node[i].type == 'text/javascript') ||  //link或script
			((node[i].nodeType == 1) && 
				(
					// _this.filterNodeReg.test(node[i].tagName.toLowerCase())
					(node[i].tagName.toLowerCase()=='img') ||
					(node[i].tagName.toLowerCase()=='i') ||
					(node[i].tagName.toLowerCase()=='a') ||
					(node[i].tagName.toLowerCase()=='style') ||
					(node[i].tagName.toLowerCase()=='script')  ||
					(node[i].tagName.toLowerCase()=='select')  ||
					(node[i].tagName.toLowerCase()=='input')  ||
					(node[i].tagName.toLowerCase()=='textarea')  





				)
				
			)  ||  

			(node[i].nodeType == 3) ||  //文本节点
			(node[i].nodeType == 8)	//注释节点

			){
			continue;
		}

		


		if(node[i].innerText){
			var tmp = node[i].innerText.match(this.reg);

			if(tmp!==null && (tmp.length >0)){
				node[i].grammarSymbolNum = tmp.length;
			}else{
				node[i].grammarSymbolNum = 0;
			}

		}


		//当前节点下 p标签的数量 也是决定该节点是否为主内容节点的一个主要因素
		if((node[i].nodeType == 1) && (node[i].tagName.toLowerCase() == 'p')){
		
			pNodeNum++;
		}

		




		node[i].score = 10; //每个节点都给一个基础分
		var pos = _this.getPoint(node[i]);
		if(pos){
			node[i].domPosTop = pos.top;
			node[i].domPosLeft = pos.left;
		}
		


		// this.updateScore(node[i]);


		_this.node.push(node[i]);

		_this.getAllNode.call(_this,node[i]);

	}

	//文本和图片一般都可能会用p标签包裹 所以不可能是主内容的标签 所以得向上找父标签 增加父标签的分数

	dom.textNodeNum = textNodeNum;
	dom.imgNodeNum = imgNodeNum;
	dom.pNodeNum = pNodeNum;

	// this.findParent(dom,textNodeNum,imgNodeNum,pNodeNum);


	
};
Collect.prototype.findParent = function(dom,textN,imgN,pN) {

	//文本和图片一般都可能会用p标签包裹 所以不可能是主内容的标签 所以得向上找父标签 增加父标签的分数
var appendScore = function(dom){

		if( dom.tagName.toLowerCase && 
			(dom.tagName.toLowerCase() != 'p') && 
			(dom.tagName.toLowerCase() != 'span') && 
			(dom.tagName.toLowerCase() != 'i') && 
			(dom.tagName.toLowerCase() != 'b') &&
			(dom.tagName.toLowerCase() != 'a') &&
			(dom.tagName.toLowerCase() != 'ul') &&
			(dom.tagName.toLowerCase() != 'li') &&
			(dom.tagName.toLowerCase() != 'ol') &&
			(dom.tagName.toLowerCase() != 'pre') &&
			(dom.tagName.toLowerCase() != 'code') 





			){
			dom.textNodeNum = textN;
			dom.imgNodeNum = imgN;
			dom.pNodeNum = pn;
		}else{
			appendScore(dom.parentNode);
		}

	} 

		appendScore(dom); 

};
Collect.prototype.updateByTextNodeNum = function() {


	// 文本节点数 有几个加几分
	for (var i = 0; i < this.node.length; i++) { 
		if(this.node[i].textNodeNum){
			this.node[i].score +=this.node[i].textNodeNum*5;

		}
	}
};

Collect.prototype.updateByImgNodeNum = function() {

	var innerF = function(dom,num){

		if( dom.nodeType &&
			(dom.nodeType == 1) && 
			(dom.tagName.toLowerCase() != 'p') && 
			(dom.tagName.toLowerCase() != 'span') && 
			(dom.tagName.toLowerCase() != 'i') && 
			(dom.tagName.toLowerCase() != 'b') &&
			(dom.tagName.toLowerCase() != 'a') &&
			(dom.tagName.toLowerCase() != 'ul') &&
			(dom.tagName.toLowerCase() != 'li') &&
			(dom.tagName.toLowerCase() != 'ol') &&
			(dom.tagName.toLowerCase() != 'pre') &&
			(dom.tagName.toLowerCase() != 'code') 





			){ 
			dom.score += num; 
		}else{
			innerF(dom.offsetParent,num);
		}

	}


	// 图片节点数 每一个加6分
	for (var i = 0; i < this.node.length; i++) {


		if(this.node[i].imgNodeNum<5){
			// innerF(this.node[i],this.node[i].imgNodeNum*6);
			this.node[i].score +=this.node[i].imgNodeNum*6;
		}else if(this.node[i].imgNodeNum<10){
			// innerF(this.node[i],this.node[i].imgNodeNum*8);

			this.node[i].score +=this.node[i].imgNodeNum*8;
		}else{
			// innerF(this.node[i],this.node[i].imgNodeNum*12);

			this.node[i].score +=this.node[i].imgNodeNum*12;
		}
	}
};

Collect.prototype.updateByGrammarSymbolNum = function() {

	for (var i = 0; i < this.node.length; i++) {
		if(this.node[i].grammarSymbolNum){
			this.node[i].score +=this.node[i].grammarSymbolNum;

		}

		// this.node[i].setAttribute('score',this.node[i].score);

	}

};

Collect.prototype.updateByTextSectionNum = function() {

	//innerText 每超过150个 加5分
	for (var i = 0; i < this.node.length; i++) {
		if(this.node[i].textSectionNum){
			this.node[i].score +=this.node[i].textSectionNum*5;

		}


	}
};

Collect.prototype.updateByPNodeNum = function() {

	//innerText 每超过150个 加5分
	for (var i = 0; i < this.node.length; i++) {
		if(this.node[i].pNodeNum){
			this.node[i].score +=this.node[i].pNodeNum;

		}


	}
};

Collect.prototype.updateByDomPosTop = function() {

	//要据距body的距离进行减分 数值越大 减得越多 以为单位
	//
	for (var i = 0; i < this.node.length; i++) {
		if(this.node[i].domPosTop){
			this.node[i].score -=(this.node[i].domPosTop/500);
		}

	}
	
};

Collect.prototype.computeScore = function() {

	for (var i = 0; i < this.node.length; i++) {
		if((this.node[i].offsetWidth>300) && (this.node[i].offsetHeight>50)){
			this.node[i].score++;
		}


		if(
			(this.isString(this.node[i].id) && (this.node[i].id!='') &&
				( 
					this.notContentReg.test(this.node[i].id.toLowerCase())

				)
			) ||

			(
				this.isString(this.node[i].className) &&  (this.node[i].className!='') &&
				( 
					this.notContentReg.test(this.node[i].className.toLowerCase())

				)
			)

			){

			this.node[i].score--;

		} 

		if(
			(this.isString(this.node[i].id) &&  (this.node[i].id!='') &&
				(
					this.contentReg.test(this.node[i].id.toLowerCase()) 

				)
			) ||

			(
				this.isString(this.node[i].className) &&  (this.node[i].className!='') &&
				(
					this.contentReg.test(this.node[i].className.toLowerCase()) 

				)
			)

			){

			this.node[i].score+=5;

		} 
	}
};

Collect.prototype.reduceScoreByChildNode = function() {

	for (var i = 0; i < this.node.length; i++) {
		this.judgChild(this.node[i]);
	}

};

Collect.prototype.jumpScore = function() {


	var appendScore = function(dom,score){

		if((dom.parentNode.tagName.toLowerCase() != 'p') && 
			(dom.parentNode.tagName.toLowerCase() != 'span') && 
			(dom.parentNode.tagName.toLowerCase() != 'i') && 
			(dom.parentNode.tagName.toLowerCase() != 'b') &&
			(dom.parentNode.tagName.toLowerCase() != 'a') &&
			(dom.parentNode.tagName.toLowerCase() != 'ul') &&
			(dom.parentNode.tagName.toLowerCase() != 'li') &&
			(dom.parentNode.tagName.toLowerCase() != 'ol') &&
			(dom.parentNode.tagName.toLowerCase() != 'pre') &&
			(dom.parentNode.tagName.toLowerCase() != 'code') 





			){
			dom.parentNode.score && score && (dom.parentNode.score+=score);
		}else{
			appendScore(dom.parentNode,score);
		}

	}

	var innerF = function(dom){
		var child = dom.childNodes;
		var reg = new RegExp(/(p|h1|h2|h3|h4|h5|h6|pre|code|ul|li|svg|path)/ig);

		if(child){
			for (var i = 0; i < child.length; i++) {
				if(child[i].tagName && 
					reg.test(child[i].tagName.toLowerCase())
				// (child[i].tagName.toLowerCase() == 'p')

				){  //把分数加到父级上
					appendScore(child[i],child[i].score);
				}

				innerF(child);
			}
		}
		
	}

	for (var i = 0; i < this.node.length; i++) {
		innerF(this.node[i]);

		// this.node[i].setAttribute('score',this.node[i].score);

	}

	
};

Collect.prototype.getPoint = function(obj) {
    var t = obj.offsetTop; //获取该元素对应父容器的上边距
    var l = obj.offsetLeft; //对应父容器的上边距
    //判断是否有父容器，如果存在则累加其边距
    while (obj = obj.offsetParent) {//等效 obj = obj.offsetParent;while (obj != undefined)

    		t += obj.offsetTop; //叠加父容器的上边距
	        l += obj.offsetLeft; //叠加父容器的左边距
       
    }

   //  var innerF = function(obj){

			// t += obj.offsetTop; //叠加父容器的上边距
	  //       l += obj.offsetLeft; //叠加父容器的左边距

		 //    obj.offsetParent && innerF(obj.offsetParent);

   //  }

   //  obj.offsetParent && innerF(obj.offsetParent);

    return {
    	top:t,
    	left:l
    }
};

Collect.prototype.getCoreContent = function() {
	var body = document.body;

	this.getAllNode.call(this,body);

	this.computeScore();
	this.reduceScoreByChildNode();


	this.updateByDomPosTop();

	this.updateByTextNodeNum();
	this.updateByImgNodeNum();
	this.updateByGrammarSymbolNum();
	this.updateByPNodeNum();
	this.updateByTextSectionNum();



	//文本和图片一般都可能会用p标签包裹 所以不太可能是主内容的标签 所以得向上找父标签 增加父标签的分数
	//这个因素占的比重比较大 基本上决定了最终的内容标签
	this.jumpScore();


	//大部分的内容区都是会跨过屏幕竖向中心线的 这也是个决定因素
	//

	for (var i = 0; i < this.node.length; i++) {

		this.node[i].setAttribute && this.node[i].setAttribute('score',this.node[i].score);

	}


	this.sort(this.node,'score'); 

	console.log(this.node);


};

function a(){

	var co = new Collect();
	co.getCoreContent();



	$(co.node[0]).css({'border':'dashed red 3px'});

	// console.log($('body').html());


	// window.postMessage({"test": '你好！收到了'}, '*');

	// chrome.runtime.sendMessage({greeting: '你好，我是content-script呀，我主动发消息给后台！'}, function(response) {
	//     console.log('收到来自后台的回复：' + $('body').html());

	// });

	chrome.runtime.sendMessage({greeting: $('body').html()}, function(response) {
	    console.log('收到来自后台的回复：' +response);
	    
	});

 
}

// console.log(a());


// chrome.extension.onMessage.addListener(function(request, sender, sendResponse)
// {
//     console.log(sender.tab ?"from a content script:" + sender.tab.url :"from the extension");
//     if(request.cmd == 'test') alert(request.value);
//     sendResponse('我收到了你的消息！');

//     // return '12321312';

// });

// window.addEventListener("message", function(e)
// {
    
// 	window.postMessage({"test": '你好！收到了'}, '*');

// }, false);