var ssj = ssj || {};
ssj.util = ssj.util || {};
ssj.view = ssj.view || {};
var oAjax, oSpinner, oToast, oleanModal;


(function($){

  // common function
  function prevent(e){
    e.preventDefault();
  }

  // extend jQuery
  $.extend({
    scrollLock : function (lock) {
      lock ? 
        document.addEventListener('touchmove', prevent, { passive: false }) :
        document.removeEventListener('touchmove', prevent, { passive: false })
    },
    wait: function (delay) {
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), delay);
      });
    }
  });

  $.observer = {
    container: [],
    register: function (topic, observer, context = this) {
      this.container[topic] || (this.container[topic] = []);
      this.container[topic].push(observer.bind(context));
    },
    remove: function (topic, observer) {
      if (this.isEmpty(topic)) return;
      var index = this.container[topic].indexOf(observer);
      if (~index) {
        this.container[topic].splice(index, 1);
      }
    },
    notify: function (topic, message) {
      return new Promise((resolve, reject) => {
        if (this.isEmpty(topic)) return;
        const results = [];
        this.container[topic].forEach(observer => {
          const result = observer(message);
          results.push(result);
        });
        resolve(results);
      });
    },
    isEmpty: function (topic) {
      return !this.container[topic];
    }
  }

})(jQuery);


function areNotCompleted(group) {
  //모두 입력되었으면 -1리턴
  for (var i = 0; i < group.length; i++) {
    if (!$(group[i]).hasClass("on")) return i;
  }
  return -1;
}

function copyToClipboard(string) {
  let textarea;
  let result;

  try {
    textarea = document.createElement('textarea');
    textarea.setAttribute('readonly', true);
    textarea.setAttribute('contenteditable', true);
    textarea.style.position = 'fixed'; // prevent scroll from jumping to the bottom when focus is set.
    textarea.value = string;

    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();

    const range = document.createRange();
    range.selectNodeContents(textarea);

    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    textarea.setSelectionRange(0, textarea.value.length);
    result = document.execCommand('copy');
  } catch (err) {
    console.error(err);
    result = null;
  } finally {
    document.body.removeChild(textarea);
  }

  // manual copy fallback using prompt
  if (!result) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const copyHotkey = isMac ? '⌘C' : 'CTRL+C';
    result = prompt(`Press ${copyHotkey}`, string); // eslint-disable-line no-alert
    if (!result) {
      return false;
    }
  }
  return true;
}

function toggleInputBdr(target) {
  var len = $(target).find("input, textarea").val().trim().length;
  if (len > 0) $(target).addClass("on");
  else if (len == 0) $(target).removeClass("on");
}

function toggleTab(indexㅡ) {
  var target = $('.home_header_navlist');
  $(target.children()).removeClass("on");
  $(target.children().eq(index)).addClass("on");
}

function showToast(str) {
  if ($(".toast").length) return false;
  var toast = $(makeToast(str));
  $(".wrapper").append(toast);
}

function getNumberInStr(str) {
  return str.replace(/[^0-9]/g, "");
}

function scrollToBottom(target = $(document), duration = 0) {
  $("html, body").animate({
    scrollTop: $(target).height()
  }, duration);
}

function scrollToTop(duration = 0) {
  $("html, body").animate({
    scrollTop: 0
  }, duration);
}

function scrollToTarget(target, duration = 300) {
  $("body,html").animate({
      scrollTop: $(target).offset().top - $(window).height() / 5
    },
    duration
  );
}
function scrollByPosition(scrollTop){
  $('html, body').animate({scrollTop},0);
}

function getWritingNoFromURL(){
  return getNumberInStr(window.location.search);
}

function isAndroid(){
  return $('body').hasClass('body_and');
}

function isIos(){
  return $('body').hasClass('body_ios');
}

ssj.util.ajax = function (options) {
  $.extend(this, options);
  this.init();
};

ssj.util.ajax.prototype = {
  init() {
    this.assignElements();
  },
  assignElements() {
    this.method = "GET";
    this.paging = new Map(); // 비동기 요청 종류에 따라 페이지 위치 기억
  },
  sendRequest(url, data, tmplId, method, pageName) {
    this.setMetaData(url, data, tmplId, method, pageName);
    var oSelf = this;
    return new Promise(function (resolve, reject) {
      $.ajax({
        url: oSelf.url,
        method: oSelf.method, 
        data: oSelf.data,
        success: function (data) {
          console.log(data);
          oSelf.response = data;
          oSelf.increasePageNum(pageName);
          if (tmplId === null) {
            resolve(data);
          } else {
            resolve(oSelf.makeHtml(data));
          }
        },
        error: function (data) {
          reject(data);
        }
      });
    });
  },
  sendUpdateRequest(url, data, method) {
    this.setUpdateMetaData(url, data, method);
    var oSelf = this;
    return new Promise(function (resolve, reject) {
      $.ajax({
        url: oSelf.url,
        method: oSelf.method,
        data: oSelf.data,
        success: function (data) {
          console.log(data);
          resolve(data);
        },
        error: function (data) {
          reject(data);
        }
      });
    });
  },
  increasePageNum(pageName) {
    if (typeof pageName !== "undefined" && !this.isPageEmpty(pageName)) {
      this.paging.set(pageName, this.getCurrentPageNum(pageName) + 1);
    }
  },
  getCurrentPageNum(pageName) {
    return !this.isPageEmpty(pageName) ? this.paging.get(pageName) : 1;
  },
  getResponseJson() {
    return this.response;
  },
  isPageEmpty(pageName) {
    return !this.paging.get(pageName);
  },
  setMetaData(url, data, tmplId, method, pageName) {
    this.setUrl(url);
    this.setMethod(method);
    this.setData(data);
    this.setTmplId(tmplId);
    if (typeof pageName !== "undefined") {
      this.activatePaging(pageName);
    }
  },
  setUpdateMetaData(url, data, method) {
    this.setUrl(url);
    this.setData(data);
    this.setMethod(method);
  },
  setUrl(url) {
    this.url = url;
  },
  setData(data) {
    this.data = data;
  },
  setMethod(method) {
    this.method = method;
  },
  setTmplId(id) {
    this.ID_TMPL = id;
  },
  activatePaging(pageName) {
    if (this.isPageEmpty(pageName)) {
      this.paging.set(pageName, 1);
    }
  },
  getTemplate() {
    return $.templates(this.ID_TMPL);
  },
  makeHtml(data) {
    return this.getTemplate().render(data);
  }
};

ssj.util.spinner = function (options) {
  $.extend(this, options);
  this.init();
};

ssj.util.spinner.prototype = {
  init() {
    this.initVar();
  },
  initVar() {
    this.spinner = this.makeSpinner();
  },
  makeSpinner() {
    return $('<div class="main-spinner"></div>');
  },
  show() {
    this.spinner.appendTo(this.target);
  },
  hide() {
    this.spinner.detach();
  },
  setTarget: target => {
    this.target = target;
  }
};

ssj.util.toast = function (options) {
  $.extend(this, options);
  this.init();
};

ssj.util.toast.prototype = {
  init() {
    this.assignElements();
  },
  assignElements() {
    this.toast = $(`<div class="toast scene_element"></div>`);
  },
  show(message, duration = 2000) {
    this.toast.text(message);
    this.duration = duration;
    $(".m-scene").append(this.toast);
    this.activateFadeEffect();
  },
  hide() {
    this.toast.detach();
  },
  activateFadeEffect() {
    oSelf = this;
    oSelf.toast.addClass("scene_element--fadein");
    oSelf.toast.removeClass("scene_element--fadeout");
    setTimeout(() => {
      oSelf.toast.removeClass("scene_element--fadein");
      oSelf.toast.addClass("scene_element--fadeout");
      setTimeout(() => {
        oSelf.hide();
      }, 500);
    }, oSelf.duration);
  }
};


/*
  saved : [] , 배열 내 아이템
  {
    'scrollTop': 0, //스크롤 탑 위치
    'cards': null, //리스트의 카드들
    'page': 1, //현재 보고 있는 페이지
    'isEnded': false //카테고리의 글을 모두 불러왔는지?
  }
*/
ssj.view.infiniteScroll = function (options) {
  $.extend(this, options);
  this.init();
}

ssj.view.infiniteScroll.prototype = {
  init() {
    this._assignElements();
    this._attachEventHandler();
    this._initVar();
    this._setInitialCards();
  },
  _initVar() {
    this.saved = [];
    this.pending = false;
    this.url = URL_READ_MAIN_CARD_DATA;
    this.tmplId = ID_TMPL_MAIN_CARD;
    this.method = 'GET';
    this.tabcount = this.getTotalCateCount();
    this._setInitialSavedData();
  },
  _assignElements() {
    this.cardList = $('.main-sec__list');
    this.headerWrap = $('.home_header_navlist');
  },
  _attachEventHandler() {
    $(window).scroll(this.onScroll.bind(this));
  },
  onScroll() {
    if (this.shouldTrigger() && !this.pending && !this.getCurrentSavedDatas().isEnded) {
      this.pending = true;
      var data = this._makeRequestData();
      this.loadData(this.url, data).then( json => {
        this.renderCards(json);
        !json.length && this._setNoMoreData();
        this.pending = false;
        //hideSpinner();
      }).catch(e => {
        console.log(e);
      });
    }
  },
  loadData(url, data) {
    return new Promise((resolve, reject) => {
      $.get({
        url, data,
        success: function (data) { resolve(data) },
        error: function (e) { reject(e) }
      });
    });
  },
  _setInitialCards() {
    var data = this._makeRequestData();
    this.loadData(this.url, data).then( json => {
      this.renderCards(json);
    }).catch( e => {
      console.log(e);
    });
  },
  switchCategory(){ //배열에 데이터가 있으면 복구, 없으면 요청
    if (this.isEmptyCardList()){
      this._setInitialCards();
    }else{
      this._restoreCardList();
    }
  },
  saveCurrentState(){
    var scrollTop = $(window).scrollTop();
    var cards = this.cardList.children().detach();
    $.extend(this.getCurrentSavedDatas(),{cards,scrollTop});
  },
  _restoreCardList(){
    var current = this.getCurrentSavedDatas();
    this.cardList.append(current.cards);
  },
  renderCards(json) {
    console.log(json);
    var tmpl = $.templates(this.tmplId);
    var html = tmpl.render(json);
    this.cardList.append(html);
    this._increasePageNum();
  },
  shouldTrigger() {
    var winH = $(window).height();
    var docH = $(document).height();
    var winTop = $(window).scrollTop();
    return Math.ceil(winTop) >= docH - winH;
  },
  _setNoMoreData() {
    this.saved[this.getCurrentCateNum()].isEnded = true;
  },
  _setInitialSavedData() {
    for (var i = 0; i < this.tabcount; i++) { //카테고리 별로 필요한 데이터를 배열로 관리
      this.saved.push({
        'scrollTop': 0, //스크롤 탑 위치
        'cards': null, //리스트의 카드들
        'page': 1, //현재 보고 있는 페이지
        'isEnded': false //카테고리의 글을 모두 불러왔는지?
      });
    }
  },
  _increasePageNum() {
    this.saved[this.getCurrentCateNum()].page++;
  },
  _makeRequestData(){
    return { page : this.getCurrentPageNum(), mainCategory : this.getCurrentCateNum()};
  },
  isEmptyCardList(){
    var current = this.getCurrentSavedDatas();
    return !current.cards || !current.cards.length;
  },
  getCurrentSavedDatas() {
    var categoryNum = this.getCurrentCateNum();
    return this.saved[categoryNum];
  },
  getTotalCateCount() {
    return this.headerWrap.children().length + $('.mypage').children().length - 1;
  },
  getCurrentCateNum() {
    return this.headerWrap.find('.on').val();
  },
  getCurrentPageNum() {
    var category = this.getCurrentCateNum();
    return this.saved[category].page;
  },
  getCurrentScrollTop() {
    return this.getCurrentSavedDatas().scrollTop;
  }
}

$(function () {
  var varUA = navigator.userAgent.toLowerCase(); //userAgent 값 얻기
  if (varUA.match('android') != null) {
    $('body').addClass('body_and');
  } else if (varUA.indexOf("iphone") > -1 || varUA.indexOf("ipad") > -1 || varUA.indexOf("ipod") > -1) {
    $('body').addClass('body_ios');
  } 
  oAjax = new ssj.util.ajax();
  oSpinner = new ssj.util.spinner();
  oToast = new ssj.util.toast();
  "use strict";

  $(".write__inparea").on("keyup", function () {
    toggleInputBdr($(this));
    var writeWrap = $(".write__wrap");
    var writeInpArea = $(".write__inparea");
    var writeBtn = $(".write__footbtn");
    if (isAllChecked()) {
      writeBtn.addClass("on");
      writeBtn.val("만들기");
    } else {
      writeBtn.removeClass("on");
      writeBtn.val("필수 항목을 입력해주세요");
    }
  });

  $(".write__inparea").on("focusin", ".write__inpcnt, .write__txtarea", function () {
    $(this).addClass("focus");
  });
  $(".write__inparea").on("focusout", ".write__inpcnt, .write__txtarea", function () {
    $(this).removeClass("focus");
  });

  function isAllChecked() {
    var chk = 0;
    $(".write__inparea").each(function (index, item) {
      $(item).hasClass("on") ? chk++ : chk;
    });
    return chk == 3 ? true : false;
  }

  var $page = $("#main"),
    options = {
      debug: true,
      //prefetch: true,
      //cacheLength: 2,
      onStart: {
        duration: 100, // Duration of our animation
        render: function ($container) {
          // Add your CSS animation reversing class
          //$container.addClass('is-exiting');
          // Restart your animation
          //smoothState.restartCSSAnimations();
        }
      },
      onReady: {
        duration: 0,
        render: function ($container, $newContent) {
          // Remove your CSS animation reversing class
          //$container.removeClass('is-exiting');
          // Inject the new content
          //$container.html($newContent);
        }
      }
    },
    smoothState = $page.smoothState(options).data("smoothState");

  $(".result__write").on("keyup", function () {
    if ($(this).val().trim().length > 0) {
      $(this).siblings("i").addClass("on");
    } else {
      $(this).siblings("i").removeClass("on");
    }
  });

  //토글
  $(".rdo_toggle").on("click", function (e) {
    var group = $(".rdo_toggle");
    var nowIdx = group.index($(this));
    group.each(function (index, item) {
      if (index === nowIdx) {
        $(item).addClass("on");
        return;
      }
      $(item).removeClass("on");
    });
  });

  //2종류 토글, On or off
  $(".toggle_on_off").on("click", function (e) {
    var group = $(".toggle_on_off");
    var nowIdx = group.index($(this));
    group.addClass("off").removeClass("on");
    group
      .eq(nowIdx)
      .addClass("on")
      .removeClass("off");
  });

  //아코디언탭
  $(".acdo").on("click", ".acdo_open", function (e) {
    var wrapper = $(e.delegateTarget);
    var hiddenArea = $(this).siblings(".acdo_cont");
    wrapper.toggleClass("on");
  });
});

