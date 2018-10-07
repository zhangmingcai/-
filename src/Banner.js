import React, { Component } from 'react';
import {
    // eslint-disable-next-line
    Row, Col
}
from 'antd';
import "./css/bannerStyle.css"
class Banner extends Component {
	constructor(props){
		super(props)
	}
	// 获取0到最大值之前的整数随机数
	getRandomNum(Max) {
	    var Range = Max - 1;
	    var Rand = Math.random();
	    return(0 + Math.round(Rand * Range));
	}
	render(){
		var ua = navigator.userAgent;
		var isIphone = ua.match(/(iPhone\sOS)\s([\d_]+)/),
		isAndroid = ua.match(/(Android)\s+([\d.]+)/),
		isMobile = isIphone || isAndroid;
		//判断有些图适合手机好看，电脑不好看
		if(isMobile){
			var index = this.getRandomNum(15)
		}else{
			let temp = [2,3,4,5,7,10,12]
			var index = temp[this.getRandomNum(7)]
		}

		return(
			<div className="wrap">
				<img src={require(`./img/${index}.jpg`)} />
				<div>慕课足球</div>
				<p>生命不息 运动不止！</p>
			</div>
		)
	}
}

export default Banner;
