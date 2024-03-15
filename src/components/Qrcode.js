/*eslint-disable*/

import React from "react";
import ReactDOMServer from 'react-dom/server'
import {getQrcodeData} from "../utils/qrcodeHandler";
import {saveImg, saveSvg} from "../utils/downloader";
import {isWeiXin} from "../utils/util";
import './Qrcode.css';
import logo from '../qrbtf-logo.svg';

import Footer from "./Footer";
import QrItem from "./QrItem";
import QrRendererBase from "./QrRendererBase";
import QrRendererRound from "./QrRendererRound";
import QrRendererRandRound from "./QrRendererRandRound";
import QrRendererBlank from "./QrRendererBlank";
import QrRendererRandRect from "./QrRendererRandRect";
import QrRendererDSJ from "./QrRendererDSJ";
import QrRenderer25D from "./QrRenderer25D";
import QrRendererImage from "./QrRendererImage";
import {recordDownloadDetail} from "../api/db";

const logoStyle = {
    background: `url(${logo})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'left'
};

const styleList = [
    {value: "A1", renderer: QrRendererBase},
    {value: "A2", renderer: QrRendererRound},
    {value: "A3", renderer: QrRendererRandRound},
    {value: "SP — 1", renderer: QrRendererDSJ},
    {value: "SP — 2", renderer: QrRendererRandRect},
    {value: "B1", renderer: QrRenderer25D},
    {value: "C1", renderer: QrRendererImage},
    {value: "D1", renderer: QrRendererBlank},
];


class Qrcode extends React.Component {
    paramInfoBuffer;
    paramValueBuffer;
    constructor(props) {
        super(props);
        this.state = {
            text: '',
            selectedIndex: 0,
            options: {text: ''},
            qrcode: null,
            paramInfo: [],
            paramValue: [],
            correctLevel: 0,
            history: []
        };
        this.paramInfoBuffer = new Array(16).fill(new Array(16));
        this.paramValueBuffer = new Array(16).fill(new Array(16));
    }

    componentDidMount() {
        const text = 'https://qrbtf.com/';
        this.setState({
            paramInfo: this.paramInfoBuffer,
            paramValue: this.paramValueBuffer,
            text: text,
            options: {text: text},
            qrcode: getQrcodeData({text: text, correctLevel: this.state.correctLevel})
        });
    }

    setParamInfo = (index) => {
        const _this = this;
        return function (params) {
            _this.paramInfoBuffer[index] = params;
            _this.paramValueBuffer[index] = params.map(p => {
                return p.default
            });
        }
    }

    setParamValue = (valueIndex, value) => {
        const newValue = this.state.paramValue.slice();
        newValue[this.state.selectedIndex][valueIndex] = value;
        this.setState({paramValue: newValue});
    }

    handleCreate = (e) => {
        let text = this.state.text
        if (text.length <= 0) text = 'https://qrbtf.com/';
        this.setState({text: text, options: {text: text}, qrcode: getQrcodeData({text: text, correctLevel: this.state.correctLevel})});
        if (e) e.target.blur();
    }

    downloadSvg = (e) => {
        const selected = this.state.selectedIndex
        const style = styleList[selected]
        const el = React.createElement(style.renderer, {qrcode: this.state.qrcode, params: this.state.paramValue[selected]})
        saveSvg(style.value, ReactDOMServer.renderToString(el))
        // recordDownloadDetail({
        //     text: this.state.text,
        //     value: styleList[selected],
        //     type: 'svg',
        //     params: this.state.paramInfo[selected].map((item, index) => {
        //         return {
        //             key: item.key,
        //             value: item.choices ? item.choices[this.state.paramValue[selected][index]] : this.state.paramValue[selected][index]
        //         }
        //     }),
        //     history: this.state.history
        // });
    }

    downloadImg = (e) => {
        const selected = this.state.selectedIndex
        const style = styleList[selected]
        const el = React.createElement(style.renderer, {qrcode: this.state.qrcode, params: this.state.paramValue[selected]})
        saveImg(style.value, ReactDOMServer.renderToString(el), 1500, 1500)
        // recordDownloadDetail({
        //     text: this.state.text,
        //     value: styleList[selected],
        //     type: 'jpg',
        //     params: this.state.paramInfo[selected].map((item, index) => {
        //         return {
        //             key: item.key,
        //             value: item.choices ? item.choices[this.state.paramValue[selected][index]] : this.state.paramValue[selected][index]
        //         }
        //     }),
        //     history: this.state.history
        // });
    }

    renderParamEditor = (info, index) => {
        if (info.choices) {
            return (
                <select
                    className="Qr-select"
                    key={"select_" + this.state.selectedIndex + "_" + index}
                    value={this.state.paramValue[this.state.selectedIndex][index]}
                    onChange={(e) => this.setParamValue(index, e.target.value)}>
                    {
                        info.choices.map((choice, index) => {
                            return (
                                <option key={"option_" + this.state.selectedIndex + "_" + index}
                                        value={index}>
                                    {choice}
                                </option>
                            );
                        })
                    }
                </select>
            );
        }
        else {
            return (
                <input
                    type="number"
                    key={"input_" + this.state.selectedIndex + "_" + index}
                    className="Qr-input small-input"
                    placeholder="10"
                    defaultValue={this.state.paramValue[this.state.selectedIndex][index]}
                    onBlur={(e) => this.setParamValue(index, e.target.value)}
                    onKeyPress={(e) => {if(e.key === 'Enter') {this.setParamValue(index, e.target.value); e.target.blur()}}}/>
            );
        }
    }

    renderAdjustment = () => {
        const target = this.state.paramInfo[this.state.selectedIndex];
        if (target instanceof Array) {
            return target.map((info, index) => {
                return (
                    <tr key={"tr_" + index}>
                        <td key={"title_" + index}>{info.key}</td>
                        <td key={"editor_" + index}>{this.renderParamEditor(info, index)}</td>
                    </tr>
                )
            })
        }
    }

    changeStyle = (index) => {
        const newHistory = this.state.history.slice();
        newHistory.push(styleList[index].value);
        this.setState({selectedIndex: index, history: newHistory})
    }

    render() {
        return (
            <div className="Qr-outer">
                <div className="Qr-Centered">
                    <div style={logoStyle}>
                        <h1 className="Qr-title">&ensp;</h1>
                    </div>
                    <p className="Qr-subtitle">参数化二维码生成器 <sup className="Gray">测试版</sup></p>
                    <input
                        className="Qr-input big-input"
                        placeholder="Input your URL here"
                        onChange={(e) => this.setState({text: e.target.value})}
                        onBlur={this.handleCreate}
                        onKeyPress={(e) => {if(e.key === 'Enter') this.handleCreate(e)}}
                    />
                </div>
                <div className="Qr-titled">
                    <div className="Qr-Centered title-margin">
                        <div className="Qr-s-title">Styles</div>
                        <p className="Qr-s-subtitle">点击选择样式</p>
                    </div>
                    <div className="Qr-s">
                        <div className="Qr-box">
                            {
                                styleList.map((style, index) => {
                                    return <QrItem
                                        key={style.value}
                                        value={style.value}
                                        index={index}
                                        qrcode={this.state.qrcode}
                                        renderer={React.createElement(style.renderer, {
                                            qrcode: this.state.qrcode,
                                            params: this.state.paramValue[index],
                                            setParamInfo: this.setParamInfo(index)
                                        })}
                                        text={this.state.text}
                                        selected={index == this.state.selectedIndex}
                                        onSelected={this.changeStyle}
                                    />
                                })
                            }
                        </div>
                    </div>
                </div>
                <div className="Qr-titled-nobg">
                    <div className="Qr-Centered title-margin">
                        <div className="Qr-s-title">Parameters</div>
                        <p className="Qr-s-subtitle">参数调整</p>
                    </div>
                    <div className="Qr-Centered">
                        <div className="Qr-div-table">
                            <table className="Qr-table">
                                <tbody>
                                <tr>
                                    <td>容错率</td>
                                    <td>
                                        <select
                                            className="Qr-select"
                                            value={this.state.correctLevel}
                                            onChange={(e) => {
                                                this.setState({correctLevel: parseInt(e.target.value)}, () => this.handleCreate())
                                            }}>
                                            <option value={1}>7%</option>
                                            <option value={0}>15%</option>
                                            <option value={3}>25%</option>
                                            <option value={2}>30%</option>
                                        </select>
                                    </td>
                                </tr>
                                {this.renderAdjustment()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="Qr-titled">
                    <div className="Qr-Centered title-margin">
                        <div className="Qr-s-title">Downloads</div>
                        <p className="Qr-s-subtitle">下载二维码 — {styleList[this.state.selectedIndex].value}</p>
                    </div>
                    <div className="Qr-Centered">
                        <div className="div-btn">
                            <button className="dl-btn" onClick={this.downloadSvg}>SVG</button>
                            <button className="dl-btn" onClick={this.downloadImg}>JPG</button>
                        </div>
                        <div id="wx-message"></div>
                    </div>

                </div>
                <div className="Qr-titled-nobg">
                    <div className="Qr-Centered title-margin">
                        <div className="Qr-s-title">More</div>
                        <p className="Qr-s-subtitle">更多</p>
                    </div>
                    <div className="Qr-Centered btn-row">
                        <div className="div-btn">
                            <a href="https://www.yuque.com/qrbtf/docs/donate" rel="noopener noreferrer" target="_blank">
                                <button className="dl-btn">打赏 & 赞助</button>
                            </a>
                            <a href="https://www.yuque.com/qrbtf/topics" rel="noopener noreferrer" target="_blank">
                                <button className="dl-btn">问题反馈</button>
                            </a>
                        </div>
                        <div className="div-btn">
                            <a href="https://www.yuque.com/qrbtf/docs/dev" rel="noopener noreferrer" target="_blank">
                                <button className="dl-btn">开发与设计</button>
                            </a>
                            <a href="https://www.yuque.com/qrbtf/docs/coop" rel="noopener noreferrer" target="_blank">
                                <button className="dl-btn">商业合作</button>
                            </a>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }
}

export default Qrcode;

window.onload = function(){
    if(isWeiXin()){
        const outer = document.getElementById("wx-message");
        const inner = document.createElement("div");
        inner.className = "note-font";
        inner.id = "wx-message-inner";
        inner.innerHTML = "当前客户端不支持下载，请在浏览器中打开。";
        outer.appendChild(inner);
    }
}
