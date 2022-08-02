import './App.css';
import React, {useState, useEffect} from 'react';
import TextField from '@material-ui/core/TextField';
import io from 'socket.io-client'

import FontChanger from "./FontChanger";
import EmotionSize from "./EmotionSize";
import Video from "./Video";

const socket = io.connect(process.env.REACT_APP_PATH);
const originalFont = 'Nanum Gothic';

function App() {
    // useState를 활용하면 class 없이 상태와 set 선언 가능.
    const [state, setState] = useState({message:'', name:''})
    const [fontName, setFontName] = useState('Nanum Gothic')
    const [chat,setChat] = useState([])

    let video

    useEffect(() =>{
        socket.on('clientReceiver', ({name, message, font})=>{
            setChat([{name, message, font}, ...chat])
            return () => socket.disconnect()
        })
    }, [ chat ])

    const activateVideo = () => {
        video = Video.run_video_camera()
    }

    const activateFont = () => {
        let font = fontName
        if (font !== originalFont) {
            setFontName(originalFont)
            return
        }

        video = Video.run_video_camera()

        const captured_img = Video.capture_video(video)
        let splited_base64 = captured_img.split(",")

        let api_body = new FormData()
         api_body.append("api_key", process.env.REACT_APP_KEY)
         api_body.append("api_secret", process.env.REACT_APP_SECRETE)
         api_body.append("image_base64", splited_base64)
         api_body.append("return_attributes", "emotion")

        let emotion

        fetch("/image_api/facepp/v3/detect",
            {
            body: api_body,
            method: "POST",
        })
            .then((response) =>
                response.json()).then((data) =>
        {
            console.log(data)
            emotion=JSON.stringify(data.faces[0].attributes.emotion)
            font = FontChanger.cacluateEmotion(emotion)
        }).then(() =>{
            console.log("setting Font "+font)
            setFontName(font)
        }
        )

    }

    // 텍스트 변환시 상태 변환.
    const onTextChange = e =>{
        setState({...state, [e.target.name]: e.target.value})
    }
    const onMessageSubmit =(e)=>{
        e.preventDefault()
        let {name, message} = state
        let font = fontName

        socket.emit('serverReceiver', {name, message, font})

        //초기화
        setFontName(originalFont)
        setState({message : '', name})
    }

    const renderButton = () => {
        let text
        if (fontName !== originalFont){
            text = "되돌리기"
        }
        else {
            text = "감정적용"
        }

        return text
    }

    const renderFont = () => {
        let message = state['message']
        return <div>
            <span style={{fontFamily:fontName, fontSize:EmotionSize[fontName]}}>{message}</span>
        </div>
    }

    const renderChat = () =>{
        return chat.map(({name, message, emotion, font}, index)=>(
            <div key={index}>
                <span style={{fontFamily:originalFont, fontSize:EmotionSize[originalFont]}}>{name}:</span>
                <span style={{fontFamily:font, fontSize:EmotionSize[font]}}>{message}</span>
            </div>
        ))
    }

    return (
        <div className='card'>
            <div className="render-chat">
                {renderChat()}
            </div>
            <div className="video-box">
                <video
                        id ="video"
                        width = "200"
                        hegith = "150"
                        autoPlay
                    >
                </video>
                <div id="capturePicture">
                    <canvas
                        id="canvas"
                        width = "200"
                        hegith = "150"
                        ></canvas>
                </div>
            </div>
            <div className='form'>
                <form onSubmit={onMessageSubmit}>
                    <button onClick={activateVideo} type="button">
                        비디오 키기
                    </button> &nbsp;&nbsp;
                    <div className="name-field">
                        <TextField
                            name ="name"
                            onChange={e=> onTextChange(e)}
                            value={state.name}
                            label="Name"/>
                    </div>
                    <br/>
                    <div className="chatting-field">
                        <TextField
                            name ="message"
                            onChange={e=> onTextChange(e)}
                            value={state.message}
                            id="outlined-multiline-static"
                            variant="outlined"
                            label="Message"/>
                            &nbsp;&nbsp;
                        <button onClick={activateFont} type="button"> {renderButton()} </button>
                        &nbsp;&nbsp;
                        <button type="submit">전송</button>
                    </div>
                    <div>
                        {renderFont()}
                    </div>
                </form>
            </div>
        </div>
    );
}



export default App;
