import { NextResponse } from "next/server";
import { container } from "@/lib/container";
import { AppError } from "@/lib/errors";

export async function GET() {
	try {
		const getCandidatesUseCase = await container.getGetCandidatesUseCase();
		const candidates = await getCandidatesUseCase.execute();

		return NextResponse.json({
			candidates,
		});
	} catch (error) {
		if (error instanceof AppError) {
			return NextResponse.json(
				{ error: error.message },
				{ status: error.statusCode },
			);
		}

		return NextResponse.json(
			{ error: "Failed to fetch candidates" },
			{ status: 500 },
		);
	}
}
