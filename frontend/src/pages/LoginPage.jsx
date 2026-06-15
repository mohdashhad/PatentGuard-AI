import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  validateIdentifier,
  validatePassword,
  sanitizeInput,
} from "../utils/validation";

export default function LoginPage() {
  const { login, loading, error, clearError } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [touched, setTouched] = useState({ identifier: false, password: false });
  const [fieldErrors, setFieldErrors] = useState({ identifier: null, password: null });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const handleIdentifierChange = (e) => {
    const value = e.target.value;
    setIdentifier(value);
    if (touched.identifier || submitAttempted) {
      setFieldErrors((prev) => ({ ...prev, identifier: validateIdentifier(value) }));
    }
    if (error) clearError();
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password || submitAttempted) {
      setFieldErrors((prev) => ({
        ...prev,
        password: validatePassword(value, { isLogin: true }),
      }));
    }
    if (error) clearError();
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "identifier") {
      setFieldErrors((prev) => ({ ...prev, identifier: validateIdentifier(identifier) }));
    } else if (field === "password") {
      setFieldErrors((prev) => ({
        ...prev,
        password: validatePassword(password, { isLogin: true }),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setTouched({ identifier: true, password: true });

    const identifierError = validateIdentifier(identifier);
    const passwordError = validatePassword(password, { isLogin: true });

    setFieldErrors({ identifier: identifierError, password: passwordError });

    if (identifierError || passwordError) {
      return;
    }

    const cleanIdentifier = sanitizeInput(identifier);
    await login(cleanIdentifier, password);
  };

  const inputBaseClasses =
    "w-full px-4 py-3 rounded-md2 border text-sm text-text-primary bg-bg-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 transition-colors";

  const getInputClasses = (fieldError) =>
    `${inputBaseClasses} ${
      fieldError
        ? "border-status-red focus:ring-status-red/30 focus:border-status-red"
        : "border-border-secondary focus:ring-login-accent/30 focus:border-login-accent"
    }`;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg-tertiary px-4 py-8 font-sans">
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-lg2 bg-brand-logoIconBg flex items-center justify-center mb-4 shadow-sm">
            <i className="ti ti-shield-check text-3xl text-brand-logoIconFg" aria-hidden="true"></i>
          </div>
          <h1 className="text-xl font-semibold text-text-primary">PatentGuard</h1>
          <p className="text-sm text-text-tertiary mt-1">Sign in to your dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-bg-primary border border-border-tertiary rounded-lg2 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-text-primary mb-1">Welcome back</h2>
          <p className="text-sm text-text-tertiary mb-6">
            Enter your credentials to access your account.
          </p>

          {error && (
            <div
              role="alert"
              className="mb-4 px-4 py-3 rounded-md2 bg-danger-bg text-danger-fg text-sm font-medium flex items-start gap-2"
            >
              <i className="ti ti-alert-circle text-base mt-0.5" aria-hidden="true"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate autoComplete="on">
            {/* Identifier field */}
            <div className="mb-4">
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-text-secondary mb-1.5"
              >
                Username or email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-tertiary">
                  <i className="ti ti-user text-lg" aria-hidden="true"></i>
                </span>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  inputMode="email"
                  autoComplete="username"
                  placeholder="you@example.com"
                  value={identifier}
                  onChange={handleIdentifierChange}
                  onBlur={() => handleBlur("identifier")}
                  aria-invalid={Boolean(fieldErrors.identifier)}
                  aria-describedby={fieldErrors.identifier ? "identifier-error" : undefined}
                  className={`${getInputClasses(fieldErrors.identifier)} pl-10`}
                  disabled={loading}
                />
              </div>
              {fieldErrors.identifier && (
                <p id="identifier-error" className="mt-1.5 text-xs text-status-red font-medium">
                  {fieldErrors.identifier}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs font-medium text-brand hover:text-brand-hover transition-colors"
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-tertiary">
                  <i className="ti ti-lock text-lg" aria-hidden="true"></i>
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => handleBlur("password")}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                  className={`${getInputClasses(fieldErrors.password)} pl-10 pr-10`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-text-tertiary hover:text-text-secondary transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  <i className={`ti ${showPassword ? "ti-eye-off" : "ti-eye"} text-lg`} aria-hidden="true"></i>
                </button>
              </div>
              {fieldErrors.password && (
                <p id="password-error" className="mt-1.5 text-xs text-status-red font-medium">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center mb-6 mt-3">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-border-secondary text-brand focus:ring-login-accent/30 cursor-pointer"
                disabled={loading}
              />
              <label htmlFor="remember-me" className="ml-2 text-sm text-text-secondary cursor-pointer select-none">
                Remember me on this device
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md2 text-sm font-semibold text-white bg-brand hover:bg-brand-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <i className="ti ti-loader ti-spin text-base" aria-hidden="true"></i>
                  Signing in...
                </>
              ) : (
                <>
                  <i className="ti ti-login-2 text-base" aria-hidden="true"></i>
                  Sign in
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border-tertiary text-center">
            <p className="text-sm text-text-tertiary">
              Don't have an account?{" "}
              <a href="#" className="font-medium text-brand hover:text-brand-hover transition-colors" onClick={(e) => e.preventDefault()}>
                Contact your administrator
              </a>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-text-tertiary mt-6 flex items-center justify-center gap-1.5">
          <i className="ti ti-shield-lock text-sm" aria-hidden="true"></i>
          Secured with end-to-end encrypted connection
        </p>
      </div>
    </div>
  );
}
