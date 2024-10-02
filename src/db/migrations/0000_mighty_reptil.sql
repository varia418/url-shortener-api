CREATE TABLE `shortcodes` (
	`shortcode` varchar(255) NOT NULL,
	`destination` text NOT NULL,
	`password` varchar(255) NOT NULL,
	`expirationDate` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shortcodes_shortcode` PRIMARY KEY(`shortcode`)
);
