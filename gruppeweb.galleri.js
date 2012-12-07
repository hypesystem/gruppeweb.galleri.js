 /********************************************************
 * gruppeweb.galleri.js by hypesystem <me@hypesystem.dk> *
 *                                                       *
 * This script changes the behaviour of the image        *
 * galleries provided by Gruppeweb, a Drupal CMS for     *
 * scouts. It uses an external API (which, in turn,      *
 * parses the original page) to bring an enhanced        *
 * experience.                                           *
 ********************************************************/

(function($) {
    //Set host, get base URLs for resources
    var host = "http://itu.dk/people/nroe/etc/";
    var baseUrl = location.href.split("/")[2];
    var requestUrl = host+"gallerifetch.php?base="+baseUrl;

    /**
     * By CMS: http://stackoverflow.com/questions/647259/javascript-query-string
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
    
    /**
     * First time the script is run, get the current query in the url (if any) and load the corresponding
     * gallery.
     */
    var urlQuery = getQueryString();
    if(!isNaN(urlQuery['id'])) {
        getContent(parseInt(urlQuery['id']));
        setUpClickListeners();
    }
    
    /**
     * Loads the content of the given id into the #content part of the webpage. It uses the API placed at
     * the value of "requestUrl". "isPop" denotes whether or not this is a pop-action. This second argument
     * is optional, and is assumed false. If it is, however, set to true, no state will be pushed to the
     * browser history.
     */
    function getContent(id, isPop) {
        $("#loading-box").fadeIn('slow'); //Tell the user we're downloading data
        $.getJSON(requestUrl+"&id="+id+"&callback=?", function(data2) { //Actually download data using JSONP API
            $("#content").slideUp('slow', function() { //When data is loaded, slide old content away...
                $(this).html(data2.content).slideDown('slow'); //And slide in new content.
                if(!isPop) history.pushState({ thisId: id }, $('title').text(), "?id="+id); //Push state (so long isPop is not set to true)
                urlQuery = getQueryString();
                $("#views-slideshow-galleria-images-1").each(function() { //Initialize galleria on the correct elements
                    $(this).css('width','100%').css('height','400px').
                        find('a').each(function() { //Images are normally placed in a-tags, fix this (this was how it was done in earlier galleria
                            var thisHref = $(this).attr('href');
                            var thisImg = $(this).find('img');
                            $(this).replaceWith(thisImg);
                        });
                    Galleria.run("#views-slideshow-galleria-images-1"); //Actual initialization
                });
                $("#loading-box").fadeOut('slow'); //Remove message saying we're loading data
            });
        });
    }
    
    /**
     * Sets up click listeners, taking over the functionality of links in the galleries (from default browser behaviour
     * to our custom behaviour).
     */
    function setUpClickListeners() {
        $("#content a").live('click', function() { //If links point to galleries, make them use getContent.
            var href = $(this).attr('href');
            if(href.indexOf("image/tid") > -1) {
                var id = href.split("/")[3];
                getContent(id);
                return false;
            }
        });
        $('.galleria-images .galleria-image img').live('click', function() { //Make images clickable. This is to make up for the
            window.open($(this).attr('src'), '_blank');                            //wrapping a-tag removed above.
        });
    }
    
    window.onpopstate = function() { //Popstate: When going back in browser history this makes sure the correct page is shown.
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
    $.getScript(host+"galleria-1.2.8.min.js", function() { //Load up galleria and set theme
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