// import JSZip from "jszip";
// import axios from "axios";
// import path from "path";
// import fs from "fs";
const JSZip = require("jszip");
const axios = require("axios");
const path = require('path');
const fs = require("fs");

const downloadZip = async (url) => {
    // 使用axios获取zip文件的数据
    const {
        data
    } = await axios.get(url, {
        responseType: "arraybuffer",
    });
    // 返回zip文件数据
    return data;
};
const getAction = async (url) => {
    // 使用axios获取zip文件的数据
    const {
        data
    } = await axios.get(url);
    // 返回zip文件数据
    return data;
};
const unzip = async (zipData) => {
    // 使用jszip将zip文件转换成对象
    const zip = await JSZip.loadAsync(zipData);
    // 使用Promise.all方法，获取zip文件中的内容
    const files = await Promise.all(
        Object.keys(zip.files).map(async (filename) => {
            const file = zip.files[filename];
            const content = await file.async("nodebuffer");
            // 返回文件对象
            return {
                filename,
                content,
            };
        })
    );
    // 返回文件对象数组
    return files;
};

const installPlugin = async (pluginUrl) => {
    console.log('process.argv[2]  :>> ', process.argv[2] );
    let targetPath = process.argv[2] || undefined
    // https://github.com/R3nzTheCodeGOD/R3nzSkin/releases/download/v3.1.6/R3nzSkin.zip
    let target = await getAction(pluginUrl)
    console.log('获取最新版本成功 :>> ',target.tag_name);
    let downLoadUrl = target.assets[0].browser_download_url || `https://github.com/R3nzTheCodeGOD/R3nzSkin/releases/download/${target.tag_name.replace('v','')}/R3nzSkin.zip`
    console.log('获取最新版本下载地址成功 :>> ',downLoadUrl);
    let fileData = await downloadZip(downLoadUrl);
    let filepath = await unzip(fileData);
    try {
        let FilePath = filepath.filter(
            (item) => !item.filename.endsWith("/")
        );

        // 上传文件夹文件
        FilePath.forEach((item) => {
            let fileLastName = item.filename.match(/[^.]+$/)[0]
            if (!item.filename.endsWith("/")) {
                let targetPathFile = path.resolve(__dirname, `../../r3nz/${fileLastName === 'dll' ? 'hid.dll' : item.filename}`)
                let index = item.filename.lastIndexOf("/")

                if (index !== -1 && !fs.existsSync(path.resolve(__dirname, `../../r3nz/${item.filename.slice(0, index)}/`))) {
                    let targteFile = path.resolve(__dirname, `../../r3nz/${item.filename.slice(0, index)}/`);
                    // 创建对应目录
                    fs.mkdirSync(targteFile, {
                        recursive: true,
                    });
                }
                if (fileLastName === 'dll') {
                    console.log('targetPath || targetPathFile', targetPath || targetPathFile);
                    fs.writeFileSync(targetPath || targetPathFile , item.content);
                }
            }
        });
        console.log('下载成功 :>> ');
    } catch (error) {
        console.log('error :>> ', error);
    }

};
// https://api.github.com/repos/R3nzTheCodeGOD/R3nzSkin/releases/latest
installPlugin("https://api.github.com/repos/R3nzTheCodeGOD/R3nzSkin/releases/latest");