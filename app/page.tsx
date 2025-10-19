import Image from "next/image";
import RegisterForm from "@/components/register/RegisterForm";

export default function Home() {
	return (
		<div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
			<div className="max-w-md w-full">
				<div className="bg-foreground-light  dark:bg-foreground-dark rounded-lg border border-border-light dark:border-border-dark py-8 px-4 lg:p-8 flex flex-col items-center">
					<Image
						src="/lhr.png"
						alt="Logo des Landesheimrats Hessen"
						width={200}
						height={100}
						priority
					/>
					<h1 className="text-3xl font-bold text-heading-light dark:text-heading-dark my-2 text-center">
						Herzlich Willkommen
					</h1>
					<p className="mb-6 text-center text-text-light dark:text-text-dark">
						Nimm an der Landesheimratswahl {new Date().getFullYear()} teil,
						indem du dich hier registrierst.
					</p>

					<RegisterForm />

					<div className="mt-6 pt-6 border-t border-border-light dark:border-border-dark flex flex-row w-full text-sm justify-center">
						<a
							href="https://politicalxchange.com"
							className="text-text-light dark:text-text-dark"
							target="_blank"
							rel="noopener noreferrer"
						>
							A project by <u>politicalxchange.com</u>
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
