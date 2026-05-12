# Photos & Media

Drop image files here, then reference them in `src/data/channels.ts`.

## Where things go

```
public/photos/
├── lenses/   ← photography (Night → CH. 02)
├── garage/   ← motorcycle (Night → CH. 03)
└── about/    ← portraits / headshots (Day side)
```

## Adding a photo

1. Drop the file into the right subfolder, e.g.:
   ```
   public/photos/lenses/2024-bayarea-roof.jpg
   ```
2. Open `src/data/channels.ts` and add an entry to the matching channel's `photos` array:
   ```ts
   photos: [
     { src: '/photos/lenses/2024-bayarea-roof.jpg', alt: 'rooftop golden hour' },
   ],
   ```
3. `git push` → click **Pull and redeploy** in Portainer.

## Image rules of thumb

- **Size**: keep under 500 KB per image. Use WebP if you can (smaller, same quality).
  Convert quickly with `cwebp -q 80 input.jpg -o output.webp` or any online tool.
- **Dimensions**: 1600px on the long edge is plenty for the layouts we have.
- **Naming**: lowercase, dashes-not-spaces — `motorcycle-canyon-2025.jpg`, not
  `IMG_1234.JPG`.

## Day-side photos

For headshots / Day-side portraits (when you have one you like), drop into
`public/photos/about/` and we'll wire them into the wordmark area or as a
dedicated hero block.
