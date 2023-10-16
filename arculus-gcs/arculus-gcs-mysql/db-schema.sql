-- MySQL dump 10.13  Distrib 8.0.32, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: policymanager
-- ------------------------------------------------------
-- Server version	8.0.34

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `device_task`
--
CREATE DATABASE `policymanager`;
use `policymanager`;
DROP TABLE IF EXISTS `device_task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `device_task` (
  `dt_id` int NOT NULL AUTO_INCREMENT,
  `device_id` int DEFAULT NULL,
  `task_id` int DEFAULT NULL,
  PRIMARY KEY (`dt_id`),
  KEY `device_id` (`device_id`),
  KEY `task_id` (`task_id`),
  CONSTRAINT `device_task_ibfk_1` FOREIGN KEY (`device_id`) REFERENCES `trusted_device` (`device_id`),
  CONSTRAINT `device_task_ibfk_2` FOREIGN KEY (`task_id`) REFERENCES `task` (`task_id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `device_task`
--

LOCK TABLES `device_task` WRITE;
/*!40000 ALTER TABLE `device_task` DISABLE KEYS */;
INSERT INTO `device_task` VALUES (36,15,1),(37,15,4),(44,15,5),(45,15,7);
/*!40000 ALTER TABLE `device_task` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `policy`
--

DROP TABLE IF EXISTS `policy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `policy` (
  `policy_id` varchar(20) NOT NULL,
  `policy_start` varchar(30) DEFAULT NULL,
  `policy_expiry` varchar(30) DEFAULT NULL,
  `source_ip` varchar(20) DEFAULT NULL,
  `dest_ip` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`policy_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `policy`
--

LOCK TABLES `policy` WRITE;
/*!40000 ALTER TABLE `policy` DISABLE KEYS */;
/*!40000 ALTER TABLE `policy` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `privilege`
--

DROP TABLE IF EXISTS `privilege`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `privilege` (
  `privilege_id` int NOT NULL AUTO_INCREMENT,
  `privilege` varchar(20) DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  PRIMARY KEY (`privilege_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `privilege_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `privilege`
--

LOCK TABLES `privilege` WRITE;
/*!40000 ALTER TABLE `privilege` DISABLE KEYS */;
/*!40000 ALTER TABLE `privilege` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'Admin'),(2,'Moderator'),(3,'Viewer');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task`
--

DROP TABLE IF EXISTS `task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task` (
  `task_id` int NOT NULL AUTO_INCREMENT,
  `task_name` varchar(30) DEFAULT NULL,
  `task_type` varchar(20) DEFAULT NULL,
  `traffic_type` varchar(20) DEFAULT NULL,
  `traffic_port` int DEFAULT NULL,
  PRIMARY KEY (`task_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task`
--

LOCK TABLES `task` WRITE;
/*!40000 ALTER TABLE `task` DISABLE KEYS */;
INSERT INTO `task` VALUES (1,'send_command','send','TCP',5001),(2,'send_video','send','UDP',5001),(3,'send_sensordata','send','TCP',5002),(4,'send_posdata','send','UDP',5002),(5,'receive_posdata','receive','UDP',5002),(6,'receive_sensordata','receive','TCP',5002),(7,'receive_video','receive','UDP',5001),(8,'receive_command','receive','TCP',5001);
/*!40000 ALTER TABLE `task` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trusted_device`
--

DROP TABLE IF EXISTS `trusted_device`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trusted_device` (
  `device_id` int NOT NULL AUTO_INCREMENT,
  `device_name` varchar(40) DEFAULT NULL,
  `ip_address` varchar(20) DEFAULT NULL,
  `personnel_rank` int DEFAULT NULL,
  PRIMARY KEY (`device_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trusted_device`
--

LOCK TABLES `trusted_device` WRITE;
/*!40000 ALTER TABLE `trusted_device` DISABLE KEYS */;
INSERT INTO `trusted_device` VALUES (15,'zone1drone1','10.1.0.34',NULL);
/*!40000 ALTER TABLE `trusted_device` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(30) DEFAULT NULL,
  `username` varchar(20) DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  `password_hash` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'admin@umsystem.edu','admin',1,'$2b$10$H6W0865NkOsLCjSZ1fME7eym05sUZfH8NeoYFrMrmgzXlRGr2JcJy'),(5,'saketh.reddy1307@gmail.coms','Saketh',1,'$2b$10$aGSJbbrReDRAeBLS4nkcGOT1uST.evWKTvYfNazkvU1aWcl1CCGJ.');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-10-14 23:24:16
