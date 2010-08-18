(function($) {
$.fn.multipleSelect = function(options){

  var updateSelectCount = function(wrapper) {
    $('.filters .view_selected_count', wrapper).text($('ul.list li.selected', wrapper).size());
  };

  var bindEvents = function(){
    eventsBound = $.fn.multipleSelect.bound;
    if (!eventsBound) {
      $.fn.multipleSelect.bound = true;
      $(".selectorwrapper ul.list li").live("click", function(){
        console.log("click")
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
      })
    }
  };

  var filterSelect = function(wrapper, filter){
    wrapper.removeClass('all');
    wrapper.removeClass('selected');
    wrapper.removeClass('notselected');
    wrapper.addClass(filter);
  };

  var buildSelector = function(elem, wrapper){
    if ($(elem).is("select")) {
      var selectorWrapper = wrapper;
      if (wrapper === null || wrapper === undefined) {
        selectorWrapper = buildWrapper(elem, width, height, columns);
      }
      var selector = $('<ul class="list" />');
      // var itemWidth = Math.ceil((parseInt(width, 10)) / parseInt(columns, 10)) - 11;
      $('option', elem).each(function() {
        var item = buildSelectItem($(this))
        item = $("<li />").html(item);
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
    }
  };
  
  var buildSelectItem = function(item) {
    var selectItem = $('<div class="selector_item" /></div>');
    selectItem.append($('<strong />').text(item.html()));
    selectItem.append($('<div class="radical">⎷</div>'));
    return selectItem;
  };
  
  var buildWrapper = function(elem) {
    var selectorWrapper = $('<div class="selectorwrapper">');
    selectorWrapper.append(createTabs());
    selectorWrapper.append('<div class="selector">');
    selectorWrapper.data("target", elem);
    elem.selector = selectorWrapper;
    $(elem).after(selectorWrapper).hide();
    return selectorWrapper;
  };

  //create control tabs
  var createTabs = function(){
    return $('<div class="filters">' +
    '<ul class="selections"><li class="view_all view_on">' +
    'View All</li><li class="view_selected">' +
    'Selected (<strong class="view_selected_count">0</strong>)</li>' +
    '<li class="view_notselected">Not selected</li></ul>' +
    '</div>');
  };

  var createErrorMessage = function(wrapper) {
    $(".selector", wrapper).html($('<div class="error">Could not retrieve the remote data.</div>'));
    $(":input", wrapper.parents('form')).attr('disabled', 'disabled');
  };

  bindEvents();
  return this.each(function() {
    var elem = this;
    var settings = $.extend({}, options);
    
    // preparing wrapper and tabs... 
    buildWrapper(elem, settings.width, settings.height, settings.columns);
    
    if (settings.content!==undefined) {
      // loading content via ajax call
      $.ajax({
        elem: elem,
        settings: settings,
        url: settings.content,
        beforeSend: function(request) {
          $(".selector", elem.selector).html($('<div class="loading">Loading...</div>'))
        },
        error: function(request, error, exception) {
          createErrorMessage(elem.selector)
        },
        success: function(data, status, request) {
          if (data === null || data.size == 0) {
            createErrorMessage(elem.selector)
          } else {
            elem = this.elem;
            var selected_values = [];
            if ($(this.elem).attr('data-selected')) {
              var selected_values = $(this.elem).attr('data-selected').split(",");
            }
            var settings = this.settings;
            $(data).each(function() {
              var option = $('<option value="'+this.value+'">'+this.name+'</option>');
              option.attr('selected', (selected_values.indexOf(this.value.toString()) != -1));
              $(elem).append(option);
            });
            buildSelector(elem, elem.selector);
          }
        },
        dataType: 'json'
      })
    } else {
      // ready to go... 
      buildSelector(elem, elem.selector);
    }
  });

}

$.fn.multipleSelect.bound = false;

})(jQuery);
