(function($, App){

  var deviceReadyDeferred = $.Deferred(),
      jqmReadyDeferred = $.Deferred(),
      storage = $.localStorage,
      $pageLoader = $('.page-loader'),
      uid = 0,
      app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1,
      appVersion = '0.7.0';

  // Namespace storage
  ybi = $.initNamespaceStorage('ybi');
      
  document.addEventListener('deviceready', deviceReady, false);
  if (!app) deviceReady();

  function deviceReady() {
    deviceReadyDeferred.resolve();
  }

  $(document).on('mobileinit', function() {
    $.support.cors = true;
    $.mobile.allowCrossDomainPages = true;
    
    if (device.platform === "iOS") { $.mobile.hashListeningEnabled = false;/* temp */ }
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
    

    // If user is authorized - change page to Idea list (without login form)
    $('#signin-signup').on('pagecreate', function(event, ui) {
      if (ybi.localStorage.isSet('userAuthorized')) {
        var userAuthorized = ybi.localStorage.get('userAuthorized');
        if (userAuthorized == true) { $(':mobile-pagecontainer').pagecontainer('change', '#idea-list'); }
      }
    });
    
    
    // Idea share
    $(document).on('click', 'a.idea-share', function(e){
      var $activePage = $('.ui-page-active');
      
      if ($activePage.is('#idea-single')) {
        var ideaTitle = $activePage.find('#page-title').text();
        
        // this is the complete list of currently supported params you can pass to the plugin (all optional)
        var options = {
          message: 'Бизнес идея "' + ideaTitle + '"', // not supported on some apps (Facebook, Instagram)
          subject: 'Бизнес идея "' + ideaTitle + '"', // fi. for email
          files: ['', ''], // an array of filenames either locally or remotely
          url: 'http://www.y-b-i.com',
          chooserTitle: 'Поделиться' // Android only, you can override the default share sheet title
        }

        var onSuccess = function(result) {
          console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
          console.log("Shared to app: " + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
        }

        var onError = function(msg) {
          console.log("Sharing failed with message: " + msg);
        }

        window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
      }
    });
      
    
    // When you load each page
    $(document).on('pagecontainershow', function(event, ui) {
      // App version
      $('.app-version .value').html(appVersion);
      

    
    
      // Device back button
      var $page = $(':mobile-pagecontainer').pagecontainer('getActivePage')[0].id;
      console.log($page);
      //if ($page.is('#signin-signup')) console.log('1');
      //else console.log('0');
      //console.log($(document).pagecontainer( "getActivePage" ));
      document.addEventListener('backbutton', function(e){
        alert('backbutton');
        e.preventDefault();
        navigator.app.backHistory();
        //window.history.back();
        //history.go(0);
      });

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
      $(document).on('click', '#btn-other', function(e){
        $(document).trigger('swipeleft');
        /*var $pageActive = $(this).parents('.ui-page-active');
        if ($pageActive.find('.left-panel').length) {
          console.log('left-panel exist');
          if ($('.ui-page-active').jqmData('panel') !== 'open') {
            if (e.type === 'swiperight') {
              $('.ui-page-active .left-panel').panel('open');
            } else if (e.type === 'swipeleft') {
              $('.ui-page-active .left-panel').panel('close');
            }
          }
        }*/
      });
      
      
      // App exit
      $(document).on('click', '#app-exit', function(e){
        e.preventDefault();
        
        if (app) {
          function appExitConfirm(buttonIndex) {
            if (buttonIndex == 1) navigator.app.exitApp();
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
                //$(':mobile-pagecontainer').pagecontainer('change', '#idea-step-1', {transition: 'slide'});
                $(':mobile-pagecontainer').pagecontainer('change', '#idea-single', {transition: 'slide'}); // TEMP
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
      var $step1Form = $('#ideastep1-form');
      // Set current user id into form
      $('input[name="uid"]', $step1Form).val(uid);
      $step1Form.validate();
      $step1Form.submit(function(e){
        e.preventDefault();
        var $thisForm = $(this);
        
        if ($('#ideastep1-form:has(input.required.error)').length == 0) {
          $(':mobile-pagecontainer').pagecontainer('change', '#idea-step-2', {transition: 'slide'});
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
          $(':mobile-pagecontainer').pagecontainer('change', '#idea-step-3', {transition: 'slide'});
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
          $(':mobile-pagecontainer').pagecontainer('change', '#idea-step-4', {transition: 'slide'});
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
          $(':mobile-pagecontainer').pagecontainer('change', '#idea-step-5', {transition: 'slide'});
        }
      });
      
      
      // Idea step-5 form
      // Set current user id into form
      $('input[name="uid"]', $('#ideastep5-form')).val(uid);
      $('#ideastep5-form').validate();
      $('#ideastep5-form').submit(function(e){
        e.preventDefault();
        var $thisForm = $(this),
            iid = $thisForm.find('input[name="iid"]').val();
        
        $('#idea-single').data('iid', iid);
        
        if ($("#ideastep5-form:has(input.required.error)").length == 0) {
          $(':mobile-pagecontainer').pagecontainer('change', '#idea-single', {transition: 'slide'});
        }
      });
      
      
      /* 
       * СПИСОК ИДЕЙ - загрузка из бд и отображение списка по группам при открытии раздела "Идеи"
       *
       * TODO: Отображение ошибок при загрузке данных
       *       Кэш данных
       *       При пустом списке кнопка по-центру "Добавьте Вашу первую идею"
       */
      $('#idea-list').on('pagebeforeshow', function(event) {
        var $ideaListContainer = $('#idea-list-accordion', $(this)),
            ideaGroupStatusTitles = {1:'Проверяю', 2:'Реализую', 3:'Архив'},
            returnData = [];
      
        $ideaListContainer.empty();
      
        var request = $.ajax({
          type: 'GET',
          dataType: 'jsonp',
          jsonpCallback: 'ideasByUser',
          contentType: "application/json; charset=utf-8",
          url: 'http://y-b-i.com/api/idea.php',
          data: {'method': 'get', 'data': {'uid': uid}},
          timeout: 8000,
          cache: false,
          async: true,
        });
        request.done(function(data, textStatus, jqXHR) {
          console.log(data);
          if (data.status == 'success') {
            $.each(data.items, function(groupStatus, ideaItems){
              // Insert idea status group
              var $ideaStatusGroupHTML = $(tpl.ideaStatusGroupHTML( {'status': groupStatus, 'title': ideaGroupStatusTitles[groupStatus], 'count': ideaItems.length} ));
              $ideaListContainer.append($ideaStatusGroupHTML);
              $ideaListContainer.collapsibleset('refresh');
              
              // Insert idea items into status group
              var $ideaTplContainer = $('.idea-item-tpl-container', $ideaStatusGroupHTML);
              $.each(ideaItems, function(index, item){
                var $ideaItemHTML = $(tpl.ideaItemHTML(item));
                if (item.step_complete > 0) {
                  var $currentProgres = $ideaItemHTML.find('.progress li').eq(parseInt(item.step_complete) - 1);
                  $currentProgres.addClass('completed').prevAll().addClass('completed');
                }
                $ideaTplContainer.append($ideaItemHTML);
              });
              
            });
          }
          //else if (data.status == 'error') {}
        });
        //request.fail(function(jqXHR, textStatus, errorThrown) {});
      });
      
      
      /* 
       * Переход по ссылке на страницу идеи
       */
      //$(document).on('click', '.idea-link', function(e){
      $(document).on('click', 'a[data-iid]', function(e){
        var hash = $(this).attr('href'),
            iid = $(this).data('iid');
            
        if ($(this).is('.idea-step-edit')) $('.idea-step-page').find('input[name="iid"]').val(iid);
            
        $(hash).data('iid', iid);
      });
      
      
      /* 
       * СТРАНИЦА ОДНОЙ ИДЕЙ - загрузка из бд и отображение всех данных на странице идеи
       *
       * TODO: Отображение ошибок при загрузке данных
       *       Кэш данных
       */
      $('#idea-single').on('pagebeforeshow', function(event) {
        var $this = $(this),
            iid = $this.data('iid'),
            $pageTitle = $('#page-title', $this),
            $ideaSingleContainer = $('#idea-single-accordion', $this),
            $groupContainer = $ideaSingleContainer.children();

        console.log(iid);
        
        // Очистка старых данных
        //$pageTitle.html('Заголовок идеи');
        //$ideaSingleContainer.find(' > .desc p').empty();
        
        var request = $.ajax({
          type: 'GET',
          dataType: 'jsonp',
          jsonpCallback: 'ideasById',
          contentType: "application/json; charset=utf-8",
          url: 'http://y-b-i.com/api/idea.php',
          data: {'method': 'get', 'data': {'iid': iid}},
          timeout: 8000,
          cache: false,
          async: true,
        });
        request.done(function(data, textStatus, jqXHR) {
          console.log(data);
          var item = data.item;
          
          if (data.status == 'success') {
            // Title
            $pageTitle.html(item.title);
            // Description
            $ideaSingleContainer.find(' > .desc p').html(item.description);
            // Product
            $ideaSingleContainer.find(' > .product p').html(item.product);
            // Competitive advantages
            $ideaSingleContainer.find(' > .competitive-advantages p').html(item.competitive_advantages);
            // Necessary resources
            $ideaSingleContainer.find(' > .necessary-resources p').html(item.necessary_resources);
            // Helpful people
            $ideaSingleContainer.find(' > .helpful-people p').html(item.helpful_people);
            // Key hypotheses
            $ideaSingleContainer.find(' > .key-hypotheses p').html(item.key_hypotheses);
            
            // Steps group
            var $stepProgress = $('.steps .progress', $ideaSingleContainer)
                $itemsProgress = $stepProgress.children('li'),
                $stepProgressInfo = $stepProgress.next('.progress-info'),
                $stepEditLink = $('.idea-step-edit', $stepProgressInfo);
                
            $ideaSingleContainer.find(' > .steps .ui-li-count').html(item.step_complete);
            $groupContainer.collapsible('collapse');
            $itemsProgress.removeClass('completed current');
            $stepProgressInfo.show();
            $stepEditLink.data('iid', iid);
            
            if (item.step_complete == '0') {
              $('.step-current', $stepProgressInfo).html('1');
              $stepEditLink.attr('href', '#idea-step-1');
            }
            else if (parseInt(item.step_complete) > 0) {
              var $currentProgres = $itemsProgress.eq(parseInt(item.step_complete) - 1);
              
              $currentProgres.addClass('completed').prevAll().addClass('completed');
              $currentProgres.next().addClass('current');
              
              if (parseInt(item.step_complete) < 5) {
                $('.step-current', $stepProgressInfo).html(parseInt(item.step_complete) + 1);
                $stepEditLink.attr('href', '#idea-step-' + (parseInt(item.step_complete) + 1));
              }
              else {
                $('.step-current', $stepProgressInfo).html('1');
                $stepEditLink.attr('href', '#idea-step-1');
                $stepProgressInfo.hide();
              }
            }
            
            // Team group
            $ideaSingleContainer.find(' > .team p').html(item.team);
            
            // Audience group
            $audienceItemsContainer = $ideaSingleContainer.find(' > .audience ol');
            $audienceItemsContainer.empty();
            $.each(item.audience, function(index, val){
              $audienceItemsContainer.append('<li>' + val + '</li>');
            });
            $audienceItemsContainer.listview('refresh');
            
            // Keyvalue group
            $keyvalueItemsContainer = $ideaSingleContainer.find(' > .values ol');
            $keyvalueItemsContainer.empty();
            $.each(item.keyvalue, function(index, val){
              $keyvalueItemsContainer.append('<li>' + val + '</li>');
            });
            $keyvalueItemsContainer.listview('refresh');

          }
        });
      });
      
      $('#idea-single').on('pagebeforehide', function(event) {
        //$(this).removeData('iid');
      });
      

    //});
  }
  
})(jQuery, window.App = window.App || Object.create({}));