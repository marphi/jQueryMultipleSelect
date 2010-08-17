(function($) {
$.fn.fcbkListSelection = function(options){

  settings = $.extend({
     width: "400",
     height: '50',
     columns: 2
  }, options);

  var updateSelectCount = function(wrapper) {
    $('.filters .view_selected_count', wrapper).text($('ul.list li.selected', wrapper).size());
  };

  var bindEvents = function(){
    eventsBound = $.fn.fcbkListSelection.bound;
    if (!eventsBound) {
      $.fn.fcbkListSelection.bound = true;
      $(".fcbklistwrapper ul.list li").live("click", function(){
        console.log("click")
        $(this).toggleClass('selected');
        $(this).toggleClass('notselected');
        var select_list = $(this).parents('.fcbklistwrapper').data("target");
        $('option[value='+ $(this).data('value') +']', select_list).attr('selected', $(this).is('.selected'));
        updateSelectCount($(this).parents('.fcbklistwrapper'));
      })
      $(".fcbklistwrapper ul.selections li").live("click", function(){
        $(this).siblings().removeClass("view_on");
        // doing silter here, as the class attribute will only be the true class
        filterSelect($(this).parents(".fcbklistwrapper"), $(this).attr('class').replace("view_", ""));
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

  var buildSelector = function(elem, width, height, columns){
    if (elem.is("select")) {
      var selectorWrapper = $('<div class="fcbklistwrapper">');
      var selector = $('<ul class="list" />');
      var itemWidth = Math.ceil((parseInt(width, 10)) / parseInt(columns, 10)) - 11;
      $('option', elem).each(function() {
        var item = $('<div class="fcbklist_item" /></div>');

        item.css("height", height + "px");
        item.css("width", itemWidth + "px");

        item.append($('<strong />').text($(this).html()));
        item.append($('<div class="radical">⎷</div>'));
        item = $("<li />").html(item);
        if (!$(this).is(':selected')) {
          item.addClass('notselected');
        } else {
          item.addClass('selected');
        }
        item.data("value", $(this).val());
        selector.append(item);
      })
      selectorWrapper.append(createTabs(width));
      selectorWrapper.append(selector);
      selectorWrapper.width((parseInt(width, 10) + 2));
      selectorWrapper.data("target", elem);
      updateSelectCount(selectorWrapper);
      elem.fcbkSelector = selectorWrapper;
      $(elem).after(selectorWrapper).hide();
    }
  }

  //create control tabs
  var createTabs = function(width){
    return $('<div class="filters">' +
    '<ul class="selections"><li class="view_all view_on">' +
    'View All</li><li class="view_selected">' +
    'Selected (<strong class="view_selected_count">0</strong>)</li>' +
    '<li class="view_notselected">Not selected</li></ul>' +
    '</div>');
  }

  bindEvents();
  return this.each(function() {

    var elem = this;

    if (typeof(elem) != 'object')
        elem = $(elem);

    if (settings.content!==undefined) {
      $.ajax({
        elem: elem,
        settings: settings,
        url: settings.content,
        data: {},
        success: function(data, status, request) {
          elem = this.elem;
          settings = this.settings;
          $(data).each(function() {
            $(elem).append($('<option value="'+this.value+'">'+this.name+'</option>'));
          });
          buildSelector($(elem), settings.width, settings.height, settings.columns);
        },
        dataType: 'json'
      })
    } else {
      buildSelector($(elem), settings.width, settings.height, settings.columns);
    }
  });

}

$.fn.fcbkListSelection.bound = false;

})(jQuery);
