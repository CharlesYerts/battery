let data = {
    pageTitle: 'Battery Forecast Platform',
    componentId: 'flowSheet',
    batteryId: 'single',
    batteryCurrentMul: 1,
    chartData: {
        capacity: 2000,
        RULRate: 1
    },
    lineIndex: null,
    batteryInfo: {
        basicInfo: {
            name: 'NULL',
            model: 'NULL',
            size: '0*0',
            weight: '0 kg',
            capacity: '0 mA'
        },
        testingEnvironment: {
            temperature: '0 ℃',
            constantCurrent: '0 C',
            constantVoltage: '0 V',
            constantCapicty: '0 mA'
        },
        forecastResult: {
            predication: 0,
            true: 0,
            error: 'NULL'
        }
    },
    batteryPic: {
        single: './src/image/single.png',
        double_1: './src/image/double_1.png',
        double_2: './src/image/double_2.png',
        four: './src/image/four.png',
        single_light: './src/image/single_light.png',
        double_1_light: './src/image/double_1_light.png',
        double_2_light: './src/image/double_2_light.png',
        four_light: './src/image/four_light.png'
    }

}

let batteryInfoComp = {
    template: "#batteryInfoTemp",
    props: ['basicInfo']
}

let envInfoComp = {
    template: "#envInfoTemp",
    props: ['envInfo']
}

let foreCastInfoComp = {
    template: "#foreCastInfoTemp",
    props: ['foreCastInfo']
}

let flowSheet = {
    template: "#flowSheetTemp"
}

let uploadFile = {
    template: '#uploadFileTemp',
    data: function () {
        return {
            click: false,
            selectedFile: {
                name: ''
            },
            chartData: {
                consumption: [],
                trueData: [],
                preData: [],
                trueSOCData: [],
                preSOCData: [],
                current: [],
                voltage: [],
                stepIndex: [],
                xData: [],
                RUL: [],
                rxData: [],
                RULRate: 0,
                capacity: 2000
            }
        }
    },
    methods: {
        sendData: function () {

            this.$emit('func', this.chartData)
            window.alert('文件上传成功')

        },
        onFileSelected: function (event) {
            this.selectedFile = event.target.files[0]
            console.log(this.selectedFile)
        },
        onFileUpload: function () {
            var that = this

            function compareFunction(propertyName) {
                return function (src, tar) {
                    //获取比较的值
                    var v1 = src[propertyName];
                    var v2 = tar[propertyName];
                    if (Number(v1) > Number(v2)) {
                        return 1;
                    }
                    if (Number(v1) < Number(v2)) {
                        return -1;
                    }
                    return 0;
                };
            }

            function updateOption(datas) {
                var consumption = [];
                var trueData = [];
                var preData = [];
                var SOCData = [];
                var preSOC = [];
                var current = [];
                var voltage = [];
                var stepIndex = [];
                var xData = [];
                var RUL = [];
                var rxData = [];
                var RULRate;
                var capacity;
                for (let i = 1; i < datas.length; i = i + 1) {
                    // console.log(datas[i].soc)
                    //SOC曲线数据
                    trueData.push(parseFloat(datas[i].soc));
                    //假的预测数据SOC
                    preData.push(parseFloat(datas[i].soc) + Math.random() * (50 + 50) - 50);
                    //SOC百分比数据
                    SOCData.push(parseFloat(datas[i].soc_) * 100);
                    //假的SOC预测数据
                    preSOC.push(parseFloat(datas[i].soc_) * 100);
                    //电流
                    current.push(parseFloat(datas[i].采样电流_mA));
                    //电压
                    voltage.push(parseFloat(datas[i].采样电压_mV));
                    //采样序号
                    stepIndex.push(parseFloat(datas[i].采样序号));
                    //x轴数据
                    xData.push(parseFloat(datas[i].循环数));
                    // 计算RUL曲线数据
                    if (datas[i].采样电流_mA == 51) {
                        RUL.push(datas[i].soc);
                        rxData.push(datas[i].循环数);
                    }
                    capacity = RUL[0]
                }
                //计算容量衰退比重
                for (let j = Math.floor(RUL.length / 3) - 1; j < RUL.length; j = j + Math.floor(RUL.length / 3)) {
                    console.log(j)
                    let k = 0;
                    consumption.push(RUL[k] - RUL[j]);
                    k = k + Math.floor(RUL.length / 3);
                    console.log(consumption)
                }
                //计算电池最终健康比
                RULRate = RUL[RUL.length - 1] / RUL[0];
                that.chartData.RULRate = RULRate;
                that.chartData.consumption = consumption;
                that.chartData.current = current;
                that.chartData.preData = preData;
                that.chartData.preSOCData = preSOC;
                that.chartData.RUL = RUL;
                that.chartData.RULRate = RULRate;
                that.chartData.trueSOCData = SOCData;
                that.chartData.voltage = voltage;
                that.chartData.rxData = rxData;
                that.chartData.xData = xData;
                that.chartData.trueData = trueData;
                that.chartData.stepIndex = stepIndex;
                that.chartData.capacity = capacity
            }

            var datas = []

            var file = this.selectedFile;
            //将数据分片处理
            console.log(file)
            var totalSize = file.size;
            var len = 5 * 1024 * 1024;
            var tota_temp = Math.ceil(totalSize / len);
            var start = 0;
            var end = start + len;
            var fileList = [];
            var lineNum = 0
            for (var index = 0; index < tota_temp; index++) {
                fileList[index] = file.slice(start, end);
                start = end;
                if (start + len < totalSize) {
                    end = start + len;
                } else {
                    end = totalSize
                }
            }

            var fileReader = new FileReader();
            fileReader.readAsText(fileList[0]);
            fileReader.onload = function (event) {
                var data = event.target.result;
                // console.log(data)
                var csvarry = data.split("\n");
                lineNum = csvarry.length + lineNum;
                headers = csvarry[0].split(",");
                console.log(headers)
                for (var i = 1; i < csvarry.length; i++) {
                    var data = {};
                    var temp = csvarry[i].split(",");
                    for (var j = 0; j < temp.length; j++) {
                        data[headers[j]] = temp[j];
                    }
                    datas.push(data);
                }
            };
            var a = 0
            fileReader.onloadend = function (e) {
                for (var i = 1; i < fileList.length; i++) {
                    var fileReader = new FileReader();
                    fileReader.readAsText(fileList[i]);
                    fileReader.onload = function (event) {
                        var data = event.target.result;
                        var csvarry = data.split("\n");
                        a = a + 1
                        lineNum = csvarry.length + lineNum
                        console.log(a)

                        for (var i = 0; i < csvarry.length; i++) {
                            var data = {};
                            var temp = csvarry[i].split(",");
                            for (var j = 0; j < temp.length; j++) {
                                data[headers[j]] = temp[j];
                            }
                            datas.push(data);
                        }
                    };
                    fileReader.onloadend = function (e) {
                        if (a == fileList.length - 1) {
                            var newdata = datas.sort(compareFunction('循环数'))
                            updateOption(newdata)
                            that.sendData()

                        }
                    }
                }
            }
        },

    }
}

let dataAnalyse = {
    template: '#dataAnalyse',
    props: {
        className: {
            type: String,
            default: 'chart'
        },
        health: {
            type: String,
            default: 'health'
        },
        consume: {
            type: String,
            default: 'consume'
        },
        width: {
            type: String,
            default: '400px'
        },
        height: {
            type: String,
            default: '400px'
        },
        rulRate: {
            type: Number,
            default: 0
        },
        capacity: {
            type: Number,
            default: 2000
        },
        consumption: {
            type: Array,
            default: () => {
                return [50, 45, 40]
            }
        }
    },
    data() {
        return {
            healthChart: null,
            consumptionChart: null,
            pieData: [{
                    name: '健康',
                    value: 1600
                },
                {
                    name: '受损',
                    value: 400
                }
            ],
            objData: null,
            conData: [{
                    name: '充放电60～90次',
                    value: 50
                },
                {
                    name: '充放电30～60次',
                    value: 45
                },
                {
                    name: '充放电0～30次',
                    value: 40
                }
            ],
            arrName: null,
            arrValue: null,
            sumValue: null,
            optionData: null,
            color: ['rgba(45,71,73,0.5)', 'rgba(42,69,95,0.5)', 'rgba(61,70,76,0.5)']
        }
    },
    mounted() {
        this.objData = this.array2obj(this.pieData, 'name');
        this.initData();
        this.initHealth();
        this.initConsumption();
    },
    beforeDestroy() {
        if (!this.chart) {
            return
        }
        this.chart.dispose()
        this.chart = null
    },
    methods: {
        getArrayValue(array, key) {
            var k = key || 'value'
            var res = []
            if (array) {
                array.forEach(function (t) {
                    console.log(t[k])
                    res.push(t[k])
                })
            }
            return res
        },
        array2obj(array, key) {
            var resObj = {}
            for (var i = 0; i < array.length; i++) {
                resObj[array[i][key]] = array[i]
            }
            return resObj
        },
        getData(data) {
            var res = {
                series: []
            }
            for (let i = 0; i < data.length; i++) {
                res.series.push({
                    name: '',
                    type: 'pie',
                    clockWise: true, // 顺时加载
                    hoverAnimation: false, // 鼠标移入变大
                    radius: [57 - i * 20 + '%', 40 - i * 20 + '%'],
                    center: ['30%', '50%'],
                    label: {
                        show: false
                    },
                    itemStyle: {
                        label: {
                            show: false
                        },
                        labelLine: {
                            show: false
                        },
                        borderWidth: 5
                    },
                    data: [{
                        value: data[i].value,
                        name: data[i].name
                    }, {
                        value: this.sumValue - data[i].value,
                        name: '',
                        itemStyle: {
                            color: this.color[i],
                            borderWidth: 0
                        },
                        tooltip: {
                            show: false
                        },
                        hoverAnimation: false
                    }]
                })
            }
            return res
        },
        initData() {
            this.conData[0].value = this.consumption[0]
            this.conData[1].value = this.consumption[1]
            this.conData[2].value = this.consumption[2]
            this.arrName = this.getArrayValue(this.conData, 'name')
            this.arrValue = this.getArrayValue(this.conData, 'value')
            // eslint-disable-next-line no-eval
            this.sumValue = eval(this.arrValue.join('+'))
            this.optionData = this.getData(this.conData)
        },
        initHealth() {
            this.healthChart = echarts.init(document.getElementById('health'), "default", {
                height: window.innerHeight / 2.5,
                width: window.innerWidth * 0.25
            });
            var _self = this;
            console.log(this.capacity)
            this.pieData[0].value = this.capacity * this.rulRate;
            this.pieData[1].value = this.capacity * (1 - this.rulRate);
            this.healthChart.setOption({
                backgroundColor: '#26374c',
                title: {
                    show: true,
                    text: '电量健康状况',
                    padding: 10,
                    x: 'center',
                    textStyle: { //主标题文本样式{"fontSize": 18,"fontWeight": "bolder","color": "#333"}
                        fontFamily: 'Arial',
                        fontSize: 20,
                        fontStyle: 'normal',
                        fontWeight: 'normal',
                        color: '#ffffff'
                    }
                },
                legend: {
                    show: true,
                    top: 'center',
                    left: '70%',
                    data: ['健康', '受损'],
                    itemWidth: 25,
                    itemHeight: 25,
                    width: 25,
                    padding: [0, 10],
                    itemGap: 100,
                    icon: 'circle',
                    formatter: function (name) {
                        console.log(_self.pieData)
                        return '{title|' + (_self.objData[name].value / _self.capacity * 100).toFixed(2) + '%}\n {value|' + name + '}'
                    },
                    textStyle: {
                        rich: {
                            title: {
                                fontSize: 24,
                                lineHeight: 18,
                                color: 'rgba(255,255,255,1)',
                                fontWeight: 'bold'
                            },
                            value: {
                                fontSize: 10,
                                lineHeight: 18,
                                color: 'rgba(255,255,255,1)'
                            }
                        }
                    }
                },
                series: [{
                    name: '第一个圆环',
                    type: 'pie',
                    clockWise: false,
                    radius: ['35%', '55%'],
                    itemStyle: {
                        normal: {
                            label: {
                                show: false
                            },
                            labelLine: {
                                show: false
                            },
                            shadowBlur: 0,
                            shadowColor: '#203665'
                        }
                    },
                    hoverAnimation: false,
                    center: ['30%', '50%'],
                    data: [{
                            name: '受损',
                            value: this.pieData[1].value,
                            label: {
                                normal: {
                                    rich: {
                                        a: {
                                            color: '#fff',
                                            align: 'center',
                                            fontSize: 25,
                                            fontWeight: 'bold'
                                        },
                                        b: {
                                            color: '#fff',
                                            align: 'center',
                                            fontSize: 10
                                        }
                                    },
                                    formatter: function (params) {
                                        console.log(params)
                                        return '{a|' + _self.capacity + 'mAh}\n\n' + '{b|电池总容量}'
                                    },
                                    position: 'center',
                                    show: true,
                                    textStyle: {
                                        fontSize: '14',
                                        fontWeight: 'normal',
                                        color: '#fff'
                                    }
                                }
                            },
                            itemStyle: {
                                normal: {
                                    color: '#1ca9e9',
                                    shadowColor: '#1ca9e9',
                                    shadowBlur: 0
                                }
                            }
                        },
                        {
                            value: this.pieData[0].value,
                            name: '健康',
                            itemStyle: {
                                normal: {
                                    color: '#4ed139'
                                },
                                emphasis: {
                                    color: '#4ed139'
                                }
                            }
                        }
                    ]
                }]
            })
        },
        initConsumption() {
            this.consumptionChart = echarts.init(document.getElementById('consume'), "default", {
                height: window.innerHeight / 2.5,
                width: (window.innerWidth - 16) * 0.25
            });

            this.consumptionChart.setOption({
                backgroundColor: '#26374c',
                legend: {
                    show: true,
                    top: 'center',
                    left: '60%',
                    data: this.arrName,
                    padding: [0, 5],
                    itemGap: 35,
                    icon: 'circle',
                    formatter: function (name) {
                        return '{title|' + name + '}'
                    },
                    textStyle: {
                        rich: {
                            title: {
                                fontSize: 15,
                                lineHeight: 18,
                                color: 'rgba(255,255,255,1)'
                            },
                            value: {
                                fontSize: 16,
                                lineHeight: 18,
                                color: 'rgba(255,255,255,1)'
                            }
                        }
                    }
                },
                tooltip: {
                    show: true,
                    trigger: 'item',
                    formatter: '{a}<br>{b}:{c}({d}%)'
                },
                color: ['#4ed139', '#289cf4', '#fdca57'],
                series: this.optionData.series,
                title: {
                    show: true,
                    text: '电量消耗占比',
                    padding: 10,
                    x: 'center',
                    textStyle: { //主标题文本样式{"fontSize": 18,"fontWeight": "bolder","color": "#333"}
                        fontFamily: 'Arial',
                        fontSize: 20,
                        fontStyle: 'normal',
                        fontWeight: 'normal',
                        color: '#ffffff'
                    }
                }
            })
        }
    }
}

let dataForecast = {
    template: '#dataForecast',
    data: function () {
        return {
            RUL: 100,
            SOC: 100,
            PreRUL: 100,
            chart: null
        }
    },
    props: {
        className: {
            type: String,
            default: 'chart'
        },
        rulChart: {
            type: String,
            default: 'rulChart'
        },
        socChart: {
            type: String,
            default: 'socChart'
        },
        width: {
            type: String,
            default: '1000px'
        },
        height: {
            type: String,
            default: '400px'
        },
        rxData: {
            default: () => {
                return ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97']
            }
        },
        rul: {
            default: () => {
                return ['2576.17', '2569.47', '2569.8', '2574.51', '2574.12', '2569.48', '2586.27', '2573.61', '2568.23', '2571.67', '2560.82', '2576.4', '2569.05', '2577.05', '2569.81', '2571.33', '2566.16', '2560.69', '2557.4', '2565.0', '2556.33', '2567.97', '2566.12', '2513.05', '2608.15', '2557.58', '2561.63', '2588.43', '2611.63', '2548.93', '2552.74', '2562.73', '2568.08', '2602.03', '2558.76', '2556.65', '2559.19', '2564.13', '2554.86', '2570.2', '2557.28', '2562.91', '2558.13', '2551.85', '2562.58', '2556.16', '2558.86', '2556.16', '2532.91', '2565.94', '2559.35', '2559.32', '2550.37', '2558.13', '2557.55', '2554.38', '2554.44', '2557.42', '2553.23', '2554.44', '2554.71', '2556.87', '2577.34', '2558.17', '2576.07', '2572.93', '2561.69', '2567.21', '2558.01', '2558.62', '2555.7', '2562.75', '2549.86', '2564.15', '2565.65', '2556.56', '2561.85', '2555.78', '2551.91', '2552.08', '2566.64', '2556.51', '2551.53', '2552.2', '2559.92', '2558.86', '2571.14', '2559.65', '2557.93', '2553.52', '2556.23', '2563.38', '2549.91', '2553.17', '2565.64']
            }
        },
        preRUL: {},
        preData: {
            default: () => {
                return ['2367', '2200', '2100', '2367', '2200', '2100']
            }
        },
        trueData: {
            default: () => {
                return ['2367', '2200', '2100', '2367', '2200', '2100']
            }
        },
        truesocData: {
            default: () => {
                return ['100', '99', '98', '100', '99', '98']
            }
        },
        presocData: {
            default: () => {
                return ['100', '99', '98', '100', '99', '98']
            }
        },
        xData: {
            default: () => {
                return ['1', '2', '3', '4', '5', '6']
            }
        }
    },
    mounted() {
        this.initCycle()
        this.initRUL()
        this.initSOC()
    },
    beforeDestroy() {
        if (!this.chart) {
            return
        }
        this.chart.dispose()
        this.chart = null
    },
    methods: {
        sendData: function (index) {
            this.$emit('locate', index)
        },
        initCycle() {
            this.chart = echarts.init(document.getElementById("cycle"), "default", {
                height: window.innerHeight / 4,
                width: window.innerWidth * 0.5
            });
            this.chart.setOption({
                backgroundColor: 'rgba(50,69,99,1)',
                series: [{
                        name: '第一个圆环',
                        type: 'pie',
                        clockWise: false,
                        radius: ['60%', '80%'],
                        itemStyle: {
                            normal: {
                                label: {
                                    show: false
                                },
                                labelLine: {
                                    show: false
                                },
                                shadowBlur: 0,
                                shadowColor: '#203665'
                            }
                        },
                        hoverAnimation: false,
                        center: ['15%', '50%'],
                        data: [{
                            value: this.SOC,
                            label: {
                                normal: {
                                    rich: {
                                        a: {
                                            color: '#fff',
                                            align: 'center',
                                            fontSize: 35,
                                            fontWeight: 'bold'
                                        },
                                        b: {
                                            color: '#fff',
                                            align: 'center',
                                            fontSize: 10
                                        }
                                    },
                                    formatter: function (params) {
                                        return '{b|剩余电量}\n\n' + '{a|' + params.value + '%}'
                                    },
                                    position: 'center',
                                    show: true,
                                    textStyle: {
                                        fontSize: '14',
                                        fontWeight: 'normal',
                                        color: '#fff'
                                    }
                                }
                            },
                            itemStyle: {
                                normal: {
                                    color: '#1ca9e9',
                                    shadowColor: '#1ca9e9',
                                    shadowBlur: 0
                                }
                            }
                        }, {
                            value: 100 - this.SOC,
                            name: 'invisible',
                            itemStyle: {
                                normal: {
                                    color: '#263a53'
                                },
                                emphasis: {
                                    color: '#263a53'
                                }
                            }
                        }]
                    },
                    {
                        name: '第二个圆环',
                        type: 'pie',
                        clockWise: false,
                        radius: ['60%', '80%'],
                        itemStyle: {
                            normal: {
                                label: {
                                    show: false
                                },
                                labelLine: {
                                    show: false
                                },
                                shadowBlur: 0,
                                shadowColor: '#203665'
                            }
                        },
                        hoverAnimation: false,
                        center: ['50%', '50%'],
                        data: [{
                            value: this.RUL,
                            label: {
                                normal: {
                                    rich: {
                                        a: {
                                            color: '#fff',
                                            align: 'center',
                                            fontSize: 35,
                                            fontWeight: 'bold'
                                        },
                                        b: {
                                            color: '#fff',
                                            align: 'center',
                                            fontSize: 10
                                        }
                                    },
                                    formatter: function (params) {
                                        return '{b|剩余寿命}\n\n' + '{a|' + params.value + '%}'
                                    },
                                    position: 'center',
                                    show: true,
                                    textStyle: {
                                        fontSize: '14',
                                        fontWeight: 'normal',
                                        color: '#fff'
                                    }
                                }
                            },
                            itemStyle: {
                                normal: {
                                    color: '#6658cb',
                                    shadowColor: '#6658cb',
                                    shadowBlur: 0
                                }
                            }
                        }, {
                            value: 100 - this.RUL,
                            name: 'invisible',
                            itemStyle: {
                                normal: {
                                    color: '#263a53'
                                },
                                emphasis: {
                                    color: '#263a53'
                                }
                            }
                        }]
                    },
                    {
                        name: '第三个圆环',
                        type: 'pie',
                        clockWise: false,
                        radius: ['60%', '80%'],
                        itemStyle: {
                            normal: {
                                label: {
                                    show: false
                                },
                                labelLine: {
                                    show: false
                                },
                                shadowBlur: 0,
                                shadowColor: '#203665'
                            }
                        },
                        hoverAnimation: false,
                        center: ['85%', '50%'],
                        data: [{
                            value: this.PreRUL,
                            label: {
                                normal: {
                                    rich: {
                                        a: {
                                            color: '#fff',
                                            align: 'center',
                                            fontSize: 35,
                                            fontWeight: 'bold'
                                        },
                                        b: {
                                            color: '#fff',
                                            align: 'center',
                                            fontSize: 10
                                        }
                                    },
                                    formatter: function (params) {
                                        return '{b|预计寿命}\n\n' + '{a|' + params.value + '%}'
                                    },
                                    position: 'center',
                                    show: true,
                                    textStyle: {
                                        fontSize: '14',
                                        fontWeight: 'normal',
                                        color: '#fff'
                                    }
                                }
                            },
                            itemStyle: {
                                normal: {
                                    color: '#26c1c9',
                                    shadowColor: '#26c1c9',
                                    shadowBlur: 0
                                }
                            }
                        }, {
                            value: 100 - this.PreRUL,
                            name: 'invisible',
                            itemStyle: {
                                normal: {
                                    color: '#263a53'
                                },
                                emphasis: {
                                    color: '#263a53'
                                }
                            }
                        }]
                    }
                ]
            })
        },
        initRUL() {
            console.log(this.rxData)
            this.chart = echarts.init(document.getElementById(this.rulChart), "default", {
                height: window.innerHeight / 4,
                width: window.innerWidth * 0.5
            });

            this.chart.setOption({
                backgroundColor: 'rgba(50,69,99,1)',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        animation: true,
                        type: 'cross',
                        lineStyle: {
                            color: '#376df4',
                            width: 2,
                            opacity: 1
                        }
                    }
                },
                xAxis: [{
                    show: false,
                    name: '循环周期',
                    type: 'category',
                    data: this.rxData,
                    axisLine: {
                        lineStyle: {
                            color: '#ffffff'
                        }
                    }
                }],
                yAxis: [{
                    name: 'RUL',
                    gridIndex: 0,
                    scale: true,
                    type: 'value',
                    axisLine: {
                        lineStyle: {
                            color: '#ffffff'
                        }
                    },
                    splitLine: {
                        show: false
                    }
                }],
                dataZoom: [{
                    xAxisIndex: [0],
                    textStyle: {
                        color: '#8392A5'
                    },
                    handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                    handleSize: '80%',
                    dataBackground: {
                        areaStyle: {
                            color: '#8392A5'
                        },
                        lineStyle: {
                            opacity: 0.8,
                            color: '#8392A5'
                        }
                    },
                    handleStyle: {
                        color: '#fff',
                        shadowBlur: 3,
                        shadowColor: 'rgba(0, 0, 0, 0.6)',
                        shadowOffsetX: 2,
                        shadowOffsetY: 2
                    },
                    start: 0,
                    end: 10
                }, {
                    type: 'inside'
                }],
                animation: true,
                series: [{
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    type: 'line',
                    name: 'RUL',
                    data: this.rul,
                    smooth: true,
                    itemStyle: {
                        normal: {
                            color: '#4e83fd',
                            color0: '#0CF49B',
                            borderColor: '#4b96fd',
                            borderColor0: '#0CF49B'
                        }
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgb(64,59,255)'
                        }, {
                            offset: 1,
                            color: 'rgb(26,10,31)'
                        }])
                    }
                }]
            })
        },
        initSOC() {
            that = this
            console.log(this.trueSOCData)
            this.chart = echarts.init(document.getElementById(this.socChart), "default", {
                height: window.innerHeight / 3,
                width: window.innerWidth * 0.5
            });
            this.chart.on(
                'click',
                function (param) {
                    that.sendData(param.dataIndex)
                }
            )
            this.chart.setOption({
                title: [{
                    left: 'center',
                    textStyle: {
                        color: '#fff',
                        fontSize: 14

                    }
                }, {
                    top: '27%',
                    left: 'center',
                    textStyle: {
                        color: '#fff',
                        fontSize: 14
                    }
                }],
                backgroundColor: 'rgba(50,69,99,1)',
                legend: [{
                        top: '3%',
                        data: ['真实容量', '预测容量'],
                        inactiveColor: '#777',
                        textStyle: {
                            color: '#fff',
                            fontSize: 14
                        }
                    },
                    {
                        top: '56%',
                        data: ['SOC%真实值', 'SOC%预测值'],
                        inactiveColor: '#777',
                        textStyle: {
                            color: '#fff',
                            fontSize: 14
                        }
                    }
                ],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        animation: true,
                        type: 'cross',
                        lineStyle: {
                            color: '#376df4',
                            width: 2,
                            opacity: 1
                        }
                    }
                },
                xAxis: [{
                        show: false,
                        name: '循环周期',
                        type: 'category',
                        data: this.xData,
                        axisLine: {
                            lineStyle: {
                                color: '#ffffff'
                            }
                        }
                    },
                    {
                        // show:false,
                        name: '循环周期',
                        gridIndex: 1,
                        type: 'category',
                        data: this.xData,
                        axisLine: {
                            lineStyle: {
                                color: '#ffffff'
                            }
                        }
                    }
                ],
                yAxis: [{
                        name: '容量_mAh',
                        gridIndex: 0,
                        scale: true,
                        type: 'value',
                        axisLine: {
                            lineStyle: {
                                color: 'rgba(255,255,255,1)'
                            }
                        },
                        splitLine: {
                            show: false
                        }
                    },
                    {
                        name: '百分比',
                        gridIndex: 1,
                        scale: true,
                        type: 'value',
                        axisLine: {
                            lineStyle: {
                                color: '#ffffff'
                            }
                        },
                        splitLine: {
                            show: false
                        }
                    }
                ],
                grid: [{
                        x: '10%',
                        y: '10%',
                        width: '80%',
                        height: '30%'
                    },
                    {
                        x: '10%',
                        y: '55%',
                        width: '80%',
                        height: '30%'
                    }
                ],
                dataZoom: [{
                    xAxisIndex: [0, 1],
                    textStyle: {
                        color: '#8392A5'
                    },
                    handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                    handleSize: '80%',
                    dataBackground: {
                        areaStyle: {
                            color: '#8392A5'
                        },
                        lineStyle: {
                            opacity: 0.8,
                            color: '#8392A5'
                        }
                    },
                    handleStyle: {
                        color: '#fff',
                        shadowBlur: 3,
                        shadowColor: 'rgba(0, 0, 0, 0.6)',
                        shadowOffsetX: 2,
                        shadowOffsetY: 2
                    },
                    start: 0,
                    end: 10
                }, {
                    type: 'inside'
                }],
                animation: true,
                series: [{
                        xAxisIndex: 0,
                        yAxisIndex: 0,
                        type: 'line',
                        name: '预测容量',
                        data: this.preData,
                        smooth: true,
                        lineStyle: {
                            color: 'rgb(74,247,247)'
                        },
                        itemStyle: {
                            normal: {
                                color: 'rgb(74,247,247)',
                                color0: '#00ff00',
                                borderColor: '#808080',
                                borderColor0: '#00ff00'
                            }
                        }
                    },
                    {
                        xAxisIndex: 0,
                        yAxisIndex: 0,
                        name: '真实容量',
                        type: 'line',
                        data: this.trueData,
                        smooth: true,
                        showSymbol: false,
                        lineStyle: {
                            color: 'rgb(64,59,255)'
                        },
                        itemStyle: {
                            normal: {
                                color: 'rgb(64,59,255)',
                                color0: '#0CF49B',
                                borderColor: '#fd4955',
                                borderColor0: '#0CF49B'
                            }
                        },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: 'rgb(64,59,255)'
                            }, {
                                offset: 1,
                                color: 'rgb(26,10,31)'
                            }])
                        }
                        // markLine: {
                        //     data: [{name: 'RUL', yAxis: 1.35, symbol: 'circle'}]
                        // }
                    },
                    {
                        xAxisIndex: 1,
                        yAxisIndex: 1,
                        type: 'line',
                        name: 'SOC%真实值',
                        data: this.truesocData,
                        smooth: true
                    },
                    {
                        xAxisIndex: 1,
                        yAxisIndex: 1,
                        type: 'line',
                        name: 'SOC%预测值',
                        data: this.presocData,
                        smooth: true,
                        itemStyle: {
                            normal: {
                                color: '#4e83fd',
                                color0: '#0CF49B',
                                borderColor: '#4b96fd',
                                borderColor0: '#0CF49B'
                            }
                        },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: 'rgb(64,59,255)'
                            }, {
                                offset: 1,
                                color: 'rgb(26,10,31)'
                            }])
                        }
                    }
                ]
            })
        }
    }
}

let single = {
    template: '#currentBatteryTemp',
    data() {
        return {
            animationData: {
                "v": "5.5.9",
                "fr": 29.9700012207031,
                "ip": 0,
                "op": 60.0000024438501,
                "w": 1920,
                "h": 1080,
                "nm": "single",
                "ddd": 0,
                "assets": [{
                    "id": "image_0",
                    "w": 842,
                    "h": 596,
                    "u": "single/",
                    "p": "img_0.png",
                    "e": 0
                }, {
                    "id": "image_1",
                    "w": 842,
                    "h": 596,
                    "u": "single/",
                    "p": "img_1.png",
                    "e": 0
                }, {
                    "id": "image_2",
                    "w": 842,
                    "h": 596,
                    "u": "single/",
                    "p": "img_2.png",
                    "e": 0
                }, {
                    "id": "image_3",
                    "w": 842,
                    "h": 596,
                    "u": "single/",
                    "p": "img_3.png",
                    "e": 0
                }, {
                    "id": "image_4",
                    "w": 842,
                    "h": 596,
                    "u": "single/",
                    "p": "img_4.png",
                    "e": 0
                }, {
                    "id": "comp_0",
                    "layers": [{
                        "ddd": 0,
                        "ind": 2,
                        "ty": 0,
                        "nm": "Comp 3",
                        "refId": "comp_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [963, 497, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [960, 540, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [28.889, 28.889, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "w": 1920,
                        "h": 1080,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 3,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [922, 604, 0],
                                    "to": [-51.833, -156, 0],
                                    "ti": [48.833, 124, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [977, 310, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [4.996, 4.996, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 52.0000021180034,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 4,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [1200, 601, 0],
                                    "to": [179.5, -158.833, 0],
                                    "ti": [-183.5, 148.833, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [1353, 236, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [9.524, 9.524, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 39.0000015885026,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 5,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [731, 515, 0],
                                    "to": [-100.333, -36.5, 0],
                                    "ti": [133.333, 14.5, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [573, 284, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [3.571, 3.571, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 57.0000023216576,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 6,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [737, 634, 0],
                                    "to": [146.333, -204.833, 0],
                                    "ti": [-152.333, 138.833, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [829, 221, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [5.234, 5.234, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 50.0000020365418,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 7,
                        "ty": 2,
                        "nm": "遮罩.ai",
                        "cl": "ai",
                        "td": 1,
                        "refId": "image_2",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [1028, 540, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [724.139, 107.843, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "hasMask": true,
                        "masksProperties": [{
                            "inv": false,
                            "mode": "a",
                            "pt": {
                                "a": 0,
                                "k": {
                                    "i": [
                                        [0, 0],
                                        [-2.732, -4],
                                        [-2.049, -4],
                                        [-5.463, -2],
                                        [0.683, 14]
                                    ],
                                    "o": [
                                        [0, 0],
                                        [2.732, 4],
                                        [2.049, 4],
                                        [5.463, 2],
                                        [-0.683, -14]
                                    ],
                                    "v": [
                                        [463.339, 94],
                                        [349.297, 118],
                                        [352.028, 504],
                                        [463.339, 506],
                                        [482.46, 310]
                                    ],
                                    "c": true
                                },
                                "ix": 1
                            },
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 3
                            },
                            "x": {
                                "a": 0,
                                "k": 0,
                                "ix": 4
                            },
                            "nm": "Mask 1"
                        }],
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 8,
                        "ty": 0,
                        "nm": "wave1",
                        "tt": 1,
                        "refId": "comp_2",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [1550, 310, 0],
                                    "to": [-140.333, 0, 0],
                                    "ti": [140.333, 0, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [708, 310, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [960, 540, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "w": 1920,
                        "h": 1080,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 9,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [1008, 541, 0],
                                    "to": [5.747, -18.038, 0],
                                    "ti": [12.164, 81.494, 0]
                                }, {
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 31.75,
                                    "s": [1042.979, 431.221, 0],
                                    "to": [-9.832, -65.876, 0],
                                    "ti": [-5.086, 15.962, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [1073, 337, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [4.046, 4.046, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 10,
                        "ty": 2,
                        "nm": "遮罩.ai",
                        "cl": "ai",
                        "td": 1,
                        "refId": "image_2",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [1028, 540, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [724.139, 107.843, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "hasMask": true,
                        "masksProperties": [{
                            "inv": false,
                            "mode": "a",
                            "pt": {
                                "a": 0,
                                "k": {
                                    "i": [
                                        [0, 0],
                                        [-2.732, -4],
                                        [-2.049, -4],
                                        [-5.463, -2],
                                        [0.683, 14]
                                    ],
                                    "o": [
                                        [0, 0],
                                        [2.732, 4],
                                        [2.049, 4],
                                        [5.463, 2],
                                        [-0.683, -14]
                                    ],
                                    "v": [
                                        [463.339, 94],
                                        [349.297, 118],
                                        [352.028, 504],
                                        [463.339, 506],
                                        [482.46, 310]
                                    ],
                                    "c": true
                                },
                                "ix": 1
                            },
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 3
                            },
                            "x": {
                                "a": 0,
                                "k": 0,
                                "ix": 4
                            },
                            "nm": "Mask 1"
                        }],
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 11,
                        "ty": 0,
                        "nm": "wave2",
                        "tt": 1,
                        "refId": "comp_3",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [454, 306, 0],
                                    "to": [174.833, 0, 0],
                                    "ti": [-174.833, 0, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [1503, 306, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [960, 540, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "w": 1920,
                        "h": 1080,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }]
                }, {
                    "id": "comp_1",
                    "layers": [{
                        "ddd": 0,
                        "ind": 1,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": -6,
                                    "s": [938, 1006, 0],
                                    "to": [100.667, -172.667, 0],
                                    "ti": [-110.667, 196.667, 0]
                                }, {
                                    "t": 53.0000021587343,
                                    "s": [966, 534, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": [0.833, 0.833, 0.833],
                                        "y": [0.833, 0.833, 0.833]
                                    },
                                    "o": {
                                        "x": [0.167, 0.167, 0.167],
                                        "y": [0.167, 0.167, 0.167]
                                    },
                                    "t": -6,
                                    "s": [0, 0, 100]
                                }, {
                                    "t": 53.0000021587343,
                                    "s": [36.43, 36.43, 100]
                                }],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 4.00000016292334,
                        "op": 54.0000021994651,
                        "st": -6.00000024438501,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 2,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": -9,
                                    "s": [1384, 1012, 0],
                                    "to": [90.667, -277, 0],
                                    "ti": [-106.667, 269, 0]
                                }, {
                                    "t": 50.0000020365418,
                                    "s": [1388, 406, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": [0.833, 0.833, 0.833],
                                        "y": [0.833, 0.833, 0.833]
                                    },
                                    "o": {
                                        "x": [0.167, 0.167, 0.167],
                                        "y": [0.167, 0.167, 0.167]
                                    },
                                    "t": -9,
                                    "s": [0, 0, 100]
                                }, {
                                    "t": 50.0000020365418,
                                    "s": [41.43, 41.43, 100]
                                }],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 16.0000006516934,
                        "op": 51.0000020772726,
                        "st": -9.00000036657752,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 3,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": -11,
                                    "s": [466, 988, 0],
                                    "to": [5.333, -28.667, 0],
                                    "ti": [-59.333, 124.667, 0]
                                }, {
                                    "t": 48.0000019550801,
                                    "s": [498, 816, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": [0.833, 0.833, 0.833],
                                        "y": [0.833, 0.833, 0.833]
                                    },
                                    "o": {
                                        "x": [0.167, 0.167, 0.167],
                                        "y": [0.167, 0.167, 0.167]
                                    },
                                    "t": -11,
                                    "s": [0, 0, 100]
                                }, {
                                    "t": 48.0000019550801,
                                    "s": [40.43, 40.43, 100]
                                }],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 9.00000036657752,
                        "op": 52.0000021180034,
                        "st": -11.0000004480392,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 4,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": -10,
                                    "s": [1742, 1018, 0],
                                    "to": [28.667, -166.667, 0],
                                    "ti": [-40.667, 174.667, 0]
                                }, {
                                    "t": 49.0000019958109,
                                    "s": [1662, 714, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": [0.833, 0.833, 0.833],
                                        "y": [0.833, 0.833, 0.833]
                                    },
                                    "o": {
                                        "x": [0.167, 0.167, 0.167],
                                        "y": [0.167, 0.167, 0.167]
                                    },
                                    "t": -10,
                                    "s": [0, 0, 100]
                                }, {
                                    "t": 49.0000019958109,
                                    "s": [36.43, 36.43, 100]
                                }],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 5.00000020365417,
                        "op": 58.0000023623884,
                        "st": -10.0000004073083,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 5,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [148, 1004, 0],
                                    "to": [-26.667, -244, 0],
                                    "ti": [30.667, 316, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [228, 512, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": [0.833, 0.833, 0.833],
                                        "y": [0.833, 0.833, 0.833]
                                    },
                                    "o": {
                                        "x": [0.167, 0.167, 0.167],
                                        "y": [0.167, 0.167, 0.167]
                                    },
                                    "t": 0,
                                    "s": [0, 0, 100]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [34.43, 34.43, 100]
                                }],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 1.00000004073083,
                        "op": 56.0000022809268,
                        "st": 0,
                        "bm": 0
                    }]
                }, {
                    "id": "comp_2",
                    "layers": [{
                        "ddd": 0,
                        "ind": 1,
                        "ty": 2,
                        "nm": "波浪1.ai",
                        "cl": "ai",
                        "refId": "image_3",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [1068, 832, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 2,
                        "ty": 2,
                        "nm": "波浪1.ai",
                        "cl": "ai",
                        "refId": "image_3",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [1778, 834, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 3,
                        "ty": 2,
                        "nm": "波浪1.ai",
                        "cl": "ai",
                        "refId": "image_3",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [364, 830, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }]
                }, {
                    "id": "comp_3",
                    "layers": [{
                        "ddd": 0,
                        "ind": 1,
                        "ty": 2,
                        "nm": "波浪2.ai",
                        "cl": "ai",
                        "refId": "image_4",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [392, 804, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 2,
                        "ty": 2,
                        "nm": "波浪2.ai",
                        "cl": "ai",
                        "refId": "image_4",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [1814, 810, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 3,
                        "ty": 2,
                        "nm": "波浪2.ai",
                        "cl": "ai",
                        "refId": "image_4",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [1096, 806, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }]
                }],
                "layers": [{
                    "ddd": 0,
                    "ind": 1,
                    "ty": 2,
                    "nm": "single.ai",
                    "cl": "ai",
                    "refId": "image_0",
                    "sr": 1,
                    "ks": {
                        "o": {
                            "a": 0,
                            "k": 100,
                            "ix": 11
                        },
                        "r": {
                            "a": 0,
                            "k": 0,
                            "ix": 10
                        },
                        "p": {
                            "a": 0,
                            "k": [968, 544, 0],
                            "ix": 2
                        },
                        "a": {
                            "a": 0,
                            "k": [421, 298, 0],
                            "ix": 1
                        },
                        "s": {
                            "a": 0,
                            "k": [201.455, 201.455, 100],
                            "ix": 6
                        }
                    },
                    "ao": 0,
                    "ip": 0,
                    "op": 60.0000024438501,
                    "st": 0,
                    "bm": 0
                }, {
                    "ddd": 0,
                    "ind": 2,
                    "ty": 0,
                    "nm": "Comp 1",
                    "refId": "comp_0",
                    "sr": 1,
                    "ks": {
                        "o": {
                            "a": 0,
                            "k": 100,
                            "ix": 11
                        },
                        "r": {
                            "a": 0,
                            "k": 0,
                            "ix": 10
                        },
                        "p": {
                            "a": 0,
                            "k": [968, 545, 0],
                            "ix": 2
                        },
                        "a": {
                            "a": 0,
                            "k": [960, 540, 0],
                            "ix": 1
                        },
                        "s": {
                            "a": 0,
                            "k": [104.375, 104.375, 100],
                            "ix": 6
                        }
                    },
                    "ao": 0,
                    "w": 1920,
                    "h": 1080,
                    "ip": 0,
                    "op": 60.0000024438501,
                    "st": 0,
                    "bm": 0
                }],
                "markers": []
            }
        }
    },
    mounted() {
        lottie.loadAnimation({
            container: document.getElementById('currentBattery'),
            renderer: 'svg',
            loop: true,
            autoplay: true,
            // path: pathData, //如果没有图片做动效,全是设计师用画的矢量图形
            animationData: this.animationData //如果有图片做动效,二者填其一即可
        })
    },
}

let double_1 = {
    template: '#currentBatteryTemp',
    data() {
        return {
            animationData: {
                "v": "5.5.9",
                "fr": 29.9700012207031,
                "ip": 0,
                "op": 60.0000024438501,
                "w": 1920,
                "h": 1080,
                "nm": "single",
                "ddd": 0,
                "assets": [{
                    "id": "image_0",
                    "w": 842,
                    "h": 596,
                    "u": "double_1/",
                    "p": "img_0.png",
                    "e": 0
                }, {
                    "id": "image_1",
                    "w": 842,
                    "h": 596,
                    "u": "double_1/",
                    "p": "img_1.png",
                    "e": 0
                }, {
                    "id": "image_2",
                    "w": 842,
                    "h": 596,
                    "u": "double_1/",
                    "p": "img_2.png",
                    "e": 0
                }, {
                    "id": "image_3",
                    "w": 842,
                    "h": 596,
                    "u": "double_1/",
                    "p": "img_3.png",
                    "e": 0
                }, {
                    "id": "image_4",
                    "w": 842,
                    "h": 596,
                    "u": "double_1/",
                    "p": "img_4.png",
                    "e": 0
                }, {
                    "id": "comp_0",
                    "layers": [{
                        "ddd": 0,
                        "ind": 2,
                        "ty": 0,
                        "nm": "Comp 3",
                        "refId": "comp_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [963, 497, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [960, 540, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [28.889, 28.889, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "w": 1920,
                        "h": 1080,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 3,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [922, 604, 0],
                                    "to": [-51.833, -156, 0],
                                    "ti": [48.833, 124, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [977, 310, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [4.996, 4.996, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 52.0000021180034,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 4,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [1200, 601, 0],
                                    "to": [179.5, -158.833, 0],
                                    "ti": [-183.5, 148.833, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [1353, 236, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [9.524, 9.524, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 39.0000015885026,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 5,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [731, 515, 0],
                                    "to": [-100.333, -36.5, 0],
                                    "ti": [133.333, 14.5, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [573, 284, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [3.571, 3.571, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 57.0000023216576,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 6,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [737, 634, 0],
                                    "to": [146.333, -204.833, 0],
                                    "ti": [-152.333, 138.833, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [829, 221, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [5.234, 5.234, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 50.0000020365418,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 7,
                        "ty": 2,
                        "nm": "遮罩.ai",
                        "cl": "ai",
                        "td": 1,
                        "refId": "image_2",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [1028, 540, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [724.139, 107.843, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "hasMask": true,
                        "masksProperties": [{
                            "inv": false,
                            "mode": "a",
                            "pt": {
                                "a": 0,
                                "k": {
                                    "i": [
                                        [0, 0],
                                        [-2.732, -4],
                                        [-2.049, -4],
                                        [-5.463, -2],
                                        [0.683, 14]
                                    ],
                                    "o": [
                                        [0, 0],
                                        [2.732, 4],
                                        [2.049, 4],
                                        [5.463, 2],
                                        [-0.683, -14]
                                    ],
                                    "v": [
                                        [463.339, 94],
                                        [349.297, 118],
                                        [352.028, 504],
                                        [463.339, 506],
                                        [482.46, 310]
                                    ],
                                    "c": true
                                },
                                "ix": 1
                            },
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 3
                            },
                            "x": {
                                "a": 0,
                                "k": 0,
                                "ix": 4
                            },
                            "nm": "Mask 1"
                        }],
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 8,
                        "ty": 0,
                        "nm": "wave1",
                        "tt": 1,
                        "refId": "comp_2",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [1550, 310, 0],
                                    "to": [-140.333, 0, 0],
                                    "ti": [140.333, 0, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [708, 310, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [960, 540, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "w": 1920,
                        "h": 1080,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 9,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [1008, 541, 0],
                                    "to": [5.747, -18.038, 0],
                                    "ti": [12.164, 81.494, 0]
                                }, {
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 31.75,
                                    "s": [1042.979, 431.221, 0],
                                    "to": [-9.832, -65.876, 0],
                                    "ti": [-5.086, 15.962, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [1073, 337, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [4.046, 4.046, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 10,
                        "ty": 2,
                        "nm": "遮罩.ai",
                        "cl": "ai",
                        "td": 1,
                        "refId": "image_2",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [1028, 540, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [724.139, 107.843, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "hasMask": true,
                        "masksProperties": [{
                            "inv": false,
                            "mode": "a",
                            "pt": {
                                "a": 0,
                                "k": {
                                    "i": [
                                        [0, 0],
                                        [-2.732, -4],
                                        [-2.049, -4],
                                        [-5.463, -2],
                                        [0.683, 14]
                                    ],
                                    "o": [
                                        [0, 0],
                                        [2.732, 4],
                                        [2.049, 4],
                                        [5.463, 2],
                                        [-0.683, -14]
                                    ],
                                    "v": [
                                        [463.339, 94],
                                        [349.297, 118],
                                        [352.028, 504],
                                        [463.339, 506],
                                        [482.46, 310]
                                    ],
                                    "c": true
                                },
                                "ix": 1
                            },
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 3
                            },
                            "x": {
                                "a": 0,
                                "k": 0,
                                "ix": 4
                            },
                            "nm": "Mask 1"
                        }],
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 11,
                        "ty": 0,
                        "nm": "wave2",
                        "tt": 1,
                        "refId": "comp_3",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [454, 306, 0],
                                    "to": [174.833, 0, 0],
                                    "ti": [-174.833, 0, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [1503, 306, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [960, 540, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "w": 1920,
                        "h": 1080,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }]
                }, {
                    "id": "comp_1",
                    "layers": [{
                        "ddd": 0,
                        "ind": 1,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": -6,
                                    "s": [938, 1006, 0],
                                    "to": [100.667, -172.667, 0],
                                    "ti": [-110.667, 196.667, 0]
                                }, {
                                    "t": 53.0000021587343,
                                    "s": [966, 534, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": [0.833, 0.833, 0.833],
                                        "y": [0.833, 0.833, 0.833]
                                    },
                                    "o": {
                                        "x": [0.167, 0.167, 0.167],
                                        "y": [0.167, 0.167, 0.167]
                                    },
                                    "t": -6,
                                    "s": [0, 0, 100]
                                }, {
                                    "t": 53.0000021587343,
                                    "s": [36.43, 36.43, 100]
                                }],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 4.00000016292334,
                        "op": 54.0000021994651,
                        "st": -6.00000024438501,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 2,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": -9,
                                    "s": [1384, 1012, 0],
                                    "to": [90.667, -277, 0],
                                    "ti": [-106.667, 269, 0]
                                }, {
                                    "t": 50.0000020365418,
                                    "s": [1388, 406, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": [0.833, 0.833, 0.833],
                                        "y": [0.833, 0.833, 0.833]
                                    },
                                    "o": {
                                        "x": [0.167, 0.167, 0.167],
                                        "y": [0.167, 0.167, 0.167]
                                    },
                                    "t": -9,
                                    "s": [0, 0, 100]
                                }, {
                                    "t": 50.0000020365418,
                                    "s": [41.43, 41.43, 100]
                                }],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 16.0000006516934,
                        "op": 51.0000020772726,
                        "st": -9.00000036657752,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 3,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": -11,
                                    "s": [466, 988, 0],
                                    "to": [5.333, -28.667, 0],
                                    "ti": [-59.333, 124.667, 0]
                                }, {
                                    "t": 48.0000019550801,
                                    "s": [498, 816, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": [0.833, 0.833, 0.833],
                                        "y": [0.833, 0.833, 0.833]
                                    },
                                    "o": {
                                        "x": [0.167, 0.167, 0.167],
                                        "y": [0.167, 0.167, 0.167]
                                    },
                                    "t": -11,
                                    "s": [0, 0, 100]
                                }, {
                                    "t": 48.0000019550801,
                                    "s": [40.43, 40.43, 100]
                                }],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 9.00000036657752,
                        "op": 52.0000021180034,
                        "st": -11.0000004480392,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 4,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": -10,
                                    "s": [1742, 1018, 0],
                                    "to": [28.667, -166.667, 0],
                                    "ti": [-40.667, 174.667, 0]
                                }, {
                                    "t": 49.0000019958109,
                                    "s": [1662, 714, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": [0.833, 0.833, 0.833],
                                        "y": [0.833, 0.833, 0.833]
                                    },
                                    "o": {
                                        "x": [0.167, 0.167, 0.167],
                                        "y": [0.167, 0.167, 0.167]
                                    },
                                    "t": -10,
                                    "s": [0, 0, 100]
                                }, {
                                    "t": 49.0000019958109,
                                    "s": [36.43, 36.43, 100]
                                }],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 5.00000020365417,
                        "op": 58.0000023623884,
                        "st": -10.0000004073083,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 5,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [148, 1004, 0],
                                    "to": [-26.667, -244, 0],
                                    "ti": [30.667, 316, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [228, 512, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": [0.833, 0.833, 0.833],
                                        "y": [0.833, 0.833, 0.833]
                                    },
                                    "o": {
                                        "x": [0.167, 0.167, 0.167],
                                        "y": [0.167, 0.167, 0.167]
                                    },
                                    "t": 0,
                                    "s": [0, 0, 100]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [34.43, 34.43, 100]
                                }],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 1.00000004073083,
                        "op": 56.0000022809268,
                        "st": 0,
                        "bm": 0
                    }]
                }, {
                    "id": "comp_2",
                    "layers": [{
                        "ddd": 0,
                        "ind": 1,
                        "ty": 2,
                        "nm": "波浪1.ai",
                        "cl": "ai",
                        "refId": "image_3",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [1068, 832, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 2,
                        "ty": 2,
                        "nm": "波浪1.ai",
                        "cl": "ai",
                        "refId": "image_3",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [1778, 834, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 3,
                        "ty": 2,
                        "nm": "波浪1.ai",
                        "cl": "ai",
                        "refId": "image_3",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [364, 830, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }]
                }, {
                    "id": "comp_3",
                    "layers": [{
                        "ddd": 0,
                        "ind": 1,
                        "ty": 2,
                        "nm": "波浪2.ai",
                        "cl": "ai",
                        "refId": "image_4",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [392, 804, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 2,
                        "ty": 2,
                        "nm": "波浪2.ai",
                        "cl": "ai",
                        "refId": "image_4",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [1814, 810, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 3,
                        "ty": 2,
                        "nm": "波浪2.ai",
                        "cl": "ai",
                        "refId": "image_4",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [1096, 806, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }]
                }],
                "layers": [{
                    "ddd": 0,
                    "ind": 1,
                    "ty": 2,
                    "nm": "double_1.ai",
                    "cl": "ai",
                    "refId": "image_0",
                    "sr": 1,
                    "ks": {
                        "o": {
                            "a": 0,
                            "k": 100,
                            "ix": 11
                        },
                        "r": {
                            "a": 0,
                            "k": 0,
                            "ix": 10
                        },
                        "p": {
                            "a": 0,
                            "k": [968, 544, 0],
                            "ix": 2
                        },
                        "a": {
                            "a": 0,
                            "k": [421, 298, 0],
                            "ix": 1
                        },
                        "s": {
                            "a": 0,
                            "k": [201.455, 201.455, 100],
                            "ix": 6
                        }
                    },
                    "ao": 0,
                    "ip": 0,
                    "op": 60.0000024438501,
                    "st": 0,
                    "bm": 0
                }, {
                    "ddd": 0,
                    "ind": 2,
                    "ty": 0,
                    "nm": "Comp 1",
                    "refId": "comp_0",
                    "sr": 1,
                    "ks": {
                        "o": {
                            "a": 0,
                            "k": 100,
                            "ix": 11
                        },
                        "r": {
                            "a": 0,
                            "k": 0,
                            "ix": 10
                        },
                        "p": {
                            "a": 0,
                            "k": [992, 711, 0],
                            "ix": 2
                        },
                        "a": {
                            "a": 0,
                            "k": [960, 540, 0],
                            "ix": 1
                        },
                        "s": {
                            "a": 0,
                            "k": [64.412, 64.412, 100],
                            "ix": 6
                        }
                    },
                    "ao": 0,
                    "w": 1920,
                    "h": 1080,
                    "ip": 0,
                    "op": 60.0000024438501,
                    "st": 0,
                    "bm": 0
                }, {
                    "ddd": 0,
                    "ind": 3,
                    "ty": 0,
                    "nm": "Comp 1",
                    "refId": "comp_0",
                    "sr": 1,
                    "ks": {
                        "o": {
                            "a": 0,
                            "k": 100,
                            "ix": 11
                        },
                        "r": {
                            "a": 0,
                            "k": 0,
                            "ix": 10
                        },
                        "p": {
                            "a": 0,
                            "k": [990, 363, 0],
                            "ix": 2
                        },
                        "a": {
                            "a": 0,
                            "k": [960, 540, 0],
                            "ix": 1
                        },
                        "s": {
                            "a": 0,
                            "k": [63.634, 63.634, 100],
                            "ix": 6
                        }
                    },
                    "ao": 0,
                    "w": 1920,
                    "h": 1080,
                    "ip": 0,
                    "op": 60.0000024438501,
                    "st": 0,
                    "bm": 0
                }],
                "markers": []
            }
        }
    },
    mounted() {
        lottie.loadAnimation({
            container: document.getElementById('currentBattery'),
            renderer: 'svg',
            loop: true,
            autoplay: true,
            // path: pathData, //如果没有图片做动效,全是设计师用画的矢量图形
            animationData: this.animationData //如果有图片做动效,二者填其一即可
        })
    },
}


let double_2 = {
    template: '#currentBatteryTemp',
    data() {
        return {
            animationData: {
                "v": "5.5.9",
                "fr": 29.9700012207031,
                "ip": 0,
                "op": 60.0000024438501,
                "w": 1920,
                "h": 1080,
                "nm": "single",
                "ddd": 0,
                "assets": [{
                    "id": "image_0",
                    "w": 842,
                    "h": 596,
                    "u": "double_2/",
                    "p": "img_0.png",
                    "e": 0
                }, {
                    "id": "image_1",
                    "w": 842,
                    "h": 596,
                    "u": "double_2/",
                    "p": "img_1.png",
                    "e": 0
                }, {
                    "id": "image_2",
                    "w": 842,
                    "h": 596,
                    "u": "double_2/",
                    "p": "img_2.png",
                    "e": 0
                }, {
                    "id": "image_3",
                    "w": 842,
                    "h": 596,
                    "u": "double_2/",
                    "p": "img_3.png",
                    "e": 0
                }, {
                    "id": "image_4",
                    "w": 842,
                    "h": 596,
                    "u": "double_2/",
                    "p": "img_4.png",
                    "e": 0
                }, {
                    "id": "comp_0",
                    "layers": [{
                        "ddd": 0,
                        "ind": 2,
                        "ty": 0,
                        "nm": "Comp 3",
                        "refId": "comp_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [963, 497, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [960, 540, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [28.889, 28.889, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "w": 1920,
                        "h": 1080,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 3,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [922, 604, 0],
                                    "to": [-51.833, -156, 0],
                                    "ti": [48.833, 124, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [977, 310, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [4.996, 4.996, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 52.0000021180034,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 4,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [1200, 601, 0],
                                    "to": [179.5, -158.833, 0],
                                    "ti": [-183.5, 148.833, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [1353, 236, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [9.524, 9.524, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 39.0000015885026,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 5,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [731, 515, 0],
                                    "to": [-100.333, -36.5, 0],
                                    "ti": [133.333, 14.5, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [573, 284, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [3.571, 3.571, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 57.0000023216576,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 6,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [737, 634, 0],
                                    "to": [146.333, -204.833, 0],
                                    "ti": [-152.333, 138.833, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [829, 221, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [5.234, 5.234, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 50.0000020365418,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 7,
                        "ty": 2,
                        "nm": "遮罩.ai",
                        "cl": "ai",
                        "td": 1,
                        "refId": "image_2",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [1028, 540, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [724.139, 107.843, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "hasMask": true,
                        "masksProperties": [{
                            "inv": false,
                            "mode": "a",
                            "pt": {
                                "a": 0,
                                "k": {
                                    "i": [
                                        [0, 0],
                                        [-2.732, -4],
                                        [-2.049, -4],
                                        [-5.463, -2],
                                        [0.683, 14]
                                    ],
                                    "o": [
                                        [0, 0],
                                        [2.732, 4],
                                        [2.049, 4],
                                        [5.463, 2],
                                        [-0.683, -14]
                                    ],
                                    "v": [
                                        [463.339, 94],
                                        [349.297, 118],
                                        [352.028, 504],
                                        [463.339, 506],
                                        [482.46, 310]
                                    ],
                                    "c": true
                                },
                                "ix": 1
                            },
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 3
                            },
                            "x": {
                                "a": 0,
                                "k": 0,
                                "ix": 4
                            },
                            "nm": "Mask 1"
                        }],
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 8,
                        "ty": 0,
                        "nm": "wave1",
                        "tt": 1,
                        "refId": "comp_2",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [1550, 310, 0],
                                    "to": [-140.333, 0, 0],
                                    "ti": [140.333, 0, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [708, 310, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [960, 540, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "w": 1920,
                        "h": 1080,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 9,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [1008, 541, 0],
                                    "to": [5.747, -18.038, 0],
                                    "ti": [12.164, 81.494, 0]
                                }, {
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 31.75,
                                    "s": [1042.979, 431.221, 0],
                                    "to": [-9.832, -65.876, 0],
                                    "ti": [-5.086, 15.962, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [1073, 337, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [4.046, 4.046, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 10,
                        "ty": 2,
                        "nm": "遮罩.ai",
                        "cl": "ai",
                        "td": 1,
                        "refId": "image_2",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [1028, 540, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [724.139, 107.843, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "hasMask": true,
                        "masksProperties": [{
                            "inv": false,
                            "mode": "a",
                            "pt": {
                                "a": 0,
                                "k": {
                                    "i": [
                                        [0, 0],
                                        [-2.732, -4],
                                        [-2.049, -4],
                                        [-5.463, -2],
                                        [0.683, 14]
                                    ],
                                    "o": [
                                        [0, 0],
                                        [2.732, 4],
                                        [2.049, 4],
                                        [5.463, 2],
                                        [-0.683, -14]
                                    ],
                                    "v": [
                                        [463.339, 94],
                                        [349.297, 118],
                                        [352.028, 504],
                                        [463.339, 506],
                                        [482.46, 310]
                                    ],
                                    "c": true
                                },
                                "ix": 1
                            },
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 3
                            },
                            "x": {
                                "a": 0,
                                "k": 0,
                                "ix": 4
                            },
                            "nm": "Mask 1"
                        }],
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 11,
                        "ty": 0,
                        "nm": "wave2",
                        "tt": 1,
                        "refId": "comp_3",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [454, 306, 0],
                                    "to": [174.833, 0, 0],
                                    "ti": [-174.833, 0, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [1503, 306, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [960, 540, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "w": 1920,
                        "h": 1080,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }]
                }, {
                    "id": "comp_1",
                    "layers": [{
                        "ddd": 0,
                        "ind": 1,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": -6,
                                    "s": [938, 1006, 0],
                                    "to": [100.667, -172.667, 0],
                                    "ti": [-110.667, 196.667, 0]
                                }, {
                                    "t": 53.0000021587343,
                                    "s": [966, 534, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": [0.833, 0.833, 0.833],
                                        "y": [0.833, 0.833, 0.833]
                                    },
                                    "o": {
                                        "x": [0.167, 0.167, 0.167],
                                        "y": [0.167, 0.167, 0.167]
                                    },
                                    "t": -6,
                                    "s": [0, 0, 100]
                                }, {
                                    "t": 53.0000021587343,
                                    "s": [36.43, 36.43, 100]
                                }],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 4.00000016292334,
                        "op": 54.0000021994651,
                        "st": -6.00000024438501,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 2,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": -9,
                                    "s": [1384, 1012, 0],
                                    "to": [90.667, -277, 0],
                                    "ti": [-106.667, 269, 0]
                                }, {
                                    "t": 50.0000020365418,
                                    "s": [1388, 406, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": [0.833, 0.833, 0.833],
                                        "y": [0.833, 0.833, 0.833]
                                    },
                                    "o": {
                                        "x": [0.167, 0.167, 0.167],
                                        "y": [0.167, 0.167, 0.167]
                                    },
                                    "t": -9,
                                    "s": [0, 0, 100]
                                }, {
                                    "t": 50.0000020365418,
                                    "s": [41.43, 41.43, 100]
                                }],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 16.0000006516934,
                        "op": 51.0000020772726,
                        "st": -9.00000036657752,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 3,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": -11,
                                    "s": [466, 988, 0],
                                    "to": [5.333, -28.667, 0],
                                    "ti": [-59.333, 124.667, 0]
                                }, {
                                    "t": 48.0000019550801,
                                    "s": [498, 816, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": [0.833, 0.833, 0.833],
                                        "y": [0.833, 0.833, 0.833]
                                    },
                                    "o": {
                                        "x": [0.167, 0.167, 0.167],
                                        "y": [0.167, 0.167, 0.167]
                                    },
                                    "t": -11,
                                    "s": [0, 0, 100]
                                }, {
                                    "t": 48.0000019550801,
                                    "s": [40.43, 40.43, 100]
                                }],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 9.00000036657752,
                        "op": 52.0000021180034,
                        "st": -11.0000004480392,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 4,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": -10,
                                    "s": [1742, 1018, 0],
                                    "to": [28.667, -166.667, 0],
                                    "ti": [-40.667, 174.667, 0]
                                }, {
                                    "t": 49.0000019958109,
                                    "s": [1662, 714, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": [0.833, 0.833, 0.833],
                                        "y": [0.833, 0.833, 0.833]
                                    },
                                    "o": {
                                        "x": [0.167, 0.167, 0.167],
                                        "y": [0.167, 0.167, 0.167]
                                    },
                                    "t": -10,
                                    "s": [0, 0, 100]
                                }, {
                                    "t": 49.0000019958109,
                                    "s": [36.43, 36.43, 100]
                                }],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 5.00000020365417,
                        "op": 58.0000023623884,
                        "st": -10.0000004073083,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 5,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [148, 1004, 0],
                                    "to": [-26.667, -244, 0],
                                    "ti": [30.667, 316, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [228, 512, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": [0.833, 0.833, 0.833],
                                        "y": [0.833, 0.833, 0.833]
                                    },
                                    "o": {
                                        "x": [0.167, 0.167, 0.167],
                                        "y": [0.167, 0.167, 0.167]
                                    },
                                    "t": 0,
                                    "s": [0, 0, 100]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [34.43, 34.43, 100]
                                }],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 1.00000004073083,
                        "op": 56.0000022809268,
                        "st": 0,
                        "bm": 0
                    }]
                }, {
                    "id": "comp_2",
                    "layers": [{
                        "ddd": 0,
                        "ind": 1,
                        "ty": 2,
                        "nm": "波浪1.ai",
                        "cl": "ai",
                        "refId": "image_3",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [1068, 832, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 2,
                        "ty": 2,
                        "nm": "波浪1.ai",
                        "cl": "ai",
                        "refId": "image_3",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [1778, 834, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 3,
                        "ty": 2,
                        "nm": "波浪1.ai",
                        "cl": "ai",
                        "refId": "image_3",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [364, 830, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }]
                }, {
                    "id": "comp_3",
                    "layers": [{
                        "ddd": 0,
                        "ind": 1,
                        "ty": 2,
                        "nm": "波浪2.ai",
                        "cl": "ai",
                        "refId": "image_4",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [392, 804, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 2,
                        "ty": 2,
                        "nm": "波浪2.ai",
                        "cl": "ai",
                        "refId": "image_4",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [1814, 810, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 3,
                        "ty": 2,
                        "nm": "波浪2.ai",
                        "cl": "ai",
                        "refId": "image_4",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [1096, 806, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }]
                }],
                "layers": [{
                    "ddd": 0,
                    "ind": 1,
                    "ty": 2,
                    "nm": "double_2.ai",
                    "cl": "ai",
                    "refId": "image_0",
                    "sr": 1,
                    "ks": {
                        "o": {
                            "a": 0,
                            "k": 100,
                            "ix": 11
                        },
                        "r": {
                            "a": 0,
                            "k": 0,
                            "ix": 10
                        },
                        "p": {
                            "a": 0,
                            "k": [968, 544, 0],
                            "ix": 2
                        },
                        "a": {
                            "a": 0,
                            "k": [421, 298, 0],
                            "ix": 1
                        },
                        "s": {
                            "a": 0,
                            "k": [201.455, 201.455, 100],
                            "ix": 6
                        }
                    },
                    "ao": 0,
                    "ip": 0,
                    "op": 60.0000024438501,
                    "st": 0,
                    "bm": 0
                }, {
                    "ddd": 0,
                    "ind": 2,
                    "ty": 0,
                    "nm": "Comp 1",
                    "refId": "comp_0",
                    "sr": 1,
                    "ks": {
                        "o": {
                            "a": 0,
                            "k": 100,
                            "ix": 11
                        },
                        "r": {
                            "a": 0,
                            "k": 0,
                            "ix": 10
                        },
                        "p": {
                            "a": 0,
                            "k": [996, 689, 0],
                            "ix": 2
                        },
                        "a": {
                            "a": 0,
                            "k": [960, 540, 0],
                            "ix": 1
                        },
                        "s": {
                            "a": 0,
                            "k": [64.412, 64.412, 100],
                            "ix": 6
                        }
                    },
                    "ao": 0,
                    "w": 1920,
                    "h": 1080,
                    "ip": 0,
                    "op": 60.0000024438501,
                    "st": 0,
                    "bm": 0
                }, {
                    "ddd": 0,
                    "ind": 3,
                    "ty": 0,
                    "nm": "Comp 1",
                    "refId": "comp_0",
                    "sr": 1,
                    "ks": {
                        "o": {
                            "a": 0,
                            "k": 100,
                            "ix": 11
                        },
                        "r": {
                            "a": 0,
                            "k": 0,
                            "ix": 10
                        },
                        "p": {
                            "a": 0,
                            "k": [994, 383, 0],
                            "ix": 2
                        },
                        "a": {
                            "a": 0,
                            "k": [960, 540, 0],
                            "ix": 1
                        },
                        "s": {
                            "a": 0,
                            "k": [63.634, 63.634, 100],
                            "ix": 6
                        }
                    },
                    "ao": 0,
                    "w": 1920,
                    "h": 1080,
                    "ip": 0,
                    "op": 60.0000024438501,
                    "st": 0,
                    "bm": 0
                }],
                "markers": []
            }
        }
    },
    mounted() {
        lottie.loadAnimation({
            container: document.getElementById('currentBattery'),
            renderer: 'svg',
            loop: true,
            autoplay: true,
            // path: pathData, //如果没有图片做动效,全是设计师用画的矢量图形
            animationData: this.animationData //如果有图片做动效,二者填其一即可
        })
    },
}

let four = {
    template: '#currentBatteryTemp',
    data() {
        return {
            animationData: {
                "v": "5.5.9",
                "fr": 29.9700012207031,
                "ip": 0,
                "op": 60.0000024438501,
                "w": 1920,
                "h": 1080,
                "nm": "single",
                "ddd": 0,
                "assets": [{
                    "id": "image_0",
                    "w": 842,
                    "h": 596,
                    "u": "four/",
                    "p": "img_0.png",
                    "e": 0
                }, {
                    "id": "image_1",
                    "w": 842,
                    "h": 596,
                    "u": "four/",
                    "p": "img_1.png",
                    "e": 0
                }, {
                    "id": "image_2",
                    "w": 842,
                    "h": 596,
                    "u": "four/",
                    "p": "img_2.png",
                    "e": 0
                }, {
                    "id": "image_3",
                    "w": 842,
                    "h": 596,
                    "u": "four/",
                    "p": "img_3.png",
                    "e": 0
                }, {
                    "id": "image_4",
                    "w": 842,
                    "h": 596,
                    "u": "four/",
                    "p": "img_4.png",
                    "e": 0
                }, {
                    "id": "comp_0",
                    "layers": [{
                        "ddd": 0,
                        "ind": 2,
                        "ty": 0,
                        "nm": "Comp 3",
                        "refId": "comp_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [963, 497, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [960, 540, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [28.889, 28.889, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "w": 1920,
                        "h": 1080,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 3,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [922, 604, 0],
                                    "to": [-51.833, -156, 0],
                                    "ti": [48.833, 124, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [977, 310, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [4.996, 4.996, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 52.0000021180034,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 4,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [1200, 601, 0],
                                    "to": [179.5, -158.833, 0],
                                    "ti": [-183.5, 148.833, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [1353, 236, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [9.524, 9.524, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 39.0000015885026,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 5,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [731, 515, 0],
                                    "to": [-100.333, -36.5, 0],
                                    "ti": [133.333, 14.5, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [573, 284, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [3.571, 3.571, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 57.0000023216576,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 6,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [737, 634, 0],
                                    "to": [146.333, -204.833, 0],
                                    "ti": [-152.333, 138.833, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [829, 221, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [5.234, 5.234, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 50.0000020365418,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 7,
                        "ty": 2,
                        "nm": "遮罩.ai",
                        "cl": "ai",
                        "td": 1,
                        "refId": "image_2",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [1028, 540, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [724.139, 107.843, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "hasMask": true,
                        "masksProperties": [{
                            "inv": false,
                            "mode": "a",
                            "pt": {
                                "a": 0,
                                "k": {
                                    "i": [
                                        [0, 0],
                                        [-2.732, -4],
                                        [-2.049, -4],
                                        [-5.463, -2],
                                        [0.683, 14]
                                    ],
                                    "o": [
                                        [0, 0],
                                        [2.732, 4],
                                        [2.049, 4],
                                        [5.463, 2],
                                        [-0.683, -14]
                                    ],
                                    "v": [
                                        [463.339, 94],
                                        [349.297, 118],
                                        [352.028, 504],
                                        [463.339, 506],
                                        [482.46, 310]
                                    ],
                                    "c": true
                                },
                                "ix": 1
                            },
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 3
                            },
                            "x": {
                                "a": 0,
                                "k": 0,
                                "ix": 4
                            },
                            "nm": "Mask 1"
                        }],
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 8,
                        "ty": 0,
                        "nm": "wave1",
                        "tt": 1,
                        "refId": "comp_2",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [1550, 310, 0],
                                    "to": [-140.333, 0, 0],
                                    "ti": [140.333, 0, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [708, 310, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [960, 540, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "w": 1920,
                        "h": 1080,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 9,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [1008, 541, 0],
                                    "to": [5.747, -18.038, 0],
                                    "ti": [12.164, 81.494, 0]
                                }, {
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 31.75,
                                    "s": [1042.979, 431.221, 0],
                                    "to": [-9.832, -65.876, 0],
                                    "ti": [-5.086, 15.962, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [1073, 337, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [4.046, 4.046, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 10,
                        "ty": 2,
                        "nm": "遮罩.ai",
                        "cl": "ai",
                        "td": 1,
                        "refId": "image_2",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [1028, 540, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [724.139, 107.843, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "hasMask": true,
                        "masksProperties": [{
                            "inv": false,
                            "mode": "a",
                            "pt": {
                                "a": 0,
                                "k": {
                                    "i": [
                                        [0, 0],
                                        [-2.732, -4],
                                        [-2.049, -4],
                                        [-5.463, -2],
                                        [0.683, 14]
                                    ],
                                    "o": [
                                        [0, 0],
                                        [2.732, 4],
                                        [2.049, 4],
                                        [5.463, 2],
                                        [-0.683, -14]
                                    ],
                                    "v": [
                                        [463.339, 94],
                                        [349.297, 118],
                                        [352.028, 504],
                                        [463.339, 506],
                                        [482.46, 310]
                                    ],
                                    "c": true
                                },
                                "ix": 1
                            },
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 3
                            },
                            "x": {
                                "a": 0,
                                "k": 0,
                                "ix": 4
                            },
                            "nm": "Mask 1"
                        }],
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 11,
                        "ty": 0,
                        "nm": "wave2",
                        "tt": 1,
                        "refId": "comp_3",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [454, 306, 0],
                                    "to": [174.833, 0, 0],
                                    "ti": [-174.833, 0, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [1503, 306, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [960, 540, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "w": 1920,
                        "h": 1080,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }]
                }, {
                    "id": "comp_1",
                    "layers": [{
                        "ddd": 0,
                        "ind": 1,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": -6,
                                    "s": [938, 1006, 0],
                                    "to": [100.667, -172.667, 0],
                                    "ti": [-110.667, 196.667, 0]
                                }, {
                                    "t": 53.0000021587343,
                                    "s": [966, 534, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": [0.833, 0.833, 0.833],
                                        "y": [0.833, 0.833, 0.833]
                                    },
                                    "o": {
                                        "x": [0.167, 0.167, 0.167],
                                        "y": [0.167, 0.167, 0.167]
                                    },
                                    "t": -6,
                                    "s": [0, 0, 100]
                                }, {
                                    "t": 53.0000021587343,
                                    "s": [36.43, 36.43, 100]
                                }],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 4.00000016292334,
                        "op": 54.0000021994651,
                        "st": -6.00000024438501,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 2,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": -9,
                                    "s": [1384, 1012, 0],
                                    "to": [90.667, -277, 0],
                                    "ti": [-106.667, 269, 0]
                                }, {
                                    "t": 50.0000020365418,
                                    "s": [1388, 406, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": [0.833, 0.833, 0.833],
                                        "y": [0.833, 0.833, 0.833]
                                    },
                                    "o": {
                                        "x": [0.167, 0.167, 0.167],
                                        "y": [0.167, 0.167, 0.167]
                                    },
                                    "t": -9,
                                    "s": [0, 0, 100]
                                }, {
                                    "t": 50.0000020365418,
                                    "s": [41.43, 41.43, 100]
                                }],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 16.0000006516934,
                        "op": 51.0000020772726,
                        "st": -9.00000036657752,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 3,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": -11,
                                    "s": [466, 988, 0],
                                    "to": [5.333, -28.667, 0],
                                    "ti": [-59.333, 124.667, 0]
                                }, {
                                    "t": 48.0000019550801,
                                    "s": [498, 816, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": [0.833, 0.833, 0.833],
                                        "y": [0.833, 0.833, 0.833]
                                    },
                                    "o": {
                                        "x": [0.167, 0.167, 0.167],
                                        "y": [0.167, 0.167, 0.167]
                                    },
                                    "t": -11,
                                    "s": [0, 0, 100]
                                }, {
                                    "t": 48.0000019550801,
                                    "s": [40.43, 40.43, 100]
                                }],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 9.00000036657752,
                        "op": 52.0000021180034,
                        "st": -11.0000004480392,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 4,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": -10,
                                    "s": [1742, 1018, 0],
                                    "to": [28.667, -166.667, 0],
                                    "ti": [-40.667, 174.667, 0]
                                }, {
                                    "t": 49.0000019958109,
                                    "s": [1662, 714, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": [0.833, 0.833, 0.833],
                                        "y": [0.833, 0.833, 0.833]
                                    },
                                    "o": {
                                        "x": [0.167, 0.167, 0.167],
                                        "y": [0.167, 0.167, 0.167]
                                    },
                                    "t": -10,
                                    "s": [0, 0, 100]
                                }, {
                                    "t": 49.0000019958109,
                                    "s": [36.43, 36.43, 100]
                                }],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 5.00000020365417,
                        "op": 58.0000023623884,
                        "st": -10.0000004073083,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 5,
                        "ty": 2,
                        "nm": "泡泡.ai",
                        "cl": "ai",
                        "refId": "image_1",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": 0.833,
                                        "y": 0.833
                                    },
                                    "o": {
                                        "x": 0.167,
                                        "y": 0.167
                                    },
                                    "t": 0,
                                    "s": [148, 1004, 0],
                                    "to": [-26.667, -244, 0],
                                    "ti": [30.667, 316, 0]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [228, 512, 0]
                                }],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 1,
                                "k": [{
                                    "i": {
                                        "x": [0.833, 0.833, 0.833],
                                        "y": [0.833, 0.833, 0.833]
                                    },
                                    "o": {
                                        "x": [0.167, 0.167, 0.167],
                                        "y": [0.167, 0.167, 0.167]
                                    },
                                    "t": 0,
                                    "s": [0, 0, 100]
                                }, {
                                    "t": 59.0000024031193,
                                    "s": [34.43, 34.43, 100]
                                }],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 1.00000004073083,
                        "op": 56.0000022809268,
                        "st": 0,
                        "bm": 0
                    }]
                }, {
                    "id": "comp_2",
                    "layers": [{
                        "ddd": 0,
                        "ind": 1,
                        "ty": 2,
                        "nm": "波浪1.ai",
                        "cl": "ai",
                        "refId": "image_3",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [1068, 832, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 2,
                        "ty": 2,
                        "nm": "波浪1.ai",
                        "cl": "ai",
                        "refId": "image_3",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [1778, 834, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 3,
                        "ty": 2,
                        "nm": "波浪1.ai",
                        "cl": "ai",
                        "refId": "image_3",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [364, 830, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }]
                }, {
                    "id": "comp_3",
                    "layers": [{
                        "ddd": 0,
                        "ind": 1,
                        "ty": 2,
                        "nm": "波浪2.ai",
                        "cl": "ai",
                        "refId": "image_4",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [392, 804, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 2,
                        "ty": 2,
                        "nm": "波浪2.ai",
                        "cl": "ai",
                        "refId": "image_4",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [1814, 810, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }, {
                        "ddd": 0,
                        "ind": 3,
                        "ty": 2,
                        "nm": "波浪2.ai",
                        "cl": "ai",
                        "refId": "image_4",
                        "sr": 1,
                        "ks": {
                            "o": {
                                "a": 0,
                                "k": 100,
                                "ix": 11
                            },
                            "r": {
                                "a": 0,
                                "k": 0,
                                "ix": 10
                            },
                            "p": {
                                "a": 0,
                                "k": [1096, 806, 0],
                                "ix": 2
                            },
                            "a": {
                                "a": 0,
                                "k": [421, 298, 0],
                                "ix": 1
                            },
                            "s": {
                                "a": 0,
                                "k": [100, 100, 100],
                                "ix": 6
                            }
                        },
                        "ao": 0,
                        "ip": 0,
                        "op": 60.0000024438501,
                        "st": 0,
                        "bm": 0
                    }]
                }],
                "layers": [{
                    "ddd": 0,
                    "ind": 1,
                    "ty": 2,
                    "nm": "four.ai",
                    "cl": "ai",
                    "refId": "image_0",
                    "sr": 1,
                    "ks": {
                        "o": {
                            "a": 0,
                            "k": 100,
                            "ix": 11
                        },
                        "r": {
                            "a": 0,
                            "k": 0,
                            "ix": 10
                        },
                        "p": {
                            "a": 0,
                            "k": [968, 544, 0],
                            "ix": 2
                        },
                        "a": {
                            "a": 0,
                            "k": [421, 298, 0],
                            "ix": 1
                        },
                        "s": {
                            "a": 0,
                            "k": [201.455, 201.455, 100],
                            "ix": 6
                        }
                    },
                    "ao": 0,
                    "ip": 0,
                    "op": 60.0000024438501,
                    "st": 0,
                    "bm": 0
                }, {
                    "ddd": 0,
                    "ind": 2,
                    "ty": 0,
                    "nm": "Comp 1",
                    "refId": "comp_0",
                    "sr": 1,
                    "ks": {
                        "o": {
                            "a": 0,
                            "k": 100,
                            "ix": 11
                        },
                        "r": {
                            "a": 0,
                            "k": 0,
                            "ix": 10
                        },
                        "p": {
                            "a": 0,
                            "k": [960, 545, 0],
                            "ix": 2
                        },
                        "a": {
                            "a": 0,
                            "k": [960, 540, 0],
                            "ix": 1
                        },
                        "s": {
                            "a": 0,
                            "k": [100.833, 116.25, 100],
                            "ix": 6
                        }
                    },
                    "ao": 0,
                    "hasMask": true,
                    "masksProperties": [{
                        "inv": false,
                        "mode": "a",
                        "pt": {
                            "a": 0,
                            "k": {
                                "i": [
                                    [11.046, 0],
                                    [0, 0],
                                    [0, -11.046],
                                    [0, 0],
                                    [-21.157, 0],
                                    [-7.603, 0],
                                    [0, 22.581],
                                    [1.983, 19.14]
                                ],
                                "o": [
                                    [0, 0],
                                    [-11.046, 0],
                                    [0, 0],
                                    [0, 11.046],
                                    [21.157, 0],
                                    [11.074, 0],
                                    [0, -22.581],
                                    [-1.983, -19.14]
                                ],
                                "v": [
                                    [731.735, 459.14],
                                    [675.537, 459.14],
                                    [655.537, 479.14],
                                    [655.537, 649.032],
                                    [675.537, 669.032],
                                    [731.735, 669.032],
                                    [751.735, 649.032],
                                    [751.735, 479.14]
                                ],
                                "c": true
                            },
                            "ix": 1
                        },
                        "o": {
                            "a": 0,
                            "k": 100,
                            "ix": 3
                        },
                        "x": {
                            "a": 0,
                            "k": 0,
                            "ix": 4
                        },
                        "nm": "Mask 1"
                    }, {
                        "inv": false,
                        "mode": "a",
                        "pt": {
                            "a": 0,
                            "k": {
                                "i": [
                                    [13.471, -0.645],
                                    [0, 0],
                                    [0, -11.046],
                                    [0, 0],
                                    [-24.628, 0],
                                    [-19.504, 0],
                                    [0, 11.046],
                                    [0, 0]
                                ],
                                "o": [
                                    [-13.471, 0.645],
                                    [-11.046, 0],
                                    [0, 0],
                                    [0, 11.046],
                                    [24.628, 0],
                                    [19.504, 0],
                                    [0, 0],
                                    [0, -11.046]
                                ],
                                "v": [
                                    [900.331, 458.28],
                                    [848.099, 458.28],
                                    [826.116, 477.419],
                                    [826.116, 652.473],
                                    [848.099, 671.613],
                                    [900.331, 671.613],
                                    [923.306, 653.334],
                                    [922.314, 476.559]
                                ],
                                "c": true
                            },
                            "ix": 1
                        },
                        "o": {
                            "a": 0,
                            "k": 100,
                            "ix": 3
                        },
                        "x": {
                            "a": 0,
                            "k": 0,
                            "ix": 4
                        },
                        "nm": "Mask 2"
                    }, {
                        "inv": false,
                        "mode": "a",
                        "pt": {
                            "a": 0,
                            "k": {
                                "i": [
                                    [11.046, 0],
                                    [0, 0],
                                    [0, -11.046],
                                    [0, 0],
                                    [-20.165, 0],
                                    [-22.479, 0],
                                    [0, 11.046],
                                    [0, 0]
                                ],
                                "o": [
                                    [0, 0],
                                    [-11.046, 0],
                                    [0, 0],
                                    [0, 11.046],
                                    [20.165, 0],
                                    [22.479, 0],
                                    [0, 0],
                                    [0, -11.046]
                                ],
                                "v": [
                                    [1112.562, 460.86],
                                    [1057.355, 460.86],
                                    [1037.355, 480.86],
                                    [1037.355, 651.613],
                                    [1057.355, 671.613],
                                    [1112.562, 671.613],
                                    [1132.562, 651.613],
                                    [1132.562, 480.86]
                                ],
                                "c": true
                            },
                            "ix": 1
                        },
                        "o": {
                            "a": 0,
                            "k": 100,
                            "ix": 3
                        },
                        "x": {
                            "a": 0,
                            "k": 0,
                            "ix": 4
                        },
                        "nm": "Mask 3"
                    }, {
                        "inv": false,
                        "mode": "a",
                        "pt": {
                            "a": 0,
                            "k": {
                                "i": [
                                    [11.046, 0],
                                    [0, 0],
                                    [0, -11.046],
                                    [0, 0],
                                    [-0.578, 0.215],
                                    [-18.512, 0],
                                    [0, 11.046],
                                    [0, 0]
                                ],
                                "o": [
                                    [0, 0],
                                    [-11.046, 0],
                                    [0, 0],
                                    [0, 11.046],
                                    [0.578, -0.215],
                                    [18.512, 0],
                                    [0, 0],
                                    [0, -11.046]
                                ],
                                "v": [
                                    [1281.157, 461.72],
                                    [1221.984, 461.72],
                                    [1201.984, 481.72],
                                    [1201.984, 651.613],
                                    [1208.926, 671.613],
                                    [1281.157, 671.613],
                                    [1303.141, 653.333],
                                    [1304.132, 481.72]
                                ],
                                "c": true
                            },
                            "ix": 1
                        },
                        "o": {
                            "a": 0,
                            "k": 100,
                            "ix": 3
                        },
                        "x": {
                            "a": 0,
                            "k": 0,
                            "ix": 4
                        },
                        "nm": "Mask 4"
                    }],
                    "w": 1920,
                    "h": 1080,
                    "ip": 0,
                    "op": 60.0000024438501,
                    "st": 0,
                    "bm": 0
                }],
                "markers": []
            }
        }
    },
    mounted() {
        lottie.loadAnimation({
            container: document.getElementById('currentBattery'),
            renderer: 'svg',
            loop: true,
            autoplay: true,
            // path: pathData, //如果没有图片做动效,全是设计师用画的矢量图形
            animationData: this.animationData //如果有图片做动效,二者填其一即可
        })
    },
}

let vm = new Vue({
    el: '#app',
    data: data,
    methods: {
        flowSheet: function () {
            this.componentId = 'flowSheet'
        },
        uploadFile: function () {
            this.componentId = 'uploadFile'
        },
        dataAnalyse: function () {
            this.componentId = 'dataAnalyse'
        },
        dataForecast: function () {
            this.componentId = 'dataForecast'
        },
        single: function () {
            this.animationData = {}
            this.batteryCurrentMul = 1
            this.batteryId = "single"


        },
        double_1: function () {
            this.animationData = {}
            this.batteryCurrentMul = 2
            this.batteryId = "double_1"

        },
        double_2: function () {
            this.animationData = {}
            this.batteryCurrentMul = 1
            this.batteryId = "double_2"

        },
        four: function () {
            this.animationData = {}
            this.batteryCurrentMul = 2
            this.batteryId = "four"
        },
        getDataFromUpdate: function (data) {
            this.chartData = data;
            this.batteryInfo.basicInfo.name = '锂电池18350'
            this.batteryInfo.basicInfo.model = '18350'
            this.batteryInfo.testingEnvironment.temperature = '25 ℃'
            console.log(this.chartData);
        },
        getLineIndex: function (index) {
            this.index = index
            this.batteryInfo.testingEnvironment.constantCapicty = this.chartData.trueSOCData[index].toFixed(2)
            this.batteryInfo.testingEnvironment.constantCurrent = this.chartData.current[index]
            this.batteryInfo.testingEnvironment.constantVoltage = this.chartData.voltage[index]
        }
    },
    components: {
        batteryInfoComp,
        envInfoComp,
        foreCastInfoComp,
        flowSheet,
        uploadFile,
        dataAnalyse,
        dataForecast,
        single,
        double_1,
        double_2,
        four
    }
})