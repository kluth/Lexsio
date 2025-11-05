# Workflow Optimization Migration Guide

This guide helps you migrate from the current workflows to the new optimized workflows.

## 🎯 Migration Steps

### Option 1: Gradual Migration (Recommended)

Keep both workflows running side-by-side for a few days to ensure the new workflows work correctly.

1. **Week 1**: Deploy optimized workflows alongside existing ones
   ```bash
   # Both ci-cd.yml and ci-optimized.yml will run
   # Compare performance and results
   ```

2. **Week 2**: Monitor and tune
   - Check cache hit rates
   - Verify all tests pass
   - Compare run times
   - Adjust if needed

3. **Week 3**: Switch over
   ```bash
   # Rename or remove old workflows
   mv .github/workflows/ci-cd.yml .github/workflows/ci-cd.yml.backup
   mv .github/workflows/test.yml .github/workflows/test.yml.backup
   mv .github/workflows/ci-optimized.yml .github/workflows/ci-cd.yml
   ```

### Option 2: Direct Migration

For immediate benefits, directly replace existing workflows:

```bash
# Backup existing workflows
mkdir -p .github/workflows-backup
cp .github/workflows/*.yml .github/workflows-backup/

# Remove old workflows
rm .github/workflows/ci-cd.yml
rm .github/workflows/test.yml

# Rename optimized workflow
mv .github/workflows/ci-optimized.yml .github/workflows/ci-cd.yml
```

## 📋 Checklist

Before migrating, ensure you have:

- [ ] Reviewed the new workflow structure
- [ ] Updated any branch protection rules
- [ ] Configured required status checks
- [ ] Set up repository secrets (if needed)
- [ ] Updated documentation referencing workflows
- [ ] Notified team members of changes

## ⚙️ Configuration Required

### 1. Update Branch Protection Rules

Go to Repository Settings → Branches → Branch protection rules

Update required status checks to match new job names:
- ✅ `Quick Checks (Lint)`
- ✅ `Unit Tests (Node 20.x)`
- ✅ `Unit Tests (Node 22.x)`
- ✅ `Build Application`
- ✅ `E2E Tests (Chromium)`

### 2. Repository Secrets

Verify these secrets exist (if using optional features):
- `CODECOV_TOKEN` - For Codecov coverage uploads
- `GITHUB_TOKEN` - Auto-provided by GitHub

### 3. Enable GitHub Pages

Ensure GitHub Pages is enabled:
1. Go to Settings → Pages
2. Source: GitHub Actions
3. Save

### 4. Configure Auto-Assign (Optional)

Edit `.github/auto-assign.yml`:
```yaml
reviewers:
  - your-github-username  # Replace with actual username
```

## 🔄 Rollback Plan

If issues arise, quickly rollback:

```bash
# Restore backups
cp .github/workflows-backup/*.yml .github/workflows/

# Remove new workflows
rm .github/workflows/ci-optimized.yml
rm .github/workflows/pr-checks.yml
rm .github/workflows/dependency-updates.yml

# Commit and push
git add .github/workflows/
git commit -m "rollback: Restore previous workflows"
git push
```

## 🆚 Key Differences

### Workflow Structure

#### Old Structure
```
test.yml: Runs on all branches
├─ Unit tests (Node 20, 22)
├─ E2E tests
└─ Coverage reports

ci-cd.yml: Runs on main/PR
├─ Lint
├─ Unit tests
├─ Build
├─ E2E tests
└─ Deploy
```

#### New Structure
```
ci-cd.yml: Unified optimized workflow
├─ Quick Checks (parallel)
├─ Unit Tests (parallel, matrix)
├─ Build (parallel, cached)
├─ E2E Tests (cached browsers)
└─ Deploy (conditional)

pr-checks.yml: PR enhancements
├─ Auto-labeling
├─ Size labels
├─ Performance checks
└─ Security scans

dependency-updates.yml: Automated maintenance
├─ Weekly dependency updates
└─ Security audits
```

### Job Names Changed

| Old Name | New Name |
|----------|----------|
| `test` | `Unit Tests (Node XX.x)` |
| `build-and-test` | Split into `Build` and `Unit Tests` |
| `e2e-tests` | `E2E Tests (Chromium)` |
| `deploy` | `Deploy to GitHub Pages` |

### New Features Added

1. **Playwright Browser Caching** - 2-3 min savings per run
2. **Parallel Job Execution** - 50% faster workflows
3. **Angular Build Caching** - 20-40 sec savings
4. **Concurrency Control** - Auto-cancel outdated runs
5. **Bundle Size Reporting** - Track app size changes
6. **Auto PR Labeling** - Better organization
7. **Automated Dependency Updates** - Weekly PR for updates
8. **Performance Monitoring** - Lighthouse CI scores
9. **Enhanced Summaries** - Better visibility

## 🔧 Troubleshooting

### Cache Not Working

**Problem**: Cache shows as "miss" every time

**Solution**:
```yaml
# Check cache key
- name: Debug cache
  run: |
    npm list @playwright/test --depth=0 --json
```

### Jobs Not Running in Parallel

**Problem**: Jobs still run sequentially

**Solution**:
- Remove `needs:` dependencies that aren't required
- Check workflow concurrency settings

### Branch Protection Failing

**Problem**: Required checks not found

**Solution**:
Update branch protection rules with new job names:
```
Settings → Branches → Edit rule → Require status checks
```

### Artifacts Not Uploading

**Problem**: Artifacts missing or corrupted

**Solution**:
```yaml
# Ensure correct path
- uses: actions/upload-artifact@v4
  with:
    path: dist/lixso-game/browser  # Exact path
    if-no-files-found: error       # Fail if missing
```

## 📊 Expected Improvements

### Performance Gains
```
Before: ~15-20 minutes
After:  ~6-8 minutes
Improvement: 60% faster
```

### Cache Hit Rates
- NPM cache: 95%+ hit rate
- Playwright browsers: 90%+ hit rate
- Angular build: 80%+ hit rate

### Developer Experience
- ✅ Faster feedback (6 min vs 15 min)
- ✅ Better PR insights (coverage, size, perf)
- ✅ Automatic labeling
- ✅ Security scanning
- ✅ Clear workflow summaries

## 🎓 Learning Resources

- [GitHub Actions Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Caching Dependencies](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [Workflow Optimization](https://docs.github.com/en/actions/using-workflows/about-workflows#about-workflows)

## 💬 Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review workflow logs in Actions tab
3. Check `.github/WORKFLOW_OPTIMIZATIONS.md` for details
4. Open an issue with:
   - Workflow run link
   - Error messages
   - Steps to reproduce

---

**Questions?** Check the workflow optimization documentation or reach out to the team!
