localStorage.clear();
var default_duration = 5;

var new_whitelist = [];
//new_whitelist.push("chrome://extensions");
localStorage.setItem('whitelist',JSON.stringify(new_whitelist));
chrome.windows.getAll({populate:true},function(windows){
  windows.forEach(function(window){
    window.tabs.forEach(function(tab){
			var whitelist = JSON.parse(localStorage.getItem('whitelist'));
			var white_status = true;
			for(var j in whitelist){
				console.log(j)
				if(tab.url.indexOf(whitelist[j])!=-1) white_status = false;
			}
			if(white_status){
				var tab_infor = [];
				tab_infor.push(tab.title);
				tab_infor.push(tab.url);
				var start_time = new Date().getTime();
				var end_time = start_time+default_duration*60*1000;
				tab_infor.push(start_time);
				tab_infor.push(end_time);
				tab_infor.push(default_duration);
				localStorage.setItem(tab.id,JSON.stringify(tab_infor));			
			}
    });
  });
});
function auto_timer(){
	for(var i in localStorage){
		if(i.indexOf('whitelist')==-1){
			var current_data = JSON.parse(localStorage[i]);
			if(current_data[1]){
				if(parseInt(current_data[2]) >= parseInt(current_data[3])){
					console.log('closed');
					localStorage.removeItem(i);
					chrome.tabs.remove(parseInt(i), function() {
					});
				}else{
					current_data[2] += 1000;	
					localStorage.setItem(i,JSON.stringify(current_data));
				}
			}
		}
	}
}
setTimeout(function(){ 
	var auto_inter = setInterval(function(){
		auto_timer();
	}, 1000);
}, 2000);
chrome.extension.onMessage.addListener( function(request,sender,sendResponse){
	if( request.getStorage === "Get" ){
		sendResponse({data:localStorage});
	}else if( request.getStorage === "whitelist" ){
		sendResponse({data:localStorage.getItem('whitelist')});
	}else if(request.removelist){
		var whitelist = JSON.parse(localStorage.getItem('whitelist'));
		var index = whitelist.indexOf(request.removelist);
		if (index > -1) {
				whitelist.splice(index, 1);
		}
		localStorage.removeItem('whitelist');
		localStorage.setItem('whitelist',JSON.stringify(whitelist));
		sendResponse({data:"success"});
	}else if(request.removeTr){
		localStorage.removeItem(parseInt(request.removeTr));
		sendResponse({data:parseInt(request.removeTr)});
	}else if(request.reset && request.tabid){
		var reset = parseInt(request.reset);
		var tabid = parseInt(request.tabid);
		var reset_item = localStorage.getItem(tabid);
		var reset_data = JSON.parse(reset_item);
		var start_time = new Date().getTime();
		var end_time = start_time+reset*60*1000;
		reset_data[2]=start_time;
		reset_data[3]=end_time;
		reset_data[4]=reset;
		localStorage.removeItem(tabid);
		localStorage.setItem(tabid,JSON.stringify(reset_data));
		sendResponse({data:reset,trid:tabid});
	}else if(request.add){
		var whitelist = JSON.parse(localStorage.getItem('whitelist'));
		whitelist.push(request.add);
		localStorage.removeItem('whitelist');
		localStorage.setItem('whitelist',JSON.stringify(whitelist));
		var whitelist_new = JSON.parse(localStorage.getItem('whitelist'));
		for(var i in localStorage){
			var white_new_status = true;
			if(i.indexOf('whitelist')==-1){
				var current_data = JSON.parse(localStorage[i]);
				for(var j in whitelist_new){
					if(current_data[1].indexOf(whitelist_new[j])!=-1) {
						white_new_status = false;
					}
				}
				if(!white_new_status){
					localStorage.removeItem(i);
				}
			}
		}
		sendResponse({data:localStorage.getItem('whitelist')});
	}
});
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	console.log(tab);
  var whitelist = JSON.parse(localStorage.getItem('whitelist'));
	var white_status = true;
	for(var j in whitelist){
		if(tab.url.indexOf(whitelist[j])!=-1) white_status = false;
	}
	console.log('here');
	if(white_status){
		var tab_infor = [];
		tab_infor.push(tab.title);
		tab_infor.push(tab.url);
		var start_time = new Date().getTime();
		var end_time = start_time+default_duration*60*1000;
		tab_infor.push(start_time);
		tab_infor.push(end_time);
		tab_infor.push(default_duration);
		localStorage.removeItem(tab.id);
		localStorage.setItem(tab.id,JSON.stringify(tab_infor));			
	}else{
		localStorage.removeItem(tab.id);
	}
});
chrome.tabs.onCreated.addListener(function(tab) {
	console.log(tab);
	var whitelist = JSON.parse(localStorage.getItem('whitelist'));
	var white_status = true;
	for(var j in whitelist){
		if(tab.url.indexOf(whitelist[j])!=-1) white_status = false;
	}
	console.log('here');
	if(white_status){
		var tab_infor = [];
		tab_infor.push(tab.title);
		tab_infor.push(tab.url);
		var start_time = new Date().getTime();
		var end_time = start_time+default_duration*60*1000;
		tab_infor.push(start_time);
		tab_infor.push(end_time);
		tab_infor.push(default_duration);
		localStorage.removeItem(tab.id);
		localStorage.setItem(tab.id,JSON.stringify(tab_infor));			
	}else{
		localStorage.removeItem(tab.id);
	}
});
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
	localStorage.removeItem(tabId);
});