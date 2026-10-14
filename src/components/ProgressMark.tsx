import type { ProgressMark as Mark } from "../store/prefs";
import { Icon } from "./Icons";

export function ProgressIcon({ mark }: { mark?: Mark }) {
  if (mark === "learned")
    return (
      <span className="mark-icon learned" title="Learned">
        <Icon name="check" />
        <span className="visually-hidden">(learned)</span>
      </span>
    );
  if (mark === "review")
    return (
      <span className="mark-icon review" title="Review later">
        <Icon name="clock" />
        <span className="visually-hidden">(review later)</span>
      </span>
    );
  return <span className="mark-icon none" aria-hidden="true" />;
}
