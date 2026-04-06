"use client";

import { useState, useEffect, useRef } from "react";

const ADJACENT_KEYS: Record<string, string[]> = {
  a: ["s", "q", "z"],
  b: ["v", "n", "g"],
  c: ["x", "v", "d"],
  d: ["s", "f", "e", "c"],
  e: ["w", "r", "d"],
  f: ["d", "g", "r", "v"],
  g: ["f", "h", "t", "b"],
  h: ["g", "j", "y", "n"],
  i: ["u", "o", "k"],
  j: ["h", "k", "u", "n"],
  k: ["j", "l", "i", "m"],
  l: ["k", "o", "p"],
  m: ["n", "k"],
  n: ["b", "m", "h", "j"],
  o: ["i", "p", "l"],
  p: ["o", "l"],
  q: ["w", "a"],
  r: ["e", "t", "f"],
  s: ["a", "d", "w", "x"],
  t: ["r", "y", "g"],
  u: ["y", "i", "j"],
  v: ["c", "b", "f"],
  w: ["q", "e", "s"],
  x: ["z", "c", "s"],
  y: ["t", "u", "h"],
  z: ["x", "a"],
};

function getTypo(char: string): string {
  const lower = char.toLowerCase();
  const neighbors = ADJACENT_KEYS[lower];
  if (!neighbors) return char;
  const typo = neighbors[Math.floor(Math.random() * neighbors.length)];
  return char === char.toUpperCase() ? typo.toUpperCase() : typo;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function useTypingEffect(
  fullText: string,
  active: boolean,
  onComplete?: () => void
): string {
  const [displayed, setDisplayed] = useState("");
  const completeCalled = useRef(false);

  useEffect(() => {
    if (!active || !fullText) {
      if (!active && fullText) setDisplayed(fullText);
      return;
    }

    let cancelled = false;
    completeCalled.current = false;
    setDisplayed("");

    async function type() {
      let current = "";
      let charsSinceTypo = 0;

      for (let i = 0; i < fullText.length; i++) {
        if (cancelled) return;

        const char = fullText[i];
        charsSinceTypo++;

        // Occasional typo on letters only, not at start/end, and spaced out
        if (
          charsSinceTypo > 60 &&
          i > 10 &&
          i < fullText.length - 5 &&
          /[a-zA-Z]/.test(char) &&
          Math.random() < 0.012
        ) {
          const wrong = getTypo(char);
          current += wrong;
          setDisplayed(current);
          await sleep(180 + Math.random() * 220);
          if (cancelled) return;

          // Backspace
          current = current.slice(0, -1);
          setDisplayed(current);
          await sleep(60 + Math.random() * 80);
          if (cancelled) return;

          charsSinceTypo = 0;
        }

        current += char;
        setDisplayed(current);

        // Variable delay
        let delay = 22 + Math.random() * 48; // 22-70ms base

        if (".!?".includes(char)) {
          delay += 250 + Math.random() * 350; // Long pause after sentences
        } else if (",;:".includes(char)) {
          delay += 80 + Math.random() * 120;
        } else if (char === "\n") {
          delay += 150 + Math.random() * 200;
        } else if (char === " ") {
          delay += Math.random() * 30; // Slight pause between words
        }

        // Occasional thinking pause mid-sentence (every ~200 chars)
        if (char === " " && Math.random() < 0.008) {
          delay += 400 + Math.random() * 600;
        }

        await sleep(delay);
      }

      if (!cancelled && !completeCalled.current) {
        completeCalled.current = true;
        onComplete?.();
      }
    }

    type();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullText, active]);

  return displayed;
}
