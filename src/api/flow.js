import request from '@/utils/http_request'

// export const findTaskFlowAll =(params)=>{
//     request('/findTaskFlowAll',null,'GET',null)
// }

// export const findTaskFlowBy =(params)=>{
//     request('/findTaskFlowAll',params,'GET',null)
// }
export function findTaskFlowAll() {
    return request({
      url: '/findTaskFlowAll',
      method: 'post',
    })
  }
  
  export function findTaskFlowById(params) {
    return request({
      url: '/findTaskFlowById',
      method: 'post',
      params
    })
  }

  export function pubTaskFlow(data) {
    return request({
      url: '/pubTaskFlow',
      method: 'post',
      data
    })
  }

  export function exeTaskFlow(data) {
    return request({
      url: '/exeTaskFlow',
      method: 'post',
      data
    })
  }
  
