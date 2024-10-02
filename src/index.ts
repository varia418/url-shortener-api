import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "./config";
import { db } from "./db/setup";
import { shortCodes } from "./db/schema";
import { eq } from "drizzle-orm";
import ShortUniqueId from "short-unique-id";
import bcrypt from "bcryptjs";

type Record = typeof shortCodes.$inferSelect;

const app = new Hono();
const { randomUUID, collisionProbability, uniqueness } = new ShortUniqueId({
	length: 6,
});

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

app.get("/destination", async (c) => {
	try {
		const shortCode = c.req.query("shortCode") ?? "";
		const records = await db
			.select()
			.from(shortCodes)
			.where(eq(shortCodes.shortCode, shortCode));

		if (records.length === 0) {
			return c.text("Short code not found", 404);
		}

		const record = records[0];

		if (record.expirationDate && record.expirationDate < new Date()) {
			return c.text("Short code expired", 410);
		}

		if (record.password) {
			const password = c.req.query("password") ?? "";
			const validPassword = await bcrypt.compare(
				password,
				record.password
			);

			if (!validPassword) {
				return c.text("Wrong password", 401);
			}
		}

		return c.json({ destination: record.destination });
	} catch (error) {
		return c.text("Unexpected error occurred", 500);
	}
});

app.post("/shorten-url", async (c) => {
	try {
		const { destination, customShortCode, password, expirationDate } =
			await c.req.json();
		let shortCode: string;
		let shortCodeExists = true;
		do {
			shortCode = randomUUID();
			const records = await db
				.select()
				.from(shortCodes)
				.where(eq(shortCodes.shortCode, shortCode));

			if (records.length === 0) {
				shortCodeExists = false;
			}
		} while (shortCodeExists);

		const record: Omit<Record, "createdAt"> = {
			shortCode,
			destination,
			password: null,
			expirationDate: null,
		};

		if (customShortCode) {
			// check if customShortCode already exists
			record.shortCode = customShortCode;
		}

		if (password) {
			const salt = await bcrypt.genSalt(10);
			const hash = await bcrypt.hash(password, salt);
			record.password = hash;
		}

		if (expirationDate) {
			// validate date
			record.expirationDate = new Date(expirationDate);
		}

		await db.insert(shortCodes).values(record);
		return c.text("Created!", 201);
	} catch (error) {
		return c.text("Unexpected error occurred", 500);
	}
});

const port = 3001;
console.log(`Server is running on port ${port}`);

serve({
	fetch: app.fetch,
	port,
});
