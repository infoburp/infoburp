<!DOCTYPE html!>
<html>
	<head>
		<title>infoburp.com</title>
		<meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>
		<meta name="wot-verification" content="5e36be2496eee31d0aa2"/>
		<!-- jquery -->
		<script type="text/javascript" src="vendors/jquery/jquery.js"></script>
		<script type="text/javascript">
			var $$ = $.noConflict();
		</script>
		<link type="text/css" href="vendors/jquery/themes/south-street/jquery-ui-1.8.20.custom.css" />
		<script type="text/javascript" src="vendors/jquery/jquery-1.7.2.min.js"></script>
		<!-- raphael -->
		<script type="text/javascript" src="vendors/raphael/raphael.js"></script>
		<!-- info burp -->
		<script type="text/javascript" src="js/init.js?rand=<?php echo rand(); ?>"></script>
		<script type="text/javascript" src="js/load.js?rand=<?php echo rand(); ?>"></script>
		<script type="text/javascript" src="js/create.js?rand=<?php echo rand(); ?>"></script>
		<script type="text/javascript" src="js/update.js?rand=<?php echo rand(); ?>"></script>
		<script type="text/javascript" src="js/event.js?rand=<?php echo rand(); ?>"></script>
		<script type="text/javascript" src="js/action.js?rand=<?php echo rand(); ?>"></script>
		<script type="text/javascript" src="js/search.js"></script>
		<script type="text/javascript" src="js/node.js?rand=<?php echo rand(); ?>"></script>
		<link type="text/css" href="css/style.css" rel="stylesheet" />
	</head>
	<body>
		<input type="text" id="searchbox" class="searchbox">

		<div id="bar">
			<ul id="_bar">
				<li id="logo"><img id="_logo" src="/img/logoIB.png" /></li>
				<li id="whuffie">whuffie (w<span id="_whuffie">0)</li>
				
				<li id="search"><input id="_search" value="search" /></li>
				<li id="signin"><span id="_signin">&lt;sign in:&gt;</li>
				
				<li id="youtube"><img id="_openid" src="/img/youtube.png" /></li>
				<li id="facebook"><img id="_google" src="/img/facebook.png" /></li>
				<li id="twitter"><img id="_twitter" src="/img/twitter.png" /></li>
			</ul>
		</div>
		<div id="bottombar"><div id="_bottombar"></div></div>

		<div id="infoburp">
  			<div class="html"></div>
		</div>
	</body>
</html>
