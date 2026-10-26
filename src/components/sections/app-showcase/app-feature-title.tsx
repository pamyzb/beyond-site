import type { DesignBlock } from '@/lib/figma/design';
import { Title } from '@/components/ui/title';
import { AppTitleWord } from './app-title-word';
export function AppFeatureTitle({ block, project }: { block: DesignBlock; project: boolean }) {
  return (
    <Title
      as="h3"
      id={project ? 'app-project-title' : undefined}
      variant="app-feature"
      className="text-block app-feature-title"
      data-source={block.source}
      data-role="h3"
    >
      {project ? (
        <>
          <span className="app-feature-title-line">Seu projeto na</span>
          <span className="app-feature-title-line">
            <AppTitleWord text="palma" /> da mão
          </span>
        </>
      ) : (
        <>
          <span className="app-feature-title-line">
            <AppTitleWord text="Experimente" /> o nosso
          </span>
          <span className="app-feature-title-line">trabalho</span>
        </>
      )}
    </Title>
  );
}
