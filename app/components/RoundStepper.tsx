"use client";

import { useEffect, useState } from "react";

interface RoundStepperProps {
  currentStep: 0 | 1 | 2;
  modelStatuses?: Record<string, "done" | "responding" | "waiting">;
  completedRounds?: number;
}

const steps = [
  { id: 0, label: "Independent" },
  { id: 1, label: "Critique & Update" },
  { id: 2, label: "Final Statements" },
];

export function RoundStepper({
  currentStep,
  modelStatuses = {},
  completedRounds = 0,
}: RoundStepperProps) {
  const [pulsing, setPulsing] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulsing((p) => !p);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        @keyframes pulse-ring {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1.5);
          }
        }
      `}</style>

      <div
        className="mb-3 p-3 rounded-lg border"
        style={{
          backgroundColor: "var(--bg-inset)",
          borderColor: "var(--bd)",
        }}
      >
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex-1">
              {/* Step dot and label */}
              <div className="flex flex-col items-center">
                <div className="relative mb-1">
                  {/* Dot */}
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center font-semibold text-white text-xs relative"
                    style={{
                      backgroundColor:
                        idx < currentStep
                          ? "#22c55e"
                          : idx === currentStep
                          ? "#8B5CF6"
                          : "#e5e7eb",
                      color:
                        idx < currentStep || idx === currentStep
                          ? "white"
                          : "#9ca3af",
                      fontSize: "10px",
                    }}
                  >
                    {idx < currentStep ? "✓" : idx === currentStep && pulsing ? "●" : idx + 1}
                  </div>

                  {/* Pulse ring for active step */}
                  {idx === currentStep && pulsing && (
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        backgroundColor: "transparent",
                        border: "2px solid #8B5CF6",
                        animation: "pulse-ring 1s ease-out infinite",
                      }}
                    />
                  )}
                </div>

                {/* Step label */}
                <div
                  className="text-2xs font-medium text-center whitespace-nowrap"
                  style={{
                    color:
                      idx <= currentStep ? "var(--t1)" : "var(--t3)",
                    fontSize: "10px",
                    lineHeight: "1.2",
                  }}
                >
                  {step.label}
                </div>
              </div>

              {/* Connector line to next step */}
              {idx < steps.length - 1 && (
                <div
                  className="h-px mt-1.5 mx-2 flex-1"
                  style={{
                    backgroundColor:
                      idx < currentStep
                        ? "#22c55e"
                        : "var(--bd)",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Round info below */}
        <div
          className="text-2xs text-center mt-2"
          style={{ color: "var(--t3)", fontSize: "10px" }}
        >
          {completedRounds > 0 ? (
            <span>Completed {completedRounds} round{completedRounds !== 1 ? "s" : ""}</span>
          ) : (
            <span>Starting debate...</span>
          )}
        </div>
      </div>
    </>
  );
}
