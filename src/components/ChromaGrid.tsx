import { useEffect, useRef } from "react";
import type { CSSProperties, MouseEvent, PointerEvent } from "react";
import { gsap } from "gsap";
import "./ChromaGrid.css";

export interface ChromaGridItem {
  title: string;
  subtitle: string;
  handle?: string;
  location?: string;
  image?: string;
  symbol?: string;
  motif?: "wooden-fish" | "wish-lamp" | "fortune-stick" | "calendar" | "meditation" | "dream";
  borderColor?: string;
  gradient: string;
  url?: string;
}

interface ChromaGridProps {
  items?: ChromaGridItem[];
  className?: string;
  radius?: number;
  columns?: number;
  rows?: number;
  damping?: number;
  fadeOut?: number;
  ease?: string;
  onItemClick?: (item: ChromaGridItem) => void;
}

export function ChromaGrid({
  items,
  className = "",
  radius = 300,
  columns = 3,
  rows = 2,
  damping = 0.45,
  fadeOut = 0.6,
  ease = "power3.out",
  onItemClick,
}: ChromaGridProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const fadeRef = useRef<HTMLDivElement | null>(null);
  const setX = useRef<((value: number) => void) | null>(null);
  const setY = useRef<((value: number) => void) | null>(null);
  const pos = useRef({ x: 0, y: 0 });

  const data = items?.length ? items : [];

  useEffect(() => {
    const el = rootRef.current;
    if (!el) {
      return;
    }

    setX.current = gsap.quickSetter(el, "--x", "px") as (value: number) => void;
    setY.current = gsap.quickSetter(el, "--y", "px") as (value: number) => void;

    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);

    return () => {
      gsap.killTweensOf(pos.current);
      if (fadeRef.current) {
        gsap.killTweensOf(fadeRef.current);
      }
    };
  }, []);

  const moveTo = (x: number, y: number) => {
    gsap.to(pos.current, {
      x,
      y,
      duration: damping,
      ease,
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true,
    });
  };

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const rect = root.getBoundingClientRect();
    moveTo(event.clientX - rect.left, event.clientY - rect.top);
    gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
  };

  const handleLeave = () => {
    gsap.to(fadeRef.current, {
      opacity: 1,
      duration: fadeOut,
      overwrite: true,
    });
  };

  const handleCardClick = (item: ChromaGridItem) => {
    if (onItemClick) {
      onItemClick(item);
      return;
    }

    if (item.url) {
      window.open(item.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleCardMove = (event: MouseEvent<HTMLElement>) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div
      ref={rootRef}
      className={`chroma-grid ${className}`}
      style={
        {
          "--r": `${radius}px`,
          "--cols": columns,
          "--rows": rows,
        } as CSSProperties
      }
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {data.map((item) => (
        <article
          key={item.title}
          className={`chroma-card ${item.motif ? `is-${item.motif}` : ""}`}
          data-mark={item.symbol ?? item.title.slice(0, 1)}
          onMouseMove={handleCardMove}
          onClick={() => handleCardClick(item)}
          style={
            {
              "--card-border": item.borderColor || "transparent",
              "--card-gradient": item.gradient,
              cursor: item.url || onItemClick ? "pointer" : "default",
            } as CSSProperties
          }
        >
          {item.motif && (
            <div className="chroma-scene" aria-hidden="true">
              <span className="scene-a" />
              <span className="scene-b" />
              <span className="scene-c" />
            </div>
          )}
          <div className="chroma-img-wrapper">
            {item.image ? (
              <img src={item.image} alt={item.title} loading="lazy" />
            ) : (
              <div className="chroma-symbol" aria-hidden="true">
                {item.symbol ?? item.title.slice(0, 1)}
              </div>
            )}
          </div>
          <footer className="chroma-info">
            <h3 className="name">{item.title}</h3>
            {item.handle && <span className="handle">{item.handle}</span>}
            <p className="role">{item.subtitle}</p>
            {item.location && <span className="location">{item.location}</span>}
          </footer>
        </article>
      ))}
      <div className="chroma-overlay" />
      <div ref={fadeRef} className="chroma-fade" />
    </div>
  );
}

export default ChromaGrid;
