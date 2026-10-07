"use client";

import { useId, type ChangeEvent, type ComponentProps } from "react";
import { Row, Stack } from "../../components/atom/layout";
import { Caption } from "../../components/atom/typography";
import {
  Chip,
  SegmentedButton,
  SegmentedControl,
  Select,
  Textarea,
  Toggle,
  renderAs,
  type Option,
} from "../../components/atom/form";
import { FormControlRow } from "../../components/atom/molecule/FormControl";
import { Disclosure } from "../../components/atom/molecule/Disclosure";
import { PLATFORM_META, type Platform } from "./model";
import {
  CUSTOM_INSTRUCTIONS_MAX,
  EMOJI_OPTIONS,
  LENGTH_OPTIONS,
  TONE_OPTIONS,
  effectiveTone,
  isOverridden,
  toneLabel,
  type EmojiLevel,
  type PostLength,
  type Tone,
} from "./cta-tone";
import { usePosts } from "./usePosts";
import { Nullable } from "../../util/UtilityComponents";

const PLATFORM_ORDER = Object.keys(PLATFORM_META) as Platform[];

const DEFAULT_OPTION = "__default__";

export function CtaToneForm(props: ComponentProps<"div">) {
  const {
    ctaTone,
    setTone,
    setPlatformTone,
    clearPlatformTone,
    patchCtaTone,
  } = usePosts();
  const ctaToggleId = useId();

  const overriddenCount = PLATFORM_ORDER.filter((platform) =>
    isOverridden(ctaTone, platform)
  ).length;

  const selectedTone = TONE_OPTIONS.find(
    (option) => option.value === ctaTone.tone
  );
  const instructions = ctaTone.customInstructions ?? "";

  return (
    <Stack {...props}>
      <FormControlRow
        label="Tone"
        InputComponent="div"
        inputProps={{
          role: "group",
          "aria-label": "Tone",
          className: "flex flex-wrap gap-2",
        }}
        hint={selectedTone?.hint}
      >
        {TONE_OPTIONS.map(
          renderAs(
            (option: Option<Tone>) => ({
              selected: option.value === ctaTone.tone,
              onClick: () => setTone(option.value),
            }),
            Chip
          )
        )}
      </FormControlRow>

      <FormControlRow
        label="Per-platform tone"
        InputComponent={Disclosure}
        inputProps={{ summary: "Customize" }}
      >
        <Stack className="mt-2">
          {
            PLATFORM_ORDER.map((platform) => {
              const label = PLATFORM_META[platform].label;
              return (
                <FormControlRow
                  key={platform}
                  className="flex items-center gap-2"
                  label={label}
                  labelProps={{ className: "mb-0 grow" }}
                  InputComponent={Select}
                  inputProps={{
                    className: "grow",
                    "aria-label": `${label} tone`,
                    value: isOverridden(ctaTone, platform) ? effectiveTone(ctaTone, platform) : DEFAULT_OPTION,
                    onChange: (event: ChangeEvent<HTMLSelectElement>) => {
                      const tone = TONE_OPTIONS.find(
                        (option) => option.value === event.target.value
                      )?.value;

                      (!tone || tone === ctaTone.tone)
                        ? clearPlatformTone(platform)
                        : setPlatformTone(platform, tone);
                    },
                  }}
                >
                  <option value={DEFAULT_OPTION}>Default ({toneLabel(ctaTone.tone)})</option>

                  {TONE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </FormControlRow>
              );
            })
          }
          <Nullable on={overriddenCount > 0}>
            <Caption>
              {`${overriddenCount} platform${overriddenCount === 1 ? "" : "s"} customized — changing the default tone above resets them.`}
            </Caption>
          </Nullable>
        </Stack>
      </FormControlRow>

      <Row>
        <FormControlRow
          label="Emoji usage"
          InputComponent={SegmentedControl}
          inputProps={{ role: "group", "aria-label": "Emoji usage" }}
        >
          {EMOJI_OPTIONS.map(
            renderAs(
              (option: Option<EmojiLevel>) => ({
                selected: option.value === ctaTone.emoji,
                onClick: () => patchCtaTone({ emoji: option.value }),
              }),
              SegmentedButton
            )
          )}
        </FormControlRow>

        <FormControlRow
          label="Post length"
          InputComponent={SegmentedControl}
          inputProps={{ role: "group", "aria-label": "Post length" }}
        >
          {LENGTH_OPTIONS.map(
            renderAs(
              (option: Option<PostLength>) => ({
                selected: option.value === ctaTone.length,
                onClick: () => patchCtaTone({ length: option.value }),
              }),
              SegmentedButton
            )
          )}
        </FormControlRow>

        <FormControlRow
          label="Add a call-to-action"
          labelProps={{ htmlFor: ctaToggleId, className: "cursor-pointer" }}
          InputComponent={Toggle}
          inputProps={{
            id: ctaToggleId,
            checked: ctaTone.includeCta,
            onCheckedChange: (checked: boolean) =>
              patchCtaTone({ includeCta: checked }),
            label: "Add a call-to-action to every post",
          }}
        />
      </Row>

      <FormControlRow
        label={
          <Row className="justify-between">
            <span>Extra instructions</span>
            <Caption>{`${instructions.length}/${CUSTOM_INSTRUCTIONS_MAX}`}</Caption>
          </Row>
        }
        InputComponent={Textarea}
        inputProps={{
          value: instructions,
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
