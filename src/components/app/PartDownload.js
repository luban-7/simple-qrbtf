import React, {useState} from 'react';
import './App.css';
import PropTypes from 'prop-types';
import {isWeiXin} from "../../utils/navigatorUtils";
import {genQRInfo, changeParam, changeCorrectLevel, changeStyle, changeIcon} from "../../actions";

import RendererDSJ from "../../components/renderer/RendererDSJ";
import RendererCircle from "../../components/renderer/RendererCircle"
import RendererRandRect from "../../components/renderer/RendererRandRect";
import Renderer25D from "../../components/renderer/Renderer25D";
import RendererImage from "../../components/renderer/RendererImage";
import RendererResImage from "../../components/renderer/RendererResImage";
import { RendererRandRound, RendererRect, RendererRound } from "../../components/renderer/RendererBase";
import { RendererLine, RendererLine2 } from "../../components/renderer/RendererLine";
import { RendererFuncA, RendererFuncB } from "../../components/renderer/RendererFunc";
import RendererImageFill from "../../components/renderer/RendererImageFill";
import { saveSvg } from '../../utils/downloader';

const styles = [
    {value: "A1", renderer: RendererRect},
    {value: "C2", renderer: RendererResImage},
    {value: "SP — 1", renderer: RendererDSJ},
    {value: "A — a1", renderer: RendererLine},
    {value: "SP — 3", renderer: RendererCircle},
    {value: "A2", renderer: RendererRound},
    {value: "A3", renderer: RendererRandRound},
    {value: "A — b2", renderer: RendererFuncB},
    {value: "C1", renderer: RendererImage},
    {value: "C3", renderer: RendererImageFill},
    {value: "B1", renderer: Renderer25D},
    {value: "A — a2", renderer: RendererLine2},
    {value: "A — b1", renderer: RendererFuncA},
    {value: "SP — 2", renderer: RendererRandRect},
]

const CountComponent = ({ value }) => {
    if (isNaN(value)) return null;
    if (value >= 10000) value = (value / 10000).toFixed(1) + "万";
    return <sup className="Gray">{value}</sup>
}

const WxMessage = () => {
    if (isWeiXin()) {
        return (
            <div className="note-font" id="wx-message-inner">
                当前客户端不支持下载 SVG，<br />
                请下载 JPG 并长按二维码保存。
            </div>
        )
    }
    return null;
}

const ImgBox = ({ imgData }) => {
    if (imgData.length > 0) {
        return (
            <div id="dl-image">
                <div id="dl-image-inner">
                    <img id="dl-image-inner-jpg" src={imgData} alt="长按保存二维码" />
                </div>
            </div>
        )
    }
    return null
}

const JsonBox = ({ jsonData }) => {
    if (jsonData.length > 0) {
        return (

        <div>
            <p>参数：</p>
            <input 
                className="big-input Qr-input"
                value = {jsonData}/>
        </div>
            
        )
    }
    return null
}


const PartDownload = ({ value, downloadCount, onSvgDownload, onImgDownload, dispatch }) => {
    const [imgData, setImgData] = useState('');
    const [svgData, setSvgData] = useState('');
    const [jsonData, setJsonData] = useState('');

    return (

        <div className="Qr-titled">

                    <input
                        className="big-input Qr-input"
                        id = "for-drission-page-svg-complex"
                        placeholder = {svgData}
                        onChange={(e) =>{
                            try {
                                var input = JSON.parse(e.target.value)
                                // 样式
                                var style = input.style
                                dispatch(changeStyle(style, styles[style].renderer, styles[style].value))
                                // 参数，每个样式不同
                                for (var i = 0; i < input.params.length; i++) { 
                                    dispatch(changeParam(style, i, input.params[i]))
                                }
                                // 容错率
                                dispatch(changeCorrectLevel(input.level));
                                // 修改图标
                                dispatch(changeIcon(input.icon))
                                // 二维码内容
                                dispatch(genQRInfo(input.text))
                                setSvgData(input.type)
                            }
                            catch(err) {
                                setSvgData('参数错误')
                            }
                        }}
                        onDoubleClick={(e) => {
                            if(svgData === 'svg' || svgData == null){
                                var data = onSvgDownload()
                                setSvgData(data.svg)
                            }                    
                            if(svgData === 'jpg'){
                                onImgDownload("jpg").then(res => {
                                    setSvgData(res)
                                    setImgData(res)
                                });
                            }
                            if(svgData === 'png'){
                                onImgDownload("png").then(res => {
                                    setSvgData(res)
                                    setImgData(res)
                                });
                            }
                        }}
                    />

        <div className="Qr-Centered title-margin">
            <div className="Qr-s-title">Downloads</div>
            <p className="Qr-s-subtitle">
                <span>下载二维码 — {value}</span>
                {/* <CountComponent value={downloadCount} /> */}
            </p>
        </div>
        <div className="Qr-Centered">
            <div className="btn-row">
                <div className="div-btn img-dl-btn">
                    <button className="dl-btn" onClick={() => {
                        onImgDownload("jpg").then(res => setImgData(res));
                        setJsonData('')

                        }}>JPG</button>
                    <button className="dl-btn" onClick={() => {
                        onImgDownload("png").then(res => setImgData(res));
                        setJsonData('')

                        }}>PNG</button>

                    <button className="dl-btn" onClick={() => {
                        var data = onSvgDownload()
                        setImgData('')
                        setJsonData(data.json)

                        }}>参数</button>

                    
                </div>
            </div>
            {/* <div id="wx-message">
                <WxMessage/>
            </div>  */}
            <div>
                <ImgBox imgData={imgData} />
                <JsonBox jsonData={jsonData} />
            </div>
        </div>
    </div>
    );
}

PartDownload.propTypes = {
    value: PropTypes.string.isRequired,
    downloadCount: PropTypes.number,
    onSvgDownload: PropTypes.func.isRequired,
    onImgDownload: PropTypes.func.isRequired,
}

export default PartDownload;
