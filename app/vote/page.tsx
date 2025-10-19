import { Suspense } from "react";
import Image from "next/image";
import VotingForm from "@/components/VotingForm";

function VoteContent() {
	return (
		<div className="flex flex-col items-center">
			<Image
				src="/lhr.png"
				alt="Logo des Landesheimrats Hessen"
				width={200}
				height={100}
				priority
			/>
			<h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
				Abstimmung
			</h1>
			<p className="text-gray-600 mb-6 text-center max-w-xl mx-auto">
				Wählen deinen Kandidaten durch Klicken auf die Karte aus. Du kannst nur
				einmal abstimmen. Deine Stimme wird anonymisiert gespeichert.
			</p>

			<VotingForm />
		</div>
	);
}

export default function VotePage() {
	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
			<div className="max-w-4xl w-full">
				<div className="bg-white border border-gray-200 rounded-xl p-8">
					<Suspense fallback={<div>Laden...</div>}>
						<VoteContent />
					</Suspense>
				</div>
			</div>
		</div>
	);
}
