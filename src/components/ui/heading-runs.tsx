import { Fragment } from 'react';
import type { TextRun } from '@/lib/figma/design';
export function HeadingRuns({ runs }: { runs: TextRun[] }) {
  return (
    <>
      {runs.map((run, index) => (
        <Fragment key={`${run.text}-${run.x}-${run.y}-${index}`}>
          {index > 0 && Math.abs(run.y - runs[index - 1].y) > 1 && <br />}
          {run.italic ? <em>{run.text}</em> : <span>{run.text}</span>}
        </Fragment>
      ))}
    </>
  );
}
