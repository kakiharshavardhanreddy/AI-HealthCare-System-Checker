"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { cn } from "@/lib/utils";

export function Accordion({ items }: { items: { question: string; answer: string }[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const active = open === index;
        return (
          <div key={item.question} className={cn("glass-panel rounded-2xl border-l-4 p-5 transition", active ? "border-l-bio-cyan" : "border-l-transparent")}>
            <button
              type="button"
              onClick={() => setOpen(active ? -1 : index)}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <span className={cn("font-semibold transition", active ? "text-bio-cyan" : "text-bio-ice")}>{item.question}</span>
              <ChevronDown className={cn("h-5 w-5 shrink-0 text-bio-cyan transition", active && "rotate-180")} />
            </button>
            <AnimatePresence initial={false}>
              {active ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <p className="pt-4 leading-7 text-bio-muted">{item.answer}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
