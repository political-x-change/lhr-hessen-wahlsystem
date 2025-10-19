import type { Client } from "pg";
import type { Candidate, ICandidateRepository } from "../types";

export class CandidateRepository implements ICandidateRepository {
	constructor(private readonly db: Client) {}

	async findAll(): Promise<Candidate[]> {
		const result = await this.db.query(
			"SELECT id, name, description, image_url, created_at FROM candidates ORDER BY name",
		);

		return result.rows.map((row) => ({
			id: row.id as number,
			name: row.name as string,
			description: row.description as string,
			image_url: row.image_url as string | null,
			created_at: row.created_at as string,
		}));
	}

	async findById(id: number): Promise<Candidate | null> {
		const result = await this.db.query(
			"SELECT id, name, description, image_url, created_at FROM candidates WHERE id = $1",
			[id],
		);

		if (result.rows.length === 0) {
			return null;
		}

		const row = result.rows[0];
		return {
			id: row.id as number,
			name: row.name as string,
			description: row.description as string,
			image_url: row.image_url as string | null,
			created_at: row.created_at as string,
		};
	}
}
