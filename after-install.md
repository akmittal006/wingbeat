# Wingbeat plugin installed

Wingbeat is installed as a Hermes plugin.

Try the deterministic local fallback from any project:

```bash
export CONVEX_URL=<your-convex-deployment-url>
hermes wingbeat run --project . --no-hermes
```

For provider-backed generation, omit `--no-hermes` only after reviewing your repository privacy requirements. Provider-backed runs may send repository-derived context to the model provider configured in Hermes. All runs persist to Convex; Wingbeat does not write local JSON fallback files.
