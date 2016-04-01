document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
  console.log("console.log works well");
  
  
  // Push notification
  window.plugins.OneSignal.setLogLevel({logLevel: 4, visualLevel: 4}); // Enable to debug issues.
  var notificationOpenedCallback = function(jsonData) { console.log('didReceiveRemoteNotificationCallBack: ' + JSON.stringify(jsonData)); };
  window.plugins.OneSignal.init("8393b4dd-37e7-4d54-a768-8e0b70d83a21", {googleProjectNumber: "910799127757"}, notificationOpenedCallback);
  // Show an alert box if a notification comes in when the user is in your app.
  window.plugins.OneSignal.enableInAppAlertNotification(true);
  
  // Status bar style
  StatusBar.backgroundColorByHexString("#212121");
  if (device.platform === 'iOS' && parseFloat(device.version) >= 7.0) {
    StatusBar.overlaysWebView(false);
  }
}

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
  
  // Facebook connect
  /*$('a.fblogin').on('click', function(e){
    var fbLoginSuccess = function (userData) {
      console.log("UserInfo: ");
      console.log(userData);
    }

    facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess,
      function loginError (error) {
        console.error(error)
      }
    );
  });
  $('a.fblogout').on('click', function(e){
    facebookConnectPlugin.logout(
      function(data){
        console.log(data);
      },
      function(error){
        console.error(error);
      }
    );
  });*/
  
  $('#signin form').submit(function(e){
    e.preventDefault();
    //return false;
    
    //$.mobile.changePage("idea.html");
    $(':mobile-pagecontainer').pagecontainer('change', 'idea.html');
  });
  
  
  // Idea list
  $('#accordion .accordion-toggle').on('click', function() {
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
