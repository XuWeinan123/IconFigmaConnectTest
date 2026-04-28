# 从 Figma 到代码：自动化图标交付 / Automating Icon Delivery from Figma to Code

这个仓库的目的是为了测试一个 UX 工程工作流，即在 Figma 的 Icon Kit 中直接通过插件将 Icon 同步到开发项目中，从而大量减少设计师图标更新的成本。

The purpose of this repository is to test a UX engineering workflow: syncing icons from a Figma Icon Kit directly into a development project through a plugin, greatly reducing the cost for designers to update icons.

本次测试以 [开源图标](https://www.figma.com/community/file/903830135544202908)（仅 Regular 部分）为操作对象，将其导入到 iOS 项目中。

This test uses these [open-source icons](https://www.figma.com/community/file/903830135544202908) (Regular only) as the source assets and imports them into an iOS project.

## 1. 预处理开源图标 / Preprocess Open-Source Icons

> 目标是将原图层的名称 ArrowArcLeft 处理成 icon/arrow.arc.left，同时把图标还原成 ComponentNode。
>
> The goal is to convert the original layer name `ArrowArcLeft` into `icon/arrow.arc.left`, while also restoring each icon into a `ComponentNode`.

我先将 Regular 页中的所有 Instance 复制到了我自己的 Playground。

I first copied all instances from the Regular page into my own Playground.

然后我用了 Figma 插件，用 AI Coding 了一段脚本进行批量处理，Prompt 如下：

Then I used a Figma plugin and wrote a batch-processing script with AI Coding. The prompt was:

```text
批量处理选中的 InstanceNode，还原成 ComponentNode，同时处理名称，将 ArrowArcLeft 处理成 icon/arrow.arc.left，即添加 icon/ 前缀，并根据大写字母将单词拆开
```

当然这一步纯粹是个人习惯，想让图标命名更加清晰一些。

Of course, this step is purely a personal preference. I wanted the icon names to be clearer.

![Figma 图标页面截图 / Figma icon page screenshot](https://raw.githubusercontent.com/XuWeinan123/blogImage/main/img/image-20260428101429267.png)

## 2. 使用 icona 上传图标 / Upload Icons with icona

> 目的是通过 GitHub 接口将图标上传至特定仓库。
>
> The goal is to upload icons to a specific repository through the GitHub API.

我先创建了[一个空项目](https://github.com/XuWeinan123/IconFigmaConnectTest)用来测试。

I first created [an empty project](https://github.com/XuWeinan123/IconFigmaConnectTest) for testing.

本来是想写个插件使用 GitHub Token 将图标 `ComponentNode` 处理后 push 到仓库的，但是发现已经有开源插件支持这个工作了，就是 [icona](https://github.com/daangn/icona)。GitHub 上提供了开源插件代码下载，教程也比较完善。

Originally, I planned to write a plugin that would use a GitHub Token to process icon `ComponentNode`s and push them to the repository. Then I found that an open-source plugin already supports this workflow: [icona](https://github.com/daangn/icona). Its source code is available on GitHub, and the tutorial is also fairly complete.

总之，先按照它的教程来，填写 **Repository URL** 和 **Github API Key**，然后执行。

So I followed its tutorial first, filled in **Repository URL** and **Github API Key**, and ran it.

符合预期，它向我的 GitHub 仓库提交了一个 PR，生成了一个 `icons.json` 文件。

As expected, it submitted a PR to my GitHub repository and generated an `icons.json` file.

![GitHub Json 文件截图 / GitHub JSON file screenshot](https://raw.githubusercontent.com/XuWeinan123/blogImage/main/img/image-20260428101403181.png)

至此 Figma 到 GitHub 的链路是打通了。

At this point, the Figma-to-GitHub pipeline was connected.

## 3. 使用 GitHub Actions 处理 json 文件 / Process the JSON File with GitHub Actions

> 将 icons 处理成 iOS 项目可用的文件格式。
>
> Convert icons into a file format usable by an iOS project.

生成的 json 中包含了完整的 svg 信息，但这些信息还无法被 iOS 项目直接调用。iOS 可用的是 imageset 文件夹包裹的 SVG 图标。也就是目前需要一个自动化手段，在检测到 PR 之后：

The generated JSON contains complete SVG information, but this data cannot be used directly by an iOS project. What iOS can use is an SVG icon wrapped in an `.imageset` folder. So an automation step is needed after a PR is detected:

```text
自动同意 PR -> 编译 json 为多个 imageset 文件 -> 提交变更
Automatically approve PR -> compile JSON into multiple imageset files -> commit changes
```

这里使用的手段是 GitHub Actions。老实说我也是第一次接触这个工具，不过所幸在 AI 的帮助下，学习没有花费太多的时间。

The tool used here is GitHub Actions. To be honest, this was also my first time using it, but fortunately, with help from AI, it did not take too long to learn.

先解释 GitHub Actions 的本质吧，了解本质之后再整理 Prompt 丢给 AI 处理。

Let me first explain the essence of GitHub Actions. After understanding the basics, I organized the prompt and handed it to AI.

![GitHub Actions 说明截图 / GitHub Actions explanation screenshot](https://raw.githubusercontent.com/XuWeinan123/blogImage/main/img/image-20260428112842868.png)

GitHub Actions 的本质是 yaml 文件。我这个项目中还包含 js 脚本来批处理一些逻辑。前者简单来说就是一个配置文件，配置 Actions 的触发条件，声明所需要的权限，以及说明需要做的工作。而后者则是具体的脚本，用来将图标数据转换成 iOS 工程识别，也就是干具体的活，如何调用会在前者中说明。

GitHub Actions is essentially driven by YAML files. This project also includes JS scripts for batch-processing logic. Simply put, the YAML file is a configuration file: it defines the trigger conditions for Actions, declares the required permissions, and describes the work to be done. The JS script does the actual work: converting icon data into a format that an iOS project can recognize. The YAML file specifies how that script is called.

好了，接下来我用这个 prompt，让 AI 帮我执行创建 GitHub Actions 的任务。我用的工具是 Antigravity。

Next, I used the following prompt and asked AI to help me create the GitHub Actions workflow. The tool I used was Antigravity.

```markdown
我需要使用 Github Actions 创建一套自动化工作流。
当检测到来自指定账号（XuWeinan123）的 PR 需求时，自动通过。同时将 ./.icona/icons.json 转换成 iOS 项目可用的 xcassets 格式。
```

**然后是一个小插曲**。当我看到 AI 指定的 Plan 打算使用 GitHub Token 来实现通过 PR，设计师的直觉告诉我这太繁杂了——内部的 Actions 不应该还需要一个授权的 Key。咨询 AI 后发现的确有更简单的方法，需要去 GitHub Setting-Actions-General 中的 Workflow permissions 中，调整 permission 为 `Read and write permissions`，然后勾选下方的 `Allow GitHub Actions to create and approve pull requests`。前者赋予了工作流更高的权限，后者允许 GitHub Actions 同意请求。

**Then there was a small detour.** When I saw that AI's plan intended to use a GitHub Token to approve PRs, my designer instinct told me this was too complicated: internal Actions should not need another authorization key. After asking AI, I found there was indeed a simpler approach. In GitHub **Settings > Actions > General > Workflow permissions**, change the permission to `Read and write permissions`, then check `Allow GitHub Actions to create and approve pull requests`. The former gives the workflow higher permissions, and the latter allows GitHub Actions to approve requests.

我也将这个上下文信息返回 Antigravity：

I also gave this context back to Antigravity:

```markdown
我已经在 Github Setting 中打开了允许 Actions 直接合并 PR。是否直接在 YAML 中写明就可以。
```

Antigravity 确认调整后直接执行，创建了对应的两个文件。

After confirming the adjustment, Antigravity executed the task and created the two corresponding files.

试运行，自动通过 PR 了，但还是存在问题：**Approved 了 PR，但是没有自动 Merge**。那工作流就还不够极致，我希望实现的是 Figma 一键就可以更新仓库里的图标库。

In the trial run, the PR was approved automatically, but there was still one issue: **the PR was approved but not automatically merged**. That meant the workflow was not streamlined enough yet. What I wanted was a one-click flow from Figma to updating the icon library in the repository.

我学习编程是野路子，也没有和别人协作过项目，所以之前的确没想到 approve 之后还需要 merge。不过解决这个也简单，GitHub 的 Settings 中有一项 Allow auto-merge，开启后在 approve 后就自动完成了合并。

I learned programming in a self-taught way and had not really collaborated with others on projects before, so I had not realized that a PR still needed to be merged after approval. The fix was simple: GitHub Settings has an **Allow auto-merge** option. After enabling it, the PR can be merged automatically after approval.

## 4. 最终效果验收 / Final Verification

现在，完整走一遍流程。

Now, run through the complete flow.

1. 首先在 Figma 中创建 icon 集合，使用 icona 部署到 GitHub 仓库中。

   First, create an icon collection in Figma and deploy it to the GitHub repository with icona.

2. 刷新 GitHub 后，确实看到其收到了 PR。

   After refreshing GitHub, the repository did receive a PR.

3. GitHub Actions 也成功被触发。我的邮箱收到了三份连续的邮件：bot pushed 了一个 commit，bot approved 了一个 PR，branch 被 merged 到了主分支。

   GitHub Actions was also triggered successfully. My inbox received three consecutive emails: the bot pushed a commit, the bot approved a PR, and the branch was merged into the main branch.

![最终效果邮件截图 / Final verification email screenshot](https://raw.githubusercontent.com/XuWeinan123/blogImage/main/img/image-20260428133514374.png)

同时，查看生成的 `Assets.xcassets` 文件夹，内部确实按照 js 文件的规则生成了一堆复合条件的 `.imageset` 文件。如果是在真实项目中，在 js 中修改目标路径应该就可以满足生产需求了。

Meanwhile, checking the generated `Assets.xcassets` folder confirmed that many `.imageset` files were created according to the rules in the JS file. In a real project, changing the target path in the JS file should be enough to meet production needs.

## 总结 / Summary

以下内容由 AI 总结生成：

The following summary was generated by AI:

这套工作流通过 Figma 插件与 GitHub Actions 的深度协作，将图标从“静态图层”进化为“动态代码”，实现了从设计稿推送、自动审批合并到 Xcode 资产生成的全链路无感交付；它不仅彻底解放了设计师重复搬运素材的双手，更通过“设计即代码”的工程思维，为 UX 工程师探索工业化设计交付提供了一个极具参考价值的实战样本。

Through deep collaboration between a Figma plugin and GitHub Actions, this workflow evolves icons from “static layers” into “dynamic code.” It enables a nearly seamless end-to-end delivery pipeline from design push, automatic approval and merge, to Xcode asset generation. It not only frees designers from repetitive asset handoff work, but also uses the engineering mindset of “design as code” to provide a practical reference for UX engineers exploring industrialized design delivery.
