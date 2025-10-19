type SharedSpinnerProps = {
	size?: number;
};

export default function SharedSpinner({ size = 24 }: SharedSpinnerProps) {
	return (
		<div
			className={"animate-spin rounded-full border-b-2 border-primary"}
			style={{ width: size, height: size }}
		/>
	);
}
