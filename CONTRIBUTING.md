# Contributing to Vamsapattika

Thank you for contributing to Vamsapattika! This guide will help you get started.

## 🚀 Getting Started

1. **Clone the repository** (if you haven't already)
   ```bash
   git clone <repository-url>
   cd vamsapattika
   ```

2. **Run the setup script**
   ```bash
   # macOS/Linux
   ./setup.sh
   
   # Windows
   setup.bat
   ```

3. **Read the documentation**
   - [Main README](README.md) - Complete setup guide
   - [Backend README](backend/README.md) - Django-specific docs
   - [Frontend README](frontend/README.md) - React-specific docs

## 📋 Development Workflow

### 1. Create a Feature Branch

Always create a new branch for your work:

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Branch naming conventions:
# feature/   - New features
# fix/       - Bug fixes
# refactor/  - Code refactoring
# docs/      - Documentation updates
# test/      - Test additions/updates
```

### 2. Make Your Changes

- Write clean, readable code
- Follow the code style guidelines (below)
- Test your changes thoroughly
- Write/update tests if applicable
- Update documentation if needed

### 3. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "Add: User profile photo upload feature"

# Commit message format:
# Add:      New feature
# Fix:      Bug fix
# Update:   Modify existing feature
# Refactor: Code restructuring
# Docs:     Documentation only
# Test:     Test additions/updates
# Style:    Code formatting/style changes
```

**Good commit messages:**
```
Add: Google OAuth login integration
Fix: Family tree export not including photos
Update: Subscription plan pricing
Refactor: Simplify person card component
Docs: Add API endpoint documentation
```

**Bad commit messages:**
```
fix bug
updated stuff
wip
asdf
```

### 4. Push and Create Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name

# Create PR on GitHub/GitLab
# - Add descriptive title
# - Fill out PR template
# - Link related issues
# - Request reviewers
```

## 💻 Code Style Guidelines

### Python (Backend)

Follow **PEP 8** style guide:

```python
# Good
def create_family_tree(user, tree_name):
    """Create a new family tree for the user."""
    tree = FamilyTree.objects.create(
        user=user,
        name=tree_name,
        family_data={}
    )
    return tree

# Bad
def CreateFamilyTree(user,tree_name):
    tree=FamilyTree.objects.create(user=user,name=tree_name,family_data={})
    return tree
```

**Key points:**
- Use snake_case for functions and variables
- Use PascalCase for classes
- 4 spaces for indentation (no tabs)
- Maximum line length: 88 characters (Black formatter)
- Add docstrings to all functions
- Type hints for function parameters

### JavaScript/React (Frontend)

Follow **Airbnb JavaScript Style Guide**:

```javascript
// Good
const FamilyTree = ({ treeId, onUpdate }) => {
  const [familyData, setFamilyData] = useState({});
  
  const handlePersonAdd = useCallback((personData) => {
    // Add person logic
  }, []);
  
  return (
    <div className="family-tree">
      {/* Tree content */}
    </div>
  );
};

// Bad
function FamilyTree(props) {
  var family_data = {}
  function HandlePersonAdd(person) {
    //add person logic
  }
  return <div class="family-tree">{/*Tree content*/}</div>
}
```

**Key points:**
- Use camelCase for functions and variables
- Use PascalCase for components
- Use functional components with hooks (no class components)
- 2 spaces for indentation
- Use `const` over `let`, never use `var`
- Use arrow functions for callbacks
- Destructure props in function parameters
- Use meaningful component and variable names

### CSS

```css
/* Good */
.family-tree {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.family-tree__person-card {
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: var(--card-bg);
}

/* Bad */
.familyTree {padding:10px;background:#fff}
.pc{border-radius:5px}
```

**Key points:**
- Use kebab-case for class names
- Use BEM-like naming for nested elements
- One selector per line
- Use CSS variables for colors and spacing
- Group related properties together
- Add comments for complex styles

## 🧪 Testing

### Backend Tests

```bash
cd backend
source venv/bin/activate
python manage.py test

# Run specific test
python manage.py test accounts.tests.test_views

# With coverage
coverage run --source='.' manage.py test
coverage report
```

### Frontend Tests

```bash
cd frontend
npm run test

# Run specific test
npm run test -- PersonCard.test.jsx

# With coverage
npm run test:coverage
```

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] Feature works on Chrome, Firefox, Safari
- [ ] Responsive design works on mobile
- [ ] No console errors or warnings
- [ ] API calls work correctly
- [ ] Loading states display properly
- [ ] Error states handled gracefully
- [ ] Backend validation works
- [ ] Authentication still works
- [ ] Previous features not broken

## 📝 Pull Request Guidelines

### PR Title Format

```
Add: Google OAuth login integration
Fix: Family tree export not working on Safari
Update: Subscription plan pricing UI
Refactor: Person card component
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Related Issue
Fixes #123

## Changes Made
- Added Google OAuth login button
- Updated AuthContext to handle Google tokens
- Added backend endpoint for Google authentication

## Testing
- [ ] Tested on Chrome/Firefox/Safari
- [ ] Tested responsive design
- [ ] No console errors
- [ ] Backend tests pass
- [ ] Frontend tests pass

## Screenshots
(If UI changes)

## Notes
Any additional information reviewers should know.
```

### Before Submitting PR

1. **Update your branch**
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/your-feature
   git merge main
   # Resolve any conflicts
   ```

2. **Run tests**
   ```bash
   # Backend
   cd backend && python manage.py test
   
   # Frontend
   cd frontend && npm run test
   ```

3. **Check code style**
   ```bash
   # Backend (Black formatter)
   cd backend
   pip install black
   black . --check
   
   # Frontend (ESLint)
   cd frontend
   npm run lint
   ```

4. **Test locally**
   - Start backend: `python manage.py runserver`
   - Start frontend: `npm run dev`
   - Test all affected features

## 🔍 Code Review Process

### As a Reviewer

- Be constructive and respectful
- Point out both issues and good practices
- Suggest improvements with examples
- Test the changes locally if possible
- Approve when everything looks good

### As a PR Author

- Respond to all comments
- Make requested changes or explain why not
- Mark conversations as resolved when done
- Re-request review after making changes
- Be open to feedback

## 🚫 Common Mistakes to Avoid

### Backend

❌ **Don't commit sensitive data**
```python
# Bad
API_KEY = "sk_live_abc123xyz"

# Good
API_KEY = os.getenv('API_KEY')
```

❌ **Don't use raw SQL**
```python
# Bad
cursor.execute("SELECT * FROM users WHERE id = %s", [user_id])

# Good
User.objects.get(id=user_id)
```

❌ **Don't forget validation**
```python
# Bad
user.age = request.data['age']

# Good
if 'age' in request.data and isinstance(request.data['age'], int):
    user.age = request.data['age']
```

### Frontend

❌ **Don't mutate state directly**
```javascript
// Bad
familyData[personId].name = newName;

// Good
setFamilyData(prev => ({
  ...prev,
  [personId]: { ...prev[personId], name: newName }
}));
```

❌ **Don't forget dependencies in useEffect**
```javascript
// Bad
useEffect(() => {
  loadTree(treeId);
}, []);

// Good
useEffect(() => {
  loadTree(treeId);
}, [treeId, loadTree]);
```

❌ **Don't forget error handling**
```javascript
// Bad
const data = await api.getData();

// Good
try {
  const data = await api.getData();
  setData(data);
} catch (error) {
  console.error('Failed to load data:', error);
  setError(error.message);
}
```

## 📚 Resources

### Documentation
- [Django Docs](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)

### Style Guides
- [PEP 8 - Python Style Guide](https://pep8.org/)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [React Best Practices](https://react.dev/learn/thinking-in-react)

### Tools
- [Black](https://black.readthedocs.io/) - Python formatter
- [ESLint](https://eslint.org/) - JavaScript linter
- [Prettier](https://prettier.io/) - Code formatter
- [Django Debug Toolbar](https://django-debug-toolbar.readthedocs.io/)
- [React DevTools](https://react.dev/learn/react-developer-tools)

## 💬 Communication

- Ask questions in team chat/Slack
- Tag relevant team members in PRs
- Update issues with progress
- Document decisions in code comments
- Write clear commit messages

## 🎯 Areas to Contribute

### High Priority
- [ ] Email verification system
- [ ] Password reset flow
- [ ] Advanced tree visualization
- [ ] Mobile app development
- [ ] Performance optimization

### Good First Issues
- [ ] UI/UX improvements
- [ ] Documentation updates
- [ ] Test coverage
- [ ] Bug fixes
- [ ] Translation improvements

### Long-term Goals
- [ ] GEDCOM import/export
- [ ] Collaborative editing
- [ ] AI-powered features
- [ ] Advanced analytics
- [ ] Mobile app (React Native)

## ❓ Questions?

- Check [README.md](README.md) first
- Search existing issues on GitHub
- Ask in team chat
- Create a new issue with `question` label

---

**Thank you for contributing to Vamsapattika!** 🙏
