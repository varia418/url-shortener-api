import {
	text,
	mysqlTable,
	timestamp,
	varchar,
	date,
} from "drizzle-orm/mysql-core";

export const shortCodes = mysqlTable("shortcodes", {
	shortCode: varchar("shortcode", { length: 255 }).notNull().primaryKey(),
	destination: text("destination").notNull(),
	password: varchar("password", { length: 255 }),
	expirationDate: date("expirationDate"),
	createdAt: timestamp("createdAt").defaultNow().notNull(),
});
