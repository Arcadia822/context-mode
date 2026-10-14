# v2 prompt drafts: server instructions + 7 tool descriptions

Status: DRAFT r2, 2026-10-14. These texts become `src/prompt/instructions.md` and `src/prompt/tools/<tool>.md`, which the build inlines into the bundle. Rules: TECH-SPEC §3.4 and ADR-0005. Lengths and lint results: TECH-SPEC §3.5 (they come from a script, not from this file).

The parameter names follow PRD §7. The `ctx_search` default scope follows README §8 and is still an open question (Q6 in the chat round).

Each text sits between an `id` marker and a ```text fence, so a script can extract it.

<!-- id: instructions -->
```text
context-mode keeps large command, file and web output out of the conversation: work runs in a sandbox, and only what your code prints comes back.

Search for and use these tools when output may be longer than about 20 lines, or when you need a few facts from something large: logs, test or build output, large JSON, long files, web pages, or many files at once.
- ctx_execute: run a command or code over the data and print only the answer.
- ctx_batch: several commands plus questions about their output, in one call.
- ctx_index and ctx_search: store docs, files or URLs once, then query them instead of reading them again. ctx_search also covers earlier sandbox output in this project.
- ctx_resume: a short summary of this session, after the conversation was compacted or resumed.

For small output of known size, such as git status, ls or a short file, and for editing files, use your normal tools: they are faster there.
```

<!-- id: ctx_execute -->
```text
Runs code in a sandboxed subprocess in the project directory and returns only what the code prints. Languages: shell, powershell, javascript, typescript, python, and other runtimes found on PATH. Use it when output may be long, for example tests, builds, logs, git history or API responses, and print just the lines or numbers you need. Set `file` to a local path to work on that file without reading it into the conversation; the code gets the path in the CTX_FILE environment variable. Set `intent` to a short phrase when output may be large: the matching sections come back and the full output is indexed for ctx_search. Stops after `timeoutMs` (default 120000) and kills the whole process tree.
```

<!-- id: ctx_batch -->
```text
Runs several shell commands, then answers several search queries over their combined output, in one call. Use it to collect facts from more than one command at once, for example test results plus recent commits, when you need specific answers rather than the full text. Returns the matching sections and a one-line footer.
```

<!-- id: ctx_index -->
```text
Stores content so it can be searched later: a local file or folder (nested .gitignore files are respected), raw text, or a URL, which is fetched and converted to Markdown. Use it for documentation or large files you will query more than once, then use ctx_search instead of reading the content again. Returns the source label and how many chunks were stored.
```

<!-- id: ctx_search -->
```text
Searches content stored with ctx_index and earlier sandbox output in this project. Pass several queries in one call. By default it searches the current worktree; set `scope` to `project` for all worktrees or `session` for this session only. Results from the current session rank first, and every hit names its source. When nothing matches, the reply states the scope and how many sources are indexed.
```

<!-- id: ctx_resume -->
```text
Returns a summary of up to 2 KB for this session: the last task and user request, files changed, open errors, decisions, and search terms for ctx_search. Use it after the conversation was compacted or resumed, before you repeat earlier work.
```

<!-- id: ctx_stats -->
```text
Reports how many bytes context-mode kept out of the conversation in this session and in this project, per agent, as a Markdown table. Show the table to the user as it is. Use it when the user asks what context-mode saved.
```

<!-- id: ctx_purge -->
```text
Deletes stored data: one session, one indexed source, or everything stored for this project. This cannot be undone. Use it only when the user asks to forget or reset data.
```

<!-- id: prompt_ctx-stats -->
```text
Call the ctx_stats tool and show its table to the user unchanged. Add one sentence below the table that names the largest saving.
```
