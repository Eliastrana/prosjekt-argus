import { Fragment, type ReactNode } from "react";
import { Arrow } from "@/app/components/Arrow";

/* Text from data files can hold "→"; this renders each one as the icon. */
export function withArrows(text: string): ReactNode {
  if (!text.includes("→")) return text;
  return text.split("→").map((part, i) => (
    <Fragment key={i}>
      {i > 0 ? <Arrow /> : null}
      {part}
    </Fragment>
  ));
}
