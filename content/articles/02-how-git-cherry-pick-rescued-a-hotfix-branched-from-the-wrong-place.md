---
title: 'How git cherry-pick Rescued a Hotfix I Branched From the Wrong Place'
description: 'I cut a hotfix branch from develop instead of master, then production needed only that fix. How cherry-pick works, the commands that saved the release, and how to avoid the mistake.'
date: '2026-08-01'
tags: ['Git', 'Version Control']
category: 'Version Control'
difficulty: 'Intermediate'
tech: ['Git']
learn:
    - 'Why a hotfix branched from the wrong base cannot simply be merged, and what merging develop into master would actually ship.'
    - 'What cherry-pick does mechanically: it replays a patch onto HEAD and writes a brand new commit with a new SHA and no link to the original.'
    - 'The command forms worth knowing, including multiple commits in one call, ranges, -x for traceability, and --no-commit for squashing a pick.'
    - 'How to work through a cherry-pick conflict with --continue, --abort, and --skip without losing the sequence.'
    - 'What happens to duplicated commits when develop is finally merged into master, and when to reach for rebase, merge, or revert instead.'
---

I knew `git cherry-pick` existed for years before I ever needed it. It sat in the same mental drawer as `git bisect` and `git reflog`: commands I had read about, nodded at, and never reached for. Then one evening a fix that production needed urgently was sitting in the middle of a branch full of features that were not allowed to ship, and that drawer suddenly became the most useful thing in my toolbox.

What follows is what I broke, what I ran to get out of it, and what cherry-pick is actually doing when you run it. That last part matters more than the commands, because once you can picture the mechanism the intimidating bits stop being intimidating.

## A branch I cut without thinking

Our branching model is unremarkable, and probably looks like yours. `master` is production: whatever sits there is what users are running, and every merge into it is a release. `develop` is the integration branch, where feature branches are cut from, merged back into, and left to accumulate until a release is approved.

Hotfixes are the one exception. A hotfix is not part of the next release. It is something broken in production that has to be corrected now, without waiting for whatever else happens to be sitting in `develop`. So hotfix branches are cut from `master`, not from `develop`. That is the whole point of them.

That week I had two feature branches in flight and one urgent production bug. I cut the branch for the bug out of habit, and habit means from `develop`. I did not think about it, because I never think about it. Nine times out of ten I am starting a feature, and nine times out of ten `develop` is the right base.

The fix took three commits: the actual correction, a follow-up for an edge case a reviewer spotted, and a test. It got reviewed, approved, and merged. Over the same couple of days both feature branches were finished and merged too. By Thursday, `develop` had three merges on it and everything was green.

Nothing looked wrong, and that is the part worth dwelling on. There was no error, no warning, no failing check. A branch cut from the wrong base builds fine, tests fine, reviews fine, and merges fine. The mistake stays invisible right up to the moment you need the fix somewhere else.

## Thursday evening, and the fix still was not in production

The bug came up again, and someone asked the reasonable question: is that fixed yet?

It was fixed. It was just fixed on `develop`, and `develop` was not going anywhere for another week. Here is what the history actually looked like:

```reactflow
title: Where the fix sat while production still needed it
packets: off

scenario "Unreleased history"
> Everything after the release commit lives only on develop. The three commits production needs are buried in the middle of three features that are not allowed to ship.

release 2.4
> The tip of master, and the only thing users are actually running.

feature A [develop]
> Merged during the same couple of days, and not approved for release.

feature B [develop]
> The same.

fix: guard [develop] {allowed}
> The actual correction production is waiting for.

fix: edge case [develop] {allowed}
> A follow-up for a case a reviewer spotted.

test: guard [develop] {allowed}
> The test covering the fix. These three are the ones that have to move.

feature C [develop]
> Finished after the fix, and also unreleased.

release 2.4 --> feature A
> develop was cut from the release commit, so this is where the unreleased run begins.

feature A --> feature B
> Ordinary feature work, merged and waiting.

feature B --> fix: guard
> The hotfix branch was cut from develop out of habit, so its commits landed here.

fix: guard --> fix: edge case
> The follow-up, applied on top of the guard.

fix: edge case --> test: guard
> And the test, which is why order matters when these are replayed later.

test: guard --> feature C
> More feature work on top, sealing the fix in behind things that cannot ship.

mermaid:
    ---
    config:
        gitGraph:
            mainBranchName: 'master'
    ---
    gitGraph
        commit id: "release 2.4"
        branch develop
        checkout develop
        commit id: "feature A"
        commit id: "feature B"
        commit id: "fix: guard"
        commit id: "fix: edge case"
        commit id: "test: guard"
        commit id: "feature C"
```

`master` is that first commit. Everything after it is unreleased, and the three commits I needed are buried in the middle of it.

## Merging develop would have shipped three other features

The obvious move is to merge `develop` into `master`, and that was immediately off the table. Merging `develop` does not ship the hotfix, it ships the hotfix plus three features that had not been through release approval, plus a database migration scheduled for the following week. A one-line production fix would have turned into the largest release of the month, after everyone else had gone home.

The second option was to write the fix again by hand on a fresh branch off `master`. That works, and I have done it before. It is also an hour of duplicated effort that produces a second, slightly different version of the same fix, which then has to be reconciled with the first one forever.

Neither option was about the fix. Both were about the fix being in the wrong place. What I actually wanted was to say: take those three commits, just those three, and put them on `master`. That is precisely the sentence `git cherry-pick` exists to answer.

## Cherry-pick copies a change, it does not move a commit

There is no magic in it, and understanding the mechanism is what stops it from feeling risky.

A commit in Git is a snapshot, but it also implies a change: the difference between it and its parent. When you run `git cherry-pick <commit>`, Git does four things:

1. Compute the diff between that commit and its parent. This is the patch, the change the commit introduced.
2. Apply that patch to your current working tree, on top of wherever `HEAD` is right now.
3. If it applies cleanly, create a **new** commit recording the result, reusing the original author, date, and message.
4. Move `HEAD` forward to the new commit.

The critical word is **new**. Cherry-pick does not move a commit and it does not share one. It copies a change and records the result as a fresh commit with a fresh SHA, a different parent, and no stored relationship to the original whatsoever. After the pick, the same change exists in two places under two different identities:

```reactflow
title: The same change on two branches under two different SHAs
packets: off

scenario "After the pick"
> The hotfix branch was cut from the release commit, and the three changes were replayed onto it. Each replay is a brand new commit: same message, same diff, different SHA, different parent.

release 2.4
> Where both branches begin. The hotfix branch is cut from here, which is the whole point of the exercise.

feature A [develop]
> Still unreleased, and still going nowhere.

feature B [develop]
> The same.

fix: guard [develop] {allowed}
> The original commit, still sitting on develop where it was written.

fix: edge case [develop] {allowed}
> The original follow-up.

test: guard [develop] {allowed}
> The original test.

picked: guard [hotfix, new SHA] {secure}
> A new commit carrying the same change. Git stores no link back to the original, which is what -x exists to write into the message.

picked: edge case [hotfix, new SHA] {secure}
> The second replay, applied on top of the first so it lands on the state it expects.

picked: test [hotfix, new SHA] {secure}
> The third. This one conflicted, because the test file had been reorganised on develop between the fix and the test.

release 2.4 --> feature A
> develop carries on from the release commit as before. Nothing here is touched by the pick.

feature A --> feature B
> More unreleased work, unchanged by any of this.

feature B --> fix: guard
> The fix is still exactly where it was written, on the wrong branch.

fix: guard --> fix: edge case
> Its follow-up, still on develop.

fix: edge case --> test: guard
> And its test. Nothing on this row moves; the pick copies from it.

release 2.4 --> picked: guard {secure}
> The hotfix branch is cut from master this time, named explicitly, which is the five-second habit that would have prevented all of it.

picked: guard --> picked: edge case {secure}
> Replayed in the order they were authored, oldest first.

picked: edge case --> picked: test {secure}
> And the test last, so each patch lands on the state the next one expects.

fix: guard --> picked: guard (cherry-picked) {secure}
> Not a parent link. This is the copy: the diff of the commit on the left, replayed onto the branch on the right as a new commit.

fix: edge case --> picked: edge case (cherry-picked) {secure}
> The same relationship again. Git itself records none of these dotted links.

test: guard --> picked: test (cherry-picked) {secure}
> Which is exactly why the two histories look unrelated six months later.

mermaid:
    ---
    config:
        gitGraph:
            mainBranchName: 'master'
    ---
    gitGraph
        commit id: "release 2.4"
        branch develop
        checkout develop
        commit id: "feature A"
        commit id: "feature B"
        commit id: "fix: guard"
        commit id: "fix: edge case"
        commit id: "test: guard"
        checkout master
        branch hotfix/production-guard
        checkout hotfix/production-guard
        cherry-pick id: "fix: guard"
        cherry-pick id: "fix: edge case"
        cherry-pick id: "test: guard"
```

The commits on the hotfix branch carry the same message and the same change as the ones on `develop`, but they are different commits. Git considers them unrelated.

> **Note:** Because the patch is computed against the original commit's parent and applied somewhere else entirely, cherry-pick can conflict even when the original commit merged without a single problem. The change was written against one version of the file and is being replayed onto another. A conflict is not a sign that something went wrong; it is the expected cost of moving a change across a gap in history.

That is also why cherry-pick is safe in the way that matters: it never rewrites anything. It only ever adds a commit on top of where you already are. If you do not like the result, you throw the branch away and nothing else was touched.

## Fifteen minutes of actual commands

Here is the sequence I ran, cleaned up slightly.

First, find the commits. I needed their SHAs, and I needed to know their order:

```bash
git log --oneline master..develop
```

That range means "commits on `develop` that are not on `master`", which is exactly the unreleased set. It printed the six commits, newest first. I copied out the three SHAs belonging to the fix.

Then cut a branch from the right base this time, being explicit about it:

```bash
git switch -c hotfix/production-guard master
```

Naming `master` at the end is the whole lesson of this article in one argument. Without it, Git branches from wherever `HEAD` happens to be, which is how I got here in the first place.

Then replay the three commits, oldest first:

```bash
git cherry-pick 4a1c9f2 8e73b0d c05f61a
```

Order matters. Cherry-pick applies each patch in the sequence you list, so listing them in the order they were originally authored means each one lands on the state the next one expects. Listing them backwards means asking Git to apply the edge-case fix to code that has not been guarded yet, which either conflicts or, worse, applies cleanly and produces something subtly wrong. `git log --oneline` prints newest first, so read it bottom-up when you build the command.

The first two applied cleanly. The third conflicted, because the test file had been reorganised on `develop` between the fix and the test. I resolved it, continued, and then confirmed I had what I thought I had:

```bash
git log --oneline master..hotfix/production-guard
```

Three commits, the right three, on top of `master`. From there it was an ordinary pull request into `master`, the normal review, a tag, and a deploy.

The last step is the one people forget. Once the hotfix is on `master`, merge `master` back into `develop`:

```bash
git switch develop
git merge master
```

`develop` already contains the change, so this does not alter the code. What it does is make `master` an ancestor of `develop` again, so the next release merge is a clean fast-forward-shaped operation instead of two branches arguing about history they both already have.

The whole thing took about fifteen minutes, most of it the conflict. Rewriting the fix by hand would have taken the rest of the evening and left a mess behind.

## The flags I keep coming back to

Cherry-pick has more surface than the single-SHA form most people use. These are the ones I actually reach for:

| Form                              | What it does                                                       |
| --------------------------------- | ------------------------------------------------------------------ |
| `git cherry-pick <sha>`           | Replay one commit onto `HEAD`.                                     |
| `git cherry-pick <a> <b> <c>`     | Replay several commits in the order listed, oldest first.          |
| `git cherry-pick <branch>`        | Replay the tip commit of that branch. Handy shorthand.             |
| `git cherry-pick <a>^..<b>`       | Replay an inclusive range, from `<a>` through `<b>`.               |
| `git cherry-pick <a>..<b>`        | Replay `<a>` **exclusive** through `<b>`. Skips `<a>` itself.      |
| `git cherry-pick -x <sha>`        | Same, but append "(cherry picked from commit ...)" to the message. |
| `git cherry-pick -n <sha>`        | Apply and stage the change without committing. Also `--no-commit`. |
| `git cherry-pick -e <sha>`        | Open an editor to change the commit message before recording it.   |
| `git cherry-pick --signoff <sha>` | Add a `Signed-off-by` trailer for the person doing the pick.       |

> **Warning:** The difference between `<a>..<b>` and `<a>^..<b>` catches everyone at least once. Git ranges are exclusive at the start, so `A..B` means "after A, up to and including B", and it silently leaves out A. If you want A included, use `A^..B`, which starts from A's parent. Check the result with `git log --oneline` before assuming the range did what you meant.

Two of those deserve a note on why they matter rather than what they do.

`-x` is the closest thing cherry-pick has to a paper trail. Git stores no link between the original commit and the copy, so six months later nothing in the history explains why the same change appears twice. `-x` writes that link into the commit message as plain text. I now treat it as the default for anything crossing a release boundary.

`-n` is how you turn several commits into one. Cherry-pick each with `-n` so the changes accumulate in the index without being committed, then make a single commit at the end:

```bash
git cherry-pick -n 4a1c9f2 8e73b0d c05f61a
git commit -m 'fix:[OPS-482] guard against missing provider config'
```

Useful when the original commits include a "fix review comment" and an "oops typo" that nobody on `master` needs to read about. I kept my three commits separate so the two histories stayed easy to compare, but for a noisy branch squashing is the tidier choice.

## My third commit conflicted, and that was normal

A cherry-pick conflict looks alarming the first time because the repository is left paused mid-sequence. It is not dangerous, and the way out is always the same three moves.

Git tells you where it stopped:

```bash
git status
```

The output names the conflicted files and reminds you of your options. Resolve the files the same way you would resolve any merge conflict, then stage them:

```bash
git add src/services/provider.ts
```

Then tell Git to finish the commit it was in the middle of and carry on with the rest of the sequence:

```bash
git cherry-pick --continue
```

Three flags handle everything else:

- **`--continue`** records the resolved commit and proceeds to the next commit in the list. This is the normal path.
- **`--abort`** unwinds the entire sequence, including commits that already applied cleanly, and puts the branch back exactly where it was before you started. This is the panic button, and it is genuinely safe.
- **`--skip`** drops the commit that is currently conflicting and moves on to the next one. Reach for this when the conflict turns out to be because the change is already present, so there is nothing left to apply.

> **Note:** If Git stops and says "the previous cherry-pick is now empty", it usually means the change is already in the branch, most likely because someone picked it before you. `git cherry-pick --skip` is the right answer. Forcing an empty commit through with `--allow-empty` is almost never what you want on a shared branch.

One habit that pays for itself: if the same pick conflicts repeatedly, turn on `git config --global rerere.enabled true`. Git will remember how you resolved a given conflict and replay your resolution automatically the next time it sees it. Picking the same commits across three release branches is exactly the situation it was built for.

## Living with the same change under two SHAs

Cherry-picking leaves you with the same change in two places under two SHAs, and the obvious worry is what happens next week when `develop` is finally merged into `master`. Does the fix get applied twice? Does every merge conflict from now on?

In practice, no, because Git's merge is content-based rather than identity-based. A three-way merge compares both sides against their common ancestor and looks at what actually changed. If a region of a file is already exactly what `develop` wants it to be, there is nothing to apply and nothing to argue about. The change being present under a different SHA does not bother it.

It gets uncomfortable only when the two copies stop being identical: someone amends the fix on `develop`, or you adjust the picked version while resolving conflicts on `master`. Then the release merge surfaces a real conflict, which is correct and useful but harder to reason about than usual, because the history gives you no hint that the two commits are related.

Which is the practical argument for two habits:

- **Use `-x` when picking between shared branches.** It puts the original SHA in the message, so whoever resolves that future conflict can immediately see where the change came from and diff the two versions.
- **Merge `master` back into `develop` as soon as the hotfix ships.** Reconciling the two branches while the change is still fresh in your head costs nothing. Doing it a week later, during a release, when the conflict is a surprise, costs a great deal more.

## When cherry-pick is the wrong tool

Cherry-pick is one of four commands that all move changes around, and choosing wrong is how people end up fighting Git.

| Tool          | What it does to history                                                        | Reach for it when                                                                              | Avoid it when                                                                                             |
| ------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `cherry-pick` | Copies specific commits as new commits on top of `HEAD`. Nothing is rewritten. | You need one or a few identified commits on another branch, and not the rest of that branch.   | You want the whole branch. That is a merge, and cherry-picking it commit by commit is just a worse merge. |
| `rebase`      | Replays your commits onto a new base and rewrites their SHAs.                  | You are updating your own unpushed branch onto a newer base, or tidying commits before review. | The branch is shared. Rewriting SHAs other people have pulled creates work for everyone.                  |
| `merge`       | Joins two histories with a merge commit and preserves both.                    | You want everything from the other branch, and you want the relationship recorded.             | You only want part of it, or the other branch carries work that is not allowed to ship yet.               |
| `revert`      | Creates a new commit that undoes a previous one.                               | A commit that already shipped needs to be backed out without erasing the record.               | The commit never left your machine. Just amend or reset.                                                  |

The rule of thumb I use now: cherry-pick is for a small number of specific commits crossing a boundary between branches that are meant to stay separate. If I find myself picking ten commits, or picking commits every week between the same two branches, the problem is not that I need a better cherry-pick command. It is that the branch topology is wrong.

Cherry-pick is a rescue tool, not a workflow. Used occasionally it is a lifesaver. Used routinely it is a symptom.

## The five-second habit that would have prevented all of it

What actually fixed this was not a command. It was a habit that costs five seconds.

- **Always name the base when creating a branch.** `git switch -c hotfix/x master` instead of bare `git switch -c hotfix/x`. Typing the base makes you think about the base, which is the entire failure mode in one word.
- **Verify the base before you start work, not after.** `git merge-base --is-ancestor origin/master HEAD` exits `0` when your branch really is built on `master`. It costs nothing and catches the mistake while it is still free to fix.
- **Make hotfix branches look different.** A `hotfix/` prefix means a reviewer glancing at the pull request has a reason to check the base branch. Naming conventions are only worth having if they trigger a check.
- **Check the base branch during review, not just the diff.** GitHub shows it right at the top of every pull request, and nobody reads it. On a hotfix, it is the single most important field on the page.
- **Keep hotfixes small.** The reason my evening ended well is that the fix was three tidy commits touching two files. A sprawling hotfix tangled up with refactoring would not have picked cleanly, and I would have been rewriting it by hand after all. Cherry-pickability is a real design property of a change.

## What that evening actually taught me

Cherry-pick did not fix my mistake. The commits were still in the wrong place, the two branches still ended up holding the same change twice, and I still had to reconcile them afterwards. What it did was make the mistake cheap: fifteen minutes and a conflict, instead of a lost evening of duplicated work or a release nobody had approved.

That is worth being clear about, because "I know cherry-pick" can quietly become a reason not to care where branches come from. The right base is still the right answer. Cherry-pick is what you use when you did not choose it.

The command stopped feeling risky the moment I understood there is nothing clever inside it. It takes the diff a commit introduced, applies that diff where you are standing, and writes a new commit. Once you can picture that, the conflicts stop being scary, the duplicate SHAs stop being mysterious, and `--abort` stops feeling like a gamble. It is a copy operation with a good name.

I had known that command existed for years. It took one evening of genuinely needing it to actually learn it, which is, I suspect, how most of the tools in that drawer eventually get used.
