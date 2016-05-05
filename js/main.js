( function( $, undefined ) {

  $(document).on('mobileinit', function() {
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
    
    // Notification
    navigator.notification.alert(
      'Deviceready',
      null,
      'Deviceready',
      'Закрыть'
    );
    
    $(document).on('pageinit', '#signin-signup', function(){
      // Notification
      navigator.notification.alert(
        'Page',
        null,
        'signin-signup',
        'Закрыть'
      );
    });
  }
  
  //$(document).on('pageinit', '#signin-signup', function(){
    
    /*$.post("http://y-b-i.com/api/user.php", {'test': 'post_test_ok'}, function (responseData) {
      data = $.parseJSON(responseData);
      alert(data.data.test);
    });*/
    
// Notification
/*navigator.notification.alert(
  'Test start',
  null,
  'Test ajax jsonp',
  'Закрыть'
);*/
   
/*   
$.ajax({
  type: 'GET',
  dataType: 'jsonp',
  jsonpCallback: 'userCreate',
  url: 'http://y-b-i.com/api/user.php',
  data: {'method': 'POST', 'data': {'name': 'test', 'pass': '123'}},
  cache: false,
  async: true,
  crossDomain: true,
})
.done(function(data, textStatus, jqXHR){
  alert("success");
  console.log(data);
  
  // Notification
  navigator.notification.alert(
    data.status,
    null,
    'Test ajax jsonp',
    'Закрыть'
  );
})
.fail(function(jqXHR, textStatus, errorThrown){
  alert("error");
  console.log(data);
  
  // Notification
  navigator.notification.alert(
    jqXHR.responseText,
    null,
    'Test ajax jsonp',
    'Закрыть'
  );
});*/

// Notification
/*navigator.notification.alert(
  'Test stop',
  null,
  'Test ajax jsonp',
  'Закрыть'
);*/

    // Signup form
    /*$('#signup-form').submit(function(e){
      e.preventDefault();
      
      if ($("#signup-form:has(.required.error)").length == 0) {
        $.ajax({
          type: "POST",
          dataType: 'json',
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
    });*/
  //});
  
  $(document).on('pagecreate', function(e) {
    // Notification
    /*navigator.notification.alert(
      'Test start',
      null,
      'Test ajax jsonp',
      'Закрыть'
    );*/
  
  /*
$.ajax({
  type: 'GET',
  dataType: 'jsonp',
  jsonpCallback: 'userCreate',
  url: 'http://y-b-i.com/api/user.php',
  data: {'method': 'POST', 'data': {'name': 'test', 'pass': '123'}},
  cache: false,
  async: true,
  crossDomain: true,
})
.done(function(data, textStatus, jqXHR){
  alert("success");
  console.log(data);
  
  // Notification
  navigator.notification.alert(
    data.status,
    null,
    'Test ajax jsonp',
    'Закрыть'
  );
})
.fail(function(jqXHR, textStatus, errorThrown){
  alert("error");
  console.log(data);
  
  // Notification
  navigator.notification.alert(
    jqXHR.responseText,
    null,
    'Test ajax jsonp',
    'Закрыть'
  );
});*/
  
  
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
    /*$('#signup-form').submit(function(e){
    //$('#signup-form .ui-input-btn').on('click', 'input', function(e){
      e.preventDefault();
      
      if ($("#signup-form:has(.required.error)").length == 0) {
        $.ajax({
          type: "GET",
          //dataType: 'json',
          dataType: 'json',
          url: "http://y-b-i.com/api/user.php",
          //data: $(this).serialize(),
          //data: JSON.stringify({"method": "post", "name": "Test", "mail": "test@test", "pass": "test"}),
          data: {"method": "post", "name": $('#signup-form input[name=name]').val(), "mail": $('#signup-form input[name=mail]').val(), "pass": $('#signup-form input[name=pass]').val()},
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
    });*/
    
    
    
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
