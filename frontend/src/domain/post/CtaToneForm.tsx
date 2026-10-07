"use client";

import { useId, useState, type ChangeEvent, type ComponentProps } from "react";
import { Row, Stack } from "../../components/atom/layout";
import { Caption } from "../../components/atom/typography";
import {
  ButtonGhostSm,
  Chip,
  ChipSelected,
  Label,
  SegmentedControl,
  SegmentedItem,
  SegmentedItemSelected,
  Select,
  Textarea,
  Toggle,
} from "../../components/atom/form";
import { FormControlRow } from "../../components/atom/molecule/FormControl";
import {
  PLATFORM_META,
  type Platform,
  type PlatformToneRowProps,
  type SegmentedFieldProps,
  type SegmentedOptionProps,
  type ToneChipProps,
} from "./model";
import {
  CUSTOM_INSTRUCTIONS_MAX,
  EMOJI_OPTIONS,
  LENGTH_OPTIONS,
  TONE_OPTIONS,
  effectiveTone,
  isOverridden,
  toneLabel,
  type CtaTonePreferences,
  type Tone,
} from "./cta-tone";
import { usePosts } from "./usePosts";

const PLATFORM_ORDER = Object.keys(PLATFORM_META) as Platform[];

const DEFAULT_OPTION = "__default__";

const countOverrides = (ctaTone: CtaTonePreferences) =>
  PLATFORM_ORDER.filter((platform) => isOverridden(ctaTone, platform)).length;

const platformSelectValue = (ctaTone: CtaTonePreferences, platform: Platform) =>
  isOverridden(ctaTone, platform)
    ? effectiveTone(ctaTone, platform)
    : DEFAULT_OPTION;

const defaultOptionLabel = (tone: Tone) => `Default (${toneLabel(tone)})`;

const disclosureLabel = (open: boolean, count: number) =>
  `${open ? "Hide" : "Customize"}${count ? ` (${count})` : ""}`;

const overrideSummary = (count: number) =>
  `${count} platform${count === 1 ? "" : "s"} customized — changing the default tone above resets them.`;

function ToneChip({ option, selected, onSelect }: ToneChipProps) {
  const ChipComponent = selected ? ChipSelected : Chip;
  return (
    <ChipComponent
      aria-pressed={selected}
      onClick={() => onSelect(option.value)}
    >
      {option.label}
    </ChipComponent>
  );
}

function ToneField() {
  const { ctaTone, setTone } = usePosts();
  const selectedTone = TONE_OPTIONS.find(
    (option) => option.value === ctaTone.tone
  );

  return (
    <div>
      <Label>Tone</Label>
      <div role="group" aria-label="Tone" className="flex flex-wrap gap-2">
        {TONE_OPTIONS.map((option) => (
          <ToneChip
            key={option.value}
            option={option}
            selected={option.value === ctaTone.tone}
            onSelect={setTone}
          />
        ))}
      </div>
      {selectedTone && (
        <div className="mt-1">
          <Caption>{selectedTone.hint}</Caption>
        </div>
      )}
    </div>
  );
}

function PlatformToneRow({ platform }: PlatformToneRowProps) {
  const { ctaTone, setPlatformTone, clearPlatformTone } = usePosts();
  const label = PLATFORM_META[platform].label;

  const handleChange = (next: string) => {
    const tone = TONE_OPTIONS.find((option) => option.value === next)?.value;
    if (!tone || tone === ctaTone.tone) {
      clearPlatformTone(platform);
    } else {
      setPlatformTone(platform, tone);
    }
  };

  return (
    <FormControlRow
      className="flex items-center gap-2"
      label={label}
      labelProps={{ className: "mb-0 grow" }}
      InputComponent={Select}
      inputProps={{
        className: "grow",
        "aria-label": `${label} tone`,
        value: platformSelectValue(ctaTone, platform),
        onChange: (event: ChangeEvent<HTMLSelectElement>) =>
          handleChange(event.target.value),
      }}
    >
      <option value={DEFAULT_OPTION}>{defaultOptionLabel(ctaTone.tone)}</option>
      {TONE_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </FormControlRow>
  );
}

function PerPlatformToneField() {
  const { ctaTone } = usePosts();
  const [showPlatforms, setShowPlatforms] = useState(false);
  const overriddenCount = countOverrides(ctaTone);

  return (
    <div>
      <Row className="justify-between">
        <Label className="mb-0">Per-platform tone</Label>
        <ButtonGhostSm
          type="button"
          aria-expanded={showPlatforms}
          onClick={() => setShowPlatforms((open) => !open)}
        >
          {disclosureLabel(showPlatforms, overriddenCount)}
        </ButtonGhostSm>
      </Row>

      {showPlatforms && (
        <Stack className="mt-2">
          {PLATFORM_ORDER.map((platform) => (
            <PlatformToneRow key={platform} platform={platform} />
          ))}
          {overriddenCount > 0 && (
            <Caption>{overrideSummary(overriddenCount)}</Caption>
          )}
        </Stack>
      )}
    </div>
  );
}

function SegmentedOption<T extends string>({
  option,
  selected,
  onSelect,
}: SegmentedOptionProps<T>) {
  const Item = selected ? SegmentedItemSelected : SegmentedItem;
  return (
    <Item aria-pressed={selected} onClick={() => onSelect(option.value)}>
      {option.label}
    </Item>
  );
}

function SegmentedField<T extends string>({
  label,
  options,
  value,
  onSelect,
}: SegmentedFieldProps<T>) {
  return (
    <div>
      <Label>{label}</Label>
      <SegmentedControl role="group" aria-label={label}>
        {options.map((option) => (
          <SegmentedOption
            key={option.value}
            option={option}
            selected={option.value === value}
            onSelect={onSelect}
          />
        ))}
      </SegmentedControl>
    </div>
  );
}

function EmojiField() {
  const { ctaTone, patchCtaTone } = usePosts();
  return (
    <SegmentedField
      label="Emoji usage"
      options={EMOJI_OPTIONS}
      value={ctaTone.emoji}
      onSelect={(emoji) => patchCtaTone({ emoji })}
    />
  );
}

function LengthField() {
  const { ctaTone, patchCtaTone } = usePosts();
  return (
    <SegmentedField
      label="Post length"
      options={LENGTH_OPTIONS}
      value={ctaTone.length}
      onSelect={(length) => patchCtaTone({ length })}
    />
  );
}

function CtaField() {
  const { ctaTone, patchCtaTone } = usePosts();
  const toggleId = useId();

  return (
    <div>
      <Label htmlFor={toggleId} className="cursor-pointer">
        Add a call-to-action
      </Label>
      <Toggle
        id={toggleId}
        checked={ctaTone.includeCta}
        onCheckedChange={(checked) => patchCtaTone({ includeCta: checked })}
        label="Add a call-to-action to every post"
      />
    </div>
  );
}

function InstructionsField() {
  const { ctaTone, patchCtaTone } = usePosts();
  const instructions = ctaTone.customInstructions ?? "";
  const counter = `${instructions.length}/${CUSTOM_INSTRUCTIONS_MAX}`;

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
    patchCtaTone({ customInstructions: event.target.value });

  return (
    <FormControlRow
      label={
        <Row className="justify-between">
          <span>Extra instructions</span>
          <Caption>{counter}</Caption>
        </Row>
      }
      InputComponent={Textarea}
      inputProps={{
        value: instructions,
        onChange: handleChange,
        maxLength: CUSTOM_INSTRUCTIONS_MAX,
        rows: 2,
        placeholder: "Mention our free shipping offer",
      }}
    />
  );
}

export function CtaToneForm(props: ComponentProps<"div">) {
  return (
    <Stack {...props}>
      <ToneField />
      <PerPlatformToneField />
      <Row>
        <EmojiField />
        <LengthField />
        <CtaField />
      </Row>
      <InstructionsField />
    </Stack>
  );
}
