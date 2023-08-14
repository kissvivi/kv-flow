import request from '@/utils/http_request'

export function findTaskTemplateAll() {
    return request({
      url: '/findTaskTemplateAll',
      method: 'post',
    })
  }
  