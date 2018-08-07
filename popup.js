$(document).ready(function(){
		chrome.extension.sendMessage({getStorage: "Get"},function (response) {
			
			if(response.data){
				var storage = response.data;
				$('#activeTabs tbody').html('');
				for(var i in storage){
					if(i.indexOf('whitelist')==-1){
						var append_data = JSON.parse(storage[i]);
						$('#activeTabs tbody').append('<tr id="tr_'+i+'"data-tabid="'+i+'"><td style="word-break: break-word;"><span class="tabTitle">'+append_data[0]+'</span><br><span class="tabUrl">'+append_data[1]+'</span></td><td style="text-align:center;vertical-align: middle;" class="lock-reason">'+secondsToMinutes((append_data[3]-append_data[2])/1000)+'</td><td style=" vertical-align: middle;"><input id="in_'+i+'" type="number" min="1" style="margin-top:7px;width: 49px;height: 30px;float: left;margin-right: 5px;" value="'+append_data[4]+'"/><input type="button" style="margin-top:7px;padding: 4px 8px;" class="reset_btn btn btn-success" data-index="'+i+'" value="Reset"/></td><td style="vertical-align: middle;"><button type="button" style="padding: 4px;" data-index="'+i+'" class="btn btn-danger del_btn">Delete</button></td></tr>');
					}
				}
				
				$('.del_btn').click(function(){
					if($(this).attr('data-index')){
						console.log($(this).attr('data-index'));
						var index = $(this).attr('data-index');
						chrome.extension.sendMessage({removeTr: $(this).attr('data-index')},function (response) {
							if(response.data){
								console.log(response.data);
								$('#tr_'+response.data).remove();
							}
						});
					}
				});
				
				$(".reset_btn").click(function(){
					var index = $(this).attr('data-index');
					if(index){
						var reset_val = $('#in_'+index).val();
						if(reset_val==''||reset_val<=0){
							reset_val = 1;
						}else{
							reset_val = parseInt(reset_val);	
						}
						chrome.extension.sendMessage({reset: reset_val,tabid:index},function (response) {
							if(response.data && response.trid){
								//console.log(response.data+'   '+response.trid);
								location.reload();
							}
						});
					}
				});
				
				var handle = setInterval(function(){
					$("[data-tabid]").each(function(){
						var current = minutesToSeconds($(this).find(".lock-reason").text());
						if(current == 0){
							//$(this).remove();
						} else if(!$(this).find(".data-option").is(':checked')){ 
							$(this).find(".lock-reason").text(secondsToMinutes(current - 1));
						}
					});
				}, 1000);
			}
		});
		$('.nav-tabs a[href="#tabActive"]').click(function(){
			location.reload();
		});
		$('.nav-tabs a[href="#tabOptions"]').click(function(){
			chrome.extension.sendMessage({getStorage: "whitelist"},function (response) {
				if(response.data){
					var whitelist = JSON.parse(response.data);
					var $wlTable = $('table#whitelist tbody');
					$wlTable.html('');
					for (var i=0; i < whitelist.length; i++) {
						$tr = $('<tr></tr>');
						$urlTd = $('<td></td>').text(whitelist[i]);
						$deleteLink = $('<a class="deleteLink" key="'+whitelist[i]+'" href="#">Remove</a>')
						.click(function() {
							chrome.extension.sendMessage({removelist: $(this).attr('key')},function (response) {
								if(response.data=="success"){
									$('.nav-tabs a[href="#tabOptions"]').click();
								}
							});
						});
						$tr.append($urlTd);
						$tr.append($('<td></td>').append($deleteLink));
						$wlTable.append($tr);
					}
				}
			});
		});
		
		$("#addToWL").click(function(){
			if($('#wl-add').val()!=''){
				var errors = [];
				$('#status').html();
				chrome.extension.sendMessage({add: $('#wl-add').val().trim()},function (response) {
					if(response.data){
						var whitelist = JSON.parse(response.data);
						var $wlTable = $('table#whitelist tbody');
						$wlTable.html('');
						for (var i=0; i < whitelist.length; i++) {
							$tr = $('<tr></tr>');
							$urlTd = $('<td></td>').text(whitelist[i]);
							$deleteLink = $('<a class="deleteLink" key="'+whitelist[i]+'" href="#">Remove</a>')
							.click(function() {
								chrome.extension.sendMessage({removelist: $(this).attr('key')},function (response) {
								if(response.data=="success"){
									$('.nav-tabs a[href="#tabOptions"]').click();
								}
							});
							});
							$tr.append($urlTd);
							$tr.append($('<td></td>').append($deleteLink));
							$wlTable.append($tr);
						}
					}
				});
				$('#status').removeClass();
				$('#status').css('visibility', 'visible');
				$('#status').css('opacity', '100');
				if (errors.length === 0) {
					$('#status').html('Saving...');
					$('#status').addClass('alert-success').addClass('alert');
					$('#status').delay(50).animate({opacity:0});
				} else {
					var $errorList = $('<ul></ul>');
					for (var i=0; i< errors.length; i++) {
						$errorList.append('<li>' + errors[i].message + '</li>');
					}
					$('#status').append($errorList).addClass('alert-error').addClass('alert');
				}
				$('#wl-add').val('').trigger('input').focus();
			}
		});
		activaTab('tabActive');
});

function activaTab(tab){
    //$('.nav-tabs a[href="#' + tab + '"]').show();
		$('a[href="#activeTabs"]').tab('show');
};
function secondsToMinutes(seconds) {
  var s = seconds % 60;
  s = s > 10 ? String(s) : "0" + String(s);
  return String(Math.floor(seconds / 60)) + ":" + s;
};
function minutesToSeconds(minutes){
	var a = minutes.split(':'); // split it at the colons
	// minutes are worth 60 seconds. Hours are worth 60 minutes.
	var seconds = (+a[0]) * 60 + (+a[1]); 
	return seconds;
}