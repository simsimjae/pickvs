$(function() {
  "use strict";

  $(".write__inparea").on("keyup", function() {
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

  $(".write__inparea").on("focusin", ".write__inpcnt, .write__txtarea", function() {
    $(this).addClass("focus");
  });
  $(".write__inparea").on("focusout", ".write__inpcnt, .write__txtarea", function() {
    $(this).removeClass("focus");
  });

  function isAllChecked() {
    var chk = 0;
    $(".write__inparea").each(function(index, item) {
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
        render: function($container) {
          // Add your CSS animation reversing class
          //$container.addClass('is-exiting');
          // Restart your animation
          //smoothState.restartCSSAnimations();
        }
      },
      onReady: {
        duration: 0,
        render: function($container, $newContent) {
          // Remove your CSS animation reversing class
          //$container.removeClass('is-exiting');
          // Inject the new content
          //$container.html($newContent);
        }
      }
    },
    smoothState = $page.smoothState(options).data("smoothState");

  $(".result__write").on("keyup", function() {
    if (
      $(this)
        .val()
        .trim().length > 0
    ) {
      $(this)
        .siblings("i")
        .addClass("on");
    } else {
      $(this)
        .siblings("i")
        .removeClass("on");
    }
  });

  $(".modal").on("keyup", ".modal_inp", function(e) {
    if (
      $(this)
        .val()
        .trim().length === 0
    ) {
      //누구든 입력이 없으면 보더 삭제
      $(this).removeClass("on");
      $(this).removeClass("wrong");
    } else {
      $(this).addClass("on");
    }
  });

  //회원가입 비밀번호 중복 체크
  $("#join").on("keyup", "input[type = 'password']", function(e) {
    var pwdInputs = $(e.delegateTarget).find("input[type='password']");
    var index = pwdInputs.index($(this));
    var me = $(this);
    var other = $(pwdInputs[Number(!index)]);
    var str1 = me.val();
    var str2 = other.val();
    if (!str1) {
      me.removeClass("on");
      me.removeClass("wrong");
      return;
    } else if (!str2) {
      me.addClass("on");
      return;
    }

    if (str1.length !== str2.length) {
      //다른인풋이 비어있지 않을땐 길이가 같을때만 파랑 -> 빨강 보더
      pwdInputs.removeClass("on");
      pwdInputs.addClass("wrong");
    } else {
      if (str1 === str2) {
        pwdInputs.removeClass("wrong");
        pwdInputs.addClass("on");
      } else {
        $(this).removeClass("on");
      }
    }
  });

  //modal 제출 버튼 클릭시
  $(".modal").on("click", ".modal_submit", function(e) {
    var group = $(e.delegateTarget).find(".modal_inp");
    var index = areNotCompleted(group);
    if (index !== -1) {
      setTimeout(function() {
        $(group[index]).prop("placeholder", "항목을 입력해주세요.");
        $(group[index]).focus();
      }, 0);
      return false;
    }
  });

  //토글
  $(".rdo_toggle").on("click", function(e) {
    var group = $(".rdo_toggle");
    var nowIdx = group.index($(this));
    group.each(function(index, item) {
      if (index === nowIdx) {
        $(item).addClass("on");
        return;
      }
      $(item).removeClass("on");
    });
  });

  //2종류 토글, On or off
  $(".toggle_on_off").on("click", function(e) {
    var group = $(".toggle_on_off");
    var nowIdx = group.index($(this));
    group.addClass("off").removeClass("on");
    group
      .eq(nowIdx)
      .addClass("on")
      .removeClass("off");
  });

  //아코디언탭
  $(".acdo").on("click", ".acdo_open", function(e) {
    var wrapper = $(e.delegateTarget);
    var hiddenArea = $(this).siblings(".acdo_cont");
    wrapper.toggleClass("on");
  });

  //멘션
  $("body").on("click", ".detail_replytit", function(e) {
    var mention = makeMention($(e.target).text());
    var inputArea = $(".reply_inputctn");
    !inputArea.children(".reply_mention").length && inputArea.prepend(mention);
  });
});

function areNotCompleted(group) {
  //모두 입력되었으면 -1리턴
  for (var i = 0; i < group.length; i++) {
    if (!$(group[i]).hasClass("on")) return i;
  }
  return -1;
}

function copyToClipboard(url) {
  showToast($(".toast"));
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val(url).select();
  document.execCommand("copy");
  $temp.remove();
}

//토스트
function makeToast(str) {
  return `<div class="toast scene_element">${str}</div>`;
}

function showToast(str) {
  if ($(".toast").length) return false;
  var toast = $(makeToast(str));
  $(".wrapper").append(toast);
  toast.addClass("scene_element--fadein");
  toast.removeClass("scene_element--fadeout");
  setTimeout(() => {
    toast.removeClass("scene_element--fadein");
    toast.addClass("scene_element--fadeout");
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, 2000);
}

var toggleInputBdr = function(target) {
  var len = target
    .find("input, textarea")
    .val()
    .trim().length;
  if (len > 0) target.addClass("on");
  else if (len == 0) target.removeClass("on");
};

function toggleTab(e) {
  $(e.delegateTarget)
    .children()
    .removeClass("on");
  $(e.target).addClass("on");
}

function makeMention(str) {
  return $(`
  <div class="reply_mention">${str}
    <button class="sp00 close" onclick="$(this).parent().remove()"></button>
  </div>
  `);
}

var ID_TMPL_SLIDE = "#slideTmpl";
var ID_TMPL_REPLY = "#replyTmpl";

var URL_BASE = "http://pickvs.com";
var URL_CREATE_COMMENT = URL_BASE + "/writeComment";
var URL_UPDATE_VOTECOUNT = URL_BASE + "/vote";
var URL_READ_SLIDE_DATA = URL_BASE + "/getDetailDtoList";
var URL_READ_FIRST_SLIDE_DATA = URL_BASE + "/getWritingDtlDto";

var PAGE_NAME_SWIPE = "swipe";

var ssj = {};
ssj.util = ssj.util || {};

ssj.util.ajax = function(options) {
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
  sendRequest(url, data, tmplId, pageName, method) {
    this.setMetaData(url, data, tmplId, pageName, method);
    var oSelf = this;
    return new Promise(function(resolve, reject) {
      $.ajax({
        url: oSelf.url,
        method: oSelf.method,
        data: oSelf.data,
        success: function(data) {
          console.log(data);
          oSelf.increasePageNum(pageName);
          resolve(oSelf.makeHtml(data));
        },
        error: function(data) {
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
  isPageEmpty(pageName) {
    return !this.paging.get(pageName);
  },
  setMetaData(url, data, tmplId, pageName, method) {
    this.setUrl(url);
    this.setMethod(method);
    this.setData(data);
    this.setTmplId(tmplId);
    if (typeof pageName !== "undefined") {
      this.activatePaging(pageName);
    }
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

ssj.util.spinner = function(options) {
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

ssj.util.swiper = function(options) {
  this.metaData = options;
  this.init();
};

ssj.util.swiper.prototype = {
  init() {
    this.initVar();
  },
  initVar() {
    this.swiper = new Swiper(".swiper-container", this.metaData);
  },
  appendItem(slide) {
    this.swiper.appendSlide(slide);
  },
  getActiveSlide() {
    return this.swiper.slides[this.getActiveIndex()];
  },
  getActiveIndex() {
    return this.swiper.activeIndex;
  },
  getTotalCount() {
    return this.swiper.slides.length;
  }
};

function getNumberInStr(str) {
  return str.replace(/[^0-9]/g, "");
}

function scrollToBottom(target) {
  $(target).animate({ scrollTop: $(document).height() }, 0);
}
