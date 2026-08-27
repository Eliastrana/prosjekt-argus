import Image from "next/image";

type Profile = { name: string; image: string; role: string };

/** One source of truth for who wrote what. `author` in a post's frontmatter
 *  keys into this; anything unrecognised falls back to an initial. */
export const AUTHORS: Record<string, Profile> = {
  Elias: {
    name: "Elias Trana",
    image: "/authors/elias.jpg",
    role: "Et ekte menneske",
  },
  Claude: {
    name: "Claude",
    image: "/authors/claude.webp",
    role: "Skrevet av AI",
  },
};

export function getAuthor(author?: string): Profile | null {
  if (!author) return null;
  return AUTHORS[author] ?? { name: author, image: "", role: "" };
}

export function AuthorByline({
  author,
  size = "md",
}: {
  author?: string;
  /** "sm" is for cards, where the byline sits beside a date and must not
   *  compete with the title. "md" is the post header. */
  size?: "sm" | "md";
}) {
  const profile = getAuthor(author);
  if (!profile) return null;

  const sm = size === "sm";
  const px = sm ? 100 : 200;

  return (
    <div className={sm ? "flex items-center gap-2" : "mt-8 flex items-center gap-4"}>
      {profile.image ? (
        <Image
          src={profile.image}
          alt=""
          width={px}
          height={px}
          className={[
            sm ? "size-7 rounded-xl" : "size-12 rounded-2xl",

            "shrink-0 object-cover",
          ].join(" ")}
        />
      ) : (
        <span
          aria-hidden="true"
          className={[
            sm ? "size-7 text-xs" : "size-12 text-lg",
            "flex shrink-0 items-center justify-center rounded-2xl bg-card-2 font-semibold text-muted",
          ].join(" ")}
        >
          {profile.name.charAt(0)}
        </span>
      )}

      {sm ? (
        <span className="truncate text-xs font-medium text-muted">{profile.name}</span>
      ) : (
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">{profile.name}</div>
          {profile.role ? <div className="text-xs text-muted">{profile.role}</div> : null}
        </div>
      )}
    </div>
  );
}
