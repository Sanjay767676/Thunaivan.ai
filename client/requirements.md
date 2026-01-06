## Packages
framer-motion | For complex page transitions and the 3D assistant animations
clsx | For conditional class merging
tailwind-merge | For merging tailwind classes safely

## Notes
- The app uses a session-based approach for RAG.
- The /api/analyze endpoint initializes the session context.
- The /api/chat endpoint relies on the previously analyzed content.
- Assistant 3D effect will be simulated using advanced CSS/SVG animations with Framer Motion for performance and reliability without heavy 3D assets.
