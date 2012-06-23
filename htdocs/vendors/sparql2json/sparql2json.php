<?php 
// Author: John Wright
// Website: http://johnwright.me/blog
// This code is live @ 
// http://johnwright.me/code-examples/sparql-query-in-code-rest-php-and-json-tutorial.php


function getUrlDbpediaAbstract($term)
{
   $format = 'json';
 
   $query = 
   "PREFIX dbp: <http://dbpedia.org/resource/>
   PREFIX dbp2: <http://dbpedia.org/ontology/>
 
   SELECT ?abstract
   WHERE {
      dbp:".$term." dbp2:abstract ?abstract . 
      FILTER langMatches(lang(?abstract), 'en')
   }";
 
   $searchUrl = 'http://dbpedia.org/sparql?'
      .'query='.urlencode($query)
      .'&format='.$format;

   return $searchUrl;
}


function request($url){
 
   // is curl installed?
   if (!function_exists('curl_init')){ 
      die('CURL is not installed!');
   }
 
   // get curl handle
   $ch= curl_init();
 
   // set request url
   curl_setopt($ch, 
      CURLOPT_URL, 
      $url);
 
   // return response, don't print/echo
   curl_setopt($ch, 
      CURLOPT_RETURNTRANSFER, 
      true);
 
   /*
   Here you find more options for curl:
   http://www.php.net/curl_setopt
   */		
 
   $response = curl_exec($ch);
 
   curl_close($ch);
 
   return $response;
}


function printArray($array, $spaces = "")
{
   $retValue = "";

   if(is_array($array))
   {	
      $spaces = $spaces
         ."&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

      $retValue = $retValue."<br/>";

      foreach(array_keys($array) as $key)
      {
         $retValue = $retValue.$spaces
            ."<strong>".$key."</strong>"
            .printArray($array[$key], 
               $spaces);
      }		
      $spaces = substr($spaces, 0, -30);
   }
   else $retValue = 
      $retValue." - ".$array."<br/>";

   return $retValue;
}

$term = "Honda_Legend";

$requestURL = getUrlDbpediaAbstract($term);

$responseArray = json_decode(
	request($requestURL),
	true); 
?>