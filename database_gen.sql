CREATE DATABASE IF NOT EXISTS `login_app` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `login_app`;

CREATE TABLE IF NOT EXISTS `accounts` (
  `username` varchar(50) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

INSERT INTO `accounts` (`username`, `password`, `email`) VALUES ('test', 'test', 'test@test.com');

CREATE USER 'ulogin'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
GRANT ALL PRIVILEGES ON `login_app`.* TO 'ulogin'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;