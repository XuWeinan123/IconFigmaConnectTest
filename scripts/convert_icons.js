const fs = require('fs');
const path = require('path');
const JSON_PATH = './.icona/icons.json';
// 注意：请根据当前 iOS 项目的实际目录结构调整这里的 Assets 路径
const ASSETS_PATH = './MyProject/Assets.xcassets/Icons'; 

if (!fs.existsSync(JSON_PATH)) {
    console.error('找不到 icons.json');
    process.exit(1);
}
const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
if (!fs.existsSync(ASSETS_PATH)) fs.mkdirSync(ASSETS_PATH, { recursive: true });

Object.entries(data).forEach(([name, iconData]) => {
    const svgContent = iconData.svg;
    if (!svgContent) return;

    const folderName = `${name}.imageset`;
    const folderPath = path.join(ASSETS_PATH, folderName);
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

    // 对于带有路径的名字（如 icon/name），在 Imageset 内部的文件名使用最后一部分
    const fileName = name.split('/').pop();
    fs.writeFileSync(path.join(folderPath, `${fileName}.svg`), svgContent);

    const contentsJson = {
        "images": [{"idiom": "universal", "filename": `${fileName}.svg`, "appearances": [{"appearance": "any", "value": "light"}]}],
        "info": {"author": "xcode", "version": 1},
        "properties": {"preserves-vector-data": true}
    };
    fs.writeFileSync(path.join(folderPath, 'Contents.json'), JSON.stringify(contentsJson, null, 2));
});
console.log('Imagesets 生成完毕！');
