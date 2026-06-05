export function WaveDivider({ flip = false }: { flip?: boolean }) {
  return (
    <div className="w-full overflow-hidden leading-[0]">
      <svg
        viewBox="0 0 1440 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        style={{ transform: flip ? 'rotate(180deg)' : 'none' }}
      >
        <path
          d="M0 30C240 0 480 60 720 30 960 0 1200 60 1440 30V60H0V30Z"
          className="fill-white"
        />
      </svg>
    </div>
  );
}
