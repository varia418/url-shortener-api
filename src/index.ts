import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "./config";
import { db } from "./db/setup";
import { shortCodes } from "./db/schema";
import { eq } from "drizzle-orm";

const app = new Hono();

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
			if (record.password !== c.req.query("password")) {
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

		// hash password
		// await db.insert(shortCodes).values({ shortCode: "test", destination });
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
