import React, { Component } from 'react';
import {
    // eslint-disable-next-line
    Card 
}
from 'antd';
import "./css/bannerStyle.css"
class GroupInfo extends Component {
	constructor(props){
		super(props)

	}

	render(){
		// 有分队结果了
		if(this.props.result){
			var itemA = this.props.result.teamA.map((it)=>
			    <p key={it.playerId}>{it.name}</p>
			)
			var itemB = this.props.result.teamB.map((it)=>
			    <p key={it.playerId}>{it.name}</p>
			)
			var skillSumA = 0,skillSumB = 0;
			this.props.result.teamA.forEach((item)=>{
			    skillSumA += item.skill; 
			})
			this.props.result.teamB.forEach((item)=>{
			    skillSumB += item.skill; 
			})
			var content = <div>
				<Card title={"teamA"} style={{ width: 300 }}>
				    {itemA}
				    <h2>综合能力值 {skillSumA}</h2>
				</Card>
				<Card title={"teamB"} style={{ width: 300 }}>
				    {itemB}
				    <h2>综合能力值 {skillSumB}</h2>
				</Card>
			</div>
				
		}else{
			var content = <p>今天报名的人数太少啦，还不能正常分队，快招呼大家报名啦~</p>
		}
		return(
			<div>
				<Card
				    title={"已报名球员分队"}
				    style={{ width: "100%" }}
				>
				    {content}
				</Card>
			</div>
		)
	}
}

export default GroupInfo;
