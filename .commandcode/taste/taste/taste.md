# Taste
- User writes in Vietnamese — respond in Vietnamese. Confidence: 0.95
- For large multi-part updates (e.g., completing a simulated command set), prioritize the most common and useful items first, then handle edge cases. Confidence: 0.8
- For ongoing development, appreciates reassessing the current state and receiving prioritized, actionable next-step recommendations when requested, rather than continuing implementation without pausing. Confidence: 0.8
- Once the user explicitly approves a plan and asks to proceed, continue with implementation and verification rather than asking for another confirmation. Confidence: 0.84
- Values accuracy over approximation: simulated terminal commands should match real CentOS/bash semantics (POSIX `wc -l` newline counting, single quotes never expand variables, quote-aware pipeline splitting, wildcard expansion), checked against what the curriculum (labs/challenges/lessons) actually exercises. Confidence: 0.85
- Wants `man` and `help` documentation to cover every available command comprehensively and accurately reflect its implemented behavior and supported options. Confidence: 0.9
- Dev machine is Windows — Unix tools like `wc` are not available in the shell; use PowerShell equivalents (Get-ChildItem, etc.). Confidence: 0.95
- Main project: LabEx (D:\Work_Dev\Labex) — a Linux-learning web app whose CentOS 9 VM is simulated in TypeScript (src/services/centosKernel.ts engine + src/services/vfs.ts); src/services/labsData.ts, challengesData.ts and src/data/lessons JSON define which commands matter. Confidence: 0.9
