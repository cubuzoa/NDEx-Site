(function (exports)
{

  exports.user = {};

//-----------------------------------------------------
//				Sign In / Out
//-----------------------------------------------------
  exports.checkSignIn = function()
  {
//    if (!localStorage.username)
//    {
//      console.log("not signed in");
//      exports.user = {};
//      return false;
//    }
//    else
//    {
//      console.log("signed in");
//      exports.user.id = localStorage.ndexJid;
//      exports.user.username = localStorage.username;
//      return true;
//    }
  };

  exports.signOut = function()
  {
//    delete localStorage.username;
//    delete localStorage.password;
//    delete localStorage.ndexJid;
//    exports.user = {};
//
//    window.location.href = "/";
    //console.log(JSON.stringify(localStorage));
  };

  exports.isOwnedNetwork = function (networkId)
  {
    if (exports.user.ownedNetworks && exports.user.ownedNetworks.length > 0)
    {
      $.each(exports.user.ownedNetworks, function (index, network)
      {
        if (network.jid == networkId) return true;
      });
    }
    return false;
  };

  exports.isSharedNetwork = function (networkId)
  {
    //TODO shared network implementation?
    return false;
  };

  exports.isOwnedGroup = function (groupId)
  {
    if (exports.user.ownedGroups && exports.user.ownedGroups.length > 0)
    {
      $.each(exports.user.ownedGroups, function (index, group)
      {
        if (group.jid == groupId) return true;
      });
    }
    return false;
  };

  exports.initPage = function (callback)
  {
//    if (ndexUI.checkSignIn())
//    {
//      //assigning a class, ex: signInOnly, can eliminate a lot of lines of code
//      $('#myAccount').attr('style', 'display:block');
//      $('#manageTasks').attr('style', 'display:block');
//      $('#signOut').attr('style', 'display:block');
//      $('#navUploadNetwork').attr('style', 'display:block');
//      $('#navNewGroup').attr('style', 'display:block');
//      $('#signIn').attr('style', 'display:none');
//      $('#signUp').attr('style', 'display:none');
//
//      $('#toAccount').attr('href', '/viewUser/' + ndexUI.user.id);
//      $('#toGroups').attr('href', '/viewUser/' + ndexUI.user.id + '/#tab_ownedGroups');
//      $('#toNetworks').attr('href', '/viewUser/' + ndexUI.user.id + '/#tab_ownedNetworks');
//
//      $('#navname').html(localStorage['ndexUsername']);
//
//      ndexClient.getUser(ndexUI.user.id, function (data)
//      {
//        console.log(JSON.stringify(data));
//        ndexUI.user.profile = data.user.profile;
//        ndexUI.user.ownedNetworks = data.user.ownedNetworks;
//        ndexUI.user.ownedGroups = data.user.ownedGroups;
//        if (callback) callback();
//        //console.log('----' + JSON.stringify(ndexUI.user));
//      });
//
//    }
//    else
//    {
//      $('#myAccount').attr('style', 'display:none');
//      $('#manageTasks').attr('style', 'display:none');
//      $('#signOut').attr('style', 'display:none');
//      $('#navUploadNetwork').attr('style', 'display:none');
//      $('#navNewGroup').attr('style', 'display:none');
//      $('#signIn').attr('style', 'display:block');
//      $('#signUp').attr('style', 'display:block');
//
//      $('#navname').html('');
//      if (callback) callback();
//    };
  }
//-----------------------------------------------------
//		Utilities
//-----------------------------------------------------

  exports.formatError = function (error)
  {
    console.log(JSON.stringify(error));
    // First, figure out if we can get the error text from the error
    var errorString = '(problem getting error text)'
    if (typeof(error) == 'string')
    {
      errorString = error;
    }
    else if (typeof(error) == 'object' && error.responseJSON && error.responseJSON.error)
    {
      errorString = error.responseJSON.error;
    }
    else
    {
      errorString = JSON.stringify(error);
    }

    // Second, check whether we have an element with the id "message".
    // If we do, then use it to display the error.
    var messageDiv = document.getElementById('message');
    if (messageDiv)
    {
      messageDiv.innerHTML = "<span class='errorMessage'>Error: " + errorString + "</span>";
    }
    else
    {
      // fall back to an alert if we don't have a messageDiv
      alert("Error: " + errorString);
    }
  };

//-----------------------------------------------------
//		Pagination function
//-----------------------------------------------------
  exports.createPaginationModule = function (itemsPerPage, currentPage, numberOfItemsInCurrentPage, searchFunction)
  {
    //searchFunction is the name of a function as a string

    // Strategy:
    // - create buttons as List elements - using Bootstrap.js methodology.
    // - create "First" and "Prev" buttons unless we are on first page.
    var pagDiv = document.createElement('div');
    var pagUl = document.createElement('ul');

    if (currentPage > 1)
    {


      // First
      var firstLi = document.createElement('li');
      var first = document.createElement('a');
      $(first).attr('onclick', searchFunction + '(1)').attr('rel', 'tooltip').attr('title', 'page 1').html('<<');
      $(firstLi).append(first);
      $(pagUl).append(firstLi);
      $(firstLi).addClass('active');

      // Prev
      var prevLi = document.createElement('li');
      var prev = document.createElement('a');
      var prevPage = currentPage - 1;
      $(prev).attr('onclick', searchFunction + '(' + prevPage + ')').html('<');
      $(prevLi).addClass('prev').append(prev);
      $(pagUl).append(prevLi);
      $(prevLi).addClass('active');

    }
    // Next
    // don't display next button if the current page is not full, since that would mean we were at the end.
    if (numberOfItemsInCurrentPage >= itemsPerPage)
    {
      var nextLi = document.createElement('li');
      var next = document.createElement('a');
      var nextPage = currentPage + 1;
      $(next).attr('onclick', searchFunction + '(' + nextPage + ')').html('>');
      $(nextLi).addClass('next').append(next);
      $(pagUl).append(nextLi);
      $(nextLi).addClass('active');
    }
    /*

     Problem: we don't know how many pages we have total.

     var lastLi = document.createElement('li');
     var last = document.createElement('a');
     $(last).attr('onclick', searchFunction + '(Number(this.id))').attr('id', numItemsPerPage).attr('rel', 'tooltip').attr('title', 'page ' + numItemsPerPage).html('>>');
     $(lastLi).append(last);
     $(pagUl).append(lastLi);
     */

    /*
     //disable links when already on page
     if (pageNumber == 0) $(prevLi).addClass('active');
     if (pageNumber == 0) $(firstLi).addClass('active');
     if (pageNumber == (numItemsPerPage - 1)) $(nextLi).addClass('active');
     if (pageNumber == (numItemsPerPage - 1)) $(lastLi).addClass('active');

     //create first, previous, next, and last links

     //create links for 2 pages before and after current page
     for (var ii = 0; ii < numItemsPerPage; ii++) {
     //skip if not near current page
     if (ii < (pageNumber - 2)) continue;
     if (ii > (pageNumber + 2)) continue;
     var pagLi = document.createElement('li');
     var pagA = document.createElement('a');

     if (ii == pageNumber) {
     $(pagLi).addClass('active')
     }
     ;

     $(pagA).attr('onclick', searchFunction + '(Number(this.innerHTML))').html(ii + 1);
     $(pagLi).append(pagA);
     $(pagUl).append(pagLi);
     }
     */

    $(pagDiv).addClass('pagination pagination-centered').append(pagUl);
    return pagDiv;
  };

//------------------------------------
//	Network List Interface
//--------------------------------------

  exports.networkToggle = function (obj)
  {
    // toggle the network list item between closed and open
    var elementIDs = $(obj).data('elementIDs');
    var element = document.getElementById(elementIDs.div);
    var button = document.getElementById(elementIDs.button);

    if (element.style.display == "block")
    {
      element.style.display = "none";
      button.className = 'icon-chevron-right';
    }
    else
    {
      element.style.display = "block";
      button.className = 'icon-chevron-down';
    }
    exports.updateNetworkWorkSurfaceButton(elementIDs.jid);
  };

  exports.updateViewNetworkWorkSurfaceButtons = function (networkId)
  {
    //
    // Used on viewNetwork page
    //
    var netStatusElement = document.getElementById('netStatus');
    var netStatusLink = document.createElement('a');
    $(netStatusElement).html('');
    $(netStatusLink).data('networkProperties', networkId);

    if (exports.isOnWorkSurface(networkId))
    {
      $(netStatusLink).attr('onclick', "ndexUI.removeFromWorkSurface('" + networkId + "')").html('Remove from WorkSurface');
      $(netStatusElement).append(netStatusLink);
    }
    else
    {
      $(netStatusLink).attr('onclick', "ndexUI.addToWorkSurface('" + networkId + "')").html('Add to WorkSurface');
      $(netStatusElement).append(netStatusLink);
    }
  };

  exports.updateNetworkWorkSurfaceButton = function (networkId)
  {
    //
    // Used for network list items
    //
    var tempLink = document.getElementById('link' + networkId),
      tempIcon = document.getElementById('icon' + networkId);

    if (exports.isOnWorkSurface(networkId))
    {
      $(tempLink).attr('onclick', "ndexUI.removeFromWorkSurface('" + networkId + "')");
      $(tempIcon).attr('title', 'Remove from WorkSurface');
      tempIcon.className = 'icon-remove';
    }
    else
    {
      $(tempLink).attr('onclick', "ndexUI.addToWorkSurface('" + networkId + "')");
      $(tempIcon).attr('title', 'Add to WorkSurface');
      tempIcon.className = 'icon-plus icon-white';
    }
  };

  // Create the element with all the actions for network when toggled open
  exports.createNetworkButtonToolElement = function (item)
  {
    var buttonDiv = document.createElement('div'),
      wkSpaceLink = document.createElement('a'),
      viewLink = document.createElement('a'),
      visualizeLink = document.createElement('a'),
      wkSpaceIcon = document.createElement('i'),
      viewIcon = document.createElement('i'),
      visualizeIcon = document.createElement('i'),
      shareLink = document.createElement('a'),
      shareIcon = document.createElement('i'),
      accessLink = document.createElement('a'),
      accessIcon = document.createElement('i');

    //initializing type of icon
    $(wkSpaceIcon).addClass('icon-plus')
      .attr('id', 'icon' + item.jid)
      .attr('rel', 'tooltip')
      .attr('title', 'Add to WorkSurface')
      .attr('data-placement', 'bottom');
    $(viewIcon).addClass('icon-folder-open');
    $(visualizeIcon).addClass('icon-eye-open');
    $(shareIcon).addClass('icon-share');
    $(accessIcon).addClass('icon-exchange');

    $(wkSpaceLink).attr('onclick', '')
      .data('networkProperties', {title: item.title, jid: item.jid})
      .attr('id', 'link' + item.jid)
      .addClass('btn')
      .append(wkSpaceIcon);
    $(viewLink).attr('href', '/viewNetwork/' + item.jid)
      .addClass('btn')
      .attr('rel', 'tooltip')
      .attr('title', 'View Network')
      .attr('data-placement', 'bottom')
      .append(viewIcon);
    $(visualizeLink).attr('href', '/visualizeNetwork/' + item.jid)
      .addClass('btn')
      .attr('rel', 'tooltip')
      .attr('title', 'VisualizeNetwork')
      .attr('data-placement', 'bottom')
      .append(visualizeIcon);
    $(shareLink).attr('href', '/sendRequest')
      .addClass('btn')
      .attr('rel', 'tooltip')
      .attr('title', 'Share Network')
      .attr('data-placement', 'bottom')
      .append(shareIcon);
    $(accessLink).attr('href', '/sendRequest')
      .addClass('btn')
      .attr('rel', 'tooltip')
      .attr('title', 'Request Network Access')
      .attr('data-placement', 'bottom')
      .append(accessIcon);

    //appending buttons dependent on sign in
    if (exports.user.id)
    {
      $(buttonDiv).append(wkSpaceLink);
      if (exports.isOwnedNetwork(item.jid))
      {
        $(buttonDiv).append(shareLink);
      }
      if (!exports.isOwnedNetwork(item.jid) && !exports.isSharedNetwork(item.jid))
      {
        $(buttonDiv).append(accessLink);
      }
    }

    $(buttonDiv).addClass('btn-group')
      .append(viewLink)
      .append(visualizeLink);

    return buttonDiv
  };

  exports.formatNetworkDescriptor = function (networkItem)
  {
    var networkDIV = document.createElement('div'),
      nodeSpan = document.createElement('span'),
      edgeSpan = document.createElement('span'),
      titleSpan = document.createElement('span'),
      iconSpan = document.createElement('span'),
      divButton = document.createElement('i'),
      networkLink = document.createElement('a'),
      buttonLink = document.createElement('a'),
      infoDiv = document.createElement('div');

    //button element to toggle network list element display
    $(divButton).attr('rel', 'tooltip')
      .attr('title', 'More Info')
      .attr('id', networkItem.title + 2)
      .addClass('icon-chevron-right');

    //div to hold info, buttons for now, on dropdown
    $(infoDiv).addClass('searchInfo').attr('id', networkItem.title + 1)
      .attr('style', 'display: none')
      .append(exports.createNetworkButtonToolElement(networkItem));

    //the link element to toggle the dropdown
    $(buttonLink).attr('id', networkItem.title)
      .data('elementIDs', {div: networkItem.title + 1, button: networkItem.title + 2, jid: networkItem.jid})
      .attr('onClick', 'ndexUI.networkToggle(this)')
      .append(divButton);

    $(networkLink).attr('href', '/viewNetwork/' + networkItem.jid).append(networkItem.title);
    $(nodeSpan).addClass('span2 elementCount').append(networkItem.nodeCount + " nodes");
    $(edgeSpan).addClass('span2 elementCount').append(networkItem.edgeCount + " edges");
    $(titleSpan).addClass('span4 networkTitle').append(networkLink);
    $(iconSpan).addClass('span1').append(buttonLink);

    //bootstrap style nav list
    var li = document.createElement('li');
    var ul = document.createElement('ul');
    var a = document.createElement('a');

    $(networkDIV).addClass('row-fluid').append(iconSpan).append(titleSpan).append(nodeSpan).append(edgeSpan);
    $(a).attr('style', 'color:black').append(networkDIV).append(infoDiv);

    $(li).append(a);
    $(ul).addClass("nav nav-list").append(li);

    return ul;//networkDIV;

  };

//---------------------------------------------------
//			WorkSurface Functions
//---------------------------------------------------

  exports.initUserWorkSurface = function ()
  {
    if (exports.user.id)
    {

      ndexClient.getUserWorkSurface(exports.user.id,
        function (data)
        {
          // Success
          if (data.networks) updateWorkSurface(data.networks);
        },
        function (error)
        {
          // failure
          exports.formatError("while initializing WorkSurface: " + error);
        });
    }
  };

  exports.isOnWorkSurface = function (networkId)
  {

    // check workSurface element for network.
    // will return false if the workSurface element is not initialized
    var found = false;

    $('#divWorkSurface').children().each(function (index, element)
    {
      if (element.getAttribute('networkid') == networkId)
      {
        found = true;
      }
    });

    return found;
  };

  exports.removeFromWorkSurface = function (networkId)
  {
    if (exports.user.id && networkId)
    {
      ndexClient.deleteNetworkFromUserWorkSurface(exports.user.id, networkId,
        function (data)
        {
          // if successful
          if (data.networks)
          {
            updateWorkSurface(data.networks);
            exports.updateNetworkWorkSurfaceButton(networkId);
          }

        },
        function (error)
        {
          // if failure
          exports.formatError("while removing network from workSurface: " + error);
        });
    }
  };

  exports.addToWorkSurface = function (networkId)
  {

    ndexClient.addNetworkToUserWorkSurface(exports.user.id, networkId,
      function (data)
      {
        // if successful, update the workSurface display
        if (data.networks)
        {
          updateWorkSurface(data.networks);
          // also update the network display item
          exports.updateNetworkWorkSurfaceButton(networkId);
        }
      },
      function (error)
      {
        // if failure
        exports.formatError("while adding Network to workSurface: " + error);
      });

    //
  };

  var updateWorkSurface = function (workSurfaceNetworks)
  {
    $('.thumbnails').remove();
    // create a new networkElement for each workSurfaceNetwork
    $.each(workSurfaceNetworks, function (index, network)
    {
      $('#divWorkSurface').append(createWorkSurfaceNetworkElement(network));
    });

  };

  var createWorkSurfaceNetworkElement = function (network)
  {
    // ul, li are for bootstrap thumbnail css
    var networkElement = document.createElement('ul'),
      lst = document.createElement('li'),
      cnt = document.createElement('div'),
      formBox = document.createElement('form'),
      chckbox = document.createElement('input'),
      titleSpan = document.createElement('p');

    var parent = document.getElementById('divWorkSurface');

    $(titleSpan).addClass('thumbText').append(network.title);

    $(chckbox).attr('id', 'checkbox' + network.jid)
      .attr('title', network.jid)
      .attr('type', 'checkbox');

    $(formBox).append(chckbox);

    $(cnt).addClass('thumbnail thumbIcon')
      .append(formBox)
      .append(titleSpan);

    $(lst).append(cnt);

    $(networkElement).attr('id', 'thumbnail' + network.jid)
      .addClass('thumbnails')
      .attr('networkId', network.jid)
      .append(lst);

    return networkElement;
  };

//--------------------------------------------------------------------
//				shared function by group and user interface
//--------------------------------------------------------------------

  exports.groupUserToggle = function (obj)
  {
    var jid = $(obj).data('toggle').jid;
    var ele = document.getElementById('info' + jid);
    var but = document.getElementById('icon' + jid);
    if (ele.style.display == "block")
    {
      ele.style.display = "none";
      but.className = 'icon-chevron-right';
    }
    else
    {
      ele.style.display = "block";
      but.className = 'icon-chevron-down';
    }

  };

//--------------------------------------------------------------------
//					Group List Interface
//--------------------------------------------------------------------

  exports.groupButtonTools = function (item)
  {
    var buttonDiv = document.createElement('div'),
      viewLink = document.createElement('a'),
      viewIcon = document.createElement('i'),
      shareLink = document.createElement('a'),
      shareIcon = document.createElement('i'),
      accessLink = document.createElement('a'),
      accessIcon = document.createElement('i');

    $(viewIcon).addClass('icon-folder-open');
    $(shareIcon).addClass('icon-share');
    $(accessIcon).addClass('icon-exchange');

    $(viewLink).attr('href', '/viewGroup/' + item.jid)
      .addClass('btn')
      .attr('rel', 'tooltip')
      .attr('title', 'View Group')
      .attr('data-placement', 'bottom')
      .append(viewIcon);

    $(shareLink).attr('href', '/sendRequest')
      .addClass('btn')
      .attr('rel', 'tooltip')
      .attr('title', 'Invite User to this Group')
      .attr('data-placement', 'bottom')
      .append(shareIcon);
    $(accessLink).attr('href', '/sendRequest')
      .addClass('btn')
      .attr('rel', 'tooltip')
      .attr('title', 'Request Group Membership')
      .attr('data-placement', 'bottom')
      .append(accessIcon);

    if (exports.user.id)
    {
      if (exports.isOwnedGroup(item.jid))
      {
        $(buttonDiv).append(shareLink);
      }
      if (!exports.isOwnedGroup(item.jid))
      {
        //may need to be isGroupPartOf
        $(buttonDiv).append(accessLink);
      }
    }

    $(buttonDiv).addClass('btn-group')
      .append(viewLink);
    return buttonDiv
  };

  exports.formatGroupDescriptor = function (item)
  {
    var groupDIV = document.createElement('div'),
      titleSpan = document.createElement('span'),
      iconSpan = document.createElement('span'),
      divButton = document.createElement('i'),
      groupLink = document.createElement('a'),
      buttonLink = document.createElement('a'),
      infoDiv = document.createElement('div');

    $(divButton).attr('rel', 'tooltip')
      .attr('title', 'More Info')
      .attr('id', 'icon' + item.jid)
      .addClass('icon-chevron-right');

    $(infoDiv).attr('id', 'info' + item.jid)
      .attr('style', 'display: none')
      .append(exports.groupButtonTools(item));

    $(buttonLink).data('toggle', {jid: item.jid})
      .attr('onClick', 'ndexUI.groupUserToggle(this)')
      .append(divButton);

    $(groupLink).attr('href', '/viewGroup/' + item.jid).append(item.organizationName);
    $(titleSpan).addClass('span4 networkTitle').append(groupLink);
    $(iconSpan).addClass('span1').append(buttonLink);

    var li = document.createElement('li');
    var ul = document.createElement('ul');
    var a = document.createElement('a');

    $(groupDIV).addClass('row-fluid').append(iconSpan).append(titleSpan);
    $(a).attr('style', 'color:black').append(groupDIV).append(infoDiv);

    $(li).append(a);
    $(ul).addClass("nav nav-list").append(li);

    return ul;

  };

//--------------------------------------------------------------------
//				User List Interface
//--------------------------------------------------------------------

  exports.userButtonTools = function (item)
  {
    var buttonDiv = document.createElement('div'),
      viewLink = document.createElement('a'),
      viewIcon = document.createElement('i'),
      shareNetworkLink = document.createElement('a'),
      shareNetworkIcon = document.createElement('i'),
      inviteGroupLink = document.createElement('a'),
      inviteGroupIcon = document.createElement('i');

    $(viewIcon).addClass('icon-folder-open');
    $(shareNetworkIcon).addClass('icon-share');
    $(inviteGroupIcon).addClass('icon-exchange');

    $(viewLink).attr('href', '/viewUser/' + item.jid)
      .addClass('btn')
      .attr('rel', 'tooltip')
      .attr('title', 'View Group')
      .attr('data-placement', 'bottom')
      .append(viewIcon);

    $(shareNetworkLink).attr('href', '/sendRequest')
      .addClass('btn')
      .attr('rel', 'tooltip')
      .attr('title', 'Share a Network with this User')
      .attr('data-placement', 'bottom')
      .append(shareNetworkIcon);
    $(inviteGroupLink).attr('href', '/sendRequest')
      .addClass('btn')
      .attr('rel', 'tooltip')
      .attr('title', 'Invite User to a Group')
      .attr('data-placement', 'bottom')
      .append(inviteGroupIcon);

    if (exports.user.id && (exports.user.username != item.username))
    {
      $(buttonDiv).append(shareNetworkLink).append(inviteGroupLink);
    }

    $(buttonDiv).addClass('btn-group')
      .append(viewLink);
    return buttonDiv
  };

  exports.formatUserDescriptor = function (item)
  {
    var userDIV = document.createElement('div'),
      titleSpan = document.createElement('span'),
      iconSpan = document.createElement('span'),
      divButton = document.createElement('i'),
      userLink = document.createElement('a'),
      buttonLink = document.createElement('a'),
      infoDiv = document.createElement('div');

    $(divButton).attr('rel', 'tooltip')
      .attr('title', 'More Info')
      .attr('id', 'icon' + item.jid)
      .addClass('icon-chevron-right');

    $(infoDiv).attr('id', 'info' + item.jid)
      .attr('style', 'display: none')
      .append(ndexUI.userButtonTools(item));

    $(buttonLink).data('toggle', {jid: item.jid})
      .attr('onClick', 'ndexUI.groupUserToggle(this)')
      .append(divButton);

    $(userLink).attr('href', '/viewUser/' + item.jid).append(item.username);
    $(titleSpan).addClass('span4 networkTitle').append(userLink);
    $(iconSpan).addClass('span1').append(buttonLink);

    var li = document.createElement('li');
    var ul = document.createElement('ul');
    var a = document.createElement('a');

    $(userDIV).addClass('row-fluid').append(iconSpan).append(titleSpan);
    $(a).attr('style', 'color:black').append(userDIV).append(infoDiv);

    $(li).append(a);
    $(ul).addClass("nav nav-list").append(li);

    return ul;

  };

//--------------------------------------------------------------------
// 				User Notification Functions
//--------------------------------------------------------------------

  exports.addInvite = function (name, id)
  {
    //adds invite to notifContent div in user or group home page
    //requires that the page have div with id notifContent
    //requires running create modal in conjunction for now
    var modalTrigger = document.createElement('a');
    var list = document.createElement('li');
    var unlist = document.createElement('ul');

    $(modalTrigger)
      .addClass('unread')
      .attr('href', '#modal' + id)
      .attr('data-toggle', 'modal')
      .attr('id', 'trigger' + id)
      .append(name);

    $(list).append(modalTrigger);
    $(unlist).attr('id', 'triggerParent' + id).addClass("nav nav-list").append(list);

    return unlist;
  };

  exports.respondInvite = function (obj)
  {
    //function for onclick attribute of modal buttons for request
    //requires notifications div to have id 'notifcontent'

    var pageLink = document.getElementById('trigger' + obj.title);
    var linkParent = document.getElementById('triggerParent' + obj.title);
    var modal = document.getElementById('modal' + obj.title);
    var notifContent = document.getElementById('notifContent');

    if (obj.id == 'postpone')
    {
      pageLink.className = 'read';
      //modal.removeChild(obj);
    }
    if (obj.id == 'accept')
    {
      notifContent.removeChild(linkParent);
    }
    if (obj.id == 'deny')
    {
      notifContent.removeChild(linkParent);
    }
  };

  exports.createModal = function (name, id)
  {
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
     |||----from----|--dexter---||-|--------------------------||
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
    $(title).attr('id', 'modal' + id + 'Label')
      .append('Join my Group on NDEx');

    $(accept).addClass('btn')
      .attr('title', id)
      .attr('id', 'accept')
      .attr('data-dismiss', 'modal')
      .attr('aria-hidden', 'true')
      .attr('onclick', 'respondInvite(this)')
      .append('Accept');
    $(postpone).addClass('btn')
      .attr('title', id)
      .attr('id', 'postpone')
      .attr('onclick', 'respondInvite(this)')
      .attr('data-dismiss', 'modal')
      .attr('aria-hidden', 'true')
      .append('Postpone');
    $(deny).addClass('btn')
      .attr('title', id)
      .attr('id', 'deny')
      .attr('data-dismiss', 'modal')
      .attr('aria-hidden', 'true')
      .attr('onclick', 'respondInvite(this)')
      .append('Deny');

    $(modalHeader).addClass('modal-header')
      .append(title);
    $(modalBody).addClass('modal-body')
      .append('test' + id)
      .append(topDiv)
      .append(subjectSpan)
      .append(messageDiv);

    $(modalFooter).addClass('modal-footer')
      .append(accept)
      .append(postpone)
      .append(deny);

    $(inviteModal).addClass('modal hide fade')
      .attr('id', 'modal' + id)
      .attr('tabindex', '-1')
      .attr('role', 'dialog')
      .attr('aria-labelledby', 'modal' + id + 'label')
      .attr('aria-hidden', 'true')
      .append(modalHeader).append(modalBody).append(modalFooter);

    return inviteModal;

  };

//---------------------------------------------------------
//				Profile Functions
//---------------------------------------------------------

  exports.addProfileImages = function (accountname)
  {

    var foregroundImage = document.createElement('img'),
      backgroundImage = document.createElement('img'),
      imgDiv = document.getElementById('image'),
      fImg = document.getElementById("foreground"),
      bImg = document.getElementById("background");

    $(backgroundImage).attr('src', "../img/background/" + accountname + ".jpg");
    $(backgroundImage).addClass('bckImg');
    $(imgDiv).append(backgroundImage).append(bImg);

    $(foregroundImage).attr('src', "../img/foreground/" + accountname + ".jpg");
    $(foregroundImage).addClass('foreImg');
    $(imgDiv).append(foregroundImage).append(fImg);
  };

  exports.updateUserProfileElements = function (item, index)
  {
    var userFullName = document.getElementById('userFullName'),
      userWebsite = document.getElementById('userWebsite'),
      userDescription = document.getElementById('userDescription');

    if ((index == "firstName") || (index == "lastName"))
    {
      $(userFullName).append(item + ' ');
    }

    if (index == "organizationName")
    {
      $(userFullName).append(item + ' ');
    }

    if (index == "website")
    {
      $(userWebsite).attr('href', "http://" + item)
        .attr('target', '_blank')
        .append("website: " + item);
    }

    if (index == "description")
    {
      $(userDescription).append(item);
    }

  };

  exports.updateGroupProfileElements = function (item, index)
  {
    var organizationName = document.getElementById('organizationName'),
      groupWebsite = document.getElementById('groupWebsite'),
      groupDescription = document.getElementById('groupDescription');

    if (index == "organizationName")
    {
      $(organizationName).append(item + ' ');
    }

    if (index == "website")
    {
      $(groupWebsite).attr('href', "http://" + item)
        .attr('target', '_blank')
        .append("website: " + item);
    }

    if (index == "description")
    {
      $(groupDescription).append(item);
    }

  };

})(typeof exports === 'undefined' ? this['ndexUI'] = {} : exports);


