var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        
        
        console.log('deviceready');
        console.log(navigator.network.connection.type);
        
        // Notification
        navigator.notification.alert(
          'Test start',
          null,
          'Test ajax jsonp',
          'Закрыть'
        );
        
        // jQuery initialize
        (function($, undefined) {
          $(document).on('mobileinit', function() {
            $.support.cors = true;
            $.mobile.allowCrossDomainPages = true;
          });
          
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
          });
          
        })(jQuery);
    },
};
