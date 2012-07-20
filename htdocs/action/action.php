<?php
//get configuration file for database pointer
$config = file_get_contents('../config.json');
$config = json_decode($config, true);
include('../includes/class.sql.php');


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

//get all nodes and links in tree
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
//get all nodes
function getNodes(){
	global $sql;
	$nodes = array();
	//get children
	$rows = $sql->getRow(array(
		'table'=>'nodes',
		'row' => '*',
		'where' => 'id>=0'
	));
	if(mysql_num_rows($rows)){
		while($node = mysql_fetch_assoc($rows)){
			$nodes[] = $node;
		}
	} else return false;
	return $nodes;
}
//get all links
function getLinks(){
	global $sql;
	$links = array();
	//get children
	$rows = $sql->getRow(array(
		'table'=>'links',
		'row' => '*',
		'where' => 'parent>=0'
	));
	if(mysql_num_rows($rows)){
		while($link = mysql_fetch_assoc($rows)){
			$links[] = $link;
		}
	} else return false;
	return $links;
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
function getChildrenIds($id=0){
	global $sql;
	$links = array();
	//get children
	$rows = $sql->getRow(array(
		'table'=>'links',
		'row' => '*',
		'where' => 'parent="' . $id . '"'
	));
	if(mysql_num_rows($rows)){
		while($link = mysql_fetch_assoc($rows)){
			$links[] = $link['child'];
		}
	} else return false;
	return $links;
}
function getChildren($id=0){
	global $sql;
	$children = getChildrenIds($id);
	$nodes = array();
	foreach($children as $child){
		$rows = $sql->getRow(array(
			'table'=>'nodes',
			'row' => '*',
			'where' => 'id="'.$child.'"'
		));
		$node = mysql_fetch_assoc($rows);
		$nodes[] = $node;
	}
	return $nodes;
}
function getChildrenWhuffie($id=0){
	global $sql;
	$children = getChildrenIds($id);
	$totalWhuffie = 0;
	foreach($children as $child){
		$rows = $sql->getRow(array(
			'table'=>'nodes',
			'row' => '*',
			'where' => 'id="'.$child.'"'
		));
		$node = mysql_fetch_assoc($rows);
		$totalWhuffie += $node['whuffie'];
	}
	return $totalWhuffie;
}

function updateChildNodePositions($id){
	global $sql;
	$parent = get($id);
	$children = getChildren($id);
	$pi = pi();
	$totalChildren = count($children);
	$childrenWhuffie = getChildrenWhuffie($id);
	$circumference = $childrenWhuffie;
	$averageTheta = $circumference/$totalChildren;
	$diameter = $circumference/$pi;
	$radius = $diameter/2;
	$theta = 0;
	$averageChildRadius = $averageTheta/2;
	foreach($children as $child){
		$childRadius = $child['whuffie']/2;
		$extend = $childRadius-$averageChildRadius;
		$degrees = ($theta/$circumference)*360;
		$radians = $degrees*($pi/180);
		$childChildrenWhuffieRadius = getChildrenWhuffie($child['id'])/2;
		$whuffieRadius = $parent['whuffie']/2;
		$extend = ($whuffieRadius+$childRadius+$childChildrenWhuffieRadius)-$averageChildRadius;
		$x = (int)$parent['x'] + ($radius+$extend)*cos($radians);
		$y = (int)$parent['y'] + ($radius+$extend)*sin($radians);
		$rows = $sql->updateRow(array(
			'table'=>'nodes',
			'row' => '*',
			'where' => 'id="'.$child['id'].'"',
			'value' => array(
				'x' => $x,
				'y' => $y,
			)
		));
		$theta += $averageTheta;
	}
	return true;
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

function createChild($parent, $x, $y){
	global $sql;
	$parentNode = get($parent);
	$rows = $sql->createRow(array(
		'table'=>'nodes',
		'row' => '*',
		'value' => array(
			'whuffie' => $parentNode['whuffie'],
			'html'=>$parentNode['html'],
			'x'=>$x,
			'y'=>$y
		)
	));
	$child = $sql->create_id;
	$rows = $sql->createRow(array(
		'table'=>'links',
		'row' => '*',
		'value' => array(
			'parent' => $parent,
			'child' => $child,
			'whuffie'=>1
		)
	));
	return true;
}
function createLink($parent, $child){
	global $sql;
	$rows = $sql->createRow(array(
		'table'=>'links',
		'row' => '*',
		'value' => array(
			'parent' => $parent,
			'child' => $child,
			'whuffie'=>1
		)
	));
	return true;
}




extract($_REQUEST);

if(isset($action)){
	connect();
	switch($action){
		case 'search':
			$results = search($value);
			echo json_encode($results);
			break;
		case 'getAll':
			echo json_encode(getAll());
			break;
		case 'getNodes':
			echo json_encode(getNodes());
			break;
		case 'getLinks':
			echo json_encode(getLinks());
			break;
		case 'save':
			$save = save($id, $html);
			if($save)echo 1;
			break;
		case 'updateChildNodePositions':
			updateChildNodePositions($id);
			break;
		case 'voteUp':
			voteUp($id);
			break;
		case 'voteDown':
			voteDown($id);
			break;
		case 'createChild':
			createChild($id, $x, $y);
			break;
		case 'createLink':
			createLink($id, $child);
			break;
	}
}

?>