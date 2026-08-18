# Skrive blogginnlegg

Blogginnlegg ligger i `content/blog` og skrives som MDX. Vanlig Markdown kan brukes for overskrifter, lenker, lister, sitater, bilder, tabeller og kodeblokker.

## Tre bokser på rad

```mdx
<CardGrid>
  <InfoCard eyebrow="01" title="Første poeng">
    Kort forklaring av det første poenget.
  </InfoCard>

  <InfoCard eyebrow="02" title="Andre poeng">
    Kort forklaring av det andre poenget.
  </InfoCard>

  <InfoCard eyebrow="03" title="Tredje poeng">
    Kort forklaring av det tredje poenget.
  </InfoCard>
</CardGrid>
```

Boksene vises tre ved siden av hverandre på store skjermer og stables automatisk på mobil.

## Fremhevet merknad

```mdx
<Callout title="Viktig poeng">
  Denne teksten blir fremhevet uten å bryte leseflyten.
</Callout>
```

## Frontmatter

Alle innlegg starter med metadata:

```md
---
title: "Tittel på innlegget"
date: "2026-08-18"
excerpt: "En kort ingress som brukes på oversiktssiden."
tags: ["kartlegging", "modellering"]
---
```
