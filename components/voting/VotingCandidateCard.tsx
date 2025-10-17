import type { Candidate } from "@/lib/types";
import { CircleCheck } from "lucide-react";

export default function VotingCandidateCard(
  candidate: Candidate,
  isSelected: boolean,
  setSelectedCandidateId: (id: number) => void
) {
  return (
    <div
      key={candidate.id}
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
                            ? "border-primary bg-blue-50 shadow-md"
                            : "border-gray-200 hover:border-primary hover:shadow-sm"
                        }
                      `}
    >
      <h3 className="font-bold text-lg text-gray-900 mb-2">{candidate.name}</h3>

      <p className="text-sm text-gray-600 line-clamp-3">
        {candidate.description}
      </p>

      {isSelected && (
        <CircleCheck className="mt-3 flex items-center text-primary" />
      )}
    </div>
  );
}
