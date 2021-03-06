(function($, App){

  var deviceReadyDeferred = $.Deferred(),
      jqmReadyDeferred = $.Deferred(),
      storage = $.localStorage,
      $pageLoader = $('.page-loader'),
      uid = 0,
      userAuthorized = false,
      app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1,
      appVersion = '0.7.8';

  // Namespace storage
  var ybi = $.initNamespaceStorage('ybi');

  document.addEventListener('deviceready', deviceReady, false);
  if (!app) deviceReady();

  function deviceReady() {
    deviceReadyDeferred.resolve();
  }

  $(document).on('mobileinit', function() {
    $.support.cors = true;
    $.mobile.allowCrossDomainPages = true;
    $.mobile.autoInitializePage = true;
    $.mobile.hashListeningEnabled = true;

    $.mobile.pushStateEnabled = false;/* temp */
    
    jqmReadyDeferred.resolve();
  });
  
  // First page before load - check userAuthorized
  $(document).on('pagecontainerbeforechange', function(e, data) {
    if (typeof data.toPage === "object" && data.toPage.is('#idea-list') && typeof data.absUrl === "undefined") {
      if (ybi.localStorage.isSet('userAuthorized')) {
        userAuthorized = ybi.localStorage.get('userAuthorized');
        uid = ybi.localStorage.get('userAuthorizedUid');
        $('input[name="uid"]').val(uid);
      }
      
      if (userAuthorized === false) {
        data.toPage = $("#signin-signup");
      }
    }
  });
  
  // Before page show
  $(document).on('pagecontainerbeforeshow', function(e, data) {
    if (typeof data.toPage === "object") {
      var $page = data.toPage,
          $pageTitle = $('#page-title', $page);
          
      // App version
      $('.app-version .value').html(appVersion);
      
      /* 
       * СПИСОК ИДЕЙ - загрузка из бд и отображение списка по группам при открытии раздела "Идеи"
       *
       * TODO: Отображение ошибок при загрузке данных
       *       Кэш данных
       *       При пустом списке кнопка по-центру "Добавьте Вашу первую идею"
       */
      if ($page.is('#idea-list')) {
        // Hide loading container
        $('.text-loading', $page).hide();
        
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
            if (data.items && !$.isEmptyObject(data.items)) {
              // Hide empty text
              $('.text-empty-data', $page).hide();
            
              $.each(data.items, function(groupStatus, ideaItems){
                console.log(groupStatus);
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
            else {
            // Show empty text
            $('.text-empty-data', $page).show();
            }
          }
          //else if (data.status == 'error') {}
        });
        //request.fail(function(jqXHR, textStatus, errorThrown) {});
      }
      
      /* 
       * СТРАНИЦА ДОБАВЛЕНИЯ/РЕДАКТИРОВАНИЯ ИДЕИ - загрузка из бд и отображение всех данных в форме
       *
       * TODO: Отображение ошибок при загрузке данных
       *       Кэш данных
       */
      if ($page.is('#idea-add')) {
        var ideaData = $page.data('ideaData'),
            $ideaAddForm = $('#ideaadd-form', $page);

        // Reset form
        $pageTitle.text('Бизнес идея');
        $('.ui-input-text > .ui-input-clear', $ideaAddForm).addClass('ui-input-clear-hidden');
        $('input[type="text"], textarea', $ideaAddForm).val('');
        $('#idea-category option', $ideaAddForm).attr('selected', false);
        $('#idea-category option[value="none"]', $ideaAddForm).attr('selected', 'selected');
        $('#idea-category', $ideaAddForm).selectmenu('refresh', true);
        $('#idea-category-button > span', $ideaAddForm).text($('#idea-category option[value="none"]', $ideaAddForm).text());
        //$('.form-item-idea-audience, .form-item-idea-keyvalue', $ideaAddForm).find('.ui-input-text:not(:first-child)').detach();
        $('.form-item-multiple', $ideaAddForm).find('.ui-input-text:not(:first-child)').detach();
        $('input[type="text"], textarea, select', $ideaAddForm).removeClass('error');
            
        // Idea form update - insert data from idea to form
        if (ideaData && typeof ideaData === "object") {
          $pageTitle.text(ideaData.title);
          $('#idea-title', $ideaAddForm).val(ideaData.title).textinput('refresh');
          if (ideaData.description) $('#idea-description', $ideaAddForm).val(ideaData.description);
          if (ideaData.product) $('#idea-product', $ideaAddForm).val(ideaData.product);
          
          if (ideaData.category) {
            $('#idea-category option', $ideaAddForm).attr('selected', false);
            $('#idea-category option[value="' + ideaData.category + '"]', $ideaAddForm).attr('selected', 'selected');
            $('#idea-category', $ideaAddForm).selectmenu('refresh', true);
            $('#idea-category-button > span', $ideaAddForm).text(ideaData.category);
          }
          
          if (ideaData.audience && $.isArray(ideaData.audience)) {
            if (ideaData.audience.length == 1) {
              $('#idea-audience', $ideaAddForm).val(ideaData.audience[0]);
            }
            else {
              var $audienceAddItem = $('.form-item-idea-audience .form-item-add', $ideaAddForm);
              $.each(ideaData.audience, function(i, val) {
                if (i == 0) { $('#idea-audience', $ideaAddForm).val(val); }
                else {
                  $audienceAddItem.trigger('click');
                  $('#idea-audience-' + (i + 1), $ideaAddForm).val(val);
                }
              });
            }
          }
          
          if (ideaData.keyvalue && $.isArray(ideaData.keyvalue)) {
            if (ideaData.keyvalue.length == 1) {
              $('#idea-keyvalue', $ideaAddForm).val(ideaData.keyvalue[0]);
            }
            else {
              var $keyvalueAddItem = $('.form-item-idea-keyvalue .form-item-add', $ideaAddForm);
              $.each(ideaData.keyvalue, function(i, val) {
                if (i == 0) { $('#idea-keyvalue', $ideaAddForm).val(val); }
                else {
                  $keyvalueAddItem.trigger('click');
                  $('#idea-keyvalue-' + (i + 1), $ideaAddForm).val(val);
                }
              });
            }
          }
          
          if (ideaData.sales_channel && $.isArray(ideaData.sales_channel)) {
            if (ideaData.sales_channel.length == 1) {
              $('#idea-sales-channel', $ideaAddForm).val(ideaData.keyvalue[0]);
            }
            else {
              var $salesChannelAddItem = $('.form-item-idea-sales-channel .form-item-add', $ideaAddForm);
              $.each(ideaData.sales_channel, function(i, val) {
                if (i == 0) { $('#idea-sales-channel', $ideaAddForm).val(val); }
                else {
                  $salesChannelAddItem.trigger('click');
                  $('#idea-sales-channel-' + (i + 1), $ideaAddForm).val(val);
                }
              });
            }
          }
          
          if (ideaData.competitive_advantages && $.isArray(ideaData.competitive_advantages)) {
            if (ideaData.competitive_advantages.length == 1) {
              $('#idea-competitive-advantages', $ideaAddForm).val(ideaData.keyvalue[0]);
            }
            else {
              var $competitiveAdvantagesAddItem = $('.form-item-idea-competitive-advantages .form-item-add', $ideaAddForm);
              $.each(ideaData.competitive_advantages, function(i, val) {
                if (i == 0) { $('#idea-competitive-advantages', $ideaAddForm).val(val); }
                else {
                  $competitiveAdvantagesAddItem.trigger('click');
                  $('#idea-competitive-advantages-' + (i + 1), $ideaAddForm).val(val);
                }
              });
            }
          }
          
          if (ideaData.team && $.isArray(ideaData.team)) {
            if (ideaData.team.length == 1) {
              $('#idea-team', $ideaAddForm).val(ideaData.team[0]);
            }
            else {
              var $teamAddItem = $('.form-item-idea-team .form-item-add', $ideaAddForm);
              $.each(ideaData.team, function(i, val) {
                if (i == 0) { $('#idea-team', $ideaAddForm).val(val); }
                else {
                  $teamAddItem.trigger('click');
                  $('#idea-team-' + (i + 1), $ideaAddForm).val(val);
                }
              });
            }
          }
          
          if (ideaData.necessary_resources && $.isArray(ideaData.necessary_resources)) {
            if (ideaData.necessary_resources.length == 1) {
              $('#idea-necessary-resources', $ideaAddForm).val(ideaData.necessary_resources[0]);
            }
            else {
              var $necessaryResourcesAddItem = $('.form-item-idea-necessary-resources .form-item-add', $ideaAddForm);
              $.each(ideaData.necessary_resources, function(i, val) {
                if (i == 0) { $('#idea-necessary-resources', $ideaAddForm).val(val); }
                else {
                  $necessaryResourcesAddItem.trigger('click');
                  $('#idea-necessary-resources-' + (i + 1), $ideaAddForm).val(val);
                }
              });
            }
          }
          
          if (ideaData.helpful_people && $.isArray(ideaData.helpful_people)) {
            if (ideaData.helpful_people.length == 1) {
              $('#idea-helpful-people', $ideaAddForm).val(ideaData.helpful_people[0]);
            }
            else {
              var $helpfulPeopleAddItem = $('.form-item-idea-helpful-people .form-item-add', $ideaAddForm);
              $.each(ideaData.helpful_people, function(i, val) {
                if (i == 0) { $('#idea-helpful-people', $ideaAddForm).val(val); }
                else {
                  $helpfulPeopleAddItem.trigger('click');
                  $('#idea-helpful-people-' + (i + 1), $ideaAddForm).val(val);
                }
              });
            }
          }
          
          if (ideaData.key_hypotheses && $.isArray(ideaData.key_hypotheses)) {
            if (ideaData.key_hypotheses.length == 1) {
              $('#idea-key-hypotheses', $ideaAddForm).val(ideaData.key_hypotheses[0]);
            }
            else {
              var $keyHypothesesAddItem = $('.form-item-idea-key-hypotheses .form-item-add', $ideaAddForm);
              $.each(ideaData.key_hypotheses, function(i, val) {
                if (i == 0) { $('#idea-key-hypotheses', $ideaAddForm).val(val); }
                else {
                  $keyHypothesesAddItem.trigger('click');
                  $('#idea-key-hypotheses-' + (i + 1), $ideaAddForm).val(val);
                }
              });
            }
          }

          $ideaAddForm.find('div.ui-input-text input[type="text"]').each(function(i, el) {
            if ($(this).val() != '') {
              $(this).siblings('.ui-input-clear').removeClass('ui-input-clear-hidden');
            }
          });
          
          console.log(ideaData);
        }
      }
      
      /* 
       * СТРАНИЦА ПО ОЦЕНКЕ ИДЕИ: ШАГ 1 - загрузка из бд и отображение всех данных в форме
       *
       * TODO: Отображение ошибок при загрузке данных
       *       Кэш данных
       */
      if ($page.is('#idea-step-1')) {
        var iid = $page.data('iid'),
            $thisForm = $('#ideastep1-form', $page);

        // Reset form
        $('.sliders-items .ui-slider-input', $thisForm).val('0').slider('refresh');
        $('input[name="gpa"]', $thisForm).val('0');
        
        var request = $.ajax({
          type: 'GET',
          dataType: 'jsonp',
          jsonpCallback: 'ideaStep1',
          contentType: "application/json; charset=utf-8",
          url: 'http://y-b-i.com/api/ideaSteps.php',
          data: {'method': 'get', 'data': {'iid': iid}},
          timeout: 8000,
          cache: false,
          async: true,
        });
        
        request.done(function(data, textStatus, jqXHR) {
          console.log(data);
          // Success:
          if (data.status == 'success') {
            // Idea form update - insert data from idea to form
            if (data.item && !$.isEmptyObject(data.item)) {
              $('#market-volume', $thisForm).val(data.item.market_volume).slider('refresh');
              $('#market-type', $thisForm).val(data.item.market_type).slider('refresh');
              $('#client-interest', $thisForm).val(data.item.client_interest).slider('refresh');
              $('input[name="gpa"]', $thisForm).val(data.item.gpa);
              
              $thisForm.data('updateStatus', true);
            }
            else {
              $thisForm.data('updateStatus', false);
            }
          }
        });
      }
      
      /* 
       * СТРАНИЦА ПО ОЦЕНКЕ ИДЕИ: ШАГ 2 - загрузка из бд и отображение всех данных в форме
       *
       * TODO: Отображение ошибок при загрузке данных
       *       Кэш данных
       */
      if ($page.is('#idea-step-2')) {
        var iid = $page.data('iid'),
            $thisForm = $('#ideastep2-form', $page);
            
        // Reset form
        $('.sliders-items .ui-slider-input', $thisForm).val('0').slider('refresh');
        $('input[name="gpa"]', $thisForm).val('0');
        
        var request = $.ajax({
          type: 'GET',
          dataType: 'jsonp',
          jsonpCallback: 'ideaStep2',
          contentType: "application/json; charset=utf-8",
          url: 'http://y-b-i.com/api/ideaSteps.php',
          data: {'method': 'get', 'data': {'iid': iid}},
          timeout: 8000,
          cache: false,
          async: true,
        });
        
        request.done(function(data, textStatus, jqXHR) {
          console.log(data);
          // Success:
          if (data.status == 'success') {
            // Idea form update - insert data from idea to form
            if (data.item && !$.isEmptyObject(data.item)) {
              $('#author-conformity', $thisForm).val(data.item.author_conformity).slider('refresh');
              $('#author-interest', $thisForm).val(data.item.author_interest).slider('refresh');
              $('#author-leadership', $thisForm).val(data.item.author_leadership).slider('refresh');
              $('input[name="gpa"]', $thisForm).val(data.item.gpa);
              
              $thisForm.data('updateStatus', true);
            }
            else {
              $thisForm.data('updateStatus', false);
            }
          }
        });
      }
      
      /* 
       * СТРАНИЦА ПО ОЦЕНКЕ ИДЕИ: ШАГ 3 - загрузка из бд и отображение всех данных в форме
       *
       * TODO: Отображение ошибок при загрузке данных
       *       Кэш данных
       */
      if ($page.is('#idea-step-3')) {
        var iid = $page.data('iid'),
            $thisForm = $('#ideastep3-form', $page);

        // Reset form
        $('select option', $thisForm).attr('selected', false);
        $('select option[value="none"]', $thisForm).attr('selected', 'selected');
        $('select', $thisForm).selectmenu('refresh', true);
        $('#technical-capability-button > span', $thisForm).text($('#technical-capability option[value="none"]', $thisForm).text());
        $('#economic-benefits-button > span', $thisForm).text($('#economic-benefits option[value="none"]', $thisForm).text());
        
        var request = $.ajax({
          type: 'GET',
          dataType: 'jsonp',
          jsonpCallback: 'ideaStep3',
          contentType: "application/json; charset=utf-8",
          url: 'http://y-b-i.com/api/ideaSteps.php',
          data: {'method': 'get', 'data': {'iid': iid}},
          timeout: 8000,
          cache: false,
          async: true,
        });
        
        request.done(function(data, textStatus, jqXHR) {
          console.log(data);
          // Success:
          if (data.status == 'success') {
            // Idea form update - insert data from idea to form
            if (data.item && !$.isEmptyObject(data.item)) {
              $('#technical-capability option', $thisForm).attr('selected', false);
              $('#technical-capability option[value="' + data.item.technical_capability + '"]', $thisForm).attr('selected', 'selected');
              $('#technical-capability', $thisForm).selectmenu('refresh', true);
              $('#technical-capability-button > span', $thisForm).text(data.item.technical_capability);
              $('#economic-benefits option', $thisForm).attr('selected', false);
              $('#economic-benefits option[value="' + data.item.economic_benefits + '"]', $thisForm).attr('selected', 'selected');
              $('#economic-benefits', $thisForm).selectmenu('refresh', true);
              $('#economic-benefits-button > span', $thisForm).text(data.item.economic_benefits);
              
              $thisForm.data('updateStatus', true);
            }
            else {
              $thisForm.data('updateStatus', false);
            }
          }
        });
      }
      
      
      /* 
       * СТРАНИЦА ПО ОЦЕНКЕ ИДЕИ: ШАГ 4 - загрузка из бд и отображение всех данных в форме
       *
       * TODO: Отображение ошибок при загрузке данных
       *       Кэш данных
       */
      if ($page.is('#idea-step-4')) {
        var iid = $page.data('iid'),
            $thisForm = $('#ideastep4-form', $page);

        // Reset form
        $('.ui-input-text > .ui-input-clear', $thisForm).addClass('ui-input-clear-hidden');
        $('input[type="number"]', $thisForm).val('');
        $('input[type="number"]', $thisForm).removeClass('error');
        
        var request = $.ajax({
          type: 'GET',
          dataType: 'jsonp',
          jsonpCallback: 'ideaStep4',
          contentType: "application/json; charset=utf-8",
          url: 'http://y-b-i.com/api/ideaSteps.php',
          data: {'method': 'get', 'data': {'iid': iid}},
          timeout: 8000,
          cache: false,
          async: true,
        });
        
        request.done(function(data, textStatus, jqXHR) {
          console.log(data);
          // Success:
          if (data.status == 'success') {
            // Idea form update - insert data from idea to form
            if (data.item && !$.isEmptyObject(data.item)) {
              $('#annual-sales-volume', $thisForm).val(data.item.annual_sales_volume);
              $('#average-price', $thisForm).val(data.item.average_price);
              $('#annual-fixed-expense', $thisForm).val(data.item.annual_fixed_expense);
              $('#variable-expense', $thisForm).val(data.item.variable_expense);
              $('#investments', $thisForm).val(data.item.investments);
              
              $thisForm.data('updateStatus', true);
            }
            else {
              $thisForm.data('updateStatus', false);
            }
          }
        });
      }
      
      
      /* 
       * СТРАНИЦА ПО ОЦЕНКЕ ИДЕИ: ШАГ 5 - загрузка из бд и отображение всех данных в форме
       *
       * TODO: Отображение ошибок при загрузке данных
       *       Кэш данных
       */
      if ($page.is('#idea-step-5')) {
        var iid = $page.data('iid'),
            $thisForm = $('#ideastep5-form', $page);

        // Reset form
        $('.sliders-items .ui-slider-input', $thisForm).val('0').slider('refresh');
        $('input[name="gpa"]', $thisForm).val('0');
        
        var request = $.ajax({
          type: 'GET',
          dataType: 'jsonp',
          jsonpCallback: 'ideaStep5',
          contentType: "application/json; charset=utf-8",
          url: 'http://y-b-i.com/api/ideaSteps.php',
          data: {'method': 'get', 'data': {'iid': iid}},
          timeout: 8000,
          cache: false,
          async: true,
        });
        
        request.done(function(data, textStatus, jqXHR) {
          console.log(data);
          // Success:
          if (data.status == 'success') {
            // Idea form update - insert data from idea to form
            if (data.item && !$.isEmptyObject(data.item)) {
              $('#rating-competences', $thisForm).val(data.item.rating_competences).slider('refresh');
              $('#rating-resources', $thisForm).val(data.item.rating_resources).slider('refresh');
              $('#rating-business', $thisForm).val(data.item.rating_business).slider('refresh');
              $('#rating-failure', $thisForm).val(data.item.rating_failure).slider('refresh');
              $('input[name="gpa"]', $thisForm).val(data.item.gpa);
              
              $thisForm.data('updateStatus', true);
            }
            else {
              $thisForm.data('updateStatus', false);
            }
          }
        });
      }
      
    }
  });
  
  // Before page hide
  $(document).on('pagecontainerbeforehide', function(e, data) {
    if (typeof data.prevPage === "object") {
      var $page = data.prevPage;
          
      /* 
       * СТРАНИЦА ДОБАВЛЕНИЯ/РЕДАКТИРОВАНИЯ ИДЕИ
       */
      if ($page.is('#idea-add')) {
        $page.removeData('ideaData');
        $page.removeData('iid');
        $('#ideaadd-form input[name="iid"]', $page).val('');
      }
    }
  });

  $.when(deviceReadyDeferred, jqmReadyDeferred).then(doWhenBothFrameworksLoaded);

  function doWhenBothFrameworksLoaded() {
    if (app && device && device.platform && device.platform == 'IOS') { $.mobile.hashListeningEnabled = false;/* temp */ }
    
    // CSS Splash container
    $('#page-splash').fadeOut(500);
    
    // StatusBar
    if (app && StatusBar) {
      StatusBar.overlaysWebView(false);
      if (cordova.platformId == 'android') {
        StatusBar.backgroundColorByHexString("#16635D");
      }
    }
      
      
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
      
      //console.log(window.history);
    
    
      // Device back button
      var $page = $(':mobile-pagecontainer').pagecontainer('getActivePage')[0].id;
      //console.log($page);
      //if ($page.is('#signin-signup')) console.log('1');
      //else console.log('0');
      //console.log($(document).pagecontainer( "getActivePage" ));
      document.addEventListener('backbutton', function(e){
        e.preventDefault();

        if ($('.ui-page-active').attr('id') == 'idea-list') {
          //$('#idea-list #app-exit').trigger('click');
          if (app) {
            function appExitConfirm(buttonIndex) {
              if (buttonIndex == 1) {
                ybi.localStorage.set('userAuthorized', false);
                ybi.localStorage.remove('userAuthorizedUid');
                userAuthorized = false;
                uid = 0;
                $('input[name="uid"]').val('');
                navigator.app.exitApp();
              }
            }

            navigator.notification.confirm(
              'Вы действительно хотите закрыть приложение?',
               appExitConfirm,
              'Выход из приложения',
              ['Выйти','Отмена']
            );
          }
          else {
            ybi.localStorage.set('userAuthorized', false);
            ybi.localStorage.remove('userAuthorizedUid');
            userAuthorized = false;
            uid = 0;
            $('input[name="uid"]').val('');
            $(':mobile-pagecontainer').pagecontainer('change', '#signin-signup');
          }
        }
        else {
          //if (app && device.platform === "iOS") 
          if (app) 
            window.history.back();
        }

        //navigator.app.backHistory();
        //window.history.back();
        //history.back();
        //$.mobile.back();
        //history.go(-1);
        //parent.history.back();
      }, false);
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
        $(document).trigger('swiperight');
      });
      
      // Panel open on clik button "#btn-other"
      $(document).on('click', '.ui-page-active .left-panel a', function(e){
        var hash = $(this).attr('href');
        
        if (hash && hash != '#' && $('.ui-page-active').is(hash)) $('.ui-page-active .left-panel').panel('close');
      });
      
      
      // App exit
      $(document).on('click', '#app-exit', function(e){
        e.preventDefault();
        
        if (app) {
          function appExitConfirm(buttonIndex) {
            if (buttonIndex == 1) {
              ybi.localStorage.set('userAuthorized', false);
              ybi.localStorage.remove('userAuthorizedUid');
              userAuthorized = false;
              uid = 0;
              $('input[name="uid"]').val('');
              navigator.app.exitApp();
            }
          }

          navigator.notification.confirm(
            'Вы действительно хотите закрыть приложение?',
             appExitConfirm,
            'Выход из приложения',
            ['Выйти','Отмена']
          );
        }
        else {
          ybi.localStorage.set('userAuthorized', false);
          ybi.localStorage.remove('userAuthorizedUid');
          userAuthorized = false;
          uid = 0;
          $('input[name="uid"]').val('');
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
              // Set user id
              ybi.localStorage.set('userAuthorized', true);
              ybi.localStorage.set('userAuthorizedUid', data.uid);
              userAuthorized = true;
              $('input[name="uid"]').val(data.uid);
              uid = data.uid;
              
              $thisForm.find('.ui-input-text > input').removeClass('error').val('');
              $(':mobile-pagecontainer').pagecontainer('change', '#idea-list');
              
              setTimeout(function() {
                // Hide splash
                $pageLoader.fadeOut(150);
                $('.message', $pageLoader).empty();
                if (app) StatusBar.show();
              }, 2000);
            }
            // Error:
            else if (data.status == 'error') {
              $thisForm.find('.ui-input-text > input').addClass('error');
              
              setTimeout(function() {
                // Hide splash
                $pageLoader.fadeOut(150);
                $('.message', $pageLoader).empty();

                if (app) {
                  StatusBar.show();
                  
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
              // Set user id
              ybi.localStorage.set('userAuthorized', true);
              ybi.localStorage.set('userAuthorizedUid', data.uid);
              userAuthorized = true;
              $('input[name="uid"]').val(data.uid);
              uid = data.uid;
              
              $thisForm.find('.ui-input-text > input').removeClass('error').val('');
              
              setTimeout(function() {
                // Hide splash
                $pageLoader.fadeOut(150);
                $('.message', $pageLoader).empty();

                if (app) {
                  StatusBar.show();
                  
                  navigator.notification.alert(
                    data.message,
                    function () { $.mobile.pageContainer.pagecontainer("change", '#idea-list'); },
                    'Регистрация',
                    'Закрыть'
                  );
                }
                else {
                  $.mobile.pageContainer.pagecontainer("change", '#idea-list');
                }
              }, 2000);
            }
            // Error:
            else if (data.status == 'error') {
              $thisForm.find('.ui-input-text > input').addClass('error');
              
              setTimeout(function() {
                // Hide splash
                $pageLoader.fadeOut(150);
                $('.message', $pageLoader).empty();

                if (app) {
                  StatusBar.show();
                  
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
              window.plugins.toast.showLongBottom('Пароль отправлен Вам на почту.', function(a){}, function(b){});
            }, 750);
          }
          else {
            setTimeout(function() { alert('Пароль отправлен Вам на почту.'); }, 750);
          }
        }
      });
      
      
      // Idea filter form
      $('#idea-filter-sort-form').on('change', 'input', function(e){
        var $thisForm = $(this).parents('form'),
            $inputChange = $(this),
            $ideaList = $('#idea-list #idea-list-accordion'),
            type;
        
        if ($inputChange.val().substr(0, 1) == 'f') {
          type = 'filter';
          
          if ($inputChange.val().substr(1, 1) == '0') {
            $ideaList.children('.idea-status-group').show();
          }
          else {
            $ideaList.children('.idea-status-group').hide();
            $ideaList.children('.idea-status-group').filter('[data-status="' + $inputChange.val().substr(1, 1) + '"]').show();
          }
        }
        else { type = 'sort'; }
        
        console.log($(this).val());
        console.log(type);
      });
      
      // Изменение заголовка на странице обновления идеи по мере ввода нового заголовка в форме
      // TODO
      /*$(document).on('keydown', '#ideaadd-form #idea-title', function(event) {
        if (event.which == null) { // IE
          if (event.keyCode >= 32) console.log(event.keyCode);
        }

        if (event.which != 0 && event.charCode != 0) { // все кроме IE
          if (event.which >= 32) console.log(event.which);
        }
        
        console.log($(this).val());
        console.log(event);
      });*/
      
      // Idea add form
      // Set current user id into form
      //$('input[name="uid"]', $('#ideaadd-form')).val(uid);
      $('#ideaadd-form').validate();
      $('#ideaadd-form').submit(function(e){
        e.preventDefault();
        var $thisForm = $(this),
            method = 'post',
            iid = $('input[name="iid"]', $thisForm).val(),
            toastMessage = 'Идея успешно добавлена!';
            
        if (iid) method = 'put';
        console.log(method);
        console.log(uid);
        
        if ($("#ideaadd-form:has(input.required.error)").length == 0) {
          // Show splash
          $('.message', $pageLoader).text('Добавляем...');
          if (method == 'put') $('.message', $pageLoader).text('Обновляем...');
          if (app) StatusBar.hide();
          $pageLoader.fadeIn(150);
          
          var request = $.ajax({
            type: 'GET',
            dataType: 'jsonp',
            jsonpCallback: 'ideaAdd',
            contentType: "application/json; charset=utf-8",
            url: 'http://y-b-i.com/api/idea.php',
            data: {"method": method, "data": $(this).serialize()},
            timeout: 8000,
            cache: false,
            async: true,
          });
          
          var state = request.state();
          
          request.done(function(data, textStatus, jqXHR) {
            console.log(data);
            // Success:
            if (data.status == 'success') {
              if (method == 'post') {}
              else if (method == 'put') { toastMessage = 'Идея успешно обновлена!'; }
              
              // Goto idea page
              $('#idea-single').data('iid', data.iid);
              $(':mobile-pagecontainer').pagecontainer('change', '#idea-single');
              
              setTimeout(function() {
                // Hide splash
                $pageLoader.fadeOut(150);
                $('.message', $pageLoader).empty();
                if (app) {
                  StatusBar.show();
                  window.plugins.toast.showLongBottom(toastMessage, function(a){}, function(b){});
                }
                else console.log(toastMessage);
              }, 2000);
            }
            // Error:
            else if (data.status == 'error') {
              //$thisForm.find('.ui-input-text > input').addClass('error');
              
              setTimeout(function() {
                // Hide splash
                $pageLoader.fadeOut(150);
                $('.message', $pageLoader).empty();

                if (app) {
                  StatusBar.show();
                  
                  navigator.notification.alert(
                    data.message,
                    null,
                    method == 'put' ? 'Обновление идеи' : 'Добавление идеи',
                    'Закрыть'
                  );
                }
                else {
                  if (method == 'post') console.log('Ошибка добавления идеи (data.message: "' + data.message + '")');
                  else if (method == 'put') console.log('Ошибка обновления идеи (data.message: "' + data.message + '")');
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
      //$step1Form.validate();
      $step1Form.submit(function(e){
        e.preventDefault();
        var $thisForm = $(this),
            formUpdateStatus = $thisForm.data('updateStatus'),
            $marketVolume = $('#market-volume', $thisForm),
            $marketType = $('#market-type', $thisForm),
            $clientInterest = $('#client-interest', $thisForm),
            $gpa = $('input[name="gpa"]', $thisForm),
            message = '',
            iid = $('input[name="iid"]', $thisForm).val(),
            method = 'post';
        
        if (formUpdateStatus === true) method = 'put';
        
        var GPA = parseFloat(((parseInt($marketVolume.val()) + parseInt($marketType.val()) + parseInt($clientInterest.val() / 10)) / 3).toFixed(1));
        $gpa.val(GPA);
        
        // GPA Messages
        if (GPA <= 4.7) { message = 'Целесообразно подумать о том, как можно видоизменить данную идею, либо отказаться от неё, чтобы не тратить время на то, что мало кому нужно, кроме тебя.'; }
        else if (GPA > 4.7 && GPA <= 7.3) { message = 'Данная бизнес-идея имеет хороший рыночный потенциал.'; }
        else if (GPA > 7.3) { message = 'Данная бизнес-идея имеет огромный рыночный потенциал.'; }
        
        if (formUpdateStatus === false) {
          if (app) {
            navigator.notification.confirm(
              'Я действительно изучил данный вопрос и дал корректные ответы, а не просто, нажал кнопку «Далее»',
              formConfirm,
              'Оценка идеи',
              ['Да','Нет']
            );
          }
          else {
            if (confirm('Я действительно изучил данный вопрос и дал корректные ответы, а не просто, нажал кнопку «Далее»')) {
              formConfirm(1);
            }
          }
        }
        else formConfirm(1);
        
        function formConfirm(buttonIndex) {
          if (buttonIndex == 1) {
            if (app) {
              if (GPA <= 4.7) {
                $('#idea-single').data('iid', iid);
                navigator.notification.alert(message, function () { $.mobile.pageContainer.pagecontainer("change", '#idea-single'); }, 'Оценка идеи', 'Закрыть');
              }
              else { navigator.notification.alert(message, formSaveDataAndRedirect, 'Оценка идеи', 'Закрыть'); }
              
            }
            else {
              alert(message);
              if (GPA <= 4.7) {
                $('#idea-single').data('iid', iid);
                $.mobile.pageContainer.pagecontainer("change", '#idea-single');
              }
              else { formSaveDataAndRedirect(); }
            }

          }
        }

        function formSaveDataAndRedirect() {
          var request = $.ajax({
            type: 'GET',
            dataType: 'jsonp',
            jsonpCallback: 'ideaStep1',
            contentType: "application/json; charset=utf-8",
            url: 'http://y-b-i.com/api/ideaSteps.php',
            data: {"method": method, "data": $thisForm.serialize()},
            timeout: 8000,
            cache: false,
            async: true,
          });
          
          request.done(function(data, textStatus, jqXHR) {
            console.log(data);
            
            if (data.status == 'success') {
              console.log(iid);
              $('#idea-step-2').data('iid', iid);
              $(':mobile-pagecontainer').pagecontainer('change', '#idea-step-2', {transition: 'slide'});
            }
          });
        }
      });
      
      
      // Idea step-2 form
      //$('#ideastep2-form').validate();
      $('#ideastep2-form').submit(function(e){
        e.preventDefault();
        var $thisForm = $(this),
            formUpdateStatus = $thisForm.data('updateStatus'),
            $authorConformity = $('#author-conformity', $thisForm),
            $authorInterest = $('#author-interest', $thisForm),
            $authorLeadership = $('#author-leadership', $thisForm),
            $gpa = $('input[name="gpa"]', $thisForm),
            message = '',
            iid = $('input[name="iid"]', $thisForm).val(),
            method = 'post';
        
        if (formUpdateStatus === true) method = 'put';
        
        var GPA = parseInt((parseInt($authorConformity.val()) + parseInt($authorInterest.val()) + parseInt($authorLeadership.val())) / 3);
        $gpa.val(GPA);
        
        // GPA Messages
        if (GPA <= 7) { message = 'Возможно, данная идея не соответствует тебе, как автору данного проекта.'; }
        else if (GPA > 7 && GPA <= 9) { message = 'Данная бизнес-идея неплохо подходит тебе.'; }
        else if (GPA > 9) { message = 'Похоже, это твоя тема.'; }
        
        if (app) {
          if (GPA <= 7) {
            $('#idea-single').data('iid', iid);
            navigator.notification.alert(message, function () { $.mobile.pageContainer.pagecontainer("change", '#idea-single'); }, 'Оценка идеи', 'Закрыть');
          }
          else { navigator.notification.alert(message, formSaveDataAndRedirect, 'Оценка идеи', 'Закрыть'); }
          
        }
        else {
          alert(message);
          if (GPA <= 7) {
            $('#idea-single').data('iid', iid);
            $.mobile.pageContainer.pagecontainer("change", '#idea-single');
          }
          else { formSaveDataAndRedirect(); }
        }
        
        function formSaveDataAndRedirect() {
          var request = $.ajax({
            type: 'GET',
            dataType: 'jsonp',
            jsonpCallback: 'ideaStep2',
            contentType: "application/json; charset=utf-8",
            url: 'http://y-b-i.com/api/ideaSteps.php',
            data: {"method": method, "data": $thisForm.serialize()},
            timeout: 8000,
            cache: false,
            async: true,
          });
          
          request.done(function(data, textStatus, jqXHR) {
            console.log(data);
            
            if (data.status == 'success') {
              $('#idea-step-3').data('iid', iid);
              $(':mobile-pagecontainer').pagecontainer('change', '#idea-step-3', {transition: 'slide'});
            }
          });
        }
      });
      
      
      // Idea step-3 form
      //$('#ideastep3-form').validate();
      $('#ideastep3-form').submit(function(e){
        e.preventDefault();
        var $thisForm = $(this),
            formUpdateStatus = $thisForm.data('updateStatus'),
            $technicalCapability = $('#technical-capability', $thisForm),
            $economicBenefits = $('#economic-benefits', $thisForm),
            message = '',
            iid = $('input[name="iid"]', $thisForm).val(),
            method = 'post';
        
        if (formUpdateStatus === true) method = 'put';
        
        if ($technicalCapability.val() != 'none' && $economicBenefits.val() != 'none') {
          if ($technicalCapability.val() == 'Нет' || $economicBenefits.val() == 'Нет') {
            message = 'Целесообразно более глубоко проработать технические аспекты.';
            $('#idea-single').data('iid', iid);

            if (app) {
              navigator.notification.alert(message, function () { $.mobile.pageContainer.pagecontainer("change", '#idea-single'); }, 'Оценка идеи', 'Закрыть');
            }
            else {
              alert(message);
              $.mobile.pageContainer.pagecontainer("change", '#idea-single');
            }
          }
          else if ($technicalCapability.val() != 'Нет' || $economicBenefits.val() != 'Нет') {
            message = 'Данная бизнес-идея имеет хороший рыночный потенциал.';
            
            if (app) {
              navigator.notification.alert(message, formSaveDataAndRedirect, 'Оценка идеи', 'Закрыть');
            }
            else {
              alert(message);
              formSaveDataAndRedirect();
            }
          }
        }
        
        function formSaveDataAndRedirect() {
          var request = $.ajax({
            type: 'GET',
            dataType: 'jsonp',
            jsonpCallback: 'ideaStep3',
            contentType: "application/json; charset=utf-8",
            url: 'http://y-b-i.com/api/ideaSteps.php',
            data: {"method": method, "data": $thisForm.serialize()},
            timeout: 8000,
            cache: false,
            async: true,
          });
          
          request.done(function(data, textStatus, jqXHR) {
            console.log(data);
            
            if (data.status == 'success') {
              $('#idea-step-4').data('iid', iid);
              $(':mobile-pagecontainer').pagecontainer('change', '#idea-step-4', {transition: 'slide'});
            }
          });
        }
      });
      
      
      // Idea step-4 form
      $('#ideastep4-form').validate();
      $('#ideastep4-form').submit(function(e){
        e.preventDefault();
        var $thisForm = $(this),
            formUpdateStatus = $thisForm.data('updateStatus'),
            $annualSalesVolume = $('#annual-sales-volume', $thisForm),
            $averagePrice = $('#average-price', $thisForm),
            $annualFixedExpense = $('#annual-fixed-expense', $thisForm),
            $variableExpense = $('#variable-expense', $thisForm),
            $investments = $('#investments', $thisForm),
            $formula1 = $('input[name="formula1"]', $thisForm),
            $formula2 = $('input[name="formula2"]', $thisForm),
            type = 0,
            message = '',
            iid = $('input[name="iid"]', $thisForm).val(),
            method = 'post';
        
        if (formUpdateStatus === true) method = 'put';
          
        if ($("#ideastep4-form:has(input.required.error)").length == 0) {
          // 1. ((ОП*СЦ) - (ПостР + ОП*ПерР))/И
          // 2. ((ОП*СЦ) - (ПостР + ОП*ПерР))/(ОП*СП)
          var formula1 = ((parseInt($annualSalesVolume.val()) * parseInt($averagePrice.val())) - (parseInt($annualSalesVolume.val()) * parseInt($variableExpense.val()) + parseInt($annualFixedExpense.val()))) / parseInt($investments.val()),
              formula2 = ((parseInt($annualSalesVolume.val()) * parseInt($averagePrice.val())) - (parseInt($annualSalesVolume.val()) * parseInt($variableExpense.val()) + parseInt($annualFixedExpense.val()))) / (parseInt($annualSalesVolume.val()) * parseInt($averagePrice.val()));
          
          formula1 = parseFloat(formula1.toFixed(2));
          formula2 = parseFloat(formula2.toFixed(2));
          
          $formula1.val(formula1);
          $formula2.val(formula2);
          
          console.log(formula1);
          console.log(formula2);
          
          if (formula1 <= 0) {
            message = 'Проект не выглядит прибыльным. Попробуй что-то поменять в своём проекте или в расчётах, либо откажись от данного проекта.';
          }
          else if (formula1 > 0 && formula1 <= 24 && formula2 > 0 && formula2 <= 0.1) {
            message = 'Потенциально прибыльный, но не очень удачный проект с точки зрения вложения денег и времени. Попробуй что-то поменять в своём проекте или в расчётах, либо откажись от данного проекта.';
          }
          else if (formula1 > 24 && formula2 > 0 && formula2 <= 0.1) {
            message = 'Проект может принести деньги, но текущие расчёты показывают, что выгоднее найти другие направления вложения денег и времени. Попробуй что-то поменять в своём проекте или в расчётах, либо откажись от данного проекта.';
          }
          else if (formula1 > 0 && formula1 <= 24 && formula2 > 0.1) {
            message = 'Бизнес выглядит прибыльным, но требует несоразмерно больших инвестиций. Попробуй что-то поменять в своём проекте или в расчётах, либо откажись от данного проекта.';
          }
          else if (formula1 > 24 && formula2 > 0.1) {
            message = 'Данный проект выглядит финансово интересным. Надеемся, что ты ничего не напутал во вводных цифрах ;)';
            type = 1;
          }
          
          if (type == 0) {
            $('#idea-single').data('iid', iid);
            
            if (app) {
              navigator.notification.alert(message, function () { $.mobile.pageContainer.pagecontainer("change", '#idea-single'); }, 'Оценка идеи', 'Закрыть');
            }
            else {
              alert(message);
              $.mobile.pageContainer.pagecontainer("change", '#idea-single');
            }
          }
          else if (type == 1) {
            if (app) { navigator.notification.alert(message, formSaveDataAndRedirect, 'Оценка идеи', 'Закрыть'); }
            else {
              alert(message);
              formSaveDataAndRedirect();
            }
          }
          
          function formSaveDataAndRedirect() {
            var request = $.ajax({
              type: 'GET',
              dataType: 'jsonp',
              jsonpCallback: 'ideaStep4',
              contentType: "application/json; charset=utf-8",
              url: 'http://y-b-i.com/api/ideaSteps.php',
              data: {"method": method, "data": $thisForm.serialize()},
              timeout: 8000,
              cache: false,
              async: true,
            });
            
            request.done(function(data, textStatus, jqXHR) {
              console.log(data);
              
              if (data.status == 'success') {
                $('#idea-step-5').data('iid', iid);
                $(':mobile-pagecontainer').pagecontainer('change', '#idea-step-5', {transition: 'slide'});
              }
            });
          }
        }
      });
      
      
      // Idea step-5 form
      //$('#ideastep5-form').validate();
      $('#ideastep5-form').submit(function(e){
        e.preventDefault();
        var $thisForm = $(this),
            formUpdateStatus = $thisForm.data('updateStatus'),
            $ratingCompetences = $('#rating-competences', $thisForm),
            $ratingResources = $('#rating-resources', $thisForm),
            $ratingBusiness = $('#rating-business', $thisForm),
            $ratingFailure = $('#rating-failure', $thisForm),
            $gpa = $('input[name="gpa"]', $thisForm),
            message = '',
            iid = $('input[name="iid"]', $thisForm).val(),
            method = 'post';
        
        if (formUpdateStatus === true) method = 'put';
        
        var GPA = parseFloat(((parseInt($ratingCompetences.val()) + parseInt($ratingResources.val()) + parseInt($ratingBusiness.val()) + parseInt($ratingFailure.val())) / 4).toFixed(1));
        $gpa.val(GPA);
        
        // GPA Messages
        if (GPA <= 5.1) { message = 'Попробуй перестроить идею так, чтобы ты был более уверенным в её успешной реализации.'; }
        else if (GPA > 5.1 && GPA <= 7.3) { message = 'Тебе, явно, нужно развивать компетенции в данной сфере, но шансы на успешную реализацию высоки.'; }
        else if (GPA > 7.3) { message = 'Да, ты это точно можешь!'; }
        
        if (GPA > 5.1) {
          if (app) {
            navigator.notification.alert(message, formSaveDataAndRedirect, 'Оценка идеи', 'Закрыть');
          }
          else {
            alert(message);
            formSaveDataAndRedirect();
          }
        }
        else {
          $('#idea-single').data('iid', iid);
          
          if (app) {
            navigator.notification.alert(message, function () { $.mobile.pageContainer.pagecontainer("change", '#idea-single'); }, 'Оценка идеи', 'Закрыть');
          }
          else {
            alert(message);
            $.mobile.pageContainer.pagecontainer("change", '#idea-single');
          }
        }
        
        function formSaveDataAndRedirect() {
          var request = $.ajax({
            type: 'GET',
            dataType: 'jsonp',
            jsonpCallback: 'ideaStep5',
            contentType: "application/json; charset=utf-8",
            url: 'http://y-b-i.com/api/ideaSteps.php',
            data: {"method": method, "data": $thisForm.serialize()},
            timeout: 8000,
            cache: false,
            async: true,
          });
          
          request.done(function(data, textStatus, jqXHR) {
            console.log(data);
            
            if (data.status == 'success') {
              console.log('success');
              
              if (app) {
                navigator.notification.confirm(
                  'Буду ли реализовывать данную идею?',
                  formConfirm,
                  'Оценка идеи',
                  ['Да','Нет']
                );
              }
              else {
                if (confirm('Буду ли реализовывать данную идею?')) {
                  formConfirm(1);
                }
                else formConfirm(2);
              }
        
              function formConfirm(buttonIndex) {
                console.log(buttonIndex);
                if (buttonIndex == 1) {
                  var ideaStatus = 2;
                }
                else if (buttonIndex == 2) {
                  var ideaStatus = 3;
                }
                
                var request = $.ajax({
                  type: 'GET',
                  dataType: 'jsonp',
                  jsonpCallback: 'ideaStatus',
                  contentType: "application/json; charset=utf-8",
                  url: 'http://y-b-i.com/api/idea.php',
                  data: {"method": "put", "data": {'iid': iid, 'status': ideaStatus}},
                  timeout: 8000,
                  cache: false,
                  async: true,
                });
                
                request.done(function(data, textStatus, jqXHR) {
                  console.log(data);
                  
                  if (app) {
                    navigator.notification.alert(data.message, function () { $.mobile.pageContainer.pagecontainer("change", '#idea-list'); }, 'Оценка идеи', 'Закрыть');
                  }
                  else {
                    alert(data.message);
                    $.mobile.pageContainer.pagecontainer("change", '#idea-list');
                  }
                });
              }
            }
          });
        }
      });
      

      /* 
       * Переход по ссылке на страницу одной идеи/редактирования идеи
       */
      $(document).on('click', 'a[data-iid]', function(e){
        var hash = $(this).attr('href'),
            iid = $(this).data('iid');
            
        if ($(this).is('.idea-step-edit')) { 
          $('.idea-step-page').find('input[name="iid"]').val(iid);
        }
        
        if ($(this).is('.idea-edit')) {
          $('input[name="iid"]', $('#ideaadd-form')).val(iid);
          $(hash).data('ideaData', $('#idea-single').data('ideaData'));
        }
        
        $(hash).data('iid', iid);
      });

      
      /* 
       * СТРАНИЦА ОДНОЙ ИДЕИ - загрузка из бд и отображение всех данных на странице идеи
       *
       * TODO: Отображение ошибок при загрузке данных
       *       Кэш данных
       */
      $('#idea-single').on('pagebeforeshow', function(event) {
        var $this = $(this),
            iid = $this.data('iid'),
            $pageTitle = $('#page-title', $this),
            $ideaSingleContainer = $('#idea-single-accordion', $this),
            $groupContainer = $ideaSingleContainer.children(),
            $ideaEditLink = $('.idea-edit', $this);

        $ideaEditLink.data('iid', iid);
            
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
          
          if (data.status == 'success') {
            var item = data.item;
            $this.data('ideaData', item);
            
            // Single value fields:
            // Title
            $pageTitle.html(item.title);
            // Description
            $ideaSingleContainer.find(' > .desc p').html(item.description);
            // Product
            $ideaSingleContainer.find(' > .product p').html(item.product);
            
            // Steps group
            var $stepProgress = $('.steps .progress', $ideaSingleContainer)
                $itemsProgress = $stepProgress.children('li'),
                $itemsProgressLink = $itemsProgress.children('a'),
                $stepProgressInfo = $stepProgress.next('.progress-info'),
                $stepEditLink = $('.idea-step-edit', $stepProgressInfo);
                
            $ideaSingleContainer.find(' > .steps .ui-li-count').html(item.step_complete);
            $groupContainer.collapsible('collapse');
            $itemsProgress.removeClass('completed current');
            $stepProgressInfo.show();
            $itemsProgressLink.data('iid', iid);
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
            
            // Multiple value fields:
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
            
            // Sales channel group
            $salesChannelItemsContainer = $ideaSingleContainer.find(' > .sales-channel ol');
            $salesChannelItemsContainer.empty();
            $.each(item.sales_channel, function(index, val){
              $salesChannelItemsContainer.append('<li>' + val + '</li>');
            });
            $salesChannelItemsContainer.listview('refresh');
            
            // Competitive advantages group
            $competitiveAdvantagesItemsContainer = $ideaSingleContainer.find(' > .competitive-advantages ol');
            $competitiveAdvantagesItemsContainer.empty();
            $.each(item.competitive_advantages, function(index, val){
              $competitiveAdvantagesItemsContainer.append('<li>' + val + '</li>');
            });
            $competitiveAdvantagesItemsContainer.listview('refresh');
            
            // Team group
            $teamItemsContainer = $ideaSingleContainer.find(' > .team ol');
            $teamItemsContainer.empty();
            $.each(item.team, function(index, val){
              $teamItemsContainer.append('<li>' + val + '</li>');
            });
            $teamItemsContainer.listview('refresh');
            
            // Necessary resources group
            $necessaryResourcesItemsContainer = $ideaSingleContainer.find(' > .necessary-resources ol');
            $necessaryResourcesItemsContainer.empty();
            $.each(item.necessary_resources, function(index, val){
              $necessaryResourcesItemsContainer.append('<li>' + val + '</li>');
            });
            $necessaryResourcesItemsContainer.listview('refresh');
            
            // Helpful people group
            $helpfulPeopleItemsContainer = $ideaSingleContainer.find(' > .helpful-people ol');
            $helpfulPeopleItemsContainer.empty();
            $.each(item.helpful_people, function(index, val){
              $helpfulPeopleItemsContainer.append('<li>' + val + '</li>');
            });
            $helpfulPeopleItemsContainer.listview('refresh');
            
            // Key hypotheses group
            $keyHypothesesItemsContainer = $ideaSingleContainer.find(' > .key-hypotheses ol');
            $keyHypothesesItemsContainer.empty();
            $.each(item.key_hypotheses, function(index, val){
              $keyHypothesesItemsContainer.append('<li>' + val + '</li>');
            });
            $keyHypothesesItemsContainer.listview('refresh');

          }
        });
      });
      
      $('#idea-single').on('pagebeforehide', function(event) {
        //$(this).removeData('iid');
      });
      

    //});
  }
  
})(jQuery, window.App = window.App || Object.create({}));