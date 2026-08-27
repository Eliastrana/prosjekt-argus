import Image from "next/image";

const AUTHORS: Record<string, { name: string; image: string; role: string }> = {
  Elias: {
    name: "Elias Trana",
    image: "/authors/elias.jpg",
    role: "Masterstudent, UiO",
  },
  Claude: {
    name: "Claude",
    image: "/authors/claude.webp",
    role: "Skrevet av AI",
  },
};

export function AuthorByline({ author }: { author?: string }) {
  if (!author) return null;

  const profile = AUTHORS[author] ?? { name: author, image: "", role: "" };

  return (
    <div className="mt-8 flex items-center gap-4">
      {profile.image ? (
        <Image
          src={profile.image}
          alt=""
          width={48}
          height={48}
          className="size-12 shrink-0 rounded-full object-cover ring-1 ring-foreground/10"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-card-2 text-lg font-semibold text-muted ring-1 ring-foreground/10"
        >
          {profile.name.charAt(0)}
        </span>
      )}

      <div className="min-w-0">
        <div className="text-sm font-semibold text-foreground">{profile.name}</div>
        {profile.role ? <div className="text-xs text-muted">{profile.role}</div> : null}
      </div>
    </div>
  );
}
