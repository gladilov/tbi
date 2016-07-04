(function($, App){

  var deviceReadyDeferred = $.Deferred(),
      jqmReadyDeferred = $.Deferred(),
      $pageLoader = $('.page-loader'),
      uid = 0,
      userAuthorized = false,
      app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1,
      appVersion = '0.7.2';

  // Namespace storage
  var ybi = $.initNamespaceStorage('ybi');

  document.addEventListener('deviceready', deviceReady, false);
  if (!app) deviceReady();

  function deviceReady() {
    deviceReadyDeferred.resolve();
    alert('deviceReady');
  }

  $(document).on('mobileinit', function() {
    $.support.cors = true;
    $.mobile.allowCrossDomainPages = true;
    $.mobile.autoInitializePage = true;
    
    //if (app && device.platform === "iOS") { $.mobile.hashListeningEnabled = false;/* temp */ }
    $.mobile.pushStateEnabled = false;/* temp */
    
    jqmReadyDeferred.resolve();
    alert('mobileinit');
  });

  $.when(deviceReadyDeferred, jqmReadyDeferred).then(doWhenBothFrameworksLoaded);

  function doWhenBothFrameworksLoaded() {
    // CSS Splash container
    $('#page-splash').fadeOut(500);
    
    // StatusBar
    if (app && StatusBar) {
      StatusBar.overlaysWebView(false);
      if (cordova.platformId == 'android') {
        StatusBar.backgroundColorByHexString("#16635D");
      }
    }

      
      // Signin form
      $('#signin-form').validate();
      $('#signin-form').submit(function(e){
        e.preventDefault();
        var $thisForm = $(this);
        
        if ($("#signin-form:has(input.required.error)").length == 0) {
          // Show splash
          $('.message', $pageLoader).text('Входим...');
          if (app) StatusBar.hide();
          $pageLoader.fadeIn(150);
          if (app) StatusBar.show();
          
          //TMP
          //$pageLoader.fadeOut(150);
          //$('.message', $pageLoader).empty();
          //$(':mobile-pagecontainer').pagecontainer('change', '#idea-list');
          
          // Reset form
          //$('.ui-input-text > input', $thisForm).removeClass('error');
          //$('input[type="email"], input[type="password"]', $thisForm).val('');
          
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
          
          request.done(function(data, textStatus, jqXHR) {
            // Success:
            if (data.status == 'success') {
              setTimeout(function() {
                // Hide splash
                $pageLoader.fadeOut(150);
                $('.message', $pageLoader).empty();
                if (app) StatusBar.show();
                
                ybi.localStorage.set('userAuthorized', true);
                ybi.localStorage.set('userAuthorizedUid', data.uid);
                userAuthorized = true;
                $('input[name="uid"]').val(uid);
                
                // Set var "uid"
                uid = data.uid;
                
                $(':mobile-pagecontainer').pagecontainer('change', '#idea-list');
                $thisForm.find('.ui-input-text > input').removeClass('error').val('');
              }, 2000);
            }
            // Error:
            else if (data.status == 'error') {
              setTimeout(function() {
                // Hide splash
                $pageLoader.fadeOut(150);
                $('.message', $pageLoader).empty();
                if (app) StatusBar.show();
                
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
              }, 2000);
            }
          });
          
          request.fail(function(jqXHR, textStatus, errorThrown) {
            setTimeout(function() {
              // Hide splash
              $pageLoader.fadeOut(150);
              $('.message', $pageLoader).empty();
              if (app) StatusBar.show();
              
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
            }, 2000);
          });
        }
      });
      
      
      // Signup form
      $('#signup-form').validate();
      $('#signup-form').submit(function(e){
        e.preventDefault();
        var $thisForm = $(this);
        
        if ($("#signup-form:has(input.required.error)").length == 0) {
          // Show splash
          $('.message', $pageLoader).text('Регистрируем...');
          if (app) StatusBar.hide();
          $pageLoader.fadeIn(150);
          
          var request = $.ajax({
            type: 'GET',
            dataType: 'jsonp',
            jsonpCallback: 'userCreate',
            contentType: "application/json; charset=utf-8",
            url: 'http://y-b-i.com/api/user.php',
            data: {"method": "post", "data": $(this).serialize()},
            timeout: 8000,
            cache: false,
            async: true,
            crossDomain: true,
          });
          
          var state = request.state();
          
          request.done(function(data, textStatus, jqXHR) {
            // Success:
            if (data.status == 'success') {
              setTimeout(function() {
                // Hide splash
                $pageLoader.fadeOut(150);
                $('.message', $pageLoader).empty();
                if (app) StatusBar.show();
                
                ybi.localStorage.set('userAuthorized', true);
                ybi.localStorage.set('userAuthorizedUid', data.uid);
                userAuthorized = true;
                $('input[name="uid"]').val(uid);
                
                // Set var "uid"
                uid = data.uid;

                if (app) {
                  navigator.notification.alert(
                    data.message,
                    //function () { $(':mobile-pagecontainer').pagecontainer('change', 'idea.html', {reloadPage: true}); },
                    function () { $.mobile.pageContainer.pagecontainer("change", '#idea-list'); },
                    'Регистрация',
                    'Закрыть'
                  );
                }
                else {
                  //$(':mobile-pagecontainer').pagecontainer('change', 'idea.html', {reloadPage: true});
                  $.mobile.pageContainer.pagecontainer("change", '#idea-list');
                }
                
                $thisForm.find('.ui-input-text > input').removeClass('error').val('');
              }, 2000);
            }
            // Error:
            else if (data.status == 'error') {
              setTimeout(function() {
                // Hide splash
                $pageLoader.fadeOut(150);
                $('.message', $pageLoader).empty();
                if (app) StatusBar.show();
                  
                $thisForm.find('.ui-input-text > input').addClass('error');

                if (app) {
                  navigator.notification.alert(
                    data.message,
                    null,
                    'Регистрация',
                    'Закрыть'
                  );
                }
                else {
                  console.log('Ошибка регистрации (data.message: "' + data.message + '")');
                }
              }, 2000);
            }
          });
          
          request.fail(function(jqXHR, textStatus, errorThrown) {
            setTimeout(function() {
              // Hide splash
              $pageLoader.fadeOut(150);
              $('.message', $pageLoader).empty();
              if (app) StatusBar.show();
              
              if (textStatus == 'timeout') {
                if (app) {
                  navigator.notification.alert(
                    'Ошибка регистрации - сервер не ответил в отведенное время. Попробуйте выполнить запрос позже.',
                    null,
                    'Регистрация',
                    'Закрыть'
                  );
                }
                else {
                  console.log('Ошибка регистрации - сервер не ответил в отведенное время. Попробуйте выполнить запрос позже.');
                }
              }
              else {
                if (app) {
                  navigator.notification.alert(
                    'Ошибка регистрации. Попробуйте выполнить запрос повторно.',
                    null,
                    'Регистрация',
                    'Закрыть'
                  );
                }
                else {
                  console.log('Ошибка регистрации (textStatus: "' + textStatus + '").');
                }
              }
            }, 2000);
          });
        }
      });
      
      
      // Forgot password form
      $('#forgot-password-form').validate();
      $('#forgot-password-form').submit(function(e){
        e.preventDefault();
        var $thisForm = $(this);
        
        if ($("#forgot-password-form:has(input.required.error)").length == 0) {
          $thisForm.parents('#popup-forgot-password').find('.ui-icon-ybi-cancel').trigger('click');
          
          if (app) {
            setTimeout(function() { 
              //window.plugins.toast.showLongBottom('Пароль отправлен Вам на почту.', function(a){}, function(b){});
            }, 750);
          }
          else {
            setTimeout(function() { alert('Пароль отправлен Вам на почту.'); }, 750);
          }
        }
      });

  }
  
})(jQuery, window.App = window.App || Object.create({}));