
//examine effect on urls


//-----------------------------------------------------
//				Logged In Functions
//-----------------------------------------------------
function isSignedIn() {
	if(localStorage['ndexUsername'] == '') {
		console.log('not signed in');
		return false;
	} else {
		console.log('signed in');
		
		return true;
		
	}
}

function signout() {
	
	localStorage['ndexUsername'] = '';
	localStorage['ndexPassword'] = '';
	localStorage['ndexJid'] = '';

	window.location.href = "/";
	//console.log(JSON.stringify(localStorage));
}

function isOwnedNetwork(jid){
	var owned = false;
	$.each(user.ownedNetworks, function(index, network){
		if (network.jid == jid) {
			owned = true;
			return false;
		}
	});
	return owned;
}

function isSharedNetwork(jid){
	var shared = false

	//TODO shared network implementation?

	return shared;
}


function isOwnedGroup(jid){
	var owned = false;
	$.each(user.ownedGroups, function(index, group){
		if (group.jid == jid) {
			owned = true;
			return false;
		}
	});
	return owned;
}



//-----------------------------------------------------
//		Pagination function
//-----------------------------------------------------
function createPaginationModule(pageAmount, page, searchFunction) {
	//searchFunction must name of function in string format

	var pagDiv = document.createElement('div');
	var pagUl = document.createElement('ul');
	
	var prevLi = document.createElement('li');
	var prev = document.createElement('a');
	var nextLi = document.createElement('li');
	var next = document.createElement('a');
	var firstLi = document.createElement('li');
	var first = document.createElement('a');
	var lastLi = document.createElement('li');
	var last = document.createElement('a');
	
	//disable links when already on page
	if(page == 0) $(prevLi).addClass('active');
	if(page == 0) $(firstLi).addClass('active');
	if(page == (pageAmount - 1)) $(nextLi).addClass('active');
	if(page == (pageAmount - 1)) $(lastLi).addClass('active');
	
	//create first, previous, next, and last links
	$(prev).attr('onclick', searchFunction +'(Number(this.id))').attr('id', page).html('<');
	$(next).attr('onclick', searchFunction + '(Number(this.id))').attr('id', page+2).html('>');
	$(first).attr('onclick', searchFunction + '(1)').attr('rel','tooltip').attr('title', 'page 1').html('<<');
	$(last).attr('onclick', searchFunction + '(Number(this.id))').attr('id', pageAmount).attr('rel','tooltip').attr('title', 'page ' + pageAmount).html('>>');
	
	$(firstLi).append(first);
	$(pagUl).append(firstLi);
	$(prevLi).addClass('prev').append(prev);
	$(pagUl).append(prevLi);
	$(nextLi).addClass('next').append(next);
	$(lastLi).append(last);
	
	//create links for 2 pages before and after current page
	for(var ii = 0; ii < pageAmount; ii++){
		//skip if not near current page
		if(ii < (page-2)) continue;
		if(ii > (page+2)) continue;
		var pagLi = document.createElement('li');
		var pagA = document.createElement('a');
		
		if(ii == page) { $(pagLi).addClass('active') };
		
		$(pagA).attr('onclick', searchFunction + '(Number(this.innerHTML))').html( ii + 1);
		$(pagLi).append(pagA);
		$(pagUl).append(pagLi);
	}
	
	$(pagUl).append(nextLi);
	$(pagUl).append(lastLi);
	
	$(pagDiv).addClass('pagination pagination-centered').append(pagUl);
	return pagDiv;
}

//------------------------------------
//	Network List Interface
//--------------------------------------

function networkToggle(obj) {
	//using jquery data method to store data
	var elementIDs = $(obj).data('elementIDs');
	var ele = document.getElementById(elementIDs.div);
	var but = document.getElementById(elementIDs.button);
	
	if(ele.style.display == "block") {
		ele.style.display = "none";
		but.className = 'icon-chevron-right';
	}
	else {
		ele.style.display = "block";
		but.className = 'icon-chevron-down';
	}
	//
	updateWorkspaceTools(elementIDs.jid);
}

//actions for network upon dropdown
function networkButtonTools(item){
	var buttonDiv = document.createElement('div'),
		wkSpaceLink=document.createElement('a'),
		viewLink=document.createElement('a'),
		visualizeLink=document.createElement('a'),
		wkSpaceIcon=document.createElement('i'),
		viewIcon=document.createElement('i'),
		visualizeIcon=document.createElement('i'),
		shareLink = document.createElement('a'),
		shareIcon = document.createElement('i'),
		accessLink = document.createElement('a'),
		accessIcon = document.createElement('i');
	
	//initializing type of icon
	$(wkSpaceIcon).addClass('icon-plus')
		.attr('id','icon'+item.jid)
		.attr('rel','tooltip')
		.attr('title','Add to Workspace')
		.attr('data-placement','bottom');
	$(viewIcon).addClass('icon-folder-open');
	$(visualizeIcon).addClass('icon-eye-open');
	$(shareIcon).addClass('icon-share');
	$(accessIcon).addClass('icon-exchange');
	

	
	$(wkSpaceLink).attr('onclick','')
		.data('networkProperties',{title : item.title, jid : item.jid})
		.attr('id','link'+item.jid)
		.addClass('btn')
		.append(wkSpaceIcon);
	$(viewLink).attr('href','/viewNetwork/' + item.jid)
		.addClass('btn')
		.attr('rel','tooltip')
		.attr('title','View Network')
		.attr('data-placement','bottom')
		.append(viewIcon);
	$(visualizeLink).attr('href','/visualizeNetwork/' + item.jid)
		.addClass('btn')
		.attr('rel','tooltip')
		.attr('title','VisualizeNetwork')
		.attr('data-placement','bottom')
		.append(visualizeIcon);
	$(shareLink).attr('href','#')
		.addClass('btn')
		.attr('rel', 'tooltip')
		.attr('title', 'Share Network')
		.attr('data-placement', 'bottom')
		.append(shareIcon);
	$(accessLink).attr('href', '#')
		.addClass('btn')
		.attr('rel', 'tooltip')
		.attr('title', 'Request Network Access')
		.attr('data-placement', 'bottom')
		.append(accessIcon);
	
	//appending buttons dependent on sign in	
	if (isSignedIn()) {
		$(buttonDiv).append(wkSpaceLink);
		if (isOwnedNetwork(item.jid)) {	
			$(buttonDiv).append(shareLink);
		}
		if (!isOwnedNetwork(item.jid) && !isSharedNetwork(item.jid)){
			$(buttonDiv).append(accessLink);
		}
	}
		
	$(buttonDiv).addClass('btn-group')
		.append(viewLink)
		.append(visualizeLink);

	return buttonDiv
}


function formatNetworkDescriptor(item){
	var networkDIV = document.createElement('div'),
		nodeSpan = document.createElement('span'),
		edgeSpan = document.createElement('span'),
		titleSpan = document.createElement('span'),
		iconSpan = document.createElement('span'),
		divButton = document.createElement('i'),
		networkLink = document.createElement('a'),
		buttonLink = document.createElement('a'),
		infoDiv = document.createElement('div');
	
	//buttom element used to toggle dropdwon on network list element
	$(divButton).attr('rel','tooltip')
			.attr('title','More Info')
			.attr('id',item.title + 2)
			.addClass('icon-chevron-right');
	
	//div to hold info, buttons for now, on dropdown
	$(infoDiv).addClass('searchInfo').attr('id',item.title + 1)
					.attr('style','display: none')
					.append(networkButtonTools(item));	
	
	//the link element to toggle the dropdown
	$(buttonLink).attr('id',item.title)
			.data('elementIDs',{div : item.title + 1, button: item.title + 2, jid : item.jid})
			.attr('onClick', 'networkToggle(this)')
			.append(divButton);

	  
	$(networkLink).attr('href','/viewNetwork/' + item.jid).append(item.title);
	$(nodeSpan).addClass('span2 elementCount').append(item.nodeCount + " nodes"); 
	$(edgeSpan).addClass('span2 elementCount').append(item.edgeCount + " edges"); 
	$(titleSpan).addClass('span4 networkTitle').append(networkLink); 
	$(iconSpan).addClass('span1').append(buttonLink);   
	
    //bootstrap style nav list    
    var li = document.createElement('li');
    var ul = document.createElement('ul');
    var a = document.createElement('a');
        
    $(networkDIV).addClass('row-fluid').append(iconSpan).append(titleSpan).append(nodeSpan).append(edgeSpan);
    $(a).attr('style','color:black').append(networkDIV).append(infoDiv);
        
    $(li).append(a);
    $(ul).addClass("nav nav-list").append(li);

	return ul;//networkDIV;

}


//---------------------------------------------------
//			Workspace Functions
//---------------------------------------------------

function isOnWorkspace(jid, callback){
	//instead of calling an API function, checking DOM elements in sidebar.ejs
	//writing in callback format, to make switch to API easy
	var found = false; 
	
	//checking all input elements on page, would prefer narrowing to only input DOM in sidebar.ejs
	$("input").each(function(index,value){
		if($(this).attr('title') == jid) {
			found = true;
			
		}
	});
	
	callback(found);
}

function removeFromWorkspace(obj){
	//$(obj).attr('title') holds the corresponding network jid
	var network = $(obj).data('networkProperties');
	var parent = document.getElementById('workSurface');
	
	//loop through all input element in sidebar.ejs until desire element is found
	$("input").each(function(index,value){
		if($(this).attr('title') == network.jid){
			ndexClient.deleteNetworkFromUserWorkspace(user.jid, network.jid, function(data) {});
			var child = document.getElementById('thumbnail' + network.jid);
			parent.removeChild(child);
			updateWorkspaceTools(network.jid);
		}
	});
	
}

function addToWorkspace(obj){
	//$(obj).attr('title') holds the corresponding network jid
	var network= $(obj).data('networkProperties');

	ndexClient.addNetworkToUserWorkspace(user.jid, network.jid, function(data) {});
	// ul, li are for bootstrap thumbnail css
	var unlst = document.createElement('ul'),
		lst = document.createElement('li'),
		cnt = document.createElement('div'),
		formBox = document.createElement('form'),
		chckbox = document.createElement('input'),
		titleSpan = document.createElement('p');
	var parent = document.getElementById('workSurface');
		
	$(titleSpan).addClass('thumbText')
		.append(network.title);//
	$(chckbox).attr('id','checkbox' + network.jid)
		.attr('title',network.jid)
		.attr('type','checkbox');
	$(formBox).append(chckbox);
	$(cnt).addClass('thumbnail thumbIcon')
		.append(formBox)
		.append(titleSpan);
	$(lst).append(cnt);
	$(unlst).attr('id','thumbnail' + network.jid)
		.addClass('thumbnails')
		.append(lst);
	
	$(parent).append(unlst);
	updateWorkspaceTools(network.jid);
}

//--------------------------------------------------------------------
//				shared function by group and user interface
//--------------------------------------------------------------------


function groupUserToggle(obj) {
	var jid = $(obj).data('toggle').jid;
	var ele = document.getElementById('info' + jid);
	var but = document.getElementById('icon' + jid);
	if(ele.style.display == "block") {
		ele.style.display = "none";
		but.className = 'icon-chevron-right';
	}
	else {
		ele.style.display = "block";
		but.className = 'icon-chevron-down';
	}
	
}

//--------------------------------------------------------------------
//					Group List Interface
//--------------------------------------------------------------------

function groupButtonTools(item){
	var buttonDiv = document.createElement('div'),
		viewLink=document.createElement('a'),
		viewIcon=document.createElement('i'),
		shareLink = document.createElement('a'),
		shareIcon = document.createElement('i'),
		accessLink = document.createElement('a'),
		accessIcon = document.createElement('i');
		
	
	$(viewIcon).addClass('icon-folder-open');
	$(shareIcon).addClass('icon-share');
	$(accessIcon).addClass('icon-exchange');
	

	
	$(viewLink).attr('href','/viewGroup/' + item.jid)
		.addClass('btn')
		.attr('rel','tooltip')
		.attr('title','View Group')
		.attr('data-placement','bottom')
		.append(viewIcon);
	
	$(shareLink).attr('href','#')
		.addClass('btn')
		.attr('rel', 'tooltip')
		.attr('title', 'Invite User to this Group')
		.attr('data-placement', 'bottom')
		.append(shareIcon);
	$(accessLink).attr('href', '#')
		.addClass('btn')
		.attr('rel', 'tooltip')
		.attr('title', 'Request Group Membership')
		.attr('data-placement', 'bottom')
		.append(accessIcon);
		
	if (isSignedIn()) {
		if (isOwnedGroup(item.jid)) {	
			$(buttonDiv).append(shareLink);
		}
		if (!isOwnedGroup(item.jid)){
			//may need to be isGroupPartOf
			$(buttonDiv).append(accessLink);
		}
	}
		
	$(buttonDiv).addClass('btn-group')
		.append(viewLink);
	return buttonDiv
}


function formatGroupDescriptor(item){
	var groupDIV = document.createElement('div'),
		titleSpan = document.createElement('span'),
		iconSpan = document.createElement('span'),
		divButton = document.createElement('i'),
		groupLink = document.createElement('a'),
		buttonLink = document.createElement('a'),
		infoDiv = document.createElement('div');

	$(divButton).attr('rel','tooltip')
		.attr('title','More Info')
		.attr('id', 'icon' + item.jid)
		.addClass('icon-chevron-right');

	$(infoDiv).attr('id', 'info' + item.jid)
		.attr('style','display: none')
		.append(groupButtonTools(item));	

	$(buttonLink).data('toggle', {jid : item.jid} )
		.attr('onClick', 'groupUserToggle(this)')
		.append(divButton);

	  
	$(groupLink).attr('href','/viewGroup/' + item.jid).append(item.organizationName);
	$(titleSpan).addClass('span4 networkTitle').append(groupLink); 
	$(iconSpan).addClass('span1').append(buttonLink);   
	
        
    var li = document.createElement('li');
    var ul = document.createElement('ul');
    var a = document.createElement('a');
        
    $(groupDIV).addClass('row-fluid').append(iconSpan).append(titleSpan);
    $(a).attr('style','color:black').append(groupDIV).append(infoDiv);
        
    $(li).append(a);
    $(ul).addClass("nav nav-list").append(li);

	return ul;

}

//--------------------------------------------------------------------
//				User List Interface
//--------------------------------------------------------------------


function userButtonTools(item){
	var buttonDiv = document.createElement('div'),
		viewLink=document.createElement('a'),
		viewIcon=document.createElement('i'),
		shareNetworkLink = document.createElement('a'),
		shareNetworkIcon = document.createElement('i'),
		inviteGroupLink = document.createElement('a'),
		inviteGroupIcon = document.createElement('i');
		
	
	$(viewIcon).addClass('icon-folder-open');
	$(shareNetworkIcon).addClass('icon-share');
	$(inviteGroupIcon).addClass('icon-exchange');
	

	
	$(viewLink).attr('href','/viewUser/' + item.jid)
		.addClass('btn')
		.attr('rel','tooltip')
		.attr('title','View Group')
		.attr('data-placement','bottom')
		.append(viewIcon);
	
	$(shareNetworkLink).attr('href','#')
		.addClass('btn')
		.attr('rel', 'tooltip')
		.attr('title', 'Share a Network with this User')
		.attr('data-placement', 'bottom')
		.append(shareNetworkIcon);
	$(inviteGroupLink).attr('href', '#')
		.addClass('btn')
		.attr('rel', 'tooltip')
		.attr('title', 'Invite User to a Group')
		.attr('data-placement', 'bottom')
		.append(inviteGroupIcon);
		
	if (isSignedIn() && (user.username != item.username)) {
		$(buttonDiv).append(shareNetworkLink).append(inviteGroupLink);
	}
		
	$(buttonDiv).addClass('btn-group')
		.append(viewLink);
	return buttonDiv
}


function formatUserDescriptor(item){
	var userDIV = document.createElement('div'),
		titleSpan = document.createElement('span'),
		iconSpan = document.createElement('span'),
		divButton = document.createElement('i'),
		userLink = document.createElement('a'),
		buttonLink = document.createElement('a'),
		infoDiv = document.createElement('div');

	$(divButton).attr('rel','tooltip')
		.attr('title','More Info')
		.attr('id', 'icon' + item.jid)
		.addClass('icon-chevron-right');

	$(infoDiv).attr('id', 'info' + item.jid)
		.attr('style','display: none')
		.append(userButtonTools(item));	

	$(buttonLink).data('toggle', {jid : item.jid} )
		.attr('onClick', 'groupUserToggle(this)')
		.append(divButton);

	  
	$(userLink).attr('href','/viewUser/' + item.jid).append(item.username);
	$(titleSpan).addClass('span4 networkTitle').append(userLink); 
	$(iconSpan).addClass('span1').append(buttonLink);   
	
        
    var li = document.createElement('li');
    var ul = document.createElement('ul');
    var a = document.createElement('a');
        
    $(userDIV).addClass('row-fluid').append(iconSpan).append(titleSpan);
    $(a).attr('style','color:black').append(userDIV).append(infoDiv);
        
    $(li).append(a);
    $(ul).addClass("nav nav-list").append(li);

	return ul;

}

//--------------------------------------------------------------------
// 				User Notification Functions
//--------------------------------------------------------------------

function addInvite(name,id){
	//adds invite to notifContent div in user or group home page
	//requires that the page have div with id notifContent
	//requires running create modal in conjunction for now
	var modalTrigger = document.createElement('a');		
	var list = document.createElement('li');
	var unlist = document.createElement('ul');
	
	$(modalTrigger)
		.addClass('unread')
		.attr('href','#modal'+id)
		.attr('data-toggle','modal')
		.attr('id','trigger'+id)
		.append(name);
	
	$(list).append(modalTrigger);
	$(unlist).attr('id','triggerParent'+id).addClass("nav nav-list").append(list);
	
	return unlist;
}

function respondInvite(obj){
	//function for onclick attribute of modal buttons for request
	//requires notifications div to have id 'notifcontent'
	
	var pageLink = document.getElementById('trigger' + obj.title);
	var linkParent = document.getElementById('triggerParent' + obj.title);
	var modal = document.getElementById('modal' + obj.title);
	var notifContent = document.getElementById('notifContent');
	
	if (obj.id == 'postpone'){
		pageLink.className ='read';
		//modal.removeChild(obj);
	}
	if (obj.id == 'accept'){
		notifContent.removeChild(linkParent);
	}
	if (obj.id == 'deny'){
		notifContent.removeChild(linkParent);
	}	
}

function createModal(name,id){
//essentially using js to create html modal for bootstrap
//parameters may change in order to handle full body of a request or invite

	var inviteModal = document.createElement('div'),
		modalHeader = document.createElement('div'),
		modalBody = document.createElement('div'),
		modalFooter = document.createElement('div'),
		title = document.createElement('h4'),
		accept = document.createElement('button'),
		postpone = document.createElement('button'),
		deny = document.createElement('button');
		
	//Modal body
	var topDiv = document.createElement('div'),
		infoDiv = document.createElement('div'),
		infoDiv2 = document.createElement('div'),
		picDiv = document.createElement('div'),
		messageDiv = document.createElement('div'),
		headerSpan = document.createElement('span'),
		contSpan = document.createElement('span'),
		subjectSpan = document.createElement('span');
	/*
	 ------------------------Modal Body-------------------------
	 
	 |-------------------------topDiv--------------------------|
	 ||-----------infoDiv--------|-|-----------picDiv---------||
	 |||----------infoDiv2------||-|--------------------------||
	 |||------------|-----------||-|--------------------------||
	 |||--header----|---cont----||-|--------------------------||
	 |||--span------|---span----||-|--------------------------||
	 |||------------|-----------||-|--------------------------||
	 |||------------------------||-|--------------------------||
	 ||--------------------------|-|--------------------------||
	 |---------------------------------------------------------|
	 
	 |----subjectSpan------------------------------------------|
	 |----messageDiv-------------------------------------------|
	 
	 -----------------------------------------------------------
	 */
	$(headerSpan).addClass('span3 requestModalLabel').html('From:');//plan to include from, date, groupname, memberType
	$(contSpan).addClass('span7').html('Dexter');
	$(infoDiv2).addClass('row-fluid').append(headerSpan).append(contSpan);
	
	
	$(infoDiv).addClass('span7').append(infoDiv2);
	$(picDiv).addClass('span5').append('picture here');
	$(topDiv).addClass('row-fluid').append(infoDiv).append(picDiv);
	
	$(subjectSpan).addClass('').append('subject');
	$(messageDiv).addClass('notifications').append('message');
	
	//-----------
	$(title).attr('id','modal'+id+'Label')
		.append('Join my Group on NDEx');
	
	$(accept).addClass('btn')
		.attr('title',id)
		.attr('id','accept')
		.attr('data-dismiss','modal')
		.attr('aria-hidden','true')
		.attr('onclick','respondInvite(this)')
		.append('Accept');
	$(postpone).addClass('btn')
		.attr('title',id)
		.attr('id','postpone')
		.attr('onclick','respondInvite(this)')
		.attr('data-dismiss','modal')
		.attr('aria-hidden','true')
		.append('Postpone');
	$(deny).addClass('btn')
		.attr('title',id)
		.attr('id','deny')
		.attr('data-dismiss','modal')
		.attr('aria-hidden','true')
		.attr('onclick','respondInvite(this)')
		.append('Deny');	
		
	$(modalHeader).addClass('modal-header')
		.append(title);
	$(modalBody).addClass('modal-body')
		.append('test'+id)
		.append(topDiv)
		.append(subjectSpan)
		.append(messageDiv);
		
	$(modalFooter).addClass('modal-footer')
		.append(accept)
		.append(postpone)
		.append(deny);
	
	$(inviteModal).addClass('modal hide fade')
		.attr('id','modal'+id)
		.attr('tabindex','-1')
		.attr('role','dialog')
		.attr('aria-labelledby','modal' + id + 'label')
		.attr('aria-hidden','true')
		.append(modalHeader).append(modalBody).append(modalFooter);
	
	return inviteModal;
	
}	

//---------------------------------------------------------
//				Profile Funcitons
//---------------------------------------------------------

function addElements(item, index){
	var header = document.getElementById('name'),
		link = document.getElementById('link'),
		descrip = document.getElementById('descrip'),
		imgDiv = document.getElementById('image'),
		image = document.createElement('img');

	if ((index == "firstName") || (index == "lastName")){
		$(header).append(item + ' ');
	}
	
	if (index == "organizationName"){
		$(header).append(item + ' ');
	}
	
	if (index == "website") {
		$(link).attr('href','http://www.triptychjs.com')
			.attr('target','_blank')
			.append('Check out my website');
	}

	if (index == "description") {
		$(descrip).append(item);
	}
	
	if (index =="backgroundImg") {
		var fImg = document.getElementById("foreground");
		$(image).attr('src',"../img/background/" + item);
		$(image).addClass('bckImg');
		$(imgDiv).append(image).append(fImg);
	}
	
	if (index =="foregroundImg") {
		$(image).attr('id','foreground')
			.attr('src',"../img/foreground/" + item);
		$(image).addClass('foreImg');
		$(imgDiv).append(image);
	}
}
