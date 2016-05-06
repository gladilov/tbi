(function($){

  var deviceReadyDeferred = $.Deferred();
  var jqmReadyDeferred = $.Deferred();
  
  // are we running in native app or in a browser?
  window.isphone = false;
  if (document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1) {
    window.isphone = true;
  }

  if (window.isphone) {
    document.addEventListener('deviceready', deviceReady, false);
  } else {
    deviceReady();
  }

  function deviceReady() {
    deviceReadyDeferred.resolve();
  }

  $(document).on('mobileinit', function() {
    $.support.cors = true;
    $.mobile.allowCrossDomainPages = true;
    
    jqmReadyDeferred.resolve();
  });

  $.when(deviceReadyDeferred, jqmReadyDeferred).then(doWhenBothFrameworksLoaded);

  function doWhenBothFrameworksLoaded() {
    // StatusBar
    if (window.isphone) {
      StatusBar.overlaysWebView(false);
      if (cordova.platformId == 'android') {
          StatusBar.backgroundColorByHexString("#16635D");
      }
    }
    
    
    // Panel swipe
    if ($('#left-panel').length) {
      $(document).on('swipeleft swiperight', function( e ) {
        // We check if there is no open panel on the page because otherwise
        // a swipe to close the left panel would also open the right panel (and v.v.).
        // We do this by checking the data that the framework stores on the page element (panel: open).
        if ( $( ".ui-page-active" ).jqmData( "panel" ) !== "open" ) {
          if ( e.type === "swiperight" ) {
            $( "#left-panel" ).panel( "open" );
          } else if ( e.type === "swipeleft" ) {
            $( "#left-panel" ).panel( "close" );
          }
        }
      });
    }
    
  
    // Form validate
    $("form").validate();
    
  
    // Tabs 
    $('.tabs__caption').on('click', 'li:not(.tabs__content_active)', function() {
      $(this).addClass('tabs__item_active')
          .siblings()
          .removeClass('tabs__item_active')
          .closest('.tabs')
          .find('.tabs__content')
          .removeClass('tabs__content_active')
          .eq( $(this).index() ).addClass('tabs__content_active');
    });
    
    
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
      
      if ($("#signin-form:has(.required.error)").length == 0)
        $(':mobile-pagecontainer').pagecontainer('change', 'idea.html');
    });
    
    
    // Signup form
    $('#signup-form').submit(function(e){
      e.preventDefault();
      
      if ($("#signup-form:has(.required.error)").length == 0) {
        $.ajax({
          type: 'GET',
          dataType: 'jsonp',
          jsonpCallback: 'userCreate',
          contentType: "application/json; charset=utf-8",
          url: 'http://y-b-i.com/api/debug.php',
          data: {"method": "post", "data": $(this).serialize()},
          cache: false,
          async: true,
          crossDomain: true,
        })
        .done(function(data, textStatus, jqXHR) {
            data = $.parseJSON(data);
            console.log('done');
            console.log(data);
            
            navigator.notification.alert(
              'Вы успешно зарегистрированы! Теперь Вы можете приступить к добавлению идей.',
              alertCallback,
              'Регистрация',
              'Закрыть'
            );

            /*$.mobile.loading('show');
            
            if (data.uid && data.uid != 0) {
              var div = $('<div/>', {
                'data-uid': data.uid
              }).appendTo('body');
              
              console.log("Вы успешно зарегистрированы.");
              // Notification
              function alertCallback() {
                $(':mobile-pagecontainer').pagecontainer('change', 'idea.html');
              }

              navigator.notification.alert(
                'Вы успешно зарегистрированы! Теперь Вы можете приступить к добавлению идей.',
                alertCallback,
                'Регистрация',
                'Закрыть'
              );
            }

            $.mobile.loading('hide');*/
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
          data = $.parseJSON(jqXHR.responseText);
          console.log('fail');
          console.log(data);
        });
      }
    });
    
    
    // Idea add form
    $('#ideaaddform').submit(function(e){
      e.preventDefault();

      /*$.ajax({
        type: "POST",
        url: "http://y-b-i.com/api/idea.php",
        data: $(this).serialize(),
        cache: false,
        async: 'true',
      })
      .done(function(data, textStatus, jqXHR) {
          console.log(jqXHR.responseText);
          
          $.mobile.loading('show');
          
          data = $.parseJSON(data);
          
          if (data.iid && data.iid != 0) {
            console.log("Идея сохранена.");
            
            var div = $('<div/>', {
              'data-iid': data.iid
            }).appendTo('body');
            
            $(':mobile-pagecontainer').pagecontainer('change', 'ideastep-1.html');
          }

          $.mobile.loading('hide');
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR.responseText);
      });*/
    });
    
    
    // Idea step 1
    $('#ideastep1form').submit(function(e){
      e.preventDefault();
      $(':mobile-pagecontainer').pagecontainer('change', 'ideastep-2.html');
    });
    
    
    // Idea step 2
    $('#ideastep2form').submit(function(e){
      e.preventDefault();
      $(':mobile-pagecontainer').pagecontainer('change', 'ideastep-3.html');
    });
  }

  
})(jQuery);
