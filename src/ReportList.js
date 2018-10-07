import React, { Component } from 'react';
import {
    // eslint-disable-next-line
    Card 
}
from 'antd';

class ReportList extends Component {
	constructor(props){
		super(props)
	}

	render(){
		if(this.props.reportList.length){
			var item = this.props.reportList.map((it)=>
			    <p key={it.playerId}>{it.name}</p>
			)
		}else{
			var item = <p>暂时还没人报名呦~</p>
		}
		
		return(
			<div>
				<Card
				    title={"已经报名参与的球员"}
				    style={{ width: "100%" }}
				>
				    {item}
				</Card>
			</div>
		)
	}
}

export default ReportList;
