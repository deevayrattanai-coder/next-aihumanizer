"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DiffViewProps {
  original: string;
  humanized: string;
}

const tokenize = (text: string): string[] => text.split(/(\s+)/);

const computeDiff = (original: string, humanized: string) => {
  const origTokens = tokenize(original);
  const humTokens = tokenize(humanized);
  const result: { text: string; type: "same" | "removed" | "added" }[] = [];

  const origSet = new Set(origTokens);
  const humSet = new Set(humTokens);

  // Simple word-level diff for display purposes
  let oi = 0;
  let hi = 0;
  while (oi < origTokens.length && hi < humTokens.length) {
    if (origTokens[oi] === humTokens[hi]) {
      result.push({ text: origTokens[oi], type: "same" });
      oi++;
      hi++;
    } else {
      // Check if orig token appears later in humanized
      const humAhead = humTokens.indexOf(origTokens[oi], hi);
      const origAhead = origTokens.indexOf(humTokens[hi], oi);

      if (
        humAhead !== -1 &&
        (origAhead === -1 || humAhead - hi <= origAhead - oi)
      ) {
        // Add inserted tokens
        while (hi < humAhead) {
          result.push({ text: humTokens[hi], type: "added" });
          hi++;
        }
      } else if (origAhead !== -1) {
        // Add removed tokens
        while (oi < origAhead) {
          result.push({ text: origTokens[oi], type: "removed" });
          oi++;
        }
      } else {
        result.push({ text: origTokens[oi], type: "removed" });
        result.push({ text: humTokens[hi], type: "added" });
        oi++;
        hi++;
      }
    }
  }
  while (oi < origTokens.length) {
    result.push({ text: origTokens[oi], type: "removed" });
    oi++;
  }
  while (hi < humTokens.length) {
    result.push({ text: humTokens[hi], type: "added" });
    hi++;
  }

  return result;
};

const DiffView = ({ original, humanized }: DiffViewProps) => {
  const [showDiff, setShowDiff] = useState(false);
  const diff = computeDiff(original, humanized);

  return (
    <div className="mt-4">
      <Button
        variant="glass"
        size="sm"
        onClick={() => setShowDiff(!showDiff)}
        className="gap-2 mb-3"
      >
        <ArrowLeftRight className="w-4 h-4" />
        {showDiff ? "Hide Changes" : "Show Changes"}
      </Button>

      <AnimatePresence>
        {showDiff && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel p-4 overflow-hidden"
          >
            <p className="text-xs text-muted-foreground mb-3">
              <span className="inline-block w-3 h-3 rounded-sm bg-destructive/20 border border-destructive/40 mr-1 align-middle" />{" "}
              Removed
              <span className="inline-block w-3 h-3 rounded-sm bg-green-500/20 border border-green-500/40 ml-3 mr-1 align-middle" />{" "}
              Added
            </p>
            <div className="text-sm leading-relaxed max-h-[300px] overflow-y-auto">
              {diff.map((token, i) => (
                <span
                  key={i}
                  className={
                    token.type === "removed"
                      ? "bg-destructive/15 text-destructive line-through"
                      : token.type === "added"
                        ? "bg-green-500/15 text-green-400"
                        : "text-foreground"
                  }
                >
                  {token.text}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DiffView;
