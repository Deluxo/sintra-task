"use client";

import { mkEnumObject } from "@/util/dry-tools";
import { withStateMatch } from "@synergyeffect/with-state-match";
import { Button, ButtonDanger } from "../../components/atom/form";
import { useProduct } from "../product/useProduct";
import { usePosts } from "./usePosts";
import { ComponentProps } from "react";

const STATE = mkEnumObject("IDLE", "GENERATING", "ERROR");

export const GeneratePostsButton = withStateMatch(
  STATE.IDLE,
  ({ chstate }: {
    chstate: (state: keyof typeof STATE) => (data?: unknown) => unknown;
    props?: ComponentProps<"button">;
  }, { product }, { generatePosts }) => Promise.resolve(product)
    .then(chstate(STATE.GENERATING))
    .then(() => generatePosts(product))
    .then(chstate(STATE.IDLE))
    .catch(chstate(STATE.ERROR)),
  {
    [STATE.IDLE]: ({ run, props }) => {
      const productHook = useProduct();
      const postHook = usePosts();
      return <Button {...props} onClick={() => run(productHook, postHook)}>Generate Posts</Button>;
    },
    [STATE.GENERATING]: ({ props }) => <Button {...props} disabled>Generating…</Button>,
    // The error stays on screen until the user retries instead of vanishing
    // on a timer, so validation messages remain readable.
    [STATE.ERROR]: ({ stateData, run, props }) => {
      const productHook = useProduct();
      const postHook = usePosts();
      const message = stateData instanceof Error
        ? stateData.message
        : "Generation failed";
      return (
        <ButtonDanger
          {...props}
          title="Click to retry"
          onClick={() => run(productHook, postHook)}
        >
          {message}
        </ButtonDanger>
      );
    },
  }
);
