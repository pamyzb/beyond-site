import { Bot, User } from 'lucide-react';
import { Title } from '@/components/ui/title';
import { BorderTrail } from '@/components/ui/border-trail';

/** Same card markup and material as Applications, in its dark variant. */
export function AgentOperationComparison() {
  const items = [
    {
      title: 'IA assistiva',
      description: 'Depende de uma ação humana para iniciar ou avançar cada tarefa.',
      icon: User,
    },
    {
      title: 'Colaborador agêntico',
      description:
        'Recebe um evento, executa as etapas e encaminha exceções conforme as regras da operação.',
      icon: Bot,
    },
  ];
  return (
    <div className="agent-operation-comparison theme-dark">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div className="agent-comparison-glass" key={item.title}>
            <span className="agent-comparison-vector" aria-hidden="true" />
            <article className="circular-carousel-card" data-active="true">
              <BorderTrail hoverOnly />
              <span className="circular-carousel-number" aria-hidden="true">
                <Icon strokeWidth={1.75} />
              </span>
              <Title as="h3" variant="service" data-motion="static">
                {item.title}
              </Title>
              <p>{item.description}</p>
            </article>
          </div>
        );
      })}
    </div>
  );
}
