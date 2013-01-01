<?php

/**
 * This page returns a JSON object (in JSONP format) with a single property called content.
 * The content property contains HTML to be displayed inside the #content div on the calling
 * page. The result consists of sections of pages from two different gallery-types providing
 * a resulting layout with both usability and hierachical overview.
 * This page takes three GET arguments:
 *   base (required):   The base URL to get the data from; this will be the site implementing
 *                      the script.
 *   id:                Id of the gallery to view.
 *   callback:          Argument used by JSONP to wrap the JSON object in a function. This
 *                      determines that function's name.
 */

//Set header to json content.
header("Content-Type: application/json");
 
/**
 * Go through the input character-by-character, parsing it to make it valid HTML containable in the content-property
 * of the JSON result object. This includes replacing " with '. Additionally removes (some) unnecessary blankspace.
 */
function parseAndCleanHtml($html) {
    $input = str_split($html);
    $result = '';
    
    $prev_char;
    foreach($input as $c) {
        if($c == '	' || $c == "\n") $c = ' '; //treat tabs, newlines as single whitespaces
        if($c == "\r") continue; //skip \r - windows-specific humbug
        if($c == '"') $c = "'";
        
        switch($c) {
            case(' '):
                if($prev_char !== ' ') {
                    $result .= ' ';
                }
                $prev_char = ' ';
                break;
            default:
                $result .= $c;
                $prev_char = $c;
                break;
        }
    }
    
    return $result;
}

//If no id is set, set id to 0 (root).
if(!isset($_GET['id'])) {
    $_GET['id'] = 0;
}

//Create URLs for getting content
$href1 = "http://".$_GET['base']."/image/tid/".$_GET['id'];
$href2 = "http://".$_GET['base']."/galleri/".$_GET['id'];

//Use cURL to get content from the first URL and get the substring that is just the desired part.
$ch1 = curl_init($href1);
curl_setopt($ch1, CURLOPT_RETURNTRANSFER, 1);
$listing = curl_exec($ch1);
$start = strpos($listing, '<ul class="galle');
$end = strpos($listing, '</ul>', $start) + 5;
if($start === false) $listing = false;
else $listing = substr($listing, $start, $end - $start);

//Do the same for second URL
$ch2 = curl_init($href2);
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, 1);
$gallery = curl_exec($ch2);
$start = strpos($gallery, '<div id="content-content"');
$end = strpos($gallery, '</div><!-- /content-content -->', $start) + 6;
$gallery = substr($gallery, $start, $end - $start);

//Echo JSONP result.
//If JSONP has given a callback name, use this. Otherwise default to "callback".
echo (isset($_GET['callback']) ? $_GET['callback'] : "callback");
echo '({content: "'.parseAndCleanHtml($gallery.$listing).'"});';

?>