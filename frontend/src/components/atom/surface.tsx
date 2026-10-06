import { atom } from "@synergyeffect/react-atom";

export const Card = atom<"div">(
  <div className="p-4 border rounded-lg bg-white dark:bg-gray-900 hover:shadow-md transition-shadow" />
);