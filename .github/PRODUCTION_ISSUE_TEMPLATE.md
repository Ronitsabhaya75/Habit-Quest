---
title: Production Deployment Failed
assignees: Ronitsabhaya75
labels: bug, critical, production
---

## :warning: Production Deployment Failed

A recent push to the `{{ env.GITHUB_REF_NAME }}` branch failed the pre-deployment checks.

### Details:

- **Branch**: `{{ env.GITHUB_REF_NAME }}`
- **Commit**: [{{ env.GITHUB_SHA }}]({{ env.GITHUB_SERVER_URL }}/{{ env.GITHUB_REPOSITORY }}/commit/{{ env.GITHUB_SHA }})
- **Workflow run**: [View run details]({{ env.GITHUB_SERVER_URL }}/{{ env.GITHUB_REPOSITORY }}/actions/runs/{{ env.GITHUB_RUN_ID }})
- **Failed on**: `{{ date | date('YYYY-MM-DD HH:mm:ss') }}`

### Possible causes:

1. Tests are failing
2. Linting issues
3. Build errors
4. API integration issues

### Next steps:

1. Check the [workflow run]({{ env.GITHUB_SERVER_URL }}/{{ env.GITHUB_REPOSITORY }}/actions/runs/{{ env.GITHUB_RUN_ID }}) for specific errors
2. Fix the issues in a new PR
3. Once resolved, merge to `{{ env.GITHUB_REF_NAME }}` to trigger a new deployment

**Important**: This is a critical issue blocking production deployment. Please prioritize accordingly. 