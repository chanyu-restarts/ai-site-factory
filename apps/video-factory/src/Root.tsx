import { Composition } from "remotion";
import { ToolShort, defaultToolShortProps } from "./ToolShort";
import { CompareDuo, defaultCompareDuoProps } from "./CompareDuo";
import type { CompareDuoProps } from "./CompareDuo";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="ToolShort"
        component={ToolShort}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={defaultToolShortProps}
      />
      <Composition
        id="CompareDuo"
        component={CompareDuo}
        fps={30}
        width={1920}
        height={1080}
        durationInFrames={300}
        defaultProps={defaultCompareDuoProps}
        calculateMetadata={({ props }: { props: CompareDuoProps }) => {
          const fps = props.fps ?? 30;
          const totalDurationSec = props.lines.reduce((s, l) => s + l.durationSec, 0) || 10;
          return {
            durationInFrames: Math.max(Math.ceil(totalDurationSec * fps), 30),
            fps,
          };
        }}
      />
    </>
  );
};
