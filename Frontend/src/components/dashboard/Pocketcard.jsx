import { createElement, isValidElement } from "react";
import { formatPocketAmount } from "../../utils/pocketUI";

function renderIcon(icon) {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  return createElement(icon, { size: 20 });
}

function Pocketcard({ icon, title, amount, color, actions }) {
  const displayAmount =
    typeof amount === "number" ? formatPocketAmount(amount) : amount;

  return (
    <div className={`pocket-card-${color}`}>
      <div className="pocket-header">
        <div className={`pocket-icon-${color}`}>{renderIcon(icon)}</div>
        <h2 className="pocket-title">{title}</h2>
      </div>
      <h2 className="amount">Rp{displayAmount}</h2>
      {actions ? <div className="pocket-card-actions">{actions}</div> : null}
    </div>
  );
}

export default Pocketcard;
