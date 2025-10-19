import type React from "react";

interface SharedInputProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

const SharedInput: React.FC<SharedInputProps> = ({
  label,
  type,
  value,
  onChange,
  required = false,
  placeholder = "",
  disabled = false,
}) => {
  return (
    <div>
      <label
        htmlFor={label}
        className="block text-sm font-medium text-text-light dark:text-text-dark mb-2"
      >
        {label}
      </label>
      <input
        type={type}
        id={label}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2 border text-text-light/80 dark:text-text-dark/80 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
};

export default SharedInput;
