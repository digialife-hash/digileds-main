import { setTimeout as wait } from "node:timers/promises";

export const sleep = async (ms) => {
  await wait(ms);
};
export const isNonEmpty = (value) =>
  value !== undefined && value !== null && value !== "";
