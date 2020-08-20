CREATE DATABASE  IF NOT EXISTS `coronavoice` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `coronavoice`;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `event`
--

DROP TABLE IF EXISTS `event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `event` (
  `event_id` int(11) NOT NULL AUTO_INCREMENT,
  `owner_id` int(11) NOT NULL,
  `name` varchar(45) NOT NULL,
  `question` varchar(255) NOT NULL,
  `followup_enabled` tinyint(4) NOT NULL DEFAULT '1',
  `followup_label` varchar(255) DEFAULT NULL,
  `extra_fields` json DEFAULT NULL,
  `show_results` tinyint(4) DEFAULT '0',
  `show_feedback` tinyint(4) DEFAULT '0',
  `status` int(11) NOT NULL DEFAULT '1',
  `target` json DEFAULT NULL,
  `cooldown_period` int(11) NOT NULL DEFAULT '0',
  `date_created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expiry_date` datetime DEFAULT NULL,
  `fb_link` varchar(255) DEFAULT NULL,
  `description` longtext,
  `thanks_text` longtext,
  PRIMARY KEY (`event_id`),
  UNIQUE KEY `event_id_UNIQUE` (`event_id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `feedback`
--

DROP TABLE IF EXISTS `feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `feedback` (
  `feedback_id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `extra_feedback_type` int(11) NOT NULL DEFAULT '0',
  `file_location` varchar(255) DEFAULT NULL,
  `extra_data` json DEFAULT NULL,
  `date_created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `join_code` varchar(10) DEFAULT NULL,
  `consent_public` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`feedback_id`),
  UNIQUE KEY `feedback_id_UNIQUE` (`feedback_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9174 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `session`
--

DROP TABLE IF EXISTS `session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `session` (
  `session_id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` varchar(45) NOT NULL,
  `name` varchar(45) NOT NULL,
  `metadata` json DEFAULT NULL,
  `status` int(11) NOT NULL,
  `privacy` int(11) DEFAULT '0',
  `expiry_date` datetime DEFAULT NULL,
  `target` json DEFAULT NULL,
  `join_code` varchar(45) DEFAULT NULL,
  `fb_link` varchar(255) DEFAULT NULL,
  `date_created` datetime DEFAULT CURRENT_TIMESTAMP,
  `date_modified` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`session_id`),
  UNIQUE KEY `session_id_UNIQUE` (`session_id`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `session_event`
--

DROP TABLE IF EXISTS `session_event`;
/*!50001 DROP VIEW IF EXISTS `session_event`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `session_event` AS SELECT 
 1 AS `session_id`,
 1 AS `event_id`,
 1 AS `session_name`,
 1 AS `session_metadata`,
 1 AS `session_status`,
 1 AS `privacy`,
 1 AS `session_expiry_date`,
 1 AS `session_target`,
 1 AS `join_code`,
 1 AS `session_fb_link`,
 1 AS `session_date_created`,
 1 AS `session_date_modified`,
 1 AS `event_date_created`,
 1 AS `event_date_modified`,
 1 AS `event_status`,
 1 AS `owner_id`,
 1 AS `event_name`,
 1 AS `question`,
 1 AS `followup_enabled`,
 1 AS `followup_label`,
 1 AS `extra_fields`,
 1 AS `show_results`,
 1 AS `show_feedback`,
 1 AS `cooldown`,
 1 AS `event_expiry_date`,
 1 AS `description`,
 1 AS `thanks_text`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `subscription`
--

DROP TABLE IF EXISTS `subscription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `subscription` (
  `sub_id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `subscribed` int(11) NOT NULL DEFAULT '1',
  `date_created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`sub_id`),
  UNIQUE KEY `sub_id_UNIQUE` (`sub_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4091 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `user` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_fb_id` varchar(35) NOT NULL,
  `email` varchar(60) DEFAULT NULL,
  `date_created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_access` datetime DEFAULT NULL,
  `name` varchar(45) DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `user_role` varchar(10) NOT NULL DEFAULT 'user',
  `date_modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_id_UNIQUE` (`user_id`),
  UNIQUE KEY `user_fb_id_UNIQUE` (`user_fb_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7549 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `user_events`
--

DROP TABLE IF EXISTS `user_events`;
/*!50001 DROP VIEW IF EXISTS `user_events`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `user_events` AS SELECT 
 1 AS `session_id`,
 1 AS `event_id`,
 1 AS `owner_id`,
 1 AS `session_name`,
 1 AS `event_name`,
 1 AS `question`,
 1 AS `session_status`,
 1 AS `event_status`,
 1 AS `cooldown`,
 1 AS `privacy`,
 1 AS `session_expiry_date`,
 1 AS `date_created`,
 1 AS `date_modified`,
 1 AS `sub_id`,
 1 AS `user_id`,
 1 AS `subscribed`,
 1 AS `sub_date_created`,
 1 AS `sub_date_modified`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `user_permission`
--

DROP TABLE IF EXISTS `user_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `user_permission` (
  `user_permission_id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` varchar(45) NOT NULL DEFAULT 'admin',
  `date_created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_permission_id`),
  UNIQUE KEY `user_permission_id_UNIQUE` (`user_permission_id`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping events for database 'coronavoice'
--

--
-- Dumping routines for database 'coronavoice'
--

--
-- Final view structure for view `session_event`
--

/*!50001 DROP VIEW IF EXISTS `session_event`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`coronavoice`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `session_event` AS select `session`.`session_id` AS `session_id`,`session`.`event_id` AS `event_id`,`session`.`name` AS `session_name`,`session`.`metadata` AS `session_metadata`,`session`.`status` AS `session_status`,`session`.`privacy` AS `privacy`,`session`.`expiry_date` AS `session_expiry_date`,`session`.`target` AS `session_target`,`session`.`join_code` AS `join_code`,`session`.`fb_link` AS `session_fb_link`,`session`.`date_created` AS `session_date_created`,`session`.`date_modified` AS `session_date_modified`,`event`.`date_created` AS `event_date_created`,`event`.`date_modified` AS `event_date_modified`,`event`.`status` AS `event_status`,`event`.`owner_id` AS `owner_id`,`event`.`name` AS `event_name`,`event`.`question` AS `question`,`event`.`followup_enabled` AS `followup_enabled`,`event`.`followup_label` AS `followup_label`,`event`.`extra_fields` AS `extra_fields`,`event`.`show_results` AS `show_results`,`event`.`show_feedback` AS `show_feedback`,`event`.`cooldown_period` AS `cooldown`,`event`.`expiry_date` AS `event_expiry_date`,`event`.`description` AS `description`,`event`.`thanks_text` AS `thanks_text` from (`session` join `event` on((`session`.`event_id` = `event`.`event_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `user_events`
--

/*!50001 DROP VIEW IF EXISTS `user_events`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`coronavoice`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `user_events` AS select `session`.`session_id` AS `session_id`,`session`.`event_id` AS `event_id`,`event`.`owner_id` AS `owner_id`,`session`.`name` AS `session_name`,`event`.`name` AS `event_name`,`event`.`question` AS `question`,`session`.`status` AS `session_status`,`event`.`status` AS `event_status`,`event`.`cooldown_period` AS `cooldown`,`session`.`privacy` AS `privacy`,`session`.`expiry_date` AS `session_expiry_date`,`session`.`date_created` AS `date_created`,`session`.`date_modified` AS `date_modified`,`subscription`.`sub_id` AS `sub_id`,`subscription`.`user_id` AS `user_id`,`subscription`.`subscribed` AS `subscribed`,`subscription`.`date_created` AS `sub_date_created`,`subscription`.`date_modified` AS `sub_date_modified` from ((`session` join `event` on((`session`.`event_id` = `event`.`event_id`))) left join `subscription` on((`session`.`session_id` = `subscription`.`session_id`))) where (`session`.`privacy` = 1) union select `session`.`session_id` AS `session_id`,`session`.`event_id` AS `event_id`,`event`.`owner_id` AS `owner_id`,`session`.`name` AS `session_name`,`event`.`name` AS `event_name`,`event`.`question` AS `question`,`session`.`status` AS `session_status`,`event`.`status` AS `event_status`,`event`.`cooldown_period` AS `cooldown`,`session`.`privacy` AS `privacy`,`session`.`expiry_date` AS `session_expiry_date`,`session`.`date_created` AS `date_created`,`session`.`date_modified` AS `date_modified`,`subscription`.`sub_id` AS `sub_id`,`subscription`.`user_id` AS `user_id`,`subscription`.`subscribed` AS `subscribed`,`subscription`.`date_created` AS `sub_date_created`,`subscription`.`date_modified` AS `sub_date_modified` from (`subscription` left join (`session` join `event` on((`session`.`event_id` = `event`.`event_id`))) on((`session`.`session_id` = `subscription`.`session_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-07-23 10:56:14

