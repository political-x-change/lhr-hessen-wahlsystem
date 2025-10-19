import { CircleCheck } from "lucide-react";
import type { Candidate } from "@/lib/types";

type VotingCandidateCardProps = {
	candidate: Candidate;
	isSelected: boolean;
	setSelectedCandidateId: (id: number) => void;
};

export default function VotingCandidateCard({
	candidate,
	isSelected,
	setSelectedCandidateId,
}: VotingCandidateCardProps) {
	return (
		<div key={candidate.id}>
			<button
				type="button"
				onClick={() => setSelectedCandidateId(candidate.id)}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						setSelectedCandidateId(candidate.id);
					}
				}}
				className={`
            cursor-pointer rounded-lg border-2 p-4 transition-all
            ${
							isSelected
								? "border-primary shadow-md"
								: "border-border-light dark:border-border-dark hover:border-primary hover:shadow-sm"
						}
            `}
			>
				<h3 className="font-bold text-lg text-heading-light dark:text-heading-dark mb-2">
					{candidate.name}
				</h3>

				<p className="text-sm text-text-light dark:text-text-dark line-clamp-3">
					{candidate.description}
				</p>

				{isSelected && (
					<div className="text-primary dark:text-primary text-sm flex flex-row items-center mt-3 gap-1">
						<CircleCheck className="flex items-center w-4 h-auto" />
						<p>Ausgewählt</p>
					</div>
				)}
			</button>
		</div>
	);
}
