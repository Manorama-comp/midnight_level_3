git add package.json
git commit -m "chore: initialize project dependencies and workspaces"

git add README.md .env.example counter.compact.example
git commit -m "docs: add initial boilerplate and README"

git add boilerplate/scripts
git commit -m "build: add CLI generation scripts"

git add boilerplate/contract-cli
git commit -m "feat: scaffold contract CLI wrapper"

git add boilerplate/contract/package.json boilerplate/contract/tsconfig* boilerplate/contract/eslint* boilerplate/contract/.prettierrc
git commit -m "build: configure contract workspace"

git add boilerplate/contract/src/witnesses.ts boilerplate/contract/src/index.ts
git commit -m "feat: setup witness context for compact"

git add boilerplate/contract/src/voting.compact
git commit -m "feat: implement private voting circuit"

git add boilerplate/contract/src/voting.test.ts
git commit -m "test: add voting circuit test suite"

git add frontend/package.json frontend/vite.config.ts frontend/index.html frontend/tsconfig* frontend/eslint*
git commit -m "chore: scaffold React frontend"

git add frontend/src
git commit -m "feat: build premium voting UI with midnight integration"

git add .github/workflows/ci.yml
git commit -m "ci: configure automated testing workflow"

git add frontend/public
git commit -m "chore: add public assets"

git remote add origin https://github.com/Manorama-comp/midnight_level_3.git
git branch -M main
git push -u origin main
