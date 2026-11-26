"use client";
import * as Slider from "@radix-ui/react-slider";
export default function Volume({
  value = 1,
  onChange,
  disabled = false,
}: {
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <Slider.Root
      className="slider-root"
      disabled={disabled}
      value={[value]}
      onValueChange={(v) => onChange?.(v[0])}
      max={1}
      step={0.05}
    >
      <Slider.Track className="slider-track">
        <Slider.Range className="slider-range" />
      </Slider.Track>
      <Slider.Thumb aria-label="Volume" className="slider-thumb" />
    </Slider.Root>
  );
}
