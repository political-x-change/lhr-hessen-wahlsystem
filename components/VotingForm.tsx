"use client";

import { useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import type { Candidate } from "@/lib/types";
import SharedSpinner from "./shared/SharedSpinner";
import VotingCandidateCard from "./voting/VotingCandidateCard";

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
				<div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg mb-4">
					{/* <svg
            className="w-16 h-16 mx-auto mb-4 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg> */}
					<p className="text-lg font-semibold">{message}</p>
					<p className="mt-2">Vielen Dank für Ihre Teilnahme!</p>
				</div>
			</div>
		);
	}

	if (!token) {
		return (
			<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
				{error || "Laden..."}
			</div>
		);
	}

	if (loadingCandidates) {
		return (
			<div className="flex flex-col items-center py-8">
				<SharedSpinner size={48} />
				<p className="mt-4 text-gray-600">Kandidaten werden geladen...</p>
			</div>
		);
	}

	if (candidates.length === 0) {
		return (
			<div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-center">
				Keine Kandidaten verfügbar
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div>
				<h2 className="text-lg font-semibold text-gray-900 mb-4">
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

			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
					{error}
				</div>
			)}

			<button
				type="submit"
				disabled={loading || !token || !selectedCandidateId}
				className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:cursor-pointer hover:bg-primary/90 focus:ring-4 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition border-primary"
			>
				{loading ? "Wird gesendet..." : "Stimme abgeben"}
			</button>
		</form>
	);
}
