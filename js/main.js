( function( $, undefined ) {

  $( document ).bind( "mobileinit", function() {
    $.mobile.allowCrossDomainPages = true;
  });

  $( document ).bind( "pagecreate", function( e ) {
  
    $('.tabs__caption').on('click', 'li:not(.tabs__content_active)', function() {
      $(this).addClass('tabs__item_active')
          .siblings()
          .removeClass('tabs__item_active')
          .closest('.tabs')
          .find('.tabs__content')
          .removeClass('tabs__content_active')
          .eq( $(this).index() ).addClass('tabs__content_active');
    });
    
    $('#signin form').submit(function(e){
      e.preventDefault();
      
      $(':mobile-pagecontainer').pagecontainer('change', 'idea.html');
    });
    
    
    
    // Idea add
    $('#ideaaddform .form-item').on('click', 'a.form-item-add', function(e) {
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
      
      //console.log($(this).serialize());
      //console.log(JSON.stringify($(this).serialize()));
      
      $.ajax({
        type: "POST",
        url: "http://y-b-i.com/api/idea.php",
        data: $(this).serialize(),
      })
      .done(function(data, textStatus, jqXHR) {
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
