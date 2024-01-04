<template>
    <div>
        <div class="ef-node-form">
            <div class="ef-node-form-header">
                编辑
            </div>
            <div class="ef-node-form-body">
                <el-tabs class="ef-node-tabs" v-model="activeName" @tab-click="handleClick">
                    <el-tab-pane label="节点信息" name="first">
                        <el-form :model="node" ref="dataForm" label-width="80px" v-show="type === 'node'">
                            <el-form-item label="编号">
                                <el-input v-model="node.code" :disabled="true"></el-input>
                            </el-form-item>
                            <el-form-item label="类型">
                                <el-input v-model="node.type" :disabled="true"></el-input>
                            </el-form-item>
                            <el-form-item label="名称">
                                <el-input v-model="node.name"></el-input>
                            </el-form-item>
                            <el-form-item v-if="node.type == 'WHILE'" label="循环次数">
                                <el-input placeholder="请输入循环次数" type="number" v-model="node.count"></el-input>
                            </el-form-item>
                            <el-form-item v-if="node.type == 'DELAY'" label="延时/秒">
                                <el-input placeholder="请输入延时/s" type="number" v-model="node.second"></el-input>
                            </el-form-item>
                            <!-- <el-form-item label="left坐标">
                                <el-input v-model="node.left" :disabled="true"></el-input>
                            </el-form-item>
                            <el-form-item label="top坐标">
                                <el-input v-model="node.top" :disabled="true"></el-input>
                            </el-form-item> -->
                            <el-form-item label="ico图标">
                                <el-input v-model="node.ico"></el-input>
                            </el-form-item>
                            <el-form-item label="状态">
                                <el-select v-model="node.state" placeholder="请选择">
                                    <el-option v-for="item in stateList" :key="item.state" :label="item.label"
                                        :value="item.state">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item>
                                <el-button icon="el-icon-close">重置</el-button>
                                <el-button type="primary" icon="el-icon-check" @click="save">保存</el-button>
                            </el-form-item>
                        </el-form>

                        <el-form :model="line" ref="dataForm" label-width="80px" v-show="type === 'line'">
                            <el-form-item label="条件">
                                <el-input v-model="line.label"></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-button icon="el-icon-close">重置</el-button>
                                <el-button type="primary" icon="el-icon-check" @click="saveLine">保存</el-button>
                            </el-form-item>
                        </el-form>

                    </el-tab-pane>
                    <el-tab-pane label="执行日志" name="second">
                        <div class="log-container">
                            <div class="log-box" ref="logBox">
                                <div v-for="(log, index) in logs" :key="index" class="log-entry">{{ log.Data }}</div>
                            </div>
                        </div>



                    </el-tab-pane>
                    <el-tab-pane label="节点操作" name="third">节点操作</el-tab-pane>
                </el-tabs>


            </div>
            <!--            <div class="el-node-form-tag"></div>-->
        </div>
    </div>
</template>

<script>
import { cloneDeep } from 'lodash'
import VueNativeSock from "vue-native-websocket";
import Vue from "vue"
export default {
    props: {
            flowData: Object,
        },
    data() {
        return {
            logs: [],
            activeName: 'first',
            visible: true,
            // node 或 line
            type: 'node',
            node: {},
            line: {},
            data: {},
            stateList: [{
                state: 'success',
                label: '运行完成'
            }, {
                state: 'warning',
                label: '初始化'
            }, {
                state: 'error',
                label: '错误'
            }, {
                state: 'running',
                label: '运行中'
            }]
        }
    },
    created() {
        this.logs.push({"Data":"[日志控制台]"})
        console.log(1);
    },

    mounted() {
        Vue.use(VueNativeSock, "ws://localhost:10002/ws", {
            format: "json"
        });

        this.$socket.onmessage = event => {
            const log = JSON.parse(event.data);
            if (log.Action == "DagLog"){
                this.logs.push(log);
            }
            if (log.Action == "DagControl"){
                console.log("DagControl"+log.Msg)
                if (log.Msg=='DAG_ALL_SUCCESS'&& log.FlowId == this.data.id){
                    this.exeState = false
                }
            }
        };
    },
    watch: {
        logs() {
            this.$nextTick(() => {
        this.scrollToBottom();  // 在日志更新时调用滚动函数
      });
        }
    },
    methods: {

        scrollToBottom() {
            this.$refs.logBox.scrollTop = this.$refs.logBox.scrollHeight;  // 滚动到底部
        },
        /**
         * 表单修改，这里可以根据传入的ID进行业务信息获取
         * @param data
         * @param code
         */
        nodeInit(data, code) {
            this.type = 'node'
            this.data = data
            data.nodeList.filter((node) => {
                if (node.code === code) {
                    this.node = cloneDeep(node)
                }
            })
        },
        lineInit(line) {
            this.type = 'line'
            this.line = line
        },
        // 修改连线
        saveLine() {
            this.$emit('setLineLabel', this.line.from, this.line.to, this.line.label)
        },
        save() {
            this.data.nodeList.filter((node) => {
                if (node.code === this.node.code) {
                    node.name = this.node.name
                    node.left = this.node.left
                    node.top = this.node.top
                    node.ico = this.node.ico
                    node.state = this.node.state
                    node.count = Number(this.node.count)
                    node.second = Number(this.node.second)
                    this.$emit('repaintEverything')
                }
            })
        }, handleClick(tab, event) {
            console.log(tab, event);
        }
    }
}
</script>

<style>
.el-node-form-tag {
    position: absolute;
    top: 50%;
    margin-left: -15px;
    height: 40px;
    width: 15px;
    background-color: #fbfbfb;
    border: 1px solid rgb(220, 227, 232);
    border-right: none;
    z-index: 0;
}

.ef-node-tabs {
    margin: 10px;
}
</style>
<style>
.log-container {
    height: 600px;
    border: 1px solid #ccc;
    overflow: hidden;
}

.log-box {
    height: 100%;
    overflow: auto;
    padding: 10px;
    box-sizing: border-box;
}

.log-entry {
    margin-bottom: 5px;
    padding: 5px;
    border: 1px solid #ddd;
    background-color: #f9f9f9;
}
</style>





