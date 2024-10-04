import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import "./config";
import { db } from "./db/setup";
import { shortCodes } from "./db/schema";
import { eq } from "drizzle-orm";
import ShortUniqueId from "short-unique-id";
import bcrypt from "bcryptjs";

type Record = typeof shortCodes.$inferSelect;

const app = new Hono();
const { randomUUID } = new ShortUniqueId({
	length: 6,
});

app.use("*", cors());

app.get("/", (c) => {
	return c.json({ message: "Hello Hono!" });
});

app.get("/destination", async (c) => {
	try {
		const shortCode = c.req.query("shortCode") ?? "";
		const records = await db
			.select()
			.from(shortCodes)
			.where(eq(shortCodes.shortCode, shortCode));

		if (records.length === 0) {
			return c.json({ message: "Short code not found" }, 404);
		}

		const record = records[0];

		if (record.expirationDate && record.expirationDate < new Date()) {
			return c.json({ message: "Short code expired" }, 410);
		}

		if (record.password) {
			const password = c.req.query("password") ?? "";
			const validPassword = await bcrypt.compare(
				password,
				record.password
			);

			if (!validPassword) {
				return c.json({ message: "Wrong password" }, 401);
			}
		}

		return c.json({ destination: record.destination });
	} catch (error) {
		return c.json({ message: "Unexpected error occurred" }, 500);
	}
});

app.post("/shorten-url", async (c) => {
	try {
		const { destination, customShortCode, password, expirationDate } =
			await c.req.json();

		const record: Omit<Record, "createdAt"> = {
			destination: "",
			shortCode: "",
			password: null,
			expirationDate: null,
		};

		if (!destination) {
			return c.json(
				{
					field: "destination",
					message: "Destination URL is required",
				},
				400
			);
		} else {
			const expression =
				/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
			const regex = new RegExp(expression);
			const matches = destination.match(regex);

			if (matches === null || matches.length !== 1) {
				return c.json(
					{ field: "destination", message: "Invalid URL" },
					400
				);
			}

			record.destination = destination;
		}

		if (customShortCode) {
			if (customShortCode.length > 255) {
				return c.json(
					{
						field: "customShortCode",
						message: "Custom short code is too long",
					},
					400
				);
			}

			// check if custom short code already exists
			const records = await db
				.select()
				.from(shortCodes)
				.where(eq(shortCodes.shortCode, customShortCode));

			if (records.length > 0) {
				return c.json(
					{
						field: "customShortCode",
						message: "Custom short code already exists",
					},
					400
				);
			}

			record.shortCode = customShortCode;
		} else {
			// generate short code
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

			record.shortCode = shortCode;
		}

		if (password) {
			const salt = await bcrypt.genSalt(10);
			const hash = await bcrypt.hash(password, salt);
			record.password = hash;
		}

		if (expirationDate) {
			record.expirationDate = new Date(expirationDate);
		}

		await db.insert(shortCodes).values(record);
		return c.json({ shortCode: record.shortCode }, 201);
	} catch (error) {
		console.error(error);
		return c.json({ message: "Unexpected error occurred" }, 500);
	}
});

const port = 3001;
console.log(`Server is running on port ${port}`);

serve({
	fetch: app.fetch,
	port,
});
