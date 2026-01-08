export const tokens = [];
export const MEME_FACTORY = import.meta.env.VITE_MEME_FACTORY;
export const MODULE_NAME = "PayPerAI";
export const SERVER_URL =
  import.meta.env.VITE_SERVER_URL || "http://localhost:8080";

export const toHex = (buffer: any) => {
  return Array.from(buffer)
    .map((b: any) => b.toString(16).padStart(2, "0"))
    .join("");
};
