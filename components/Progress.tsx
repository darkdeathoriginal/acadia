export default function Progress({ percentage, width }) {
  const radius = width / 2.15;
  const da = radius * Math.PI * 2;
  const doff = da - (da * percentage) / 100;
  return (
    <div className="text-white">
      <svg width={width} height={width} viewBox={`0 0 ${width} ${width}`}>
        <circle
          cx={width / 2}
          cy={width / 2}
          strokeWidth={"5px"}
          r={radius}
          className="circle-bg"
        />
        <circle
          cx={width / 2}
          cy={width / 2}
          strokeWidth={"5px"}
          r={radius}
          className="circle-pg"
          style={{
            strokeDasharray: da,
            strokeDashoffset: doff,
          }}
          transform={`rotate(-90 ${width / 2} ${width / 2})`}
        >
          <animate
            attributeName="stroke-dashoffset"
            from={da}
            to={doff || 0}
            dur="0.4s"
            begin="0s"
            calcMode="spline"
            keySplines="0.25 0.1 0.25 1"
          />
        </circle>

        <text
          x="50%"
          y="50%"
          dy="0.3em"
          textAnchor="middle"
          fill="#fff"
          className="circle-text "
        >
          {percentage}%
        </text>
      </svg>
    </div>
  );
}
