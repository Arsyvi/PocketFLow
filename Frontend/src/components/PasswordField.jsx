import { Eye, EyeOff } from "lucide-react";

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggle,
  autoComplete,
  placeholder,
}) {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <div className="password-field">
        <input
          id={id}
          type={show ? "text" : "password"}
          className="input-pocket"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          className="password-eye"
          onClick={onToggle}
          aria-label={show ? `Sembunyikan ${label}` : `Tampilkan ${label}`}
          aria-pressed={show}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </>
  );
}

export default PasswordField;
