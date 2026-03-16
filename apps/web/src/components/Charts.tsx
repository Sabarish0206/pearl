import React, { useEffect, useRef, useState } from 'react';

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
  height?: number;
  showValues?: boolean;
}

const COLORS = ['#4f46e5', '#7c3aed', '#2563eb', '#0891b2', '#059669', '#d97706', '#dc2626', '#9333ea'];

export function BarChart({ data, maxValue, height = 200, showValues = true }: BarChartProps) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: `${height}px`, padding: '0 4px' }}>
        {data.map((item, i) => {
          const pct = max > 0 ? (item.value / max) * 100 : 0;
          const color = item.color ?? COLORS[i % COLORS.length];
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }} title={`${item.label}: ${item.value}`}>
              {showValues && <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', opacity: visible ? 1 : 0, transition: `opacity 0.3s ease ${i * 0.06}s` }}>{item.value}</span>}
              <div style={{
                width: '100%',
                height: visible ? `${pct}%` : '0%',
                minHeight: visible && item.value > 0 ? '4px' : '0',
                background: color,
                borderRadius: '4px 4px 0 0',
                transition: `height 0.55s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s`,
              }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: '8px', padding: '6px 4px 0', borderTop: '1px solid var(--color-border)' }}>
        {data.map((item, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '10px', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

interface HorizontalBarProps {
  label: string;
  value: number;
  maxValue: number;
  color?: string;
  showCount?: boolean;
}

export function HorizontalBar({ label, value, maxValue, color = '#4f46e5', showCount = true }: HorizontalBarProps) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
      <div style={{ width: '120px', fontSize: '13px', color: 'var(--color-text)', textAlign: 'right', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </div>
      <div style={{ flex: 1, background: 'var(--color-border)', borderRadius: '4px', height: '12px', overflow: 'hidden' }}>
        <div style={{
          width: visible ? `${pct}%` : '0%',
          height: '100%',
          background: color,
          borderRadius: '4px',
          transition: 'width 0.65s cubic-bezier(0.16,1,0.3,1)',
        }} />
      </div>
      {showCount && <div style={{ width: '32px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', flexShrink: 0 }}>{value}</div>}
    </div>
  );
}

interface DonutChartProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

export function DonutChart({ value, size = 100, strokeWidth = 10, color = '#4f46e5', label }: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(false);
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setAnimated(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const dash = animated ? (value / 100) * circumference : 0;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <svg ref={ref} width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-border)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      {label && <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{label}</span>}
    </div>
  );
}
