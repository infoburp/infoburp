delimiter $$

CREATE TABLE `links` (
  `ParentID` bigint(20) NOT NULL,
  `ChildID` bigint(20) NOT NULL,
  PRIMARY KEY (`ParentID`,`ChildID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8$$

delimiter $$

CREATE TABLE `nodes` (
  `NodeID` bigint(20) NOT NULL,
  `NodeHTML` longtext,
  `Sequence` bigint(20) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`NodeID`),
  UNIQUE KEY `Sequence_UNIQUE` (`Sequence`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8$$