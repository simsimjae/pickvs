(function ($) {
  $.fn.extend({
    leanModal: function (options) {
      var defaults = {
        top: 100,
        overlay: 0.5,
        closeButton: ".modal_close",
        escapeClose: true,
        clickClose: true
      };

      options = $.extend(defaults, options);
      var overlay = $('<div id="lean-overlay"></div>');

      $('body').append(overlay);

      function close_modal(modal_id) {
        $('#lean-overlay').fadeOut(0);
        $(modal_id).css({
          'display': 'none'
        });
        $(document).off('keydown.leanModal');
        $.observer.notify('modal.close');
        $.scrollLock(false);
        $('.home_header_navlist').show();
        typeof resetBottomNavbar != 'undefined' && resetBottomNavbar();
        $('.bottom_navbar').removeClass('on')
      }

      return this.each(function () { //this == a tag
        var o = options;
        $(this).click(function (e) {
          $('.modal').hide(); //기존 모달 열린거 닫아주고.

          var modal_id = $(this).attr('href');

          if (o.closeButton) {
            $(o.closeButton).one('click', function (e) {
              close_modal(modal_id);
              e.preventDefault();
            });
          }

          if (o.clickClose) {
            $('#lean-overlay').one('click', function (e) {
              close_modal(modal_id);
              e.preventDefault();
            });
          }

          if (o.escapeClose) {
            $(document).on('keydown.leanModal', function (event) {
              if (event.which === 27) {
                close_modal(modal_id);
              }
            });
          }

          $('#lean-overlay').css({
            'display': 'block',
            opacity: 1
          });

          $('#lean-overlay').fadeTo(0, o.overlay);
          $.scrollLock(true);

          $(modal_id).css({
            'display': 'block',
            'position': 'fixed',
            'opacity': 1,
            'z-index': 11000,
          });

          if (o.slideinUp && $(this).attr('id') === o.slideinUp + '_trigger') {
            $('#' + o.slideinUp).addClass('slideinUp');
          }

          //$(modal_id).fadeTo(0, 1);

          e.preventDefault();
        });
      });
    }
  });
})(jQuery);