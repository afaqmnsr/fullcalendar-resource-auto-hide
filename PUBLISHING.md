# Publishing Guide for fullcalendar-resource-auto-hide

## Step 1: Final Testing Checklist

Before publishing, make sure you've tested:

- [ ] Plugin works with FullCalendar v6.x
- [ ] Resources hide/show correctly when navigating dates
- [ ] Always-visible resources work correctly
- [ ] Buffer days option works
- [ ] Debouncing prevents excessive updates
- [ ] Works with both single and multiple resources per event
- [ ] No console errors
- [ ] Works in React, Vue, and vanilla JS

## Step 2: Prepare for Publishing

### 2.1 Update package.json

Update these fields with your information:

```json
{
  "name": "fullcalendar-resource-auto-hide",
  "author": "Afaq Mansoor Khan <afaqmnsr0@gmail.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/afaqmnsr/fullcalendar-resource-auto-hide.git"
  },
  "homepage": "https://github.com/afaqmnsr/fullcalendar-resource-auto-hide#readme",
  "bugs": {
    "url": "https://github.com/afaqmnsr/fullcalendar-resource-auto-hide/issues"
  }
}
```

### 2.2 Build the Plugin

```bash
npm install
npm run build
```

Verify `dist/` folder contains:
- `index.cjs.js`
- `index.esm.js`
- `index.global.min.js`
- `index.d.ts`

### 2.3 Test Locally Before Publishing

```bash
# Test with npm link
npm link

# In another project
npm link fullcalendar-resource-auto-hide
```

## Step 3: Publish to npm

### 3.1 Create npm Account (if needed)

```bash
npm adduser
```

### 3.2 Login

```bash
npm login
```

### 3.3 Publish

```bash
# Dry run first (won't actually publish)
npm publish --dry-run

# If everything looks good, publish
npm publish
```

**Note:** For unscoped packages, just use `npm publish` (no `--access public` needed)

### 3.4 Version Management

For future updates:

```bash
# Patch version (1.0.0 -> 1.0.1)
npm version patch
npm publish

# Minor version (1.0.0 -> 1.1.0)
npm version minor
npm publish

# Major version (1.0.0 -> 2.0.0)
npm version major
npm publish
```

## Step 4: Create GitHub Repository

### 4.1 Initialize Git (if not already)

```bash
git init
git add .
git commit -m "Initial commit"
```

### 4.2 Create GitHub Repo

1. Go to https://github.com/new
2. Repository name: `fullcalendar-resource-auto-hide`
3. Description: "FullCalendar plugin to automatically hide resources without events in visible date range"
4. Public repository
5. Don't initialize with README (you already have one)
6. Create repository

### 4.3 Push to GitHub

```bash
git remote add origin https://github.com/afaqmnsr/fullcalendar-resource-auto-hide.git
git branch -M main
git push -u origin main
```

## Step 5: Promote Your Plugin

### 5.1 FullCalendar Community

**GitHub Discussions:**
- Go to https://github.com/fullcalendar/fullcalendar/discussions
- Create a post in "Show and Tell" or "Plugins" category
- Title: "New Plugin: Resource Auto-Hide"
- Include:
  - What it does
  - Why it's useful
  - Link to npm package
  - Link to GitHub repo
  - Demo/screenshot

**FullCalendar Discord:**
- Join their Discord server
- Post in appropriate channel about your plugin

### 5.2 Reddit

Post to relevant subreddits:
- r/javascript
- r/reactjs
- r/webdev
- r/vuejs

### 5.3 Stack Overflow

When answering FullCalendar questions, mention your plugin if relevant:
- "For auto-hiding resources, you might find this plugin useful: [link]"

### 5.4 Dev.to / Medium

Write a blog post:
- Title: "Building a FullCalendar Plugin: Auto-Hide Resources Without Events"
- Explain the problem
- Show how to use it
- Link to npm/GitHub

### 5.5 Social Media

Tweet about it:
```
Just published @fullcalendar plugin: resource-auto-hide

Automatically hides resources without events in visible date range. Perfect for large resource timelines!

npm: [link]
GitHub: [link]

#FullCalendar #JavaScript #WebDev
```

### 5.6 Add to FullCalendar Ecosystem

Check if FullCalendar has a plugin directory or wiki page where you can list your plugin.

## Step 6: Documentation Site (Optional but Recommended)

### Option A: GitHub Pages

1. Enable GitHub Pages in repo settings
2. Create `docs/` folder or use `gh-pages` branch
3. Host demo page there

### Option B: Netlify/Vercel

1. Connect your GitHub repo
2. Deploy automatically on push
3. Free hosting with custom domain option

## Step 7: Maintain and Update

### Regular Tasks:
- Respond to issues
- Review PRs
- Update dependencies
- Add new features based on feedback
- Keep documentation updated

### Getting Noticed:
- Star count helps with visibility
- Good documentation = more users
- Responding to issues = more trust
- Featured in blog posts/articles = more visibility

## Sample GitHub Issue Templates

Create `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior.

**Expected behavior**
What you expected to happen.

**FullCalendar version:**
**Plugin version:**
**Browser:**
```

Create `.github/ISSUE_TEMPLATE/feature_request.md`:

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Additional context**
Any other context.
```

## Quick Checklist Before Publishing

- [ ] Code is tested
- [ ] README is complete and accurate
- [ ] package.json metadata is correct
- [ ] LICENSE file exists
- [ ] .gitignore is set up
- [ ] .npmignore excludes unnecessary files
- [ ] Build succeeds without errors
- [ ] TypeScript definitions are correct
- [ ] Example HTML works
- [ ] No console errors in example

## After Publishing

1. **Monitor npm downloads**: Check `npm view fullcalendar-resource-auto-hide` for stats
2. **Watch GitHub**: Set up notifications for issues/PRs
3. **Update as needed**: Fix bugs, add features based on feedback
4. **Share**: Promote in relevant communities

Good luck!
