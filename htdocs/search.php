<?php
if($_POST)
{
include('includes/class.sql.php');
$q=$_POST['searchword'];
	/*connect();
	$sql->def(array(
		'table'=>'nodes',
	));

	$rows = $sql->getRow(array(
		'row' => 'html',
		'where' => 'html like \'%$q%\''
	)); */
	
	mysql_select_db('infoburp');
	$rows=
	mysql_query("select html from nodes where html like '%$q%'");

	
	while($row=mysql_fetch_array($rows))
	{
		// code to display node details
		$disphtml = $row['html'];
		echo($disphtml);
		?>
		<div class="display_box" align="left">
		<?php echo($disphtml); ?>
		</div>
		<?php
	}
}
else
{}
?>