import { atom } from "@synergyeffect/react-atom";
import type { ComponentProps, ComponentType, ReactElement } from "react";

export const Label = atom<"label">(
  <label className="block text-sm font-medium mb-2" />
);

export const Input = atom<"input">(
  <input className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
);

export const Textarea = atom<"textarea">(
  <textarea className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
);

export const Select = atom<"select">(
  <select className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
);

export const Button = atom<"button">(
  <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-500 disabled:bg-gray-400 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors" />
);

export const ButtonDanger = atom<"button">(
  <button className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-500 disabled:bg-gray-400 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors" />
);

export const ButtonGhostSm = atom<"button">(<Button className="border border-blue-500 text-blue-500 rounded-md px-3 py-2 text-sm transition-colors bg-transparent dar:bg-transparent hover:border-blue-800 hover:text-blue-800 hover:bg-transparent dark:hover:bg-transparent" />);

export const ButtonGhostSmSuccess = atom<"button">(<ButtonGhostSm className="border-green-600 text-green-700 dark:border-green-600 dark:text-green-400 hover:border-green-800 hover:text-green-800" />);
export const ButtonGhostSmDanger = atom<"button">(<ButtonGhostSm className="border-red-600 text-red-700 dark:border-red-600 dark:text-red-400 hover:border-red-800 hover:text-red-800" />);

const ChipBase = atom<"button">(
  <button type="button" className="px-3 py-1.5 text-sm rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors" />
);

const ChipSelected = atom<"button">(
  <ChipBase className="border-blue-600 bg-blue-600 text-white hover:border-blue-600 hover:text-white dark:border-blue-500 dark:bg-blue-500 dark:hover:border-blue-500" />
);

/** Pill-shaped choice; `selected` renders the active variant. */
export const Chip = ({
  selected = false,
  ...props
}: ComponentProps<"button"> & { selected?: boolean }) => {
  const Base = selected ? ChipSelected : ChipBase;
  return <Base aria-pressed={selected} {...props} />;
};

/** Container for a mutually exclusive set of segments (render as a radiogroup). */
export const SegmentedControl = atom<"div">(
  <div className="inline-flex rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden" />
);

const SegmentedButtonBase = atom<"button">(
  <button type="button" className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" />
);

const SegmentedButtonSelected = atom<"button">(
  <SegmentedButtonBase className="bg-blue-600 text-white hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-500" />
);

/** Segment of a segmented control; `selected` renders the active variant. */
export const SegmentedButton = ({
  selected = false,
  ...props
}: ComponentProps<"button"> & { selected?: boolean }) => {
  const Base = selected ? SegmentedButtonSelected : SegmentedButtonBase;
  return <Base aria-pressed={selected} {...props} />;
};

const ToggleTrack = atom<"button">(
  <button
    type="button"
    role="switch"
    className="inline-flex w-11 shrink-0 items-center justify-start rounded-full border border-transparent p-1 bg-gray-300 dark:bg-gray-700 transition-colors"
  />
);

const ToggleTrackOn = atom<"button">(
  <ToggleTrack className="justify-end bg-blue-600 dark:bg-blue-500" />
);

const ToggleKnob = atom<"span">(
  <span className="h-4 w-4 rounded-full bg-white shadow" />
);

type ToggleProps = Omit<ComponentProps<"button">, "onChange" | "role" | "children"> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
};

/** On/off switch with native switch semantics for screen readers. */
export function Toggle({ checked, onCheckedChange, label, ...props }: ToggleProps) {
  const Track = checked ? ToggleTrackOn : ToggleTrack;

  return (
    <Track
      aria-checked={checked}
      aria-label={label}
      onClick={() => onCheckedChange(!checked)}
      {...props}
    >
      <ToggleKnob />
    </Track>
  );
}

/** One entry in a list of choices. */
export type Option<T extends string> = { value: T; label: string };

/** A button that takes a `selected` prop (Chip, SegmentedButton, …). */
export type OptionButton = ComponentType<ComponentProps<"button"> & { selected?: boolean }>;

/**
 * Curried option renderer: (mappingFn, Component) → option → <Component>…</Component>.
 * `mappingFn` supplies the option-specific props; the key is owned here.
 */
export const renderAs =
  <T extends string>(
    mappingFn: (option: Option<T>) => ComponentProps<OptionButton>,
    Component: OptionButton
  ): ((option: Option<T>) => ReactElement) =>
  (option) => (
    <Component key={option.value} {...mappingFn(option)}>
      {option.label}
    </Component>
  );
