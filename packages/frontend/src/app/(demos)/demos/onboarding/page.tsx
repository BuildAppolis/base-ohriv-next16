"use client";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getVisibleStepIds, type VisibleStepChoice } from "./helpers";

type StepId =
  | "website_choice"
  | "website_url"
  | "name"
  | "company_size"
  | "about"
  | "values";

type FormValues = {
  website_choice: VisibleStepChoice;
  website_url: string;
  name: string;
  company_size: string;
  about: string;
  values: string;
  core_values: { name: string; reason: string }[];
};
const blockedNames = [
  "google",
  "alphabet",
  "facebook",
  "meta",
  "instagram",
  "youtube",
  "netflix",
  "apple",
  "amazon",
  "microsoft",
  "openai",
  "tesla",
  "clickup",
  "notion",
  "salesforce",
  "ibm",
  "oracle",
  "tiktok",
  "twitter",
  "x corp",
];

type Step = {
  id: StepId;
  label: string;
  helper?: string;
  render: (props: {
    value: string;
    onChange: (value: string) => void;
    onNext: (targetStepId?: StepId) => void;
    inputRef: React.RefObject<
      HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement | null
    >;
    secondaryRef?: React.RefObject<HTMLButtonElement | null>;
  }) => React.ReactNode;
};

const stepOrder: StepId[] = [
  "website_choice",
  "website_url",
  "name",
  "company_size",
  "about",
  "values",
];

export default function OnboardingDemoPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [formValues, setFormValues] = useState<FormValues>({
    website_choice: "",
    website_url: "",
    name: "",
    company_size: "",
    about: "",
    values: "",
    core_values: [],
  });

  const inputRef = useRef<
    HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement
  >(null);
  const secondaryRef = useRef<HTMLButtonElement>(null);
  const sizeOptionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const websiteChoice = formValues.website_choice;
  const sizeSelection = formValues.company_size;
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [valueNameDraft, setValueNameDraft] = useState("");
  const [valueReasonDraft, setValueReasonDraft] = useState("");
  const valueNameRef = useRef<HTMLInputElement>(null);
  const valueReasonRef = useRef<HTMLInputElement>(null);
  const addValueRef = useRef<HTMLButtonElement>(null);

  const handleNext = (targetStepId?: StepId) => {
    const shouldValidateCurrent = !targetStepId;
    const currentId = shouldValidateCurrent
      ? stepOrder[activeStep]
      : targetStepId ?? stepOrder[activeStep];

    // Validation only when advancing from current step, not when jumping to a target.
    if (shouldValidateCurrent) {
      setStepError(null);

      if (currentId === "website_choice") {
        if (!formValues.website_choice) {
          setStepError("Please select if you have a company website.");
          return;
        }
      }

      if (currentId === "name") {
        const normalized = formValues.name.trim().toLowerCase();
        if (!normalized) {
          setBlockedMessage("Please enter your company name.");
          setStepError("Company name is required.");
          return;
        }
        if (blockedNames.includes(normalized)) {
          setBlockedMessage(
            "High-profile names are blocked. Contact us if this is your organization."
          );
          setStepError("Company name is not allowed.");
          return;
        }
        setBlockedMessage(null);
      }

      if (currentId === "website_url") {
        const raw = formValues.website_url.trim();
        if (!raw) {
          setUrlError("Please enter your company website.");
          setStepError("Company website is required.");
          return;
        }
        if (raw.toLowerCase().startsWith("http://")) {
          setUrlError("Please use https:// (http is not accepted).");
          setStepError("Only https:// is accepted.");
          return;
        }
        const normalized = `https://${raw.replace(/^https?:\/\//i, "")}`;

        try {
          new URL(normalized);
        } catch {
          setUrlError("Enter a valid URL (e.g., https://example.com).");
          setStepError("Please enter a valid https URL.");
          return;
        }

        setUrlError(null);
        setFormValues((prev) => ({ ...prev, website_url: normalized }));
      }

      if (currentId === "company_size") {
        if (!formValues.company_size) {
          setStepError("Please choose your company size.");
          return;
        }
      }

      if (currentId === "about") {
        const about = formValues.about.trim();
        if (!about || about.length < 20) {
          setStepError(
            "Share a short overview: who you are, what you aim to fix, and how."
          );
          return;
        }
      }
    }

    const visible = getVisibleStepIds(formValues.website_choice) as StepId[];
    const currentVisibleIndex = visible.indexOf(currentId);

    if (targetStepId) {
      setActiveStep(stepOrder.indexOf(targetStepId));
      return;
    }

    // If current is not in visible, snap to first visible.
    if (currentVisibleIndex === -1) {
      setActiveStep(stepOrder.indexOf(visible[0]));
      return;
    }

    const nextVisibleId = visible[currentVisibleIndex + 1];
    if (nextVisibleId) {
      setActiveStep(stepOrder.indexOf(nextVisibleId));
    }
  };

  const handlePrev = () => {
    const visible = getVisibleStepIds(formValues.website_choice) as StepId[];
    const currentId = stepOrder[activeStep];
    const currentVisibleIndex = visible.indexOf(currentId);
    const prevVisibleId = visible[currentVisibleIndex - 1];
    if (prevVisibleId) {
      setActiveStep(stepOrder.indexOf(prevVisibleId));
    }
  };

  const handleChange = (value: string) => {
    setFormValues((prev) => ({ ...prev, [currentStep.id]: value }));
    setStepError(null);
    if (currentStep.id === "name") {
      setBlockedMessage(null);
    }
    if (currentStep.id === "website_url") {
      setUrlError(null);
    }
  };

  const steps: Step[] = [
    {
      id: "website_choice",
      label: "Do you have a company website?",
      helper: "Simplify your setup",
      render: ({ onNext, inputRef, secondaryRef }) => {
        const yesRef = inputRef as React.RefObject<HTMLButtonElement>;
        const noRef = secondaryRef;

        const handleArrow = (e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            noRef?.current?.focus();
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            yesRef.current?.focus();
          }
        };

        return (
          <div
            className="flex items-center gap-3"
            role="radiogroup"
            aria-label="Do you have a company website?"
            onKeyDown={handleArrow}
          >
            <Button
              ref={yesRef}
              variant="primary"
              className="h-11 px-5"
              role="radio"
              aria-checked={websiteChoice === "yes"}
              tabIndex={websiteChoice ? (websiteChoice === "yes" ? 0 : -1) : 0}
              onClick={() => {
                setFormValues((prev) => ({
                  ...prev,
                  website_choice: "yes",
                  website_url: prev.website_url
                    ? prev.website_url.replace(/^https?:\/\//i, "")
                    : "",
                }));
                onNext("website_url");
              }}
            >
              Yes
            </Button>
            <Button
              ref={noRef}
              variant="secondary"
              className="h-11 px-5"
              role="radio"
              aria-checked={websiteChoice === "no"}
              tabIndex={websiteChoice ? (websiteChoice === "no" ? 0 : -1) : 0}
              onClick={() => {
                setFormValues((prev) => ({
                  ...prev,
                  website_choice: "no",
                  website_url: "",
                }));
                onNext("name");
              }}
            >
              Not yet
            </Button>
          </div>
        );
      },
    },
    {
      id: "website_url",
      label: "What’s your company website?",
      helper: "Paste the URL. We’ll scan it to prefill details.",
      render: ({ value, onChange, onNext, inputRef }) => (
        <div className="space-y-2">
          <InputGroup>
            <InputGroupAddon align="inline-start" className="font-medium">
              https://
            </InputGroupAddon>
            <InputGroupInput
              ref={(el) => {
                inputRef.current = el;
              }}
              value={value.replace(/^https?:\/\//i, "")}
              onChange={(e) => {
                const raw = e.target.value.trim();
                const sanitized = raw.replace(/^https?:\/\//i, "");
                const lower = raw.toLowerCase();
                setUrlError(
                  lower.startsWith("http://") ? "Please use https://" : null
                );
                onChange(sanitized);
              }}
              placeholder="example.com"
              inputMode="url"
              aria-label="Company website URL"
              aria-invalid={urlError ? true : undefined}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onNext();
                }
              }}
            />
          </InputGroup>
          {urlError && (
            <p className="text-destructive text-xs">{urlError}</p>
          )}
        </div>
      ),
    },
    {
      id: "name",
      label: "What's your company called?",
      helper: "We’ll use it to personalize the flow.",
      render: ({ value, onChange, onNext, inputRef }) => (
        <div className="space-y-2">
          <Input
            ref={(el) => {
              inputRef.current = el;
            }}
            value={value}
            onChange={(e) => {
              setBlockedMessage(null);
              onChange(e.target.value);
            }}
            placeholder="Type your company name and press Enter"
            aria-label="Company name"
            aria-invalid={blockedMessage ? true : undefined}
            className="h-12 text-base"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onNext();
              }
            }}
          />
          {blockedMessage && (
            <p className="text-destructive text-xs">{blockedMessage}</p>
          )}
        </div>
      ),
    },
    {
      id: "company_size",
      label: "How big is your team?",
      helper: "Pick the closest range.",
      render: ({ onNext }) => {
        const options = [
          { id: "1-10", label: "1–10", desc: "Founding team" },
          { id: "11-50", label: "11–50", desc: "Early growth" },
          { id: "51-200", label: "51–200", desc: "Scaling" },
          { id: "201-500", label: "201–500", desc: "Established" },
          { id: "501-1000", label: "501–1000", desc: "Maturing" },
          { id: "1000+", label: "1000+", desc: "Enterprise" },
        ];

        const moveFocus = (index: number) => {
          if (index < 0 || index >= options.length) return;
          const target = sizeOptionRefs.current[index];
          target?.focus();
        };

        const handleKey = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
          const cols = 2;
          if (["ArrowRight", "ArrowDown"].includes(e.key)) {
            e.preventDefault();
            moveFocus(
              e.key === "ArrowRight" ? index + 1 : index + cols
            );
          }
          if (["ArrowLeft", "ArrowUp"].includes(e.key)) {
            e.preventDefault();
            moveFocus(
              e.key === "ArrowLeft" ? index - 1 : index - cols
            );
          }
        };

        return (
          <div
            className="grid gap-3 sm:grid-cols-2"
            role="radiogroup"
            aria-label="Company size"
          >
            {options.map((option, idx) => (
              <button
                key={option.id}
                ref={(el) => {
                  sizeOptionRefs.current[idx] = el;
                  if (idx === 0 && el) {
                    // Use the shared ref so the step auto-focuses correctly
                    (inputRef as React.MutableRefObject<HTMLButtonElement | null>).current = el;
                  }
                }}
                onClick={() => {
                  setFormValues((prev) => ({
                    ...prev,
                    company_size: option.id,
                  }));
                  setStepError(null);
                  onNext("about");
                }}
                onKeyDown={(e) => handleKey(e, idx)}
                role="radio"
                aria-checked={sizeSelection === option.id}
                tabIndex={
                  sizeSelection
                    ? sizeSelection === option.id
                      ? 0
                      : -1
                    : idx === 0
                      ? 0
                      : -1
                }
                className="group rounded-xl border bg-card/70 p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-foreground">
                    {option.label}
                  </span>
                  <span className="h-2 w-2 rounded-full bg-primary/70 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {option.desc}
                </p>
              </button>
            ))}
          </div>
        );
      },
    },
    {
      id: "about",
      label: "Overview, mission, and industry",
      helper:
        "Give us a quick snapshot: who you are, what you solve, how you solve it, and the industry you’re in.",
      render: ({ value, onChange, onNext, inputRef }) => {
        const aboutIncomplete = value.trim().length < 20;
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Mission • Overview • Industry
              </label>
              <Textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={
                  'Example: "We are Atlas Freight, building AI-driven logistics and inventory visibility for mid-market retailers in North America. Mission: make supply chains transparent, resilient, and 20% faster from port to shelf. Industry: retail tech / supply chain."'
                }
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Share a quick story. We’ll enrich this automatically.
              </p>
            </div>
            <div className="flex justify-end">
              <Button disabled={aboutIncomplete} onClick={() => onNext()}>
                Continue
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      id: "values",
      label: "Define your company values",
      helper:
        "Add up to 6 core values with a short reason.",
      render: ({ inputRef }) => {
        const trimmedName = valueNameDraft.trim();
        const trimmedReason = valueReasonDraft.trim();
        const hasDuplicate = formValues.core_values.some(
          (v) => v.name.toLowerCase() === trimmedName.toLowerCase()
        );
        const atLimit = formValues.core_values.length >= 6;
        const canAdd = !!trimmedName && !!trimmedReason && !hasDuplicate && !atLimit;

        const addValue = () => {
          if (!canAdd) return;
          setFormValues((prev) => ({
            ...prev,
            core_values: [
              ...prev.core_values,
              { name: trimmedName, reason: trimmedReason },
            ],
          }));
          setValueNameDraft("");
          setValueReasonDraft("");
        };

        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If you skip, we’ll draft values based on your answers. You can always
              refine them later.
            </p>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">
                  Value
                </label>
                <Input
                  ref={(el) => {
                    valueNameRef.current = el;
                    (inputRef as React.RefObject<HTMLInputElement | null>).current = el;
                  }}
                  value={valueNameDraft}
                  placeholder="e.g., Innovation"
                  className="h-10"
                  onChange={(e) => setValueNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                      e.preventDefault();
                      valueReasonRef.current?.focus();
                      return;
                    }
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addValue();
                    }
                  }}
                  aria-label="Company value name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">
                  Why this value matters
                </label>
                <Input
                  ref={valueReasonRef}
                  className="h-10"
                  value={valueReasonDraft}
                  placeholder="Short reason or example"
                  onChange={(e) => setValueReasonDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                      e.preventDefault();
                      valueNameRef.current?.focus();
                      return;
                    }
                    if ((e.key === "ArrowRight" || e.key === "ArrowDown") && addValueRef.current) {
                      e.preventDefault();
                      addValueRef.current.focus();
                      return;
                    }
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      addValue();
                    }
                  }}
                  aria-label="Reason this value matters"
                />
              </div>
              <div className="flex items-end">
                <Button
                  ref={addValueRef}
                  size="sm"
                  className="w-full md:w-auto"
                  disabled={!canAdd}
                  onClick={addValue}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                      e.preventDefault();
                      valueReasonRef.current?.focus();
                    }
                  }}
                >
                  {atLimit ? "Limit reached" : "Add"}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Press Enter to add. Max 6 values.
            </p>

            <div className="flex flex-wrap gap-2">
              {formValues.core_values.length === 0 && (
                <span className="text-xs text-muted-foreground">
                  No values added yet. We’ll suggest some if you prefer to skip.
                </span>
              )}
              {formValues.core_values.map((val) => (
                <div
                  key={val.name}
                  className="group flex items-start gap-3 rounded-xl border bg-card/70 px-3 py-2 shadow-sm"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {val.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {val.reason}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setFormValues((prev) => ({
                        ...prev,
                        core_values: prev.core_values.filter(
                          (v) => v.name !== val.name
                        ),
                      }))
                    }
                    className="text-xs text-muted-foreground transition hover:text-foreground"
                    aria-label={`Remove ${val.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end" />
          </div>
        );
      },
    },
  ];

  const currentStep = steps[activeStep];

  useEffect(() => {
    const el = inputRef.current;
    if (el) {
      el.focus();
      if ("select" in el && typeof el.select === "function") {
        el.select();
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStepError(null);
  }, [activeStep]);

  const visibleSteps = useMemo(
    () => getVisibleStepIds(formValues.website_choice),
    [formValues.website_choice]
  );

  const progress = useMemo(() => {
    const currentId = stepOrder[activeStep];
    const currentVisibleIndex = visibleSteps.indexOf(currentId);
    return Math.round(
      (((currentVisibleIndex === -1 ? 0 : currentVisibleIndex) + 1) /
        visibleSteps.length) *
      100
    );
  }, [activeStep, visibleSteps]);

  const currentId = stepOrder[activeStep];
  const stepIsComplete = (() => {
    switch (currentId) {
      case "website_choice":
        return !!formValues.website_choice;
      case "website_url":
        return formValues.website_url.trim().length > 0 && !urlError;
      case "name":
        return formValues.name.trim().length > 0 && !blockedMessage;
      case "company_size":
        return formValues.company_size.trim().length > 0;
      case "about":
        return formValues.about.trim().length >= 20;
      case "values":
        return true; // optional, we can generate them later
      default:
        return true;
    }
  })();

  return (
    <div className="relative isolate flex min-h-[620px] flex-col overflow-hidden rounded-2xl border bg-gradient-to-b from-background via-background to-muted/60 px-4 py-8 shadow-lg md:px-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" withText />
            <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Onboarding Demo
            </div>
          </div>
        </header>

        <div className="space-y-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {(() => {
              const currentId = stepOrder[activeStep];
              const currentVisibleIndex = visibleSteps.indexOf(currentId);
              const displayIndex =
                currentVisibleIndex === -1 ? 1 : currentVisibleIndex + 1;
              return `Step ${displayIndex} of ${visibleSteps.length}`;
            })()}
          </p>
        </div>

        <main className="flex-1">
          <div className="max-w-2xl rounded-xl bg-card/70 p-8 shadow-sm ring-1 ring-border/50">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              {currentStep.helper || "Continue"}
            </p>
            <h2 className="mb-2 text-2xl font-semibold tracking-tight">
              {currentStep.label}
            </h2>
            <div className="space-y-6">
              {currentStep.render({
                value: formValues[currentStep.id],
                onChange: handleChange,
                onNext: handleNext,
                inputRef,
                secondaryRef,
              })}
            </div>
            {stepError && (
              <p className="mt-4 text-destructive text-xs" aria-live="polite">
                {stepError}
              </p>
            )}
          </div>
        </main>

        <footer className="flex items-center justify-between text-sm text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            disabled={activeStep === 0}
            onClick={handlePrev}
            className="text-muted-foreground"
          >
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Press Enter to continue
            </div>
            {currentId === "values" && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleNext()}
              >
                Skip for now
              </Button>
            )}
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleNext()}
              disabled={!stepIsComplete}
            >
              {currentId === "values" ? "Finish" : "Next"}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
