(function($){

  var deviceReadyDeferred = $.Deferred(),
      jqmReadyDeferred = $.Deferred(),
      $pageLoader = $('.page-loader'),
      app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1,
      appVersion = '0.6.3';

  document.addEventListener('deviceready', deviceReady, false);
  if (!app) deviceReady();

  function deviceReady() {
    deviceReadyDeferred.resolve();
    
    if (app) {
      console.log(device);
      navigator.notification.alert(
        'Test notification',
        null,
        'Test',
        'Закрыть'
      );
    }
  }

  $(document).on('mobileinit', function() {
    $.support.cors = true;
    $.mobile.allowCrossDomainPages = true;
    
    jqmReadyDeferred.resolve();
  });

  $.when(deviceReadyDeferred, jqmReadyDeferred).then(doWhenBothFrameworksLoaded);

  function doWhenBothFrameworksLoaded() {
    // StatusBar
    if (app && StatusBar) {
      StatusBar.overlaysWebView(false);
      if (cordova.platformId == 'android') {
        StatusBar.backgroundColorByHexString("#16635D");
      }
    }

    // App version
    $(document).on('pagecontainershow', function(event, ui) {
      $('.app-version .value').html(appVersion);
    });
    
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
      $('form').validate();

      
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
      $('#signin-form').validate();
      $('#signin-form').submit(function(e){
        e.preventDefault();
        var $thisForm = $(this);
        
        if ($("#signin-form:has(input.required.error)").length == 0) {
          $pageLoader.find().show();
          $('.message', $pageLoader).text('Входим...');
          $pageLoader.fadeIn(150);
          
          var request = $.ajax({
            type: 'GET',
            dataType: 'jsonp',
            jsonpCallback: 'userCheck',
            contentType: "application/json; charset=utf-8",
            url: 'http://y-b-i.com/api/user.php',
            data: {'method': 'get', 'data': $(this).serialize()},
            timeout: 8000,
            cache: false,
            async: true,
            crossDomain: true,
          });
          
          var state = request.state();
          console.log(state);
          
          request.done(function(data, textStatus, jqXHR) {
            // Success:
            if (data.status == 'success') {
              setTimeout(function() {
                  $pageLoader.fadeOut(150);
                  $('.message', $pageLoader).empty();
                  
                  $thisForm.find('.ui-input-text > input').removeClass('error');
                  $(':mobile-pagecontainer').pagecontainer('change', 'idea.html');
                }, 2000
              );
            }
            // Error:
            else if (data.status == 'error') {
              setTimeout(function() {
                  $pageLoader.fadeOut(150);
                  $('.message', $pageLoader).empty();
                  
                  $thisForm.find('.ui-input-text > input').addClass('error');

                  if (app) {
                    navigator.notification.alert(
                      data.message,
                      null,
                      'Авторизация',
                      'Закрыть'
                    );
                  }
                  else {
                    console.log('Ошибка авторизации (data.message: "' + data.message + '")');
                  }
                }, 2000
              );
            }
          });
          
          request.fail(function(jqXHR, textStatus, errorThrown) {
            setTimeout(function() {
                $pageLoader.hide();
                
                if (textStatus == 'timeout') {
                  if (app) {
                    navigator.notification.alert(
                      'Ошибка авторизации - сервер не ответил в отведенное время. Попробуйте выполнить запрос позже.',
                      null,
                      'Авторизация',
                      'Закрыть'
                    );
                  }
                  else {
                    console.log('Ошибка авторизации - сервер не ответил в отведенное время. Попробуйте выполнить запрос позже.');
                  }
                }
                else {
                  if (app) {
                    navigator.notification.alert(
                      'Ошибка авторизации.',
                      null,
                      'Авторизация',
                      'Закрыть'
                    );
                  }
                  else {
                    console.log('Ошибка авторизации (textStatus: "' + textStatus + '").');
                  }
                }
              }, 2000
            );
          });
        }
      });
      
      
      // Signup form
      $('#signup-form').validate();
      $('#signup-form').submit(function(e){
        e.preventDefault();
        var $thisForm = $(this);
        
        if ($("#signup-form:has(input.required.error)").length == 0) {
          $.ajax({
            type: 'GET',
            dataType: 'jsonp',
            jsonpCallback: 'userCreate',
            contentType: "application/json; charset=utf-8",
            url: 'http://y-b-i.com/api/user.php',
            data: {"method": "post", "data": $(this).serialize()},
            cache: false,
            async: true,
            crossDomain: true,
          })
          .done(function(data, textStatus, jqXHR) {
            console.log('done');
            console.log(data);
            
            // Success:
            if (data.status == 'success') {
              $thisForm.find('.ui-input-text > input').removeClass('error');
              
              navigator.notification.alert(
                data.message,
                function () { $(':mobile-pagecontainer').pagecontainer('change', 'idea.html'); },
                'Регистрация',
                'Закрыть'
              );
            }
            // Error:
            else if (data.status == 'error') {
              $thisForm.find('.ui-input-text > input').addClass('error');

              navigator.notification.alert(
                data.message,
                null,
                'Регистрация',
                'Закрыть'
              );
            }
          })
          .fail(function(jqXHR, textStatus, errorThrown) {
            navigator.notification.alert(
              'Ошибка регистрации.',
              null,
              'Регистрация',
              'Закрыть'
            );
          });
        }
      });

    
    //});
  }
})(jQuery);