import React, { Component } from 'react';
import './App.css';
// eslint-disable-next-line
import {
    // eslint-disable-next-line
    Spin, Row, Col, Form, Input, Button,Option, Icon, Table, Badge, Select, message, Modal, Radio
}
from 'antd';
var chosedMan = {},leftPlayerList = [],teamA = [],teamB = [],max = 0;

class Player extends Component {
    constructor(props){
        super(props)
        this.state = {
            playersList : [],
            loadPlayer  : false
        };
    }

    render() {
        return (
            <div style={{width:"200px"}}>
            <Select>
                <Select.Option value="lucy">lucy</Select.Option>
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
            reportList  : []
        };
    }
    loadAllPlayers(){
        // eslint-disable-next-line
        var Players = Bmob.Object.extend("players");
        // eslint-disable-next-line
        var query = new Bmob.Query(Players)
        console.log(Players,query)
        var ctx = this;
        query.limit(20);
        query.find({
            success:function(res){
                console.log(res)
                ctx.setState({
                    playersList : res,
                    loadPlayer  : true
                })
            },
            erro:function(error){
                alert("查询失败: " + error.code + " " + error.message);
            }
        })

    }
    componentDidMount(){
        this.loadAllPlayers();
    }
    // 获取0到最大值之前的整数随机数
    getRandomNum(Max) {
        var Range = Max - 0;
        var Rand = Math.random();
        return(0 + Math.round(Rand * Range));
    }
    startDevideGroup(){
        //报名参与的同学们
        this.state.playersList.forEach((item)=>{
            leftPlayerList.push(item.attributes)
        })
        console.log("还未开始分组时可供挑选的球员列表", leftPlayerList)
        //a队选人 不需要对比type
        this.choseA();
    }
    /*
    这是决定负责a组选出的球员
    */
    choseA(){
        console.log("两队成员",teamA,teamB)
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
            console.log(typeIndex,chosedMan)
            console.log("B选出的球员 多个中随机出的", chosedMan)
            this.addToWhichTeam()
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
        }else{//最后一个人分给两队综合skill总值比较小的
            chosedMan = leftPlayerList[0]
            console.log("最后一个人",chosedMan)
            var skillSumA = 0,skillSumB = 0;
            teamA.forEach((item)=>{
                console.log(item)
                // skillSumA += item.skill; 
            })
            teamB.forEach((item)=>{
                // skillSumB += item.skill; 
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

        }
    }
    render() {
        if (this.state.loadPlayer) {
            this.startDevideGroup()
            console.log("teamA",teamA)
            console.log("teamB",teamB)
        }
        return (
            <div className="App">
            <Row>
                <Col span="18" offset="1">

                    <Player playersList = {this.state.playersList} />
                </Col>
            </Row>
            </div>
        );
    }
}

export default App;
