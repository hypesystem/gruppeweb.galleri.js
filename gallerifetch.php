<?php

echo (isset($_GET['callback']) ? $_GET['callback'] : "callback").'(';

if(!isset($_GET['id'])) {
	$href = "http://".$_GET['base']."/image";
	$ch = curl_init($href);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	$contents = curl_exec($ch);
	$start = strpos($contents, '<div class="view-content">');
	$contents = substr($contents, $start, strpos($contents, '</div> <div class="view', $start) - $start);
	echo '"'.str_replace("\r", "", str_replace("\n", "", str_replace('"', "'", $contents))).'"';
}
else {
	$href1 = "http://".$_GET['base']."/image/tid/".$_GET['id'];
	$href2 = "http://".$_GET['base']."/galleri/".$_GET['id'];
	
	$ch1 = curl_init($href1);
	curl_setopt($ch1, CURLOPT_RETURNTRANSFER, 1);
	$listing = curl_exec($ch1);
	$start = strpos($listing, '<ul class="galle');
	$end = strpos($listing, '</ul>', $start) + 5;
	if($start === false) $listing = false;
	else $listing = substr($listing, $start, $end - $start);
	
	$ch2 = curl_init($href2);
	curl_setopt($ch2, CURLOPT_RETURNTRANSFER, 1);
	$gallery = curl_exec($ch2);
	$start = strpos($gallery, '<div id="content-content"');
	$end = strpos($gallery, '</div><!-- /content-content -->', $start) + 6;
	$gallery = substr($gallery, $start, $end - $start);
	
	echo '{content: "'.str_replace("\r", "", str_replace("\n", "", str_replace('"', "'", $gallery.$listing)));
	echo '"}';
}

echo ');';

?>