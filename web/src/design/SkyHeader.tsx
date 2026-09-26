import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { moonPath, type skyForDate } from "./sky";
type Sky = ReturnType<typeof skyForDate>;
const stars = Array.from({ length: 36 }, (_, i) => ({
  x: ((i * 97 + 41) % 580) + 10,
  y: ((i * 43 + 11) % 170) + 10,
  r: i % 4 === 0 ? 1.2 : 0.7,
}));
export function SkyHeader({
  sky,
  reduced,
  children,
  onVisibility,
}: {
  sky: Sky;
  reduced: boolean;
  children: ReactNode;
  onVisibility: (visible: boolean) => void;
}) {
  const id = useId().replaceAll(":", "");
  const root = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      onVisibility(entry.isIntersecting);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [onVisibility]);
  const moonY = 170 - (Math.max(0, Math.min(90, sky.moon.altitude)) / 90) * 140;
  const moonX = 350 + Math.sin((sky.moon.azimuth * Math.PI) / 180) * 45;
  return (
    <section
      ref={root}
      className="v2-sky"
      data-paused={reduced || !visible}
      style={
        {
          "--sky-top": sky.colors[0],
          "--sky-middle": sky.colors[1],
          "--sky-horizon": sky.colors[2],
        } as CSSProperties
      }
    >
      <svg
        className="v2-sky-art"
        viewBox="0 0 600 350"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${id}-sky`} x2="0" y2="1">
            <stop stopColor={sky.colors[0]} />
            <stop offset=".55" stopColor={sky.colors[1]} />
            <stop offset="1" stopColor={sky.colors[2]} />
          </linearGradient>
        </defs>
        <rect width="600" height="350" fill={`url(#${id}-sky)`} />
        <g opacity={sky.stars} className="v2-stars">
          {stars.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} />
          ))}
        </g>
        {sky.moon.altitude > 0 && (
          <g
            transform={`translate(${moonX} ${moonY}) rotate(${sky.moon.angle - sky.moon.parallacticAngle})`}
          >
            <circle r="14" className="v2-moon-dark" />
            <path
              d={moonPath(sky.moon.fraction, sky.moon.waxing)}
              className="v2-moon-light"
            />
          </g>
        )}
        <path
          d="M0 304 Q60 276 120 302 T250 296 T400 305 T600 286 V350 H0Z"
          className="v2-hill-back"
        />
        <path
          d="M0 330 Q120 292 260 321 T600 319 V350 H0Z"
          className="v2-hill-front"
        />
        <path
          d="M0 343 Q130 319 260 338 T600 335"
          className="v2-horizon-line"
        />
      </svg>
      <div className="v2-sky-content">{children}</div>
    </section>
  );
}
