/**
 * Preact re-exports — single import point for all components.
 * Usage: import { html, useState, useContext } from '../lib/preact.js';
 */
export { h, render, createContext } from "preact";
export {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
  useMemo,
} from "preact/hooks";

import { h } from "preact";
import htm from "htm";

/** Pre-bound HTM tagged template — use instead of JSX */
export const html = htm.bind(h);
