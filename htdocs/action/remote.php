<?php
//get host, user, and pass from endpoint node like "<mysql=endpoint,user=username,pass=password>"

//parse node.html into relevant values

parse(node.html)

/specify endpoint

host=mysql.node.html

//specify username

user=user.node.html

//specify password

pass=pass.node.html 

//do parsing on the node.html

function parse(node.html)

	{
	}



//connect to the database specified in config.json
function connect(){
	global $config;
	global $sql;
	$sql = new sql();
	$sql->connect(array(
		'host'=>$config['db_host'],
		'user'=>$config['db_user'],
		'pass'=>$config['db_pass']
	));
	$sql->db($config['db_name']);
}

//get the beginning node (node0)
function getBeginningNode($node){
	global $sql;
	$sql->def(array(
		'table'=>'nodes',
	));
	$rows = $sql->getRow(array(
		'row' => '*',
		'where' => 'id="0"'
	));
	$row = mysql_fetch_array($rows);
	return $row;
}

//get all nodes
function getAll($id=0){
	global $sql;
	//get node
	$node = get($id);
	//get children
	$node['children'] = array();
	$rows = $sql->getRow(array(
		'table'=>'links',
		'row' => '*',
		'where' => 'parent="'.$id.'"'
	));
	if(mysql_num_rows($rows)){
		while($row = mysql_fetch_assoc($rows)){
			$child = get($row['child']);
			$children = getAll($row['child']);
			//if($children)$child['children'] = $children;
			$node['children'][] = $child;
		}
	} else return false;
	return $node;
}

function get($id=0){
	global $sql;
	$rows = $sql->getRow(array(
		'table'=>'nodes',
		'row' => '*',
		'where' => 'id="'.$id.'"'
	));
	if(mysql_num_rows($rows)){
		$node = mysql_fetch_assoc($rows);
		return $node;
	} else return false;
}

function save($id, $html){
	global $sql;
	$rows = $sql->updateRow(array(
		'table'=>'nodes',
		'row' => '*',
		'where' => 'id="'.$id.'"',
		'value' => array(
			'html' => $html
		)
	));
	return true;
}

function getWhuffie($id=0){
	global $sql;
	$rows = $sql->getRow(array(
		'table'=>'nodes',
		'row' => '*',
		'where' => 'id="'.$id.'"'
	));
	if(mysql_num_rows($rows)){
		$node = mysql_fetch_assoc($rows);
		return $node['whuffie'];
	} else return false;
}
function voteUp($id){
	global $sql;
	$whuffie = getWhuffie($id);
	$rows = $sql->updateRow(array(
		'table'=>'nodes',
		'row' => '*',
		'where' => 'id="'.$id.'"',
		'value' => array(
			'whuffie' => $whuffie+1
		)
	));
	return true;
}
function voteDown($id){
	global $sql;
	$whuffie = getWhuffie($id);
	$rows = $sql->updateRow(array(
		'table'=>'nodes',
		'row' => '*',
		'where' => 'id="'.$id.'"',
		'value' => array(
			'whuffie' => $whuffie-1
		)
	));
	return true;
}

function search($value=''){
	global $sql;
	$rows = $sql->getRow(array(
		'table'=>'nodes',
		'row' => '*',
		'where' => 'html LIKE "%'.$value.'%"'
	));
	if(mysql_num_rows($rows)){
		$node = mysql_fetch_assoc($rows);
		return $node;
	} else return false;
}




extract($_REQUEST);

if(isset($action)){
	connect();
	switch($action){
		case 'getAll':
			echo json_encode(getAll());
			break;
		case 'save':
			$save = save($id, $html);
			if($save)echo 1;
			break;
		case 'voteUp':
			voteUp($id);
			break;
		case 'voteDown':
			voteDown($id);
			break;
		case 'search':
			$results = search($value);
			echo json_encode($results);
			break;
	}
}

?>

