

( function( $, undefined ) {

  $( document ).bind( "mobileinit", function() {
    $.support.cors = true;
    $.mobile.allowCrossDomainPages = true;
  });
  
  $(document).ready(function() {
    document.addEventListener("deviceready", onDeviceReady, false);
    //onDeviceReady();
  });

  function onDeviceReady() {

    console.log('deviceready');
    console.log(navigator.network.connection.type);

  }
  
  
  
  $(document).on('pagecreate', function(e) {

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
          type: "POST",
          //dataType: 'json',
          url: "http://y-b-i.com/api/user.php",
          data: $(this).serialize(),
          cache: false,
          async: 'true',
        })
        .done(function(data, textStatus, jqXHR) {
            data = $.parseJSON(data);
            console.log('done');
            console.log(data);

            $.mobile.loading('show');
            
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

            $.mobile.loading('hide');
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
          data = $.parseJSON(jqXHR.responseText);
          console.log('fail');
          console.log(data);
          
          // Notification
          navigator.notification.alert(
            data.error_text,
            null,
            'Регистрация',
            'Закрыть'
          );
        });
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
    
    
    $('#ideaaddform').submit(function(e){
      e.preventDefault();
      
      // Notification
      /*navigator.notification.alert(
        'form submit!',  // message
        null,                   // callback
        'test',            // title
        'Ок'                  // buttonName
      );*/
      
      //console.log($(this).serialize());
      //console.log(JSON.stringify($(this).serialize()));
      
      $.ajax({
        type: "POST",
        url: "http://y-b-i.com/api/idea.php",
        data: $(this).serialize(),
        cache: false,
        async: 'true',
      })
      .done(function(data, textStatus, jqXHR) {
          console.log('done');
          console.log(jqXHR.responseText);
        
          // Notification
          /*navigator.notification.alert(
            'Идея успешно сохранена!',  // message
            null,                   // callback
            textStatus + ' | ' + data,            // title
            'ok'                  // buttonName
          );*/
        
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
        console.log('fail');
        console.log(jqXHR.responseText);
        
        // Notification
        navigator.notification.alert(
          'Идея успешно сохранена!',  // message
          null,                   // callback
          textStatus + ' | ' + data,            // title
          'Ок'                  // buttonName
        );
        
      });
      
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
    

  });
})( jQuery );
