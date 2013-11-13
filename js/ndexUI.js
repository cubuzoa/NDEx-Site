(function (exports)
{


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


