
$(function() {

  $( document ).bind( "mobileinit", function() {
    $.mobile.allowCrossDomainPages = true;
  });

	$('.tabs__caption').on('click', 'li:not(.tabs__content_active)', function() {
		$(this).addClass('tabs__item_active')
				.siblings()
				.removeClass('tabs__item_active')
				.closest('.tabs')
				.find('.tabs__content')
				.removeClass('tabs__content_active')
				.eq( $(this).index() ).addClass('tabs__content_active');
	});
  
  $('#signin form').submit(function(e){
    e.preventDefault();
    //return false;
    
    //$.mobile.changePage("idea.html");
    $(':mobile-pagecontainer').pagecontainer('change', 'idea.html');
  });
  
  
  // Idea list
  $('#idea-list #accordion').on('click', '.accordion-toggle', function() {
    //Expand or collapse this panel
    $(this).next().slideToggle('fast');
    $(this).toggleClass('opened');
  });
  
  
  // Idea add
  $('#idea-add form').on('change', '.checkempty', function() {
      if ($(this).val()) {
        $(this).next().css('z-index', '999');
      } else {
        $(this).next().css('z-index', '-10');
      }
  });
  
  
  // Idea make
  if ($('#idea-make').length) {
    $('#spros').slider({
      value : 0,
      min : 0,
      max : 10,
      step : 1,
      slide: function( event, ui ) {
        if(ui.value>0){
        $("#spros span.ui-slider-handle").html("<p>"+ui.value+"</p>").addClass("notemptyslider")}else {$("#spros span.ui-slider-handle" ).html('').removeClass("notemptyslider")}
        if(ui.value == 10){
        $("#spros span.ui-slider-handle p").css({"left":"0px"})}else {$("#spros span.ui-slider-handle p").css({"left":"10px"})}
      }
    });

    $('#success').slider({
      value : 0,
      min : 0,
      max : 10,
      step : 1,
      slide: function( event, ui ) {
        if(ui.value>0){
        $("#success span.ui-slider-handle").html("<p>"+ui.value+"</p>").addClass("notemptyslider")}else {$("#success span.ui-slider-handle" ).html('').removeClass("notemptyslider")}
        if(ui.value == 10){
        $("#success span.ui-slider-handle p").css({"left":"0px"})}else {$("#success span.ui-slider-handle p").css({"left":"10px"})}
      }
    });

    $('#profit').slider({
      value : 0,
      min : 0,
      max : 10,
      step : 1,
      slide: function( event, ui ) {
        if(ui.value>0){
        $("#profit span.ui-slider-handle").html("<p>"+ui.value+"</p>").addClass("notemptyslider")}else {$("#profit span.ui-slider-handle" ).html('').removeClass("notemptyslider")}
        if(ui.value == 10){
        $("#profit span.ui-slider-handle p").css({"left":"0px"})}else {$("#profit span.ui-slider-handle p").css({"left":"10px"})}
      }
    });
  }
  
  
});
