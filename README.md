# 新浪微博爬虫

本爬虫说明：

+ 爬虫服务 ： 以热门博主财上海为例 (具体参考 https://weibo.com/u/1565668374) ，对其发布的所有微博进行采集
+ 数据服务 ： 浏览器查看数据，写入txt文件等
+ 分词统计服务 ： 统计词频

## 爬虫服务

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

## 数据服务

运行：

```bash
$ node web.js
```

服务器启动时，会将mongodb中数据写入txt文本

浏览器访问 http://127.0.0.1:3000

## 词频统计

运行:

```bash
$ node segment.js
```

分词服务使用 node-segment (具体参考 https://github.com/leizongmin/node-segment)
运行结果写入txt文件


## 注意

该爬虫项目纯属个人研究，切勿滥用对微博服务造成损害！


