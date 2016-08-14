
node-red-openshift
================

将[Node-RED](http://nodered.org) 部署到[Openshift](https://www.openshift.com)。

### 已有openshift online v2账号的用户

1. 安装过程中，在server.js文件中换上自己的用户名和用户密码，填入的用户密码需要进行base64加密；

2. 安装成功后，打开`http://<appname>.rhcloud.com:8000`，弹出登录对话框，填入前面的用户名和用户密码，即可进入node-red的编辑界面。

   > 注意：因为rhcloud.com的域名被墙，你可能需要翻墙才能看到建立的网站

### 没有openshift online v2账号的用户

因为openshfit online 升级的缘故，openshift online v2已经关闭注册，如果你愿意使用openshift online v3的话，可以采用docker安装的方法，安装教程参见[官网](http://nodered.org/docs/platforms/docker)。但是，因为openshift online v3正在测试过程中，所以现在注册的账号只有30天的有效期，30天之后你的账号、网站和数据都会被删除。