import { atom } from "@synergyeffect/react-atom";

export const Heading1 = atom<"h1">(<h1 className="text-3xl font-bold" />);

export const Heading2 = atom<"h2">(<h2 className="text-2xl font-semibold" />);

export const Text = atom<"p">(
  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap" />
);

export const Badge = atom<"span">(
  <span className="font-medium text-sm text-gray-600 dark:text-gray-400 capitalize" />
);

export const Caption = atom<"span">(
  <span className="text-xs text-gray-400 dark:text-gray-500" />
);

export const Icon = atom<"span">(<span className="text-2xl" />);
