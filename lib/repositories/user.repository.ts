import { Client } from "@libsql/client";
import { IUserRepository, User } from "../types";

export class UserRepository implements IUserRepository {
  constructor(private readonly db: Client) {}

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.execute({
      sql: "SELECT id, email, token_used, created_at FROM users WHERE email = ?",
      args: [email],
    });

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id as number,
      email: row.email as string,
      token_used: row.token_used as number,
      created_at: row.created_at as string,
    };
  }

  async findById(id: number): Promise<User | null> {
    const result = await this.db.execute({
      sql: "SELECT id, email, token_used, created_at FROM users WHERE id = ?",
      args: [id],
    });

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id as number,
      email: row.email as string,
      token_used: row.token_used as number,
      created_at: row.created_at as string,
    };
  }

  async create(email: string): Promise<User> {
    const result = await this.db.execute({
      sql: "INSERT INTO users (email, token_used) VALUES (?, 0) RETURNING id, email, token_used, created_at",
      args: [email],
    });

    if (result.rows.length === 0) {
      // Fallback for databases that don't support RETURNING
      const user = await this.findByEmail(email);
      if (!user) {
        throw new Error("Failed to create user");
      }
      return user;
    }

    const row = result.rows[0];
    return {
      id: row.id as number,
      email: row.email as string,
      token_used: row.token_used as number,
      created_at: row.created_at as string,
    };
  }

  async markTokenAsUsed(userId: number): Promise<void> {
    await this.db.execute({
      sql: "UPDATE users SET token_used = 1 WHERE id = ?",
      args: [userId],
    });
  }
}
