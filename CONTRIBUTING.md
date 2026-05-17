# Contributing to Supply Chain Protocol

Thank you for your interest in contributing! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Rust 1.75+
- Node.js 18+
- Docker & Docker Compose
- Git

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/PerLogistic247.git`
3. Add upstream remote: `git remote add upstream https://github.com/Perlogistics/PerLogistic247.git`
4. Create a feature branch: `git checkout -b feature/your-feature-name`
5. Follow the setup instructions in README.md

## 🏗️ Project Structure

```
├── backend/           # Rust API server
│   ├── src/
│   │   ├── handlers/  # API endpoint handlers
│   │   ├── services/  # Business logic
│   │   ├── models/    # Data structures
│   │   └── config.rs  # Configuration
├── contracts/         # Soroban smart contracts
├── frontend/          # Next.js application
└── docs/             # Documentation
```

## 📋 Development Workflow

### 1. Choose an Issue
- Look for issues labeled `good-first-issue` for beginners
- Check `help-wanted` for issues needing community help
- Comment on the issue to claim it

### 2. Development
- Write clean, well-documented code
- Follow Rust best practices and conventions
- Add tests for new functionality
- Update documentation as needed

### 3. Testing
```bash
# Backend tests
cd backend && cargo test

# Frontend tests
cd frontend && npm test

# Integration tests
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

### 4. Submit Changes
1. Commit your changes: `git commit -m "feat: add new feature"`
2. Push to your fork: `git push origin feature/your-feature-name`
3. Create a Pull Request

## 🎯 Backend Contribution Guidelines

### Code Style
- Use `cargo fmt` for formatting
- Use `cargo clippy` for linting
- Follow Rust naming conventions
- Add appropriate error handling

### API Development
- Follow RESTful conventions
- Add proper HTTP status codes
- Include request/response validation
- Add comprehensive error messages

### Database Changes
- Create migration scripts for schema changes
- Add proper indexes for performance
- Include foreign key constraints
- Write tests for new queries

### Performance Considerations
- Use async/await appropriately
- Implement connection pooling
- Add caching where beneficial
- Monitor query performance

## 🧪 Testing Guidelines

### Unit Tests
- Test business logic in isolation
- Mock external dependencies
- Achieve high code coverage (>80%)
- Test edge cases and error conditions

### Integration Tests
- Test API endpoints end-to-end
- Verify database interactions
- Test contract integrations
- Use test containers for consistency

### Performance Tests
- Benchmark critical paths
- Load test API endpoints
- Monitor memory usage
- Profile database queries

## 📝 Documentation

### Code Documentation
- Add doc comments to public functions
- Explain complex algorithms
- Include usage examples
- Document error conditions

### API Documentation
- Update OpenAPI specifications
- Include request/response examples
- Document authentication requirements
- Add error response documentation

## 🏷️ Issue Labels

- `good-first-issue`: Great for newcomers
- `help-wanted`: Community assistance needed
- `bug`: Something isn't working
- `enhancement`: New feature request
- `documentation`: Documentation improvements
- `performance`: Performance related
- `security`: Security concerns

## 🔄 Pull Request Process

### Before Submitting
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Changelog is updated (if applicable)
- [ ] Commit messages follow conventions

### Commit Message Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Assume good intentions

### Getting Help
- Join our Discord/Slack community
- Ask questions in GitHub Discussions
- Check existing issues and documentation
- Reach out to maintainers

## 🏆 Recognition

Contributors are recognized through:
- GitHub contributor statistics
- Release notes acknowledgments
- Community spotlights
- Contributor badges

## 📚 Resources

- [Rust Book](https://doc.rust-lang.org/book/)
- [Axum Documentation](https://docs.rs/axum/)
- [SQLx Documentation](https://docs.rs/sqlx/)
- [Soroban Documentation](https://soroban.stellar.org/)
- [Stellar SDK](https://github.com/stellar/js-stellar-sdk)

## 📞 Contact

- Maintainers: @perlogistics/core-team
- Email: contributors@perlogistics.com
- Discord: [Community Server]

Thank you for contributing to the Supply Chain Protocol! 🚢
