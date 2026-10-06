import { atom } from "@synergyeffect/react-atom";

export const Label = atom<"label">(
  <label className="block text-sm font-medium mb-2" />
);

export const Input = atom<"input">(
  <input className="w-full px-3 py-2 border rounded-md" />
);

export const Textarea = atom<"textarea">(
  <textarea className="w-full px-3 py-2 border rounded-md" />
);

export const Button = atom<"button">(
  <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors" />
);