import axios from 'axios';
import qs from 'qs';
// import router from '../route/index';
import { MessageBox, Message } from 'element-ui'
// import store from '@/store'

let baseURLlocal = "http://localhost:8801"

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;
// const CancelToken = axios.CancelToken;
// const source = CancelToken.source();
// 添加请求拦截器
axios.interceptors.request.use(
    function (config) {
        // 在发送请求之前做些什么

        // config.cancelToken = source.token; // 全局添加cancelToken;

        console.log("请求前")
        return config;
    },
    function (error) {
        // 对请求错误做些什么
        return Promise.reject(error);
    }
);


// 添加响应拦截器
axios.interceptors.response.use(
    function (response) {
        // 对响应数据做点什么
        const { data } = response;
        // if (data.msg) {
        //   message.error(data.msg);
        // }

        if (data && data.code !== '0000') {
            if (data.code == '9500') {
                // source.cancel(); //取消其他正在进行的请求
                // router.push({ path: '/login' });
            } else {
                // notification.error({
                //   message: 'Notification Title',
                //   description:
                //     'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
                //   onClick: () => {
                //     console.log('Notification Clicked!');
                //   },
                //   duration:1.5
                // });
                if (data.msg && data.code != '3500') {
                    message.error(data.msg);
                }
                // 3500 都是不会用msg弹出，一种是不弹出，一种是用来弹出超时和新建产品时右上角弹出提醒
                // 7000 代表参数类型错误
                // 3000 异常
            }
        }
        if (response.headers.location) {
            window.location.href = response.headers.location;
        }
        return response;
    },
    function (error) {
        if (String(error).search('Error: timeout of 30000ms exceeded') != -1) {
            Message({
                message: '请求超时，请稍后再尝试！' || 'Error',
                type: 'error',
                duration: 5 * 1000
              })
        }
        if (axios.isCancel(error)) {
            //取消请求的情况下，终端Promise调用链
            return new Promise(() => { });
        } else {
            if (error && error.response && error.response.status == 401 && error.response.headers.location) {
                let loginUrl = error.response.headers.location;
                window.location.href = loginUrl;
            }
            console.log("error:"+error)
            // 对响应错误做点什么
            return Promise.reject(error);
        }
    }
)


export default async (url, params = {}, method, data = {}, baseURL = baseURLlocal, timeout = 30000) => {
    return await axios({
        url,
        method: method.split('_')[0],
        // `baseURL ` 将自动加在url前面，除非url是一个绝对url,
        // 它可以通过设置一个 baseURL 便于为 axios实例的方法传递相对URL
        baseURL,

        // `transformRequest` 允许在向服务器发送前，修改请求数据
        // 只能用在 'PUT', 'POST' 和 'PATCH' 这几个请求方法
        // 后面数组中的函数必须返回一个字符串，或 ArrayBuffer，或 Stream
        transformRequest: [
            function (data) {
                // 可对data进行任意转换
                // console.log(data,'transformRequest')
                // console.log(data, "qs.stringify(data)");
                if (method == 'POST') {
                    return qs.stringify(data);
                } else {
                    return JSON.stringify(data);
                }

                // return JSON.stringify(data);
            },
        ],
        //在传递给 then/catch之前，允许修改响应数据
        transformResponse: [
            function (data) {
                // 对 data 进行任意转换;
                return data;
            },
        ],
        headers: getHeader(method),
        params,
        // data 是作为请求主体被发送的数据
        // 只适用于这些请求方法 PUT POST PATCH
        // 在没有设置 transformRequest 时，必须是以下类型之一： string plan object, ArrayBuffer , ArrayBufferView , URLSearchParams
        // 浏览器专属  ： FormData , File , Blob;
        // Node 专属： Stream
        data,
        timeout,
        // 服务器响应的数据类型， 可以是‘arraybuffer','blob', 'documnet','json','text','stream'
        responseType: 'json', // default
        responseEncoding: 'utf8', // default
        // `onUploadProgress` 允许为上传处理进度事件
        // onUploadProgress: function (progressEvent) {
        // console.log(progressEvent,'传处理进度事件')
        // Do whatever you want with the native progress event
        // },

        // `onDownloadProgress` 允许为下载处理进度事件
        // onDownloadProgress: function (progressEvent) {
        // console.log(progressEvent,'下载处理进度事件')
        // 对原生进度事件的处理
        // },
        complete: function (XMLHttpRequest, status) {
            //请求完成后最终执行参数
            if (status == 'timeout') {
                //超时,status还有success,error等值的情况
                alert('超时');
            }
        },
    });
};


export function getHeader(method) {
    switch (method) {
        case 'GET':
            return { 'Content-Type': 'application/json' };
        case 'POST':
            return {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            };
        case 'POST_JSON':
            return { 'Content-Type': 'application/json' };
        case 'POST_FILE':
            return { 'Content-Type': 'multipart/form-data' };
        default:
            return { 'Content-Type': 'application/json' };
    }
}

export function formDataRequest(url, formData) {
    return axios.post(baseURLlocal + url, formData);
}