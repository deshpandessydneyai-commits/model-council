"use client";

export function DebateFlowDiagram() {
  return (
    <div className="w-full overflow-x-auto py-6">
      <svg
        viewBox="0 0 1200 320"
        className="w-full min-w-max"
        style={{ height: "auto", minHeight: "400px" }}
      >
        {/* Question Input */}
        <rect x="30" y="60" width="150" height="130" rx="8" fill="var(--bg-inset)" stroke="var(--bd)" strokeWidth="2" />
        <text x="105" y="105" textAnchor="middle" fontSize="18" fontWeight="bold" fill="var(--t1)">
          Your
        </text>
        <text x="105" y="130" textAnchor="middle" fontSize="18" fontWeight="bold" fill="var(--t1)">
          Question
        </text>

        {/* Arrow 1 */}
        <line x1="180" y1="125" x2="220" y2="125" stroke="var(--bd)" strokeWidth="3" />
        <polygon points="220,125 210,118 210,132" fill="var(--bd)" />

        {/* Round 1 */}
        <rect x="220" y="30" width="170" height="190" rx="8" fill="var(--bg-inset)" stroke="var(--ac)" strokeWidth="2" />
        <text x="305" y="58" textAnchor="middle" fontSize="16" fontWeight="bold" fill="var(--ac)">
          ROUND 1
        </text>
        <text x="305" y="82" textAnchor="middle" fontSize="14" fill="var(--t1)">
          Independent
        </text>
        <text x="305" y="102" textAnchor="middle" fontSize="14" fill="var(--t1)">
          Responses
        </text>

        {/* 4 Models in Round 1 */}
        <circle cx="235" cy="145" r="15" fill="var(--ac)" opacity="0.3" />
        <circle cx="270" cy="145" r="15" fill="var(--ac)" opacity="0.3" />
        <circle cx="305" cy="145" r="15" fill="var(--ac)" opacity="0.3" />
        <circle cx="340" cy="145" r="15" fill="var(--ac)" opacity="0.3" />

        <text x="305" y="185" textAnchor="middle" fontSize="13" fill="var(--t3)">
          4 models respond
        </text>
        <text x="305" y="203" textAnchor="middle" fontSize="13" fill="var(--t3)">
          independently
        </text>

        {/* Arrow 2 */}
        <line x1="390" y1="125" x2="430" y2="125" stroke="var(--bd)" strokeWidth="3" />
        <polygon points="430,125 420,118 420,132" fill="var(--bd)" />

        {/* Round 2 */}
        <rect x="430" y="30" width="170" height="190" rx="8" fill="var(--bg-inset)" stroke="var(--ac)" strokeWidth="2" />
        <text x="515" y="58" textAnchor="middle" fontSize="16" fontWeight="bold" fill="var(--ac)">
          ROUND 2
        </text>
        <text x="515" y="82" textAnchor="middle" fontSize="14" fill="var(--t1)">
          Critique &
        </text>
        <text x="515" y="102" textAnchor="middle" fontSize="14" fill="var(--t1)">
          Response
        </text>

        {/* Models with dialogue in Round 2 */}
        <circle cx="445" cy="145" r="15" fill="var(--ac)" opacity="0.5" />
        <circle cx="480" cy="145" r="15" fill="var(--ac)" opacity="0.5" />
        <circle cx="515" cy="145" r="15" fill="var(--ac)" opacity="0.5" />
        <circle cx="550" cy="145" r="15" fill="var(--ac)" opacity="0.5" />

        <text x="515" y="185" textAnchor="middle" fontSize="13" fill="var(--t3)">
          Models see others'
        </text>
        <text x="515" y="203" textAnchor="middle" fontSize="13" fill="var(--t3)">
          responses & debate
        </text>

        {/* Arrow 3 */}
        <line x1="600" y1="125" x2="640" y2="125" stroke="var(--bd)" strokeWidth="3" />
        <polygon points="640,125 630,118 630,132" fill="var(--bd)" />

        {/* Optional Round 3 */}
        <rect x="640" y="30" width="170" height="190" rx="8" fill="var(--bg-inset)" stroke="var(--bd)" strokeWidth="2" strokeDasharray="5,5" opacity="0.6" />
        <text x="725" y="58" textAnchor="middle" fontSize="16" fontWeight="bold" fill="var(--t3)">
          ROUND 3
        </text>
        <text x="725" y="82" textAnchor="middle" fontSize="14" fill="var(--t1)">
          Final
        </text>
        <text x="725" y="102" textAnchor="middle" fontSize="14" fill="var(--t1)">
          Statements
        </text>
        <text x="725" y="140" textAnchor="middle" fontSize="12" fill="var(--t3)">
          (Optional)
        </text>

        {/* Arrow 4 */}
        <line x1="810" y1="125" x2="850" y2="125" stroke="var(--bd)" strokeWidth="3" />
        <polygon points="850,125 840,118 840,132" fill="var(--bd)" />

        {/* Verdict */}
        <rect x="850" y="60" width="160" height="130" rx="8" fill="var(--ac)" opacity="0.1" stroke="var(--ac)" strokeWidth="2" />
        <text x="930" y="100" textAnchor="middle" fontSize="17" fontWeight="bold" fill="var(--t1)">
          Verdict
        </text>
        <text x="930" y="125" textAnchor="middle" fontSize="13" fill="var(--t2)">
          Synthesized
        </text>
        <text x="930" y="145" textAnchor="middle" fontSize="13" fill="var(--t2)">
          Analysis
        </text>

        {/* Legend */}
        <text x="30" y="285" fontSize="14" fill="var(--t3)">
          💭 Each circle = one AI model responding
        </text>
      </svg>
    </div>
  );
}
