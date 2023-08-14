var dataE = {
    name: '流程E，力导图',
    nodeList: [
        {
            code: 'nodeA',
            name: '流程D-节点A',
            type: 'task',
            ico: 'el-icon-user-solid',
            state: 'success'
        },
        {
            code: 'nodeB',
            type: 'task',
            name: '流程D-节点B',
            ico: 'el-icon-goods',
            state: 'error'
        },
        {
            code: 'nodeC',
            name: '流程D-节点C',
            type: 'task',
            ico: 'el-icon-present',
            state: 'warning'
        }, {
            code: 'nodeD',
            name: '流程D-节点D',
            type: 'task',
            ico: 'el-icon-present',
            state: 'running'
        }
    ],
    lineList: [{
        from: 'nodeA',
        to: 'nodeB'
    }, {
        from: 'nodeA',
        to: 'nodeC',
        label: 'hello'
    }, {
        from: 'nodeB',
        to: 'nodeD'
    }, {
        from: 'nodeC',
        to: 'nodeD'
    }, {
        from: 'nodeC',
        to: 'nodeC'
    }
    ]
}

export function getDataE() {
    return dataE
}
