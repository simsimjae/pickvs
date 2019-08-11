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

  $(".write__inparea").on(
    "focusin",
    ".write__inpcnt, .write__txtarea",
    function() {
      $(this).addClass("focus");
    }
  );
  $(".write__inparea").on(
    "focusout",
    ".write__inpcnt, .write__txtarea",
    function() {
      $(this).removeClass("focus");
    }
  );

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
    group.each(function(index, item) {
      if (index === nowIdx) {
        $(item).removeClass("off");
        $(item).addClass("on");
        return;
      }
      $(item).removeClass("on");
      $(item).addClass("off");
    });
  });

  //아코디언탭
  $(".acdo").on("click", ".acdo_open", function(e) {
    var wrapper = $(e.delegateTarget);
    var hiddenArea = $(this).siblings(".acdo_cont");
    wrapper.toggleClass("on");
  });
});

/* 스피너 모음 */
var _spinner = $(".main-spinner");
var _target;

function makeSpinner() {
  return $('<span class="main-spinner"></span>');
}

function showSpinner(target) {
  _target = target;
  _spinner = _spinner.length ? $(_spinner).detach() : makeSpinner();
  _spinner.appendTo(target);
}

function hideSpinner() {
  _spinner = $(_spinner).detach();
}

function areNotCompleted(group) {
  //모두 입력되었으면 -1리턴
  for (var i = 0; i < group.length; i++) {
    if (!$(group[i]).hasClass("on")) return i;
  }
  return -1;
}

//토스트
var toast = $(".toast");
if (toast.length > 0) {
  showToast(toast);
}

function copyToClipboard(url) {
  showToast($(".toast"));
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val(url).select();
  document.execCommand("copy");
  $temp.remove();
}

function showToast(target) {
  target.addClass("scene_element--fadein on");
  target.removeClass("scene_element--fadeout");
  setTimeout(() => {
    target.removeClass("scene_element--fadein");
    target.addClass("scene_element--fadeout");
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
