# Contributing to `open-madal`

Thank you for helping preserve and modernize traditional Nepali Madal percussion! Contributions from both **folk musicians** and **software developers** are welcome.

## 1. Contributing a Traditional *Taal* to `/corpus`

You can contribute a new regional rhythm in under 15 lines of plain text:

1. Create a new `.madal` file inside [`corpus/`](./corpus/).
2. Include standard metadata headers (`@title`, `@taal`, `@tempo`, `@meter`, `@region`, `@tali`, `@khali`).
3. Validate your file using the CLI:
   ```bash
   npm run cli -- validate corpus/your-taal.madal
   ```
4. Open a Pull Request describing the rhythm's cultural and regional context.

## 2. Developing on the Monorepo

```bash
# Install dependencies
npm install

# Build all packages (@open-madal/core, @open-madal/cli, @open-madal/web)
npm run build

# Run unit tests
npm test

# Start the web sequencer in development mode
npm run dev
```

## License

By contributing to `open-madal`, you agree that your contributions will be licensed under the [MIT License](./LICENSE).

