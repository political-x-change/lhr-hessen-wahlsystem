import { type NextRequest, NextResponse } from "next/server";
import { container } from "@/lib/container";
import { AppError } from "@/lib/errors";

export async function POST(request: NextRequest) {
	try {
		const { email } = await request.json();

		const registerUserUseCase = container.getRegisterUserUseCase();
		const result = await registerUserUseCase.execute({ email });

		return NextResponse.json({
			message: result.message,
		});
	} catch (error) {
		if (error instanceof AppError) {
			return NextResponse.json(
				{ error: error.message },
				{ status: error.statusCode },
			);
		}

		// Handle unexpected errors
		const errorMessage =
			error instanceof Error
				? error.message
				: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.";

		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
