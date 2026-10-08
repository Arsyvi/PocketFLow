import {
  POCKET_ICON_OPTIONS,
  POCKET_COLOR_OPTIONS,
} from "../../utils/pocketUI";

function PocketIconPicker({ icon, color, onIconChange, onColorChange }) {
  return (
    <div className="pocket-picker">
      <div className="pocket-picker-group">
        <span className="pocket-picker-label">Icon</span>
        <div className="pocket-icon-options">
          {POCKET_ICON_OPTIONS.map((opt) => {
            const OptionIcon = opt.Icon;
            const active = icon === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                title={opt.label}
                aria-label={`Icon ${opt.label}`}
                aria-pressed={active}
                onClick={() => onIconChange(opt.key)}
                className={
                  active
                    ? `pocket-icon-option pocket-icon-${color} active`
                    : "pocket-icon-option"
                }
              >
                <OptionIcon size={18} />
              </button>
            );
          })}
        </div>
      </div>
      <div className="pocket-picker-group">
        <span className="pocket-picker-label">Warna</span>
        <div className="pocket-color-options">
          {POCKET_COLOR_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              title={opt.label}
              aria-label={`Warna ${opt.label}`}
              aria-pressed={color === opt.key}
              onClick={() => onColorChange(opt.key)}
              className={
                color === opt.key
                  ? `pocket-color-dot dot-${opt.key} active`
                  : `pocket-color-dot dot-${opt.key}`
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default PocketIconPicker;
