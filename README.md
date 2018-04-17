# 财上海原创微博爬虫示例

本爬虫说明：
    + 包含三部分服务：
        爬虫服务 ： 抓取微博数据
        数据服务 ： 浏览器查看数据，写入txt文件等
        分词统计服务 ： 统计词频

## 爬虫服务使用说明

安装：

```bash
$ npm install
```

### 爬虫使用方法：
    + cookieService里面修改cookie，需要使用已有账号登录微博，从浏览器中获取
    + urlService修改pageNo起止页码，建议不超过50页，避免服务器拒绝访问

运行：

```bash
$ node app.js
```

## 数据服务说明

运行：

```bash
$ node web.js
```

服务器启动时，会将mongodb中数据写入txt文本

浏览器访问 http://127.0.0.1:3000

## 分词统计服务

运行:

```bash
$ node segment.js
```
运行结果写入txt文件





