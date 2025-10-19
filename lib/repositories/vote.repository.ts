import type { Client } from "@libsql/client";
import type { IVoteRepository, Vote } from "../types";

export class VoteRepository implements IVoteRepository {
	constructor(private readonly db: Client) {}

	async create(candidateId: number): Promise<Vote> {
		const result = await this.db.execute({
			sql: "INSERT INTO votes (candidate_id) VALUES (?) RETURNING id, candidate_id, created_at",
			args: [candidateId],
		});

		if (result.rows.length === 0) {
			throw new Error("Failed to create vote");
		}

		const row = result.rows[0];
		return {
			id: row.id as number,
			candidate_id: row.candidate_id as number,
			created_at: row.created_at as string,
		};
	}

	async countByCandidateId(candidateId: number): Promise<number> {
		const result = await this.db.execute({
			sql: "SELECT COUNT(*) as count FROM votes WHERE candidate_id = ?",
			args: [candidateId],
		});

		if (result.rows.length === 0) {
			return 0;
		}

		return result.rows[0].count as number;
	}
}
