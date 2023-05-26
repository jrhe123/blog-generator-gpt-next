import { MongoClient } from "mongodb";

export {};

declare global {
	var mongoClient: Promise<MongoClient>;
}
