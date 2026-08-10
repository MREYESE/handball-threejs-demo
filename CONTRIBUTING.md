# Contributing

Create a focused branch and pull request for each change. Before opening a PR, run:

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run asset:audit
```

Use real Pointer Events for gameplay/browser proof. Keep runtime art procedural, retain domain and
presentation separation, and explain any skipped browser or hardware validation in the PR.
