# Contributing to EcoTrack 🌱

We're thrilled you want to help make EcoTrack even better! Please read this guide to understand how you can contribute to the project.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct (see [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)).

## 🛠️ Getting Started

1. **Fork the Repository**: Create a personal fork on GitHub.
2. **Clone Locally**: Clone your fork to your development machine:
   ```bash
   git clone https://github.com/YOUR-USERNAME/carbon-footprint.git
   cd carbon-footprint
   ```
3. **Set Up the Environment**:
   - Create a `.env` file inside `server/` using the instructions in [.env.example](.env.example).
4. **Install Dependencies**:
   - Install server dependencies:
     ```bash
     cd server && npm install
     ```
   - Install client dependencies:
     ```bash
     cd ../client && npm install
     ```

## 🧪 Testing Guidelines

Before submitting any code changes, ensure all tests compile and pass successfully:

* **Backend Tests**: Run `npm test` inside the `server/` directory. All SQLite/Postgres integration and calculator tests must pass.
* **Frontend Tests**: Run `npm test` inside the `client/` directory. All React layout and page mock tests must pass.

## 📥 Submitting Pull Requests

1. **Create a Branch**: Create a feature branch off of `main`:
   ```bash
   git checkout -b feature/your-awesome-feature
   ```
2. **Make Small Commits**: Keep your changes focused. Write clear, descriptive commit messages.
3. **Verify Builds**: Run `npm run build` in `client/` to verify Vite assets compile cleanly without TypeScript errors.
4. **Push and PR**: Push to your fork and submit a Pull Request to our main branch.
