
## 前端修改：
[预览](https://zcbot.gitee.io/qrbtf/)

修改自[qrbtf](https://github.com/latentcat/qrbtf)，为了实现通过API调用生成二维码，对前端页面做了一些修改：

* 简化页面内容，提高爬虫定位元素速度
* 取消点击直接下载，通过API获取生成的二维码，无需下载
* 增加生成API参数按钮，方便通过页面修改样式并生成API请求参数
* 增加了一个不可见的输入框，方便爬虫对接


## API实现：
API基于[DrissionPage](https://github.com/g1879/DrissionPage)实现，并通过[flask](https://flask.palletsprojects.com/en/3.0.x/)提供接口，可实现通过API调用生成`qrbtf`的全样式二维码，返回结果可选`SVG`、`Base64`编码的`JPG`或`PNG`(`SVG`格式最快，可以实现100ms以内响应)。

目前接口实现较简陋，只能单线程生成，且参数校验不完善，后续有时间会继续完善，并提供可以直接调用的接口。


```python

import threading

from DrissionPage import ChromiumPage, ChromiumOptions
from flask import Flask, request

app = Flask("__naem__")
co = ChromiumOptions()
co.set_argument('--incognito')
co.set_argument('--no-sandbox')
# 设置为无头模式
# co.headless()

page = ChromiumPage(co)
page.quit()
page = ChromiumPage(co)
url = 'https://zcbot.gitee.io/qrbtf/'
# url = 'http://127.0.0.1:3000'

page.get(url)
qrbtf_tab = page.get_tab()
special_input = qrbtf_tab.ele('#for-drission-page-svg-complex')
lock = threading.Lock()


@app.route('/qrbtf', methods=['POST'])
def qrbtf():
    data = str(request.get_data(), encoding='utf-8')
    if not data.strip():
        return "参数不能为空"
    return get_qrbtf(data)


def get_qrbtf(content):
    lock.acquire()
    special_input.input(content)
    special_input.click.multi()
    data = special_input.attr('placeholder')
    special_input.set.value('')
    lock.release()
    return data


# 启动实施（只在当前模块运行）
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8900)
    page.close()

```

调用例子：
```shell

curl --location --request POST 'http://127.0.0.1:8900/qrbtf' \
--header 'User-Agent: Apifox/1.0.0 (https://apifox.com)' \
--header 'Content-Type: application/json' \
--header 'Accept: */*' \
--header 'Host: 127.0.0.1:8900' \
--header 'Connection: keep-alive' \
--data-raw '{
    "text": "二维码内容",
    "style": 2,
    "level": 0,
    "icon": {
        "enabled": 0,
        "src": "",
        "scale": 22
    },
    "type": "png",
    "params": [
        70,
        70,
        90,
        1
    ]
}'
```