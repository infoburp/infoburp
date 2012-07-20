<?php

/*
 * AMAZON LINK LOCALISER ajax response page
 * checks if the proposed link is valid
 *
 * @author Pete Williams
 * @url http://petewilliams.info
 */

header("Content-type: application/javascript");

switch ( $_REQUEST['strAction'] ) {
	case 'search':
		searchLink();
		break;
	case 'version':
		echo "1.7.2";
		break;
	default:
		checkLinks();
		break;
}

function checkLinks() {

	// get URL
	$strTld 		= $_REQUEST['strTld'];
	$strAffiliateId = $_REQUEST['strAffiliateId'];
	$strLinks		= $_REQUEST['strLinks'];
	$arrLinks		= explode( '|', $strLinks );

	foreach ( $arrLinks as $strAsin ) {

		$strLink = "http://www.amazon.$strTld/exec/obidos/ASIN/$strAsin/$strAffiliateId";

		$arrHeaders = get_headers($strLink, 1);

		// if not found, then search for it
		if ( strpos( $arrHeaders[0], '404' ) || strpos( $arrHeaders[1], '404' ) ) {
			echo "arrLinksToCheck[ '$strAsin' ].searchLink();\n";
		} else {
			echo "arrLinksToCheck[ '$strAsin' ].localiseLink();\n";
		}

	}
}

function searchLink() {
		$strHtml = file_get_contents( $_REQUEST['strLink'], false, null, -1, 100000 );

		$strPattern = '/canonical" href="http:\/\/(.*)\/(.*)\/dp\/([A-Z0-9]{10})/';

		preg_match( $strPattern, $strHtml, $arrMatches );
		$strTitle = str_replace(  '-', '%20', $arrMatches[2] );

		// the canonical ASIN is sometimes different to the original one which confuses the JS, so use the one in the original link
		$strPattern2 = '/\/([A-Z0-9]{10})/';
		preg_match( $strPattern2 , $_REQUEST['strLink'], $arrUrlMatches );

		$strAsin = is_array( $arrUrlMatches ) ? $arrUrlMatches[1] : $arrMatches[3];

		echo "arrLinksToCheck[ '{$strAsin}' ].writeSearchLink( '$strTitle' );\n";

}