$(function() {
  var mainWritingNo = getNumberInStr(window.location.search);
  var oAjax = new ssj.util.ajax();
  var oSpinner = new ssj.util.spinner();
  var oToast = new ssj.util.toast();
  var Footer = $(".reply_inputwrap");
  oSpinner.setTarget($(".swiper-container"));
  oSpinner.show(); //페이지 처음 진입시 스피너

  //무한 스와이프
  var oSwiper = new ssj.util.swiper({
    direction: "horizontal",
    slidesPerView: 1.1,
    centeredSlides: true,
    threshold: 10,
    on: {
      init: function() {
        setInitialData(mainWritingNo);
        oSpinner.hide();
      },
      slideChange: function() {
        if (oSwiper.getActiveIndex() === oSwiper.getTotalCount() - 2) {
          makeSlideItems().then(items => {
            oSwiper.appendItem(items);
          });
        }
        activateAccordion(oSwiper.getActiveSlide());
        toggleFooter();
      }
    }
  });

  function toggleFooter() {
    isAlreadyVoted() ? Footer.show() : Footer.hide();
  }
  toggleFooter();

  //한 페이지 내에서 카드 정보 업데이트
  function updateCardsData(cards, json) {
    cards.map(function(index, item) {
      var prtg = $(item).find(".percentage");
      var count = $(item).find(".count");
      prtg.text(json.votePerc[index]);
      count.text(json.voteNoArr[index]);
    });
    console.log(json);
    cards
      .closest(".swiper-slide")
      .find(".vote")
      .next(".card__icon-desc")
      .text(json.totalVoteNum);
  }

  /*카드 선택시 UI변경*/
  function changeDetailUI(e) {
    var cardwrap = $(e.target).closest(".card_wrap");
    var card = $(e.target).closest(".card");
    var cards = cardwrap.find(".card");
    var bottomInfo = cardwrap.siblings(".detail_bottom");
    cardwrap.addClass("on");
    bottomInfo.addClass("on");
    cards.removeClass("on");
    card.addClass("on");
    toggleFooter();
  }

  //대댓글 펼침 기능 활성화
  function activateAccordion(target) {
    $(target)
      .find(".accordion")
      .accordion({
        transitionSpeed: 700,
        transitionEasing: "cubic-bezier(0.23, 1, 0.32, 1)"
      });
  }

  //업버튼, 다운버튼 UI변경
  function changeUpDownBtn(e) {
    var btn = $(e.target);
    if (btn.hasClass("on")) return false;
    var btnWrap = btn.parent();
    btn.hasClass("up") ? btnWrap.addClass("up") : btnWrap.addClass("down");
    btn.addClass("on");
  }

  function setInitialData(mainWritingNo) {
    makeFirstItem(mainWritingNo)
      .then(item => {
        oSwiper.appendItem(item);
        activateAccordion(oSwiper.getActiveSlide());
        setInitialVoteState();
        return makeSlideItems();
      })
      .then(item => {
        oSwiper.appendItem(item);
      });
  }

  //댓글 언급 기능
  function makeMention(nickname, comment_no) {
    return $(`
      <div class="reply_mention">
        <span class="reply_mention_tx">${nickname}</span>
        <input type="hidden" value="${comment_no}"></input>
        <button class="sp00 close" onclick="$(this).parent().remove()"></button>
      </div>
      `);
  }
  function changeMention(str, comment_no) {
    var mention = $(".reply_mention");
    mention.find('input[type="hidden"]').val(comment_no);
    mention.find(".reply_mention_tx").text(str);
    mention.removeClass("reply_mention");
    void mention.get(0).offsetWidth;
    mention.addClass("reply_mention");
  }
  $("body").on("click", ".detail_replytit", function(e) {
    var mention = $(".reply_mention");
    var isExist = mention.length;
    var nickname = $(e.target).text();
    var inputArea = $(".reply_inputctn");
    var moreBtn = $(e.target)
      .closest(".detail_replyitem")
      .find(".detail_reply_more");
    var comment_no = getNumberInStr(
      $(e.target)
        .closest(".detail_replyitem")
        .attr("id")
    );
    if (!isExist) {
      mention = makeMention(nickname, comment_no);
      inputArea.prepend(mention);
    } else {
      changeMention(nickname, comment_no);
    }
    moreBtn.click();
  });
  //댓글 언급 기능

  function makeFirstItem(writingNo) {
    var requestData = { writingNo };
    return oAjax.sendRequest(URL_READ_FIRST_SLIDE_DATA, requestData, ID_TMPL_SLIDE, "GET");
  }

  function makeSlideItems() {
    var page = oAjax.getCurrentPageNum(PAGE_NAME_SWIPE);
    var requestData = { page, writing_no: mainWritingNo };
    return oAjax.sendRequest(URL_READ_SLIDE_DATA, requestData, ID_TMPL_SLIDE, "GET", PAGE_NAME_SWIPE);
  }
  function isAlreadyVoted() {
    var slide = oSwiper.getActiveSlide();
    return $(slide)
      .find(".card_wrap")
      .hasClass("on");
  }
  function setInitialVoteState() {
    var slide = oSwiper.getActiveSlide();
    var vote =
      parseInt(
        $(slide)
          .find(".whereYouVote")
          .val(),
        10
      ) - 1;
    var cards = $(slide).find(".card");
    if (vote >= 0) {
      cards.get(vote).trigger("update");
    }
  }

  function clearComment() {
    $(".reply_input").val("");
  }

  function getActiveWritingId() {
    return getNumberInStr($(oSwiper.getActiveSlide()).attr("id"));
  }

  function getActiveCommentId(e) {
    var commentWrap =
      $(e.target)
        .closest(".detail_reply_subitem")
        .get(0) ||
      $(e.target)
        .closest(".detail_replyitem")
        .get(0);
    return getNumberInStr($(commentWrap).attr("id"));
  }

  /* 댓글 비동기 입력*/
  $("body").on("click", ".reply_submit", function(e) {
    var replytx = $(e.currentTarget)
      .siblings(".reply_input")
      .val();
    if (!replytx.length) {
      oToast.show("댓글을 입력해주세요", 2000);
      return false;
    }
    var mention = $(e.currentTarget).siblings(".reply_mention");
    var depth = mention.length;
    var parent = mention.find('input[type="hidden"]').val();
    var requestData = { writingNo: mainWritingNo, replytx, depth, parent };
    var slide = $(oSwiper.getActiveSlide());
    var comment = slide.find(`#comment${parent}`);
    var lowCommentWrap = comment.find(".detail_reply_subitems");
    var target = !depth ? comment.parent() : lowCommentWrap;
    var moreBtn = comment.find(".detail_reply_more");
    var accordion = comment.find(".accordion");
    var replyCnt = moreBtn.find(".detail_reply_count");
    accordion.on("accordion.refresh", function(e) {
      $(this)
        .find(".acdo_cont")
        .css(
          "max-height",
          $(this).height() +
            lowCommentWrap
              .children()
              .last()
              .height()
        );
    });
    oAjax.sendRequest(URL_CREATE_COMMENT, requestData, ID_TMPL_SUBREPLY, "POST").then(html => {
      target.append(html);
      replyCnt.text(parseInt(replyCnt.text(), 10) + 1);
      activateAccordion(comment);
      accordion.trigger("accordion.refresh");
      scrollToTarget(lowCommentWrap.children().last());
      clearComment();
    });
  });

  //좋아요, 싫어요 비동기처리
  $("body").on("click", ".recommend", function(e) {
    var btnWrap = $(e.target).closest(".detail_replyinfos");
    var isVoted = btnWrap.hasClass("up") || btnWrap.hasClass("down");
    $(e.target).prop("disabled", true);
    if (isVoted) return false;
    var writing_no = getActiveWritingId();
    var comment_no = getActiveCommentId(e);
    var prefer = $(e.target).hasClass("up") ? 0 : 1;
    var recomWrap = $(e.target).parent();
    var recomCount = recomWrap.find(".count");
    var requestData = { writing_no, comment_no, prefer };
    oAjax
      .sendUpdateRequest(URL_UPDATE_RECOMCOUNT, requestData, "POST")
      .then(data => {
        console.log(data);
        var txtarea = recomWrap.find(".detail_replyuptx");
        var sum_prefer = parseInt(data.sum_prefer, 10);
        if (txtarea.length) {
          recomCount.text(sum_prefer);
        } else if (sum_prefer >= 1) {
          var tmpl = $.templates(ID_TMPL_RECOMCOUNTTX);
          var html = tmpl.render(data);
          recomWrap.prepend(html);
        }
        changeUpDownBtn(e);
        $(e.target).prop("disabled", false);
      })
      .catch(error => {
        console.log(error);
      });
  });

  //대댓글 펼치기 : 버튼 UI 변경
  $("body").on("click", "button.detail_reply_more", function(e) {
    if (
      $(e.currentTarget)
        .children(".detail_reply_count")
        .text() == 0
    ) {
      return false;
    }
    $(e.currentTarget).toggleClass("on");
    $(e.currentTarget)
      .children(".comment")
      .toggleClass("yellow");
  });
  /* 본문 펼치기 */
  $(".swiper-wrapper").on("click", ".detail_btn", function(e) {
    $(this)
      .siblings(".detail_txtareawrap")
      .toggle();
  });

  /* 투표 비동기 처리 */
  $(".wrapper")
    .on("click", ".card", function(e) {
      var cardWrap = $(e.currentTarget).closest(".card_wrap");
      if (cardWrap.hasClass("on")) return;
      changeDetailUI(e);
      var cards = cardWrap.find(".card");
      var voteNum = cards.index($(e.currentTarget)) + 1;
      var writingNo = getActiveWritingId();
      $.ajax({
        url: URL_UPDATE_VOTECOUNT,
        method: "POST",
        data: {
          voteNum,
          writingNo
        },
        dataType: "json",
        success: function(data) {
          updateCardsData(cards, data);
        },
        error: function(request, status, error) {
          console.log(request, status, error);
        }
      });
    })
    .on("update", ".card", function(e) {
      debugger;
      changeDetailUI(e);
    });
});
