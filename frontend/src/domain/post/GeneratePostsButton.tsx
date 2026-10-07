"use client";

import { mkEnumObject } from "@/util/dry-tools";
import { withStateMatch } from "@synergyeffect/with-state-match";
import { Button, ButtonDanger } from "../../components/atom/form";
import { useProduct } from "../product/useProduct";
import { usePosts } from "./usePosts";

const STATE = mkEnumObject("IDLE", "GENERATING", "ERROR");

export const GeneratePostsButton = withStateMatch(
  STATE.IDLE,
  ({ chstate }, { product }, { generatePosts }) => Promise.resolve(product)
    .then(chstate(STATE.GENERATING))
    .then(generatePosts)
    .then(chstate(STATE.IDLE))
    .catch(chstate(STATE.ERROR))
    .finally(() => setTimeout(chstate(STATE.IDLE), 5000)),
  {
    [STATE.IDLE]: ({ run }) => {
      const productHook = useProduct();
      const postHook = usePosts();
      return <Button onClick={() => run(productHook, postHook)}>Generate Posts</Button>;
    },
    [STATE.GENERATING]: () => <Button disabled>Generating…</Button>,
    [STATE.ERROR]: (a) => <ButtonDanger>{a?.stateData?.message}</ButtonDanger>,
  }
);
