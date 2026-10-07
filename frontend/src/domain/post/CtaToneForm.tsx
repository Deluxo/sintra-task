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
import { PLATFORM_META, type Platform } from "./model";
import {
  CUSTOM_INSTRUCTIONS_MAX,
  EMOJI_OPTIONS,
  LENGTH_OPTIONS,
  TONE_OPTIONS,
  effectiveTone,
  isOverridden,
  toneLabel,
  type Tone,
} from "./cta-tone";
import { usePosts } from "./usePosts";

const PLATFORM_ORDER = Object.keys(PLATFORM_META) as Platform[];

/** Value used by the select to mean "no override, follow the default tone". */
const DEFAULT_OPTION = "__default__";

export function CtaToneForm(props: ComponentProps<"div">) {
  const { ctaTone, setTone, setPlatformTone, clearPlatformTone, patchCtaTone } =
    usePosts();
  const [showPlatforms, setShowPlatforms] = useState(false);
  const ctaToggleId = useId();

  const overriddenCount = PLATFORM_ORDER.filter((platform) =>
    isOverridden(ctaTone, platform)
  ).length;
  const selectedTone = TONE_OPTIONS.find(
    (option) => option.value === ctaTone.tone
  );

  return (
    <Stack {...props}>
      <div>
        <Label>Tone</Label>
        <div role="group" aria-label="Tone" className="flex flex-wrap gap-2">
          {TONE_OPTIONS.map((option) => {
            const selected = option.value === ctaTone.tone;
            const ChipComponent = selected ? ChipSelected : Chip;
            return (
              <ChipComponent
                key={option.value}
                aria-pressed={selected}
                onClick={() => setTone(option.value)}
              >
                {option.label}
              </ChipComponent>
            );
          })}
        </div>
        {selectedTone && (
          <div className="mt-1">
            <Caption>{selectedTone.hint}</Caption>
          </div>
        )}
      </div>

      <div>
        <Row className="justify-between">
          <Label className="mb-0">Per-platform tone</Label>
          <ButtonGhostSm
            type="button"
            aria-expanded={showPlatforms}
            onClick={() => setShowPlatforms((open) => !open)}
          >
            {showPlatforms ? "Hide" : "Customize"}
            {overriddenCount ? ` (${overriddenCount})` : ""}
          </ButtonGhostSm>
        </Row>

        {showPlatforms && (
          <Stack className="mt-2">
            {PLATFORM_ORDER.map((platform) => {
              const overridden = isOverridden(ctaTone, platform);
              const label = PLATFORM_META[platform].label;

              return (
                <Row key={platform}>
                  <Label className="mb-0 grow">{label}</Label>
                  <Select
                    className="grow"
                    aria-label={`${label} tone`}
                    value={
                      overridden ? effectiveTone(ctaTone, platform) : DEFAULT_OPTION
                    }
                    onChange={(event) => {
                      const next = event.target.value;
                      // Picking the default (or the value already in effect)
                      // means the platform should simply follow the default tone.
                      if (next === DEFAULT_OPTION || next === ctaTone.tone) {
                        clearPlatformTone(platform);
                      } else {
                        setPlatformTone(platform, next as Tone);
                      }
                    }}
                  >
                    <option value={DEFAULT_OPTION}>
                      Default ({toneLabel(ctaTone.tone)})
                    </option>
                    {TONE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Row>
              );
            })}
            {overriddenCount > 0 && (
              <Caption>
                {overriddenCount} platform
                {overriddenCount > 1 ? "s" : ""} customized — changing the default
                tone above resets them.
              </Caption>
            )}
          </Stack>
        )}
      </div>

      <div>
        <Label>Emoji usage</Label>
        <SegmentedControl role="group" aria-label="Emoji usage">
          {EMOJI_OPTIONS.map((option) => {
            const selected = option.value === ctaTone.emoji;
            const Item = selected ? SegmentedItemSelected : SegmentedItem;
            return (
              <Item
                key={option.value}
                aria-pressed={selected}
                onClick={() => patchCtaTone({ emoji: option.value })}
              >
                {option.label}
              </Item>
            );
          })}
        </SegmentedControl>
      </div>

      <div>
        <Label>Post length</Label>
        <SegmentedControl role="group" aria-label="Post length">
          {LENGTH_OPTIONS.map((option) => {
            const selected = option.value === ctaTone.length;
            const Item = selected ? SegmentedItemSelected : SegmentedItem;
            return (
              <Item
                key={option.value}
                aria-pressed={selected}
                onClick={() => patchCtaTone({ length: option.value })}
              >
                {option.label}
              </Item>
            );
          })}
        </SegmentedControl>
      </div>

      <Row>
        <Toggle
          id={ctaToggleId}
          checked={ctaTone.includeCta}
          onCheckedChange={(checked) => patchCtaTone({ includeCta: checked })}
          label="Add a call-to-action to every post"
        />
        <Label htmlFor={ctaToggleId} className="mb-0 cursor-pointer">
          Add a call-to-action to every post
        </Label>
      </Row>

      <FormControlRow
        label={
          <Row className="justify-between">
            <span>Extra instructions</span>
            <Caption>
              {(ctaTone.customInstructions ?? "").length}/
              {CUSTOM_INSTRUCTIONS_MAX}
            </Caption>
          </Row>
        }
        InputComponent={Textarea}
        inputProps={{
          value: ctaTone.customInstructions ?? "",
          onChange: (event: ChangeEvent<HTMLTextAreaElement>) =>
            patchCtaTone({ customInstructions: event.target.value }),
          maxLength: CUSTOM_INSTRUCTIONS_MAX,
          rows: 2,
          placeholder: "Mention our free shipping offer",
        }}
      />
    </Stack>
  );
}
