-- phpMyAdmin SQL Dump
-- version 3.4.10.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jun 18, 2012 at 11:46 PM
-- Server version: 5.5.20
-- PHP Version: 5.3.10

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
CREATE DATABASE IF NOT EXISTS infoburp;
USE infoburp;
--

-- --------------------------------------------------------

--
-- Table structure for table `links`
--

CREATE TABLE IF NOT EXISTS `links` (
  `parent` bigint(20) NOT NULL,
  `child` bigint(20) NOT NULL,
  PRIMARY KEY (`parent`,`child`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `links`
--

INSERT INTO `links` (`parent`, `child`) VALUES
(0, 9),
(0, 10),
(0, 11),
(0, 12),
(0, 13);

-- --------------------------------------------------------

--
-- Table structure for table `nodes`
--

CREATE TABLE IF NOT EXISTS `nodes` (
  `html` longtext,
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `whuffie` int(2) NOT NULL,
  UNIQUE KEY `Sequence_UNIQUE` (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=14 ;

--
-- Dumping data for table `nodes`
--

INSERT INTO `nodes` (`html`, `id`, `whuffie`) VALUES
('infoburp.com', 0, 99),
('test', 9, 77),
('test2', 10, 88),
('test3', 11, 66),
('test4', 12, 99),
('test5', 13, 88);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
