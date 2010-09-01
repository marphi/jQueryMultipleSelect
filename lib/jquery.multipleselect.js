(function($) {
$.fn.multipleSelect = function(options){

  var updateSelectCount = function(wrapper) {
    $('.filters .view_selected_count', wrapper).text($('ul.list li.selected', wrapper).size());
  };

  var bindEvents = function(){
    var eventsBound = $.fn.multipleSelect.bound;
    if (!eventsBound) {
      $.fn.multipleSelect.bound = true;
      $(".selectorwrapper ul.list li").live("click", function(){
        $(this).toggleClass('selected');
        $(this).toggleClass('notselected');
        var select_list = $(this).parents('.selectorwrapper').data("target");
        $('option[value='+ $(this).data('value') +']', select_list).attr('selected', $(this).is('.selected'));
        updateSelectCount($(this).parents('.selectorwrapper'));
      })
      $(".selectorwrapper ul.selections li").live("click", function(){
        $(this).siblings().removeClass("view_on");
        // doing silter here, as the class attribute will only be the true class
        filterSelect($(this).parents(".selectorwrapper"), $(this).attr('class').replace("view_", ""));
        $(this).addClass("view_on");
      });
      $(".selectorwrapper .selectall, .selectorwrapper .selectnone").live("click", function(){
        var toclick = $(this).is('.selectall') ? 'notselected' : 'selected';
        $('ul.list li.' + toclick, $(this).parents('.selectorwrapper')).click();
      });
    }
  };

  var filterSelect = function(wrapper, filter){
    wrapper.removeClass('all');
    wrapper.removeClass('selected');
    wrapper.removeClass('notselected');
    wrapper.addClass(filter);
  };

  var buildSelector = function(elem, settings, wrapper){
    if ($(elem).is("select")) {
      var selectorWrapper = wrapper;
      if (wrapper === null || wrapper === undefined) {
        selectorWrapper = buildWrapper(elem, settings);
      }
      var selector = $('<ul class="list" />');
      // var itemWidth = Math.ceil((parseInt(width, 10)) / parseInt(columns, 10)) - 11;
      $('option', elem).each(function() {
        var data = $.extend($(this).data(), {optionText: $(this).text(), optionValue: $(this).val()})
        var selectItem = $('<div class="selector_item" /></div>');
        selectItem.append(settings.selectItem(data));
        selectItem.append($('<div class="radical">⎷</div>'));
        var item = $("<li />").html(selectItem);
        item.data('extra', data);
        if (!$(this).is(':selected')) {
          item.addClass('notselected');
        } else {
          item.addClass('selected');
        }
        item.data("value", $(this).val());
        selector.append(item);
      })

      $(".selector", selectorWrapper).html(selector);
      updateSelectCount(selectorWrapper);
      if ($.isFunction(settings.onloaded)) {
        settings.onloaded($('ul.list', selectorWrapper));
      }
    }
  };

  var buildWrapper = function(elem, settings) {
    var selectorWrapper = $('<div class="selectorwrapper">');
    selectorWrapper.append(createTabs());
    selectorWrapper.append('<div class="selector" />');
    if (settings.extras !== false) {
      var extra = $('<div class="extra">')
      if (settings.selectAllNone) {
        extra.append(createSelectAllNone());
      }
      if (settings.extras == 'before') {
        $('.filters', selectorWrapper).after(extra);
      } else {
        selectorWrapper.append(extra);
      }
    }
    selectorWrapper.data("target", elem);
    elem.selector = selectorWrapper;
    $(elem).after(selectorWrapper).hide();
    return selectorWrapper;
  };

  //create control tabs
  var createTabs = function(){
    return $('<div class="filters">' +
    '<ul class="selections clearfix"><li class="view_all view_on">' +
    'View All</li><li class="view_selected">' +
    'Selected (<strong class="view_selected_count">0</strong>)</li>' +
    '<li class="view_notselected">Not selected</li></ul>' +
    '</div>');
  };

  var createSelectAllNone = function(){
    return $('<a class="selectall">select all</a> | <a class="selectnone">unselect all</a>');
  };

  var createErrorMessage = function(wrapper) {
    $(".selector", wrapper).html($('<div class="error">Could not retrieve the remote data.</div>'));
    $(":input", wrapper.parents('form')).attr('disabled', 'disabled');
  };

  bindEvents();
  return this.each(function() {
    var elem = this;
    var settings = $.extend({
      extras: 'after',
      selectAllNone: true,
      selectItem: function(item) {
                    return $('<strong />').text(item.optionText);
                  },
      contentText: 'text',
      contentValue: 'value',
      onloaded: null
    }, options);

    // preparing wrapper and tabs...
    buildWrapper(elem, settings);

    if (settings.content!==undefined) {
      // loading content via ajax call
      $.ajax({
        elem: elem,
        settings: settings,
        url: settings.content,
        beforeSend: function(request) {
          $(".selector", this.elem.selector).html($('<div class="loading">Loading...</div>'));
        },
        error: function(request, error, exception) {
          createErrorMessage(this.elem.selector);
        },
        success: function(data, status, request) {
          if (data === null || data.size == 0) {
            createErrorMessage(this.elem.selector)
          } else {
            var selected_values = [];
            if ($(this.elem).attr('data-selected')) {
              var selected_values = $(this.elem).attr('data-selected').split(",");
            }
            $(data).each(function() {
              var option = $('<option value="'+this[settings.contentValue]+'">'+this[settings.contentText]+'</option>');
              option.attr('selected', (selected_values.indexOf(this[settings.contentValue].toString()) != -1));
              option.data(this);
              $(elem).append(option);
            });
            buildSelector(this.elem, this.settings, this.elem.selector);
          }
        },
        dataType: 'json'
      })
    } else {
      // ready to go...
      buildSelector(elem, settings, elem.selector);
    }
  });

}

$.fn.multipleSelect.bound = false;

})(jQuery);
