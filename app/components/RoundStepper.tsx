import React from "react";

interface RoundStepperProps {
  currentStep: 0 | 1 | 2;
  modelStatuses?: Record<string, "done" | "responding" | "waiting">;
  completedRounds?: number;
}

const steps = [
  { label: "Independent", sublabel: "Round 1" },
  { label: "Critique", sublabel: "Round 2" },
  { label: "Verdict", sublabel: "Synthesis" },
];

export const RoundStepper: React.FC<RoundStepperProps> = ({
  currentStep,
  modelStatuses = {},
  completedRounds = 0,
}) => {
  const respondingCount = Object.values(modelStatuses).filter(
    (s) => s === "responding"
  ).length;

  return (
    <>
      <style>{`
        @keyframes pulse-ring {
          0% {
            box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(139, 92, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(139, 92, 246, 0);
          }
        }
        .pulse-ring {
          animation: pulse-ring 1.5s infinite;
        }
      `}</style>

      <div
        className="rounded-lg border p-5"
        style={{
          backgroundColor: "var(--bg-inset)",
          borderColor: "var(--bd)",
        }}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Steps container */}
          <div className="flex flex-1 items-center">
            {steps.map((step, idx) => (
              <React.Fragment key={idx}>
                {/* Step dot and label */}
                <div className="flex flex-1 flex-col items-center gap-2">
                  {/* Dot */}
                  <div
                    className="flex items-center justify-center rounded-full font-mono text-xs font-bold transition-all"
                    style={{
                      width: "28px",
                      height: "28px",
                      backgroundColor:
                        idx < currentStep
                          ? "#22c55e"
                          : idx === currentStep
                            ? "#8B5CF6"
                            : "rgba(0,0,0,0.08)",
                      color:
                        idx < currentStep || idx === currentStep
                          ? "white"
                          : "var(--t4)",
                      ...(idx === currentStep && {
                        boxShadow: "0 0 0 4px rgba(139, 92, 246, 0.2)",
                      }),
                    }}
                    className={idx === currentStep ? "pulse-ring" : ""}
                  >
                    {idx < currentStep ? "✓" : idx === currentStep ? "2" : idx + 3}
                  </div>

                  {/* Label */}
                  <div className="text-center">
                    <div
                      className="text-xs font-semibold"
                      style={{
                        color:
                          idx <= currentStep ? "var(--t1)" : "var(--t4)",
                      }}
                    >
                      {step.label}
                    </div>
                    <div
                      className="font-mono text-xs"
                      style={{
                        color:
                          idx <= currentStep ? "var(--t3)" : "var(--t4)",
                      }}
                    >
                      {step.sublabel}
                    </div>
                  </div>
                </div>

                {/* Connector line (between steps) */}
                {idx < steps.length - 1 && (
                  <div
                    className="mb-8 h-px flex-1 bg-[var(--bd)]"
                    style={{
                      backgroundColor:
                        idx < currentStep
                          ? "rgba(34, 197, 94, 0.3)"
                          : "var(--bd)",
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Right side: Active model count (if deliberate stage) */}
          {currentStep === 1 && respondingCount > 0 && (
            <div
              className="ml-4 rounded-md px-3 py-1 text-xs font-mono"
              style={{
                backgroundColor: "rgba(139, 92, 246, 0.1)",
                color: "#8B5CF6",
                border: "1px solid rgba(139, 92, 246, 0.2)",
              }}
            >
              {respondingCount} responding
            </div>
          )}
        </div>
      </div>
    </>
  );
};
