'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ArrowLeftRight,
  Check,
  LoaderCircle,
  PackageCheck,
  ReceiptText,
  Users,
  Boxes,
  ChartNoAxesCombined,
} from 'lucide-react';
import { agentTaskFrame } from '@/lib/animation/agent-motion';

const tasks = [
  { title: 'Faturamento', detail: 'Notas fiscais', icon: ReceiptText },
  { title: 'Pedidos', detail: 'Pedidos recebidos', icon: PackageCheck },
  { title: 'Conciliação', detail: 'Movimentações', icon: ArrowLeftRight },
];

const supportTasks = [
  { title: 'Cadastros', detail: 'Dados atualizados', icon: Users },
  { title: 'Estoque', detail: 'Saldos conferidos', icon: Boxes },
  { title: 'Relatórios', detail: 'Indicadores prontos', icon: ChartNoAxesCombined },
];

export function AgentTasks({
  active,
  secondary = false,
}: {
  active: boolean;
  secondary?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const percentage = useRef<HTMLSpanElement>(null);
  const [task, setTask] = useState({ index: 0, complete: false });
  const committed = useRef(task);
  const latest = useRef(agentTaskFrame(0));

  useLayoutEffect(() => {
    committed.current = task;
    const frame = latest.current;
    bar.current!.style.transform = `scaleX(${frame.progress})`;
    percentage.current!.textContent = `${Math.round(frame.progress * 100)}%`;
  }, [task]);

  useEffect(() => {
    if (!active) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let elapsed = 0;
    let previous = performance.now();
    let frameId = 0;
    let currentKey = '';
    let visible = true;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      previous = performance.now();
    });
    observer.observe(host.current!);
    const tick = () => {
      const now = performance.now();
      if (!document.hidden && visible && !preference.matches) elapsed += now - previous;
      previous = now;
      const frame = agentTaskFrame(preference.matches ? 6000 : elapsed);
      latest.current = frame;
      if (
        committed.current.index === frame.index &&
        committed.current.complete === frame.complete
      ) {
        bar.current!.style.transform = `scaleX(${frame.progress})`;
        percentage.current!.textContent = `${Math.round(frame.progress * 100)}%`;
      }
      const key = `${frame.index}-${frame.complete}`;
      if (key !== currentKey) {
        currentKey = key;
        setTask({ index: frame.index, complete: frame.complete });
      }
      frameId = requestAnimationFrame(tick);
    };
    const resetClock = () => {
      previous = performance.now();
    };
    document.addEventListener('visibilitychange', resetClock);
    preference.addEventListener('change', resetClock);
    tick();
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      document.removeEventListener('visibilitychange', resetClock);
      preference.removeEventListener('change', resetClock);
    };
  }, [active]);

  const current = (secondary ? supportTasks : tasks)[task.index];
  const Icon = current.icon;

  return (
    <div
      ref={host}
      className={`agent-task-ribbon${secondary ? ' agent-task-ribbon-secondary' : ''}`}
      data-active={active}
      data-complete={task.complete}
    >
      <div className="agent-task-copy">
        <div className="agent-task-identity">
          <span className="agent-task-icon">
            <Icon size={20} strokeWidth={1.6} />
          </span>
          <div>
            <span className="agent-task-label">{current.title}</span>
            <span className="agent-task-detail">{current.detail}</span>
          </div>
        </div>
        <div className="agent-task-feedback">
          <span className="agent-task-status">
            {task.complete ? <Check size={12} /> : <LoaderCircle size={12} />}
            {task.complete ? 'Concluído' : 'Em execução'}
          </span>
          <span ref={percentage} className="agent-task-percentage" />
        </div>
      </div>
      <div className="agent-task-track">
        <span ref={bar} />
      </div>
    </div>
  );
}
