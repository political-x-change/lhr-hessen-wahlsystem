"use client";

import { useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import type { Candidate } from "@/lib/types";
import { SharedAlertBox } from "../shared/SharedAlertBox";
import SharedButton from "../shared/SharedButton";
import SharedSpinner from "../shared/SharedSpinner";
import VotingCandidateCard from "./VotingCandidateCard";

export default function VotingForm() {
	const searchParams = useSearchParams();
	const [token, setToken] = useState("");
	const [candidates, setCandidates] = useState<Candidate[]>([]);
	const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(
		null,
	);
	const [loading, setLoading] = useState(false);
	const [loadingCandidates, setLoadingCandidates] = useState(true);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [voted, setVoted] = useState(false);

	useEffect(() => {
		const tokenParam = searchParams.get("token");
		if (tokenParam) {
			setToken(tokenParam);
		} else {
			setError(
				"Kein gültiger Token gefunden. Bitte verwenden Sie den Link aus Ihrer E-Mail.",
			);
		}
	}, [searchParams]);

	useEffect(() => {
		const fetchCandidates = async () => {
			try {
				const response = await fetch("/api/candidates");
				const data = await response.json();

				if (response.ok) {
					setCandidates(data.candidates);
				} else {
					setError("Fehler beim Laden der Kandidaten");
				}
			} catch {
				setError("Netzwerkfehler beim Laden der Kandidaten");
			} finally {
				setLoadingCandidates(false);
			}
		};

		fetchCandidates();
	}, []);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		if (!selectedCandidateId) {
			setError("Bitte wähle deinen Kandidaten aus.");
			return;
		}

		setLoading(true);
		setMessage("");
		setError("");

		try {
			const response = await fetch("/api/vote", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ token, candidateId: selectedCandidateId }),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.error || "Ein Fehler ist aufgetreten");
			} else {
				setMessage(data.message);
				setVoted(true);
			}
		} catch {
			setError("Netzwerkfehler. Bitte versuchen Sie es erneut.");
		} finally {
			setLoading(false);
		}
	};

	if (voted) {
		return (
			<div className="text-center py-8">
				<SharedAlertBox
					type="success"
					message={
						message || "Vielen Dank für Ihre Teilnahme an der Abstimmung!"
					}
				/>
			</div>
		);
	}

	if (!token) {
		return (
			<SharedAlertBox
				type="error"
				message="Kein gültiger Token gefunden. Bitte verwenden Sie den Link aus Ihrer E-Mail."
			/>
		);
	}

	if (loadingCandidates) {
		return (
			<div className="flex flex-col items-center py-8">
				<SharedSpinner size={48} />
				<p className="mt-4 text-text-light dark:text-text-dark">
					Kandidaten werden geladen...
				</p>
			</div>
		);
	}

	if (candidates.length === 0) {
		return (
			<SharedAlertBox
				type="warning"
				message="Es sind keine Kandidaten verfügbar. Bitte kontaktieren Sie den Administrator."
			/>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div>
				<h2 className="text-lg font-semibold text-heading-light dark:text-heading-dark mb-4">
					Wähle deinen Kandidaten:
				</h2>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{candidates.map((candidate) => (
						<VotingCandidateCard
							key={candidate.id}
							candidate={candidate}
							isSelected={selectedCandidateId === candidate.id}
							setSelectedCandidateId={setSelectedCandidateId}
						/>
					))}
				</div>
			</div>

			{error && <SharedAlertBox type="error" message={error} />}

			<SharedButton type="submit" loading={loading}>
				Stimme abgeben
			</SharedButton>
		</form>
	);
}
