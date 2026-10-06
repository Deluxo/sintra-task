import { atom } from "@synergyeffect/react-atom";

export const Card = atom<"div">(
  <div className="p-4 border rounded-lg hover:shadow-md transition-shadow" />
);