import Image from "next/image";

export function Logo() {
  return (
    <div className="flex items-center justify-center">
      <Image
        src="/images/logo.svg"
        alt="Cheffy Logo"
        width={80}
        height={80}
        priority
        className="h-12 w-auto drop-shadow-sm transition-transform hover:scale-105"
      />
    </div>
  );
}
