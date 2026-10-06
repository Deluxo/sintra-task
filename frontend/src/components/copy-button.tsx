"use client";

import { mkEnumObject } from "@/util/dry-tools";
import { withStateMatch } from "@synergyeffect/with-state-match";
import { ButtonGhostSm, ButtonGhostSmSuccess, ButtonGhostSmDanger } from "./atom/form";

const FLASH_MS = 3000;
const STATE = mkEnumObject('IDLE', 'COPIED', 'ERROR');

export const CopyButton = withStateMatch(
  STATE.IDLE,
  ({ chstate, props }: {
    chstate: (next: any) => (nextData?: any | null) => any | null,
    props: { text: string; label: string }
  }) => navigator
    .clipboard
    .writeText(props.text)
    .then(chstate(STATE.COPIED))
    .then(() => setTimeout(chstate(STATE.IDLE), FLASH_MS))
    .catch(chstate(STATE.ERROR)),
  {
    [STATE.IDLE]: ({ run, props: { label } }) => (
      <ButtonGhostSm aria-label={`Copy ${label} to clipboard`} onClick={run}>
        Copy
      </ButtonGhostSm>
    ),
    [STATE.COPIED]: ({ props: { label } }) => (
      <ButtonGhostSmSuccess>
        Copied!
        <span className="sr-only" role="status">{label} copied to clipboard</span>
      </ButtonGhostSmSuccess>
    ),
    [STATE.ERROR]: ({ props: { label } }) => (
      <ButtonGhostSmDanger>
        Error!
        <span className="sr-only" role="status">Could not copy {label}</span>
      </ButtonGhostSmDanger>
    ),
  }
)
