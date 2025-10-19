import type { Client } from "@libsql/client";
import type { ICandidateRepository, Candidate } from "../types";

export class CandidateRepository implements ICandidateRepository {
	constructor(private readonly db: Client) {}

	async findAll(): Promise<Candidate[]> {
		const result = await this.db.execute(
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
		const result = await this.db.execute({
			sql: "SELECT id, name, description, image_url, created_at FROM candidates WHERE id = ?",
			args: [id],
		});

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

	async create(
		candidate: Omit<Candidate, "id" | "created_at">,
	): Promise<Candidate> {
		const result = await this.db.execute({
			sql: "INSERT INTO candidates (name, description, image_url) VALUES (?, ?, ?) RETURNING id, name, description, image_url, created_at",
			args: [candidate.name, candidate.description, candidate.image_url],
		});

		if (result.rows.length === 0) {
			throw new Error("Failed to create candidate");
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
