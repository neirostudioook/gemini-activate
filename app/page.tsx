"use client";

import { useState, useCallback } from "react";

type AppState = "input" | "loading" | "success" | "activated" | "not-found";

const ACTIVATION_URL =
  "https://business.gemini.google/?_gl=1*m9k33*_ga*MTM5MDg0MjAwNC4xNzQwNzY1MjUx*_ga_WH2QY8WWF5*czE3NzMyMjUzNzQkbzQ4JGcxJHQxNzczMjI2OTU2JGo2MCRsMCRoMA..";

const LOADING_STEPS = [
  { label: "Проверка аккаунта Google...", duration: 8000 },
  { label: "Проверка доступности...", duration: 7000 },
  { label: "Настройка Gemini 3.1 Pro...", duration: 8000 },
  { label: "Активация подписки...", duration: 7000 },
];

function GeminiLogo() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="gemini-grad" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#4285f4" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <path
        d="M20 2C20 2 28 10 28 20C28 30 20 38 20 38C20 38 12 30 12 20C12 10 20 2 20 2Z"
        fill="url(#gemini-grad)"
        opacity="0.9"
      />
      <path
        d="M2 20C2 20 10 12 20 12C30 12 38 20 38 20C38 20 30 28 20 28C10 28 2 20 2 20Z"
        fill="url(#gemini-grad)"
        opacity="0.7"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<AppState>("input");
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const runLoadingAnimation = useCallback(() => {
    setState("loading");
    setCurrentStep(0);
    setProgress(0);

    let elapsed = 0;
    const totalDuration = LOADING_STEPS.reduce((sum, s) => sum + s.duration, 0);

    const progressInterval = setInterval(() => {
      elapsed += 100;
      const pct = Math.min((elapsed / totalDuration) * 100, 99);
      setProgress(pct);
    }, 100);

    let stepAccum = 0;
    LOADING_STEPS.forEach((step, index) => {
      stepAccum += step.duration;
      if (index < LOADING_STEPS.length - 1) {
        setTimeout(() => {
          setCurrentStep(index + 1);
        }, stepAccum);
      }
    });

    setTimeout(() => {
      clearInterval(progressInterval);
      setProgress(100);
      setTimeout(() => {
        setState("success");
      }, 500);
    }, totalDuration);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Введите email адрес");
      return;
    }

    try {
      const res = await fetch("/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка сервера");
        return;
      }

      if (!data.found) {
        setState("not-found");
        return;
      }

      if (data.activated) {
        setState("activated");
        return;
      }

      runLoadingAnimation();
    } catch {
      setError("Ошибка подключения к серверу");
    }
  };

  const handleReset = () => {
    setEmail("");
    setState("input");
    setError("");
    setCurrentStep(0);
    setProgress(0);
  };

  return (
    <>
      <div className="animated-bg" />
      <main className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="w-full px-6 py-5">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GeminiLogo />
              <span className="text-lg font-semibold tracking-tight">
                Gemini <span className="text-[var(--text-secondary)]">3.1 Pro</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <ShieldIcon />
              <span className="hidden sm:inline">Безопасная активация</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-16">
          {/* Input State */}
          {state === "input" && (
            <div className="w-full max-w-xl flex flex-col items-center text-center" style={{ animation: "fade-in 0.6s ease-out" }}>
              <div className="mb-6">
                <GeminiLogo />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
                Активировать <span className="gemini-gradient">GEMINI BUSSINESS</span>
              </h1>
              <p className="text-[var(--text-secondary)] text-lg mb-10 max-w-md leading-relaxed">
                Введите email вашего Google Workspace аккаунта для активации подписки Gemini 3.1 Pro
              </p>

              <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col gap-4">
                <input
                  type="email"
                  className="email-input"
                  placeholder="your@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  id="email-input"
                />
                {error && (
                  <p className="text-red-400 text-sm" style={{ animation: "fade-in 0.3s ease-out" }}>{error}</p>
                )}
                <button type="submit" className="btn-primary" id="check-access-btn">
                  <span>Проверить доступ</span>
                </button>
              </form>

              {/* Feature cards */}
              <div className="feature-grid">
                <div className="feature-card">
                  <div className="feature-icon" style={{ background: "rgba(66, 133, 244, 0.1)", color: "#4285f4" }}>
                    <ZapIcon />
                  </div>
                  <h3 className="font-semibold mb-1 text-sm">Продвинутый ИИ</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Доступ к Gemini 3.1 Pro с расширенным контекстным окном и мультимодальными возможностями
                  </p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon" style={{ background: "rgba(168, 85, 247, 0.1)", color: "#a855f7" }}>
                    <ShieldIcon />
                  </div>
                  <h3 className="font-semibold mb-1 text-sm">Корпоративная безопасность</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Защита данных в соответствии с корпоративными стандартами безопасности
                  </p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon" style={{ background: "rgba(236, 72, 153, 0.1)", color: "#ec4899" }}>
                    <StarIcon />
                  </div>
                  <h3 className="font-semibold mb-1 text-sm">Интеграция с Workspace</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Бесшовная интеграция с Gmail, Docs, Sheets и другими сервисами Google
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {state === "loading" && (
            <div className="loader-container" style={{ animation: "fade-in 0.5s ease-out" }}>
              <div className="gemini-spinner">
                <div className="ring" />
                <div className="ring" />
                <div className="ring" />
                <div className="core" />
              </div>

              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Настраиваем вашу подписку</h2>
                <p className="text-sm text-[var(--text-secondary)]">{email}</p>
              </div>

              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>

              <div className="progress-steps">
                {LOADING_STEPS.map((step, index) => {
                  let stepState: "pending" | "active" | "completed" = "pending";
                  if (index < currentStep) stepState = "completed";
                  else if (index === currentStep) stepState = "active";

                  return (
                    <div key={index} className={`progress-step ${stepState}`}>
                      <div className={`step-icon ${stepState}`}>
                        {stepState === "completed" ? (
                          <CheckIcon />
                        ) : stepState === "active" ? (
                          <SpinnerIcon />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <span className="text-sm">{step.label}</span>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-[var(--text-secondary)] mt-2">
                Пожалуйста, не закрывайте эту страницу
              </p>
            </div>
          )}

          {/* Success State */}
          {state === "success" && (
            <div className="flex flex-col items-center text-center gap-6" style={{ animation: "fade-in 0.6s ease-out" }}>
              <div className="success-checkmark">
                <SuccessIcon />
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Подписка готова!</h2>
                <p className="text-[var(--text-secondary)] mb-1">
                  Gemini 3.1 Pro настроен для аккаунта
                </p>
                <p className="text-[var(--gemini-blue)] font-medium">{email}</p>
              </div>

              <a
                href={ACTIVATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-success"
                id="activate-btn"
              >
                ✦ Получить GEMINI BUSSINESS
              </a>

              <div className="glass-card px-6 py-4 max-w-md" style={{ background: "rgba(66, 133, 244, 0.04)" }}>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  <span className="text-[var(--text-primary)] font-medium">Далее:</span>{" "}
                  Следуйте инструкциям на сайте Google для завершения активации. Войдите с тем же email адресом.
                </p>
              </div>

              <button
                onClick={handleReset}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mt-4 cursor-pointer"
              >
                ← Активировать другой аккаунт
              </button>
            </div>
          )}

          {/* Already Activated State */}
          {state === "activated" && (
            <div className="already-activated flex flex-col items-center gap-6">
              <AlertIcon />
              <div>
                <h2 className="text-2xl font-bold mb-2">Уже активировано</h2>
                <p className="text-[var(--text-secondary)] max-w-sm leading-relaxed">
                  Подписка Gemini 3.1 Pro уже была активирована для аккаунта{" "}
                  <span className="text-[var(--gemini-blue)]">{email}</span>.
                  Если вам нужна помощь, обратитесь к администратору.
                </p>
              </div>

              <a
                href={ACTIVATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <span>Перейти к Gemini 3.1 Pro →</span>
              </a>

              <button
                onClick={handleReset}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                ← Попробовать другой email
              </button>
            </div>
          )}

          {/* Not Found State */}
          {state === "not-found" && (
            <div className="already-activated flex flex-col items-center gap-6">
              <ErrorIcon />
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Доступ запрещён</h2>
                <p className="text-[var(--text-secondary)] max-w-sm leading-relaxed">
                  Email <span className="text-[var(--text-primary)]">{email}</span> не имеет права на активацию Gemini 3.1 Pro. Проверьте email или свяжитесь с администратором вашей организации.
                </p>
              </div>

              <button
                onClick={handleReset}
                className="btn-primary"
              >
                <span>← Попробовать другой email</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
