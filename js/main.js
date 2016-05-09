(function($){

  var deviceReadyDeferred = $.Deferred();
  var jqmReadyDeferred = $.Deferred();

  document.addEventListener('deviceready', deviceReady, false);
  //deviceReady();

  function deviceReady() {
    deviceReadyDeferred.resolve();
  }

  $(document).on('mobileinit', function() {
    $.support.cors = true;
    $.mobile.allowCrossDomainPages = true;
    
    jqmReadyDeferred.resolve();
  });

  //$.when(deviceReadyDeferred, jqmReadyDeferred).then(doWhenBothFrameworksLoaded);
  $.when(jqmReadyDeferred).then(doWhenBothFrameworksLoaded);

  function doWhenBothFrameworksLoaded() {
    // StatusBar
    /*StatusBar.overlaysWebView(false);
    if (cordova.platformId == 'android') {
      StatusBar.backgroundColorByHexString("#16635D");
    }*/
    
    
    /*$(document).on('pagecontainercreate', function(event, ui) {
      console.log('pagecontainercreate');
    });
    $(document).on('pagecontainerload', function(event, ui) {
      console.log('pagecontainerload');
    });
    $(document).one('pagecontainershow', function(event, ui) {
      console.log('pagecontainershow');
    });*/
    
    //$(document).on('pagecontainercreate', function(e) {
    //$(document).on('pagecreate', function(e) {
      
      // Panel swipe
      $(document).on('swipeleft swiperight', function( e ) {
        // We check if there is no open panel on the page because otherwise
        // a swipe to close the left panel would also open the right panel (and v.v.).
        // We do this by checking the data that the framework stores on the page element (panel: open).
        if ($('#left-panel').length) {
          if ( $( ".ui-page-active" ).jqmData( "panel" ) !== "open" ) {
            if ( e.type === "swiperight" ) {
              $( "#left-panel" ).panel( "open" );
            } else if ( e.type === "swipeleft" ) {
              $( "#left-panel" ).panel( "close" );
            }
          }
        }
      });
      
    
      // Form validate
      //$("form").validate();

      
      // Form-item multiple
      $('.form-item-multiple').on('click', 'a.form-item-add', function(e) {
          e.preventDefault();
          
          var fieldItem = $(this).parents('.form-item'),
              controlGroup = fieldItem.find('.controlgroup'),
              fieldNew = controlGroup.find('.ui-input-text:first-child').find('input').clone(),
              num = fieldItem.find('.multiple').length;
          
          fieldNew.attr({'id': fieldNew.attr('id') + '-' + (num + 1), 'name': fieldNew.attr('name') + '-' + (num + 1)}).val('');
          
          controlGroup.controlgroup('container').append(fieldNew);
          fieldNew.textinput();
          controlGroup.controlgroup('refresh');
      });
      
      
      // Signin form
      $('#signin-form').submit(function(e){
        e.preventDefault();
        
        //if ($("#signin-form:has(.required.error)").length == 0)
          $(':mobile-pagecontainer').pagecontainer('change', 'idea.html');
      });
      
      
      // Signup form
      $('#signup-form').submit(function(e){
        e.preventDefault();
        
        $.ajax({
          type: 'GET',
          dataType: 'jsonp',
          jsonpCallback: 'userCreate',
          contentType: "application/json; charset=utf-8",
          url: 'http://y-b-i.com/api/debug.php',
          //data: {"method": "post", "data": $(this).serialize()},
          data: {"method": "post", "data": "signup-form submit"},
          cache: false,
          async: true,
          crossDomain: true,
        })
        .done(function(data, textStatus, jqXHR) {
          //data = $.parseJSON(data);
          //console.log('done');
          //console.log(data);
          
          navigator.notification.alert(
            'Вы успешно зарегистрированы! Теперь Вы можете приступить к добавлению идей.',
            null,
            'Регистрация',
            'Закрыть'
          );
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
          /*data = $.parseJSON(jqXHR.responseText);
          console.log('fail');
          console.log(data);*/
          
          navigator.notification.alert(
            'Оштбка регистрации.',
            null,
            'Регистрация',
            'Закрыть'
          );
        });
      });

    
    //});
  }

  
})(jQuery);
