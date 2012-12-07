(function($) {
	//Set host, get base URLs for resources
	var host = "http://itu.dk/people/nroe/etc/";
	var baseUrl = location.href.split("/")[2];
	var requestUrl = host+"gallerifetch.php?base="+baseUrl;

	/**
	 * By CMS http://stackoverflow.com/questions/647259/javascript-query-string
	 * Returns the "search" (query) part of URL as a map from attribute to value.
	 */
	function getQueryString() {
	  var result = {}, queryString = location.search.substring(1),
		  re = /([^&=]+)=([^&]*)/g, m;

	  while (m = re.exec(queryString)) {
		result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
	  }

	  return result;
	}
	
	var urlQuery = getQueryString();
	if(!isNaN(urlQuery['id'])) {
		getContent(parseInt(urlQuery['id']));
		setUpClickListeners();
	}
	
	function getContent(id, isPop) {
		$("#loading-box").fadeIn('slow');
		$.getJSON(requestUrl+"&id="+id+"&callback=?", function(data2) {
			$("#content").slideUp('slow', function() {
				$(this).html(data2.content).slideDown('slow');
				if(!isPop) history.pushState({ thisId: id }, $('title').text(), "?id="+id);
				urlQuery = getQueryString();
				$("#views-slideshow-galleria-images-1").each(function() {
					$(this).css('width','100%').css('height','400px').
						find('a').each(function() {
							var thisHref = $(this).attr('href');
							var thisImg = $(this).find('img');
							$(this).replaceWith(thisImg);
						});
					Galleria.run("#views-slideshow-galleria-images-1");
				});
				$("#loading-box").fadeOut('slow');
			});
		});
	}
	
	function setUpClickListeners() {
		$("#content a").live('click', function() {
			var href = $(this).attr('href');
			if(href.indexOf("image/tid") > -1) {
				var id = href.split("/")[3];
				getContent(id);
				return false;
			}
		});
		$('.galleria-images .galleria-image img').live('click', function() {
			window.open($(this).attr('src'), '_blank');
		});
	}
	
	window.onpopstate = function() {
		urlQuery = getQueryString();
		if(isNaN(urlQuery['id'])) getContent(0, true);
		else {
			var id = parseInt(urlQuery['id']);
			if(id > -1) {
				getContent(id, true);
			}
		}
	}

	// Load Galleria
	$.getScript(host+"galleria-1.2.8.min.js", function() {
		Galleria.loadTheme(host+"themes/classic/galleria.classic.min.js");
	});
	
	//Box to be displayed when loading
	$('<div id="loading-box" style="position: fixed; left: 40%; top: 40%; width: 20%; background: white; padding: 15px 0; font-size: 26px; border: 2px dotted #999; text-align: center;">Henter data...</div>').appendTo('body').css('display','none');
	
	//Make galleria images look clickable
	$('<style type="text/css">.galleria-image img { cursor: pointer; }</style>').appendTo('head');
	
	//Main functionality.
	$('<a href="#" id="activate-gallery" style="display:block;text-align:center;padding:8px;border:1px #999 dotted;">Prøv (betaversionen af) det nye, bedre billedgalleri!</a>')
		.prependTo("#content")
		.click(function() {
			$.getJSON(requestUrl+"&callback=?", function(data) {
				$("#content").slideUp('slow', function() {
					$(this).html(data).slideDown('slow');
					$("#activate-gallery").hide();
					setUpClickListeners();
				});
			});
		});
})(jQuery);