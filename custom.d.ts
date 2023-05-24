import { MongoClient } from "mongodb";

export {};

declare global {
	interface Window {
		mongoClient: Promise<MongoClient>;
	}
}
