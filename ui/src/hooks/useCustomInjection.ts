import { useEffect, useRef } from "react";

interface CustomInjectionProps {
  customCss?: string;
  customHtml?: string;
  customJs?: string;
}

/**
 * Hook to inject custom CSS, HTML, and JavaScript into the page.
 * This is used for organization-specific customization of auth pages.
 */
export const useCustomInjection = ({
  customCss,
  customHtml,
  customJs,
}: CustomInjectionProps) => {
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const htmlContainerRef = useRef<HTMLDivElement | null>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    // Inject custom CSS
    if (customCss) {
      // Remove existing custom style if any
      if (styleRef.current) {
        styleRef.current.remove();
      }

      const style = document.createElement("style");
      style.id = "org-custom-css";
      style.textContent = customCss;
      document.head.appendChild(style);
      styleRef.current = style;
    }

    return () => {
      if (styleRef.current) {
        styleRef.current.remove();
        styleRef.current = null;
      }
    };
  }, [customCss]);

  useEffect(() => {
    // Inject custom HTML
    if (customHtml) {
      // Remove existing custom HTML if any
      if (htmlContainerRef.current) {
        htmlContainerRef.current.remove();
      }

      const container = document.createElement("div");
      container.id = "org-custom-html";
      container.innerHTML = customHtml;
      document.body.appendChild(container);
      htmlContainerRef.current = container;
    }

    return () => {
      if (htmlContainerRef.current) {
        htmlContainerRef.current.remove();
        htmlContainerRef.current = null;
      }
    };
  }, [customHtml]);

  useEffect(() => {
    // Inject custom JavaScript
    if (customJs) {
      // Remove existing custom script if any
      if (scriptRef.current) {
        scriptRef.current.remove();
      }

      const script = document.createElement("script");
      script.id = "org-custom-js";
      script.textContent = customJs;
      document.body.appendChild(script);
      scriptRef.current = script;
    }

    return () => {
      if (scriptRef.current) {
        scriptRef.current.remove();
        scriptRef.current = null;
      }
    };
  }, [customJs]);
};

export default useCustomInjection;
