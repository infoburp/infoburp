<?php
	$con = mysql_connect("localhost","root","J1ngle01");
	if(!$con)
	{
		die('error connecting');
	}
	else
	{
		mysql_select_db("springy", $con);
		$cmd = $_GET["cmd"];
		if($cmd == "getnodes")
		{
			GetNodes();
		}
		else if($cmd == "getlinks")
		{
			GetLinks();
		}
		else if($cmd == "createlink")
		{
			CreateLink();
		}
		else if($cmd == "createnode")
		{
			CreateNode();
		}
		else if($cmd == "updatenode")
		{
			UpdateNode();
		}
		else if($cmd == "getnodeid")
		{
			echo sprintf('%04d%04d%04d%04d', mt_rand(32768, 49151), mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(0, 65535));
		}
		else if($cmd == "getdateid")
		{
			
			echo microtime(false);
		}
		mysql_close($con);
	}
	function GetNodes()
	{
		$result = mysql_query("SELECT * FROM nodes order by Sequence");
		while($row = mysql_fetch_array($result))
		{
			echo "{\"NodeID\":\"" . $row['NodeID'] . "\",\"label\":\"" . $row['NodeHTML'] . "\"}";
			echo "\n\r";
		}
	}
	function GetLinks()
	{
		$result = mysql_query("SELECT * FROM links");
		while($row = mysql_fetch_array($result))
		{
			echo "{\"ParentID\":\"" . $row['ParentID'] . "\",\"ChildID\":\"" . $row['ChildID'] . "\"}";
			echo "\n\r";
		}
	}
	function CreateNode()
	{
		//$_GET[html] = str_replace("'","''",$_GET[html]);
		if (!mysql_query("INSERT INTO nodes (NodeID, NodeHTML) VALUES($_GET[nodeid],'$_GET[html]')"))
		{
			die('0');
		}
	}
	function UpdateNode()
	{
		//$_GET[html] = str_replace("'","''",$_GET[html]);
		if (!mysql_query("update nodes set html = '$_GET[html]' where nodeid = $_GET[nodeid]"))
		{
			die('0');
		}
	}
	function CreateLink()
	{
		if (!mysql_query("INSERT INTO links (ParentID, ChildID) VALUES($_GET[parentid],$_GET[childid])"))
		{
			die('0');
		}
	}
	
 ?>