<template>
    <div v-if="easyFlowVisible" style="height: calc(100vh);">
        <el-row>
            <!--顶部工具菜单-->
            <el-col :span="24">
                <div class="ef-tooltar">
                    <el-input v-if="editing" type="primary" @blur="saveText" v-model="data.name"></el-input>
                    <el-link v-else @click="startEditing" type="primary" :underline="false">{{ data.name }}</el-link>
                    <el-divider direction="vertical"></el-divider>
                    <el-button type="text" icon="el-icon-delete" size="large" @click="deleteElement"
                        :disabled="!this.activeElement.type"></el-button>
                    <el-divider direction="vertical"></el-divider>
                    <el-button type="text" icon="el-icon-download" size="large" @click="downloadData"></el-button>
                    <el-divider direction="vertical"></el-divider>
                    <el-button type="text" icon="el-icon-plus" size="large" @click="zoomAdd"></el-button>
                    <el-divider direction="vertical"></el-divider>
                    <el-button type="text" icon="el-icon-minus" size="large" @click="zoomSub"></el-button>
                    <div style="float: right;margin-right: 5px">
                        <el-button plain round :loading="exeState" icon="el-icon-thumb" @click="exeTaskFlow"
                            size="mini">执行</el-button>
                        <el-button plain round icon="el-icon-s-promotion" class="pub-btn" type="success"
                            @click="pubbTaskFlow" size="mini">发布</el-button>
                        <el-button type="info" plain round icon="el-icon-document" @click="dataInfo"
                            size="mini">流程信息</el-button>
                        <!-- <el-button type="primary" plain round @click="dataReloadA" icon="el-icon-refresh" size="mini">切换流程A</el-button>
                        <el-button type="primary" plain round @click="dataReloadB" icon="el-icon-refresh" size="mini">切换流程B</el-button>
                        <el-button type="primary" plain round @click="dataReloadC" icon="el-icon-refresh" size="mini">切换流程C</el-button> -->
                        <!-- <el-button type="primary" plain round @click="dataReloadD" icon="el-icon-refresh"
                            size="mini">自定义样式</el-button> -->
                        <!-- <el-button type="primary" plain round @click="dataReloadE" icon="el-icon-refresh" size="mini">力导图</el-button> -->
                        <el-button type="info" plain round icon="el-icon-document" @click="openHelp"
                            size="mini">帮助</el-button>
                    </div>
                </div>
            </el-col>
        </el-row>
        <div style="display: flex;height: calc(100% - 47px);">
            <div style="width: 230px;border-right: 1px solid #dce3e8;">
                <node-menu @addNode="addNode" ref="nodeMenu"></node-menu>
            </div>
            <div id="efContainer" ref="efContainer" class="container" v-flowDrag>
                <template ref="efTemplate" v-for="node in data.nodeList">
                    <flow-node :id="node.code" :key="node.code" :node="node" :activeElement="activeElement"
                        @changeNodeSite="changeNodeSite" @nodeRightMenu="nodeRightMenu" @clickNode="clickNode">
                    </flow-node>
                </template>
                <!-- 给画布一个默认的宽度和高度 -->
                <div style="position:absolute;top: 2000px;left: 2000px;">&nbsp;</div>
            </div>

            <!-- 右侧表单 -->
            <div style="width: auto;border-left: 1px solid #dce3e8;background-color: #FBFBFB">
                    <flow-node-form ref="nodeForm" @setLineLabel="setLineLabel"
                    @repaintEverything="repaintEverything"></flow-node-form>
            </div>
        </div>
        <!-- 流程数据详情 -->
        <flow-info v-if="flowInfoVisible" ref="flowInfo" :data="data"></flow-info>
        <flow-help v-if="flowHelpVisible" ref="flowHelp"></flow-help>
        <input style="display: none" @keyup.delete="delFun">
    </div>
</template>

<script>
import draggable from 'vuedraggable'
// import { jsPlumb } from 'jsplumb'
// 使用修改后的jsplumb
import './jsplumb'
import { easyFlowMixin } from '@/components/ef/mixins'
import flowNode from '@/components/ef/node'
import nodeMenu from '@/components/ef/node_menu'
import FlowInfo from '@/components/ef/info'
import FlowHelp from '@/components/ef/help'
import FlowNodeForm from './node_form'
import { pubTaskFlow, findTaskFlowById, exeTaskFlow } from '@/api/flow';
import lodash from 'lodash'
import { getDataA } from './data_A'
import { getDataB } from './data_B'
import { getDataC } from './data_C'
import { getDataD } from './data_D'
import { getDataE } from './data_E'
import { ForceDirected } from './force-directed'
import { getDataNow } from './data_now'

export default {
    data() {
        return {
            exeState: false,
            editing: false,
            fid: -1,
            // jsPlumb 实例
            jsPlumb: null,
            // 控制画布销毁
            easyFlowVisible: true,
            // 控制流程数据显示与隐藏
            flowInfoVisible: false,
            // 是否加载完毕标志位
            loadEasyFlowFinish: false,
            flowHelpVisible: false,
            // 数据
            data: {},
            // 激活的元素、可能是节点、可能是连线
            activeElement: {
                // 可选值 node 、line
                type: undefined,
                // 节点ID
                nodeCode: undefined,
                // 连线ID
                sourceId: undefined,
                targetId: undefined
            },
            zoom: 0.5
        }
    },
    // 一些基础配置移动该文件中
    mixins: [easyFlowMixin],
    components: {
        draggable, flowNode, nodeMenu, FlowInfo, FlowNodeForm, FlowHelp
    },
    directives: {
        'flowDrag': {
            bind(el, binding, vnode, oldNode) {
                if (!binding) {
                    return
                }
                el.onmousedown = (e) => {
                    if (e.button == 2) {
                        // 右键不管
                        return
                    }
                    //  鼠标按下，计算当前原始距离可视区的高度
                    let disX = e.clientX
                    let disY = e.clientY
                    el.style.cursor = 'move'

                    document.onmousemove = function (e) {
                        // 移动时禁止默认事件
                        e.preventDefault()
                        const left = e.clientX - disX
                        disX = e.clientX
                        el.scrollLeft += -left

                        const top = e.clientY - disY
                        disY = e.clientY
                        el.scrollTop += -top
                    }

                    document.onmouseup = function (e) {
                        el.style.cursor = 'auto'
                        document.onmousemove = null
                        document.onmouseup = null
                    }
                }
            }
        }
    },
    mounted() {
        // // 关闭浏览器窗口的时候清空浏览器缓存在localStorage的数据
        // window.onbeforeunload = function (e) {
        //         var storage = window.localStorage;
        //         storage.clear()
        //     }

        let that = this
        document.addEventListener("keydown", function (event) {
            if (event.key === "Delete") {
                console.log("Delete key is pressed.");
                that.deleteElement()
            }
        });

        this.jsPlumb = jsPlumb.getInstance()

        let fidStorage = localStorage.getItem("fid")

        // 获取查询字符串
        const queryString = window.location.search;
        console.log('queryString:', queryString);
        // 解析查询字符串为对象
        const queryParams = new URLSearchParams(queryString);

        // 获取参数值
        let fidSearch = queryParams.get('fid');
        console.log('fidSearch:', fidSearch);
        console.log('fidStorage:', fidStorage);



        if (fidSearch != -1) {
            this.getTaskFlowById(fidSearch)
        } else {
            this.$nextTick(() => {
                this.data = getDataNow()
                // 默认加载流程A的数据、在这里可以根据具体的业务返回符合流程数据格式的数据即可
                this.dataReload(getDataNow())
            })
        }
    },

    methods: {
        startEditing() {
            this.editing = true;
            this.$nextTick(() => {
                this.$refs.input.focus(); // 自动聚焦到输入框
            });
        },
        saveText() {
            this.editing = false;
            // 在这里可以将修改后的文本进行保存，比如通过 API 请求或者其他操作
        },
        setLocationSearchFid(fid) {
            window.location.search = "?fid=" + fid
        },
        getLocationSearchFid() {
            // 获取查询字符串
            const queryString = window.location.search;
            console.log('queryString:', queryString);
            // 解析查询字符串为对象
            const queryParams = new URLSearchParams(queryString);

            console.log('queryParams:', queryParams);
            // 获取参数值
            return queryParams.get("fid")
        },

        //发布任务流
        async pubbTaskFlow() {
            try {
                const response = await pubTaskFlow(this.data);
                // 处理请求成功的结果
                console.log('请求成功：', response);
                // 在这里可以根据请求成功的结果更新组件的数据或状态
                localStorage.setItem("fid", response.Data.ID)
                // this.setLocationSearchFid(response.Data.ID)

                this.getTaskFlowById(response.Data.ID)

                // this.getLocationSearchFid()
                this.$notify({
                    title: '成功',
                    message: '发布任务流成功',
                    duration: 1000,
                    type: 'success'
                });

            } catch (error) {
                console.error('请求失败：', error);
                // 在这里可以处理请求失败的情况，例如显示错误信息
            }
        },

        //执行任务流
        async exeTaskFlow() {
            try {
                const response = await exeTaskFlow(this.data);
                // 处理请求成功的结果
                console.log('请求成功：', response);
                // 在这里可以根据请求成功的结果更新组件的数据或状态
                this.$refs.nodeForm.activeName = "second"
                this.exeState = true
                this.$notify({
                    title: '成功',
                    duration: 1000,
                    message: '执行任务流成功',
                    type: 'success'
                });
            } catch (error) {
                console.error('请求失败：', error);
                // 在这里可以处理请求失败的情况，例如显示错误信息
            }

        },


        //通过id向后端查询当前任务流的信息
        async getTaskFlowById(fid) {
            try {
                const response = await findTaskFlowById({ id: fid });
                // 处理请求成功的结果
                console.log('请求成功：', response);
                // 在这里可以根据请求成功的结果更新组件的数据或状态

                this.data = response.Data

                this.$nextTick(() => {
                    // 默认加载流程A的数据、在这里可以根据具体的业务返回符合流程数据格式的数据即可
                    this.dataReload(this.data)
                })

            } catch (error) {
                console.error('请求失败：', error);
                // 在这里可以处理请求失败的情况，例如显示错误信息
            }
        },


        // 返回唯一标识
        getUUID() {
            return Math.random().toString(36).substr(3, 10)
        },
        jsPlumbInit() {
            this.jsPlumb.ready(() => {
                // 导入默认配置
                this.jsPlumb.importDefaults(this.jsplumbSetting)
                // 会使整个jsPlumb立即重绘。
                this.jsPlumb.setSuspendDrawing(false, true);
                // 初始化节点
                this.loadEasyFlow()
                // 单点击了连接线, https://www.cnblogs.com/ysx215/p/7615677.html
                this.jsPlumb.bind('click', (conn, originalEvent) => {
                    this.activeElement.type = 'line'
                    this.activeElement.sourceId = conn.sourceId
                    this.activeElement.targetId = conn.targetId
                    this.$refs.nodeForm.lineInit({
                        from: conn.sourceId,
                        to: conn.targetId,
                        label: conn.getLabel()
                    })
                })
                // 连线
                this.jsPlumb.bind("connection", (evt) => {

                    console.log("evt.source.code" + evt.source.code)
                    console.log("evt.source.id" + evt.source.id)
                    let from = evt.source.id
                    let to = evt.target.id
                    if (this.loadEasyFlowFinish) {
                        this.data.lineList.push({ from: from, to: to })
                    }
                })

                // 删除连线回调
                this.jsPlumb.bind("connectionDetached", (evt) => {
                    this.deleteLine(evt.sourceId, evt.targetId)
                })

                // 改变线的连接节点
                this.jsPlumb.bind("connectionMoved", (evt) => {
                    this.changeLine(evt.originalSourceId, evt.originalTargetId)
                })

                // 连线右击
                this.jsPlumb.bind("contextmenu", (evt) => {
                    console.log('contextmenu', evt)
                })

                // 连线
                this.jsPlumb.bind("beforeDrop", (evt) => {

                    let from = evt.sourceId
                    let to = evt.targetId
                    if (from === to) {
                        this.$notify.error('节点不支持连接自己')
                        return false
                    }
                    if (this.hasLine(from, to)) {
                        this.$notify.error('该关系已存在,不允许重复创建')
                        return false
                    }
                    if (this.hashOppositeLine(from, to)) {
                        this.$notify.error('不支持两个节点之间连线回环');
                        return false
                    }
                    this.$notify.success('连接成功')
                    return true
                })

                // beforeDetach
                this.jsPlumb.bind("beforeDetach", (evt) => {
                    console.log('beforeDetach', evt)
                })
                this.jsPlumb.setContainer(this.$refs.efContainer)
            })
        },
        // 加载流程图
        loadEasyFlow() {
            // 初始化节点
            console.log("初始化节点----------" + this.data.nodeList)
            for (var i = 0; i < this.data.nodeList.length; i++) {
                let node = this.data.nodeList[i]
                // 设置源点，可以拖出线连接其他节点
                this.jsPlumb.makeSource(node.code, lodash.merge(this.jsplumbSourceOptions, {}))
                // // 设置目标点，其他源点拖出的线可以连接该节点
                this.jsPlumb.makeTarget(node.code, this.jsplumbTargetOptions)
                if (!node.viewOnly) {
                    this.jsPlumb.draggable(node.code, {
                        containment: 'parent',
                        stop: function (el) {
                            // 拖拽节点结束后的对调
                            console.log('拖拽结束: ', el)
                        }
                    })
                }
            }
            // 初始化连线
            console.log("初始化连线----------" + this.data.lineList)
            for (var i = 0; i < this.data.lineList.length; i++) {
                let line = this.data.lineList[i]
                var connParam = {
                    source: line.from,
                    target: line.to,
                    label: line.label ? line.label : '',
                    connector: line.connector ? line.connector : '',
                    anchors: line.anchors ? line.anchors : undefined,
                    paintStyle: line.paintStyle ? line.paintStyle : undefined,
                }
                console.log("connParam" + connParam)
                this.jsPlumb.connect(connParam, this.jsplumbConnectOptions)
            }
            this.$nextTick(function () {
                this.loadEasyFlowFinish = true
            })
        },
        // 设置连线条件
        setLineLabel(from, to, label) {
            var conn = this.jsPlumb.getConnections({
                source: from,
                target: to
            })[0]
            if (!label || label === '') {
                conn.removeClass('flowLabel')
                conn.addClass('emptyFlowLabel')
            } else {
                conn.addClass('flowLabel')
            }
            conn.setLabel({
                label: label,
            })
            this.data.lineList.forEach(function (line) {
                if (line.from == from && line.to == to) {
                    line.label = label
                }
            })

        },
        // 删除激活的元素
        deleteElement() {
            if (this.activeElement.type === 'node') {
                this.deleteNode(this.activeElement.nodeCode)
            } else if (this.activeElement.type === 'line') {
                this.$confirm('确定删除所点击的线吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    var conn = this.jsPlumb.getConnections({
                        source: this.activeElement.sourceId,
                        target: this.activeElement.targetId
                    })[0]
                    this.jsPlumb.deleteConnection(conn)
                }).catch(() => {
                })
            }
        },
        // 删除线
        deleteLine(from, to) {
            this.data.lineList = this.data.lineList.filter(function (line) {
                if (line.from == from && line.to == to) {
                    return false
                }
                return true
            })
        },
        // 改变连线
        changeLine(oldFrom, oldTo) {
            this.deleteLine(oldFrom, oldTo)
        },
        // 改变节点的位置
        changeNodeSite(data) {
            for (var i = 0; i < this.data.nodeList.length; i++) {
                let node = this.data.nodeList[i]
                if (node.code === data.nodeCode) {
                    node.left = data.left
                    node.top = data.top
                }
            }
        },
        /**
         * 拖拽结束后添加新的节点
         * @param evt
         * @param nodeMenu 被添加的节点对象
         * @param mousePosition 鼠标拖拽结束的坐标
         */
        addNode(evt, nodeMenu, mousePosition) {
            var screenX = evt.originalEvent.clientX, screenY = evt.originalEvent.clientY
            let efContainer = this.$refs.efContainer
            var containerRect = efContainer.getBoundingClientRect()
            var left = screenX, top = screenY
            // 计算是否拖入到容器中
            if (left < containerRect.x || left > containerRect.width + containerRect.x || top < containerRect.y || containerRect.y > containerRect.y + containerRect.height) {
                this.$notify.error("请把节点拖入到画布中")
                return
            }
            left = left - containerRect.x + efContainer.scrollLeft
            top = top - containerRect.y + efContainer.scrollTop
            // 居中
            left -= 85
            top -= 16
            var nodeCode = this.getUUID()
            // 动态生成名字
            var origName = nodeMenu.name
            var nodeName = origName
            var index = 1
            while (index < 10000) {
                var repeat = false
                for (var i = 0; i < this.data.nodeList.length; i++) {
                    let node = this.data.nodeList[i]
                    if (node.name === nodeName) {
                        nodeName = origName + index
                        repeat = true
                    }
                }
                if (repeat) {
                    index++
                    continue
                }
                break
            }
            var node = {
                code: nodeCode,
                name: nodeName,
                type: nodeMenu.type,
                left: left + 'px',
                top: top + 'px',
                ico: nodeMenu.ico,
                state: 'success'
            }
            /**
             * 这里可以进行业务判断、是否能够添加该节点
             */
            this.data.nodeList.push(node)
            this.$nextTick(function () {
                this.jsPlumb.makeSource(nodeCode, this.jsplumbSourceOptions)
                this.jsPlumb.makeTarget(nodeCode, this.jsplumbTargetOptions)
                this.jsPlumb.draggable(nodeCode, {
                    containment: 'parent',
                    stop: function (el) {
                        // 拖拽节点结束后的对调
                        console.log('拖拽结束: ', el)
                    }
                })
            })
        },
        /**
         * 删除节点
         * @param nodeCode 被删除节点的ID
         */
        deleteNode(nodeCode) {
            this.$confirm('确定要删除节点' + nodeCode + '?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                closeOnClickModal: false
            }).then(() => {
                /**
                 * 这里需要进行业务判断，是否可以删除
                 */
                this.data.nodeList = this.data.nodeList.filter(function (node) {
                    if (node.code === nodeCode) {
                        // 伪删除，将节点隐藏，否则会导致位置错位
                        // node.show = false
                        return false
                    }
                    return true
                })
                this.$nextTick(function () {
                    this.jsPlumb.removeAllEndpoints(nodeCode);
                })
            }).catch(() => {
            })
            return true
        },
        clickNode(nodeCode) {
            this.activeElement.type = 'node'
            this.activeElement.nodeCode = nodeCode
            this.$refs.nodeForm.nodeInit(this.data, nodeCode)
        },
        // 是否具有该线
        hasLine(from, to) {
            for (var i = 0; i < this.data.lineList.length; i++) {
                var line = this.data.lineList[i]
                if (line.from === from && line.to === to) {
                    return true
                }
            }
            return false
        },
        // 是否含有相反的线
        hashOppositeLine(from, to) {
            return this.hasLine(to, from)
        },
        nodeRightMenu(nodeCode, evt) {
            this.menu.show = true
            this.menu.curNodeId = nodeCode
            this.menu.left = evt.x + 'px'
            this.menu.top = evt.y + 'px'
        },
        repaintEverything() {
            this.jsPlumb.repaint()
        },
        // 流程数据信息
        dataInfo() {
            this.flowInfoVisible = true
            this.$nextTick(function () {
                this.$refs.flowInfo.init()
            })
        },
        pubdataInfo() {
            this.flowInfoVisible = true
            this.$nextTick(function () {
                this.$refs.flowInfo.init()
            })
        },
        // 加载流程图
        dataReload(data) {
            this.easyFlowVisible = false
            // this.data.nodeList = []
            // this.data.lineList = []
            this.$nextTick(() => {
                // data = lodash.cloneDeep(data)
                this.easyFlowVisible = true
                // this.data = data
                this.$nextTick(() => {
                    this.jsPlumb = jsPlumb.getInstance()
                    this.$nextTick(() => {
                        this.jsPlumbInit()
                    })
                })
            })
        },
        // 模拟载入数据dataA
        dataReloadA() {
            this.dataReload(getDataA())
        },
        // 模拟载入数据dataB
        dataReloadB() {
            this.dataReload(getDataB())
        },
        // 模拟载入数据dataC
        dataReloadC() {
            this.dataReload(getDataC())
        },
        // 模拟载入数据dataD
        dataReloadD() {
            this.dataReload(getDataD())
        },
        // 模拟加载数据dataE，自适应创建坐标
        dataReloadE() {
            let dataE = getDataE()
            let tempData = lodash.cloneDeep(dataE)
            let data = ForceDirected(tempData)
            this.dataReload(data)
            this.$message({
                message: '力导图每次产生的布局是不一样的',
                type: 'warning'
            });
        },
        zoomAdd() {
            if (this.zoom >= 1) {
                return
            }
            this.zoom = this.zoom + 0.1
            this.$refs.efContainer.style.transform = `scale(${this.zoom})`
            this.jsPlumb.setZoom(this.zoom)
        },
        zoomSub() {
            if (this.zoom <= 0) {
                return
            }
            this.zoom = this.zoom - 0.1
            this.$refs.efContainer.style.transform = `scale(${this.zoom})`
            this.jsPlumb.setZoom(this.zoom)
        },
        // 下载数据
        downloadData() {
            this.$confirm('确定要下载该流程数据吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                closeOnClickModal: false
            }).then(() => {
                var datastr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.data, null, '\t'));
                var downloadAnchorNode = document.createElement('a')
                downloadAnchorNode.setAttribute("href", datastr);
                downloadAnchorNode.setAttribute("download", 'data.json')
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
                this.$notify.success("正在下载中,请稍后...")
            }).catch(() => {
            })
        },
        openHelp() {
            this.flowHelpVisible = true
            this.$nextTick(function () {
                this.$refs.flowHelp.init()
            })
        }
    }
}
</script>

<style>

/*滚动条样式*/
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

::-webkit-scrollbar-thumb {
    border-radius: 3px;
    -webkit-box-shadow: inset 0 0 5px #a8a8a8a2; background: rgba(116, 113, 113, 0.082);
}
</style>
