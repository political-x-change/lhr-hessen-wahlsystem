type SharedAlertBoxProps = {
	type: "error" | "success" | "warning";
	message: string;
};

export function SharedAlertBox({ type, message }: SharedAlertBoxProps) {
	const baseClasses = "px-4 py-3 rounded-lg text-sm";
	const typeClasses =
		type === "error"
			? "bg-red-50 border border-red-200 text-error dark:bg-red-900 dark:border-red-700 dark:text-red-200"
			: type === "warning"
				? "bg-orange-50 border border-orange-200 text-warning dark:bg-orange-900 dark:border-orange-700 dark:text-orange-200"
				: "bg-green-50 border border-green-200 text-success dark:bg-green-900 dark:border-green-700 dark:text-green-200";

	return <div className={`${baseClasses} ${typeClasses}`}>{message}</div>;
}
