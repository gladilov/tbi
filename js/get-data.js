/*var getIdeasByUser = function(uid) {
    var returnData = [];
    
    $.ajax({
      type: 'GET',
      dataType: 'jsonp',
      jsonpCallback: "idea_list",
      contentType: "application/json; charset=utf-8",
      url: 'http://y-b-i.com/api/idea.php',
      data: {'method': 'get', 'data': {'uid': uid}},
      timeout: 8000,
      cache: false,
      async: false,
    })
    .done(function(data, textStatus, jqXHR) {
      if (data.status == 'success') {
        //return data.items;
        //return data;
        //returnData.push(data);
        returnData.push('success');
      }
      else if (data.status == 'error') {
        returnData.push('error');
      }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      returnData.push('fail');
    });
    
    return returnData;
  };*/