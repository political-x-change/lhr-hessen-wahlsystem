type SharedAlertBoxProps = {
  type: "error" | "success";
  message: string;
};

export function SharedAlertBox({ type, message }: SharedAlertBoxProps) {
  const baseClasses = "px-4 py-3 rounded-lg text-sm";
  const typeClasses =
    type === "error"
      ? "bg-red-50 border border-red-200 text-error"
      : "bg-green-50 border border-green-200 text-success";

  return <div className={`${baseClasses} ${typeClasses}`}>{message}</div>;
}
