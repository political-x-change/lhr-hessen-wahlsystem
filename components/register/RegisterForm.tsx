"use client";

import { type FormEvent, useState } from "react";
import { SharedAlertBox } from "../shared/SharedAlertBox";
import SharedButton from "../shared/SharedButton";
import SharedInput from "../shared/SharedInput";

export default function RegisterForm() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage("");
		setError("");

		try {
			const response = await fetch("/api/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.error || "Ein Fehler ist aufgetreten");
			} else {
				setMessage(data.message);
				setEmail("");
			}
		} catch {
			setError("Netzwerkfehler. Bitte versuchen Sie es erneut.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4 w-full">
			<SharedInput
				label="E-Mail-Adresse"
				type="email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				required
				placeholder="ihre.email@beispiel.de"
				disabled={loading}
			/>

			{error && <SharedAlertBox type="error" message={error} />}

			{message && <SharedAlertBox type="success" message={message} />}

			<SharedButton type="submit" loading={loading}>
				Registrieren
			</SharedButton>
		</form>
	);
}
