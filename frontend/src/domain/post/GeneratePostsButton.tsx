"use client";

import { mkEnumObject } from "@/util/dry-tools";
import { withStateMatch } from "@synergyeffect/with-state-match";
import { Button, ButtonDanger } from "../../components/atom/form";
import { useProduct } from "../product/useProduct";
import { usePosts } from "./usePosts";
import { ComponentProps } from "react";
import type { Product } from "../product/model";

const STATE = mkEnumObject("IDLE", "GENERATING", "ERROR");
type StateData = Product | null | undefined;

export const GeneratePostsButton = withStateMatch(
  STATE.IDLE,
  ({ chstate }: {
    chstate: (state: keyof typeof STATE) => (data?: StateData) => StateData,
    props?: ComponentProps<"button">
  }, { product }, { generatePosts }) => Promise.resolve(product)
    .then(chstate(STATE.GENERATING))
    .then(generatePosts)
    .then(chstate(STATE.IDLE))
    .catch(chstate(STATE.ERROR))
    .finally(() => setTimeout(chstate(STATE.IDLE), 5000)),
  {
    [STATE.GENERATING]: ({ props }) => <Button {...props} disabled>Generating…</Button>,
    [STATE.ERROR]: ({ stateData, props }) => <ButtonDanger {...props}>{stateData?.message}</ButtonDanger>,
    [STATE.IDLE]: ({ run, props }) => {
      const productHook = useProduct();
      const postHook = usePosts();
      return <Button {...props} onClick={() => run(productHook, postHook)}>Generate Posts</Button>;
    },
  }
);
