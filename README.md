# Figma Icon -> Xcode

这个仓库的目的是为了测试一个 UX 工程工作流，即在 Figma 的 Icon Kit 中直接通过插件将 Icon 同步到开发项目中，从而大量减少设计师图标更新的成本。

本次测试以 [开源图标](https://www.figma.com/community/file/903830135544202908) （仅 Regular 部分）为操作对象，将其导入到 Xcode 项目中。

## 1. 预处理开源图标

> 目标是将原图层的名称 ArrowArcLeft 处理成 icon/arrow.arc.left，同时把图标还原成 ComponentNode。

我现将 Regular 页中的所有 Instance 复制到了我自己的 Playground。

然后我用了 Figma 插件，用 AI Coding 了一段脚本进行批量处理，Prompt 如下：

```
批量处理选中的 InstanceNode，还原成 ComponentNode，同时处理名称，将 ArrowArcLeft 处理成 icon/arrow.arc.left，即添加 icon/ 前缀，并根据大写字母将单词拆开
```

当然这一步纯粹是个人习惯，想让图标命名更加清晰一些。

![Figma 图标页面截图](/Users/wally/Library/Application Support/typora-user-images/image-20260428101429267.png)

## 2. 使用 icona 上传图标

> 目的是通过 github 接口将图标上传至特定仓库

我先创建了[一个空项目](https://github.com/XuWeinan123/IconFigmaConnectTest)用来测试。

本来是想写个插件使用 Github Token 将图标 ComponetNode 处理后 push 到仓库的，但是发现已经有开源插件支持这个工作了，就是 [icona](https://github.com/daangn/icona)，github 上提供了开源插件代码下载，教程也比较完善。

总之，先按照它的教程来，填写 **Repository URL** 和 **Github API Key**，然后执行。

符合预期，它向我的 Github 仓库提交了一个 PR，生成了一个 icons.json 文件。

![Github Json 文件截图](/Users/wally/Library/Application Support/typora-user-images/image-20260428101403181.png)

至此 Figma 到 Github 的链路是打通了。

## 3. 使用 Github Actions 处理 json 文件。

> 将 icons 处理成 iOS 项目可用的文件格式

生成的 json 中包含了完整的 svg 信息，但这些信息还无法被 iOS 项目直接调用。iOS 可用的是 imageset 文件夹包裹的 SVG 图标。也就是目前需要一个自动化手段，在检测到 PR 之后：

`自动同意 PR -> 编译 json 为多个 imageset 文件 -> 提交变更`

这里使用的手段是 Github Actions，老实说我也是第一次接触这个工具，不过所幸在 AI 的帮助下，学习没有花费太多的时间。

先解释 Github Actions 的本质吧，了解本质之后再整理 Prompt 丢给 AI 处理。

![image-20260428112842868](/Users/wally/Library/Application Support/typora-user-images/image-20260428112842868.png)

Github Actions 的本质是 yaml 文件，我这个项目中还包含 js 脚本来批处理一些逻辑。前者简单来说就是一个配置文件，配置 Actions 的触发条件，声明所需要的权限，以及说明需要做的工作。而后者则是具体的脚本，用来将图标数据转换成 iOS 工程识别，也就是干具体的活，如何调用会在前者中说明。

好了，接下来我用这个 prompt，让 AI 帮我执行创建 Github Actions 的任务。我用的工具是 Antigravity。

```markdown
我需要使用 Github Actions 创建一套自动化工作流。
当检测到来自指定账号（XuWeinan123）的 PR 需求时，自动通过。同时将 ./.icona/icons.json 转换成 iOS 项目可用的 xcassets 格式。
```

**然后是一个小插曲**。当我看到 AI 指定的 Plan 打算使用 Github Token 来实现通过 PR，设计师的直觉告诉我这太繁杂了——内部的 Actions 不应该还需要一个授权的 Key。咨询 AI 后发现的确有更简单的方法，需要去 Github Setting-Actions-Genera 中的 Workflow permissions 中，调整 permission 为`Read and write permissions`，然后勾选下方的`Allow GitHub Actions to create and approve pull requests`，前者赋予了工作流更高的权限，后者允许 Github Actions 同意请求。

我也将这个上下文信息返回 Antigravity：

```markdown
我已经在 Github Setting 中打开了允许 Actions 直接合并 PR。是否直接在 YAML 中写明就可以。
```

Antigravity 确认调整后直接执行，创建了对应的两个文件。

试运行，自动通过 PR 了，但还是存在问题：**Approved 了 PR，但是没有自动 Merge**。那工作流就还不够极致，我希望实现的是 Figma 一键就可以更新仓库里的图标库。

我学习编程是野路子，也没有和别人协作过项目，所以之前的确没想到 approve 之后还需要 merge。不过解决这个也简单，Github 的 Settings 中有一项 Allow auto-merge，开启后在 approve 后就自动完成了合并。

## 4. 最终效果验收

现在，完整走一遍流程。

1. 首先在 Figma 中创建 icon 集合，使用 icona 部署到 GitHub 仓库中。

2. 刷新 GitHub 后，确实看到其收到了 PR。
3. Github Actions 也成功被触发。我的邮箱收到了三份连续的邮件：bot pushed 了一个 commit，bot approved 了一个 pr，branch 被 merged 到了主分支。

![image-20260428133514374](/Users/wally/Library/Application Support/typora-user-images/image-20260428133514374.png)

同时，查看生成的 Assets.xcassets 文件夹，内部确实按照 js 文件的规则生成了一堆复合条件的 .imageset 文件。如果是在真实项目中，在 js 中修改目标路径应该就可以满足生产需求了。

## 总结

以下内容由 AI 总结生成：

这套工作流通过 Figma 插件与 GitHub Actions 的深度协作，将图标从“静态图层”进化为“动态代码”，实现了从设计稿推送、自动审批合并到 Xcode 资产生成的全链路无感交付；它不仅彻底解放了设计师重复搬运素材的双边，更通过“设计即代码”的工程思维，为 UX 工程师探索工业化设计交付提供了一个极具参考价值的实战样本。