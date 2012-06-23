<?php
//Function will take an SQL query as an argument and format the resulting data as a 
//    json(JavaScript Object Notation) string and return it.
function sql2json($query) {
    $data_sql = mysql_query($query) or die("'';//" . mysql_error());// If an error has occurred, 
            //    make the error a js comment so that a javascript error will NOT be invoked
    $json_str = ""; //Init the JSON string.

    if($total = mysql_num_rows($data_sql)) { //See if there is anything in the query
        $json_str .= "[\n";

        $row_count = 0;    
        while($data = mysql_fetch_assoc($data_sql)) {
            if(count($data) > 1) $json_str .= "{\n";

            $count = 0;
            foreach($data as $key => $value) {
                //If it is an associative array we want it in the format of "key":"value"
                if(count($data) > 1) $json_str .= "\"$key\":\"$value\"";
                else $json_str .= "\"$value\"";

                //Make sure that the last item don't have a ',' (comma)
                $count++;
                if($count < count($data)) $json_str .= ",\n";
            }
            $row_count++;
            if(count($data) > 1) $json_str .= "}\n";

            //Make sure that the last item don't have a ',' (comma)
            if($row_count < $total) $json_str .= ",\n";
        }

        $json_str .= "]\n";
    }

    //Replace the '\n's - make it faster - but at the price of bad redability.
    $json_str = str_replace("\n","",$json_str); //Comment this out when you are debugging the script

    //Finally, output the data
    return $json_str;
}
?>