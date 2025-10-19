import Image from "next/image";
import { Suspense } from "react";
import VotingForm from "@/components/voting/VotingForm";

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
			<h1 className="text-3xl font-bold text-heading-light dark:text-heading-dark mb-2 text-center">
				Abstimmung
			</h1>
			<p className="text-text-light dark:text-text-dark mb-6 text-center max-w-xl mx-auto">
				Wählen deinen Kandidaten durch Klicken auf die Karte aus. Du kannst nur
				einmal abstimmen. Deine Stimme wird anonymisiert gespeichert.
			</p>

			<VotingForm />
		</div>
	);
}

export default function VotePage() {
	return (
		<div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
			<div className="max-w-4xl w-full">
				<div className="bg-foreground-light dark:bg-foreground-dark border border-border-light dark:border-border-dark rounded-xl p-8">
					<Suspense fallback={<div>Laden...</div>}>
						<VoteContent />
					</Suspense>
				</div>
			</div>
		</div>
	);
}
