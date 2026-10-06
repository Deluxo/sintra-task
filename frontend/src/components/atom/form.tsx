import { atom } from "@synergyeffect/react-atom";

export const Label = atom<"label">(
  <label className="block text-sm font-medium mb-2" />
);

export const Input = atom<"input">(
  <input className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
);

export const Textarea = atom<"textarea">(
  <textarea className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
);

export const Button = atom<"button">(
  <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-500 disabled:bg-gray-400 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors" />
);

export const ButtonGhostSm = atom<"button">(<Button className="border border-blue-500 text-blue-500 rounded-md px-3 py-2 text-sm transition-colors bg-transparent dar:bg-transparent hover:border-blue-800 hover:text-blue-800 hover:bg-transparent dark:hover:bg-transparent" />);

export const ButtonGhostSmSuccess = atom<"button">(<ButtonGhostSm className="border-green-600 text-green-700 dark:border-green-600 dark:text-green-400 hover:border-green-800 hover:text-green-800" />);
export const ButtonGhostSmDanger = atom<"button">(<ButtonGhostSm className="border-red-600 text-red-700 dark:border-red-600 dark:text-red-400 hover:border-red-800 hover:text-red-800" />);
