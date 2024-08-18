import { atom } from "recoil";
import { MyFolder, User } from "./interfaces/Interfaces";

export const selectedFolderState = atom<MyFolder | null>({
  key: "selectedFolderState",
  default: null,
});

export const savedUserState = atom<User | null>({
  key: "savedUserState",
  default: null,
})