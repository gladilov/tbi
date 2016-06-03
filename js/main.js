(function($){

  var deviceReadyDeferred = $.Deferred(),
      jqmReadyDeferred = $.Deferred(),
      $pageLoader = $('.page-loader'),
      uid = 0,
      app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1,
      appVersion = '0.6.5';

  document.addEventListener('deviceready', deviceReady, false);
  if (!app) deviceReady();

  function deviceReady() {
    deviceReadyDeferred.resolve();
  }

  $(document).on('mobileinit', function() {
    $.support.cors = true;
    $.mobile.allowCrossDomainPages = true;
    
    $.mobile.hashListeningEnabled = false;/* temp */
    $.mobile.pushStateEnabled = false;/* temp */
    
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
      $(document).on('swipeleft swiperight', function(e) {
        // We check if there is no open panel on the page because otherwise
        // a swipe to close the left panel would also open the right panel (and v.v.).
        // We do this by checking the data that the framework stores on the page element (panel: open).
        if ($('.ui-page-active .left-panel').length) {
          if ($('.ui-page-active').jqmData('panel') !== 'open') {
            if (e.type === 'swiperight') {
              $('.ui-page-active .left-panel').panel('open');
            } else if (e.type === 'swipeleft') {
              $('.ui-page-active .left-panel').panel('close');
            }
          }
        }
      });
      // Panel open on clik button "#btn-other"
      $('#btn-other').on('click', function(e) {
        var $pageActive = $(this).parents('.ui-page-active');
        if ($pageActive.find('.left-panel').length) {
          console.log('left-panel exist');
          if ($('.ui-page-active').jqmData('panel') !== 'open') {
            if (e.type === 'swiperight') {
              $('.ui-page-active .left-panel').panel('open');
            } else if (e.type === 'swipeleft') {
              $('.ui-page-active .left-panel').panel('close');
            }
          }
        }
      });
      
      

      // App exit
      $('#app-exit').on('click', function(e) {
        e.preventDefault();
        
        if (app) {
          function appExitConfirm(buttonIndex) {
            if (buttonIndex == "1") navigator.app.exitApp();
          }

          navigator.notification.confirm(
            'Вы действительно хотите закрыть приложение?',
             appExitConfirm,
            'Выход из приложения',
            ['Выйти','Отмена']
          );
        }
        else {
          uid = 0;
          $(':mobile-pagecontainer').pagecontainer('change', '#signin-signup');
        }
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
      $('#signin-form').validate();
      $('#signin-form').submit(function(e){
        e.preventDefault();
        var $thisForm = $(this);
        
        if ($("#signin-form:has(input.required.error)").length == 0) {
          // Show splash
          $('.message', $pageLoader).text('Входим...');
          if (app) StatusBar.hide();
          $pageLoader.fadeIn(150);
          
          //TMP
          $pageLoader.fadeOut(150);
          $('.message', $pageLoader).empty();
          $(':mobile-pagecontainer').pagecontainer('change', '#idea-list');
          
          // Reset form
          $('.ui-input-text > input', $thisForm).removeClass('error');
          $('input[type="email"], input[type="password"]', $thisForm).val('');
          
          /*var request = $.ajax({
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
                
                $thisForm.find('.ui-input-text > input').removeClass('error');
                $(':mobile-pagecontainer').pagecontainer('change', '#idea-list');
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
          });*/
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
                
                $thisForm.find('.ui-input-text > input').removeClass('error');
                
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
      
      
      // Idea add form
      // Set current user id into form
      $('input[name="uid"]', $('#ideaadd-form')).val(uid);
      $('#ideaadd-form').validate();
      $('#ideaadd-form').submit(function(e){
        e.preventDefault();
        var $thisForm = $(this);
        
        if ($("#ideaadd-form:has(input.required.error)").length == 0) {
          // Show splash
          $('.message', $pageLoader).text('Добавляем...');
          if (app) StatusBar.hide();
          $pageLoader.fadeIn(150);
          
          var request = $.ajax({
            type: 'GET',
            dataType: 'jsonp',
            jsonpCallback: 'ideaAdd',
            contentType: "application/json; charset=utf-8",
            url: 'http://y-b-i.com/api/idea.php',
            data: {"method": "post", "data": $(this).serialize()},
            timeout: 8000,
            cache: false,
            async: true,
          });
          
          var state = request.state();
          
          request.done(function(data, textStatus, jqXHR) {
            // Success:
            if (data.status == 'success') {
              setTimeout(function() {
                // Reset form
                $('.ui-input-text > input, textarea, select', $thisForm).removeClass('error');
                $('.ui-input-text > .ui-input-clear', $thisForm).addClass('ui-input-clear-hidden');
                $('input[type="text"], textarea', $thisForm).val('');
                $('select', $thisForm).val('none');
                
                // Set current idea id
                $('input[name="iid"]', $('#ideastep1-form')).val(data.iid);
                $('#ideastep1-form').attr('data-iid', data.iid); // DEBUG
                
                // Hide splash
                $pageLoader.fadeOut(150);
                $('.message', $pageLoader).empty();
                if (app) StatusBar.show();
                
                // Goto idea-step-1
                $(':mobile-pagecontainer').pagecontainer('change', '#idea-step-1', {transition: 'slide'});
              }, 2000);
            }
            // Error:
            else if (data.status == 'error') {
              setTimeout(function() {
                // Hide splash
                $pageLoader.fadeOut(150);
                $('.message', $pageLoader).empty();
                if (app) StatusBar.show();
                  
                //$thisForm.find('.ui-input-text > input').addClass('error');

                if (app) {
                  navigator.notification.alert(
                    data.message,
                    null,
                    'Добавление идеи',
                    'Закрыть'
                  );
                }
                else {
                  console.log('Ошибка добавления идеи (data.message: "' + data.message + '")');
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
                    'Ошибка добавления идеи - сервер не ответил в отведенное время. Попробуйте выполнить запрос позже.',
                    null,
                    'Регистрация',
                    'Закрыть'
                  );
                }
                else {
                  console.log('Ошибка добавления идеи - сервер не ответил в отведенное время. Попробуйте выполнить запрос позже.');
                }
              }
              else {
                if (app) {
                  navigator.notification.alert(
                    'Ошибка добавления идеи. Попробуйте выполнить запрос повторно.',
                    null,
                    'Регистрация',
                    'Закрыть'
                  );
                }
                else {
                  console.log('Ошибка добавления идеи (textStatus: "' + textStatus + '").');
                }
              }
            }, 2000);
          });
        }
        
      });
      
      
      // Idea step-1 form
      // Set current user id into form
      $('input[name="uid"]', $('#ideastep1-form')).val(uid);
      $('#ideastep1-form').validate();
      $('#ideastep1-form').submit(function(e){
        e.preventDefault();
        var $thisForm = $(this);
        
        if ($("#ideastep1-form:has(input.required.error)").length == 0) {

          $(':mobile-pagecontainer').pagecontainer('change', '#ideastep2-form', {transition: 'slide'});
        }
      });
      
      
      // Idea step-2 form
      // Set current user id into form
      $('input[name="uid"]', $('#ideastep2-form')).val(uid);
      $('#ideastep2-form').validate();
      $('#ideastep2-form').submit(function(e){
        e.preventDefault();
        var $thisForm = $(this);
        
        if ($("#ideastep2-form:has(input.required.error)").length == 0) {

          $(':mobile-pagecontainer').pagecontainer('change', '#ideastep3-form', {transition: 'slide'});
        }
      });
      
      
      // Idea step-3 form
      // Set current user id into form
      $('input[name="uid"]', $('#ideastep3-form')).val(uid);
      $('#ideastep3-form').validate();
      $('#ideastep3-form').submit(function(e){
        e.preventDefault();
        var $thisForm = $(this);
        
        if ($("#ideastep3-form:has(input.required.error)").length == 0) {

          $(':mobile-pagecontainer').pagecontainer('change', '#ideastep4-form', {transition: 'slide'});
        }
      });
      
      
      // Idea step-4 form
      // Set current user id into form
      $('input[name="uid"]', $('#ideastep4-form')).val(uid);
      $('#ideastep4-form').validate();
      $('#ideastep4-form').submit(function(e){
        e.preventDefault();
        var $thisForm = $(this);
        
        if ($("#ideastep4-form:has(input.required.error)").length == 0) {

          $(':mobile-pagecontainer').pagecontainer('change', '#ideastep5-form', {transition: 'slide'});
        }
      });
      
      
      // Idea step-5 form
      // Set current user id into form
      $('input[name="uid"]', $('#ideastep5-form')).val(uid);
      $('#ideastep5-form').validate();
      $('#ideastep5-form').submit(function(e){
        e.preventDefault();
        var $thisForm = $(this);
        
        if ($("#ideastep5-form:has(input.required.error)").length == 0) {

          $(':mobile-pagecontainer').pagecontainer('change', '#idea-list', {transition: 'slide'});
        }
      });

    
    //});
  }
})(jQuery);