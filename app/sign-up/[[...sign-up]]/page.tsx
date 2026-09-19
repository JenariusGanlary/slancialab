import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background:
          "radial-gradient(1000px circle at 90% 0%, rgba(217,164,65,0.13), transparent 60%), radial-gradient(600px circle at 0% 100%, rgba(15,110,106,0.06), transparent 60%), linear-gradient(160deg, #16191B 0%, #0C0F11 100%)",
      }}
    >
      <SignUp
        appearance={{
          variables: {
            colorPrimary: "#D9A441",
            colorBackground: "#14181A",
            colorForeground: "#ECE7DC",
            colorMutedForeground: "#8B9290",
            colorInput: "rgba(255,255,255,0.04)",
            colorInputForeground: "#ECE7DC",
            fontFamily: "'Work Sans', sans-serif",
            borderRadius: "10px",
          },
          elements: {
            card: { backgroundColor: "#14181A" },
            socialButtonsBlockButton: {
              backgroundColor: "rgba(255,255,255,0.04)",
              borderColor: "rgba(255,255,255,0.14)",
              color: "#ECE7DC",
            },
            dividerLine: { backgroundColor: "rgba(255,255,255,0.1)" },
            dividerText: { color: "#8B9290" },
          },
        }}
        fallbackRedirectUrl="/"
        signInUrl="/sign-in"
      />
    </main>
  );
}