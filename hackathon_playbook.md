# Hackathon Playbook: Next.js + Gemini + Vercel Deployment

This playbook compiles our architectural patterns, command-line cheat sheets, and optimization checklists to secure a 90+ score in the main hackathon challenge.

---

## 📊 1. Evaluation Parameters & Score Strategy

Based on our warm-up run score (**73.93/100**), here is our checklist to maximize points:

| Evaluation Parameter | Target Strategy for Main Challenge |
| :--- | :--- |
| **Code Quality** (Currently 83) | Write clean, well-commented modular code, use TypeScript strictly, avoid hardcoding, and follow Next.js App Router best practices. |
| **Efficiency** (Currently 80) | Optimize API calls, leverage React's `useMemo` / `useCallback` where needed, avoid heavy packages, and ensure fast static generation. |
| **Accessibility** (Currently 45) | **Focus Area**: Use HTML5 semantic elements (`<main>`, `<header>`), dynamic ARIA attributes (`aria-label`), input labels with `htmlFor`, and keyboard navigation support. |
| **Security** (Currently 73) | **Focus Area**: Implement basic input validation, mask raw backend API error logs, ensure `.env.local` is never pushed to GitHub, and handle data safely. |
| **Testing** (Currently 13) | **Primary Focus**: Install Jest/Vitest and write 2-3 essential unit tests to check layout rendering and API handler mock returns. This will automatically bump our test coverage metric. |
| **Problem Statement Alignment** (Currently 92) | Perform logical problem decomposition, ensuring all MVP requirements are completely covered, and showing logical user flows. |

---

## 🛠️ 2. Step-by-Step Command Playbook

Use this exact sequence of commands to scaffold, build, commit, and deploy without hindrance.

### Phase 1: Scaffold Next.js App Router (Non-Interactive)
Always run options help first to align with system guidelines:
```bash
npx create-next-app@latest --help
```
Run the setup with a lowercase directory name to bypass NPM naming restrictions:
```bash
npx -y create-next-app@latest prompt-wars-app --ts --tailwind --eslint --app --import-alias "@/*" --use-npm --yes
```
*Note: If created in a subdirectory, move files to the workspace root:*
```powershell
Get-ChildItem -Path .\prompt-wars-app -Force | Move-Item -Destination .\ -Force
Remove-Item -Path .\prompt-wars-app -Force -Recurse
```

### Phase 2: Install Packages & Set Env
```bash
npm install @google/generative-ai lucide-react
```
Create `.env.local`:
```env
GEMINI_API_KEY=your_key_here
```

### Phase 3: Local Build & Git Flow
```bash
npm run build
git init
git add .
git commit -m "feat: initial commit"
git remote add origin <github-repo-url>
git branch -M main
git push -u origin main
```

### Phase 4: Non-Interactive Vercel CLI Deploy
Since we are now authenticated in the terminal:
```bash
npx vercel --prod --yes --name <project-name-lowercase> -e GEMINI_API_KEY=<your-key>
```

---

## 📝 3. Testing Implementation Blueprints

Use these quick templates to implement tests in 2 minutes:

### API Route Mock Test (`__tests__/api.test.ts`)
```typescript
import { NextRequest } from "next/server";
import { POST } from "../app/api/plan/route";

jest.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockImplementation(() => ({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => JSON.stringify({ success: true, meals: {} })
          }
        })
      }))
    }))
  };
});

describe("API Test", () => {
  it("should process route requests and return mock JSON", async () => {
    const req = new NextRequest("http://localhost/api/plan", {
      method: "POST",
      body: JSON.stringify({ vibe: "test", diet: "Balanced", budget: 200 })
    });
    const response = await POST(req);
    expect(response.status).toBe(200);
  });
});
```
