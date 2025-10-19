import type React from "react";

interface SharedButtonProps {
	loading?: boolean;
	children: React.ReactNode;
	onClick?: () => void;
	type?: "button" | "submit" | "reset" | undefined;
}

const SharedButton: React.FC<SharedButtonProps> = ({
	loading,
	children,
	onClick,
	type,
}) => {
	return (
		<button
			type={type}
			onClick={onClick}
			disabled={loading}
			className="w-full bg-primary text-white py-3 rounded-lg hover:cursor-pointer font-medium hover:bg-primary/90 focus:ring-4 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
		>
			{loading ? "Bitte warten..." : children}
		</button>
	);
};

export default SharedButton;
