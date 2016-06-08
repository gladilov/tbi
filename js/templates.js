var tpl = {
	ideaItemHTML: function(data) {
		return '<li class="idea-item" data-iid="' + data.iid + '">'
             + '<h4 class="idea-title"><a href="#idea-single" class="idea-link ui-link" data-icon="custom" data-iid="' + data.iid + '">' + data.title + '</a><a href="#idea-edit" class="idea-edit ui-link"></a></h4>'
             + '<ul class="progress"><li></li><li></li><li></li><li></li><li></li></ul>'
             + '<ul class="stats"><li>7</li><li>7</li><li>5</li></ul>'
           + '</li>';
	},
  
  ideaStatusGroupHTML: function(data) {
    return '<div class="idea-status-group" data-role="collapsible" data-content-theme="false" data-status="' + data.status + '">'
             + '<h3>' + data.title + '<span class="ui-li-count">' + data.count + '</span></h3>'
             + '<ul class="idea-item-tpl-container"></ul>'
           + '</div>';
  },

};
