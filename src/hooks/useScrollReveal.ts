"use client";

/**
 * useScrollReveal — Mokolo Market
 * Active les animations au scroll via IntersectionObserver
 * Usage : useScrollReveal() dans le composant page
 */

import { useEffect } from "react";

export function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("mm-visible");
            // Stagger pour les enfants directs
            const children = entry.target.querySelectorAll(".mm-stagger-child");
            children.forEach((child, i) => {
              (child as HTMLElement).style.transitionDelay = `${i * 0.07}s`;
              child.classList.add("mm-visible");
            });
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    // Observer tous les éléments avec mm-reveal
    const elements = document.querySelectorAll(".mm-reveal");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}
