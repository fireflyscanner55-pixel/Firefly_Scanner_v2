"use client";

import { SubmitEvent, useState } from "react";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username || !password) {
      return;
    }

    setIsLoading(true);

    try {
      // TODO:
      // Connect your authentication API here.
      //
      // Example:
      //
      // const response = await fetch("/api/auth/login", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     username,
      //     password,
      //   }),
      // });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log({
        username,
        password,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="
        w-full
        max-w-md

        rounded-3xl

        border
        border-white/20

        bg-white/8

        p-6

        shadow-[0_25px_80px_rgba(0,0,0,0.55)]

        backdrop-blur-2xl

        sm:p-8

        lg:max-w-107.5
        lg:p-10

        xl:max-w-115
      "
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.35em] text-white/50">
          Secure Access
        </p>

        <h1
          className="
            text-2xl
            font-semibold
            tracking-tight
            text-white

            sm:text-3xl
          "
        >
          Welcome Back
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/55">
          Sign in to continue to your account.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username */}
        <div>
          <label
            htmlFor="username"
            className="mb-2 block text-sm font-medium text-white/80"
          >
            Username
          </label>

          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Enter your username"
            className="
              h-12
              w-full
              rounded-xl

              border
              border-white/15

              bg-black/20

              px-4

              text-sm
              text-white

              outline-none

              placeholder:text-white/30

              transition

              focus:border-white/40
              focus:bg-black/30
              focus:ring-2
              focus:ring-white/10
            "
          />
        </div>

        {/* Password */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white/80"
            >
              Password
            </label>

            <button
              type="button"
              className="
                text-xs
                text-white/50
                transition
                hover:text-white
              "
              onClick={() => {
                console.log("Forgot password");
              }}
            >
              Forgot password?
            </button>
          </div>

          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="
                h-12
                w-full
                rounded-xl

                border
                border-white/15

                bg-black/20

                px-4
                pr-12

                text-sm
                text-white

                outline-none

                placeholder:text-white/30

                transition

                focus:border-white/40
                focus:bg-black/30
                focus:ring-2
                focus:ring-white/10
              "
            />

            <button
              type="button"
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
              onClick={() => setShowPassword((value) => !value)}
              className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2

                p-2

                text-white/40

                transition

                hover:text-white
              "
            >
              {showPassword ? (
                /* Eye Off */
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M3 3l18 18" />
                  <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                  <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 8.7 4 10 8-0.4 1.3-1.1 2.5-2 3.5" />
                  <path d="M6.6 6.6C4.7 7.8 3.4 9.7 2 12c1.3 4 5 8 10 8 1.8 0 3.4-.5 4.8-1.2" />
                </svg>
              ) : (
                /* Eye */
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              className="
                h-4
                w-4
                rounded
                border-white/20
                bg-black/20

                accent-white
              "
            />

            <span className="text-sm text-white/55">
              Remember me
            </span>
          </label>
        </div>

        {/* Login button */}
        <button
          type="submit"
          disabled={isLoading}
          className="
            mt-2
            flex
            h-12
            w-full
            items-center
            justify-center
            rounded-xl

            bg-white

            px-5

            text-sm
            font-semibold
            text-black

            shadow-lg

            transition-all
            duration-200

            hover:bg-white/90
            hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)]

            active:scale-[0.99]

            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span
                className="
                  h-4
                  w-4
                  animate-spin
                  rounded-full
                  border-2
                  border-black/20
                  border-t-black
                "
              />

              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-white/30">
          Authorized users only
        </p>
      </div>
    </div>
  );
}