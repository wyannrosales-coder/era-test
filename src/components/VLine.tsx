type VLineProps = {
  src: string;
  length: number;
};

/** Vertical hairline: the Figma asset is a horizontal line rotated 90°. */
export default function VLine({ src, length }: VLineProps) {
  return (
    <div className="vline" style={{ height: length }} aria-hidden>
      <img src={src} width={length} height={1} alt="" />
    </div>
  );
}
