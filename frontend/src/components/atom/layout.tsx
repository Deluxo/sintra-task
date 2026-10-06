import { atom } from "@synergyeffect/react-atom";

export const Page = atom<"main">(
  <main className="min-h-screen p-8 max-w-4xl mx-auto" />
);

export const Stack = atom<"div">(<div className="space-y-4" />);

export const Row = atom<"div">(<div className="flex items-center gap-2" />);