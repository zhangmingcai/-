import React, { Component } from 'react';
import './App.css';
// eslint-disable-next-line
import {
    // eslint-disable-next-line
    Spin, Row, Col, Form, Input, Button,Option, Icon, Table, Badge, Select, message, Modal, Radio
}
from 'antd';
import 'antd/dist/antd.css';
import Cookie from './cookie';
import Banner from './Banner';
import ReportList from './ReportList';
import GroupInfo from './GroupInfo';

var chosedMan = {},leftPlayerList = [],teamA = [],teamB = [],max = 0;
var randomTimes = 0;
var timeTody = new Date()
var nowStr = (timeTody.getMonth() + 1)+"-"+ (timeTody.getDate() > 9 ? timeTody.getDate() : "0"+ timeTody.getDate())
//nowStr = "10-08"
class Player extends Component {
    constructor(props){
        super(props);
        if(Cookie.getCookie("moco_player_name")){
            var defaultValue = Cookie.getCookie("moco_player_name");
        }else{
            defaultValue = '请选择你的姓名'
        }
        this.state = {
            defaultValue:defaultValue
        }
    }
    handleChange(value) {
        Cookie.setCookie("moco_player_name", value);
        this.setState({
            defaultValue:value
        })

    }

    render() {

        let item = this.props.playersList.map((it)=>
            <Select.Option value={it.name} key={it.playerId}>{it.name}</Select.Option>
        )
        
        return (
            <div className="selectName" style={{ marginTop: 80 }}>
            <Select
                style={{ width: "100%" }}
                onChange={this.handleChange.bind(this)}
                defaultValue={this.state.defaultValue}
              >
                {item}
              </Select>
            </div>
        );
    }
}
class App extends Component {
    constructor(props){
        super(props)
        this.state = {
            playersList : [],
            reportList  : [],
            result      : false,
            startDevide : false,
            inTime      : false
        };
        
    }
    componentDidMount(){ 
        //初始化倒计时，到点刷页面
        this.initClock()
        //加载所有球员给下拉菜单选球员用
        this.loadAllPlayers();
        //判断进入页面的时间决定用户看到的分队结果
        this.judgeTime()
        message.config({
          top: 200,
          duration: 2,
          maxCount: 3,
        });
    }
    /*
    如果有人在12点到13点之间进入页面等同于到12点决定是否分队
    如果没有结果数据就生成存数据库，有就只是展示
    */
    judgeTime(){
        var h = timeTody.getHours();
        if(h > 11 && h < 13){
            console.log('12点到13点进入页面展示或生成分组')
            this.setState({
                startDevide : true
            })
            this.loadReportPlayers();
        }else if(h > 8 && h < 13){
            /*清除前一天的报名数据 展示截至目前报名数据*/
            this.loadReportPlayers();
            
        }else{
            console.log('13点后进入页面提示每天12点更新结果不展示今天上午的报名列表')
            this.setState({
                inTime : false,
                reportList : []
            })
        }
    }
    initClock(){
        let now = new Date();
        let temp = now.setHours(12,0,0);
        let stop = 0;
        let seconds = 0;
        //当天12点之前
        if(new Date().getTime() < temp){
            stop = temp;
        }else{
            stop = temp + 24*60*60*1000
        }
        now = new Date()
        seconds = (stop - now.getTime())/1000;
        let ctx = this;
        // eslint-disable-next-line
        let clock = $('.clock').FlipClock(seconds,{
                countdown: true,
                stop:function(){
                    window.location.reload()
                }
            }
        );
    }
    //请求所有已经报名球员列表 进入页面没过中午一点或者到分队时会调用
    loadReportPlayers(){
        // eslint-disable-next-line
        var ReportList = Bmob.Object.extend("reportList");
        // eslint-disable-next-line
        var query = new Bmob.Query(ReportList)
        console.log("查询已经报名的球员列表")
        var ctx = this; 
        query.limit(20);
        /*
        每天第一个打开该页面就会先清除报名列表中前一天的数据
        到点了而且报名人数大于一个人才会决定如何处理结果表数据是否更新
        到点两人及以上才会分组，但是如果数据库已经有了当天的数据就不会存到数据库了，
        也就是说分组每天只会到点存数据库一次！在分组只能等第二天或者清空结果表
        */
        query.find({
            success:function(res){
                let resFilter = [];
                if(res.length){
                    for (var i = 0; i < res.length; i++) {
                        /*reportlist中只能含有当天的数据 若不是当天的就清除*/
                        if(res[i].createdAt.indexOf(nowStr) < 0){
                            (function(myObject){
                                myObject.destroy({
                                    success: function(myObject) {
                                        console.log(myObject,"报名列表中含有的今日之前的报名数据清除成功")
                                    },
                                    error: function(myObject, error) {
                                        alert("清除失败: " + error.code + " " + error.message);
                                    }
                                })
                            })(res[i])
                        }
                    }
                    
                }else{
                    console.log("报名列表为空",res)
                }

                res.forEach((item)=>{
                    resFilter.push(item.attributes)
                })
                ctx.setState({
                    reportList : resFilter
                })
                //到点调用 了才会为true
                if(ctx.state.startDevide){
                    if(resFilter.length < 2){
                        message.error('报名人数少于两人无法完成分队~', 4);
                        return false;
                    }
                    ctx.startDevideGroup()
                }
            },
            erro:function(error){
                alert("查询失败: " + error.code + " " + error.message);
            }
        })

    }
    //请求所有球员列表
    loadAllPlayers(){
        // eslint-disable-next-line
        var Players = Bmob.Object.extend("players");
        // eslint-disable-next-line
        var query = new Bmob.Query(Players)

        var ctx = this;
        query.limit(20);
        query.find({
            success:function(res){
                let resFilter = [];
                res.forEach((item)=>{
                    resFilter.push(item.attributes)
                })
                ctx.setState({
                    playersList : resFilter
                })
            },
            erro:function(error){
                alert("查询失败: " + error.code + " " + error.message);
            }
        })

    }
    //开始分队，分离出一个报名队员列表数组
    startDevideGroup(){
        //报名参与的同学们
        this.state.reportList.forEach((item)=>{
            leftPlayerList.push(item)
        })

        //a队选人 不需要对比type
        this.choseA();
    }
    /*
    这是决定负责a组选出的球员
    */
    choseA(){
        var index = 0;
        //剩余人数
        max = leftPlayerList.length;
        //随机出的下标
        index = this.getRandomNum(max);
        //选中的人
        chosedMan = leftPlayerList[index];
        console.log("A选出的球员", chosedMan);
        this.addToWhichTeam()
    }
    /*
    这是决定负责根据a组选出的球员给b组选出相同type的球员
    */
    choseB(){
        var typeIndex = 0;
        //位置相同的剩余球员列表
        var sameTypePlayerList = leftPlayerList.filter((item)=>{
            return item.type === chosedMan.type;
        })
        console.log("位置相同的剩余球员列表", sameTypePlayerList)
        //只有一个对位球员
        if(sameTypePlayerList.length === 1){
            chosedMan = sameTypePlayerList[0]
            console.log("B选出的球员 只有一个可选", chosedMan)
            this.addToWhichTeam()
            
        }else if(sameTypePlayerList.length > 1){
            max = sameTypePlayerList.length;
            typeIndex = this.getRandomNum(max);
            chosedMan = sameTypePlayerList[typeIndex];

            console.log("B选出的球员 多个中随机出的", chosedMan)
            this.addToWhichTeam()
        }else{
            if(randomTimes < 10){
                randomTimes += 1;
                //b队没有和a队选出的队员相同位置的人，就把a对刚才选出的球员扔回重选
                console.log("b队无人对位，让a队重新选人");
                teamA.splice(teamA.indexOf(chosedMan), 1);
                leftPlayerList.push(chosedMan);
                this.choseA()
            }else{
                this.getRandomChosedMan()
            }
        }

    }
    /*
    这是根据两组目前人数多少决定把随机出的球员分到哪个队的方法
    */
    addToWhichTeam(){
        if (teamA.length === teamB.length) {
            teamA.push(chosedMan)
        }else{
            teamB.push(chosedMan)
        }
        //剩余各种type的球员中要移除刚才被选走的
        leftPlayerList.splice(leftPlayerList.indexOf(chosedMan), 1);
        console.log("选走一个后剩余所有可选球员",leftPlayerList)
        //还有至少俩人就得继续随机
        if(leftPlayerList.length > 1){
            if (teamA.length === teamB.length) {
                this.choseA()
            }else{
                this.choseB()
            }
        }else{
        //人数刚好就给b否则最后一个人分给两队综合skill总值比较小的
            chosedMan = leftPlayerList[0]
            if(this.state.reportList % 2){
                var skillSumA = 0,skillSumB = 0;
                teamA.forEach((item)=>{
                    skillSumA += item.skill; 
                })
                teamB.forEach((item)=>{
                    skillSumB += item.skill; 
                })
                console.log("skillSumA",skillSumA)
                console.log("skillSumB",skillSumB)
                if (skillSumA > skillSumB) {
                    teamB.push(chosedMan)
                } else if(skillSumA === skillSumB){
                    //如果两队总技能值一样就随机决定最后一个待选球员到那一队
                    if(this.getRandomNum(2)){
                        teamB.push(chosedMan)
                    }else{
                        teamA.push(chosedMan)
                    }
                }else{
                    teamA.push(chosedMan)
                }
            }else{
                teamB.push(chosedMan)
            }
            
            
            console.log("最终A",teamA)
            console.log("最终B",teamB)
            this.saveDevideResult()

        }
    }
    /*
    报名上报函数
    */
    doReport(){
        var ctx = this;
        var name = Cookie.getCookie("moco_player_name");
        if (!name) {
            message.error('请选择你的姓名哦~', 4);
            return false;
        }
        let wantReportPlayer = this.state.playersList.filter((item)=>{
            return item.name === name;
        })[0]
        // eslint-disable-next-line
        var ReportList = Bmob.Object.extend("reportList");
        var setData = new ReportList()
        // eslint-disable-next-line        
        var query = new Bmob.Query(ReportList);
 
        query.equalTo("name", wantReportPlayer.name); 
        query.find({
            success:function(res){
                if(!res.length){
                    for (var key in wantReportPlayer) {
                        setData.set(key,wantReportPlayer[key])
                    }
                    setData.save(null, {
                        success: function(object) {
                            message.success('报名成功啦~球场见！', 4);
                            ctx.loadReportPlayers();
                        },
                        error: function(model, error) {
                            message.error('报名失败接口错误', 4);
                        }
                    });
                }else{
                    message.warning("已经报过名了")
                }
            },
            erro:function(error){
                message.error("查询是否已经报名失败: " + error.code + " " + error.message, 4);
            }
        })
        
    }
    /*
    清除前一天的分队结果数据
    */
    cleanResult(cb){
        // eslint-disable-next-line
        var ResultList = Bmob.Object.extend("resultList");
        // eslint-disable-next-line  
        var query = new Bmob.Query(ResultList);

        query.first({
            success: function(object) {
                object.destroy({
                    success: function(myObject) {
                        console.log("今日之前的分组结果数据清除成功")
                        cb()
                    },
                    error: function(myObject, error) {
                        alert("清除失败: " + error.code + " " + error.message);
                    }
                })
            },
            error: function(error) {
                alert("查询失败: " + error.code + " " + error.message);
            }
        });
    }
    /*
    保存当天分队信息
    */
    saveDevideResult(){
        // eslint-disable-next-line
        var ResultList = Bmob.Object.extend("resultList");
        var setData = new ResultList()
        // eslint-disable-next-line        
        var query = new Bmob.Query(ResultList); 
        var ctx = this;
        query.find({
            success:function(res){
                if(res.length === 1){
                    //已经生成过今天的分队结果 不再重新生成
                    if(res[0].createdAt.indexOf(nowStr) > 0){
                        ctx.setState({
                            result : res[0].attributes.resultObj,
                            inTime : true
                        })
                        console.log("今天的结果数据早已生成，直接拿来用就行")
                    }else{
                        ctx.cleanResult(ctx.saveDevideResult.bind(ctx))
                    }

                }else{
                    var result = {
                        teamA:teamA,
                        teamB:teamB,
                    }
                    setData.set('resultObj',result)
                    setData.save(null, {
                        success: function(object) {
                            console.log("分队记录上传成功")
                            ctx.setState({
                                result : result,
                                inTime : true
                            })
                        },
                        error: function(model, error) {
                            alert('分队记录保存失败接口错误');
                        }
                    });
                }
            },
            erro:function(error){
                alert("查询分队记录失败: " + error.code + " " + error.message);
            }
        })
    }
    /*
    当剩下的至少2个待选球员位置都不匹配时随机选择
    */
    getRandomChosedMan(){
        let index = 0;
        max = leftPlayerList.length;
        index = this.getRandomNum(max);
        chosedMan = leftPlayerList[index];
        this.addToWhichTeam()
    }
    // 获取0到最大值之前的整数随机数
    getRandomNum(Max) {
        var Range = Max - 1;
        var Rand = Math.random();
        return(0 + Math.round(Rand * Range));
    }
    render() {
        return (
            <div className="App">
            <Banner />
            <Row>
                <Col xs={{ span: 24,offset:0}} md={{ span: 12,offset:1}} >
                    <div style={{marginTop:'2em'}} className="clock"></div>
                </Col>
                <Col xs={{ span: 10 ,offset:1}} md={{ span: 5,offset:0}}>
                    <Player playersList = {this.state.playersList}  />
                </Col>
                <Col xs={{ span: 10 ,offset:2}} md={{ span: 4,offset:1}}>
                    <Button className="btnStart" onClick={this.doReport.bind(this)} style={{marginTop:'74px'}} type="primary" size="large" block>今天就干！</Button>
                </Col>
            </Row>
            <Row>
                <Col xs={{ span: 22, offset:1}} md={{ span: 6,offset:2}}>
                    <ReportList reportList = {this.state.reportList}/>
                </Col>
                <Col xs={{ span: 22, offset:1}} md={{ span: 14,offset:0}}>
                    <GroupInfo inTime = {this.state.inTime} result = {this.state.result} />
                </Col>
            </Row>
            </div>
        );
    }
}

export default App;
