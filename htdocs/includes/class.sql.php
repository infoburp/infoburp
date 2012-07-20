<?php

/*
	SQL helper class



	Created by: arunner(arunnercoding[at]gmail[dot]com)
	Credit to: Robert(robrocker7[at]gmail[dot]com) for help(you rock man!)



	Description: A general list of mysql functions to create, change, remove, and handle data tranfered to and from an SQL database



	Functions(description before each function):
		- connect
		- db
		- def
		- error
		- checkVar
		- createRow
		- getRow
		- updateRow
		- removeRow
		- execute

		
		
	Example Usage:

		include('php/class.sql.php');
		
		$sql->connect(array(
			'host'=>'localhost',
			'user'=>'root',
			'pass'=>''
		));
		$sql->db('test');
		
		$sql->def(array(
			'table'=>'user',
		));

		$sql->createRow(array(
			'value'=>array(
				'name'=>'bill'
			)
		));

		$rows = $sql->getRow(array(
			'table' => 'user',
			'row' => '*',
			'where' => 'id>=0'
		));

		while($row = mysql_fetch_array($rows)){
			echo $row['name'];
		}

		
		
	Change Log:
		Me:
			- SQLHelper created. Originally called marble
			- General functions are created through creative ideas as a novice
			- Program is tested to be functional
		Robert:
			- Changed class nam eto SQLHelper from sql to elimiate confusion between variable names and class names
			- Added getter and setter functions for constants
			- Set all global variables to private for proper encapsulation
			- Refactored createRow, getRow, updateRow, removeRow
			- Added Debug mode
			- Added outputErrors function to format errors
		Me:
			- Decided to pretty much write everything over, created shorter functions[inspired by jquery]
			- functions now use key=>value pairs for function parameters so it doesn't matter what order you put it in
			- class revised, commented, and tested. works great. I can now sleep in peace. j/k
*/



class sql{

	private $_def = array(
		'table'=>NULL,
		'where'=>NULL,
		'value'=>NULL,
		'row'=>NULL,
	);
	private $query = null;
	public $create_id = null;
	private $result = false;
	private $_error = array();
	private $host = false;
	private $user = false;
	private $pass = false;
	private $connection = false;
	private $db = false;



	/*
	description: connects to mysql host
	param: array with key=>value pair containing host, user, and pass
	*/
	public function connect($v){
		if(is_array($v) && $this->checkVar(array('host', 'user', 'pass'), $v)){
			extract($v);
			$this->connection = mysql_connect($host, $user, $pass);
			if($this->connection){
				$this->_host = $host;
				$this->_user = $user;
				$this->_pass = $pass;
				return true;
			}
			return false;
		}
		else return $this->_connection;
	}

	/*
	description: connects to mysql db
	param: string
	*/
	public function db($v){
		$this->db = $v;
		mysql_select_db($v);
	}
	
	/*
	description: sets and gets default variables
	param:
		array:
			key=>value pair: sets variable as value; returns true;
		string:
			[1]: gets variable
			[1] and [2]: sets variable
	*/
	public function def($v){
		$return = true;
		if(is_array($v)){
			foreach($v as $key => $value){
				if(isset($key) && !empty($key)){
					$this->_def[$key] = $value;
				}
			}
		}
		else{
			$args = func_get_args();
			if(isset($args[1])){
				$this->_def[$v] = $args[1];
			}
			else{
				$return = $this->_def[$v];
			}
		}
		return $return;
	}

	/*
	description: function to add and retrieve to and from the _error array
	param:
		[1](string): returns value out of _error using value as key
		[1](null): returns _error array
		[1](string);2(string): sets value in _error using [1] as key and [2] as value
		[1](null);2(string): appends value to _error using [2] as value
	*/
	public function error($key, $value){
		$return = true;
		if(isset($value)){
			if($key)$this->_error[$key] = $value;
			else $this->_error[] = $value;
		}
		else{
			if($key)$return = $this->_error[$key];
			else $return = $this->_error;
		}
		return $return;
	}

	/*
	description: checks if variables are set
	param:
		[1]: array with key=>value pair as variables names to check
		[2]: array with key=>value pair as variables values to check
	*/
	public function checkVar($m, $v){
		$return = true;
		foreach($m as $value){
			if(!array_key_exists($value, $v) && !isset($this->{$value})){
				$this->error(NULL, $value . ' required');
				$return = false;
			}
		}
		return $return;
	}

	/*
	description: function to create a mysql row
	param:
		array:
			key=>value pair: table, value
	returns: query
	*/
	public function createRow($v){
		$return = true;
		$v = array_merge($this->_def, $v);
		if($this->checkVar(array('table', 'value'), $v)){
			extract($v);
			$keys = implode(array_keys($value),',');
			$values = implode(array_values($value),'","');
			$query = 'INSERT INTO ' . $table . ' (' . $keys . ') VALUES("' . $values . '")';
			$return = $this->execute($query);
			$this->create_id = mysql_insert_id();
		}
		return $return;
	}

	/*
	description: function to get a mysql row
	param:
		array:
			key=>value pair: table, row, where, limit
	returns: query
	*/
	public function getRow($v){
		$return = true;
		$v = array_merge($this->_def, $v);
		if($this->checkVar(array('row', 'where'), $v)){
			extract($v);
			$query = 'SELECT ' . $row . ' FROM ' . $table;
			$query .= ' WHERE ' . $where;
			if(isset($orderby))$query .= ' ORDER BY ' . $orderby;
			if(isset($limit) && is_array($limit))$query .= ' LIMIT ' . $limit[0] . ',' . $limit[1];
			$return = $this->execute($query);
		}
		return $return;
	}

	/*
	description: function to update a mysql row
	param:
		array:
			key=>value pair: table, value, where
	returns: query
	*/
	public function updateRow($v){
		$return = true;
		$v = array_merge($this->_def, $v);
		if($this->checkVar(array('table', 'value', 'where'), $v)){
			extract($v);
			$value_str = '';
			foreach($value as $key => $val)$value_str .= $key . '="' . $val . '",';
			$value_str = preg_replace('/[,]$/', '', $value_str);
			$query = 'UPDATE ' . $table . ' SET ' . $value_str . ' WHERE ' . $where;
			$return = $this->execute($query);
		}
		return $return;
	}

	/*
	description: function to remove a mysql row
	param:
		array:
			key=>value pair: table, where
	returns: query
	*/
	public function removeRow($v){
		$return = true;
		$v = array_merge($this->_def, $v);
		if($this->checkVar(array('table', 'where'), $v)){
			extract($v);
			$query = 'DELETE FROM ' . $table . ' WHERE ' . $where;
			$return = $this->execute($query);
		}
		return $return;
	}

	/*
	description: function to execute a mysql query
	param:
		string: the query
	returns: result
	*/
	public function execute($query){
		$this->query = $query;
		$this->time_start = microtime(true);
		$this->result = mysql_query($query);
		$this->time_end = microtime(true);
		if(!$this->result){
			$this->error(NULL, $query,mysql_error());
			return false;
		}
		return $this->result;
	}
	
}

?>
