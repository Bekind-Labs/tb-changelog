export const githubFormatExpected = {
  empty: `> [!NOTE]
> 📦 0 commits included, ✅ 0 stories delivered,
> 🚨 0 stories need attention, 🚧 0 stories not finished, 🛠️ 0 chores included

## ✅ Accepted Stories (0)
No stories.

<br />

## 🚨 Needs Attention (0)
No stories.

<br />

## 🚧 Not Finished Stories (0)
No stories.

<br />

## 🛠️ Chores (0)
No stories.

<br />

## 🔍 Non-story Commits (0)
No commits.`,

  full: `> [!NOTE]
> 📦 8 commits included, ✅ 2 stories delivered,
> 🚨 1 stories need attention, 🚧 1 stories not finished, 🛠️ 2 chores included

## ✅ Accepted Stories (2)
#### 🧩 [Feature story 1](https://trackerboot.com/projects/90001111/stories/111)
- Feature commit 1 aaa111
- Feature commit 2 aaa222
#### 🎨 [Design story 1](https://trackerboot.com/projects/90001111/stories/222)
- Design commit 1 bbb111

<br />

## 🚨 Needs Attention (1)
> [!WARNING]
> These stories show **mismatches**: finish commits and stort status do not align.  
> Please review and resolve before release.
#### 🎨 [Design story 2](https://trackerboot.com/projects/90001111/stories/333)
- Design commit 2 ccc111

<br />

## 🚧 Not Finished Stories (1)
> [!CAUTION]
> These stories are **not completed**: no finish commit and not accepted.  
> Please confirm whether they can be released as-is.
#### 🦋 [Bug story 1](https://trackerboot.com/projects/90001111/stories/444)
- Bug commit 1 ddd111

<br />

## 🛠️ Chores (2)
#### [Chore story 1](https://trackerboot.com/projects/90001111/stories/555)
- Chore commit eee111
#### [Chore story 2](https://trackerboot.com/projects/90001111/stories/666) (Not finished)
- Chore commit fff111

<br />

## 🔍 Non-story Commits (1)
- Non-story commit ggg111`,
};
